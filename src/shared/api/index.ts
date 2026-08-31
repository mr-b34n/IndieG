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
    type PostDto,
    type CreatePostDto,
    type UpdatePostDto,
    type CommentEntity,
    type CreateCommentDto,
    type ReportDto,
    type CreateReportDto,
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
};

function getLocalFallbackProfile(): UserProfileDto | null {
    if (typeof window === "undefined") return null;
    try {
        const savedUser = localStorage.getItem("indieg_auth_user");
        if (savedUser) {
            const user = JSON.parse(savedUser) as { id?: string; username?: string; avatar_url?: string; createdAt?: string };
            if (user && (user.id || user.username)) {
                const username = user.username || "Gamer";
                return {
                    id: user.id || "me",
                    username,
                    name: username,
                    avatarUrl: user.avatar_url || localStorage.getItem("user_custom_avatar") || undefined,
                    bio: "",
                    createdAt: user.createdAt || new Date().toISOString(),
                };
            }
        }
    } catch {
        // ignore parse errors
    }
    return null;
}

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
    getMyProfile: async () => {
        try {
            return await apiRequest<UserProfileDto>("/profiles/me", {
                method: "GET",
            });
        } catch (err: unknown) {
            const fallback = getLocalFallbackProfile();
            if (fallback) {
                return fallback;
            }
            throw err;
        }
    },

    /** Update current user's profile - PATCH /profiles/me */
    updateMyProfile: (data: UpdateProfileDto) =>
        apiRequest<UserProfileDto>("/profiles/me", {
            method: "PATCH",
            body: data,
        }),

    /** Get user profile by username - GET /profiles/@{username} */
    getUserByUsername: async (username: string) => {
        const cleanName = username.replace(/^@/, "");

        if (cleanName === "me" || cleanName === "demo") {
            return profilesApi.getMyProfile();
        }

        try {
            return await apiRequest<UserProfileDto>(`/profiles/@${encodeURIComponent(cleanName)}`, {
                method: "GET",
            });
        } catch (err: unknown) {
            const fallback = getLocalFallbackProfile();
            if (fallback && (fallback.username.toLowerCase() === cleanName.toLowerCase() || fallback.id === cleanName)) {
                return fallback;
            }
            throw err;
        }
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
    /** Get all communities - GET /communities?page=...&limit=... (max limit 50) */
    getAll: (params?: { page?: number; limit?: number }) =>
        apiRequest<CommunityDto[] | { items: CommunityDto[]; total?: number }>("/communities", {
            method: "GET",
            params: sanitizePaginationParams(params, 50),
        }),

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
    /** Get root comments for a post - GET /comments?postId=... (max limit 50) */
    getRootComments: (params: { postId: string; page?: number; limit?: number }) =>
        apiRequest<CommentEntity[] | { items: CommentEntity[]; total?: number }>("/comments", {
            method: "GET",
            params: sanitizePaginationParams(params, 50),
        }),

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

    /** Update comment - PATCH /comments/{id}?content=... */
    update: (id: string, content: string) =>
        apiRequest<CommentEntity>(`/comments/${id}`, {
            method: "PATCH",
            params: { content },
        }),

    /** Delete comment - DELETE /comments/{id} */
    delete: (id: string) =>
        apiRequest<{ message?: string }>(`/comments/${id}`, {
            method: "DELETE",
        }),

    /** Get replies - GET /comments/reply-comments (max limit 5) */
    getReplyComments: (params: { parentId: string | number; cursor?: string; limit?: number }) => {
        const parentIdStr = String(params.parentId ?? "").trim();
        return apiRequest<CommentEntity[] | { items: CommentEntity[] }>("/comments/reply-comments", {
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

