import { create } from "zustand";
import { type AuthState, type AuthUser } from "../types";

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

    initializeAuth: () => {
        if (typeof window === "undefined") return;

        try {
            const savedToken = localStorage.getItem(ACCESS_TOKEN_KEY);
            const savedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
            const savedUser = localStorage.getItem(AUTH_USER_KEY);

            if (savedUser && savedToken) {
                const parsedUser: AuthUser = JSON.parse(savedUser);
                set({
                    user: parsedUser,
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
        const token = accessToken || "access_token_" + Math.random().toString(36).substring(2);
        const refToken = refreshToken || "refresh_token_" + Math.random().toString(36).substring(2);

        if (typeof window !== "undefined") {
            localStorage.setItem(ACCESS_TOKEN_KEY, token);
            localStorage.setItem(REFRESH_TOKEN_KEY, refToken);
            localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
            localStorage.setItem("indieg_mock_login", "true");
        }

        set({
            user: userData,
            accessToken: token,
            refreshToken: refToken,
            mockLogin: true,
            loading: false,
        });
    },

    logout: () => {
        if (typeof window !== "undefined") {
            localStorage.removeItem(ACCESS_TOKEN_KEY);
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
        const { refreshToken } = get();
        if (!refreshToken) return false;

        const newAccessToken = "refreshed_access_token_" + Date.now();
        const newRefreshToken = "refreshed_refresh_token_" + Date.now();

        if (typeof window !== "undefined") {
            localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);
            localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
        }

        set({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        });

        return true;
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
                role: 'admin',
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

    verifyEmail: async (codeOrToken: string) => {
        await new Promise((r) => setTimeout(r, 600));
        if (codeOrToken && codeOrToken.trim().length > 0) {
            const { user } = get();
            if (user) {
                const updatedUser = { ...user, isVerified: true };
                get().login(updatedUser, get().accessToken || undefined, get().refreshToken || undefined);
            }
            set({ isVerifyModalOpen: false, verifyModalMessage: null });
            return { success: true };
        }
        return { success: false, error: "Mã/Token xác thực không hợp lệ hoặc đã hết hạn." };
    },

    forgotPassword: async (email: string) => {
        await new Promise((r) => setTimeout(r, 600));
        if (!email.includes("@")) {
            return { success: false, error: "Địa chỉ email không hợp lệ." };
        }
        return { success: true };
    },

    resetPassword: async (password: string) => {
        await new Promise((r) => setTimeout(r, 600));
        if (password.length < 8) {
            return { success: false, error: "Mật khẩu phải chứa ít nhất 8 ký tự." };
        }
        return { success: true };
    },

    changePassword: async (currentPassword: string, newPassword: string) => {
        await new Promise((r) => setTimeout(r, 600));
        if (!currentPassword) {
            return { success: false, error: "Vui lòng nhập mật khẩu hiện tại." };
        }
        if (newPassword.length < 8) {
            return { success: false, error: "Mật khẩu mới phải có ít nhất 8 ký tự." };
        }
        return { success: true };
    },
}));
