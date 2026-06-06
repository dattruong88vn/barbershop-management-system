export const authTexts = {
  brand: {
    name: "BarberOS",
    tagline: "Quản lý tiệm cắt tóc của bạn",
  },
  credentialsProvider: {
    name: "Tên đăng nhập và mật khẩu",
    usernameLabel: "Tên đăng nhập",
    passwordLabel: "Mật khẩu",
  },
  login: {
    title: "Đăng nhập",
    description: "",
    usernameLabel: "Tên đăng nhập",
    usernamePlaceholder: "Nhập tên đăng nhập",
    passwordLabel: "Mật khẩu",
    passwordPlaceholder: "Nhập mật khẩu",
    submit: "Đăng nhập",
    submitting: "Đang đăng nhập...",
    supportText: "Quên mật khẩu? Liên hệ quản lý tiệm",
    showPassword: "Hiển thị mật khẩu",
    hidePassword: "Ẩn mật khẩu",
    errors: {
      missingCredentials: "Vui lòng nhập tên đăng nhập và mật khẩu.",
      invalidCredentials: "Tên đăng nhập hoặc mật khẩu không đúng.",
      generic: "Không thể đăng nhập, vui lòng thử lại.",
    },
  },
  changePassword: {
    title: "Đặt mật khẩu mới",
    description:
      "Đây là lần đầu bạn đăng nhập. Vui lòng đặt mật khẩu mới trước khi tiếp tục.",
    newPasswordLabel: "Mật khẩu mới",
    confirmPasswordLabel: "Xác nhận mật khẩu",
    passwordPlaceholder: "Nhập mật khẩu mới",
    confirmPasswordPlaceholder: "Nhập lại mật khẩu mới",
    submit: "Đặt mật khẩu",
    submitting: "Đang lưu...",
    passwordHint: "Mật khẩu tối thiểu 8 ký tự, gồm chữ và số.",
    showPassword: "Hiển thị mật khẩu",
    hidePassword: "Ẩn mật khẩu",
    errors: {
      missingPassword: "Vui lòng nhập đầy đủ mật khẩu mới.",
      passwordTooShort: "Mật khẩu phải có ít nhất 8 ký tự.",
      passwordMismatch: "Mật khẩu không khớp.",
      generic: "Không thể đổi mật khẩu.",
      changedButSignInFailed: "Mật khẩu đã đổi, vui lòng đăng nhập lại.",
    },
  },
  api: {
    errors: {
      unauthorized: "Vui lòng đăng nhập để tiếp tục",
      invalidRequestBody: "Dữ liệu gửi lên không hợp lệ",
      missingPassword: "Vui lòng nhập đầy đủ mật khẩu mới",
      passwordTooShort: "Mật khẩu phải có ít nhất 8 ký tự",
      passwordMismatch: "Mật khẩu xác nhận không khớp",
    },
  },
};
