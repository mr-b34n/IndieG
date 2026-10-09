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
    type GetCommunitiesParams,
    type RootCommentsResponse,
    type GetReportsParams,
    type SearchParams,
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

/**
 * Standalone Mock Runner
 * Thực thi trực tiếp logic mock data độc lập, loại bỏ hoàn toàn network call tới Backend.
 */
export async function callMock<T>(
    mock: T | (() => T | Promise<T>)
): Promise<T> {
    return typeof mock === "function"
        ? (mock as () => T | Promise<T>)()
        : mock;
}

/** Giữ alias tương thích ngược */
export const callOrMock = async <T>(
    mockDataOrFn: unknown,
    mockFallback?: T | (() => T | Promise<T>)
): Promise<T> => {
    const target = mockFallback !== undefined ? mockFallback : (mockDataOrFn as T | (() => T | Promise<T>));
    return callMock<T>(target);
};

// =========================================================================
// 1. AUTH SERVICES (/auth/*)
// =========================================================================
export const authApi = {
    register: (data: AuthRegisterDto) =>
        callMock<AuthLoginResponse>({
            accessToken: "mock_token_registered",
            user: { ...MOCK_CURRENT_USER, email: data.email, username: data.username },
        }),

    verifyEmail: (_data: { token: string }) =>
        callMock<{ message?: string }>({ message: "Email verified successfully" }),

    login: (data: AuthLoginDto) =>
        callMock<AuthLoginResponse>(() => {
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
        }),

    logout: () =>
        callMock<{ message?: string }>({ message: "Logged out" }),

    me: () =>
        callMock<UserProfileDto>(MOCK_CURRENT_USER),

    googleLogin: (_data: AuthGoogleLoginDto) =>
        callMock<AuthLoginResponse>({ accessToken: "mock_google_token", user: MOCK_CURRENT_USER }),

    changePassword: (_data: ChangePasswordDto) =>
        callMock<{ message?: string }>({ message: "Password updated successfully" }),

    forgotPassword: (_data: AuthForgotPasswordDto) =>
        callMock<{ message?: string }>({ message: "Reset link sent" }),

    resetPassword: (_data: AuthResetPasswordDto) =>
        callMock<{ message?: string }>({ message: "Password reset successfully" }),

    refreshToken: (_data: { refreshToken: string }) =>
        callMock<{ accessToken: string }>({ accessToken: "mock_token_refreshed" }),

    resendVerification: (_data: AuthResendVerificationDto) =>
        callMock<{ message?: string }>({ message: "Verification email resent" }),
};

// =========================================================================
// 2. USER & SESSION SERVICES (/users/*)
// =========================================================================
export const usersApi = {
    getAll: () =>
        callMock<UserProfileDto[]>(MOCK_USERS),

    getById: (id: string) =>
        callMock<UserProfileDto>(() => getMockUserById(id)),

    getSessions: () =>
        callMock<UserSessionDto[]>(() => getMockSessions()),

    revokeSession: (sessionId: string) =>
        callMock<{ message?: string }>(() => {
            revokeMockSession(sessionId);
            return { message: "Session revoked" };
        }),

    revokeAllSessions: () =>
        callMock<{ message?: string }>(() => {
            revokeAllMockSessions();
            return { message: "All sessions revoked" };
        }),

    deleteAccount: () =>
        callMock<{ message?: string }>({ message: "Account deleted" }),
};

// =========================================================================
// 3. PROFILE SERVICES (/profiles/*)
// =========================================================================
export const profilesApi = {
    getMe: () =>
        callMock<UserProfileDto>(() => {
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
        }),

    getMyProfile: () => profilesApi.getMe(),

    getByUsername: (username: string) =>
        callMock<UserProfileDto>(() => {
            const clean = username.toLowerCase().replace(/^@/, "");
            return MOCK_USERS.find((u) => u.username.toLowerCase() === clean) || MOCK_CURRENT_USER;
        }),

    getById: (id: string) =>
        callMock<UserProfileDto>(() => getMockUserById(id)),

    search: (query: string, _page = 1, _limit = 10) =>
        callMock<UserProfileDto[]>(() => {
            const q = query.toLowerCase();
            return MOCK_USERS.filter((u) => u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q));
        }),

    updateMe: (data: UpdateProfileDto) =>
        callMock<UserProfileDto>({ ...MOCK_CURRENT_USER, ...data }),

    deleteMe: () =>
        callMock<{ message?: string }>({ message: "Profile deleted" }),

    deleteUser: (_id: string) =>
        callMock<void>(undefined),

    toggleArchived: () =>
        callMock<{ message?: string; archived?: boolean }>({ message: "Status updated", archived: false }),
};

// =========================================================================
// 4. COMMUNITIES SERVICES (/communities/*)
// =========================================================================
export const communitiesApi = {
    create: (data: CreateCommunityDto) =>
        callMock<CommunityDto>(() => {
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
        }),

    getAll: (params?: GetCommunitiesParams) =>
        callMock<CommunityDto[] | { items: CommunityDto[]; total?: number }>(() => {
            if (params?.type === "joined") {
                return MOCK_COMMUNITY_DTOS.filter((c) => c.joined);
            }
            return MOCK_COMMUNITY_DTOS;
        }),

    getFeatured: () =>
        callMock<CommunityDto[]>(MOCK_COMMUNITY_DTOS.filter((c) => c.featured)),

    getPopular: () =>
        callMock<CommunityDto[]>(MOCK_COMMUNITY_DTOS),

    getRecent: () =>
        callMock<CommunityDto[]>(MOCK_COMMUNITY_DTOS),

    getMyCommunities: () =>
        callMock<CommunityDto[]>(MOCK_COMMUNITY_DTOS.filter((c) => c.joined)),

    getById: (id: string) =>
        callMock<CommunityDto>(() => {
            const target = (id || "").toLowerCase();
            const found = MOCK_COMMUNITY_DTOS.find((c) =>
                c.id.toLowerCase() === target ||
                (c.slug && c.slug.toLowerCase() === target) ||
                (c.gameSlug && c.gameSlug.toLowerCase() === target) ||
                (target === "cs2" && c.id === "cs2-vietnam") ||
                (target === "raft" && (c.id === "indie-games-vietnam" || c.gameSlug === "raft")) ||
                (target === "elden-ring" && c.id === "elden-ring-vietnam") ||
                (target === "wukong" && c.id === "black-myth-wukong-vn") ||
                (target === "cyberpunk" && c.id === "cyberpunk-2077-vn") ||
                (target === "valorant" && c.id === "valorant-vietnam") ||
                (target === "minecraft" && c.id === "minecraft-vietnam") ||
                (target === "rdr2" && c.id === "red-dead-redemption-vn") ||
                ((target === "monster-hunter" || target === "mhwilds" || target === "monster-hunter-wilds") && c.id === "monster-hunter-wilds-vn") ||
                ((target === "genshin" || target === "genshin-impact") && c.id === "genshin-impact-vn") ||
                ((target === "apex" || target === "apex-legends") && c.id === "apex-legends-vn")
            );
            return found || MOCK_COMMUNITY_DTOS[0];
        }),

    getBySlug: (slug: string) =>
        callMock<CommunityDto>(() => {
            const target = (slug || "").toLowerCase();
            const found = MOCK_COMMUNITY_DTOS.find((c) =>
                (c.slug && c.slug.toLowerCase() === target) ||
                c.id.toLowerCase() === target ||
                (c.gameSlug && c.gameSlug.toLowerCase() === target)
            );
            return found || MOCK_COMMUNITY_DTOS[0];
        }),

    update: (id: string, data: UpdateCommunityDto) =>
        callMock<CommunityDto>(() => {
            const base = getMockCommunityById(id);
            return { ...base, ...data } as CommunityDto;
        }),

    delete: (_id: string) =>
        callMock<void>(undefined),
};

// =========================================================================
// 5. COMMUNITY MEMBERS SERVICES (/communities/{id}/members/*)
// =========================================================================
export const communityMembersApi = {
    getMembers: (communityId: string, _params?: GetCommunityMembersParams) =>
        callMock<CommunityMembersResponseDto | CommunityMemberDto[]>(() => {
            const list = MOCK_COMMUNITY_MEMBERS.filter((m) => m.communityId === communityId);
            return list.length > 0 ? list : MOCK_COMMUNITY_MEMBERS.filter((m) => m.communityId === "cs2-vietnam");
        }),

    searchMembers: (communityId: string, params: SearchCommunityMembersParams) =>
        callMock<CommunityMemberDto[]>(() => {
            const list = MOCK_COMMUNITY_MEMBERS.filter((m) => m.communityId === communityId);
            const baseList = list.length > 0 ? list : MOCK_COMMUNITY_MEMBERS.filter((m) => m.communityId === "cs2-vietnam");
            const q = (params?.query || "").toLowerCase();
            if (!q) return baseList;
            return baseList.filter((m) => m.user?.username?.toLowerCase().includes(q) || m.user?.name?.toLowerCase().includes(q));
        }),

    getMyRole: (_communityId: string) =>
        callMock<{ role: string; status: string }>(() => {
            if (typeof window !== "undefined") {
                const token = localStorage.getItem("indieg_access_token") || localStorage.getItem("access_token");
                if (token && (token.includes("admin") || token.includes("usr_admin"))) {
                    return { role: "owner", status: "active" };
                }
            }
            return { role: "moderator", status: "active" };
        }),

    getBannedMembers: (communityId: string) =>
        callMock<CommunityMemberDto[]>(() => {
            const list = MOCK_COMMUNITY_MEMBERS.filter((m) => m.communityId === communityId && m.status === "banned");
            return list.length > 0 ? list : MOCK_COMMUNITY_MEMBERS.filter((m) => m.communityId === "cs2-vietnam" && m.status === "banned");
        }),

    getMutedMembers: (communityId: string) =>
        callMock<CommunityMemberDto[]>(() => {
            const list = MOCK_COMMUNITY_MEMBERS.filter((m) => m.communityId === communityId && m.status === "muted");
            return list.length > 0 ? list : MOCK_COMMUNITY_MEMBERS.filter((m) => m.communityId === "cs2-vietnam" && m.status === "muted");
        }),

    sendInvite: (communityId: string, data: CreateCommunityInviteDto) =>
        callMock<CommunityInviteDto>({
            id: `inv-${Date.now()}`,
            communityId,
            inviteeId: data.inviteeId,
            status: "pending",
            createdAt: new Date().toISOString(),
        }),

    getInvites: (_communityId: string) =>
        callMock<CommunityInviteDto[]>([]),

    join: (_communityId: string) =>
        callMock<{ message?: string; joined?: boolean }>({ message: "Joined successfully", joined: true }),

    leave: (_communityId: string) =>
        callMock<{ message?: string; joined?: boolean }>({ message: "Left successfully", joined: false }),

    assignRole: (communityId: string, memberId: string, role: string) =>
        callMock<CommunityMemberDto>({
            communityId,
            userId: memberId,
            role: role as "member" | "moderator" | "owner",
            status: "active",
            joinedAt: new Date().toISOString(),
        }),

    performAction: (_communityId: string, _data: CommunityMemberActionDto) =>
        callMock<{ message?: string; success?: boolean }>({ message: "Action performed", success: true }),

    kickMember: (_communityId: string, _memberId: string) =>
        callMock<{ message?: string; success?: boolean }>({ message: "Member kicked", success: true }),

    banMember: (_communityId: string, _memberId: string, _reason?: string) =>
        callMock<{ message?: string; success?: boolean }>({ message: "Member banned", success: true }),

    unbanMember: (_communityId: string, _memberId: string) =>
        callMock<{ message?: string; success?: boolean }>({ message: "Member unbanned", success: true }),

    muteMember: (_communityId: string, _memberId: string, _durationMinutes?: number) =>
        callMock<{ message?: string; success?: boolean }>({ message: "Member muted", success: true }),

    unmuteMember: (_communityId: string, _memberId: string) =>
        callMock<{ message?: string; success?: boolean }>({ message: "Member unmuted", success: true }),

    transferOwnership: (_communityId: string, _newOwnerIdOrData: string | { newOwnerId: string }) =>
        callMock<{ message?: string; success?: boolean }>({ message: "Ownership transferred", success: true }),
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
        callMock<PostDto[] | { items: PostDto[]; total?: number; data?: PostDto[] }>(() => {
            let list = [...MOCK_POST_DTOS];
            if (params?.communityId) {
                const target = params.communityId.toLowerCase();
                list = list.filter((p) => {
                    const cId = (p.communityId || "").toLowerCase();
                    return (
                        cId === target ||
                        cId.startsWith(target) ||
                        target.startsWith(cId) ||
                        (target === "raft" && (cId === "indie-games-vietnam" || cId === "raft")) ||
                        (target === "cs2" && (cId === "cs2-vietnam" || cId === "cs2")) ||
                        (target === "elden-ring" && (cId === "elden-ring-vietnam" || cId === "elden-ring")) ||
                        (target === "wukong" && (cId === "black-myth-wukong-vn" || cId === "black-myth-wukong")) ||
                        (target === "cyberpunk" && (cId === "cyberpunk-2077-vn" || cId === "cyberpunk-2077"))
                    );
                });
            }
            if (params?.authorId) {
                list = list.filter((p) => p.authorId === params.authorId);
            }
            return { items: list, data: list, total: list.length };
        }),

    getFeed: (_params?: { page?: number; limit?: number; tab?: string }) =>
        callMock<PostDto[] | { items: PostDto[]; total?: number; data?: PostDto[] }>(() => ({
            items: MOCK_POST_DTOS,
            data: MOCK_POST_DTOS,
            total: MOCK_POST_DTOS.length,
        })),

    getByCommunity: (communityId: string, _params?: { page?: number; limit?: number }) =>
        callMock<PostDto[] | { items: PostDto[]; total?: number }>(() => {
            const target = (communityId || "").toLowerCase();
            const filtered = MOCK_POST_DTOS.filter((p) => {
                const cId = (p.communityId || "").toLowerCase();
                return (
                    cId === target ||
                    cId.startsWith(target) ||
                    target.startsWith(cId) ||
                    (target === "raft" && (cId === "indie-games-vietnam" || cId === "raft")) ||
                    (target === "cs2" && (cId === "cs2-vietnam" || cId === "cs2")) ||
                    (target === "elden-ring" && (cId === "elden-ring-vietnam" || cId === "elden-ring")) ||
                    (target === "wukong" && (cId === "black-myth-wukong-vn" || cId === "black-myth-wukong")) ||
                    (target === "cyberpunk" && (cId === "cyberpunk-2077-vn" || cId === "cyberpunk")) ||
                    (target === "valorant" && (cId === "valorant-vietnam" || cId === "valorant")) ||
                    (target === "minecraft" && (cId === "minecraft-vietnam" || cId === "minecraft")) ||
                    (target === "rdr2" && (cId === "red-dead-redemption-vn" || cId === "rdr2"))
                );
            });
            return filtered.length > 0 ? filtered : MOCK_POST_DTOS.slice(0, 5);
        }),

    getByAuthor: (authorId: string, _params?: { page?: number; limit?: number }) =>
        callMock<PostDto[] | { items: PostDto[]; total?: number }>(() =>
            MOCK_POST_DTOS.filter((p) => p.authorId === authorId || authorId === "me" || authorId === "user-me")
        ),

    getOne: (id: string) =>
        callMock<PostDto>(() => getMockPostDtoById(id)),

    create: (data: CreatePostDto) =>
        callMock<PostDto>(() => {
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
        }),

    update: (id: string, data: UpdatePostDto) =>
        callMock<PostDto>(() => {
            const existing = getMockPostDtoById(id);
            return { ...existing, ...data };
        }),

    delete: (_id: string) =>
        callMock<void>(undefined),

    pinPost: (_id: string) =>
        callMock<PostActionResponse>({ success: true, message: "Post pinned" }),

    unpinPost: (_id: string) =>
        callMock<PostActionResponse>({ success: true, message: "Post unpinned" }),

    lockPost: (_id: string) =>
        callMock<PostActionResponse>({ success: true, message: "Post locked" }),

    unlockPost: (_id: string) =>
        callMock<PostActionResponse>({ success: true, message: "Post unlocked" }),

    getPostVoters: (_id: string) =>
        callMock<UserProfileDto[]>(MOCK_USERS.slice(0, 3)),
};

// =========================================================================
// 7. COMMENT SERVICES (/comments/*)
// =========================================================================
export const commentsApi = {
    create: (data: CreateCommentDto) =>
        callMock<CommentEntity>(() => {
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
        }),

    getOne: (id: string) =>
        callMock<CommentEntity>(() => ({
            id,
            content: "Bình luận mẫu",
            authorId: "user-1",
            createdAt: new Date().toISOString(),
            likes: 5,
        })),

    update: (id: string, payload: { content: string }) =>
        callMock<CommentEntity>(() => ({
            id,
            content: payload.content,
            authorId: "user-me",
            createdAt: new Date().toISOString(),
            likes: 0,
        })),

    delete: (_id: string) =>
        callMock<{ message?: string }>({ message: "Comment deleted" }),

    getRootComments: (params: { postId: string | number; page?: number; limit?: number }) =>
        callMock<RootCommentsResponse>(() => {
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
        }),

    getReplyComments: (params: { parentId: string | number; cursor?: string; limit?: number }) =>
        callMock<ReplyCommentsResponse>(() => {
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
        }),

    getReplies: (parentId: string | number, params?: { limit?: number; cursor?: string }) =>
        commentsApi.getReplyComments({ parentId, ...params }),

    pinComment: (_id: string | number) =>
        callMock<{ message?: string; success?: boolean }>({ message: "Comment pinned", success: true }),

    unpinComment: (_id: string | number) =>
        callMock<{ message?: string; success?: boolean }>({ message: "Comment unpinned", success: true }),

    getPostComments: (postId: string, _params?: { page?: number; limit?: number }) =>
        callMock<CommentEntity[] | { data: CommentEntity[]; total?: number }>(() => getMockCommentsByPostId(postId)),
};

// =========================================================================
// 8. REPORT SERVICES (/reports/*)
// =========================================================================
export const reportsApi = {
    getAll: (_params?: GetReportsParams) =>
        callMock<ReportDto[]>(() => getMockReports()),

    create: (data: CreateReportDto) =>
        callMock<ReportDto>(() => {
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
        }),

    getOne: (id: string) =>
        callMock<ReportDto>(() => getMockReportById(id)),

    getHistory: (id: string) =>
        callMock<ReportHistoryItemDto[]>(() => getMockReportHistory(id)),

    update: (id: string, reason: string) =>
        callMock<ReportDto>(() => {
            const rep = getMockReportById(id);
            rep.reason = reason;
            rep.updatedAt = new Date().toISOString();
            return rep;
        }),

    resolve: (id: string, data: ResolveReportDto | string) =>
        callMock<{ message?: string; success?: boolean }>(() => resolveMockReport(id, data)),

    dismiss: (id: string) =>
        reportsApi.resolve(id, { status: "dismissed" }),

    reportPost: (postId: string, reason: string) =>
        reportsApi.create({ targetType: "post", targetId: postId, reason }),

    reportComment: (commentId: string, reason: string) =>
        reportsApi.create({ targetType: "comment", targetId: commentId, reason }),

    reportUser: (userId: string, reason: string) =>
        reportsApi.create({ targetType: "post", targetId: userId, reason }),

    delete: (id: string) =>
        callMock<{ message?: string }>(() => {
            deleteMockReport(id);
            return { message: "Report deleted" };
        }),
};

// =========================================================================
// 9. VOTE SERVICES (/votes/*)
// =========================================================================
export const votesApi = {
    getAll: () =>
        callMock<VoteDto[]>([]),

    getByPost: (_postId: string | number) =>
        callMock<VoteDto | { hasVoted?: boolean; score?: number }>({ hasVoted: true, score: 152 }),

    getMyPostVote: (_postId: string | number) =>
        callMock<{ hasVoted?: boolean; voteType?: VoteType | 0; score?: number }>({ hasVoted: true, voteType: 1, score: 152 }),

    votePost: (_postId: string | number, voteType: VoteType = 1) =>
        callMock<{ message?: string; success?: boolean; score?: number; voteType?: VoteType }>({
            message: "Vote recorded",
            success: true,
            score: 152,
            voteType,
        }),

    upVotePost: (postId: string | number) =>
        votesApi.votePost(postId, 1),

    downVotePost: (postId: string | number) =>
        votesApi.votePost(postId, -1),

    deleteVotePost: (_postId: string | number) =>
        callMock<{ message?: string; success?: boolean }>({ message: "Vote removed", success: true }),

    getByComment: (_commentId: string | number) =>
        callMock<VoteDto | { hasVoted?: boolean; score?: number }>({ hasVoted: false, score: 10 }),

    getMyCommentVote: (_commentId: string | number) =>
        callMock<{ hasVoted?: boolean; voteType?: VoteType | 0; score?: number }>({ hasVoted: false, voteType: 0, score: 10 }),

    voteComment: (_commentId: string | number, voteType: VoteType = 1) =>
        callMock<{ message?: string; success?: boolean; score?: number; voteType?: VoteType }>({
            message: "Vote recorded",
            success: true,
            score: 10,
            voteType,
        }),

    upVoteComment: (commentId: string | number) =>
        votesApi.voteComment(commentId, 1),

    downVoteComment: (commentId: string | number) =>
        votesApi.voteComment(commentId, -1),

    deleteVoteComment: (_commentId: string | number) =>
        callMock<{ message?: string; success?: boolean }>({ message: "Vote removed", success: true }),
};

// =========================================================================
// 10. GAMES SERVICES (/games/*)
// =========================================================================
export const gamesApi = {
    create: (data: CreateGameDto) =>
        callMock<GameDto>({
            id: data.slug || "new-game",
            name: data.name,
            slug: data.slug || "new-game",
            appid: data.appid || 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }),

    getAll: (_params?: GetGamesParams) =>
        callMock<GameDto[] | { items: GameDto[]; total?: number }>(() => MOCK_GAME_DTOS),

    getFeatured: () =>
        callMock<GameDto[]>(MOCK_GAME_DTOS.slice(0, 3)),

    getPopular: () =>
        callMock<GameDto[]>(MOCK_GAME_DTOS),

    getRecent: () =>
        callMock<GameDto[]>(MOCK_GAME_DTOS),

    syncSteam: (appid: number | string) =>
        callMock<SteamSyncResponse>({ success: true, appid: Number(appid), message: "Steam data synchronized" }),

    searchSteam: (q: string) =>
        callMock<SteamSearchResultDto[]>(() =>
            MOCK_GAME_DTOS.filter((g) => g.name.toLowerCase().includes(q.toLowerCase())).map((g) => ({
                appid: g.appid || 730,
                name: g.name,
            }))
        ),

    importSteamSearch: (_q: string) =>
        callMock<GameDto | GameDto[]>(MOCK_GAME_DTOS[0]),

    importByAppid: (appid: number | string) =>
        callMock<GameDto>(() => MOCK_GAME_DTOS.find((g) => g.appid === Number(appid)) || MOCK_GAME_DTOS[0]),

    getExternalData: (appid: number | string) =>
        callMock<ExternalGameDataDto>(() => {
            const found = MOCK_GAMES.find((g) => g.appid === Number(appid));
            return {
                appid: Number(appid),
                name: found?.name || "Game",
                detailedDescription: found?.description,
                shortDescription: found?.summary,
                headerImage: found?.bannerUrl,
            };
        }),

    refreshExternalData: (_appid: number | string) =>
        callMock<ExternalGameDataDto | { message?: string; success?: boolean }>({ message: "External data refreshed", success: true }),

    getBySlug: (slug: string) =>
        callMock<GameDto>(() => MOCK_GAME_DTOS.find((g) => g.slug === slug || g.id === slug) || MOCK_GAME_DTOS[0]),

    getByAppid: (appid: number | string) =>
        callMock<GameDto>(() => MOCK_GAME_DTOS.find((g) => g.appid === Number(appid)) || MOCK_GAME_DTOS[0]),

    update: (_appid: number | string, data: UpdateGameDto) =>
        callMock<GameDto>(() => ({ ...MOCK_GAME_DTOS[0], ...data })),

    delete: (_appid: number | string) =>
        callMock<void>(undefined),
};

// =========================================================================
// 11. GAME GUIDES SERVICES (/games/{appid}/guides/*)
// =========================================================================
export const gameGuidesApi = {
    getAll: (appid: number | string, _params?: GetGameGuidesParams) =>
        callMock<GameGuideDto[] | { items: GameGuideDto[]; total?: number }>(() =>
            MOCK_GUIDES.filter((g) => g.appid === Number(appid)) || MOCK_GUIDES
        ),

    create: (appid: number | string, data: CreateGameGuideDto) =>
        callMock<GameGuideDto>(() => ({
            id: `guide-${Date.now()}`,
            appid: Number(appid),
            title: data.title,
            content: data.content,
            authorId: "user-me",
            views: 1,
            likes: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        })),

    getById: (_appid: number | string, id: string) =>
        callMock<GameGuideDto>(() => MOCK_GUIDES.find((g) => g.id === id) || MOCK_GUIDES[0]),

    update: (_appid: number | string, _id: string, data: UpdateGameGuideDto) =>
        callMock<GameGuideDto>(() => ({ ...MOCK_GUIDES[0], ...data })),

    delete: (_appid: number | string, _id: string) =>
        callMock<void>(undefined),

    like: (_appid: number | string, _id: string) =>
        callMock<{ message?: string; success?: boolean }>({ message: "Guide liked", success: true }),

    unlike: (_appid: number | string, _id: string) =>
        callMock<{ message?: string; success?: boolean }>({ message: "Guide unliked", success: true }),

    recordView: (_appid: number | string, _id: string) =>
        callMock<{ success?: boolean; views?: number }>({ success: true, views: 100 }),
};

// =========================================================================
// 12. GAME REVIEWS SERVICES (/games/{appid}/reviews/*)
// =========================================================================
export const gameReviewsApi = {
    getAll: (appid: number | string, _params?: GetGameReviewsParams) =>
        callMock<GameReviewDto[] | { items: GameReviewDto[]; total?: number }>(() =>
            MOCK_REVIEWS.filter((r) => r.appid === Number(appid)) || MOCK_REVIEWS
        ),

    create: (appid: number | string, data: CreateGameReviewDto) =>
        callMock<GameReviewDto>(() => ({
            id: `rev-${Date.now()}`,
            appid: Number(appid),
            authorId: "user-me",
            rating: data.rating,
            content: data.content,
            likes: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        })),

    getById: (_appid: number | string, id: string) =>
        callMock<GameReviewDto>(() => MOCK_REVIEWS.find((r) => r.id === id) || MOCK_REVIEWS[0]),

    getMyReview: (appid: number | string) =>
        callMock<GameReviewDto>(() => MOCK_REVIEWS.find((r) => r.appid === Number(appid)) || MOCK_REVIEWS[0]),

    update: (_appid: number | string, _id: string, data: UpdateGameReviewDto) =>
        callMock<GameReviewDto>(() => ({ ...MOCK_REVIEWS[0], ...data })),

    delete: (_appid: number | string, _id: string) =>
        callMock<void>(undefined),

    like: (_appid: number | string, _id: string) =>
        callMock<{ message?: string; success?: boolean }>({ message: "Review liked", success: true }),

    unlike: (_appid: number | string, _id: string) =>
        callMock<{ message?: string; success?: boolean }>({ message: "Review unliked", success: true }),
};

// =========================================================================
// 13. GAME PATCH NOTES SERVICES (/games/{appid}/patch-notes/*)
// =========================================================================
export const gamePatchNotesApi = {
    getAll: (appid: number | string, _params?: GetGamePatchNotesParams) =>
        callMock<GamePatchNoteDto[] | { items: GamePatchNoteDto[]; total?: number }>(() =>
            MOCK_PATCH_NOTES.filter((p) => p.appid === Number(appid)) || MOCK_PATCH_NOTES
        ),

    create: (appid: number | string, data: CreateGamePatchNoteDto) =>
        callMock<GamePatchNoteDto>(() => ({
            id: `patch-${Date.now()}`,
            appid: Number(appid),
            title: data.title,
            content: data.content,
            version: data.version,
            releaseDate: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        })),

    getLatest: (_appid: number | string) =>
        callMock<GamePatchNoteDto>(() => MOCK_PATCH_NOTES[0]),

    getById: (_appid: number | string, id: string) =>
        callMock<GamePatchNoteDto>(() => MOCK_PATCH_NOTES.find((p) => p.id === id) || MOCK_PATCH_NOTES[0]),

    update: (_appid: number | string, _id: string, data: UpdateGamePatchNoteDto) =>
        callMock<GamePatchNoteDto>(() => ({ ...MOCK_PATCH_NOTES[0], ...data })),

    delete: (_appid: number | string, _id: string) =>
        callMock<void>(undefined),
};

// =========================================================================
// 14. GUESTBOOK SERVICES (/profiles/{profileId}/guestbook-comments/*)
// =========================================================================
export const guestbookCommentsApi = {
    getByProfileId: (profileId: string) =>
        callMock<GuestbookCommentDto[]>(() => getMockGuestbookCommentsByProfileId(profileId)),

    create: (profileId: string, data: CreateGuestbookCommentDto) =>
        callMock<GuestbookCommentDto>(() => {
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
        }),

    update: (_profileId: string, id: string, data: UpdateGuestbookCommentDto) =>
        callMock<GuestbookCommentDto>({
            id,
            authorId: "user-me",
            content: data.content,
            createdAt: new Date().toISOString(),
            likes: 0,
        }),

    like: (_profileId: string, _id: string) =>
        callMock<{ message?: string; success?: boolean }>({ message: "Liked", success: true }),

    delete: (_profileId: string, _id: string) =>
        callMock<void>(undefined),
};

// =========================================================================
// 15. BOOKMARKS SERVICES (/bookmarks/*)
// =========================================================================
export const bookmarksApi = {
    create: (data: CreateBookmarkDto) =>
        callMock<BookmarkDto>({
            id: `bm-${Date.now()}`,
            userId: "user-me",
            targetType: data.targetType,
            targetId: data.targetId,
            createdAt: new Date().toISOString(),
        }),

    getAll: () =>
        callMock<BookmarkDto[]>(MOCK_BOOKMARKS),

    getMyBookmarks: () =>
        bookmarksApi.getAll(),

    check: (params: CheckBookmarkParams) =>
        callMock<{ bookmarked: boolean; id?: string }>(() => {
            const found = MOCK_BOOKMARKS.find((b) => b.targetType === params.targetType && b.targetId === params.targetId);
            return { bookmarked: !!found, id: found?.id };
        }),

    toggle: (_data?: { targetType?: string; targetId?: string }) =>
        callMock<{ bookmarked: boolean; id?: string }>({ bookmarked: true, id: `bm-${Date.now()}` }),

    deleteById: (_id: string) =>
        callMock<void>(undefined),

    delete: (_targetType: BookmarkTargetType, _targetId: string) =>
        callMock<void>(undefined),
};

// =========================================================================
// 16. LIBRARY GAMES SERVICES (/library-games/*)
// =========================================================================
export const libraryGamesApi = {
    getByUserId: (userId: string) =>
        callMock<LibraryGameDto[]>(
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

    getById: (_id: string) =>
        callMock<LibraryGameDto>(() => libraryGamesApi.getByUserId("user-me").then((list) => list[0])),

    create: (data: CreateLibraryGameDto) =>
        callMock<LibraryGameDto>({
            id: `lib-${Date.now()}`,
            userId: "user-me",
            appid: data.appid,
            playtimeMinutes: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }),

    sync: (_data?: Record<string, unknown>) =>
        callMock<unknown>({ success: true, message: "Library synchronized" }),

    update: (id: string, data: UpdateLibraryGameDto) =>
        callMock<LibraryGameDto>({
            id,
            userId: "user-me",
            appid: 730,
            ...data,
            updatedAt: new Date().toISOString(),
        }),

    delete: (_id: string) =>
        callMock<void>(undefined),
};

// =========================================================================
// 17. FRIENDSHIP SERVICES (/friendships/*)
// =========================================================================
export const friendshipsApi = {
    sendRequest: (data: CreateFriendshipRequestDto) =>
        callMock<FriendshipDto>({
            id: `fr-${Date.now()}`,
            requesterId: "user-me",
            addresseeId: data.targetUserId,
            status: "pending",
            createdAt: new Date().toISOString(),
        }),

    acceptRequest: (id: string) =>
        callMock<FriendshipDto>({
            id,
            requesterId: "user-1",
            addresseeId: "user-me",
            status: "accepted",
            createdAt: new Date().toISOString(),
        }),

    rejectRequest: (_id: string) =>
        callMock<{ message?: string }>({ message: "Friend request rejected" }),

    cancelRequest: (_id: string) =>
        callMock<void>(undefined),

    unfriend: (_id: string) =>
        callMock<void>(undefined),

    block: (targetUserId: string) =>
        callMock<FriendshipDto>({
            id: `blk-${Date.now()}`,
            requesterId: "user-me",
            addresseeId: targetUserId,
            status: "blocked",
            createdAt: new Date().toISOString(),
        }),

    unblock: (_id: string) =>
        callMock<void>(undefined),

    unblockUser: (_targetUserId: string) =>
        callMock<void>(undefined),

    checkStatus: (_targetUserId: string) =>
        callMock<FriendshipStatusDto>({ status: "friends", isFriend: true, isBlocked: false, isPending: false }),

    getFriends: () =>
        callMock<UserProfileDto[]>(MOCK_USERS.filter((u) => u.isFriend)),

    getIncomingRequests: () =>
        callMock<FriendshipDto[]>([]),

    getOutgoingRequests: () =>
        callMock<FriendshipDto[]>([]),

    getBlocked: () =>
        callMock<FriendshipDto[]>([]),
};

// =========================================================================
// 18. SEARCH API (/search)
// =========================================================================
export const searchApi = {
    search: <T = unknown>(params: SearchParams) =>
        callMock<T>(() => {
            const q = (params.q || "").toLowerCase().trim();
            const games = MOCK_GAME_DTOS.filter((g) => g.name.toLowerCase().includes(q));
            const communities = MOCK_COMMUNITY_DTOS.filter(
                (c) => c.name.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q)
            );
            const posts = MOCK_POST_DTOS.filter(
                (p) => p.title?.toLowerCase().includes(q) || p.content.toLowerCase().includes(q)
            );
            const users = MOCK_USERS.filter(
                (u) => u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q)
            );

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
        }),

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
    getAll: (_params?: { userId?: string; page?: number; limit?: number }) =>
        callMock<NotificationDto[] | { items: NotificationDto[]; total?: number; data?: NotificationDto[] }>(() => ({
            items: MOCK_NOTIFICATIONS,
            data: MOCK_NOTIFICATIONS,
            total: MOCK_NOTIFICATIONS.length,
        })),

    create: (data: CreateNotificationDto) =>
        callMock<NotificationDto>({
            id: `notif-${Date.now()}`,
            userId: data.userId,
            title: data.title,
            message: data.message,
            type: data.type || "system",
            read: false,
            createdAt: new Date().toISOString(),
        }),

    markAsRead: (_id: string) =>
        callMock<void>(undefined),

    markAllAsRead: () =>
        callMock<void>(undefined),

    delete: (_id: string) =>
        callMock<void>(undefined),

    getUnreadCount: () =>
        callMock<{ count: number }>({ count: MOCK_NOTIFICATIONS.filter((n) => !n.read).length }),
};

// =========================================================================
// 20. STORAGE SERVICES (/storage/*)
// =========================================================================
export const storageApi = {
    getPresignedUrl: (_data: { type: import("../utils/image-processor").UploadType; originalSize: number; originalMimeType: string; postId?: string }) =>
        callMock<{ presignedUrl: string; fileKey: string }>({
            presignedUrl: "https://mock-storage.indieg.local/upload",
            fileKey: `mock_file_${Date.now()}`,
        }),

    deleteFile: (_fileKey: string) =>
        callMock<{ message?: string; success?: boolean }>({ message: "File deleted", success: true }),

    confirmUpload: (data: { fileKey: string; type?: string; entityId?: string }) =>
        callMock<{ message?: string; success?: boolean; url?: string }>({
            message: "Upload confirmed",
            success: true,
            url: `https://mock-storage.indieg.local/${data.fileKey}`,
        }),

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
