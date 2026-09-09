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
        myProfileInFlightPromise = apiRequest<UserProfileDto>("/profiles/me", {
            method: "GET",
        }).finally(() => {
            myProfileInFlightPromise = null;
        });
        return myProfileInFlightPromise;
    },

    /** Update current user's profile - PATCH /profiles/me */
    updateMyProfile: (data: UpdateProfileDto) =>
        apiRequest<UserProfileDto>("/profiles/me", {
            method: "PATCH",
            body: data,
        }),

    /** Get user profile by username - GET /profiles/@{username} */
    getUserByUsername: (username: string) => {
        const cleanName = username.replace(/^@/, "");

        if (cleanName === "me" || cleanName === "demo") {
            return profilesApi.getMyProfile();
        }

        return apiRequest<UserProfileDto>(`/profiles/@${encodeURIComponent(cleanName)}`, {
            method: "GET",
        });
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

    /** Mute a member - PATCH /communities/{communityId}/members/mute */
    muteMember: (communityId: string, data?: CommunityMemberActionDto) =>
        apiRequest<{ message?: string }>(`/communities/${encodeURIComponent(communityId)}/members/mute`, {
            method: "PATCH",
            body: data,
        }),

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

    /** Get replies - GET /comments/replies (max limit 50) */
    getReplyComments: (params: { parentId: string | number; cursor?: string; limit?: number }) => {
        const parentIdStr = String(params.parentId ?? "").trim();
        return apiRequest<ReplyCommentsResponse>("/comments/replies", {
            method: "GET",
            params: sanitizePaginationParams(
                {
                    ...params,
                    parentId: parentIdStr,
                },
                50
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

