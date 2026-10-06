import { apiRequest } from "./client";
import {
    type AuthRegisterDto,
    type AuthLoginDto,
    type AuthForgotPasswordDto,
    type AuthResetPasswordDto,
    type AuthResendVerificationDto,
    type AuthLoginResponse,
    type UserProfileDto,
    type UpdateProfileDto,
    type UserSessionDto,
    type ChangePasswordDto,
    type CommunityDto,
    type CreateCommunityDto,
    type UpdateCommunityDto,
    type CommunityMemberDto,
    type GetCommunityMembersParams,
    type CommunityMembersResponseDto,
    type PostDto,
    type CreatePostDto,
    type UpdatePostDto,
    type CommentEntity,
    type ReplyCommentsResponse,
    type CreateCommentDto,
    type ReportDto,
    type CreateReportDto,
    type SearchCommunityMembersParams,
    type CommunityMemberActionDto,
    type VoteDto,
    type VoteType,
    type GameDto,
    type CreateGameDto,
    type UpdateGameDto,
    type GetGamesParams,
    type GameGuideDto,
    type CreateGameGuideDto,
    type UpdateGameGuideDto,
    type GetGameGuidesParams,
    type GameReviewDto,
    type CreateGameReviewDto,
    type UpdateGameReviewDto,
    type GetGameReviewsParams,
    type GamePatchNoteDto,
    type CreateGamePatchNoteDto,
    type UpdateGamePatchNoteDto,
    type GetGamePatchNotesParams,
    type GuestbookCommentDto,
    type CreateGuestbookCommentDto,
    type BookmarkDto,
    type CreateBookmarkDto,
    type CheckBookmarkParams,
    type BookmarkTargetType,
    type LibraryGameDto,
    type CreateLibraryGameDto,
    type UpdateLibraryGameDto,
    type FriendshipDto,
    type CreateFriendshipRequestDto,
    type AuthGoogleLoginDto,
    type CommunityInviteDto,
    type CreateCommunityInviteDto,
    type PostActionResponse,
    type SteamSyncResponse,
    type UpdateGuestbookCommentDto,
    type FriendshipStatusDto,
    type NotificationDto,
    type CreateNotificationDto,
    type ReportHistoryItemDto,
    type ResolveReportDto,
    type SteamSearchResultDto,
    type ExternalGameDataDto,
} from "./types";

import {
    MOCK_USERS,
    MOCK_CURRENT_USER,
    getMockUserById,
    MOCK_COMMUNITY_DTOS,
    MOCK_COMMUNITY_MEMBERS,
    getMockCommunityById,
    MOCK_GAMES,
    MOCK_GAME_DTOS,
    MOCK_GUIDES,
    MOCK_REVIEWS,
    MOCK_PATCH_NOTES,
    MOCK_POST_DTOS,
    getMockPostDtoById,
    getMockCommentsByPostId,
    getMockRepliesByCommentId,
    addMockComment,
    getMockGuestbookCommentsByProfileId,
    addMockGuestbookComment,
    MOCK_NOTIFICATIONS,
    MOCK_BOOKMARKS,
    getMockSessions,
    revokeMockSession,
    revokeAllMockSessions,
    getMockReports,
    getMockReportById,
    getMockReportHistory,
    addMockReport,
    deleteMockReport,
    resolveMockReport,
} from "@/mocks";

export * from "./client";
export * from "./types";

// =========================================================================
// HELPER UTILITIES
// =========================================================================

/** Helper to sanitize and clamp limit/page parameters based on OpenAPI schema constraints */
export function sanitizePaginationParams<T extends { page?: number; limit?: number }>(
    params?: T,
    maxLimit = 50
): T | undefined {
    if (!params) return undefined;
    const sanitized = { ...params };
    if (sanitized.limit !== undefined) {
        sanitized.limit = Math.max(1, Math.min(sanitized.limit, maxLimit));
    }
    if (sanitized.page !== undefined) {
        sanitized.page = Math.max(1, sanitized.page);
    }
    return sanitized;
}

export interface ApiPaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

/** Safely extracts pagination metadata from varying backend response envelopes */
export function extractPaginationMeta(
    res: unknown,
    fallbackTotal = 0,
    fallbackPage = 1,
    fallbackLimit = 10
): ApiPaginationMeta {
    if (res && typeof res === "object") {
        const obj = res as Record<string, unknown>;
        const metaObj = (obj.meta || obj.pagination || obj) as Record<string, unknown>;

        const total = typeof metaObj.total === "number" ? metaObj.total :
                      typeof metaObj.totalItems === "number" ? metaObj.totalItems :
                      typeof metaObj.count === "number" ? metaObj.count : fallbackTotal;

        const page = typeof metaObj.page === "number" ? metaObj.page :
                     typeof metaObj.currentPage === "number" ? metaObj.currentPage : fallbackPage;

        const limit = typeof metaObj.limit === "number" ? metaObj.limit :
                      typeof metaObj.perPage === "number" ? metaObj.perPage :
                      typeof metaObj.pageSize === "number" ? metaObj.pageSize : fallbackLimit;

        let totalPages = typeof metaObj.totalPages === "number" ? metaObj.totalPages :
                         typeof metaObj.pageCount === "number" ? metaObj.pageCount :
                         typeof metaObj.lastPage === "number" ? metaObj.lastPage : 0;

        if (!totalPages && total > 0 && limit > 0) {
            totalPages = Math.ceil(total / limit);
        }

        return {
            total: Math.max(0, total),
            page: Math.max(1, page),
            limit: Math.max(1, limit),
            totalPages: Math.max(1, totalPages || 1),
        };
    }

    return {
        total: fallbackTotal,
        page: fallbackPage,
        limit: fallbackLimit,
        totalPages: Math.max(1, Math.ceil(fallbackTotal / fallbackLimit) || 1),
    };
}

/** Safely extract CommunityMemberDto array from various API response shapes */
export function extractMemberList(res: unknown): CommunityMemberDto[] {
    if (!res) return [];
    if (Array.isArray(res)) return res as CommunityMemberDto[];
    if (typeof res === "object" && res !== null) {
        const obj = res as Record<string, unknown>;
        if (Array.isArray(obj.data)) return obj.data as CommunityMemberDto[];
        if (Array.isArray(obj.items)) return obj.items as CommunityMemberDto[];
        if (obj.data && typeof obj.data === "object") {
            const nested = obj.data as Record<string, unknown>;
            if (Array.isArray(nested.data)) return nested.data as CommunityMemberDto[];
            if (Array.isArray(nested.items)) return nested.items as CommunityMemberDto[];
        }
        if (Array.isArray(obj.members)) return obj.members as CommunityMemberDto[];
        if (Array.isArray(obj.result)) return obj.result as CommunityMemberDto[];
    }
    return [];
}

/** Safely extract CommunityDto array from various API response shapes */
export function extractCommunityList(res: unknown): CommunityDto[] {
    if (!res) return [];
    if (Array.isArray(res)) return res as CommunityDto[];
    if (typeof res === "object" && res !== null) {
        const obj = res as Record<string, unknown>;
        if (Array.isArray(obj.data)) return obj.data as CommunityDto[];
        if (Array.isArray(obj.items)) return obj.items as CommunityDto[];
        if (obj.data && typeof obj.data === "object") {
            const nested = obj.data as Record<string, unknown>;
            if (Array.isArray(nested.data)) return nested.data as CommunityDto[];
            if (Array.isArray(nested.items)) return nested.items as CommunityDto[];
        }
        if (Array.isArray(obj.communities)) return obj.communities as CommunityDto[];
        if (Array.isArray(obj.result)) return obj.result as CommunityDto[];
    }
    return [];
}

/** Safely extract PostDto array from various API response shapes */
export function extractPostList(res: unknown): PostDto[] {
    if (!res) return [];
    if (Array.isArray(res)) return res as PostDto[];
    if (typeof res === "object" && res !== null) {
        const obj = res as Record<string, unknown>;
        if (Array.isArray(obj.data)) return obj.data as PostDto[];
        if (Array.isArray(obj.items)) return obj.items as PostDto[];
        if (obj.data && typeof obj.data === "object") {
            const nested = obj.data as Record<string, unknown>;
            if (Array.isArray(nested.data)) return nested.data as PostDto[];
            if (Array.isArray(nested.items)) return nested.items as PostDto[];
        }
        if (Array.isArray(obj.posts)) return obj.posts as PostDto[];
        if (Array.isArray(obj.result)) return obj.result as PostDto[];
    }
    return [];
}

/** Safely extract ReportDto array from various API response shapes */
export function extractReportList(res: unknown): ReportDto[] {
    if (!res) return [];
    if (Array.isArray(res)) return res as ReportDto[];
    if (typeof res === "object" && res !== null) {
        const obj = res as Record<string, unknown>;
        if (Array.isArray(obj.data)) return obj.data as ReportDto[];
        if (Array.isArray(obj.items)) return obj.items as ReportDto[];
    }
    return [];
}

/**
 * Universal Mock Safe Caller
 * Calls real backend API first if available, else gracefully falls back to mock data
 */
async function callOrMock<T>(
    apiCall: () => Promise<T>,
    mockFallback: T | (() => T | Promise<T>)
): Promise<T> {
    try {
        return await apiCall();
    } catch {
        return typeof mockFallback === "function"
            ? (mockFallback as () => T | Promise<T>)()
            : mockFallback;
    }
}

// =========================================================================
// 1. AUTH SERVICES (/auth/*)
// =========================================================================
export const authApi = {
    register: (data: AuthRegisterDto) =>
        callOrMock(
            () => apiRequest<AuthLoginResponse>("/auth/register", { method: "POST", body: data }),
            { accessToken: "mock_token_registered", user: { ...MOCK_CURRENT_USER, email: data.email, username: data.username } }
        ),

    verifyEmail: (data: { token: string }) =>
        callOrMock(
            () => apiRequest<{ message?: string }>("/auth/verify-email", { method: "POST", body: data }),
            { message: "Email verified successfully" }
        ),

    login: (data: AuthLoginDto) =>
        callOrMock(
            () => apiRequest<AuthLoginResponse>("/auth/login", { method: "POST", body: data }),
            () => {
                const emailClean = (data.email || "").toLowerCase().trim();
                const matchedUser = MOCK_USERS.find(
                    (u) =>
                        u.email?.toLowerCase() === emailClean ||
                        u.username.toLowerCase() === emailClean ||
                        (emailClean.includes("admin") && (u.role === "admin" || u.id === "usr_admin")) ||
                        (emailClean.includes("unverified") && u.id === "usr_unverified") ||
                        (emailClean.includes("streamer") && u.id === "user-streamer") ||
                        (emailClean.includes("elden") && u.id === "user-1") ||
                        (emailClean.includes("shadow") && u.id === "user-2") ||
                        (emailClean.includes("gamer") && u.id === "user-me")
                );
                const user = matchedUser || {
                    ...MOCK_CURRENT_USER,
                    id: `usr_${Date.now()}`,
                    email: data.email,
                    username: data.email.split("@")[0] || "IndiePlayer",
                    displayName: data.email.split("@")[0] || "IndiePlayer",
                    name: data.email.split("@")[0] || "IndiePlayer",
                };
                return {
                    accessToken: "mock_token_" + (user.id || "user"),
                    user,
                };
            }
        ),

    logout: () =>
        callOrMock(
            () => apiRequest<{ message?: string }>("/auth/logout", { method: "POST" }),
            { message: "Logged out" }
        ),

    me: () =>
        callOrMock(
            () => apiRequest<UserProfileDto>("/auth/me", { method: "GET" }),
            MOCK_CURRENT_USER
        ),

    googleLogin: (data: AuthGoogleLoginDto) =>
        callOrMock(
            () => apiRequest<AuthLoginResponse>("/auth/google", { method: "POST", body: data }),
            { accessToken: "mock_google_token", user: MOCK_CURRENT_USER }
        ),

    changePassword: (data: ChangePasswordDto) =>
        callOrMock(
            () => apiRequest<{ message?: string }>("/auth/change-password", { method: "POST", body: data }),
            { message: "Password updated successfully" }
        ),

    forgotPassword: (data: AuthForgotPasswordDto) =>
        callOrMock(
            () => apiRequest<{ message?: string }>("/auth/forgot-password", { method: "POST", body: data }),
            { message: "Reset link sent" }
        ),

    resetPassword: (data: AuthResetPasswordDto) =>
        callOrMock(
            () => apiRequest<{ message?: string }>("/auth/reset-password", { method: "POST", body: data }),
            { message: "Password reset successfully" }
        ),

    refreshToken: (data: { refreshToken: string }) =>
        callOrMock(
            () => apiRequest<{ accessToken: string }>("/auth/refresh", { method: "POST", body: data }),
            { accessToken: "mock_token_refreshed" }
        ),

    resendVerification: (data: AuthResendVerificationDto) =>
        callOrMock(
            () => apiRequest<{ message?: string }>("/auth/resend-verification", { method: "POST", body: data }),
            { message: "Verification email resent" }
        ),
};

// =========================================================================
// 2. USER & SESSION SERVICES (/users/*)
// =========================================================================
export const usersApi = {
    getAll: () =>
        callOrMock(
            () => apiRequest<UserProfileDto[]>("/users", { method: "GET" }),
            MOCK_USERS
        ),

    getById: (id: string) =>
        callOrMock(
            () => apiRequest<UserProfileDto>(`/users/${encodeURIComponent(id)}`, { method: "GET" }),
            () => getMockUserById(id)
        ),

    getSessions: () =>
        callOrMock(
            () => apiRequest<UserSessionDto[]>("/users/sessions", { method: "GET" }),
            () => getMockSessions()
        ),

    revokeSession: (sessionId: string) =>
        callOrMock(
            () => apiRequest<{ message?: string }>(`/users/sessions/${encodeURIComponent(sessionId)}`, { method: "DELETE" }),
            () => {
                revokeMockSession(sessionId);
                return { message: "Session revoked" };
            }
        ),

    revokeAllSessions: () =>
        callOrMock(
            () => apiRequest<{ message?: string }>("/users/sessions", { method: "DELETE" }),
            () => {
                revokeAllMockSessions();
                return { message: "All sessions revoked" };
            }
        ),

    deleteAccount: () =>
        callOrMock(
            () => apiRequest<{ message?: string }>("/users/me", { method: "DELETE" }),
            { message: "Account deleted" }
        ),
};

// =========================================================================
// 3. PROFILE SERVICES (/profiles/*)
// =========================================================================
export const profilesApi = {
    getMe: () =>
        callOrMock(
            () => apiRequest<UserProfileDto>("/profiles/me", { method: "GET" }),
            () => {
                if (typeof window !== "undefined") {
                    const token = localStorage.getItem("indieg_access_token") || localStorage.getItem("access_token");
                    if (token && token.startsWith("mock_token_")) {
                        const targetId = token.replace("mock_token_", "");
                        const found = MOCK_USERS.find(
                            (u) => u.id === targetId || u.userId === targetId || String(u.id) === targetId
                        );
                        if (found) return found;
                    }
                }
                return MOCK_CURRENT_USER;
            }
        ),

    getMyProfile: () => profilesApi.getMe(),

    getByUsername: (username: string) =>
        callOrMock(
            () => apiRequest<UserProfileDto>(`/profiles/${encodeURIComponent(username.replace(/^@/, ""))}`, { method: "GET" }),
            () => {
                const clean = username.toLowerCase().replace(/^@/, "");
                return MOCK_USERS.find((u) => u.username.toLowerCase() === clean) || MOCK_CURRENT_USER;
            }
        ),

    getById: (id: string) =>
        callOrMock(
            () => apiRequest<UserProfileDto>(`/profiles/id/${encodeURIComponent(id)}`, { method: "GET" }),
            () => getMockUserById(id)
        ),

    search: (query: string, page = 1, limit = 10) =>
        callOrMock(
            () => apiRequest<UserProfileDto[]>("/profiles/search", { method: "GET", params: { q: query, page, limit } }),
            () => {
                const q = query.toLowerCase();
                return MOCK_USERS.filter((u) => u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q));
            }
        ),

    updateMe: (data: UpdateProfileDto) =>
        callOrMock(
            () => apiRequest<UserProfileDto>("/profiles/me", { method: "PATCH", body: data }),
            { ...MOCK_CURRENT_USER, ...data }
        ),

    deleteMe: () =>
        callOrMock(
            () => apiRequest<{ message?: string }>("/profiles/me", { method: "DELETE" }),
            { message: "Profile deleted" }
        ),

    deleteUser: (id: string) =>
        callOrMock(
            () => apiRequest<void>(`/profiles/${encodeURIComponent(id)}`, { method: "DELETE" }),
            undefined
        ),

    toggleArchived: () =>
        callOrMock(
            () => apiRequest<{ message?: string; archived?: boolean }>("/profiles/archived", { method: "PATCH" }),
            { message: "Status updated", archived: false }
        ),
};

// =========================================================================
// 4. COMMUNITIES SERVICES (/communities/*)
// =========================================================================
export const communitiesApi = {
    create: (data: CreateCommunityDto) =>
        callOrMock(
            () => apiRequest<CommunityDto>("/communities", { method: "POST", body: data }),
            () => {
                const slug = data.name.toLowerCase().replace(/\s+/g, "-");
                const newCom: CommunityDto = {
                    id: slug,
                    slug,
                    name: data.name,
                    description: data.description || "",
                    logo: data.logo,
                    backdrop: data.backdrop,
                    category: data.category || "General",
                    rules: data.rules,
                    tags: data.tags || [],
                    membersCount: 1,
                    onlineNow: 1,
                    joined: true,
                    isJoined: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };
                return newCom;
            }
        ),

    getAll: (params?: GetCommunitiesParams) =>
        callOrMock(
            () => apiRequest<CommunityDto[] | { items: CommunityDto[]; total?: number }>("/communities", {
                method: "GET",
                params: sanitizePaginationParams(params, 50),
            }),
            () => {
                if (params?.type === "joined") {
                    return MOCK_COMMUNITY_DTOS.filter((c) => c.joined);
                }
                return MOCK_COMMUNITY_DTOS;
            }
        ),

    getFeatured: () =>
        callOrMock(
            () => apiRequest<CommunityDto[]>("/communities/featured", { method: "GET" }),
            MOCK_COMMUNITY_DTOS.filter((c) => c.featured)
        ),

    getPopular: () =>
        callOrMock(
            () => apiRequest<CommunityDto[]>("/communities/popular", { method: "GET" }),
            MOCK_COMMUNITY_DTOS
        ),

    getRecent: () =>
        callOrMock(
            () => apiRequest<CommunityDto[]>("/communities/recent", { method: "GET" }),
            MOCK_COMMUNITY_DTOS
        ),

    getMyCommunities: () =>
        callOrMock(
            () => apiRequest<CommunityDto[]>("/communities/my", { method: "GET" }),
            MOCK_COMMUNITY_DTOS.filter((c) => c.joined)
        ),

    getById: (id: string) =>
        callOrMock(
            () => apiRequest<CommunityDto>(`/communities/${encodeURIComponent(id)}`, { method: "GET" }),
            () => {
                const found = MOCK_COMMUNITY_DTOS.find((c) => c.id === id || c.slug === id);
                return found || MOCK_COMMUNITY_DTOS[0];
            }
        ),

    getBySlug: (slug: string) =>
        callOrMock(
            () => apiRequest<CommunityDto>(`/communities/slug/${encodeURIComponent(slug)}`, { method: "GET" }),
            () => {
                const found = MOCK_COMMUNITY_DTOS.find((c) => c.slug === slug || c.id === slug);
                return found || MOCK_COMMUNITY_DTOS[0];
            }
        ),

    update: (id: string, data: UpdateCommunityDto) =>
        callOrMock(
            () => apiRequest<CommunityDto>(`/communities/${encodeURIComponent(id)}`, { method: "PATCH", body: data }),
            () => {
                const base = getMockCommunityById(id);
                return { ...base, ...data } as CommunityDto;
            }
        ),

    delete: (id: string) =>
        callOrMock(
            () => apiRequest<void>(`/communities/${encodeURIComponent(id)}`, { method: "DELETE" }),
            undefined
        ),
};

// =========================================================================
// 5. COMMUNITY MEMBERS SERVICES (/communities/{id}/members/*)
// =========================================================================
export const communityMembersApi = {
    getMembers: (communityId: string, params?: GetCommunityMembersParams) =>
        callOrMock(
            () => apiRequest<CommunityMembersResponseDto | CommunityMemberDto[]>(
                `/communities/${encodeURIComponent(communityId)}/members`,
                { method: "GET", params: sanitizePaginationParams(params, 50) }
            ),
            () => {
                const list = MOCK_COMMUNITY_MEMBERS.filter((m) => m.communityId === communityId);
                return list.length > 0 ? list : MOCK_COMMUNITY_MEMBERS.filter((m) => m.communityId === "cs2-vietnam");
            }
        ),

    searchMembers: (communityId: string, params: SearchCommunityMembersParams) =>
        callOrMock(
            () => apiRequest<CommunityMemberDto[]>(
                `/communities/${encodeURIComponent(communityId)}/members/search`,
                { method: "GET", params: sanitizePaginationParams(params, 50) }
            ),
            () => {
                const list = MOCK_COMMUNITY_MEMBERS.filter((m) => m.communityId === communityId);
                const baseList = list.length > 0 ? list : MOCK_COMMUNITY_MEMBERS.filter((m) => m.communityId === "cs2-vietnam");
                const q = (params?.query || "").toLowerCase();
                if (!q) return baseList;
                return baseList.filter((m) => m.user?.username?.toLowerCase().includes(q) || m.user?.name?.toLowerCase().includes(q));
            }
        ),

    getMyRole: (communityId: string) =>
        callOrMock(
            () => apiRequest<{ role: string; status: string }>(
                `/communities/${encodeURIComponent(communityId)}/members/me`,
                { method: "GET" }
            ),
            () => {
                if (typeof window !== "undefined") {
                    const token = localStorage.getItem("indieg_access_token") || localStorage.getItem("access_token");
                    if (token && (token.includes("admin") || token.includes("usr_admin"))) {
                        return { role: "owner", status: "active" };
                    }
                }
                return { role: "moderator", status: "active" };
            }
        ),

    getBannedMembers: (communityId: string) =>
        callOrMock(
            () => apiRequest<CommunityMemberDto[]>(
                `/communities/${encodeURIComponent(communityId)}/members/banned`,
                { method: "GET" }
            ),
            () => {
                const list = MOCK_COMMUNITY_MEMBERS.filter((m) => m.communityId === communityId && m.status === "banned");
                return list.length > 0 ? list : MOCK_COMMUNITY_MEMBERS.filter((m) => m.communityId === "cs2-vietnam" && m.status === "banned");
            }
        ),

    getMutedMembers: (communityId: string) =>
        callOrMock(
            () => apiRequest<CommunityMemberDto[]>(
                `/communities/${encodeURIComponent(communityId)}/members/muted`,
                { method: "GET" }
            ),
            () => {
                const list = MOCK_COMMUNITY_MEMBERS.filter((m) => m.communityId === communityId && m.status === "muted");
                return list.length > 0 ? list : MOCK_COMMUNITY_MEMBERS.filter((m) => m.communityId === "cs2-vietnam" && m.status === "muted");
            }
        ),

    sendInvite: (communityId: string, data: CreateCommunityInviteDto) =>
        callOrMock(
            () => apiRequest<CommunityInviteDto>(
                `/communities/${encodeURIComponent(communityId)}/members/invites`,
                { method: "POST", body: data }
            ),
            {
                id: `inv-${Date.now()}`,
                communityId,
                inviteeId: data.inviteeId,
                status: "pending",
                createdAt: new Date().toISOString(),
            }
        ),

    getInvites: (communityId: string) =>
        callOrMock(
            () => apiRequest<CommunityInviteDto[]>(
                `/communities/${encodeURIComponent(communityId)}/members/invites`,
                { method: "GET" }
            ),
            []
        ),

    join: (communityId: string) =>
        callOrMock(
            () => apiRequest<{ message?: string; joined?: boolean }>(
                `/communities/${encodeURIComponent(communityId)}/members/join`,
                { method: "POST" }
            ),
            { message: "Joined successfully", joined: true }
        ),

    leave: (communityId: string) =>
        callOrMock(
            () => apiRequest<{ message?: string; joined?: boolean }>(
                `/communities/${encodeURIComponent(communityId)}/members/leave`,
                { method: "POST" }
            ),
            { message: "Left successfully", joined: false }
        ),

    assignRole: (communityId: string, memberId: string, role: string) =>
        callOrMock(
            () => apiRequest<CommunityMemberDto>(
                `/communities/${encodeURIComponent(communityId)}/members/${encodeURIComponent(memberId)}/role`,
                { method: "PATCH", body: { role } }
            ),
            { communityId, userId: memberId, role: role as "member" | "moderator" | "owner", status: "active", joinedAt: new Date().toISOString() }
        ),

    performAction: (communityId: string, data: CommunityMemberActionDto) =>
        callOrMock(
            () => apiRequest<{ message?: string; success?: boolean }>(
                `/communities/${encodeURIComponent(communityId)}/members/actions`,
                { method: "POST", body: data }
            ),
            { message: "Action performed", success: true }
        ),

    kickMember: (communityId: string, memberId: string) =>
        callOrMock(
            () => apiRequest<{ message?: string; success?: boolean }>(
                `/communities/${encodeURIComponent(communityId)}/members/${encodeURIComponent(memberId)}/kick`,
                { method: "POST" }
            ),
            { message: "Member kicked", success: true }
        ),

    banMember: (communityId: string, memberId: string, reason?: string) =>
        callOrMock(
            () => apiRequest<{ message?: string; success?: boolean }>(
                `/communities/${encodeURIComponent(communityId)}/members/${encodeURIComponent(memberId)}/ban`,
                { method: "POST", body: { reason } }
            ),
            { message: "Member banned", success: true }
        ),

    unbanMember: (communityId: string, memberId: string) =>
        callOrMock(
            () => apiRequest<{ message?: string; success?: boolean }>(
                `/communities/${encodeURIComponent(communityId)}/members/${encodeURIComponent(memberId)}/unban`,
                { method: "POST" }
            ),
            { message: "Member unbanned", success: true }
        ),

    muteMember: (communityId: string, memberId: string, durationMinutes?: number) =>
        callOrMock(
            () => apiRequest<{ message?: string; success?: boolean }>(
                `/communities/${encodeURIComponent(communityId)}/members/${encodeURIComponent(memberId)}/mute`,
                { method: "POST", body: { durationMinutes } }
            ),
            { message: "Member muted", success: true }
        ),

    unmuteMember: (communityId: string, memberId: string) =>
        callOrMock(
            () => apiRequest<{ message?: string; success?: boolean }>(
                `/communities/${encodeURIComponent(communityId)}/members/${encodeURIComponent(memberId)}/unmute`,
                { method: "POST" }
            ),
            { message: "Member unmuted", success: true }
        ),

    transferOwnership: (communityId: string, newOwnerIdOrData: string | { newOwnerId: string }) =>
        callOrMock(
            () => apiRequest<{ message?: string; success?: boolean }>(
                `/communities/${encodeURIComponent(communityId)}/members/transfer-ownership`,
                { method: "PATCH", body: typeof newOwnerIdOrData === "string" ? { newOwnerId: newOwnerIdOrData } : newOwnerIdOrData }
            ),
            { message: "Ownership transferred", success: true }
        ),
};

// =========================================================================
// 6. POST SERVICES (/posts/*)
// =========================================================================
export const postsApi = {
    getAll: (params?: {
        authorId?: string;
        communityId?: string;
        title?: string;
        content?: string;
        tags?: string[];
        page?: number;
        limit?: number;
    }) =>
        callOrMock(
            () => apiRequest<PostDto[] | { items: PostDto[]; total?: number }>("/posts", {
                method: "GET",
                params: sanitizePaginationParams(params, 50),
            }),
            () => {
                let list = [...MOCK_POST_DTOS];
                if (params?.communityId) {
                    list = list.filter((p) => p.communityId === params.communityId);
                }
                if (params?.authorId) {
                    list = list.filter((p) => p.authorId === params.authorId);
                }
                return { items: list, data: list, total: list.length };
            }
        ),

    getFeed: (params?: { page?: number; limit?: number; tab?: string }) =>
        callOrMock(
            () => apiRequest<PostDto[] | { items: PostDto[]; total?: number }>("/posts/feed", {
                method: "GET",
                params: sanitizePaginationParams(params, 50),
            }),
            () => ({ items: MOCK_POST_DTOS, data: MOCK_POST_DTOS, total: MOCK_POST_DTOS.length })
        ),

    getByCommunity: (communityId: string, params?: { page?: number; limit?: number }) =>
        callOrMock(
            () => apiRequest<PostDto[] | { items: PostDto[]; total?: number }>(
                `/posts/community/${encodeURIComponent(communityId)}`,
                { method: "GET", params: sanitizePaginationParams(params, 50) }
            ),
            () => {
                const filtered = MOCK_POST_DTOS.filter((p) => p.communityId === communityId);
                return filtered.length > 0 ? filtered : MOCK_POST_DTOS.slice(0, 2);
            }
        ),

    getByAuthor: (authorId: string, params?: { page?: number; limit?: number }) =>
        callOrMock(
            () => apiRequest<PostDto[] | { items: PostDto[]; total?: number }>(
                `/posts/author/${encodeURIComponent(authorId)}`,
                { method: "GET", params: sanitizePaginationParams(params, 50) }
            ),
            () => MOCK_POST_DTOS.filter((p) => p.authorId === authorId || authorId === "me" || authorId === "user-me")
        ),

    getOne: (id: string) =>
        callOrMock(
            () => apiRequest<PostDto>(`/posts/${encodeURIComponent(id)}`, { method: "GET" }),
            () => getMockPostDtoById(id)
        ),

    create: (data: CreatePostDto) =>
        callOrMock(
            () => apiRequest<PostDto>("/posts", { method: "POST", body: data }),
            () => {
                const newPost: PostDto = {
                    id: `post-${Date.now()}`,
                    title: data.title || "",
                    content: data.content,
                    authorId: "user-me",
                    communityId: data.communityId,
                    gameTag: data.gameTag,
                    likes: 1,
                    upvotes: 1,
                    downvotes: 0,
                    score: 1,
                    commentsCount: 0,
                    images: data.images || [],
                    tags: data.tags || [],
                    currentUserVoteType: 1,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    user: {
                        id: "user-me",
                        username: "IndieGamer",
                        name: "Indie Gamer Pro",
                        displayName: "Indie Gamer Pro",
                        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=IndieGamer",
                    },
                };
                return newPost;
            }
        ),

    update: (id: string, data: UpdatePostDto) =>
        callOrMock(
            () => apiRequest<PostDto>(`/posts/${encodeURIComponent(id)}`, { method: "PATCH", body: data }),
            () => {
                const existing = getMockPostDtoById(id);
                return { ...existing, ...data };
            }
        ),

    delete: (id: string) =>
        callOrMock(
            () => apiRequest<void>(`/posts/${encodeURIComponent(id)}`, { method: "DELETE" }),
            undefined
        ),

    pinPost: (id: string) =>
        callOrMock(
            () => apiRequest<PostActionResponse>(`/posts/${encodeURIComponent(id)}/pin`, { method: "PATCH" }),
            { success: true, message: "Post pinned" }
        ),

    unpinPost: (id: string) =>
        callOrMock(
            () => apiRequest<PostActionResponse>(`/posts/${encodeURIComponent(id)}/unpin`, { method: "PATCH" }),
            { success: true, message: "Post unpinned" }
        ),

    lockPost: (id: string) =>
        callOrMock(
            () => apiRequest<PostActionResponse>(`/posts/${encodeURIComponent(id)}/lock`, { method: "PATCH" }),
            { success: true, message: "Post locked" }
        ),

    unlockPost: (id: string) =>
        callOrMock(
            () => apiRequest<PostActionResponse>(`/posts/${encodeURIComponent(id)}/unlock`, { method: "PATCH" }),
            { success: true, message: "Post unlocked" }
        ),

    getPostVoters: (id: string) =>
        callOrMock(
            () => apiRequest<UserProfileDto[]>(`/posts/${encodeURIComponent(id)}/voters`, { method: "GET" }),
            MOCK_USERS.slice(0, 3)
        ),
};

// =========================================================================
// 7. COMMENT SERVICES (/comments/*)
// =========================================================================
export const commentsApi = {
    create: (data: CreateCommentDto) =>
        callOrMock(
            () => apiRequest<CommentEntity>("/comments", { method: "POST", body: data }),
            () => {
                let currentUser = MOCK_CURRENT_USER;
                if (typeof window !== "undefined") {
                    const token = localStorage.getItem("token") || "";
                    if (token.startsWith("mock_token_")) {
                        const targetId = token.replace("mock_token_", "");
                        currentUser = getMockUserById(targetId);
                    }
                }
                const newComment: CommentEntity = {
                    id: `cmt-${Date.now()}`,
                    postId: data.postId || "post-1",
                    parentId: data.parentId ? String(data.parentId) : null,
                    authorId: currentUser.id,
                    authorName: currentUser.displayName || currentUser.name,
                    authorAvatar: currentUser.avatarUrl || currentUser.avatar,
                    content: data.content,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    likes: 0,
                    upvotes: 0,
                    downvotes: 0,
                    score: 0,
                    image: data.image,
                    author: {
                        id: currentUser.id,
                        username: currentUser.username,
                        name: currentUser.displayName || currentUser.name,
                        displayName: currentUser.displayName || currentUser.name,
                        avatar: currentUser.avatarUrl || currentUser.avatar,
                        avatarUrl: currentUser.avatarUrl || currentUser.avatar,
                    },
                };
                addMockComment(newComment);
                return newComment;
            }
        ),

    getOne: (id: string) =>
        callOrMock(
            () => apiRequest<CommentEntity>(`/comments/${encodeURIComponent(id)}`, { method: "GET" }),
            () => ({
                id,
                content: "Bình luận mẫu",
                authorId: "user-1",
                createdAt: new Date().toISOString(),
                likes: 5,
            })
        ),

    update: (id: string, payload: { content: string }) =>
        callOrMock(
            () => apiRequest<CommentEntity>(`/comments/${encodeURIComponent(id)}`, { method: "PATCH", body: payload }),
            () => ({
                id,
                content: payload.content,
                authorId: "user-me",
                createdAt: new Date().toISOString(),
                likes: 0,
            })
        ),

    delete: (id: string) =>
        callOrMock(
            () => apiRequest<{ message?: string }>(`/comments/${encodeURIComponent(id)}`, { method: "DELETE" }),
            { message: "Comment deleted" }
        ),

    getRootComments: (params: { postId: string | number; page?: number; limit?: number }) =>
        callOrMock(
            () => apiRequest<RootCommentsResponse>(
                `/comments/post/${encodeURIComponent(String(params.postId))}`,
                { method: "GET", params: sanitizePaginationParams(params, 50) }
            ),
            () => {
                const list = getMockCommentsByPostId(params.postId);
                const page = params.page || 1;
                const limit = params.limit || 10;
                return {
                    data: list,
                    items: list,
                    total: list.length,
                    meta: {
                        total: list.length,
                        page,
                        limit,
                        totalPages: Math.max(1, Math.ceil(list.length / limit)),
                    },
                };
            }
        ),

    getReplyComments: (params: { parentId: string | number; cursor?: string; limit?: number }) =>
        callOrMock(
            () => apiRequest<ReplyCommentsResponse>("/comments/replies", { method: "GET", params: sanitizePaginationParams(params, 5) }),
            () => {
                const replies = getMockRepliesByCommentId(params.parentId);
                return {
                    data: replies,
                    items: replies,
                    total: replies.length,
                    hasMore: false,
                    meta: {
                        limit: params.limit || 5,
                        hasNextPage: false,
                        nextCursor: null,
                    },
                };
            }
        ),

    getReplies: (parentId: string | number, params?: { limit?: number; cursor?: string }) =>
        commentsApi.getReplyComments({ parentId, ...params }),

    pinComment: (id: string | number) =>
        callOrMock(
            () => apiRequest<{ message?: string; success?: boolean }>(`/comments/${encodeURIComponent(String(id))}/pin`, { method: "PATCH" }),
            { message: "Comment pinned", success: true }
        ),

    unpinComment: (id: string | number) =>
        callOrMock(
            () => apiRequest<{ message?: string; success?: boolean }>(`/comments/${encodeURIComponent(String(id))}/unpin`, { method: "PATCH" }),
            { message: "Comment unpinned", success: true }
        ),

    getPostComments: (postId: string, params?: { page?: number; limit?: number }) =>
        callOrMock(
            () => apiRequest<CommentEntity[] | { data: CommentEntity[]; total?: number }>(
                `/comments/post/${encodeURIComponent(postId)}`,
                { method: "GET", params: sanitizePaginationParams(params, 50) }
            ),
            () => getMockCommentsByPostId(postId)
        ),
};

// =========================================================================
// 8. REPORT SERVICES (/reports/*)
// =========================================================================
export const reportsApi = {
    getAll: (params?: GetReportsParams) =>
        callOrMock(
            () => apiRequest<ReportDto[]>("/reports", { method: "GET", params: params as Record<string, unknown> }),
            () => getMockReports()
        ),

    create: (data: CreateReportDto) =>
        callOrMock(
            () => apiRequest<ReportDto>("/reports", { method: "POST", body: data }),
            () => {
                const newReport: ReportDto = {
                    id: `rep-${Date.now()}`,
                    targetType: (data.targetType as "post" | "comment") || "post",
                    targetId: data.targetId || data.postId || data.commentId || "",
                    postId: data.postId || (data.targetType === "post" ? data.targetId : undefined),
                    commentId: data.commentId || (data.targetType === "comment" ? data.targetId : undefined),
                    reason: data.reason,
                    status: "pending",
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    reporter: {
                        id: MOCK_CURRENT_USER.id,
                        username: MOCK_CURRENT_USER.username,
                        name: MOCK_CURRENT_USER.name,
                        avatarUrl: MOCK_CURRENT_USER.avatarUrl,
                        avatar: MOCK_CURRENT_USER.avatar,
                    },
                };
                addMockReport(newReport);
                return newReport;
            }
        ),

    getOne: (id: string) =>
        callOrMock(
            () => apiRequest<ReportDto>(`/reports/${encodeURIComponent(id)}`, { method: "GET" }),
            () => getMockReportById(id)
        ),

    getHistory: (id: string) =>
        callOrMock(
            () => apiRequest<ReportHistoryItemDto[]>(`/reports/${encodeURIComponent(id)}/history`, { method: "GET" }),
            () => getMockReportHistory(id)
        ),

    update: (id: string, reason: string) =>
        callOrMock(
            () => apiRequest<ReportDto>(`/reports/${encodeURIComponent(id)}`, { method: "PATCH", body: { reason } }),
            () => {
                const rep = getMockReportById(id);
                rep.reason = reason;
                rep.updatedAt = new Date().toISOString();
                return rep;
            }
        ),

    resolve: (id: string, data: ResolveReportDto | string) =>
        callOrMock(
            () => apiRequest<{ message?: string; success?: boolean }>(
                `/reports/${encodeURIComponent(id)}/resolve`,
                { method: "PATCH", body: typeof data === "string" ? { status: "resolved", moderatorNote: data } : data }
            ),
            () => resolveMockReport(id, data)
        ),

    dismiss: (id: string) =>
        reportsApi.resolve(id, { status: "dismissed" }),

    reportPost: (postId: string, reason: string) =>
        reportsApi.create({ targetType: "post", targetId: postId, reason }),

    reportComment: (commentId: string, reason: string) =>
        reportsApi.create({ targetType: "comment", targetId: commentId, reason }),

    reportUser: (userId: string, reason: string) =>
        reportsApi.create({ targetType: "post", targetId: userId, reason }),

    delete: (id: string) =>
        callOrMock(
            () => apiRequest<{ message?: string }>(`/reports/${encodeURIComponent(id)}`, { method: "DELETE" }),
            () => {
                deleteMockReport(id);
                return { message: "Report deleted" };
            }
        ),
};

// =========================================================================
// 9. VOTE SERVICES (/votes/*)
// =========================================================================
export const votesApi = {
    getAll: () =>
        callOrMock(
            () => apiRequest<VoteDto[]>("/votes", { method: "GET" }),
            []
        ),

    getByPost: (postId: string | number) =>
        callOrMock(
            () => apiRequest<VoteDto | { hasVoted?: boolean; score?: number }>(`/votes/post/${encodeURIComponent(String(postId))}`, { method: "GET" }),
            { hasVoted: true, score: 152 }
        ),

    getMyPostVote: (postId: string | number) =>
        callOrMock(
            () => apiRequest<{ hasVoted?: boolean; voteType?: VoteType | 0; score?: number }>(`/votes/post/${encodeURIComponent(String(postId))}/me`, { method: "GET" }),
            { hasVoted: true, voteType: 1, score: 152 }
        ),

    votePost: (postId: string | number, voteType: VoteType = 1) =>
        callOrMock(
            () => apiRequest<{ message?: string; success?: boolean; score?: number; voteType?: VoteType }>(`/votes/post/${encodeURIComponent(String(postId))}`, { method: "POST", body: { voteType } }),
            { message: "Vote recorded", success: true, score: 152, voteType }
        ),

    upVotePost: (postId: string | number) =>
        votesApi.votePost(postId, 1),

    downVotePost: (postId: string | number) =>
        votesApi.votePost(postId, -1),

    deleteVotePost: (postId: string | number) =>
        callOrMock(
            () => apiRequest<{ message?: string; success?: boolean }>(`/votes/${encodeURIComponent(String(postId))}/post`, { method: "DELETE" }),
            { message: "Vote removed", success: true }
        ),

    getByComment: (commentId: string | number) =>
        callOrMock(
            () => apiRequest<VoteDto | { hasVoted?: boolean; score?: number }>(`/votes/comment/${encodeURIComponent(String(commentId))}`, { method: "GET" }),
            { hasVoted: false, score: 10 }
        ),

    getMyCommentVote: (commentId: string | number) =>
        callOrMock(
            () => apiRequest<{ hasVoted?: boolean; voteType?: VoteType | 0; score?: number }>(`/votes/comment/${encodeURIComponent(String(commentId))}/me`, { method: "GET" }),
            { hasVoted: false, voteType: 0, score: 10 }
        ),

    voteComment: (commentId: string | number, voteType: VoteType = 1) =>
        callOrMock(
            () => apiRequest<{ message?: string; success?: boolean; score?: number; voteType?: VoteType }>(`/votes/comment/${encodeURIComponent(String(commentId))}`, { method: "POST", body: { voteType } }),
            { message: "Vote recorded", success: true, score: 10, voteType }
        ),

    upVoteComment: (commentId: string | number) =>
        votesApi.voteComment(commentId, 1),

    downVoteComment: (commentId: string | number) =>
        votesApi.voteComment(commentId, -1),

    deleteVoteComment: (commentId: string | number) =>
        callOrMock(
            () => apiRequest<{ message?: string; success?: boolean }>(`/votes/${encodeURIComponent(String(commentId))}/comment`, { method: "DELETE" }),
            { message: "Vote removed", success: true }
        ),
};

// =========================================================================
// 10. GAMES SERVICES (/games/*)
// =========================================================================
export const gamesApi = {
    create: (data: CreateGameDto) =>
        callOrMock(
            () => apiRequest<GameDto>("/games", { method: "POST", body: data }),
            { id: data.slug || "new-game", name: data.name, slug: data.slug || "new-game", appid: data.appid || 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        ),

    getAll: (params?: GetGamesParams) =>
        callOrMock(
            () => apiRequest<GameDto[] | { items: GameDto[]; total?: number }>("/games", { method: "GET", params: sanitizePaginationParams(params, 50) }),
            () => MOCK_GAME_DTOS
        ),

    getFeatured: () =>
        callOrMock(
            () => apiRequest<GameDto[]>("/games/featured", { method: "GET" }),
            MOCK_GAME_DTOS.slice(0, 3)
        ),

    getPopular: () =>
        callOrMock(
            () => apiRequest<GameDto[]>("/games/popular", { method: "GET" }),
            MOCK_GAME_DTOS
        ),

    getRecent: () =>
        callOrMock(
            () => apiRequest<GameDto[]>("/games/recent", { method: "GET" }),
            MOCK_GAME_DTOS
        ),

    syncSteam: (appid: number | string) =>
        callOrMock(
            () => apiRequest<SteamSyncResponse>(`/games/${encodeURIComponent(String(appid))}/sync-steam`, { method: "POST" }),
            { success: true, appid: Number(appid), message: "Steam data synchronized" }
        ),

    searchSteam: (q: string) =>
        callOrMock(
            () => apiRequest<SteamSearchResultDto[]>("/games/search/steam", { method: "GET", params: { q } }),
            () => MOCK_GAME_DTOS.filter((g) => g.name.toLowerCase().includes(q.toLowerCase())).map((g) => ({ appid: g.appid || 730, name: g.name }))
        ),

    importSteamSearch: (q: string) =>
        callOrMock(
            () => apiRequest<GameDto | GameDto[]>("/games/search/steam/import", { method: "POST", params: { q } }),
            MOCK_GAME_DTOS[0]
        ),

    importByAppid: (appid: number | string) =>
        callOrMock(
            () => apiRequest<GameDto>(`/games/${encodeURIComponent(String(appid))}/import`, { method: "POST" }),
            () => MOCK_GAME_DTOS.find((g) => g.appid === Number(appid)) || MOCK_GAME_DTOS[0]
        ),

    getExternalData: (appid: number | string) =>
        callOrMock(
            () => apiRequest<ExternalGameDataDto>(`/games/${encodeURIComponent(String(appid))}/external`, { method: "GET" }),
            () => {
                const found = MOCK_GAMES.find((g) => g.appid === Number(appid));
                return {
                    appid: Number(appid),
                    name: found?.name || "Game",
                    detailedDescription: found?.description,
                    shortDescription: found?.summary,
                    headerImage: found?.bannerUrl,
                };
            }
        ),

    refreshExternalData: (appid: number | string) =>
        callOrMock(
            () => apiRequest<ExternalGameDataDto | { message?: string; success?: boolean }>(`/games/${encodeURIComponent(String(appid))}/external/refresh`, { method: "POST" }),
            { message: "External data refreshed", success: true }
        ),

    getBySlug: (slug: string) =>
        callOrMock(
            () => apiRequest<GameDto>(`/games/slug/${encodeURIComponent(slug)}`, { method: "GET" }),
            () => MOCK_GAME_DTOS.find((g) => g.slug === slug || g.id === slug) || MOCK_GAME_DTOS[0]
        ),

    getByAppid: (appid: number | string) =>
        callOrMock(
            () => apiRequest<GameDto>(`/games/${encodeURIComponent(String(appid))}`, { method: "GET" }),
            () => MOCK_GAME_DTOS.find((g) => g.appid === Number(appid)) || MOCK_GAME_DTOS[0]
        ),

    update: (appid: number | string, data: UpdateGameDto) =>
        callOrMock(
            () => apiRequest<GameDto>(`/games/${encodeURIComponent(String(appid))}`, { method: "PATCH", body: data }),
            () => ({ ...MOCK_GAME_DTOS[0], ...data })
        ),

    delete: (appid: number | string) =>
        callOrMock(
            () => apiRequest<void>(`/games/${encodeURIComponent(String(appid))}`, { method: "DELETE" }),
            undefined
        ),
};

// =========================================================================
// 11. GAME GUIDES SERVICES (/games/{appid}/guides/*)
// =========================================================================
export const gameGuidesApi = {
    getAll: (appid: number | string, params?: GetGameGuidesParams) =>
        callOrMock(
            () => apiRequest<GameGuideDto[] | { items: GameGuideDto[]; total?: number }>(`/games/${encodeURIComponent(String(appid))}/guides`, { method: "GET", params: sanitizePaginationParams(params, 50) }),
            () => MOCK_GUIDES.filter((g) => g.appid === Number(appid)) || MOCK_GUIDES
        ),

    create: (appid: number | string, data: CreateGameGuideDto) =>
        callOrMock(
            () => apiRequest<GameGuideDto>(`/games/${encodeURIComponent(String(appid))}/guides`, { method: "POST", body: data }),
            () => ({
                id: `guide-${Date.now()}`,
                appid: Number(appid),
                title: data.title,
                content: data.content,
                authorId: "user-me",
                views: 1,
                likes: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            })
        ),

    getById: (appid: number | string, id: string) =>
        callOrMock(
            () => apiRequest<GameGuideDto>(`/games/${encodeURIComponent(String(appid))}/guides/${encodeURIComponent(id)}`, { method: "GET" }),
            () => MOCK_GUIDES.find((g) => g.id === id) || MOCK_GUIDES[0]
        ),

    update: (appid: number | string, id: string, data: UpdateGameGuideDto) =>
        callOrMock(
            () => apiRequest<GameGuideDto>(`/games/${encodeURIComponent(String(appid))}/guides/${encodeURIComponent(id)}`, { method: "PATCH", body: data }),
            () => ({ ...MOCK_GUIDES[0], ...data })
        ),

    delete: (appid: number | string, id: string) =>
        callOrMock(
            () => apiRequest<void>(`/games/${encodeURIComponent(String(appid))}/guides/${encodeURIComponent(id)}`, { method: "DELETE" }),
            undefined
        ),

    like: (appid: number | string, id: string) =>
        callOrMock(
            () => apiRequest<{ message?: string; success?: boolean }>(`/games/${encodeURIComponent(String(appid))}/guides/${encodeURIComponent(id)}/like`, { method: "PATCH" }),
            { message: "Guide liked", success: true }
        ),

    unlike: (appid: number | string, id: string) =>
        callOrMock(
            () => apiRequest<{ message?: string; success?: boolean }>(`/games/${encodeURIComponent(String(appid))}/guides/${encodeURIComponent(id)}/like`, { method: "DELETE" }),
            { message: "Guide unliked", success: true }
        ),

    recordView: (appid: number | string, id: string) =>
        callOrMock(
            () => apiRequest<{ success?: boolean; views?: number }>(`/games/${encodeURIComponent(String(appid))}/guides/${encodeURIComponent(id)}/view`, { method: "POST" }),
            { success: true, views: 100 }
        ),
};

// =========================================================================
// 12. GAME REVIEWS SERVICES (/games/{appid}/reviews/*)
// =========================================================================
export const gameReviewsApi = {
    getAll: (appid: number | string, params?: GetGameReviewsParams) =>
        callOrMock(
            () => apiRequest<GameReviewDto[] | { items: GameReviewDto[]; total?: number }>(`/games/${encodeURIComponent(String(appid))}/reviews`, { method: "GET", params: sanitizePaginationParams(params, 50) }),
            () => MOCK_REVIEWS.filter((r) => r.appid === Number(appid)) || MOCK_REVIEWS
        ),

    create: (appid: number | string, data: CreateGameReviewDto) =>
        callOrMock(
            () => apiRequest<GameReviewDto>(`/games/${encodeURIComponent(String(appid))}/reviews`, { method: "POST", body: data }),
            () => ({
                id: `rev-${Date.now()}`,
                appid: Number(appid),
                authorId: "user-me",
                rating: data.rating,
                content: data.content,
                likes: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            })
        ),

    getById: (appid: number | string, id: string) =>
        callOrMock(
            () => apiRequest<GameReviewDto>(`/games/${encodeURIComponent(String(appid))}/reviews/${encodeURIComponent(id)}`, { method: "GET" }),
            () => MOCK_REVIEWS.find((r) => r.id === id) || MOCK_REVIEWS[0]
        ),

    getMyReview: (appid: number | string) =>
        callOrMock(
            () => apiRequest<GameReviewDto>(`/games/${encodeURIComponent(String(appid))}/reviews/me`, { method: "GET" }),
            () => MOCK_REVIEWS.find((r) => r.appid === Number(appid)) || MOCK_REVIEWS[0]
        ),

    update: (appid: number | string, id: string, data: UpdateGameReviewDto) =>
        callOrMock(
            () => apiRequest<GameReviewDto>(`/games/${encodeURIComponent(String(appid))}/reviews/${encodeURIComponent(id)}`, { method: "PATCH", body: data }),
            () => ({ ...MOCK_REVIEWS[0], ...data })
        ),

    delete: (appid: number | string, id: string) =>
        callOrMock(
            () => apiRequest<void>(`/games/${encodeURIComponent(String(appid))}/reviews/${encodeURIComponent(id)}`, { method: "DELETE" }),
            undefined
        ),

    like: (appid: number | string, id: string) =>
        callOrMock(
            () => apiRequest<{ message?: string; success?: boolean }>(`/games/${encodeURIComponent(String(appid))}/reviews/${encodeURIComponent(id)}/like`, { method: "PATCH" }),
            { message: "Review liked", success: true }
        ),

    unlike: (appid: number | string, id: string) =>
        callOrMock(
            () => apiRequest<{ message?: string; success?: boolean }>(`/games/${encodeURIComponent(String(appid))}/reviews/${encodeURIComponent(id)}/like`, { method: "DELETE" }),
            { message: "Review unliked", success: true }
        ),
};

// =========================================================================
// 13. GAME PATCH NOTES SERVICES (/games/{appid}/patch-notes/*)
// =========================================================================
export const gamePatchNotesApi = {
    getAll: (appid: number | string, params?: GetGamePatchNotesParams) =>
        callOrMock(
            () => apiRequest<GamePatchNoteDto[] | { items: GamePatchNoteDto[]; total?: number }>(`/games/${encodeURIComponent(String(appid))}/patch-notes`, { method: "GET", params: sanitizePaginationParams(params, 50) }),
            () => MOCK_PATCH_NOTES.filter((p) => p.appid === Number(appid)) || MOCK_PATCH_NOTES
        ),

    create: (appid: number | string, data: CreateGamePatchNoteDto) =>
        callOrMock(
            () => apiRequest<GamePatchNoteDto>(`/games/${encodeURIComponent(String(appid))}/patch-notes`, { method: "POST", body: data }),
            () => ({
                id: `patch-${Date.now()}`,
                appid: Number(appid),
                title: data.title,
                content: data.content,
                version: data.version,
                releaseDate: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            })
        ),

    getLatest: (appid: number | string) =>
        callOrMock(
            () => apiRequest<GamePatchNoteDto>(`/games/${encodeURIComponent(String(appid))}/patch-notes/latest`, { method: "GET" }),
            () => MOCK_PATCH_NOTES[0]
        ),

    getById: (appid: number | string, id: string) =>
        callOrMock(
            () => apiRequest<GamePatchNoteDto>(`/games/${encodeURIComponent(String(appid))}/patch-notes/${encodeURIComponent(id)}`, { method: "GET" }),
            () => MOCK_PATCH_NOTES.find((p) => p.id === id) || MOCK_PATCH_NOTES[0]
        ),

    update: (appid: number | string, id: string, data: UpdateGamePatchNoteDto) =>
        callOrMock(
            () => apiRequest<GamePatchNoteDto>(`/games/${encodeURIComponent(String(appid))}/patch-notes/${encodeURIComponent(id)}`, { method: "PATCH", body: data }),
            () => ({ ...MOCK_PATCH_NOTES[0], ...data })
        ),

    delete: (appid: number | string, id: string) =>
        callOrMock(
            () => apiRequest<void>(`/games/${encodeURIComponent(String(appid))}/patch-notes/${encodeURIComponent(id)}`, { method: "DELETE" }),
            undefined
        ),
};

// =========================================================================
// 14. GUESTBOOK SERVICES (/profiles/{profileId}/guestbook-comments/*)
// =========================================================================
export const guestbookCommentsApi = {
    getByProfileId: (profileId: string) =>
        callOrMock(
            () => apiRequest<GuestbookCommentDto[]>(`/profiles/${encodeURIComponent(profileId)}/guestbook-comments`, { method: "GET" }),
            () => getMockGuestbookCommentsByProfileId(profileId)
        ),

    create: (profileId: string, data: CreateGuestbookCommentDto) =>
        callOrMock(
            () => apiRequest<GuestbookCommentDto>(`/profiles/${encodeURIComponent(profileId)}/guestbook-comments`, { method: "POST", body: data }),
            () => {
                let currentUser = MOCK_CURRENT_USER;
                if (typeof window !== "undefined") {
                    const token = localStorage.getItem("token") || "";
                    if (token.startsWith("mock_token_")) {
                        const targetId = token.replace("mock_token_", "");
                        currentUser = getMockUserById(targetId);
                    }
                }
                const newComment = {
                    id: `gb-${Date.now()}`,
                    profileId,
                    authorId: currentUser.id,
                    author: {
                        id: currentUser.id,
                        username: currentUser.username,
                        displayName: currentUser.displayName || currentUser.name,
                        name: currentUser.displayName || currentUser.name,
                        avatarUrl: currentUser.avatarUrl || currentUser.avatar,
                        avatar: currentUser.avatarUrl || currentUser.avatar,
                    },
                    authorName: currentUser.displayName || currentUser.name,
                    authorUsername: currentUser.username,
                    authorAvatar: currentUser.avatarUrl || currentUser.avatar,
                    content: data.content,
                    likes: 0,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };
                addMockGuestbookComment(profileId, newComment);
                return newComment;
            }
        ),

    update: (profileId: string, id: string, data: UpdateGuestbookCommentDto) =>
        callOrMock(
            () => apiRequest<GuestbookCommentDto>(`/profiles/${encodeURIComponent(profileId)}/guestbook-comments/${encodeURIComponent(id)}`, { method: "PATCH", body: data }),
            { id, authorId: "user-me", content: data.content, createdAt: new Date().toISOString(), likes: 0 }
        ),

    like: (profileId: string, id: string) =>
        callOrMock(
            () => apiRequest<{ message?: string; success?: boolean }>(`/profiles/${encodeURIComponent(profileId)}/guestbook-comments/${encodeURIComponent(id)}/like`, { method: "PATCH" }),
            { message: "Liked", success: true }
        ),

    delete: (profileId: string, id: string) =>
        callOrMock(
            () => apiRequest<void>(`/profiles/${encodeURIComponent(profileId)}/guestbook-comments/${encodeURIComponent(id)}`, { method: "DELETE" }),
            undefined
        ),
};

// =========================================================================
// 15. BOOKMARKS SERVICES (/bookmarks/*)
// =========================================================================
export const bookmarksApi = {
    create: (data: CreateBookmarkDto) =>
        callOrMock(
            () => apiRequest<BookmarkDto>("/bookmarks", { method: "POST", body: data }),
            { id: `bm-${Date.now()}`, userId: "user-me", targetType: data.targetType, targetId: data.targetId, createdAt: new Date().toISOString() }
        ),

    getAll: () =>
        callOrMock(
            () => apiRequest<BookmarkDto[]>("/bookmarks", { method: "GET" }),
            MOCK_BOOKMARKS
        ),

    getMyBookmarks: () =>
        bookmarksApi.getAll(),

    check: (params: CheckBookmarkParams) =>
        callOrMock(
            () => apiRequest<{ bookmarked: boolean; id?: string }>("/bookmarks/check", { method: "GET", params }),
            () => {
                const found = MOCK_BOOKMARKS.find((b) => b.targetType === params.targetType && b.targetId === params.targetId);
                return { bookmarked: !!found, id: found?.id };
            }
        ),

    toggle: (data?: { targetType?: string; targetId?: string }) =>
        callOrMock(
            () => apiRequest<{ bookmarked: boolean; id?: string }>("/bookmarks/toggle", { method: "POST", body: data }),
            { bookmarked: true, id: `bm-${Date.now()}` }
        ),

    deleteById: (id: string) =>
        callOrMock(
            () => apiRequest<void>(`/bookmarks/${encodeURIComponent(id)}`, { method: "DELETE" }),
            undefined
        ),

    delete: (targetType: BookmarkTargetType, targetId: string) =>
        callOrMock(
            () => apiRequest<void>(`/bookmarks/${encodeURIComponent(targetType)}/${encodeURIComponent(targetId)}`, { method: "DELETE" }),
            undefined
        ),
};

// =========================================================================
// 16. LIBRARY GAMES SERVICES (/library-games/*)
// =========================================================================
export const libraryGamesApi = {
    getByUserId: (userId: string) =>
        callOrMock(
            () => apiRequest<LibraryGameDto[]>(`/users/${encodeURIComponent(userId)}/library-games`, { method: "GET" }),
            MOCK_GAMES.map((g) => ({
                id: `lib-${g.id}`,
                userId,
                appid: g.appid || 730,
                name: g.name,
                coverUrl: g.coverUrl,
                playtimeMinutes: 1200,
                playtimeTwoWeeksMinutes: 180,
                lastPlayedAt: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }))
        ),

    getMyLibrary: () =>
        libraryGamesApi.getByUserId("user-me"),

    getById: (id: string) =>
        callOrMock(
            () => apiRequest<LibraryGameDto>(`/library-games/${encodeURIComponent(id)}`, { method: "GET" }),
            () => libraryGamesApi.getByUserId("user-me").then((list) => list[0])
        ),

    create: (data: CreateLibraryGameDto) =>
        callOrMock(
            () => apiRequest<LibraryGameDto>("/library-games", { method: "POST", body: data }),
            { id: `lib-${Date.now()}`, userId: "user-me", appid: data.appid, playtimeMinutes: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        ),

    sync: (data?: Record<string, unknown>) =>
        callOrMock(
            () => apiRequest<unknown>("/library-games/sync", { method: "POST", body: data || {} }),
            { success: true, message: "Library synchronized" }
        ),

    update: (id: string, data: UpdateLibraryGameDto) =>
        callOrMock(
            () => apiRequest<LibraryGameDto>(`/library-games/${encodeURIComponent(id)}`, { method: "PATCH", body: data }),
            { id, userId: "user-me", appid: 730, ...data, updatedAt: new Date().toISOString() }
        ),

    delete: (id: string) =>
        callOrMock(
            () => apiRequest<void>(`/library-games/${encodeURIComponent(id)}`, { method: "DELETE" }),
            undefined
        ),
};

// =========================================================================
// 17. FRIENDSHIP SERVICES (/friendships/*)
// =========================================================================
export const friendshipsApi = {
    sendRequest: (data: CreateFriendshipRequestDto) =>
        callOrMock(
            () => apiRequest<FriendshipDto>("/friendships/requests", { method: "POST", body: data }),
            { id: `fr-${Date.now()}`, requesterId: "user-me", addresseeId: data.targetUserId, status: "pending", createdAt: new Date().toISOString() }
        ),

    acceptRequest: (id: string) =>
        callOrMock(
            () => apiRequest<FriendshipDto>(`/friendships/${encodeURIComponent(id)}/accept`, { method: "PATCH" }),
            { id, requesterId: "user-1", addresseeId: "user-me", status: "accepted", createdAt: new Date().toISOString() }
        ),

    rejectRequest: (id: string) =>
        callOrMock(
            () => apiRequest<{ message?: string }>(`/friendships/${encodeURIComponent(id)}/reject`, { method: "PATCH" }),
            { message: "Friend request rejected" }
        ),

    cancelRequest: (id: string) =>
        callOrMock(
            () => apiRequest<void>(`/friendships/${encodeURIComponent(id)}/request`, { method: "DELETE" }),
            undefined
        ),

    unfriend: (id: string) =>
        callOrMock(
            () => apiRequest<void>(`/friendships/${encodeURIComponent(id)}/unfriend`, { method: "DELETE" }),
            undefined
        ),

    block: (targetUserId: string) =>
        callOrMock(
            () => apiRequest<FriendshipDto>(`/friendships/block/${encodeURIComponent(targetUserId)}`, { method: "POST" }),
            { id: `blk-${Date.now()}`, requesterId: "user-me", addresseeId: targetUserId, status: "blocked", createdAt: new Date().toISOString() }
        ),

    unblock: (id: string) =>
        callOrMock(
            () => apiRequest<void>(`/friendships/${encodeURIComponent(id)}/unblock`, { method: "DELETE" }),
            undefined
        ),

    unblockUser: (targetUserId: string) =>
        callOrMock(
            () => apiRequest<void>(`/friendships/block/${encodeURIComponent(targetUserId)}`, { method: "DELETE" }),
            undefined
        ),

    checkStatus: (targetUserId: string) =>
        callOrMock(
            () => apiRequest<FriendshipStatusDto>(`/friendships/status/${encodeURIComponent(targetUserId)}`, { method: "GET" }),
            { status: "friends", isFriend: true, isBlocked: false, isPending: false }
        ),

    getFriends: () =>
        callOrMock(
            () => apiRequest<UserProfileDto[]>("/friendships/friends", { method: "GET" }),
            MOCK_USERS.filter((u) => u.isFriend)
        ),

    getIncomingRequests: () =>
        callOrMock(
            () => apiRequest<FriendshipDto[]>("/friendships/requests/incoming", { method: "GET" }),
            []
        ),

    getOutgoingRequests: () =>
        callOrMock(
            () => apiRequest<FriendshipDto[]>("/friendships/requests/outgoing", { method: "GET" }),
            []
        ),

    getBlocked: () =>
        callOrMock(
            () => apiRequest<FriendshipDto[]>("/friendships/blocked", { method: "GET" }),
            []
        ),
};

// =========================================================================
// 18. SEARCH API (/search)
// =========================================================================
export const searchApi = {
    search: <T = unknown>(params: import("./types").SearchParams) =>
        callOrMock(
            () => apiRequest<T>("/search", { method: "GET", params: sanitizePaginationParams(params, 50) }),
            () => {
                const q = (params.q || "").toLowerCase().trim();
                const games = MOCK_GAME_DTOS.filter((g) => g.name.toLowerCase().includes(q));
                const communities = MOCK_COMMUNITY_DTOS.filter((c) => c.name.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q));
                const posts = MOCK_POST_DTOS.filter((p) => p.title?.toLowerCase().includes(q) || p.content.toLowerCase().includes(q));
                const users = MOCK_USERS.filter((u) => u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q));

                if (params.type === "game") return games as unknown as T;
                if (params.type === "community") return communities as unknown as T;
                if (params.type === "post") return posts as unknown as T;
                if (params.type === "profile") return users as unknown as T;

                return {
                    games: games.slice(0, 5),
                    communities: communities.slice(0, 5),
                    posts: posts.slice(0, 5),
                    users: users.slice(0, 5),
                    total: games.length + communities.length + posts.length + users.length,
                } as unknown as T;
            }
        ),

    searchGames: (query: string, page?: number, limit?: number) =>
        searchApi.search({ q: query, type: "game", page, limit }),

    searchCommunities: (query: string, page?: number, limit?: number) =>
        searchApi.search({ q: query, type: "community", page, limit }),

    searchProfiles: (query: string, page?: number, limit?: number) =>
        searchApi.search({ q: query, type: "profile", page, limit }),

    searchPosts: (query: string, page?: number, limit?: number) =>
        searchApi.search({ q: query, type: "post", page, limit }),

    globalSearch: (query: string, limit = 5) =>
        searchApi.search({ q: query, limit }),
};

// =========================================================================
// 19. NOTIFICATIONS API (/notifications/*)
// =========================================================================
export const notificationsApi = {
    getAll: (params?: { userId?: string; page?: number; limit?: number }) =>
        callOrMock(
            () => apiRequest<NotificationDto[] | { items: NotificationDto[]; total?: number }>("/notifications", { method: "GET", params }),
            () => ({ items: MOCK_NOTIFICATIONS, data: MOCK_NOTIFICATIONS, total: MOCK_NOTIFICATIONS.length })
        ),

    create: (data: CreateNotificationDto) =>
        callOrMock(
            () => apiRequest<NotificationDto>("/notifications", { method: "POST", body: data }),
            { id: `notif-${Date.now()}`, userId: data.userId, title: data.title, message: data.message, type: data.type || "system", read: false, createdAt: new Date().toISOString() }
        ),

    markAsRead: (id: string) =>
        callOrMock(
            () => apiRequest<void>(`/notifications/${encodeURIComponent(id)}/read`, { method: "PUT" }),
            undefined
        ),

    markAllAsRead: () =>
        callOrMock(
            () => apiRequest<void>("/notifications/read-all", { method: "PUT" }),
            undefined
        ),

    delete: (id: string) =>
        callOrMock(
            () => apiRequest<void>(`/notifications/${encodeURIComponent(id)}`, { method: "DELETE" }),
            undefined
        ),

    getUnreadCount: () =>
        callOrMock(
            () => apiRequest<{ count: number }>("/notifications/unread-count", { method: "GET" }),
            { count: MOCK_NOTIFICATIONS.filter((n) => !n.read).length }
        ),
};

// =========================================================================
// 20. STORAGE SERVICES (/storage/*)
// =========================================================================
export const storageApi = {
    getPresignedUrl: (data: { type: import("../utils/image-processor").UploadType; originalSize: number; originalMimeType: string; postId?: string }) =>
        callOrMock(
            () => apiRequest<{ presignedUrl: string; fileKey: string }>("/storage/presigned-url", { method: "POST", body: data }),
            { presignedUrl: "https://mock-storage.indieg.local/upload", fileKey: `mock_file_${Date.now()}` }
        ),

    deleteFile: (fileKey: string) =>
        callOrMock(
            () => apiRequest<{ message?: string; success?: boolean }>(`/storage/file/${encodeURIComponent(fileKey)}`, { method: "DELETE" }),
            { message: "File deleted", success: true }
        ),

    confirmUpload: (data: { fileKey: string; type?: string; entityId?: string }) =>
        callOrMock(
            () => apiRequest<{ message?: string; success?: boolean; url?: string }>("/storage/confirm", { method: "POST", body: data }),
            { message: "Upload confirmed", success: true, url: `https://mock-storage.indieg.local/${data.fileKey}` }
        ),

    uploadImageToR2: (options: import("../services/upload-service").UploadOptions) =>
        import("../services/upload-service").then((m) => m.uploadImageToR2(options)),
};

export {
    uploadImageToR2,
    requestPresignedUrl,
    uploadToR2Bucket,
    confirmUploadWithBackend,
    getStoredToken,
    type UploadOptions,
    type UploadImageResult,
    type PresignedUrlPayload,
    type PresignedUrlResponse,
} from "../services/upload-service";
export { processImagePipeline, type UploadType, type ProcessedImageResult, MAX_IMAGE_SIZES, ALLOWED_IMAGE_MIMES, validateImageFile } from "../utils/image-processor";
