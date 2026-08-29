import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { postsApi, profilesApi, communitiesApi, commentsApi, reportsApi, authApi, usersApi } from "./index";

// Query keys
export const QUERY_KEYS = {
    myProfile: ["profiles", "me"] as const,
    profileByUsername: (username: string) => ["profiles", "username", username] as const,
    posts: (params?: Record<string, unknown>) => ["posts", params || {}] as const,
    postById: (id: string) => ["posts", id] as const,
    communities: (params?: Record<string, unknown>) => ["communities", params || {}] as const,
    communityById: (id: string) => ["communities", id] as const,
    comments: (postId: string) => ["comments", postId] as const,
    reports: ["reports"] as const,
};

// Hooks for Posts
export function usePostsQuery(params?: { authorId?: string; communityId?: string; page?: number; limit?: number }) {
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
        mutationFn: postsApi.createPost,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ["posts"] });
        },
    });
}

// Hooks for Profiles
export function useMyProfileQuery() {
    return useQuery({
        queryKey: QUERY_KEYS.myProfile,
        queryFn: () => profilesApi.getMyProfile(),
    });
}

export function useUserProfileQuery(username: string) {
    return useQuery({
        queryKey: QUERY_KEYS.profileByUsername(username),
        queryFn: () => profilesApi.getUserByUsername(username),
        enabled: Boolean(username),
    });
}

export function useUpdateProfileMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: profilesApi.updateMyProfile,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myProfile });
        },
    });
}

// Hooks for Communities
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

export function useCreateCommunityMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: communitiesApi.create,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ["communities"] });
        },
    });
}

// Hooks for Comments
export function useCommentsQuery(postId: string, page?: number, limit?: number) {
    return useQuery({
        queryKey: QUERY_KEYS.comments(postId),
        queryFn: () => commentsApi.getRootComments({ postId, page, limit }),
        enabled: Boolean(postId),
    });
}

export function useCreateCommentMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: commentsApi.create,
        onSuccess: (_data, variables) => {
            void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.comments(variables.postId) });
        },
    });
}

// Export API modules & query client
export { postsApi, profilesApi, communitiesApi, commentsApi, reportsApi, authApi, usersApi };
