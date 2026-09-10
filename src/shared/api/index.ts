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
    type RootCommentsResponse,
    type ReplyCommentsResponse,
    type CreateCommentDto,
    type ReportDto,
    type CreateReportDto,
    type SearchCommunityMembersParams,
    type CommunityMemberActionDto,
    type VoteDto,
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
    type GetBookmarksParams,
    type CheckBookmarkParams,
    type BookmarkTargetType,
    type LibraryGameDto,
    type CreateLibraryGameDto,
    type UpdateLibraryGameDto,
    type FriendshipDto,
    type CreateFriendshipRequestDto,
} from "./types";

export * from "./client";
export * from "./types";

/** Helper to sanitize and clamp limit/page parameters based on OpenAPI schema constraints */
function sanitizePaginationParams<T extends { page?: number; limit?: number }>(
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

/** Extract pagination metadata (e.g. meta: { total, page, limit, totalPages }) from API responses */
export function extractPaginationMeta(
    res: unknown,
    fallbackTotal = 0,
    fallbackLimit = 9,
    fallbackPage = 1
): ApiPaginationMeta {
    if (res && typeof res === "object") {
        const obj = res as Record<string, unknown>;

        const metaObj = (
            typeof obj.meta === "object" && obj.meta !== null
                ? obj.meta
                : typeof obj.pagination === "object" && obj.pagination !== null
                ? obj.pagination
                : obj
        ) as Record<string, unknown>;

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
        if (obj.data && typeof obj.data === "object") {
            const nested = obj.data as Record<string, unknown>;
            if (Array.isArray(nested.data)) return nested.data as ReportDto[];
            if (Array.isArray(nested.items)) return nested.items as ReportDto[];
        }
        if (Array.isArray(obj.reports)) return obj.reports as ReportDto[];
        if (Array.isArray(obj.result)) return obj.result as ReportDto[];
    }
    return [];
}

/**
 * 1. Authentication Services (/auth/*)
 */
export const authApi = {
    /** Register a new account - POST /auth/register */
    register: (data: AuthRegisterDto) =>
        apiRequest<{ message?: string }>("/auth/register", {
            method: "POST",
            body: data,
        }),

    /** Verify email by token - GET /auth/verify-email?token=... */
    verifyEmail: (token: string) =>
        apiRequest<{ message?: string; success?: boolean }>("/auth/verify-email", {
            method: "GET",
            params: { token },
        }),

    /** Log in and receive access token - POST /auth/login */
    login: (data: AuthLoginDto) =>
        apiRequest<AuthLoginResponse>("/auth/login", {
            method: "POST",
            body: data,
        }),

    /** Request a password reset email - POST /auth/forgot-password */
    forgotPassword: (data: AuthForgotPasswordDto) =>
        apiRequest<{ message?: string }>("/auth/forgot-password", {
            method: "POST",
            body: data,
        }),

    /** Reset password with recovery token - POST /auth/reset-password */
    resetPassword: (data: AuthResetPasswordDto) =>
        apiRequest<{ message?: string }>("/auth/reset-password", {
            method: "POST",
            body: data,
        }),

    /** Refresh access token using refresh cookie - POST /auth/refresh */
    refresh: () =>
        apiRequest<{ accessToken?: string; token?: string }>("/auth/refresh", {
            method: "POST",
        }),

    /** Resend verification email - POST /auth/resend-verification */
    resendVerification: (data: AuthResendVerificationDto) =>
        apiRequest<{ message?: string }>("/auth/resend-verification", {
            method: "POST",
            body: data,
        }),

    /** Log out and revoke sessions - POST /auth/logout */
    logout: () =>
        apiRequest<{ message?: string }>("/auth/logout", {
            method: "POST",
        }),
};

/**
 * 2. User & Session Services (/users/*)
 */
export const usersApi = {
    /** Get all users - GET /users */
    getAll: () =>
        apiRequest<UserProfileDto[]>("/users", {
            method: "GET",
        }),

    /** Change account password - PATCH /users/change-password */
    changePassword: (data: ChangePasswordDto) =>
        apiRequest<{ message?: string }>("/users/change-password", {
            method: "PATCH",
            body: data,
        }),

    /** Get active sessions - GET /users/sessions */
    getSessions: () =>
        apiRequest<UserSessionDto[]>("/users/sessions", {
            method: "GET",
        }),

    /** Revoke a specific session - PATCH /users/revoke-session/{id} */
    revokeSession: (id: string) =>
        apiRequest<{ message?: string }>(`/users/revoke-session/${encodeURIComponent(id)}`, {
            method: "PATCH",
        }),
};

let myProfileInFlightPromise: Promise<UserProfileDto> | null = null;

/**
 * 3. Profile Services (/profiles/*)
 */
export const profilesApi = {
    /** Get all profiles with optional pagination - GET /profiles?page=...&limit=... (max limit 75) */
    getAll: (params?: { page?: number; limit?: number }) =>
        apiRequest<UserProfileDto[] | { items: UserProfileDto[]; total?: number }>("/profiles", {
            method: "GET",
            params: sanitizePaginationParams(params, 75),
        }),

    /** Get current user's profile - GET /profiles/me */
    getMyProfile: () => {
        if (myProfileInFlightPromise) {
            return myProfileInFlightPromise;
        }
        myProfileInFlightPromise = (async () => {
            const res = await apiRequest<UserProfileDto | { success?: boolean; user?: UserProfileDto; profile?: UserProfileDto; data?: UserProfileDto }>("/profiles/me", {
                method: "GET",
            });
            if (res && typeof res === "object") {
                if ("user" in res && res.user && typeof res.user === "object") {
                    return res.user as UserProfileDto;
                }
                if ("profile" in res && res.profile && typeof res.profile === "object") {
                    return res.profile as UserProfileDto;
                }
                if ("data" in res && res.data && typeof res.data === "object") {
                    return res.data as UserProfileDto;
                }
            }
            return res as UserProfileDto;
        })().finally(() => {
            myProfileInFlightPromise = null;
        });
        return myProfileInFlightPromise;
    },

    /** Update current user's profile - PATCH /profiles/me */
    updateMyProfile: async (data: UpdateProfileDto) => {
        const res = await apiRequest<UserProfileDto | { success?: boolean; user?: UserProfileDto; profile?: UserProfileDto; data?: UserProfileDto }>("/profiles/me", {
            method: "PATCH",
            body: data,
        });
        if (res && typeof res === "object") {
            if ("user" in res && res.user && typeof res.user === "object") {
                return res.user as UserProfileDto;
            }
            if ("profile" in res && res.profile && typeof res.profile === "object") {
                return res.profile as UserProfileDto;
            }
            if ("data" in res && res.data && typeof res.data === "object") {
                return res.data as UserProfileDto;
            }
        }
        return res as UserProfileDto;
    },

    /** Get user profile by username - GET /profiles/@{username} */
    getUserByUsername: async (username: string) => {
        const cleanName = username.replace(/^@/, "");

        if (cleanName === "me" || cleanName === "demo") {
            return profilesApi.getMyProfile();
        }

        const res = await apiRequest<UserProfileDto | { success?: boolean; user?: UserProfileDto; profile?: UserProfileDto; data?: UserProfileDto }>(`/profiles/@${encodeURIComponent(cleanName)}`, {
            method: "GET",
        });

        if (res && typeof res === "object") {
            if ("user" in res && res.user && typeof res.user === "object") {
                return res.user as UserProfileDto;
            }
            if ("profile" in res && res.profile && typeof res.profile === "object") {
                return res.profile as UserProfileDto;
            }
            if ("data" in res && res.data && typeof res.data === "object") {
                return res.data as UserProfileDto;
            }
        }
        return res as UserProfileDto;
    },

    /** Toggle archived status - PATCH /profiles/archived */
    toggleArchived: () =>
        apiRequest<{ message?: string; archived?: boolean }>("/profiles/archived", {
            method: "PATCH",
        }),

    /** Delete user by ID - DELETE /profiles/{id} */
    deleteUser: (id: string) =>
        apiRequest<{ message?: string }>(`/profiles/${id}`, {
            method: "DELETE",
        }),
};

/**
 * 4. Community Services (/communities/*)
 */
export const communitiesApi = {
    /** Get all communities - GET /communities?type=...&page=...&limit=... (max limit 50) */
    getAll: (params?: GetCommunitiesParams) => {
        const page = params?.page ?? 1;
        const limit = params?.limit ?? 20;
        return apiRequest<CommunityDto[] | { items: CommunityDto[]; total?: number; data?: CommunityDto[] }>("/communities", {
            method: "GET",
            params: {
                ...(params?.type ? { type: params.type } : {}),
                ...sanitizePaginationParams({ page, limit }, 50),
            },
        });
    },

    /** Create a new community - POST /communities (supports query parameters per OpenAPI and body) */
    create: (data: CreateCommunityDto) =>
        apiRequest<CommunityDto>("/communities", {
            method: "POST",
            params: {
                name: data.name,
                logo: data.logo,
                backdrop: data.backdrop,
                category: data.category,
                description: data.description,
                tags: data.tags,
            },
            body: data,
        }),

    /** Search communities - GET /communities/search (max limit 50) */
    search: (params?: {
        page?: number;
        limit?: number;
        search?: string;
        category?: string;
        featured?: boolean;
    }) =>
        apiRequest<CommunityDto[] | { items: CommunityDto[]; total?: number; data?: CommunityDto[] }>(
            "/communities/search",
            {
                method: "GET",
                params: sanitizePaginationParams(params, 50),
            }
        ),

    /** Get community by ID - GET /communities/{id} */
    getById: (id: string) =>
        apiRequest<CommunityDto>(`/communities/${id}`, {
            method: "GET",
        }),

    /** Update community - PATCH /communities/{id} (supports query params per OpenAPI and body) */
    update: (id: string, data: UpdateCommunityDto) =>
        apiRequest<CommunityDto>(`/communities/${id}`, {
            method: "PATCH",
            params: {
                name: data.name,
                logo: data.logo,
                backdrop: data.backdrop,
                category: data.category,
                description: data.description,
                tags: data.tags,
                featured: data.featured,
            },
            body: data,
        }),

    /** Delete community - DELETE /communities/{id} */
    delete: (id: string) =>
        apiRequest<{ message?: string }>(`/communities/${id}`, {
            method: "DELETE",
        }),

    /** Join community - POST /communities/{communityId}/members */
    join: (communityId: string) =>
        apiRequest<CommunityMemberDto>(`/communities/${communityId}/members`, {
            method: "POST",
        }),

    /** Leave community - PATCH /communities/{communityId}/members */
    leave: (communityId: string) =>
        apiRequest<{ message?: string } | void>(`/communities/${communityId}/members`, {
            method: "PATCH",
        }),

    /** Get/Search community members - GET /communities/{communityId}/members */
    getMembers: (communityId: string, params?: GetCommunityMembersParams) => {
        const query = new URLSearchParams();
        if (params?.keyword !== undefined) query.set("keyword", params.keyword);
        if (params?.page !== undefined) query.set("page", String(params.page));
        if (params?.limit !== undefined) query.set("limit", String(params.limit));
        const qs = query.toString() ? `?${query.toString()}` : "";
        return apiRequest<CommunityMembersResponseDto | CommunityMemberDto[]>(
            `/communities/${communityId}/members${qs}`
        );
    },
};

/**
 * 4.1. Community Member Services (CommunityMemberController)
 */
export const communityMembersApi = {
    /** Get community members list - GET /communities/{communityId}/members */
    getMembers: (communityId: string, params?: GetCommunityMembersParams) =>
        apiRequest<CommunityMembersResponseDto | CommunityMemberDto[]>(
            `/communities/${encodeURIComponent(communityId)}/members`,
            {
                method: "GET",
                params: sanitizePaginationParams(params, 50),
            }
        ),

    /** Get pending community members list - GET /communities/{communityId}/members/pending */
    getPendingMembers: (communityId: string, params?: GetCommunityMembersParams) =>
        apiRequest<CommunityMembersResponseDto | CommunityMemberDto[]>(
            `/communities/${encodeURIComponent(communityId)}/members/pending`,
            {
                method: "GET",
                params: sanitizePaginationParams(params, 50),
            }
        ),

    /** Search community members by keyword - GET /communities/{communityId}/members/search */
    search: (communityId: string, params: SearchCommunityMembersParams) =>
        apiRequest<CommunityMembersResponseDto | CommunityMemberDto[]>(
            `/communities/${encodeURIComponent(communityId)}/members/search`,
            {
                method: "GET",
                params: sanitizePaginationParams(params, 50),
            }
        ),

    /** Backward-compatible alias for finding members by query */
    findByQuery: (communityId: string, params?: GetCommunityMembersParams) => {
        if (params?.keyword && params.keyword.trim().length >= 3) {
            return communityMembersApi.search(communityId, {
                keyword: params.keyword.trim(),
                page: params.page,
                limit: params.limit,
            });
        }
        return communityMembersApi.getMembers(communityId, params);
    },

    /** Join a community - POST /communities/{communityId}/members */
    join: (communityId: string) =>
        apiRequest<CommunityMemberDto>(`/communities/${encodeURIComponent(communityId)}/members`, {
            method: "POST",
        }),

    /** Leave a community - PATCH /communities/{communityId}/members */
    leave: (communityId: string) =>
        apiRequest<{ message?: string } | void>(`/communities/${encodeURIComponent(communityId)}/members`, {
            method: "PATCH",
        }),

    /** Get current user's membership status in community - GET /communities/{communityId}/members/me */
    me: (communityId: string) =>
        apiRequest<CommunityMemberDto>(`/communities/${encodeURIComponent(communityId)}/members/me`, {
            method: "GET",
        }),

    /** Approve member join request - PATCH /communities/{communityId}/members/approve */
    approveJoinRequest: (communityId: string, data?: CommunityMemberActionDto) =>
        apiRequest<{ message?: string }>(`/communities/${encodeURIComponent(communityId)}/members/approve`, {
            method: "PATCH",
            body: data,
        }),

    /** Reject member join request - PATCH /communities/{communityId}/members/reject */
    rejectJoinRequest: (communityId: string, data?: CommunityMemberActionDto) =>
        apiRequest<{ message?: string }>(`/communities/${encodeURIComponent(communityId)}/members/reject`, {
            method: "PATCH",
            body: data,
        }),

    /** Toggle mute a member - PATCH /communities/{communityId}/members/toggle-mute */
    toggleMute: (communityId: string, data?: CommunityMemberActionDto) =>
        apiRequest<{ message?: string }>(`/communities/${encodeURIComponent(communityId)}/members/toggle-mute`, {
            method: "PATCH",
            body: data,
        }),

    /** Backward-compatible alias for toggleMute */
    muteMember: (communityId: string, data?: CommunityMemberActionDto) =>
        communityMembersApi.toggleMute(communityId, data),

    /** Ban a member - PATCH /communities/{communityId}/members/ban */
    banMember: (communityId: string, data?: CommunityMemberActionDto) =>
        apiRequest<{ message?: string }>(`/communities/${encodeURIComponent(communityId)}/members/ban`, {
            method: "PATCH",
            body: data,
        }),
};

/**
 * 5. Post Services (/posts/*)
 */
export const postsApi = {
    /** Get all posts - GET /posts (max limit 50) */
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

    /** Create a post - POST /posts */
    createPost: (data: CreatePostDto) =>
        apiRequest<PostDto>("/posts", {
            method: "POST",
            body: data,
        }),

    /** Get post by ID - GET /posts/{id} */
    getPostById: (id: string | number) =>
        apiRequest<PostDto>(`/posts/${id}`, {
            method: "GET",
        }),

    /** Update post - PATCH /posts/{id} */
    updatePost: (id: string | number, data: UpdatePostDto) =>
        apiRequest<PostDto>(`/posts/${id}`, {
            method: "PATCH",
            body: data,
        }),

    /** Delete post - DELETE /posts/{id} */
    deletePost: (id: string | number) =>
        apiRequest<{ message?: string }>(`/posts/${id}`, {
            method: "DELETE",
        }),
};

/**
 * 6. Comment Services (/comments/*)
 */
export const commentsApi = {
    /** Get root comments for a post - GET /comments/post/{postId}/root (max limit 50) */
    getRootComments: (params: { postId: string; page?: number; limit?: number }) => {
        const { postId, page, limit } = params;
        return apiRequest<RootCommentsResponse>(`/comments/post/${encodeURIComponent(postId)}/root`, {
            method: "GET",
            params: sanitizePaginationParams({ page, limit }, 50),
        });
    },

    /** Create a comment - POST /comments */
    create: (data: CreateCommentDto) =>
        apiRequest<CommentEntity>("/comments", {
            method: "POST",
            body: data,
        }),

    /** Get comment by ID - GET /comments/{id} */
    getOne: (id: string) =>
        apiRequest<CommentEntity>(`/comments/${id}`, {
            method: "GET",
        }),

    /** Update comment - PATCH /comments/{id} */
    update: (id: string, payload: UpdateCommentDto | string | { content: string }) => {
        const contentStr = typeof payload === "string" ? payload : payload.content;
        return apiRequest<CommentEntity>(`/comments/${id}`, {
            method: "PATCH",
            body: { content: contentStr },
            params: { content: contentStr },
        });
    },

    /** Delete comment - DELETE /comments/{id} */
    delete: (id: string) =>
        apiRequest<{ message?: string }>(`/comments/${id}`, {
            method: "DELETE",
        }),

    /** Get replies - GET /comments/replies (limit min 1, max 5 per OpenAPI) */
    getReplyComments: (params: { parentId: string | number; cursor?: string; limit?: number }) => {
        const parentIdStr = String(params.parentId ?? "").trim();
        return apiRequest<ReplyCommentsResponse>("/comments/replies", {
            method: "GET",
            params: sanitizePaginationParams(
                {
                    ...params,
                    parentId: parentIdStr,
                },
                5
            ),
        });
    },
};

/**
 * 7. Report Services (/reports/*)
 */
export const reportsApi = {
    /** Get all reports - GET /reports (max limit 50) */
    getAll: (params?: {
        postId?: string;
        reporterId?: string;
        reason?: string;
        page?: number;
        limit?: number;
    }) =>
        apiRequest<ReportDto[] | { items: ReportDto[]; total?: number }>("/reports", {
            method: "GET",
            params: sanitizePaginationParams(params, 50),
        }),

    /** Create a report - POST /reports */
    create: (data: CreateReportDto) =>
        apiRequest<ReportDto>("/reports", {
            method: "POST",
            body: data,
        }),

    /** Get report by ID - GET /reports/{id} */
    getOne: (id: string) =>
        apiRequest<ReportDto>(`/reports/${id}`, {
            method: "GET",
        }),

    /** Update report reason - PATCH /reports/{id} */
    update: (id: string, reason: string) =>
        apiRequest<ReportDto>(`/reports/${id}`, {
            method: "PATCH",
            body: { reason },
        }),

    /** Delete report - DELETE /reports/{id} */
    delete: (id: string) =>
        apiRequest<{ message?: string }>(`/reports/${id}`, {
            method: "DELETE",
        }),
};

/**
 * 8. Vote Services (/votes/*) (VoteController)
 */
export const votesApi = {
    /** Get all votes - GET /votes */
    getAll: () =>
        apiRequest<VoteDto[]>("/votes", {
            method: "GET",
        }),

    /** Get vote status for a post - GET /votes/post/{postId} */
    getByPost: (postId: string | number) =>
        apiRequest<VoteDto | { hasVoted?: boolean; score?: number }>(
            `/votes/post/${encodeURIComponent(postId)}`,
            {
                method: "GET",
            }
        ),

    /** Upvote a post - POST /votes/post/{postId} */
    upVotePost: (postId: string | number) =>
        apiRequest<{ message?: string; success?: boolean }>(
            `/votes/post/${encodeURIComponent(postId)}`,
            {
                method: "POST",
            }
        ),

    /** Delete vote for a post - DELETE /votes/{postId}/post */
    deleteVotePost: (postId: string | number) =>
        apiRequest<{ message?: string; success?: boolean }>(
            `/votes/${encodeURIComponent(postId)}/post`,
            {
                method: "DELETE",
            }
        ),

    /** Get vote status for a comment - GET /votes/comment/{commentId} */
    getByComment: (commentId: string | number) =>
        apiRequest<VoteDto | { hasVoted?: boolean; score?: number }>(
            `/votes/comment/${encodeURIComponent(commentId)}`,
            {
                method: "GET",
            }
        ),

    /** Upvote a comment - POST /votes/comment/{commentId} */
    upVoteComment: (commentId: string | number) =>
        apiRequest<{ message?: string; success?: boolean }>(
            `/votes/comment/${encodeURIComponent(commentId)}`,
            {
                method: "POST",
            }
        ),

    /** Delete vote for a comment - DELETE /votes/{commentId}/comment */
    deleteVoteComment: (commentId: string | number) =>
        apiRequest<{ message?: string; success?: boolean }>(
            `/votes/${encodeURIComponent(commentId)}/comment`,
            {
                method: "DELETE",
            }
        ),
};

/**
 * 9. Games Services (/games/*)
 */
export const gamesApi = {
    /** Create game - POST /games */
    create: (data: CreateGameDto) =>
        apiRequest<GameDto>("/games", {
            method: "POST",
            body: data,
        }),

    /** Get games list - GET /games */
    getAll: (params?: GetGamesParams) =>
        apiRequest<GameDto[] | { items: GameDto[]; total?: number }>("/games", {
            method: "GET",
            params: params ? sanitizePaginationParams(params, 50) : undefined,
        }),

    /** Get game by slug - GET /games/slug/{slug} */
    getBySlug: (slug: string) =>
        apiRequest<GameDto>(`/games/slug/${encodeURIComponent(slug)}`, {
            method: "GET",
        }),

    /** Get game by appid - GET /games/{appid} */
    getByAppid: (appid: number | string) =>
        apiRequest<GameDto>(`/games/${encodeURIComponent(String(appid))}`, {
            method: "GET",
        }),

    /** Update game - PATCH /games/{appid} */
    update: (appid: number | string, data: UpdateGameDto) =>
        apiRequest<GameDto>(`/games/${encodeURIComponent(String(appid))}`, {
            method: "PATCH",
            body: data,
        }),

    /** Delete game - DELETE /games/{appid} */
    delete: (appid: number | string) =>
        apiRequest<void>(`/games/${encodeURIComponent(String(appid))}`, {
            method: "DELETE",
        }),
};

/**
 * 10. Game Guides Services (/games/{appid}/guides/*)
 */
export const gameGuidesApi = {
    /** Get game guides - GET /games/{appid}/guides */
    getAll: (appid: number | string, params?: GetGameGuidesParams) =>
        apiRequest<GameGuideDto[] | { items: GameGuideDto[]; total?: number }>(
            `/games/${encodeURIComponent(String(appid))}/guides`,
            {
                method: "GET",
                params: params ? sanitizePaginationParams(params, 50) : undefined,
            }
        ),

    /** Create game guide - POST /games/{appid}/guides */
    create: (appid: number | string, data: CreateGameGuideDto) =>
        apiRequest<GameGuideDto>(`/games/${encodeURIComponent(String(appid))}/guides`, {
            method: "POST",
            body: data,
        }),

    /** Get game guide by ID - GET /games/{appid}/guides/{id} */
    getById: (appid: number | string, id: string) =>
        apiRequest<GameGuideDto>(
            `/games/${encodeURIComponent(String(appid))}/guides/${encodeURIComponent(id)}`,
            {
                method: "GET",
            }
        ),

    /** Update game guide - PATCH /games/{appid}/guides/{id} */
    update: (appid: number | string, id: string, data: UpdateGameGuideDto) =>
        apiRequest<GameGuideDto>(
            `/games/${encodeURIComponent(String(appid))}/guides/${encodeURIComponent(id)}`,
            {
                method: "PATCH",
                body: data,
            }
        ),

    /** Delete game guide - DELETE /games/{appid}/guides/{id} */
    delete: (appid: number | string, id: string) =>
        apiRequest<void>(
            `/games/${encodeURIComponent(String(appid))}/guides/${encodeURIComponent(id)}`,
            {
                method: "DELETE",
            }
        ),

    /** Like/unlike game guide - PATCH /games/{appid}/guides/{id}/like */
    like: (appid: number | string, id: string) =>
        apiRequest<{ message?: string; success?: boolean }>(
            `/games/${encodeURIComponent(String(appid))}/guides/${encodeURIComponent(id)}/like`,
            {
                method: "PATCH",
            }
        ),
};

/**
 * 11. Game Reviews Services (/games/{appid}/reviews/*)
 */
export const gameReviewsApi = {
    /** Get game reviews - GET /games/{appid}/reviews */
    getAll: (appid: number | string, params?: GetGameReviewsParams) =>
        apiRequest<GameReviewDto[] | { items: GameReviewDto[]; total?: number }>(
            `/games/${encodeURIComponent(String(appid))}/reviews`,
            {
                method: "GET",
                params: params ? sanitizePaginationParams(params, 50) : undefined,
            }
        ),

    /** Create game review - POST /games/{appid}/reviews */
    create: (appid: number | string, data: CreateGameReviewDto) =>
        apiRequest<GameReviewDto>(`/games/${encodeURIComponent(String(appid))}/reviews`, {
            method: "POST",
            body: data,
        }),

    /** Get game review by ID - GET /games/{appid}/reviews/{id} */
    getById: (appid: number | string, id: string) =>
        apiRequest<GameReviewDto>(
            `/games/${encodeURIComponent(String(appid))}/reviews/${encodeURIComponent(id)}`,
            {
                method: "GET",
            }
        ),

    /** Update game review - PATCH /games/{appid}/reviews/{id} */
    update: (appid: number | string, id: string, data: UpdateGameReviewDto) =>
        apiRequest<GameReviewDto>(
            `/games/${encodeURIComponent(String(appid))}/reviews/${encodeURIComponent(id)}`,
            {
                method: "PATCH",
                body: data,
            }
        ),

    /** Delete game review - DELETE /games/{appid}/reviews/{id} */
    delete: (appid: number | string, id: string) =>
        apiRequest<void>(
            `/games/${encodeURIComponent(String(appid))}/reviews/${encodeURIComponent(id)}`,
            {
                method: "DELETE",
            }
        ),

    /** Like/unlike game review - PATCH /games/{appid}/reviews/{id}/like */
    like: (appid: number | string, id: string) =>
        apiRequest<{ message?: string; success?: boolean }>(
            `/games/${encodeURIComponent(String(appid))}/reviews/${encodeURIComponent(id)}/like`,
            {
                method: "PATCH",
            }
        ),
};

/**
 * 12. Game Patch Notes Services (/games/{appid}/patch-notes/*)
 */
export const gamePatchNotesApi = {
    /** Get game patch notes - GET /games/{appid}/patch-notes */
    getAll: (appid: number | string, params?: GetGamePatchNotesParams) =>
        apiRequest<GamePatchNoteDto[] | { items: GamePatchNoteDto[]; total?: number }>(
            `/games/${encodeURIComponent(String(appid))}/patch-notes`,
            {
                method: "GET",
                params: params ? sanitizePaginationParams(params, 50) : undefined,
            }
        ),

    /** Create game patch note - POST /games/{appid}/patch-notes */
    create: (appid: number | string, data: CreateGamePatchNoteDto) =>
        apiRequest<GamePatchNoteDto>(`/games/${encodeURIComponent(String(appid))}/patch-notes`, {
            method: "POST",
            body: data,
        }),

    /** Get game patch note by ID - GET /games/{appid}/patch-notes/{id} */
    getById: (appid: number | string, id: string) =>
        apiRequest<GamePatchNoteDto>(
            `/games/${encodeURIComponent(String(appid))}/patch-notes/${encodeURIComponent(id)}`,
            {
                method: "GET",
            }
        ),

    /** Update game patch note - PATCH /games/{appid}/patch-notes/{id} */
    update: (appid: number | string, id: string, data: UpdateGamePatchNoteDto) =>
        apiRequest<GamePatchNoteDto>(
            `/games/${encodeURIComponent(String(appid))}/patch-notes/${encodeURIComponent(id)}`,
            {
                method: "PATCH",
                body: data,
            }
        ),

    /** Delete game patch note - DELETE /games/{appid}/patch-notes/{id} */
    delete: (appid: number | string, id: string) =>
        apiRequest<void>(
            `/games/${encodeURIComponent(String(appid))}/patch-notes/${encodeURIComponent(id)}`,
            {
                method: "DELETE",
            }
        ),
};

/**
 * 12. Guestbook Comments Services (/profiles/{profileId}/guestbook-comments/*)
 */
export const guestbookCommentsApi = {
    /** Get guestbook comments by profile ID - GET /profiles/{profileId}/guestbook-comments */
    getByProfileId: (profileId: string) =>
        apiRequest<GuestbookCommentDto[]>(
            `/profiles/${encodeURIComponent(profileId)}/guestbook-comments`
        ),

    /** Create guestbook comment - POST /profiles/{profileId}/guestbook-comments */
    create: (profileId: string, data: CreateGuestbookCommentDto) =>
        apiRequest<GuestbookCommentDto>(
            `/profiles/${encodeURIComponent(profileId)}/guestbook-comments`,
            {
                method: "POST",
                body: data,
            }
        ),

    /** Delete guestbook comment - DELETE /profiles/{profileId}/guestbook-comments/{id} */
    delete: (profileId: string, id: string) =>
        apiRequest<void>(
            `/profiles/${encodeURIComponent(profileId)}/guestbook-comments/${encodeURIComponent(id)}`,
            {
                method: "DELETE",
            }
        ),
};

/**
 * 13. Bookmarks Services (/bookmarks/*)
 */
export const bookmarksApi = {
    /** Create a bookmark - POST /bookmarks */
    create: (data: CreateBookmarkDto) =>
        apiRequest<BookmarkDto>("/bookmarks", {
            method: "POST",
            body: data,
        }),

    /** Get user bookmarks - GET /bookmarks */
    getAll: (params?: GetBookmarksParams) =>
        apiRequest<BookmarkDto[]>("/bookmarks", {
            params,
        }),

    /** Check if target is bookmarked - GET /bookmarks/check */
    check: (params: CheckBookmarkParams) =>
        apiRequest<{ bookmarked: boolean; id?: string }>("/bookmarks/check", {
            params,
        }),

    /** Toggle bookmark - POST /bookmarks/toggle */
    toggle: (data?: { targetType?: string; targetId?: string }) =>
        apiRequest<{ bookmarked: boolean; id?: string }>("/bookmarks/toggle", {
            method: "POST",
            body: data,
        }),

    /** Delete bookmark by target - DELETE /bookmarks/{targetType}/{targetId} */
    delete: (targetType: BookmarkTargetType, targetId: string) =>
        apiRequest<void>(
            `/bookmarks/${encodeURIComponent(targetType)}/${encodeURIComponent(targetId)}`,
            {
                method: "DELETE",
            }
        ),
};

/**
 * 14. Library Games Services (/library-games/*, /users/{userId}/library-games)
 */
export const libraryGamesApi = {
    /** Get user library games - GET /users/{userId}/library-games */
    getByUserId: (userId: string) =>
        apiRequest<LibraryGameDto[]>(
            `/users/${encodeURIComponent(userId)}/library-games`
        ),

    /** Add game to library - POST /library-games */
    create: (data: CreateLibraryGameDto) =>
        apiRequest<LibraryGameDto>("/library-games", {
            method: "POST",
            body: data,
        }),

    /** Sync library games - POST /library-games/sync */
    sync: (data?: Record<string, unknown>) =>
        apiRequest<unknown>("/library-games/sync", {
            method: "POST",
            body: data || {},
        }),

    /** Update library game entry - PATCH /library-games/{id} */
    update: (id: string, data: UpdateLibraryGameDto) =>
        apiRequest<LibraryGameDto>(`/library-games/${encodeURIComponent(id)}`, {
            method: "PATCH",
            body: data,
        }),

    /** Delete library game entry - DELETE /library-games/{id} */
    delete: (id: string) =>
        apiRequest<void>(`/library-games/${encodeURIComponent(id)}`, {
            method: "DELETE",
        }),
};

/**
 * 15. Friendships Services (/friendships/*)
 */
export const friendshipsApi = {
    /** Send friend request - POST /friendships/requests */
    sendRequest: (data: CreateFriendshipRequestDto) =>
        apiRequest<FriendshipDto>("/friendships/requests", {
            method: "POST",
            body: data,
        }),

    /** Accept friend request - PATCH /friendships/{id}/accept */
    acceptRequest: (id: string) =>
        apiRequest<FriendshipDto>(`/friendships/${encodeURIComponent(id)}/accept`, {
            method: "PATCH",
        }),

    /** Cancel friend request - DELETE /friendships/{id}/request */
    cancelRequest: (id: string) =>
        apiRequest<void>(`/friendships/${encodeURIComponent(id)}/request`, {
            method: "DELETE",
        }),

    /** Unfriend - DELETE /friendships/{id}/unfriend */
    unfriend: (id: string) =>
        apiRequest<void>(`/friendships/${encodeURIComponent(id)}/unfriend`, {
            method: "DELETE",
        }),

    /** Block user - POST /friendships/block/{targetUserId} */
    block: (targetUserId: string) =>
        apiRequest<FriendshipDto>(`/friendships/block/${encodeURIComponent(targetUserId)}`, {
            method: "POST",
        }),

    /** Unblock user - DELETE /friendships/{id}/unblock */
    unblock: (id: string) =>
        apiRequest<void>(`/friendships/${encodeURIComponent(id)}/unblock`, {
            method: "DELETE",
        }),

    /** Get friends list - GET /friendships/friends */
    getFriends: () =>
        apiRequest<FriendshipDto[] | UserProfileDto[]>("/friendships/friends"),

    /** Get incoming requests - GET /friendships/requests/incoming */
    getIncomingRequests: () =>
        apiRequest<FriendshipDto[]>("/friendships/requests/incoming"),

    /** Get outgoing requests - GET /friendships/requests/outgoing */
    getOutgoingRequests: () =>
        apiRequest<FriendshipDto[]>("/friendships/requests/outgoing"),

    /** Get blocked list - GET /friendships/blocked */
    getBlocked: () =>
        apiRequest<FriendshipDto[]>("/friendships/blocked"),
};

export const storageApi = {
    /** Get presigned URL for upload - POST /storage/presigned-url */
    getPresignedUrl: (data: { type: import("../utils/image-processor").UploadType; originalSize: number; originalMimeType: string; postId?: string }) =>
        apiRequest<{ presignedUrl: string; fileKey: string }>("/storage/presigned-url", {
            method: "POST",
            body: data,
        }),
    /** Direct R2 upload helper */
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

