import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import type { Prisma } from "@prisma/client";

import {
  BRANCH_STATUS_ACTIVE,
  MANAGEMENT_ROLES,
  REPORT_ITEM_TAB_COMBO,
  REPORT_ITEM_TAB_SERVICE,
  REPORT_USAGE_SORT_ASC,
  REPORT_USAGE_SORT_DESC,
  SERVICE_RESPONSIBLE_ROLES,
  USER_ROLE_MANAGER,
  USER_ROLE_OWNER,
  VISIT_STATUS_COMPLETED,
  type ManagementRoleValue,
  type ReportItemTabValue,
  type ReportUsageSortValue,
  type ServiceResponsibleRoleValue,
} from "@/constants/common";
import { reportTexts } from "@/constants/texts";
import { prisma } from "@/lib/prisma";
import type { ServiceComboReportRow } from "@/types";
import {
  formatReportDateRangeLabel,
  parseReportDateRange,
} from "@/utils/reports";

const SERVICE_COMBO_REPORT_RESPONSE_DATA_KEY = "report";

const SERVICE_COMBO_REPORT_VISIT_SERVICE_SELECT = {
  allocatedPrice: true,
  comboId: true,
  comboNameSnapshot: true,
  id: true,
  responsibleRoleSnapshot: true,
  serviceId: true,
  serviceNameSnapshot: true,
  visit: {
    select: {
      branchId: true,
      branchNameSnapshot: true,
      customerId: true,
      id: true,
    },
  },
} as const;

type ServiceComboReportVisitService = Prisma.VisitServiceGetPayload<{
  select: typeof SERVICE_COMBO_REPORT_VISIT_SERVICE_SELECT;
}>;

type ServiceComboReportAuthResult =
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

type ServiceComboReportAccumulator = Omit<
  ServiceComboReportRow,
  "customerCount" | "usageCount"
> & {
  customers: Set<string>;
  usageCount: number;
  usageKeys: Set<string>;
};

type CatalogItemScope = {
  branchId: string | null;
  branchName: string;
};

async function getServiceComboReportAuth(
  request: NextRequest,
): Promise<ServiceComboReportAuthResult> {
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

function getRequestedSort(request: NextRequest): ReportUsageSortValue {
  const sort = request.nextUrl.searchParams.get("sort")?.trim();

  return sort === REPORT_USAGE_SORT_ASC ? sort : REPORT_USAGE_SORT_DESC;
}

function getRequestedResponsibleRole(
  request: NextRequest,
): ServiceResponsibleRoleValue | null {
  const role = request.nextUrl.searchParams.get("responsibleRole")?.trim();

  return SERVICE_RESPONSIBLE_ROLES.some((item) => item === role)
    ? (role as ServiceResponsibleRoleValue)
    : null;
}

function getRequestedSearch(request: NextRequest) {
  return request.nextUrl.searchParams.get("search")?.trim().toLowerCase() ?? "";
}

function getRequestedBranchId(request: NextRequest) {
  return request.nextUrl.searchParams.get("branchId")?.trim() || null;
}

async function getValidatedBranchId({
  authResult,
  requestedBranchId,
}: {
  authResult: Extract<ServiceComboReportAuthResult, { shopId: string }>;
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
      select: { id: true, name: true },
      where: {
        id: authResult.branchId,
        managerId: authResult.userId,
        shopId: authResult.shopId,
        status: BRANCH_STATUS_ACTIVE,
      },
    });

    return branch
      ? { branchId: branch.id, branchName: branch.name }
      : { error: reportTexts.api.errors.forbidden, status: 403 };
  }

  if (authResult.role === USER_ROLE_OWNER && requestedBranchId) {
    const branch = await prisma.branch.findFirst({
      select: { id: true, name: true },
      where: {
        id: requestedBranchId,
        shopId: authResult.shopId,
      },
    });

    return branch
      ? { branchId: branch.id, branchName: branch.name }
      : { error: reportTexts.api.errors.forbidden, status: 403 };
  }

  return { branchId: null, branchName: null };
}

function createAccumulator(input: {
  branchId: string | null;
  branchName: string;
  itemId: string;
  itemName: string;
  responsibleRole: ServiceResponsibleRoleValue | null;
}): ServiceComboReportAccumulator {
  return {
    ...input,
    customers: new Set<string>(),
    detailCount: 0,
    usageCount: 0,
    usageKeys: new Set<string>(),
  };
}

function getRowKey({
  branchId,
  itemId,
}: {
  branchId: string | null;
  itemId: string;
}) {
  return `${branchId ?? "shop"}:${itemId}`;
}

function getCatalogBranchName(branchName: string | null | undefined) {
  return branchName ?? reportTexts.serviceComboReport.shopScope;
}

function addUsage({
  row,
  usageKey,
  visitService,
}: {
  row: ServiceComboReportAccumulator;
  usageKey: string;
  visitService: ServiceComboReportVisitService;
}) {
  if (row.usageKeys.has(usageKey)) return;

  row.customers.add(visitService.visit.customerId);
  row.detailCount += 1;
  row.usageCount += 1;
  row.usageKeys.add(usageKey);
}

function formatRows({
  requestedSearch,
  rows,
  sort,
}: {
  requestedSearch: string;
  rows: ServiceComboReportAccumulator[];
  sort: ReportUsageSortValue;
}): ServiceComboReportRow[] {
  return rows
    .map((row) => ({
      branchId: row.branchId,
      branchName: row.branchName,
      customerCount: row.customers.size,
      detailCount: row.detailCount,
      itemId: row.itemId,
      itemName: row.itemName,
      responsibleRole: row.responsibleRole,
      usageCount: row.usageCount,
    }))
    .filter(
      (row) =>
        !requestedSearch ||
        row.itemName.toLowerCase().includes(requestedSearch) ||
        row.branchName.toLowerCase().includes(requestedSearch),
    )
    .sort((firstRow, secondRow) => {
      const usageSort =
        sort === REPORT_USAGE_SORT_ASC
          ? firstRow.usageCount - secondRow.usageCount
          : secondRow.usageCount - firstRow.usageCount;

      return (
        usageSort ||
        firstRow.itemName.localeCompare(secondRow.itemName, "vi") ||
        firstRow.branchName.localeCompare(secondRow.branchName, "vi")
      );
    });
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await getServiceComboReportAuth(request);

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

    const tab = getRequestedTab(request);
    const sort = getRequestedSort(request);
    const requestedResponsibleRole = getRequestedResponsibleRole(request);
    const requestedSearch = getRequestedSearch(request);
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

    const branchScope = branchResult.branchId
      ? { OR: [{ branchId: branchResult.branchId }, { branchId: null }] }
      : {};
    const rowMap = new Map<string, ServiceComboReportAccumulator>();
    const catalogScopeMap = new Map<string, CatalogItemScope>();

    if (tab === REPORT_ITEM_TAB_SERVICE) {
      const services = await prisma.service.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          branch: { select: { name: true } },
          branchId: true,
          id: true,
          name: true,
          responsibleRole: true,
        },
        where: {
          ...branchScope,
          ...(requestedResponsibleRole
            ? { responsibleRole: requestedResponsibleRole }
            : {}),
          shopId: authResult.shopId,
        },
      });

      services.forEach((service) => {
        catalogScopeMap.set(service.id, {
          branchId: service.branchId,
          branchName: getCatalogBranchName(service.branch?.name),
        });
        rowMap.set(
          getRowKey({ branchId: service.branchId, itemId: service.id }),
          createAccumulator({
            branchId: service.branchId,
            branchName: getCatalogBranchName(service.branch?.name),
            itemId: service.id,
            itemName: service.name,
            responsibleRole: service.responsibleRole,
          }),
        );
      });
    } else {
      const combos = await prisma.combo.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          branch: { select: { name: true } },
          branchId: true,
          id: true,
          name: true,
        },
        where: {
          ...branchScope,
          shopId: authResult.shopId,
        },
      });

      combos.forEach((combo) => {
        catalogScopeMap.set(combo.id, {
          branchId: combo.branchId,
          branchName: getCatalogBranchName(combo.branch?.name),
        });
        rowMap.set(
          getRowKey({ branchId: combo.branchId, itemId: combo.id }),
          createAccumulator({
            branchId: combo.branchId,
            branchName: getCatalogBranchName(combo.branch?.name),
            itemId: combo.id,
            itemName: combo.name,
            responsibleRole: null,
          }),
        );
      });
    }

    const visitServices = await prisma.visitService.findMany({
      orderBy: { visit: { completedAt: "desc" } },
      select: SERVICE_COMBO_REPORT_VISIT_SERVICE_SELECT,
      where: {
        ...(tab === REPORT_ITEM_TAB_SERVICE
          ? {
              comboId: null,
              serviceId: { not: null },
              ...(requestedResponsibleRole
                ? { responsibleRoleSnapshot: requestedResponsibleRole }
                : {}),
            }
          : {
              comboId: { not: null },
            }),
        shopId: authResult.shopId,
        visit: {
          completedAt: {
            gte: range.start,
            lt: range.end,
          },
          ...(branchResult.branchId ? { branchId: branchResult.branchId } : {}),
          shopId: authResult.shopId,
          status: VISIT_STATUS_COMPLETED,
        },
      },
    });

    visitServices.forEach((visitService) => {
      const itemId =
        tab === REPORT_ITEM_TAB_SERVICE
          ? visitService.serviceId
          : visitService.comboId;

      if (!itemId) return;

      const catalogScope = catalogScopeMap.get(itemId);
      const branchId = catalogScope?.branchId ?? visitService.visit.branchId;
      const key = getRowKey({ branchId, itemId });
      const existingRow = rowMap.get(key);
      const row =
        existingRow ??
        createAccumulator({
          branchId,
          branchName: catalogScope?.branchName ?? visitService.visit.branchNameSnapshot,
          itemId,
          itemName:
            tab === REPORT_ITEM_TAB_SERVICE
              ? visitService.serviceNameSnapshot ??
                reportTexts.serviceComboReport.empty
              : visitService.comboNameSnapshot ??
                reportTexts.serviceComboReport.empty,
          responsibleRole:
            tab === REPORT_ITEM_TAB_SERVICE
              ? visitService.responsibleRoleSnapshot
              : null,
        });

      rowMap.set(key, row);
      addUsage({
        row,
        usageKey:
          tab === REPORT_ITEM_TAB_SERVICE
            ? visitService.id
            : `${visitService.visit.id}:${itemId}`,
        visitService,
      });
    });

    return NextResponse.json({
      [SERVICE_COMBO_REPORT_RESPONSE_DATA_KEY]: {
        branchId: branchResult.branchId,
        branchName: branchResult.branchName,
        periodLabel: formatReportDateRangeLabel(fromDate, toDate),
        rows: formatRows({
          requestedSearch,
          rows: Array.from(rowMap.values()),
          sort,
        }),
        tab,
      },
    });
  } catch (error) {
    console.error("[service-combo-report-api] Failed to load report", error);

    return NextResponse.json(
      { error: reportTexts.api.errors.serverError },
      { status: 500 },
    );
  }
}
