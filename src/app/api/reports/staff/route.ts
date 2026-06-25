import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import type { Prisma } from "@prisma/client";

import {
  MANAGEMENT_ROLES,
  StaffReportStatus,
  SERVICE_RESPONSIBLE_ROLE_BARBER,
  SERVICE_RESPONSIBLE_ROLE_SKINNER,
  STAFF_ROLES,
  USER_ROLE_MANAGER,
  USER_ROLE_OWNER,
  USER_ROLE_RECEPTIONIST,
  VISIT_STATUS_COMPLETED,
  type ManagementRoleValue,
  type StaffRoleValue,
} from "@/constants/common";
import { reportTexts } from "@/constants/texts";
import { prisma } from "@/lib/prisma";
import type { StaffReportRow } from "@/types";
import {
  formatReportDateRangeLabel,
  parseReportDateRange,
} from "@/utils/reports";
import { getStaffDisplayName } from "@/utils/staff";

const STAFF_REPORT_RESPONSE_DATA_KEY = "report";
const UNKNOWN_STAFF_ID = "unknown";

const STAFF_REPORT_VISIT_SELECT = {
  barberId: true,
  branchNameSnapshot: true,
  completedAt: true,
  createdBy: true,
  customer: {
    select: {
      name: true,
    },
  },
  customerId: true,
  id: true,
  skinnerId: true,
  visitServices: {
    select: {
      comboNameSnapshot: true,
      responsibleRoleSnapshot: true,
      serviceNameSnapshot: true,
    },
  },
} as const;

type StaffReportVisit = Prisma.VisitGetPayload<{
  select: typeof STAFF_REPORT_VISIT_SELECT;
}>;

type StaffReportAuthResult =
  | {
      branchId: string | null;
      role: ManagementRoleValue;
      shopId: string;
      userId: string;
    }
  | {
      error: string;
      status: number;
    };

type StaffReportRowAccumulator = Omit<
  StaffReportRow,
  "customerCount" | "detailCount" | "serviceCount" | "visitCount"
> & {
  customers: Set<string>;
  detailCount: number;
  serviceCount: number;
  visits: Set<string>;
};

async function getStaffReportAuth(
  request: NextRequest,
): Promise<StaffReportAuthResult> {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token?.id) {
    return { error: reportTexts.api.errors.unauthorized, status: 401 };
  }

  if (
    typeof token.role !== "string" ||
    !MANAGEMENT_ROLES.some((role) => role === token.role) ||
    !token.shop_id
  ) {
    return { error: reportTexts.api.errors.forbidden, status: 403 };
  }

  return {
    branchId:
      typeof token.active_branch_id === "string"
        ? token.active_branch_id
        : typeof token.branch_id === "string"
          ? token.branch_id
          : null,
    role: token.role as ManagementRoleValue,
    shopId: token.shop_id,
    userId: token.id,
  };
}

function getRequestedBranchId(request: NextRequest) {
  return request.nextUrl.searchParams.get("branchId")?.trim() || null;
}

function getRequestedRole(request: NextRequest) {
  const role = request.nextUrl.searchParams.get("role")?.trim();

  return STAFF_ROLES.some((staffRole) => staffRole === role)
    ? (role as StaffRoleValue)
    : null;
}

function getRequestedSearch(request: NextRequest) {
  return request.nextUrl.searchParams.get("search")?.trim().toLowerCase() ?? "";
}

async function getValidatedBranchId({
  authResult,
  requestedBranchId,
}: {
  authResult: Extract<StaffReportAuthResult, { shopId: string }>;
  requestedBranchId: string | null;
}): Promise<
  | {
      branchId: string | null;
      branchName: string | null;
    }
  | {
      error: string;
      status: number;
    }
> {
  if (authResult.role === USER_ROLE_MANAGER) {
    if (!authResult.branchId) {
      return { error: reportTexts.api.errors.forbidden, status: 403 };
    }

    const branch = await prisma.branch.findFirst({
      where: {
        id: authResult.branchId,
        managerId: authResult.userId,
        shopId: authResult.shopId,
        status: "active",
      },
      select: { id: true, name: true },
    });

    return branch
      ? { branchId: branch.id, branchName: branch.name }
      : { error: reportTexts.api.errors.forbidden, status: 403 };
  }

  if (authResult.role === USER_ROLE_OWNER && requestedBranchId) {
    const branch = await prisma.branch.findFirst({
      where: {
        id: requestedBranchId,
        shopId: authResult.shopId,
      },
      select: { id: true, name: true },
    });

    return branch
      ? { branchId: branch.id, branchName: branch.name }
      : { error: reportTexts.api.errors.forbidden, status: 403 };
  }

  return { branchId: null, branchName: null };
}

function createStaffAccumulator(input: {
  branchName: string | null;
  role: StaffRoleValue | "unknown";
  staffId: string;
  staffName: string;
  status: StaffReportStatus;
}): StaffReportRowAccumulator {
  return {
    ...input,
    customers: new Set<string>(),
    detailCount: 0,
    serviceCount: 0,
    visits: new Set<string>(),
  };
}

function getResponsibleStaffId(visit: StaffReportVisit, role: string | null) {
  if (role === SERVICE_RESPONSIBLE_ROLE_BARBER) {
    return visit.barberId ?? UNKNOWN_STAFF_ID;
  }

  if (role === SERVICE_RESPONSIBLE_ROLE_SKINNER) {
    return visit.skinnerId ?? UNKNOWN_STAFF_ID;
  }

  return UNKNOWN_STAFF_ID;
}

function addServiceMetric({
  row,
  visit,
}: {
  row: StaffReportRowAccumulator;
  visit: StaffReportVisit;
}) {
  row.customers.add(visit.customerId);
  row.serviceCount += 1;
  row.visits.add(visit.id);
  row.detailCount += 1;
}

function addReceptionistMetric({
  row,
  visit,
}: {
  row: StaffReportRowAccumulator;
  visit: StaffReportVisit;
}) {
  row.customers.add(visit.customerId);
  row.visits.add(visit.id);
  row.detailCount += 1;
}

function formatRows(rows: StaffReportRowAccumulator[]): StaffReportRow[] {
  return rows
    .map((row) => ({
      branchName: row.branchName,
      customerCount: row.customers.size,
      detailCount: row.detailCount,
      role: row.role,
      serviceCount: row.serviceCount,
      staffId: row.staffId,
      staffName: row.staffName,
      status: row.status,
      visitCount: row.visits.size,
    }))
    .sort((firstRow, secondRow) => {
      if (firstRow.staffId === UNKNOWN_STAFF_ID) return 1;
      if (secondRow.staffId === UNKNOWN_STAFF_ID) return -1;

      return (
        secondRow.serviceCount - firstRow.serviceCount ||
        secondRow.visitCount - firstRow.visitCount ||
        firstRow.staffName.localeCompare(secondRow.staffName, "vi")
      );
    });
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await getStaffReportAuth(request);

    if ("error" in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status },
      );
    }

    const fromDate = request.nextUrl.searchParams.get("fromDate")?.trim() ?? "";
    const toDate = request.nextUrl.searchParams.get("toDate")?.trim() ?? "";
    const range = parseReportDateRange({ fromDate, toDate });

    if (!range) {
      return NextResponse.json(
        { error: reportTexts.api.errors.invalidDateRange },
        { status: 400 },
      );
    }

    const branchResult = await getValidatedBranchId({
      authResult,
      requestedBranchId: getRequestedBranchId(request),
    });

    if ("error" in branchResult) {
      return NextResponse.json(
        { error: branchResult.error },
        { status: branchResult.status },
      );
    }

    const branchId = branchResult.branchId;
    const [staff, visits] = await Promise.all([
      prisma.user.findMany({
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
        select: {
          branch: {
            select: {
              name: true,
            },
          },
          fullName: true,
          id: true,
          role: true,
          status: true,
          username: true,
        },
        where: {
          ...(branchId ? { branchId } : {}),
          role: { in: [...STAFF_ROLES] },
          shopId: authResult.shopId,
        },
      }),
      prisma.visit.findMany({
        orderBy: { completedAt: "desc" },
        select: STAFF_REPORT_VISIT_SELECT,
        where: {
          completedAt: {
            gte: range.start,
            lt: range.end,
          },
          ...(branchId ? { branchId } : {}),
          shopId: authResult.shopId,
          status: VISIT_STATUS_COMPLETED,
        },
      }),
    ]);
    const rowMap = new Map<string, StaffReportRowAccumulator>();

    staff.forEach((staffMember) => {
      rowMap.set(
        staffMember.id,
        createStaffAccumulator({
          branchName: staffMember.branch?.name ?? null,
          role: staffMember.role as StaffRoleValue,
          staffId: staffMember.id,
          staffName: getStaffDisplayName(staffMember),
          status: staffMember.status as StaffReportStatus,
        }),
      );
    });

    visits.forEach((visit) => {
      const receptionistRow = rowMap.get(visit.createdBy);

      if (receptionistRow?.role === USER_ROLE_RECEPTIONIST) {
        addReceptionistMetric({ row: receptionistRow, visit });
      }

      visit.visitServices.forEach((visitService) => {
        if (
          visitService.responsibleRoleSnapshot !== SERVICE_RESPONSIBLE_ROLE_BARBER &&
          visitService.responsibleRoleSnapshot !== SERVICE_RESPONSIBLE_ROLE_SKINNER
        ) {
          return;
        }

        const staffId = getResponsibleStaffId(
          visit,
          visitService.responsibleRoleSnapshot,
        );
        const existingRow = rowMap.get(staffId);
        const row =
          existingRow ??
          createStaffAccumulator({
            branchName: null,
            role:
              staffId === UNKNOWN_STAFF_ID
                ? "unknown"
                : (visitService.responsibleRoleSnapshot as StaffRoleValue),
            staffId,
            staffName:
              staffId === UNKNOWN_STAFF_ID
                ? reportTexts.staffReport.unknownStaff
                : staffId,
            status:
              staffId === UNKNOWN_STAFF_ID
                ? StaffReportStatus.Unknown
                : StaffReportStatus.Active,
          });

        rowMap.set(staffId, row);
        addServiceMetric({ row, visit });
      });
    });

    const requestedRole = getRequestedRole(request);
    const requestedSearch = getRequestedSearch(request);
    const rows = formatRows(Array.from(rowMap.values())).filter((row) => {
      const matchesRole = !requestedRole || row.role === requestedRole;
      const matchesSearch =
        !requestedSearch ||
        row.staffName.toLowerCase().includes(requestedSearch) ||
        (row.branchName ?? "").toLowerCase().includes(requestedSearch);

      return matchesRole && matchesSearch;
    });

    return NextResponse.json({
      [STAFF_REPORT_RESPONSE_DATA_KEY]: {
        branchId,
        branchName: branchResult.branchName,
        periodLabel: formatReportDateRangeLabel(fromDate, toDate),
        rows,
      },
    });
  } catch (error) {
    console.error("[staff-report-api] Failed to load staff report", error);

    return NextResponse.json(
      { error: reportTexts.api.errors.serverError },
      { status: 500 },
    );
  }
}
