import { apiRequest, performTokenRefresh } from "@/shared/api/client";
import type { 
  AuthRegisterDto, 
  AuthLoginDto, 
  AuthForgotPasswordDto, 
  AuthResetPasswordDto, 
  AuthResendVerificationDto, 
  ChangePasswordDto,
  AuthLoginResponse,
  UserProfileDto,
  UserSessionDto 
} from "@/shared/api/types";

export const authApi = {
  register: (data: AuthRegisterDto) => apiRequest<AuthLoginResponse>("/auth/register", { method: "POST", body: data }),
  verifyEmail: (token: string) => apiRequest<{message?: string}>("/auth/verify-email", { method: "GET", params: { token } }),
  login: (data: AuthLoginDto) => apiRequest<AuthLoginResponse>("/auth/login", { method: "POST", body: data }),
  forgotPassword: (data: AuthForgotPasswordDto) => apiRequest<{message?: string}>("/auth/forgot-password", { method: "POST", body: data }),
  resetPassword: (data: AuthResetPasswordDto) => apiRequest<{message?: string}>("/auth/reset-password", { method: "POST", body: data }),
  refresh: () => performTokenRefresh().then((token) => ({ accessToken: token || undefined })),
  resendVerification: (data: AuthResendVerificationDto) => apiRequest<{message?: string}>("/auth/resend-verification", { method: "POST", body: data }),
  logout: () => apiRequest<{message?: string}>("/auth/logout", { method: "POST" }),
};

export const usersApi = {
  getAll: () => apiRequest<UserProfileDto[]>("/users", { method: "GET" }),
  getSessions: () => apiRequest<UserSessionDto[]>("/users/sessions", { method: "GET" }),
  revokeSession: (id: string) => apiRequest<{message?: string}>(`/users/revoke-session/${id}`, { method: "PATCH" }),
  changePassword: (data: ChangePasswordDto) => apiRequest<{message?: string}>("/users/change-password", { method: "PATCH", body: data }),
};
