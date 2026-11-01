import { create } from "zustand";
import { type AuthState, type AuthUser } from "../types";
import { authApi, profilesApi, usersApi } from "@/shared/api";
import { performTokenRefresh, isTokenExpired, getTokenExp } from "@/shared/api/client";
import { queryClient } from "@/shared/lib/queryClient";
import { useThemeStore } from "@/shared/store/useThemeStore";

export * from "../types";

const ACCESS_TOKEN_KEY = "indieg_access_token";
const REFRESH_TOKEN_KEY = "indieg_refresh_token";

let hasSetupAuthListeners = false;
let initAuthPromise: Promise<void> | null = null;
let isInitialized = false;
let refreshTimer: ReturnType<typeof setTimeout> | null = null;

function clearTokenRefreshTimer() {
    if (refreshTimer) {
        clearTimeout(refreshTimer);
        refreshTimer = null;
    }
}

function scheduleTokenRefresh(token?: string | null) {
    clearTokenRefreshTimer();
    if (!token || typeof window === "undefined") return;

    const exp = getTokenExp(token);
    let delayMs = 14 * 60 * 1000; // Default 14 mins if token does not contain JWT exp

    if (exp) {
        // Refresh 60 seconds before token expiration, with a minimum delay of 10 seconds
        delayMs = Math.max(10_000, (exp * 1000 - Date.now()) - 60_000);
    }

    refreshTimer = setTimeout(async () => {
        try {
            await useAuthStore.getState().refreshTokens();
        } catch {
            // Silently caught, retry will happen on next request
        }
    }, delayMs);
}

function extractEmailFromJwt(token?: string | null): string | undefined {
    if (!token) return undefined;
    try {
        const parts = token.split(".");
        if (parts.length === 3) {
            const payloadStr = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
            const payload = JSON.parse(payloadStr) as { email?: string };
            return typeof payload?.email === "string" && payload.email ? payload.email : undefined;
        }
    } catch {
        // Ignore malformed JWT
    }
    return undefined;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    accessToken: null,
    refreshToken: null,
    loading: true,
    customAvatar: null,

    setCustomAvatar: (avatar) => {
        set({ customAvatar: avatar });
    },

    updateUser: (partial: Partial<AuthUser>) => {
        const currentUser = get().user;
        if (!currentUser) return;
        const hasChange = Object.entries(partial).some(([key, val]) => {
            if (val === undefined) return false;
            return (currentUser as Record<string, unknown>)[key] !== val;
        });
        if (hasChange) {
            set({ user: { ...currentUser, ...partial } });
        }
    },

    initializeAuth: async () => {
        if (typeof window === "undefined") return;

        if (isInitialized && get().user) {
            return;
        }

        if (initAuthPromise) {
            return initAuthPromise;
        }

        if (!hasSetupAuthListeners) {
            hasSetupAuthListeners = true;
            window.addEventListener("indieg:token-refreshed", (e: Event) => {
                const customEv = e as CustomEvent<{ accessToken: string; refreshToken?: string }>;
                if (customEv.detail?.accessToken) {
                    set({
                        accessToken: customEv.detail.accessToken,
                        ...(customEv.detail.refreshToken ? { refreshToken: customEv.detail.refreshToken } : {}),
                    });
                    scheduleTokenRefresh(customEv.detail.accessToken);
                }
            });
            window.addEventListener("indieg:session-expired", () => {
                clearTokenRefreshTimer();
                try {
                    queryClient.clear();
                } catch {
                    // Ignore
                }
                set({ user: null, accessToken: null, refreshToken: null, customAvatar: null, loading: false });
                window.dispatchEvent(new CustomEvent("indieg:auth-cleared"));
            });

            // Automatically check and refresh token when user switches back to this browser tab
            document.addEventListener("visibilitychange", () => {
                if (document.visibilityState === "visible") {
                    const currentToken = useAuthStore.getState().accessToken;
                    if (currentToken && isTokenExpired(currentToken)) {
                        void useAuthStore.getState().refreshTokens();
                    }
                }
            });
        }

        initAuthPromise = (async () => {
            try {
                const savedToken = localStorage.getItem(ACCESS_TOKEN_KEY) || localStorage.getItem("access_token");
                const savedRefreshToken =
                    localStorage.getItem(REFRESH_TOKEN_KEY) || localStorage.getItem("refresh_token");

                // Clean up any legacy user data stored in localStorage
                try {
                    localStorage.removeItem("indieg_auth_user");
                    localStorage.removeItem("user_custom_avatar");
                } catch {
                    // Ignore storage error
                }

                if (savedToken || savedRefreshToken) {
                    let userObj: AuthUser | null = null;
                    let activeToken: string | null = savedToken;

                    // If access token is already expired according to JWT exp, refresh before fetching profile
                    if (activeToken && isTokenExpired(activeToken)) {
                        const refreshed = await performTokenRefresh();
                        if (refreshed) {
                            activeToken = refreshed;
                        }
                    } else if (!activeToken && savedRefreshToken) {
                        const refreshed = await performTokenRefresh();
                        if (refreshed) {
                            activeToken = refreshed;
                        }
                    }

                    // Fetch fresh profile from backend /profiles/me
                    if (activeToken) {
                        const tokenEmail = extractEmailFromJwt(activeToken);
                        try {
                            const profile = await profilesApi.getMyProfile();
                            if (profile && profile.id) {
                                userObj = {
                                    id: profile.id,
                                    email: (profile as { email?: string }).email || tokenEmail || `${profile.username || "user"}@ludon.com`,
                                    username: profile.username || "Gamer",
                                    name: profile.name || profile.username || "Gamer",
                                    avatar_url: profile.avatarUrl || undefined,
                                    avatarUrl: profile.avatarUrl || undefined,
                                    role: (profile as { role?: "admin" | "moderator" | "user" }).role || "user",
                                    isVerified: profile.isVerified === true || profile.isEmailVerified === true,
                                    createdAt: profile.createdAt,
                                };
                            }
                        } catch (err: unknown) {
                            const status = (err as { status?: number })?.status;
                            if (status === 401) {
                                // Attempt token refresh in case token was invalidated on server
                                const refreshed = await performTokenRefresh();
                                if (refreshed) {
                                    activeToken = refreshed;
                                    const refreshedTokenEmail = extractEmailFromJwt(refreshed);
                                    try {
                                        const profile = await profilesApi.getMyProfile();
                                        if (profile && profile.id) {
                                            userObj = {
                                                id: profile.id,
                                                email: (profile as { email?: string }).email || refreshedTokenEmail || `${profile.username || "user"}@ludon.com`,
                                                username: profile.username || "Gamer",
                                                name: profile.name || profile.username || "Gamer",
                                                avatar_url: profile.avatarUrl || undefined,
                                                avatarUrl: profile.avatarUrl || undefined,
                                                role: (profile as { role?: "admin" | "moderator" | "user" }).role || "user",
                                                isVerified: profile.isVerified === true || profile.isEmailVerified === true,
                                                createdAt: profile.createdAt,
                                            };
                                        }
                                    } catch {
                                        activeToken = null;
                                        userObj = null;
                                    }
                                } else {
                                    activeToken = null;
                                    userObj = null;
                                }
                            }
                        }
                    }

                    if (activeToken && userObj) {
                        scheduleTokenRefresh(activeToken);
                        const currentRefToken =
                            localStorage.getItem(REFRESH_TOKEN_KEY) || localStorage.getItem("refresh_token");
                        set({
                            user: userObj,
                            accessToken: activeToken,
                            refreshToken: currentRefToken || null,
                            loading: false,
                        });
                    } else {
                        clearTokenRefreshTimer();
                        set({ user: null, accessToken: null, refreshToken: null, loading: false });
                    }
                } else {
                    set({ user: null, accessToken: null, refreshToken: null, loading: false });
                }
            } catch {
                set({ user: null, accessToken: null, refreshToken: null, loading: false });
            } finally {
                isInitialized = true;
                initAuthPromise = null;
            }
        })();

        return initAuthPromise;
    },

    login: (userData: AuthUser, accessToken?: string, refreshToken?: string) => {
        const token = accessToken || "token_" + Math.random().toString(36).substring(2);
        const refToken = refreshToken || "ref_" + Math.random().toString(36).substring(2);

        // Always wipe query cache so no data from a previously logged in account remains
        try {
            queryClient.clear();
        } catch {
            // Ignore
        }

        if (typeof window !== "undefined") {
            localStorage.setItem(ACCESS_TOKEN_KEY, token);
            localStorage.setItem("access_token", token);
            if (refreshToken) {
                localStorage.setItem(REFRESH_TOKEN_KEY, refToken);
                localStorage.setItem("refresh_token", refToken);
            }
            // Ensure no user account information is stored in localStorage
            localStorage.removeItem("indieg_auth_user");
            localStorage.removeItem("user_custom_avatar");
            localStorage.removeItem("profile_hidden_sections_me");

            // Dispatch global event for other stores to reset prior state
            window.dispatchEvent(new CustomEvent("indieg:auth-cleared"));
        }

        isInitialized = true;

        set({
            user: userData,
            accessToken: token,
            refreshToken: refToken,
            customAvatar: null,
            loading: false,
        });

        scheduleTokenRefresh(token);
    },

    logout: () => {
        clearTokenRefreshTimer();
        void authApi.logout().catch(() => {});

        // 1. Clear TanStack Query Cache completely to wipe all profile, posts, communities, bookmarks, friends caches
        try {
            queryClient.clear();
        } catch {
            // Ignore
        }

        // 2. Clear all user session tokens and persisted settings from storage
        if (typeof window !== "undefined") {
            try {
                localStorage.removeItem(ACCESS_TOKEN_KEY);
                localStorage.removeItem("access_token");
                localStorage.removeItem(REFRESH_TOKEN_KEY);
                localStorage.removeItem("refresh_token");
                localStorage.removeItem("indieg_auth_user");
                localStorage.removeItem("user_custom_avatar");
                localStorage.removeItem("ludon_access_token");
                localStorage.removeItem("indieg_recent_communities");

                // Remove all profile hidden sections and draft keys
                const keysToRemove: string[] = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const k = localStorage.key(i);
                    if (k && (
                        k.startsWith("profile_hidden_sections_") ||
                        k.startsWith("indieg-") ||
                        k.startsWith("draft_") ||
                        k.startsWith("user_")
                    )) {
                        keysToRemove.push(k);
                    }
                }
                keysToRemove.forEach((k) => localStorage.removeItem(k));
            } catch {
                // Ignore storage errors
            }

            try {
                sessionStorage.removeItem("indieg_session_expired");
            } catch {
                // Ignore storage errors
            }

            // 3. Dispatch global event for other stores to clean up in-memory data
            window.dispatchEvent(new CustomEvent("indieg:auth-cleared"));
        }

        isInitialized = false;

        set({
            user: null,
            accessToken: null,
            refreshToken: null,
            customAvatar: null,
            isVerifyModalOpen: false,
            verifyModalMessage: null,
            loading: false,
        });
    },

    refreshTokens: async () => {
        try {
            const token = await performTokenRefresh();
            if (token) {
                const currentRefreshToken =
                    typeof window !== "undefined"
                        ? localStorage.getItem(REFRESH_TOKEN_KEY) || localStorage.getItem("refresh_token")
                        : null;
                set({
                    accessToken: token,
                    ...(currentRefreshToken ? { refreshToken: currentRefreshToken } : {}),
                });
                scheduleTokenRefresh(token);
                return true;
            }
        } catch {
            // Refresh failed
        }
        return false;
    },

    isVerifyModalOpen: false,
    verifyModalMessage: null,

    openVerifyModal: (customMessage?: string) => {
        set({ isVerifyModalOpen: true, verifyModalMessage: customMessage || null });
    },

    closeVerifyModal: () => {
        set({ isVerifyModalOpen: false, verifyModalMessage: null });
    },

    requireVerifiedEmail: (actionName?: string | { vi: string; en: string }, onSuccess?: () => void) => {
        const { user } = get();
        const isEn = useThemeStore.getState().language === "en";
        if (!user) {
            get().openVerifyModal(
                isEn
                    ? "Please log in to perform this action."
                    : "Vui lòng đăng nhập để thực hiện thao tác này."
            );
            return false;
        }
        if (user.isVerified === false || !user.isVerified) {
            let actionStrEn = "";
            let actionStrVi = "";
            if (typeof actionName === "object" && actionName !== null) {
                actionStrEn = actionName.en;
                actionStrVi = actionName.vi;
            } else if (typeof actionName === "string") {
                actionStrVi = actionName;
                const mapping: Record<string, string> = {
                    "đăng bài viết mới": "create a new post",
                    "tạo bài viết": "create a post",
                    "tham gia cộng đồng": "join this community",
                    "tạo cộng đồng": "create a community",
                    "gửi tin nhắn chat": "send chat messages",
                    "tạo thảo luận mới": "create a new thread",
                    "bình luận": "leave a comment",
                    "thực hiện hành động này": "perform this action",
                };
                actionStrEn = mapping[actionName] || actionName;
            }

            const msg = isEn
                ? (actionStrEn
                    ? `Account email not verified! Please verify your email (${user.email}) to ${actionStrEn}.`
                    : `Account email not verified! Please verify your email (${user.email}) to perform this action.`)
                : (actionStrVi
                    ? `Tài khoản chưa xác thực email! Vui lòng xác minh địa chỉ email (${user.email}) để ${actionStrVi}.`
                    : `Tài khoản chưa xác thực email! Vui lòng xác minh địa chỉ email (${user.email}) để thực hiện thao tác này.`);
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

    resendVerification: async (email?: string) => {
        const targetEmail = email || get().user?.email;
        if (!targetEmail) {
            return { success: false, error: "Không tìm thấy địa chỉ email." };
        }
        try {
            const res = await authApi.resendVerification({ email: targetEmail });
            return { success: true, message: res?.message };
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Không thể gửi email xác thực. Vui lòng thử lại.";
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
