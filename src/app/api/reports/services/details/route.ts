import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import type { Prisma } from "@prisma/client";

import {
  BRANCH_STATUS_ACTIVE,
  MANAGEMENT_ROLES,
  REPORT_ITEM_TAB_COMBO,
  REPORT_ITEM_TAB_SERVICE,
  SERVICE_RESPONSIBLE_ROLES,
  USER_ROLE_MANAGER,
  USER_ROLE_OWNER,
  VISIT_STATUS_COMPLETED,
  type ManagementRoleValue,
  type ReportItemTabValue,
  type ServiceResponsibleRoleValue,
} from "@/constants/common";
import { reportTexts } from "@/constants/texts";
import { prisma } from "@/lib/prisma";
import type { ServiceComboReportDetail } from "@/types";
import { parseReportDateRange } from "@/utils/reports";

const SERVICE_COMBO_REPORT_DETAIL_RESPONSE_DATA_KEY = "report";
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;

const SERVICE_REPORT_DETAIL_SELECT = {
  responsibleRoleSnapshot: true,
  serviceNameSnapshot: true,
  visit: {
    select: {
      branchNameSnapshot: true,
      completedAt: true,
      customer: { select: { name: true } },
      id: true,
    },
  },
} as const;

const COMBO_REPORT_DETAIL_SELECT = {
  branchNameSnapshot: true,
  completedAt: true,
  customer: { select: { name: true } },
  id: true,
  visitServices: {
    select: {
      comboNameSnapshot: true,
    },
    take: 1,
  },
} as const;

type ServiceReportDetailRow = Prisma.VisitServiceGetPayload<{
  select: typeof SERVICE_REPORT_DETAIL_SELECT;
}>;

type ComboReportDetailVisit = Prisma.VisitGetPayload<{
  select: typeof COMBO_REPORT_DETAIL_SELECT;
}>;

type ServiceComboReportDetailAuthResult =
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

async function getServiceComboReportDetailAuth(
  request: NextRequest,
): Promise<ServiceComboReportDetailAuthResult> {
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

function getRequestedTab(request: NextRequest): ReportItemTabValue {
  const tab = request.nextUrl.searchParams.get("tab")?.trim();

  return tab === REPORT_ITEM_TAB_COMBO ? tab : REPORT_ITEM_TAB_SERVICE;
}

function getRequestedResponsibleRole(
  request: NextRequest,
): ServiceResponsibleRoleValue | null {
  const role = request.nextUrl.searchParams.get("responsibleRole")?.trim();

  return SERVICE_RESPONSIBLE_ROLES.some((item) => item === role)
    ? (role as ServiceResponsibleRoleValue)
    : null;
}

function getRequestedBranchId(request: NextRequest) {
  return request.nextUrl.searchParams.get("branchId")?.trim() || null;
}

function getRequestedItemId(request: NextRequest) {
  return request.nextUrl.searchParams.get("itemId")?.trim() || "";
}

function getPositiveIntegerParam({
  fallback,
  max,
  request,
  searchParam,
}: {
  fallback: number;
  max?: number;
  request: NextRequest;
  searchParam: string;
}) {
  const value = Number(request.nextUrl.searchParams.get(searchParam));

  if (!Number.isInteger(value) || value < 1) return fallback;

  return max ? Math.min(value, max) : value;
}

async function getValidatedBranchId({
  authResult,
  requestedBranchId,
}: {
  authResult: Extract<ServiceComboReportDetailAuthResult, { shopId: string }>;
  requestedBranchId: string | null;
}): Promise<
  | {
      branchId: string | null;
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
      select: { id: true },
      where: {
        id: authResult.branchId,
        managerId: authResult.userId,
        shopId: authResult.shopId,
        status: BRANCH_STATUS_ACTIVE,
      },
    });

    return branch
      ? { branchId: branch.id }
      : { error: reportTexts.api.errors.forbidden, status: 403 };
  }

  if (authResult.role === USER_ROLE_OWNER && requestedBranchId) {
    const branch = await prisma.branch.findFirst({
      select: { id: true },
      where: {
        id: requestedBranchId,
        shopId: authResult.shopId,
      },
    });

    return branch
      ? { branchId: branch.id }
      : { error: reportTexts.api.errors.forbidden, status: 403 };
  }

  return { branchId: null };
}

function createServiceDetail(
  visitService: ServiceReportDetailRow,
): ServiceComboReportDetail {
  return {
    branchName: visitService.visit.branchNameSnapshot,
    completedAt: visitService.visit.completedAt?.toISOString() ?? null,
    customerName: visitService.visit.customer.name,
    itemName:
      visitService.serviceNameSnapshot ?? reportTexts.serviceComboReport.empty,
    responsibleRole: visitService.responsibleRoleSnapshot,
    visitId: visitService.visit.id,
  };
}

function createComboDetail({
  itemName,
  visit,
}: {
  itemName: string;
  visit: ComboReportDetailVisit;
}): ServiceComboReportDetail {
  return {
    branchName: visit.branchNameSnapshot,
    completedAt: visit.completedAt?.toISOString() ?? null,
    customerName: visit.customer.name,
    itemName,
    responsibleRole: null,
    visitId: visit.id,
  };
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await getServiceComboReportDetailAuth(request);

    if ("error" in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status },
      );
    }

    const itemId = getRequestedItemId(request);

    if (!itemId) {
      return NextResponse.json(
        { error: reportTexts.api.errors.forbidden },
        { status: 400 },
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

    const tab = getRequestedTab(request);
    const requestedResponsibleRole = getRequestedResponsibleRole(request);
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

    const page = getPositiveIntegerParam({
      fallback: DEFAULT_PAGE,
      request,
      searchParam: "page",
    });
    const pageSize = getPositiveIntegerParam({
      fallback: DEFAULT_PAGE_SIZE,
      max: MAX_PAGE_SIZE,
      request,
      searchParam: "pageSize",
    });
    const baseVisitWhere = {
      completedAt: {
        gte: range.start,
        lt: range.end,
      },
      ...(branchResult.branchId ? { branchId: branchResult.branchId } : {}),
      shopId: authResult.shopId,
      status: VISIT_STATUS_COMPLETED,
    } satisfies Prisma.VisitWhereInput;

    if (tab === REPORT_ITEM_TAB_SERVICE) {
      const where = {
        comboId: null,
        serviceId: itemId,
        ...(requestedResponsibleRole
          ? { responsibleRoleSnapshot: requestedResponsibleRole }
          : {}),
        shopId: authResult.shopId,
        visit: baseVisitWhere,
      } satisfies Prisma.VisitServiceWhereInput;
      const total = await prisma.visitService.count({ where });
      const totalPages = Math.max(1, Math.ceil(total / pageSize));
      const safePage = Math.min(page, totalPages);
      const details = (
        await prisma.visitService.findMany({
          orderBy: { visit: { completedAt: "desc" } },
          select: SERVICE_REPORT_DETAIL_SELECT,
          skip: (safePage - 1) * pageSize,
          take: pageSize,
          where,
        })
      ).map(createServiceDetail);

      return NextResponse.json({
        [SERVICE_COMBO_REPORT_DETAIL_RESPONSE_DATA_KEY]: {
          details,
          itemId,
          pagination: { page: safePage, pageSize, total, totalPages },
          tab,
        },
      });
    }

    const combo = await prisma.combo.findFirst({
      select: { name: true },
      where: {
        id: itemId,
        shopId: authResult.shopId,
      },
    });
    const where = {
      ...baseVisitWhere,
      visitServices: {
        some: {
          comboId: itemId,
          shopId: authResult.shopId,
        },
      },
    } satisfies Prisma.VisitWhereInput;
    const total = await prisma.visit.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, totalPages);
    const details = (
      await prisma.visit.findMany({
        orderBy: { completedAt: "desc" },
        select: COMBO_REPORT_DETAIL_SELECT,
        skip: (safePage - 1) * pageSize,
        take: pageSize,
        where,
      })
    ).map((visit) =>
      createComboDetail({
        itemName:
          combo?.name ??
          visit.visitServices[0]?.comboNameSnapshot ??
          reportTexts.serviceComboReport.empty,
        visit,
      }),
    );

    return NextResponse.json({
      [SERVICE_COMBO_REPORT_DETAIL_RESPONSE_DATA_KEY]: {
        details,
        itemId,
        pagination: { page: safePage, pageSize, total, totalPages },
        tab,
      },
    });
  } catch (error) {
    console.error(
      "[service-combo-report-detail-api] Failed to load report detail",
      error,
    );

    return NextResponse.json(
      { error: reportTexts.api.errors.serverError },
      { status: 500 },
    );
  }
}
