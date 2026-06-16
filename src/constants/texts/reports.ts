import {
  USER_ROLE_BARBER,
  USER_ROLE_MANAGER,
  USER_ROLE_OWNER,
  USER_ROLE_RECEPTIONIST,
  USER_ROLE_SKINNER,
} from "@/constants/common";
import type { ReportPageRole } from "@/types";

export const reportTexts = {
  api: {
    errors: {
      forbidden: "Forbidden",
      serverError: "Server error",
      unauthorized: "Unauthorized",
    },
  },
  manager: {
    description:
      "Report API chưa implement, màn hình này đang giữ placeholder theo spec.",
    empty: "Chưa có dữ liệu báo cáo quản lý.",
    filtersTitle: "Bộ lọc",
    mockNotice:
      "Dữ liệu báo cáo quản lý đang là placeholder cho tới khi Report API hoàn tất.",
    tableTitle: "Bảng dữ liệu",
    title: "Báo cáo",
  },
  management: {
    branches: {
      title: "Báo cáo chi nhánh",
    },
    combos: {
      title: "Báo cáo combo",
    },
    revenue: {
      title: "Báo cáo doanh thu",
    },
    services: {
      title: "Báo cáo dịch vụ",
    },
    staff: {
      title: "Báo cáo nhân viên",
    },
  },
  personal: {
    comboCountLabel: "Combo đã làm",
    description: "Theo dõi số lượng dịch vụ, combo và dịch vụ nổi bật của bạn.",
    empty: "Chưa có dữ liệu báo cáo cá nhân.",
    fullNameLabel: "Họ và tên",
    chooseSpecificMonth: "Chọn tháng",
    loading: "Đang tải báo cáo cá nhân",
    metricCustomersServed: "Khách đã phục vụ",
    metricCompletedVisits: "Visit hoàn thành",
    monthPickerLabel: "Chọn tháng báo cáo",
    periodOptions: {
      all: "Tất cả thời gian",
      currentMonth: "Tháng hiện tại",
      month: "Tháng",
      year: "Năm hiện tại",
    },
    periodTitle: "Kỳ báo cáo",
    roleLabel: "Role",
    serviceCountLabel: "Dịch vụ đã làm",
    title: "Báo cáo cá nhân",
    topItemCount: (count: number) => `${count} lượt`,
    topItemTitle: "Dịch vụ thực hiện nhiều nhất",
  },
  roles: {
    [USER_ROLE_BARBER]: "Barber",
    [USER_ROLE_MANAGER]: "Quản lý",
    [USER_ROLE_OWNER]: "Chủ tiệm",
    [USER_ROLE_RECEPTIONIST]: "Reception",
    [USER_ROLE_SKINNER]: "Skinner",
  } satisfies Record<ReportPageRole, string>,
};
