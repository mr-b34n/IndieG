import { apiRequest } from "./client";

export const authApi = {
    register: (data: { email: string; password: string }) =>
        apiRequest("/auth/register", { method: "POST", body: JSON.stringify(data) }),
    
    verifyEmail: (token: string) =>
        apiRequest(`/auth/verify-email?token=${encodeURIComponent(token)}`, { method: "GET" }),
    
    login: (data: { email: string; password: string }) =>
        apiRequest("/auth/login", { method: "POST", body: JSON.stringify(data) }),
    
    forgotPassword: (data: { email: string }) =>
        apiRequest("/auth/forgot-password", { method: "POST", body: JSON.stringify(data) }),
    
    resetPassword: (data: { token: string; newPassword: string }) =>
        apiRequest("/auth/reset-password", { method: "POST", body: JSON.stringify(data) }),
    
    refresh: () =>
        apiRequest("/auth/refresh", { method: "POST" }),
    
    resendVerification: (data: { email: string }) =>
        apiRequest("/auth/resend-verification", { method: "POST", body: JSON.stringify(data) }),
    
    logout: () =>
        apiRequest("/auth/logout", { method: "POST" }),
};

export const usersApi = {
    getAll: () =>
        apiRequest("/users", { method: "GET" }),
    
    changePassword: (data: { oldPassword: string; newPassword: string }) =>
        apiRequest("/users/change-password", { method: "PATCH", body: JSON.stringify(data) }),
    
    getSessions: () =>
        apiRequest("/users/sessions", { method: "GET" }),
};

export const profilesApi = {
    getAll: (params?: { page?: number; limit?: number }) => {
        const query = params ? new URLSearchParams(params as Record<string, unknown> as Record<string, string>).toString() : "";
        return apiRequest(`/profiles${query ? `?${query}` : ""}`, { method: "GET" });
    },

    getMyProfile: () =>
        apiRequest("/profiles/me", { method: "GET" }),

    updateMyProfile: (data: { username?: string; name?: string; bio?: string; avatarUrl?: string; coverUrl?: string }) =>
        apiRequest("/profiles/me", { method: "PATCH", body: JSON.stringify(data) }),

    getUserByUsername: (username: string) =>
        apiRequest(`/profiles/@${encodeURIComponent(username)}`, { method: "GET" }),

    toggleArchived: () =>
        apiRequest("/profiles/archived", { method: "PATCH" }),

    deleteUser: (id: string) =>
        apiRequest(`/profiles/${id}`, { method: "DELETE" }),
};

export const communitiesApi = {
    getAll: (params?: { page?: number; limit?: number }) => {
        const query = params ? new URLSearchParams(params as Record<string, unknown> as Record<string, string>).toString() : "";
        return apiRequest(`/communities${query ? `?${query}` : ""}`, { method: "GET" });
    },

    create: (params: { name: string; logo?: string; backdrop?: string; category?: string; description?: string; tags?: string[] }) => {
        const query = new URLSearchParams(params as Record<string, unknown> as Record<string, string>).toString();
        return apiRequest(`/communities?${query}`, { method: "POST" });
    },

    search: (params?: { page?: number; limit?: number; search?: string; category?: string; featured?: boolean }) => {
        const query = params ? new URLSearchParams(params as Record<string, unknown> as Record<string, string>).toString() : "";
        return apiRequest(`/communities/search${query ? `?${query}` : ""}`, { method: "GET" });
    },

    getById: (id: string) =>
        apiRequest(`/communities/${id}`, { method: "GET" }),

    update: (id: string, params: { name?: string; logo?: string; backdrop?: string; category?: string; description?: string; tags?: string[]; featured?: boolean }) => {
        const query = new URLSearchParams(params as Record<string, unknown> as Record<string, string>).toString();
        return apiRequest(`/communities/${id}?${query}`, { method: "PATCH" });
    },

    delete: (id: string) =>
        apiRequest(`/communities/${id}`, { method: "DELETE" }),
};

export const postsApi = {
    getAll: (params?: { authorId?: string; communityId?: string; title?: string; content?: string; tags?: string[]; page?: number; limit?: number }) => {
        const query = params ? new URLSearchParams(params as Record<string, unknown> as Record<string, string>).toString() : "";
        return apiRequest(`/posts${query ? `?${query}` : ""}`, { method: "GET" });
    },

    createPost: (data: { communityId: string; title?: string; content: string; images?: string[]; tags?: string[]; gameTag?: string; pinned?: boolean; allowComments?: boolean }) =>
        apiRequest("/posts", { method: "POST", body: JSON.stringify(data) }),

    getPostById: (id: string) =>
        apiRequest(`/posts/${id}`, { method: "GET" }),

    updatePost: (id: string, data: { title?: string; content?: string; images?: string[]; tags?: string[]; gameTag?: string; pinned?: boolean; allowComments?: boolean; locked?: boolean }) =>
        apiRequest(`/posts/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

    deletePost: (id: string) =>
        apiRequest(`/posts/${id}`, { method: "DELETE" }),
};

export const commentsApi = {
    getRootComments: (params: { postId: string; page?: number; limit?: number }) => {
        const query = new URLSearchParams(params as Record<string, unknown> as Record<string, string>).toString();
        return apiRequest(`/comments?${query}`, { method: "GET" });
    },

    create: (data: { postId: string; parentId?: string; content: string }) =>
        apiRequest("/comments", { method: "POST", body: JSON.stringify(data) }),

    getOne: (id: string) =>
        apiRequest(`/comments/${id}`, { method: "GET" }),

    update: (id: string, content: string) =>
        apiRequest(`/comments/${id}?content=${encodeURIComponent(content)}`, { method: "PATCH" }),

    delete: (id: string) =>
        apiRequest(`/comments/${id}`, { method: "DELETE" }),

    getReplyComments: (data: { parentId: string; cursor?: string; limit?: number }) =>
        apiRequest("/comments/reply-comments", { method: "POST", body: JSON.stringify(data) }),
};

export const reportsApi = {
    getAll: (params?: { postId?: string; reporterId?: string; reason?: string; page?: number; limit?: number }) => {
        const query = params ? new URLSearchParams(params as Record<string, unknown> as Record<string, string>).toString() : "";
        return apiRequest(`/reports${query ? `?${query}` : ""}`, { method: "GET" });
    },

    create: (data: { postId: string; reason: string }) =>
        apiRequest("/reports", { method: "POST", body: JSON.stringify(data) }),

    getOne: (id: string) =>
        apiRequest(`/reports/${id}`, { method: "GET" }),

    update: (id: string, reason: string) =>
        apiRequest(`/reports/${id}`, { method: "PATCH", body: JSON.stringify({ reason }) }),

    delete: (id: string) =>
        apiRequest(`/reports/${id}`, { method: "DELETE" }),
};
