import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

import {
  REPORT_PERIOD_ALL,
  REPORT_PERIOD_MONTH,
  REPORT_PERIOD_YEAR,
  REPORT_PERIODS,
  type ReportPeriodValue,
  STAFF_ROLE_BARBER,
  STAFF_ROLE_SKINNER,
  STAFF_ROLES,
  VISIT_STATUS_COMPLETED,
} from "@/constants/common";
import { reportTexts } from "@/constants/texts";
import { prisma } from "@/lib/prisma";
import type { PersonalReportTopItem } from "@/types";
import {
  getMinimumReportMonthKey,
  getReportMonthDate,
  getReportMonthKey,
} from "@/utils/reports";

const PERSONAL_REPORT_RESPONSE_DATA_KEY = "report";
const REPORT_MONTH_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  month: "long",
  year: "numeric",
});
const REPORT_YEAR_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  year: "numeric",
});

type PersonalReportAuthResult =
  | {
      role: (typeof STAFF_ROLES)[number];
      shopId: string;
      userId: string;
      username: string;
    }
  | {
      error: string;
      status: number;
    };

type VisitFilterByRoleInput = {
  role: (typeof STAFF_ROLES)[number];
  shopId: string;
  userId: string;
};

type CustomerCount = {
  count: number;
  name: string;
};

async function getPersonalReportAuth(
  request: NextRequest,
): Promise<PersonalReportAuthResult> {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token?.id) {
    return { error: reportTexts.api.errors.unauthorized, status: 401 };
  }

  if (
    typeof token.role !== "string" ||
    !STAFF_ROLES.some((role) => role === token.role) ||
    !token.shop_id
  ) {
    return { error: reportTexts.api.errors.forbidden, status: 403 };
  }

  return {
    role: token.role as (typeof STAFF_ROLES)[number],
    shopId: token.shop_id,
    userId: token.id,
    username: token.username,
  };
}

function getMonthRange(monthDate = new Date()) {
  const start = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const end = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1);

  return { end, start };
}

function getCurrentYearRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const end = new Date(now.getFullYear() + 1, 0, 1);

  return { end, start };
}

function getReportPeriod(request: NextRequest): ReportPeriodValue {
  const period = request.nextUrl.searchParams.get("period");

  return REPORT_PERIODS.some((reportPeriod) => reportPeriod === period)
    ? (period as ReportPeriodValue)
    : REPORT_PERIOD_MONTH;
}

function getReportMonth(request: NextRequest) {
  const month = request.nextUrl.searchParams.get("month");
  const minimumMonth = getMinimumReportMonthKey();
  const maximumMonth = getReportMonthKey();

  if (!month || month < minimumMonth || month > maximumMonth) {
    return new Date();
  }

  return getReportMonthDate(month) ?? new Date();
}

function getReportRange(period: ReportPeriodValue, monthDate: Date) {
  if (period === REPORT_PERIOD_YEAR) {
    return getCurrentYearRange();
  }

  if (period === REPORT_PERIOD_ALL) {
    return null;
  }

  return getMonthRange(monthDate);
}

function getReportPeriodLabel(period: ReportPeriodValue, monthDate: Date) {
  if (period === REPORT_PERIOD_YEAR) {
    return REPORT_YEAR_FORMATTER.format(new Date());
  }

  if (period === REPORT_PERIOD_ALL) {
    return reportTexts.personal.periodOptions.all;
  }

  return REPORT_MONTH_FORMATTER.format(monthDate);
}

function getRoleVisitFilter({ role, shopId, userId }: VisitFilterByRoleInput) {
  if (role === STAFF_ROLE_BARBER) {
    return { barberId: userId, shopId };
  }

  if (role === STAFF_ROLE_SKINNER) {
    return { shopId, skinnerId: userId };
  }

  return { createdBy: userId, shopId };
}

function getTopItems(itemCounts: Map<string, number>): PersonalReportTopItem[] {
  return Array.from(itemCounts.entries())
    .sort((firstItem, secondItem) => secondItem[1] - firstItem[1])
    .slice(0, 3)
    .map(([name, count]) => ({
      count: reportTexts.personal.topItemCount(count),
      name,
    }));
}

function getTopCustomers(
  customerCounts: Map<string, CustomerCount>,
): PersonalReportTopItem[] {
  return Array.from(customerCounts.values())
    .sort(
      (firstCustomer, secondCustomer) =>
        secondCustomer.count - firstCustomer.count,
    )
    .slice(0, 3)
    .map((customer) => ({
      count: reportTexts.personal.topItemCount(customer.count),
      name: customer.name,
    }));
}

export async function GET(request: NextRequest) {
  const authResult = await getPersonalReportAuth(request);

  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const period = getReportPeriod(request);
  const monthDate = getReportMonth(request);
  const range = getReportRange(period, monthDate);

  try {
    const visits = await prisma.visit.findMany({
      where: {
        ...getRoleVisitFilter(authResult),
        ...(range
          ? {
              completedAt: {
                gte: range.start,
                lt: range.end,
              },
            }
          : {}),
        status: VISIT_STATUS_COMPLETED,
      },
      select: {
        customer: {
          select: {
            name: true,
          },
        },
        customerId: true,
        visitServices: {
          select: {
            comboId: true,
            serviceId: true,
            responsibleRoleSnapshot: true,
            serviceNameSnapshot: true,
          },
        },
      },
    });

    let comboCount = 0;
    let serviceCount = 0;
    const customerIds = new Set<string>();
    const customerCounts = new Map<string, CustomerCount>();
    const serviceCounts = new Map<string, number>();

    visits.forEach((visit) => {
      customerIds.add(visit.customerId);
      const customerCount = customerCounts.get(visit.customerId);
      customerCounts.set(visit.customerId, {
        count: (customerCount?.count ?? 0) + 1,
        name: visit.customer.name,
      });
      const comboIds = new Set<string>();

      visit.visitServices.forEach((visitService) => {
        if (
          (authResult.role === STAFF_ROLE_BARBER ||
            authResult.role === STAFF_ROLE_SKINNER) &&
          visitService.responsibleRoleSnapshot !== authResult.role
        ) {
          return;
        }

        if (visitService.comboId) {
          comboIds.add(visitService.comboId);
          return;
        }

        if (visitService.serviceId) {
          serviceCount += 1;
        }

        if (visitService.serviceNameSnapshot) {
          serviceCounts.set(
            visitService.serviceNameSnapshot,
            (serviceCounts.get(visitService.serviceNameSnapshot) ?? 0) + 1,
          );
        }
      });

      comboCount += comboIds.size;
    });

    return NextResponse.json({
      [PERSONAL_REPORT_RESPONSE_DATA_KEY]: {
        comboCount: String(comboCount),
        metrics: [
          {
            label: reportTexts.personal.metricCompletedVisits,
            value: String(visits.length),
          },
          {
            label: reportTexts.personal.metricCustomersServed,
            value: String(customerIds.size),
          },
        ],
        periodLabel: getReportPeriodLabel(period, monthDate),
        roleLabel: reportTexts.roles[authResult.role],
        serviceCount: String(serviceCount),
        staffName: authResult.username,
        topCustomers: getTopCustomers(customerCounts),
        topItems: getTopItems(serviceCounts),
      },
    });
  } catch {
    return NextResponse.json(
      { error: reportTexts.api.errors.serverError },
      { status: 500 },
    );
  }
}
