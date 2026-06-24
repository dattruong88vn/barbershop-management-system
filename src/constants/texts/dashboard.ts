export const dashboardTexts = {
  api: {
    errors: {
      forbidden: "Forbidden",
      serverError: "Server error",
      unauthorized: "Unauthorized",
    },
  },
  alerts: {
    count: (count: number) => `${count} visit`,
    empty: "Không có visit cắt tóc thiếu ảnh trong kỳ này.",
    photoWarning: "Chưa upload ảnh kiểu tóc",
  },
  charts: {
    revenue: "Doanh thu",
    revenueTrend: "Xu hướng doanh thu",
    visits: "Visit",
  },
  empty: "Chưa có dữ liệu tổng quan cho kỳ này.",
  filters: {
    branchLabel: "Chi nhánh",
    branchOptions: {
      all: "Tất cả chi nhánh",
    },
    chooseSpecificMonth: "Chọn tháng",
    monthPickerLabel: "Chọn tháng tổng quan",
    periodOptions: {
      all: "Tất cả thời gian",
      month: "Tháng",
      year: "Năm hiện tại",
    },
    periodTitle: "Kỳ tổng quan",
  },
  loading: "Đang tải tổng quan",
  metrics: {
    newCustomers: "Khách mới",
    returningCustomers: "Khách quay lại",
    revenue: "Doanh thu",
    totalVisits: "Tổng visit",
  },
  sections: {
    haircutWarnings: "Visit thiếu ảnh kiểu tóc",
    topBarbers: "Top barber",
    topCombos: "Top combo",
    topServices: "Top dịch vụ",
    topSkinners: "Top skinner",
  },
  topList: {
    count: (count: number) => `${count} lượt`,
    empty: "Chưa có dữ liệu xếp hạng.",
  },
  unknownStaff: "Chưa xác định",
  title: "Tổng quan",
};
