export const authTexts = {
  credentialsProvider: {
    name: "Tên đăng nhập và mật khẩu",
    usernameLabel: "Tên đăng nhập",
    passwordLabel: "Mật khẩu",
  },
  changePassword: {
    title: "Đổi mật khẩu",
    description: "Tạo mật khẩu mới để tiếp tục sử dụng hệ thống.",
    newPasswordLabel: "Mật khẩu mới",
    confirmPasswordLabel: "Xác nhận mật khẩu",
    submit: "Lưu mật khẩu",
    submitting: "Đang lưu...",
    errors: {
      missingPassword: "Vui lòng nhập đầy đủ mật khẩu mới.",
      passwordMismatch: "Mật khẩu xác nhận không khớp.",
      generic: "Không thể đổi mật khẩu.",
      changedButSignInFailed: "Mật khẩu đã đổi, vui lòng đăng nhập lại.",
    },
  },
  api: {
    errors: {
      unauthorized: "Unauthorized",
      invalidRequestBody: "Invalid request body",
      missingPassword: "Password and confirmation are required",
      passwordTooShort: "Password must be at least 8 characters",
      passwordMismatch: "Password confirmation does not match",
    },
  },
};
