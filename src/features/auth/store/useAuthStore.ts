import { create } from "zustand";
import { type AuthState, type AuthUser } from "../types";
import { authApi, profilesApi, usersApi } from "@/shared/api";

export * from "../types";

const ACCESS_TOKEN_KEY = "indieg_access_token";
const REFRESH_TOKEN_KEY = "indieg_refresh_token";
const AUTH_USER_KEY = "indieg_auth_user";

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    accessToken: null,
    refreshToken: null,
    loading: true,
    mockLogin: false,
    customAvatar: typeof window !== "undefined" ? localStorage.getItem("user_custom_avatar") : null,

    setCustomAvatar: (avatar) => {
        if (typeof window !== "undefined") {
            if (avatar) {
                localStorage.setItem("user_custom_avatar", avatar);
            } else {
                localStorage.removeItem("user_custom_avatar");
            }
        }
        set({ customAvatar: avatar });
    },

    initializeAuth: async () => {
        if (typeof window === "undefined") return;

        try {
            const savedToken = localStorage.getItem(ACCESS_TOKEN_KEY) || localStorage.getItem("access_token");
            const savedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
            const savedUser = localStorage.getItem(AUTH_USER_KEY);

            if (savedToken) {
                let userObj: AuthUser | null = savedUser ? JSON.parse(savedUser) : null;

                // Attempt to fetch fresh profile from backend /profiles/me
                try {
                    const profile = await profilesApi.getMyProfile();
                    if (profile && profile.id) {
                        userObj = {
                            id: profile.id,
                            email: userObj?.email || `${profile.username || "user"}@indieg.com`,
                            username: profile.username || userObj?.username || "Gamer",
                            avatar_url: profile.avatarUrl || userObj?.avatar_url,
                            role: (userObj?.role as 'admin' | 'moderator' | 'user') || (profile.username?.toLowerCase().includes("admin") ? "admin" : "user"),
                            isVerified: true,
                            createdAt: profile.createdAt,
                        };
                        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userObj));
                    }
                } catch {
                    // Backend might be offline or using local cached session
                }

                set({
                    user: userObj,
                    accessToken: savedToken,
                    refreshToken: savedRefreshToken || null,
                    mockLogin: false,
                    loading: false,
                });
            } else {
                set({ user: null, accessToken: null, refreshToken: null, loading: false, mockLogin: false });
            }
        } catch {
            set({ user: null, accessToken: null, refreshToken: null, loading: false });
        }
    },

    login: (userData: AuthUser, accessToken?: string, refreshToken?: string) => {
        const token = accessToken || "token_" + Math.random().toString(36).substring(2);
        const refToken = refreshToken || "ref_" + Math.random().toString(36).substring(2);

        if (typeof window !== "undefined") {
            localStorage.setItem(ACCESS_TOKEN_KEY, token);
            localStorage.setItem("access_token", token);
            if (refreshToken) {
                localStorage.setItem(REFRESH_TOKEN_KEY, refToken);
            }
            localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
        }

        set({
            user: userData,
            accessToken: token,
            refreshToken: refToken,
            mockLogin: !accessToken,
            loading: false,
        });
    },

    logout: () => {
        void authApi.logout().catch(() => {});

        if (typeof window !== "undefined") {
            localStorage.removeItem(ACCESS_TOKEN_KEY);
            localStorage.removeItem("access_token");
            localStorage.removeItem(REFRESH_TOKEN_KEY);
            localStorage.removeItem(AUTH_USER_KEY);
            localStorage.removeItem("indieg_mock_login");
        }

        set({
            user: null,
            accessToken: null,
            refreshToken: null,
            mockLogin: false,
            loading: false,
        });
    },

    refreshTokens: async () => {
        try {
            const res = await authApi.refresh();
            if (res && (res.accessToken || res.token)) {
                const newToken = res.accessToken || res.token || "";
                if (typeof window !== "undefined") {
                    localStorage.setItem(ACCESS_TOKEN_KEY, newToken);
                    localStorage.setItem("access_token", newToken);
                }
                set({ accessToken: newToken });
                return true;
            }
        } catch {
            // Refresh failed
        }
        return false;
    },

    toggleMockLogin: () => {
        const { mockLogin, user } = get();
        if (!mockLogin || !user) {
            const demoUser: AuthUser = {
                id: "usr_gamer_demo_1",
                email: "gamer@indieg.com",
                username: "IndieGamer",
                avatar_url: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150",
                isVerified: true,
                role: "admin",
            };
            get().login(demoUser);
        } else {
            get().logout();
        }
    },

    isVerifyModalOpen: false,
    verifyModalMessage: null,

    openVerifyModal: (customMessage?: string) => {
        set({ isVerifyModalOpen: true, verifyModalMessage: customMessage || null });
    },

    closeVerifyModal: () => {
        set({ isVerifyModalOpen: false, verifyModalMessage: null });
    },

    requireVerifiedEmail: (actionName?: string, onSuccess?: () => void) => {
        const { user } = get();
        if (!user) {
            get().openVerifyModal("Vui lòng đăng nhập để thực hiện thao tác này.");
            return false;
        }
        if (user.isVerified === false || !user.isVerified) {
            const msg = actionName
                ? `Tài khoản chưa xác thực email! Vui lòng xác minh địa chỉ email (${user.email}) để ${actionName}.`
                : `Tài khoản chưa xác thực email! Vui lòng xác minh địa chỉ email (${user.email}) để thực hiện thao tác này.`;
            get().openVerifyModal(msg);
            return false;
        }
        if (onSuccess) {
            onSuccess();
        }
        return true;
    },

    toggleVerifyEmailStatus: () => {
        const { user } = get();
        if (user) {
            const updatedUser = { ...user, isVerified: !user.isVerified };
            get().login(updatedUser, get().accessToken || undefined, get().refreshToken || undefined);
        }
    },

    verifyEmail: async (token: string) => {
        try {
            await authApi.verifyEmail(token);
            const { user } = get();
            if (user) {
                const updatedUser = { ...user, isVerified: true };
                get().login(updatedUser, get().accessToken || undefined, get().refreshToken || undefined);
            }
            set({ isVerifyModalOpen: false, verifyModalMessage: null });
            return { success: true };
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Xác thực email thất bại.";
            return { success: false, error: message };
        }
    },

    forgotPassword: async (email: string) => {
        try {
            await authApi.forgotPassword({ email });
            return { success: true };
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Không thể gửi yêu cầu đặt lại mật khẩu.";
            return { success: false, error: message };
        }
    },

    resetPassword: async (password: string) => {
        try {
            // Note: in OpenAPI spec resetPassword requires token & newPassword
            const token = new URLSearchParams(window.location.search).get("token") || "reset-token";
            await authApi.resetPassword({ token, newPassword: password });
            return { success: true };
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Không thể đặt lại mật khẩu.";
            return { success: false, error: message };
        }
    },

    changePassword: async (currentPassword: string, newPassword: string) => {
        try {
            await usersApi.changePassword({ oldPassword: currentPassword, newPassword });
            return { success: true };
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Không thể đổi mật khẩu.";
            return { success: false, error: message };
        }
    },
}));
