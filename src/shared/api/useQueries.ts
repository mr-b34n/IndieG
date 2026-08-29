import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    postsApi,
    profilesApi,
    communitiesApi,
    commentsApi,
    reportsApi,
    authApi,
    usersApi,
} from "./index";
import type {
    CreateCommunityDto,
    UpdateCommunityDto,
    CreatePostDto,
    UpdatePostDto,
    CreateCommentDto,
    CreateReportDto,
    UpdateProfileDto,
} from "./types";


// Query keys
export const QUERY_KEYS = {
    // Auth & Users
    myProfile: ["profiles", "me"] as const,
    profileByUsername: (username: string) => ["profiles", "username", username] as const,
    profilesList: (params?: Record<string, unknown>) => ["profiles", "list", params || {}] as const,
    userSessions: ["users", "sessions"] as const,
    usersList: ["users", "list"] as const,

    // Posts
    posts: (params?: Record<string, unknown>) => ["posts", params || {}] as const,
    postById: (id: string) => ["posts", "detail", id] as const,

    // Communities
    communities: (params?: Record<string, unknown>) => ["communities", params || {}] as const,
    communityById: (id: string) => ["communities", "detail", id] as const,
    communitySearch: (params?: Record<string, unknown>) => ["communities", "search", params || {}] as const,

    // Comments
    comments: (postId: string, params?: Record<string, unknown>) => ["comments", postId, params || {}] as const,
    commentReplies: (parentId: string) => ["comments", "replies", parentId] as const,

    // Reports
    reports: (params?: Record<string, unknown>) => ["reports", params || {}] as const,
    reportById: (id: string) => ["reports", "detail", id] as const,
};

// -------------------------------------------------------------
// 1. Hooks for Posts
// -------------------------------------------------------------
export function usePostsQuery(params?: {
    authorId?: string;
    communityId?: string;
    title?: string;
    content?: string;
    tags?: string[];
    page?: number;
    limit?: number;
}) {
    return useQuery({
        queryKey: QUERY_KEYS.posts(params),
        queryFn: () => postsApi.getAll(params),
    });
}

export function usePostDetailQuery(postId: string) {
    return useQuery({
        queryKey: QUERY_KEYS.postById(postId),
        queryFn: () => postsApi.getPostById(postId),
        enabled: Boolean(postId),
    });
}

export function useCreatePostMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (dto: CreatePostDto) => postsApi.createPost(dto),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ["posts"] });
        },
    });
}

export function useUpdatePostMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdatePostDto }) =>
            postsApi.updatePost(id, data),
        onSuccess: (_data, { id }) => {
            void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.postById(id) });
            void queryClient.invalidateQueries({ queryKey: ["posts"] });
        },
    });
}

export function useDeletePostMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => postsApi.deletePost(id),
        onSuccess: (_data, id) => {
            void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.postById(id) });
            void queryClient.invalidateQueries({ queryKey: ["posts"] });
        },
    });
}

// -------------------------------------------------------------
// 2. Hooks for Profiles
// -------------------------------------------------------------
export function useMyProfileQuery(enabled = true) {
    return useQuery({
        queryKey: QUERY_KEYS.myProfile,
        queryFn: () => profilesApi.getMyProfile(),
        enabled,
    });
}

export function useUserProfileQuery(username: string) {
    return useQuery({
        queryKey: QUERY_KEYS.profileByUsername(username),
        queryFn: () => profilesApi.getUserByUsername(username),
        enabled: Boolean(username) && username !== "me",
    });
}

export function useProfilesListQuery(params?: { page?: number; limit?: number }) {
    return useQuery({
        queryKey: QUERY_KEYS.profilesList(params),
        queryFn: () => profilesApi.getAll(params),
    });
}

export function useUpdateProfileMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: UpdateProfileDto) => profilesApi.updateMyProfile(data),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myProfile });
        },
    });
}

// -------------------------------------------------------------
// 3. Hooks for Communities
// -------------------------------------------------------------
export function useCommunitiesQuery(params?: { page?: number; limit?: number }) {
    return useQuery({
        queryKey: QUERY_KEYS.communities(params),
        queryFn: () => communitiesApi.getAll(params),
    });
}

export function useCommunityDetailQuery(id: string) {
    return useQuery({
        queryKey: QUERY_KEYS.communityById(id),
        queryFn: () => communitiesApi.getById(id),
        enabled: Boolean(id),
    });
}

export function useSearchCommunitiesQuery(params?: {
    search?: string;
    category?: string;
    featured?: boolean;
    page?: number;
    limit?: number;
}) {
    return useQuery({
        queryKey: QUERY_KEYS.communitySearch(params),
        queryFn: () => communitiesApi.search(params),
    });
}

export function useCreateCommunityMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateCommunityDto) => communitiesApi.create(data),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ["communities"] });
        },
    });
}

export function useUpdateCommunityMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateCommunityDto }) =>
            communitiesApi.update(id, data),
        onSuccess: (_data, { id }) => {
            void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.communityById(id) });
            void queryClient.invalidateQueries({ queryKey: ["communities"] });
        },
    });
}

export function useDeleteCommunityMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => communitiesApi.delete(id),
        onSuccess: (_data, id) => {
            void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.communityById(id) });
            void queryClient.invalidateQueries({ queryKey: ["communities"] });
        },
    });
}

// -------------------------------------------------------------
// 4. Hooks for Comments
// -------------------------------------------------------------
export function useCommentsQuery(postId: string, page?: number, limit?: number) {
    return useQuery({
        queryKey: QUERY_KEYS.comments(postId, { page, limit }),
        queryFn: () => commentsApi.getRootComments({ postId, page, limit }),
        enabled: Boolean(postId),
    });
}

export function useCreateCommentMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateCommentDto) => commentsApi.create(data),
        onSuccess: (_data, variables) => {
            void queryClient.invalidateQueries({ queryKey: ["comments", variables.postId] });
        },
    });
}

export function useUpdateCommentMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, content }: { id: string; content: string }) =>
            commentsApi.update(id, { content }),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ["comments"] });
        },
    });
}

export function useDeleteCommentMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => commentsApi.delete(id),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ["comments"] });
        },
    });
}

// -------------------------------------------------------------
// 5. Hooks for Reports
// -------------------------------------------------------------
export function useReportsQuery(params?: {
    postId?: string;
    reporterId?: string;
    reason?: string;
    page?: number;
    limit?: number;
}) {
    return useQuery({
        queryKey: QUERY_KEYS.reports(params),
        queryFn: () => reportsApi.getAll(params),
    });
}

export function useCreateReportMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateReportDto) => reportsApi.create(data),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.reports() });
        },
    });
}

// -------------------------------------------------------------
// 6. Hooks for Users & Admin
// -------------------------------------------------------------
export function useUsersListQuery() {
    return useQuery({
        queryKey: QUERY_KEYS.usersList,
        queryFn: () => usersApi.getAll(),
    });
}

export function useUserSessionsQuery() {
    return useQuery({
        queryKey: QUERY_KEYS.userSessions,
        queryFn: () => usersApi.getSessions(),
    });
}

// Export API modules & query client
export { postsApi, profilesApi, communitiesApi, commentsApi, reportsApi, authApi, usersApi };

