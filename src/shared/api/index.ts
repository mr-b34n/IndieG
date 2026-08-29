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

/**
 * 3. Profile Services (/profiles/*)
 */
export const profilesApi = {
    /** Get all profiles with pagination - GET /profiles?page=...&limit=... */
    getAll: (params?: { page?: number; limit?: number }) =>
        apiRequest<UserProfileDto[] | { items: UserProfileDto[]; total?: number }>("/profiles", {
            method: "GET",
            params,
        }),

    /** Get current user's profile - GET /profiles/me */
    getMyProfile: () =>
        apiRequest<UserProfileDto>("/profiles/me", {
            method: "GET",
        }),

    /** Update current user's profile - PATCH /profiles/me */
    updateMyProfile: (data: UpdateProfileDto) =>
        apiRequest<UserProfileDto>("/profiles/me", {
            method: "PATCH",
            body: data,
        }),

    /** Get user profile by username - GET /profiles/@{username} */
    getUserByUsername: (username: string) => {
        const cleanName = username.replace(/^@/, "");
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
    /** Get all communities - GET /communities?page=...&limit=... */
    getAll: (params?: { page?: number; limit?: number }) =>
        apiRequest<CommunityDto[] | { items: CommunityDto[]; total?: number }>("/communities", {
            method: "GET",
            params,
        }),

    /** Create a new community - POST /communities */
    create: (params: CreateCommunityDto) =>
        apiRequest<CommunityDto>("/communities", {
            method: "POST",
            params: {
                name: params.name,
                logo: params.logo,
                backdrop: params.backdrop,
                category: params.category,
                description: params.description,
                tags: params.tags,
            },
        }),

    /** Search communities - GET /communities/search */
    search: (params?: {
        page?: number;
        limit?: number;
        search?: string;
        category?: string;
        featured?: boolean;
    }) =>
        apiRequest<CommunityDto[] | { items: CommunityDto[]; total?: number }>(
            "/communities/search",
            {
                method: "GET",
                params,
            }
        ),

    /** Get community by ID - GET /communities/{id} */
    getById: (id: string) =>
        apiRequest<CommunityDto>(`/communities/${id}`, {
            method: "GET",
        }),

    /** Update community - PATCH /communities/{id} */
    update: (id: string, params: UpdateCommunityDto) =>
        apiRequest<CommunityDto>(`/communities/${id}`, {
            method: "PATCH",
            params: {
                name: params.name,
                logo: params.logo,
                backdrop: params.backdrop,
                category: params.category,
                description: params.description,
                tags: params.tags,
                featured: params.featured,
            },
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
    /** Get all posts - GET /posts */
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
            params,
        }),

    /** Create a post - POST /posts */
    createPost: (data: CreatePostDto) =>
        apiRequest<PostDto>("/posts", {
            method: "POST",
            body: data,
        }),

    /** Get post by ID - GET /posts/{id} */
    getPostById: (id: string) =>
        apiRequest<PostDto>(`/posts/${id}`, {
            method: "GET",
        }),

    /** Update post - PATCH /posts/{id} */
    updatePost: (id: string, data: UpdatePostDto) =>
        apiRequest<PostDto>(`/posts/${id}`, {
            method: "PATCH",
            body: data,
        }),

    /** Delete post - DELETE /posts/{id} */
    deletePost: (id: string) =>
        apiRequest<{ message?: string }>(`/posts/${id}`, {
            method: "DELETE",
        }),
};

/**
 * 6. Comment Services (/comments/*)
 */
export const commentsApi = {
    /** Get root comments for a post - GET /comments?postId=... */
    getRootComments: (params: { postId: string; page?: number; limit?: number }) =>
        apiRequest<CommentEntity[] | { items: CommentEntity[]; total?: number }>("/comments", {
            method: "GET",
            params,
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

    /** Get replies - GET /comments/reply-comments */
    getReplyComments: (params: { parentId: string; cursor?: string; limit?: number }) =>
        apiRequest<CommentEntity[] | { items: CommentEntity[] }>("/comments/reply-comments", {
            method: "GET",
            params,
        }),
};

/**
 * 7. Report Services (/reports/*)
 */
export const reportsApi = {
    /** Get all reports - GET /reports */
    getAll: (params?: {
        postId?: string;
        reporterId?: string;
        reason?: string;
        page?: number;
        limit?: number;
    }) =>
        apiRequest<ReportDto[] | { items: ReportDto[]; total?: number }>("/reports", {
            method: "GET",
            params,
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
