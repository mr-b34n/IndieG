import { apiRequest, performTokenRefresh, isTokenExpired, getTokenExp } from "./client";
export { performTokenRefresh, isTokenExpired, getTokenExp };
import {
    type AuthRegisterDto,
    type AuthLoginDto,
    type AuthForgotPasswordDto,
    type AuthResetPasswordDto,
    type AuthResendVerificationDto,
    type AuthLoginResponse,
    type UserProfileDto,
    type UpdateProfileDto,
    type CheckUsernameResponseDto,
    type UserSessionDto,
    type UserSessionsResponseDto,
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
    type UnifiedGameDetailDto,
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
    type GetCommunitiesParams,
    type RootCommentsResponse,
    type GetReportsParams,
    type SearchParams,
    type CommunityStatsDto,
    type CommunityModerationLogDto,
    type CommunityModerationLogsResponseDto,
    type UserSettingsDto,
    type UpdateUserSettingsDto,
} from "./types";

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

/**
 * Detects junk/generic test communities generated by automated test scripts
 */
export function isGenericTestCommunity(c: { name?: string; description?: string } | null | undefined): boolean {
    if (!c || !c.name) return true;
    const name = c.name.trim();

    const testPatterns = [
        /^(report|comment|lifecycle|sample)\s*community/i,
        /^community\s*(public|private)\s*\d+/i,
        /^test\s*(vote|post)?\s*community/i,
        /^(temp|dummy|placeholder)\s*community/i,
        /community\s*\d{4,}/i,
    ];

    return testPatterns.some((pattern) => pattern.test(name));
}

/** Safely extract CommunityDto array from various API response shapes */
export function extractCommunityList(res: unknown): CommunityDto[] {
    let list: CommunityDto[] = [];
    if (!res) return [];
    if (Array.isArray(res)) {
        list = res as CommunityDto[];
    } else if (typeof res === "object" && res !== null) {
        const obj = res as Record<string, unknown>;
        if (Array.isArray(obj.data)) list = obj.data as CommunityDto[];
        else if (Array.isArray(obj.items)) list = obj.items as CommunityDto[];
        else if (obj.data && typeof obj.data === "object") {
            const nested = obj.data as Record<string, unknown>;
            if (Array.isArray(nested.data)) list = nested.data as CommunityDto[];
            else if (Array.isArray(nested.items)) list = nested.items as CommunityDto[];
        }
        else if (Array.isArray(obj.communities)) list = obj.communities as CommunityDto[];
        else if (Array.isArray(obj.result)) list = obj.result as CommunityDto[];
    }
    return list.filter((c) => !isGenericTestCommunity(c));
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

/** Safely extract UserProfileDto from various API response shapes ({ success: true, user: ... }, { data: ... }, flat entity) */
export function extractUserProfile(res: unknown): UserProfileDto | null {
    if (!res || typeof res !== "object") return null;
    const obj = res as Record<string, unknown>;
    if (obj.user && typeof obj.user === "object" && obj.user !== null) {
        return obj.user as UserProfileDto;
    }
    if (obj.data && typeof obj.data === "object" && obj.data !== null && !Array.isArray(obj.data)) {
        return obj.data as UserProfileDto;
    }
    if ("id" in obj || "username" in obj) {
        return obj as unknown as UserProfileDto;
    }
    return null;
}

/** Safely extract UserProfileDto array from various API response shapes */
export function extractProfileList(res: unknown): UserProfileDto[] {
    if (!res) return [];
    if (Array.isArray(res)) return res as UserProfileDto[];
    if (typeof res === "object" && res !== null) {
        const obj = res as Record<string, unknown>;
        if (Array.isArray(obj.data)) return obj.data as UserProfileDto[];
        if (Array.isArray(obj.items)) return obj.items as UserProfileDto[];
        if (Array.isArray(obj.profiles)) return obj.profiles as UserProfileDto[];
        if (Array.isArray(obj.users)) return obj.users as UserProfileDto[];
        if (obj.data && typeof obj.data === "object") {
            const nested = obj.data as Record<string, unknown>;
            if (Array.isArray(nested.data)) return nested.data as UserProfileDto[];
            if (Array.isArray(nested.items)) return nested.items as UserProfileDto[];
        }
    }
    return [];
}


// =========================================================================
// 1. AUTH SERVICES (/auth/*)
// =========================================================================
export const authApi = {
    register: (data: AuthRegisterDto) =>
        apiRequest<AuthLoginResponse>("/auth/register", { method: "POST", body: data }),

    verifyEmail: (data: string | { token: string }) => {
        const token = typeof data === "string" ? data : data.token;
        return apiRequest<{ message?: string }>("/auth/verify-email", { method: "GET", params: { token } });
    },

    login: (data: AuthLoginDto) =>
        apiRequest<AuthLoginResponse>("/auth/login", { method: "POST", body: data }),

    logout: () =>
        apiRequest<{ message?: string }>("/auth/logout", { method: "POST" }),

    me: () =>
        apiRequest<UserProfileDto>("/auth/me", { method: "GET" }),

    googleLogin: (data: AuthGoogleLoginDto) =>
        apiRequest<AuthLoginResponse>("/auth/google", { method: "POST", body: data }),

    changePassword: (data: ChangePasswordDto) =>
        apiRequest<{ message?: string }>("/auth/change-password", { method: "POST", body: data }),

    forgotPassword: (data: AuthForgotPasswordDto) =>
        apiRequest<{ message?: string }>("/auth/forgot-password", { method: "POST", body: data }),

    resetPassword: (data: AuthResetPasswordDto) =>
        apiRequest<{ message?: string }>("/auth/reset-password", { method: "POST", body: data }),

    refresh: () =>
        performTokenRefresh().then((token) => ({ accessToken: token || undefined, token: token || undefined })),

    refreshToken: (data?: { refreshToken: string }) =>
        performTokenRefresh(data?.refreshToken).then((token) => ({ accessToken: token || "" })),

    resendVerification: (data: AuthResendVerificationDto) =>
        apiRequest<{ message?: string }>("/auth/resend-verification", { method: "POST", body: data }),
};

// =========================================================================
// 2. USER & SESSION SERVICES (/users/*)
// =========================================================================
export const usersApi = {
    getAll: () =>
        apiRequest<UserProfileDto[]>("/users", { method: "GET" }),

    getById: (id: string) =>
        apiRequest<UserProfileDto>(`/users/${encodeURIComponent(id)}`, { method: "GET" }),

    getSessions: (type?: "active" | "history") =>
        apiRequest<UserSessionDto[] | UserSessionsResponseDto>("/users/sessions", {
            method: "GET",
            params: type ? { type } : undefined,
        }),

    revokeSession: async (sessionId: string) => {
        try {
            return await apiRequest<{ message?: string }>(`/users/revoke-session/${encodeURIComponent(sessionId)}`, { method: "PATCH" });
        } catch {
            return await apiRequest<{ message?: string }>(`/users/sessions/${encodeURIComponent(sessionId)}`, { method: "DELETE" });
        }
    },

    revokeAllSessions: () =>
        apiRequest<{ message?: string }>("/users/sessions", { method: "DELETE" }),

    changePassword: (data: ChangePasswordDto) =>
        apiRequest<{ message?: string }>("/users/change-password", { method: "PATCH", body: data }),

    deleteAccount: () =>
        apiRequest<{ message?: string }>("/users/me", { method: "DELETE" }),

    getSettings: () =>
        apiRequest<UserSettingsDto>("/users/me/settings", { method: "GET" }),

    updateSettings: (data: UpdateUserSettingsDto) =>
        apiRequest<UserSettingsDto>("/users/me/settings", { method: "PATCH", body: data }),
};

// =========================================================================
// 3. PROFILE SERVICES (/profiles/*)
// =========================================================================
export const profilesApi = {
    getMe: async (): Promise<UserProfileDto> => {
        const raw = await apiRequest<unknown>("/profiles/me", { method: "GET" });
        return extractUserProfile(raw) || (raw as UserProfileDto);
    },

    getMyProfile: () => profilesApi.getMe(),

    getByUsername: async (username: string): Promise<UserProfileDto> => {
        const clean = username.trim().replace(/^@+/, "");
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clean);

        if (isUuid) {
            const raw = await apiRequest<unknown>(`/profiles/${encodeURIComponent(clean)}`, { method: "GET" });
            const extracted = extractUserProfile(raw);
            if (extracted) return extracted;
            return raw as UserProfileDto;
        }

        try {
            const raw = await apiRequest<unknown>(
                `/profiles/@${encodeURIComponent(clean)}`,
                { method: "GET" }
            );
            if (raw && typeof raw === "object") {
                const obj = raw as Record<string, unknown>;
                if (Array.isArray(obj.data)) {
                    const match = (obj.data as UserProfileDto[]).find(
                        (p) => p.username?.toLowerCase() === clean.toLowerCase()
                    ) || obj.data[0];
                    if (match) return match as UserProfileDto;
                }
            }
            const extracted = extractUserProfile(raw);
            if (extracted) return extracted;
        } catch {
            // Ignore error
        }

        throw new Error(`Profile not found for username: ${username}`);
    },

    getUserByUsername: (username: string) => profilesApi.getByUsername(username),

    getById: async (id: string): Promise<UserProfileDto> => {
        const raw = await apiRequest<unknown>(`/profiles/${encodeURIComponent(id)}`, { method: "GET" });
        const extracted = extractUserProfile(raw);
        if (extracted) return extracted;
        return raw as UserProfileDto;
    },

    getAll: async (params?: { page?: number; limit?: number }): Promise<UserProfileDto[]> => {
        const raw = await apiRequest<unknown>("/profiles", { method: "GET", params: sanitizePaginationParams(params) });
        return extractProfileList(raw);
    },

    search: async (query: string, page = 1, limit = 10): Promise<UserProfileDto[]> => {
        const raw = await apiRequest<unknown>("/profiles/search", { method: "GET", params: { q: query, page, limit } });
        return extractProfileList(raw);
    },

    updateMe: async (data: UpdateProfileDto): Promise<UserProfileDto> => {
        const raw = await apiRequest<unknown>("/profiles/me", { method: "PATCH", body: data });
        return extractUserProfile(raw) || (raw as UserProfileDto);
    },

    updateMyProfile: (data: UpdateProfileDto) =>
        profilesApi.updateMe(data),

    deleteMe: () =>
        apiRequest<{ message?: string }>("/profiles/me", { method: "DELETE" }),

    deleteUser: (id: string) =>
        apiRequest<void>(`/profiles/${encodeURIComponent(id)}`, { method: "DELETE" }),

    toggleArchived: () =>
        apiRequest<{ message?: string; archived?: boolean }>("/profiles/archived", { method: "PATCH" }),

    checkUsername: (username: string) =>
        apiRequest<CheckUsernameResponseDto>("/profiles/check-username", {
            method: "GET",
            params: { username },
        }),
};

// =========================================================================
// 4. COMMUNITIES SERVICES (/communities/*)
// =========================================================================
export const communitiesApi = {
    create: (data: CreateCommunityDto) =>
        apiRequest<CommunityDto>("/communities", { method: "POST", body: data }),

    getAll: (params?: GetCommunitiesParams) =>
        apiRequest<CommunityDto[] | { items: CommunityDto[]; total?: number }>("/communities", {
                method: "GET",
                params: sanitizePaginationParams(params, 50),
            }),

    getFeatured: () =>
        apiRequest<CommunityDto[]>("/communities/featured", { method: "GET" }),

    getPopular: () =>
        apiRequest<CommunityDto[]>("/communities/popular", { method: "GET" }),

    getRecent: () =>
        apiRequest<CommunityDto[]>("/communities/recent", { method: "GET" }),

    getMyCommunities: () =>
        apiRequest<CommunityDto[]>("/communities/my", { method: "GET" }),

    getById: (id: string) =>
        apiRequest<CommunityDto>(`/communities/${encodeURIComponent(id)}`, { method: "GET" }),

    getBySlug: (slug: string) =>
        apiRequest<CommunityDto>(`/communities/slug/${encodeURIComponent(slug)}`, { method: "GET" }),

    update: (id: string, data: UpdateCommunityDto) =>
        apiRequest<CommunityDto>(`/communities/${encodeURIComponent(id)}`, { method: "PATCH", body: data }),

    delete: (id: string) =>
        apiRequest<void>(`/communities/${encodeURIComponent(id)}`, { method: "DELETE" }),

    getStats: (id: string) =>
        apiRequest<CommunityStatsDto>(`/communities/${encodeURIComponent(id)}/stats`, { method: "GET" }),

    suspend: (id: string) =>
        apiRequest<CommunityDto>(`/communities/${encodeURIComponent(id)}/suspend`, { method: "PATCH" }),

    archive: (id: string) =>
        apiRequest<CommunityDto>(`/communities/${encodeURIComponent(id)}/archive`, { method: "PATCH" }),

    reactivate: (id: string) =>
        apiRequest<CommunityDto>(`/communities/${encodeURIComponent(id)}/reactivate`, { method: "PATCH" }),

    join: (id: string) => communityMembersApi.join(id),
    leave: (id: string) => communityMembersApi.leave(id),
};

// =========================================================================
// 5. COMMUNITY MEMBERS SERVICES (/communities/{id}/members/*)
// =========================================================================
export const communityMembersApi = {
    getMembers: (communityId: string, params?: GetCommunityMembersParams) =>
        apiRequest<CommunityMembersResponseDto | CommunityMemberDto[]>(
                `/communities/${encodeURIComponent(communityId)}/members`,
                { method: "GET", params: sanitizePaginationParams(params, 50) }
            ),

    searchMembers: (communityId: string, params: SearchCommunityMembersParams) =>
        apiRequest<CommunityMemberDto[]>(
                `/communities/${encodeURIComponent(communityId)}/members/search`,
                { method: "GET", params: sanitizePaginationParams(params, 50) }
            ),

    // Alias for search
    search: (communityId: string, params: SearchCommunityMembersParams) =>
        communityMembersApi.searchMembers(communityId, params),

    getPendingMembers: (communityId: string, params?: GetCommunityMembersParams) =>
        apiRequest<CommunityMembersResponseDto | CommunityMemberDto[]>(
                `/communities/${encodeURIComponent(communityId)}/members/pending`,
                { method: "GET", params: sanitizePaginationParams(params, 50) }
            ),

    getModerationLogs: (communityId: string, params?: { page?: number; limit?: number }) =>
        apiRequest<CommunityModerationLogsResponseDto>(
                `/communities/${encodeURIComponent(communityId)}/members/moderation-logs`,
                { method: "GET", params: sanitizePaginationParams(params, 50) }
            ),

    approveJoinRequest: (communityId: string, memberId?: string, _data?: unknown) =>
        apiRequest<{ message?: string; success?: boolean }>(
                `/communities/${encodeURIComponent(communityId)}/members/${encodeURIComponent(memberId || "")}/approve`,
                { method: "PATCH" }
            ),

    rejectJoinRequest: (communityId: string, memberId?: string, _data?: unknown) =>
        apiRequest<{ message?: string; success?: boolean }>(
                `/communities/${encodeURIComponent(communityId)}/members/${encodeURIComponent(memberId || "")}/reject`,
                { method: "PATCH" }
            ),

    approveMember: (communityId: string, memberId?: string, data?: unknown) =>
        communityMembersApi.approveJoinRequest(communityId, memberId, data),

    rejectMember: (communityId: string, memberId?: string, data?: unknown) =>
        communityMembersApi.rejectJoinRequest(communityId, memberId, data),

    me: (communityId: string) =>
        apiRequest<{ role?: string; status?: string; userId?: string; communityId?: string }>(
                `/communities/${encodeURIComponent(communityId)}/members/me`,
                { method: "GET" }
            ),

    getMyRole: (communityId: string) =>
        apiRequest<{ role: string; status: string }>(
                `/communities/${encodeURIComponent(communityId)}/members/me`,
                { method: "GET" }
            ),

    getBannedMembers: (communityId: string) =>
        apiRequest<CommunityMemberDto[]>(
                `/communities/${encodeURIComponent(communityId)}/members/banned`,
                { method: "GET" }
            ),

    getMutedMembers: (communityId: string) =>
        apiRequest<CommunityMemberDto[]>(
                `/communities/${encodeURIComponent(communityId)}/members/muted`,
                { method: "GET" }
            ),

    sendInvite: (communityId: string, data: CreateCommunityInviteDto) =>
        apiRequest<CommunityInviteDto>(
                `/communities/${encodeURIComponent(communityId)}/members/invites`,
                { method: "POST", body: data }
            ),

    getInvites: (communityId: string) =>
        apiRequest<CommunityInviteDto[]>(
                `/communities/${encodeURIComponent(communityId)}/members/invites`,
                { method: "GET" }
            ),

    join: (communityId: string) =>
        apiRequest<{ message?: string; joined?: boolean }>(
                `/communities/${encodeURIComponent(communityId)}/members`,
                { method: "POST" }
            ),

    leave: (communityId: string) =>
        apiRequest<{ message?: string; joined?: boolean }>(
                `/communities/${encodeURIComponent(communityId)}/members`,
                { method: "PATCH" }
            ),

    assignRole: (communityId: string, memberId: string, role: string) =>
        apiRequest<CommunityMemberDto>(
                `/communities/${encodeURIComponent(communityId)}/members/${encodeURIComponent(memberId)}/role`,
                { method: "PATCH", body: { role } }
            ),

    // Alias for role change
    changeRole: (communityId: string, memberId: string, role: string) =>
        communityMembersApi.assignRole(communityId, memberId, role),

    performAction: (communityId: string, data: CommunityMemberActionDto) =>
        apiRequest<{ message?: string; success?: boolean }>(
                `/communities/${encodeURIComponent(communityId)}/members/actions`,
                { method: "POST", body: data }
            ),

    kickMember: (communityId: string, memberId: string, reason?: string) =>
        apiRequest<{ message?: string; success?: boolean }>(
                `/communities/${encodeURIComponent(communityId)}/members/${encodeURIComponent(memberId)}/kick`,
                { method: "PATCH", body: reason ? { reason } : undefined }
            ),

    banMember: (communityId: string, memberId: string, dataOrReason?: string | { reason?: string; durationMinutes?: number }) => {
        const body = typeof dataOrReason === "string" ? { reason: dataOrReason } : dataOrReason;
        return apiRequest<{ message?: string; success?: boolean }>(
                `/communities/${encodeURIComponent(communityId)}/members/${encodeURIComponent(memberId)}/ban`,
                { method: "PATCH", body }
            );
    },

    unbanMember: (communityId: string, memberId: string, reason?: string) =>
        apiRequest<{ message?: string; success?: boolean }>(
                `/communities/${encodeURIComponent(communityId)}/members/${encodeURIComponent(memberId)}/unban`,
                { method: "PATCH", body: reason ? { reason } : undefined }
            ),

    muteMember: (communityId: string, memberId: string, muteMinutesOrData?: number | { muteMinutes?: number; durationMinutes?: number }) => {
        let muteMinutes: number | undefined;
        if (typeof muteMinutesOrData === "number") {
            muteMinutes = muteMinutesOrData;
        } else if (muteMinutesOrData) {
            muteMinutes = muteMinutesOrData.muteMinutes ?? muteMinutesOrData.durationMinutes;
        }
        return apiRequest<{ message?: string; success?: boolean }>(
                `/communities/${encodeURIComponent(communityId)}/members/${encodeURIComponent(memberId)}/mute`,
                { method: "PATCH", body: muteMinutes ? { muteMinutes } : {} }
            );
    },

    unmuteMember: (communityId: string, memberId: string) =>
        apiRequest<{ message?: string; success?: boolean }>(
                `/communities/${encodeURIComponent(communityId)}/members/${encodeURIComponent(memberId)}/unmute`,
                { method: "PATCH" }
            ),

    transferOwnership: (communityId: string, newOwnerIdOrData: string | { newOwnerId: string }) =>
        apiRequest<{ message?: string; success?: boolean }>(
                `/communities/${encodeURIComponent(communityId)}/members/transfer-ownership`,
                { method: "PATCH", body: typeof newOwnerIdOrData === "string" ? { newOwnerId: newOwnerIdOrData } : newOwnerIdOrData }
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
        apiRequest<PostDto[] | { items: PostDto[]; total?: number }>("/posts", {
                method: "GET",
                params: sanitizePaginationParams(params, 50),
            }),

    getFeed: (params?: { page?: number; limit?: number; tab?: string }) =>
        apiRequest<PostDto[] | { items: PostDto[]; total?: number }>("/posts/feed", {
                method: "GET",
                params: sanitizePaginationParams(params, 50),
            }),

    getByCommunity: (communityId: string, params?: { page?: number; limit?: number }) =>
        apiRequest<PostDto[] | { items: PostDto[]; total?: number }>(
                `/posts/community/${encodeURIComponent(communityId)}`,
                { method: "GET", params: sanitizePaginationParams(params, 50) }
            ),

    getByAuthor: (authorId: string, params?: { page?: number; limit?: number }) =>
        apiRequest<PostDto[] | { items: PostDto[]; total?: number }>(
                `/posts/author/${encodeURIComponent(authorId)}`,
                { method: "GET", params: sanitizePaginationParams(params, 50) }
            ),

    getOne: (id: string | number) =>
        apiRequest<PostDto>(`/posts/${encodeURIComponent(String(id))}`, { method: "GET" }),

    getPostById: (id: string | number) =>
        apiRequest<PostDto>(`/posts/${encodeURIComponent(String(id))}`, { method: "GET" }),

    getById: (id: string | number) =>
        apiRequest<PostDto>(`/posts/${encodeURIComponent(String(id))}`, { method: "GET" }),

    create: (data: CreatePostDto) =>
        apiRequest<PostDto>("/posts", { method: "POST", body: data }),

    createPost: (data: CreatePostDto) =>
        apiRequest<PostDto>("/posts", { method: "POST", body: data }),

    update: (id: string | number, data: UpdatePostDto) =>
        apiRequest<PostDto>(`/posts/${encodeURIComponent(String(id))}`, { method: "PATCH", body: data }),

    updatePost: (id: string | number, data: UpdatePostDto) =>
        apiRequest<PostDto>(`/posts/${encodeURIComponent(String(id))}`, { method: "PATCH", body: data }),

    delete: (id: string | number) =>
        apiRequest<void>(`/posts/${encodeURIComponent(String(id))}`, { method: "DELETE" }),

    deletePost: (id: string | number) =>
        apiRequest<void>(`/posts/${encodeURIComponent(String(id))}`, { method: "DELETE" }),

    pinPost: (id: string | number) =>
        apiRequest<PostActionResponse>(`/posts/${encodeURIComponent(String(id))}/pin`, { method: "PATCH" }),

    unpinPost: (id: string | number) =>
        apiRequest<PostActionResponse>(`/posts/${encodeURIComponent(String(id))}/unpin`, { method: "PATCH" }),

    lockPost: (id: string | number) =>
        apiRequest<PostActionResponse>(`/posts/${encodeURIComponent(String(id))}/lock`, { method: "PATCH" }),

    unlockPost: (id: string | number) =>
        apiRequest<PostActionResponse>(`/posts/${encodeURIComponent(String(id))}/unlock`, { method: "PATCH" }),

    getPostVoters: (id: string | number) =>
        apiRequest<UserProfileDto[]>(`/posts/${encodeURIComponent(String(id))}/voters`, { method: "GET" }),
};

// =========================================================================
// 7. COMMENT SERVICES (/comments/*)
// =========================================================================
export const commentsApi = {
    create: (data: CreateCommentDto) =>
        apiRequest<CommentEntity>("/comments", { method: "POST", body: data }),

    getOne: (id: string) =>
        apiRequest<CommentEntity>(`/comments/${encodeURIComponent(id)}`, { method: "GET" }),

    update: (id: string, payload: { content: string }) =>
        apiRequest<CommentEntity>(`/comments/${encodeURIComponent(id)}`, { method: "PATCH", body: payload }),

    delete: (id: string) =>
        apiRequest<{ message?: string }>(`/comments/${encodeURIComponent(id)}`, { method: "DELETE" }),

    getRootComments: (params: { postId: string | number; page?: number; limit?: number }) => {
        const { postId, ...pagination } = params;
        const queryParams = sanitizePaginationParams(pagination, 50);
        return apiRequest<RootCommentsResponse>(
            `/comments/post/${encodeURIComponent(String(postId))}/root`,
            { method: "GET", params: queryParams }
        ).catch(async (err) => {
            if ((err as { status?: number })?.status === 404) {
                try {
                    return await apiRequest<RootCommentsResponse>(
                        `/comments/post/${encodeURIComponent(String(postId))}`,
                        { method: "GET", params: queryParams }
                    );
                } catch {
                    return { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } };
                }
            }
            return { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } };
        });
    },

    getReplyComments: (params: { parentId: string | number; cursor?: string; limit?: number }) =>
        apiRequest<ReplyCommentsResponse>("/comments/replies", { method: "GET", params: sanitizePaginationParams(params, 5) }),

    getReplies: (parentId: string | number, params?: { limit?: number; cursor?: string }) =>
        commentsApi.getReplyComments({ parentId, ...params }),

    pinComment: (id: string | number) =>
        apiRequest<{ message?: string; success?: boolean }>(`/comments/${encodeURIComponent(String(id))}/pin`, { method: "PATCH" }),

    unpinComment: (id: string | number) =>
        apiRequest<{ message?: string; success?: boolean }>(`/comments/${encodeURIComponent(String(id))}/unpin`, { method: "PATCH" }),

    getPostComments: (postId: string, params?: { page?: number; limit?: number }) =>
        apiRequest<CommentEntity[] | { data: CommentEntity[]; total?: number }>(
            `/comments/post/${encodeURIComponent(postId)}/root`,
            { method: "GET", params: sanitizePaginationParams(params, 50) }
        ).catch(async (err) => {
            if ((err as { status?: number })?.status === 404) {
                try {
                    return await apiRequest<CommentEntity[] | { data: CommentEntity[]; total?: number }>(
                        `/comments/post/${encodeURIComponent(postId)}`,
                        { method: "GET", params: sanitizePaginationParams(params, 50) }
                    );
                } catch {
                    return [];
                }
            }
            return [];
        }),
};

// =========================================================================
// 8. REPORT SERVICES (/reports/*)
// =========================================================================
export const reportsApi = {
    getAll: (params?: GetReportsParams) =>
        apiRequest<ReportDto[]>("/reports", { method: "GET", params: params as Record<string, unknown> }),

    create: (data: CreateReportDto) =>
        apiRequest<ReportDto>("/reports", { method: "POST", body: data }),

    getOne: (id: string) =>
        apiRequest<ReportDto>(`/reports/${encodeURIComponent(id)}`, { method: "GET" }),

    getHistory: (id: string) =>
        apiRequest<ReportHistoryItemDto[]>(`/reports/${encodeURIComponent(id)}/history`, { method: "GET" }),

    update: (id: string, reason: string) =>
        apiRequest<ReportDto>(`/reports/${encodeURIComponent(id)}`, { method: "PATCH", body: { reason } }),

    resolve: (id: string, data: ResolveReportDto | string) =>
        apiRequest<{ message?: string; success?: boolean }>(
                `/reports/${encodeURIComponent(id)}/resolve`,
                { method: "PATCH", body: typeof data === "string" ? { status: "resolved", moderatorNote: data } : data }
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
        apiRequest<{ message?: string }>(`/reports/${encodeURIComponent(id)}`, { method: "DELETE" }),
};

// =========================================================================
// 9. VOTE SERVICES (/votes/*)
// =========================================================================
export const votesApi = {
    getAll: () =>
        apiRequest<VoteDto[]>("/votes", { method: "GET" }),

    getByPost: (postId: string | number) =>
        apiRequest<VoteDto | { hasVoted?: boolean; score?: number }>(`/votes/post/${encodeURIComponent(String(postId))}`, { method: "GET" }),

    getMyPostVote: (postId: string | number) =>
        apiRequest<{ hasVoted?: boolean; voteType?: VoteType | 0; score?: number }>(`/votes/post/${encodeURIComponent(String(postId))}/me`, { method: "GET" }),

    votePost: (postId: string | number, voteType: VoteType = 1) =>
        apiRequest<{ message?: string; success?: boolean; score?: number; voteType?: VoteType }>(`/votes/post/${encodeURIComponent(String(postId))}`, { method: "POST", body: { voteType } }),

    upVotePost: (postId: string | number) =>
        votesApi.votePost(postId, 1),

    downVotePost: (postId: string | number) =>
        votesApi.votePost(postId, -1),

    deleteVotePost: (postId: string | number) =>
        apiRequest<{ message?: string; success?: boolean }>(`/votes/${encodeURIComponent(String(postId))}/post`, { method: "DELETE" }),

    getByComment: (commentId: string | number) =>
        apiRequest<VoteDto | { hasVoted?: boolean; score?: number }>(`/votes/comment/${encodeURIComponent(String(commentId))}`, { method: "GET" }),

    getMyCommentVote: (commentId: string | number) =>
        apiRequest<{ hasVoted?: boolean; voteType?: VoteType | 0; score?: number }>(`/votes/comment/${encodeURIComponent(String(commentId))}/me`, { method: "GET" }),

    voteComment: (commentId: string | number, voteType: VoteType = 1) =>
        apiRequest<{ message?: string; success?: boolean; score?: number; voteType?: VoteType }>(`/votes/comment/${encodeURIComponent(String(commentId))}`, { method: "POST", body: { voteType } }),

    upVoteComment: (commentId: string | number) =>
        votesApi.voteComment(commentId, 1),

    downVoteComment: (commentId: string | number) =>
        votesApi.voteComment(commentId, -1),

    deleteVoteComment: (commentId: string | number) =>
        apiRequest<{ message?: string; success?: boolean }>(`/votes/${encodeURIComponent(String(commentId))}/comment`, { method: "DELETE" }),
};

// =========================================================================
// 10. GAMES SERVICES (/games/*)
// =========================================================================
export const gamesApi = {
    create: (data: CreateGameDto) =>
        apiRequest<GameDto>("/games", { method: "POST", body: data }),

    getAll: (params?: GetGamesParams) =>
        apiRequest<GameDto[] | { items: GameDto[]; total?: number }>("/games", { method: "GET", params: sanitizePaginationParams(params, 50) }),

    getFeatured: () =>
        apiRequest<GameDto[]>("/games/featured", { method: "GET" }),

    getPopular: () =>
        apiRequest<GameDto[]>("/games/popular", { method: "GET" }),

    getRecent: () =>
        apiRequest<GameDto[]>("/games/recent", { method: "GET" }),

    syncSteam: (appid: number | string) =>
        apiRequest<SteamSyncResponse>(`/games/${encodeURIComponent(String(appid))}/sync-steam`, { method: "POST" }),

    search: (q: string, page = 1, limit = 20) =>
        apiRequest<{ data: (GameDto | SteamSearchResultDto)[]; total: number; page: number; limit: number }>("/games/search", { method: "GET", params: { q, page, limit } }),

    searchSteam: (q: string) =>
        apiRequest<SteamSearchResultDto[]>("/games/search/steam", { method: "GET", params: { q } }),

    searchForFeed: (q: string, page = 1, limit = 20) =>
        apiRequest<{ data: SteamSearchResultDto[]; total: number; page: number; limit: number }>("/games/search/feed", { method: "GET", params: { q, page, limit } }),

    importSteamSearch: (q: string) =>
        apiRequest<GameDto | GameDto[]>("/games/search/steam/import", { method: "POST", params: { q } }),

    importByAppid: (appid: number | string) =>
        apiRequest<GameDto>(`/games/${encodeURIComponent(String(appid))}/import`, { method: "POST" }),

    getUnifiedDetail: (appid: number | string) =>
        apiRequest<UnifiedGameDetailDto>(`/games/${encodeURIComponent(String(appid))}/unified`, { method: "GET" }),

    getExternalData: (appid: number | string) =>
        apiRequest<ExternalGameDataDto>(`/games/${encodeURIComponent(String(appid))}/external`, { method: "GET" }),

    refreshExternalData: (appid: number | string) =>
        apiRequest<ExternalGameDataDto | { message?: string; success?: boolean }>(`/games/${encodeURIComponent(String(appid))}/external/refresh`, { method: "POST" }),

    getBySlug: (slug: string) =>
        apiRequest<GameDto>(`/games/slug/${encodeURIComponent(slug)}`, { method: "GET" }),

    getByAppid: (appid: number | string) =>
        apiRequest<GameDto>(`/games/${encodeURIComponent(String(appid))}`, { method: "GET" }),

    update: (appid: number | string, data: UpdateGameDto) =>
        apiRequest<GameDto>(`/games/${encodeURIComponent(String(appid))}`, { method: "PATCH", body: data }),

    delete: (appid: number | string) =>
        apiRequest<void>(`/games/${encodeURIComponent(String(appid))}`, { method: "DELETE" }),
};

// =========================================================================
// 11. GAME GUIDES SERVICES (/games/{appid}/guides/*)
// =========================================================================
export const gameGuidesApi = {
    getAll: (appid: number | string, params?: GetGameGuidesParams) =>
        apiRequest<GameGuideDto[] | { items: GameGuideDto[]; total?: number }>(`/games/${encodeURIComponent(String(appid))}/guides`, { method: "GET", params: sanitizePaginationParams(params, 50) }),

    create: (appid: number | string, data: CreateGameGuideDto) =>
        apiRequest<GameGuideDto>(`/games/${encodeURIComponent(String(appid))}/guides`, { method: "POST", body: data }),

    getById: (appid: number | string, id: string) =>
        apiRequest<GameGuideDto>(`/games/${encodeURIComponent(String(appid))}/guides/${encodeURIComponent(id)}`, { method: "GET" }),

    update: (appid: number | string, id: string, data: UpdateGameGuideDto) =>
        apiRequest<GameGuideDto>(`/games/${encodeURIComponent(String(appid))}/guides/${encodeURIComponent(id)}`, { method: "PATCH", body: data }),

    delete: (appid: number | string, id: string) =>
        apiRequest<void>(`/games/${encodeURIComponent(String(appid))}/guides/${encodeURIComponent(id)}`, { method: "DELETE" }),

    like: (appid: number | string, id: string) =>
        apiRequest<{ message?: string; success?: boolean }>(`/games/${encodeURIComponent(String(appid))}/guides/${encodeURIComponent(id)}/like`, { method: "PATCH" }),

    unlike: (appid: number | string, id: string) =>
        apiRequest<{ message?: string; success?: boolean }>(`/games/${encodeURIComponent(String(appid))}/guides/${encodeURIComponent(id)}/like`, { method: "DELETE" }),

    recordView: (appid: number | string, id: string) =>
        apiRequest<{ success?: boolean; views?: number }>(`/games/${encodeURIComponent(String(appid))}/guides/${encodeURIComponent(id)}/view`, { method: "POST" }),
};

// =========================================================================
// 12. GAME REVIEWS SERVICES (/games/{appid}/reviews/*)
// =========================================================================
export const gameReviewsApi = {
    getAll: (appid: number | string, params?: GetGameReviewsParams) =>
        apiRequest<GameReviewDto[] | { items: GameReviewDto[]; total?: number }>(`/games/${encodeURIComponent(String(appid))}/reviews`, { method: "GET", params: sanitizePaginationParams(params, 50) }),

    create: (appid: number | string, data: CreateGameReviewDto) =>
        apiRequest<GameReviewDto>(`/games/${encodeURIComponent(String(appid))}/reviews`, { method: "POST", body: data }),

    getById: (appid: number | string, id: string) =>
        apiRequest<GameReviewDto>(`/games/${encodeURIComponent(String(appid))}/reviews/${encodeURIComponent(id)}`, { method: "GET" }),

    getMyReview: (appid: number | string) =>
        apiRequest<GameReviewDto>(`/games/${encodeURIComponent(String(appid))}/reviews/me`, { method: "GET" }),

    update: (appid: number | string, id: string, data: UpdateGameReviewDto) =>
        apiRequest<GameReviewDto>(`/games/${encodeURIComponent(String(appid))}/reviews/${encodeURIComponent(id)}`, { method: "PATCH", body: data }),

    delete: (appid: number | string, id: string) =>
        apiRequest<void>(`/games/${encodeURIComponent(String(appid))}/reviews/${encodeURIComponent(id)}`, { method: "DELETE" }),

    like: (appid: number | string, id: string) =>
        apiRequest<{ message?: string; success?: boolean }>(`/games/${encodeURIComponent(String(appid))}/reviews/${encodeURIComponent(id)}/like`, { method: "PATCH" }),

    unlike: (appid: number | string, id: string) =>
        apiRequest<{ message?: string; success?: boolean }>(`/games/${encodeURIComponent(String(appid))}/reviews/${encodeURIComponent(id)}/like`, { method: "DELETE" }),
};

// =========================================================================
// 13. GAME PATCH NOTES SERVICES (/games/{appid}/patch-notes/*)
// =========================================================================
export const gamePatchNotesApi = {
    getAll: (appid: number | string, params?: GetGamePatchNotesParams) =>
        apiRequest<GamePatchNoteDto[] | { items: GamePatchNoteDto[]; total?: number }>(`/games/${encodeURIComponent(String(appid))}/patch-notes`, { method: "GET", params: sanitizePaginationParams(params, 50) }),

    create: (appid: number | string, data: CreateGamePatchNoteDto) =>
        apiRequest<GamePatchNoteDto>(`/games/${encodeURIComponent(String(appid))}/patch-notes`, { method: "POST", body: data }),

    getLatest: (appid: number | string) =>
        apiRequest<GamePatchNoteDto>(`/games/${encodeURIComponent(String(appid))}/patch-notes/latest`, { method: "GET" }),

    getById: (appid: number | string, id: string) =>
        apiRequest<GamePatchNoteDto>(`/games/${encodeURIComponent(String(appid))}/patch-notes/${encodeURIComponent(id)}`, { method: "GET" }),

    update: (appid: number | string, id: string, data: UpdateGamePatchNoteDto) =>
        apiRequest<GamePatchNoteDto>(`/games/${encodeURIComponent(String(appid))}/patch-notes/${encodeURIComponent(id)}`, { method: "PATCH", body: data }),

    delete: (appid: number | string, id: string) =>
        apiRequest<void>(`/games/${encodeURIComponent(String(appid))}/patch-notes/${encodeURIComponent(id)}`, { method: "DELETE" }),
};

// =========================================================================
// 14. GUESTBOOK SERVICES (/profiles/{profileId}/guestbook-comments/*)
// =========================================================================
export const guestbookCommentsApi = {
    getByProfileId: (profileId: string) =>
        apiRequest<GuestbookCommentDto[]>(`/profiles/${encodeURIComponent(profileId)}/guestbook-comments`, { method: "GET" }),

    create: (profileId: string, data: CreateGuestbookCommentDto) =>
        apiRequest<GuestbookCommentDto>(`/profiles/${encodeURIComponent(profileId)}/guestbook-comments`, { method: "POST", body: data }),

    update: (profileId: string, id: string, data: UpdateGuestbookCommentDto) =>
        apiRequest<GuestbookCommentDto>(`/profiles/${encodeURIComponent(profileId)}/guestbook-comments/${encodeURIComponent(id)}`, { method: "PATCH", body: data }),

    like: (profileId: string, id: string) =>
        apiRequest<{ message?: string; success?: boolean }>(`/profiles/${encodeURIComponent(profileId)}/guestbook-comments/${encodeURIComponent(id)}/like`, { method: "PATCH" }),

    delete: (profileId: string, id: string) =>
        apiRequest<void>(`/profiles/${encodeURIComponent(profileId)}/guestbook-comments/${encodeURIComponent(id)}`, { method: "DELETE" }),
};

// =========================================================================
// 15. BOOKMARKS SERVICES (/bookmarks/*)
// =========================================================================
export const bookmarksApi = {
    create: (data: CreateBookmarkDto) =>
        apiRequest<BookmarkDto>("/bookmarks", { method: "POST", body: data }),

    getAll: () =>
        apiRequest<BookmarkDto[]>("/bookmarks", { method: "GET" }),

    getMyBookmarks: () =>
        bookmarksApi.getAll(),

    check: (params: CheckBookmarkParams) =>
        apiRequest<{ bookmarked: boolean; id?: string }>("/bookmarks/check", { method: "GET", params }),

    toggle: (data?: { targetType?: string; targetId?: string }) =>
        apiRequest<{ bookmarked: boolean; id?: string }>("/bookmarks/toggle", { method: "POST", body: data }),

    deleteById: (id: string) =>
        apiRequest<void>(`/bookmarks/${encodeURIComponent(id)}`, { method: "DELETE" }),

    delete: (targetType: BookmarkTargetType, targetId: string) =>
        apiRequest<void>(`/bookmarks/${encodeURIComponent(targetType)}/${encodeURIComponent(targetId)}`, { method: "DELETE" }),
};

// =========================================================================
// 16. LIBRARY GAMES SERVICES (/library-games/*)
// =========================================================================
export const libraryGamesApi = {
    getByUserId: (userId: string) =>
        apiRequest<LibraryGameDto[]>(`/users/${encodeURIComponent(userId)}/library-games`, { method: "GET" }),

    getMyLibrary: () => {
        let userId: string | undefined;
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("indieg_access_token") || localStorage.getItem("access_token");
            if (token) {
                try {
                    const parts = token.split(".");
                    if (parts.length === 3) {
                        const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))) as { sub?: string };
                        if (typeof payload?.sub === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(payload.sub)) {
                            userId = payload.sub;
                        }
                    }
                } catch {
                    // Ignore parse error
                }
            }
        }
        if (!userId) {
            return Promise.resolve([]);
        }
        return libraryGamesApi.getByUserId(userId);
    },

    getById: (id: string) =>
        apiRequest<LibraryGameDto>(`/library-games/${encodeURIComponent(id)}`, { method: "GET" }),

    create: (data: CreateLibraryGameDto) =>
        apiRequest<LibraryGameDto>("/library-games", { method: "POST", body: data }),

    sync: (data?: Record<string, unknown>) =>
        apiRequest<unknown>("/library-games/sync", { method: "POST", body: data || {} }),

    update: (id: string, data: UpdateLibraryGameDto) =>
        apiRequest<LibraryGameDto>(`/library-games/${encodeURIComponent(id)}`, { method: "PATCH", body: data }),

    delete: (id: string) =>
        apiRequest<void>(`/library-games/${encodeURIComponent(id)}`, { method: "DELETE" }),
};

// =========================================================================
// 17. FRIENDSHIP SERVICES (/friendships/*)
// =========================================================================
export const friendshipsApi = {
    sendRequest: (data: CreateFriendshipRequestDto) =>
        apiRequest<FriendshipDto>("/friendships/requests", { method: "POST", body: data }),

    acceptRequest: (id: string) =>
        apiRequest<FriendshipDto>(`/friendships/${encodeURIComponent(id)}/accept`, { method: "PATCH" }),

    rejectRequest: (id: string) =>
        apiRequest<void>(`/friendships/${encodeURIComponent(id)}/request`, { method: "DELETE" }),

    cancelRequest: (id: string) =>
        apiRequest<void>(`/friendships/${encodeURIComponent(id)}/request`, { method: "DELETE" }),

    unfriend: (id: string) =>
        apiRequest<void>(`/friendships/${encodeURIComponent(id)}/unfriend`, { method: "DELETE" }),

    block: (targetUserId: string) =>
        apiRequest<FriendshipDto>(`/friendships/block/${encodeURIComponent(targetUserId)}`, { method: "POST" }),

    unblock: (id: string) =>
        apiRequest<void>(`/friendships/${encodeURIComponent(id)}/unblock`, { method: "DELETE" }),

    unblockUser: (targetUserId: string) =>
        apiRequest<void>(`/friendships/block/${encodeURIComponent(targetUserId)}`, { method: "DELETE" }),

    checkStatus: (targetUserId: string) =>
        apiRequest<FriendshipStatusDto>(`/friendships/status/${encodeURIComponent(targetUserId)}`, { method: "GET" }),

    getFriends: () =>
        apiRequest<UserProfileDto[]>("/friendships/friends", { method: "GET" }),

    getIncomingRequests: () =>
        apiRequest<FriendshipDto[]>("/friendships/requests/incoming", { method: "GET" }),

    getOutgoingRequests: () =>
        apiRequest<FriendshipDto[]>("/friendships/requests/outgoing", { method: "GET" }),

    getBlocked: () =>
        apiRequest<FriendshipDto[]>("/friendships/blocked", { method: "GET" }),
};

// =========================================================================
// 18. SEARCH API (/search)
// =========================================================================
export const searchApi = {
    search: <T = unknown>(params: SearchParams) =>
        apiRequest<T>("/search", { method: "GET", params: sanitizePaginationParams(params, 50) }),

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
        apiRequest<NotificationDto[] | { items: NotificationDto[]; total?: number }>("/notifications", { method: "GET", params }),

    create: (data: CreateNotificationDto) =>
        apiRequest<NotificationDto>("/notifications", { method: "POST", body: data }),

    markAsRead: (id: string) =>
        apiRequest<void>(`/notifications/${encodeURIComponent(id)}/read`, { method: "PUT" }),

    markAllAsRead: () =>
        apiRequest<void>("/notifications/read-all", { method: "PUT" }),

    delete: (id: string) =>
        apiRequest<void>(`/notifications/${encodeURIComponent(id)}`, { method: "DELETE" }),

    getUnreadCount: () =>
        apiRequest<{ count: number }>("/notifications/unread-count", { method: "GET" }),
};

// =========================================================================
// 20. STORAGE SERVICES (/storage/*)
// =========================================================================
export const storageApi = {
    getPresignedUrl: (data: { type: import("../utils/image-processor").UploadType; originalSize: number; originalMimeType: string; postId?: string }) =>
        apiRequest<{ presignedUrl: string; fileKey: string }>("/storage/presigned-url", { method: "POST", body: data }),

    deleteFile: (fileKey: string) =>
        apiRequest<{ message?: string; success?: boolean }>(`/storage/file/${encodeURIComponent(fileKey)}`, { method: "DELETE" }),

    confirmUpload: (data: { fileKey: string; type?: string; entityId?: string }) =>
        apiRequest<{ message?: string; success?: boolean; url?: string }>("/storage/confirm", { method: "POST", body: data }),

    uploadImageToR2: (options: UploadOptions) => uploadImageToR2(options),
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
