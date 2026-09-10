import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
    postsApi,
    profilesApi,
    communitiesApi,
    communityMembersApi,
    commentsApi,
    reportsApi,
    authApi,
    usersApi,
    votesApi,
    gamesApi,
    gameGuidesApi,
    gameReviewsApi,
    gamePatchNotesApi,
    guestbookCommentsApi,
    bookmarksApi,
    libraryGamesApi,
    friendshipsApi,
} from "./index";
import type {
    CreateCommunityDto,
    UpdateCommunityDto,
    GetCommunityMembersParams,
    SearchCommunityMembersParams,
    CommunityMemberActionDto,
    CreatePostDto,
    UpdatePostDto,
    CreateCommentDto,
    CreateReportDto,
    UpdateProfileDto,
    ChangePasswordDto,
    CreateGameDto,
    UpdateGameDto,
    GetGamesParams,
    CreateGameGuideDto,
    UpdateGameGuideDto,
    GetGameGuidesParams,
    CreateGameReviewDto,
    UpdateGameReviewDto,
    GetGameReviewsParams,
    CreateGamePatchNoteDto,
    UpdateGamePatchNoteDto,
    GetGamePatchNotesParams,
    CreateGuestbookCommentDto,
    CreateBookmarkDto,
    GetBookmarksParams,
    CheckBookmarkParams,
    BookmarkTargetType,
    CreateLibraryGameDto,
    UpdateLibraryGameDto,
    CreateFriendshipRequestDto,
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
    communityMembers: (communityId: string, params?: Record<string, unknown>) => ["communities", communityId, "members", params || {}] as const,
    communityMemberMe: (communityId: string) => ["communities", communityId, "members", "me"] as const,
    communityMembersSearch: (communityId: string, keyword: string, params?: Record<string, unknown>) =>
        ["communities", communityId, "members", "search", keyword, params || {}] as const,

    // Comments
    comments: (postId: string, params?: Record<string, unknown>) => ["comments", postId, params || {}] as const,
    commentReplies: (parentId: string) => ["comments", "replies", parentId] as const,

    // Reports
    reports: (params?: Record<string, unknown>) => ["reports", params || {}] as const,
    reportById: (id: string) => ["reports", "detail", id] as const,

    // Votes
    votesList: ["votes", "list"] as const,
    postVote: (postId: string | number) => ["votes", "post", String(postId)] as const,
    commentVote: (commentId: string | number) => ["votes", "comment", String(commentId)] as const,

    // Games
    games: (params?: Record<string, unknown>) => ["games", params || {}] as const,
    gameBySlug: (slug: string) => ["games", "slug", slug] as const,
    gameByAppid: (appid: number | string) => ["games", "appid", String(appid)] as const,

    // Game Guides
    gameGuides: (appid: number | string, params?: Record<string, unknown>) => ["games", String(appid), "guides", params || {}] as const,
    gameGuideById: (appid: number | string, id: string) => ["games", String(appid), "guides", "detail", id] as const,

    // Game Reviews
    gameReviews: (appid: number | string, params?: Record<string, unknown>) => ["games", String(appid), "reviews", params || {}] as const,
    gameReviewById: (appid: number | string, id: string) => ["games", String(appid), "reviews", "detail", id] as const,

    // Game Patch Notes
    gamePatchNotes: (appid: number | string, params?: Record<string, unknown>) => ["games", String(appid), "patch-notes", params || {}] as const,
    gamePatchNoteById: (appid: number | string, id: string) => ["games", String(appid), "patch-notes", "detail", id] as const,

    // Guestbook
    guestbookComments: (profileId: string) => ["guestbook", profileId] as const,

    // Bookmarks
    bookmarks: (params?: Record<string, unknown>) => ["bookmarks", params || {}] as const,
    bookmarkCheck: (targetType: string, targetId: string) => ["bookmarks", "check", targetType, targetId] as const,

    // Library Games
    libraryGames: (userId: string) => ["library-games", userId] as const,

    // Friendships
    friends: ["friendships", "friends"] as const,
    friendRequestsIncoming: ["friendships", "requests", "incoming"] as const,
    friendRequestsOutgoing: ["friendships", "requests", "outgoing"] as const,
    friendshipsBlocked: ["friendships", "blocked"] as const,
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
        mutationFn: ({ id, data }: { id: string | number; data: UpdatePostDto }) =>
            postsApi.updatePost(id, data),
        onSuccess: (_data, { id }) => {
            void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.postById(String(id)) });
            void queryClient.invalidateQueries({ queryKey: ["posts"] });
        },
    });
}

export function useDeletePostMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string | number) => postsApi.deletePost(id),
        onSuccess: (_data, id) => {
            void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.postById(String(id)) });
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
export function useCommunitiesQuery(params?: GetCommunitiesParams, options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: QUERY_KEYS.communities(params),
        queryFn: () => communitiesApi.getAll(params),
        ...options,
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

export function useJoinCommunityMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (communityId: string) => communitiesApi.join(communityId),
        onSuccess: (_data, communityId) => {
            void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.communityById(communityId) });
            void queryClient.invalidateQueries({ queryKey: ["communities"] });
        },
    });
}

export function useLeaveCommunityMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (communityId: string) => communitiesApi.leave(communityId),
        onSuccess: (_data, communityId) => {
            void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.communityById(communityId) });
            void queryClient.invalidateQueries({ queryKey: ["communities"] });
        },
    });
}

export function useCommunityMembersQuery(communityId: string, params?: GetCommunityMembersParams) {
    return useQuery({
        queryKey: QUERY_KEYS.communityMembers(communityId, params as Record<string, unknown>),
        queryFn: () => communityMembersApi.getMembers(communityId, params),
        enabled: Boolean(communityId),
    });
}

export function usePendingMembersQuery(communityId: string, params?: GetCommunityMembersParams, options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: ["communities", communityId, "members", "pending", params || {}],
        queryFn: () => communityMembersApi.getPendingMembers(communityId, params),
        enabled: (options?.enabled ?? true) && Boolean(communityId),
    });
}

export function useCommunityMemberMeQuery(communityId: string) {
    return useQuery({
        queryKey: QUERY_KEYS.communityMemberMe(communityId),
        queryFn: () => communityMembersApi.me(communityId),
        enabled: Boolean(communityId),
    });
}

export function useSearchCommunityMembersQuery(communityId: string, params: SearchCommunityMembersParams) {
    const keyword = params.keyword.trim();
    return useQuery({
        queryKey: QUERY_KEYS.communityMembersSearch(communityId, keyword, params),
        queryFn: () => communityMembersApi.search(communityId, params),
        enabled: Boolean(communityId) && keyword.length >= 3,
    });
}

export function useApproveJoinRequestMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ communityId, data }: { communityId: string; data?: CommunityMemberActionDto }) =>
            communityMembersApi.approveJoinRequest(communityId, data),
        onSuccess: (_data, { communityId }) => {
            void queryClient.invalidateQueries({ queryKey: ["communities", communityId, "members"] });
        },
    });
}

export function useRejectJoinRequestMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ communityId, data }: { communityId: string; data?: CommunityMemberActionDto }) =>
            communityMembersApi.rejectJoinRequest(communityId, data),
        onSuccess: (_data, { communityId }) => {
            void queryClient.invalidateQueries({ queryKey: ["communities", communityId, "members"] });
        },
    });
}

export function useMuteMemberMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ communityId, data }: { communityId: string; data?: CommunityMemberActionDto }) =>
            communityMembersApi.muteMember(communityId, data),
        onSuccess: (_data, { communityId }) => {
            void queryClient.invalidateQueries({ queryKey: ["communities", communityId, "members"] });
        },
    });
}

export function useBanMemberMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ communityId, data }: { communityId: string; data?: CommunityMemberActionDto }) =>
            communityMembersApi.banMember(communityId, data),
        onSuccess: (_data, { communityId }) => {
            void queryClient.invalidateQueries({ queryKey: ["communities", communityId, "members"] });
        },
    });
}

// -------------------------------------------------------------
// 4. Hooks for Comments
// -------------------------------------------------------------
export function useCommentsQuery(postId: string, page = 1, limit = 6) {
    return useQuery({
        queryKey: QUERY_KEYS.comments(postId, { page, limit }),
        queryFn: () => commentsApi.getRootComments({ postId, page, limit }),
        enabled: Boolean(postId),
        placeholderData: keepPreviousData,
    });
}

export function useReplyCommentsQuery(parentId: string | number, cursor?: string, limit = 5, enabled = false) {
    const parentIdStr = String(parentId ?? "").trim();
    const isValidParentId = parentIdStr.length > 0 && !parentIdStr.startsWith("sub-") && parentIdStr !== "undefined" && parentIdStr !== "null";
    return useQuery({
        queryKey: [...QUERY_KEYS.commentReplies(parentIdStr), cursor, limit],
        queryFn: () => commentsApi.getReplyComments({ parentId: parentIdStr, cursor, limit }),
        enabled: isValidParentId && enabled,
        placeholderData: keepPreviousData,
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
export function useReportsQuery(
    params?: {
        postId?: string;
        reporterId?: string;
        reason?: string;
        page?: number;
        limit?: number;
    },
    options?: { enabled?: boolean }
) {
    return useQuery({
        queryKey: QUERY_KEYS.reports(params),
        queryFn: () => reportsApi.getAll(params),
        enabled: options?.enabled ?? true,
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

export function useDeleteReportMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => reportsApi.delete(id),
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

export function useRevokeSessionMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (sessionId: string) => usersApi.revokeSession(sessionId),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userSessions });
        },
    });
}

export function useChangePasswordMutation() {
    return useMutation({
        mutationFn: (data: ChangePasswordDto) => usersApi.changePassword(data),
    });
}

// -------------------------------------------------------------
// 7. Hooks for Votes (VoteController)
// -------------------------------------------------------------
export function useVotesListQuery() {
    return useQuery({
        queryKey: QUERY_KEYS.votesList,
        queryFn: () => votesApi.getAll(),
    });
}

export function usePostVoteQuery(postId: string | number) {
    const id = String(postId);
    return useQuery({
        queryKey: QUERY_KEYS.postVote(id),
        queryFn: () => votesApi.getByPost(id),
        enabled: Boolean(id),
    });
}

export function useUpVotePostMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (postId: string | number) => votesApi.upVotePost(postId),
        onSuccess: (_data, postId) => {
            void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.postVote(postId) });
            void queryClient.invalidateQueries({ queryKey: ["posts"] });
        },
    });
}

export function useDeleteVotePostMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (postId: string | number) => votesApi.deleteVotePost(postId),
        onSuccess: (_data, postId) => {
            void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.postVote(postId) });
            void queryClient.invalidateQueries({ queryKey: ["posts"] });
        },
    });
}

export function useCommentVoteQuery(commentId: string | number) {
    const id = String(commentId);
    return useQuery({
        queryKey: QUERY_KEYS.commentVote(id),
        queryFn: () => votesApi.getByComment(id),
        enabled: Boolean(id),
    });
}

export function useUpVoteCommentMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (commentId: string | number) => votesApi.upVoteComment(commentId),
        onSuccess: (_data, commentId) => {
            void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.commentVote(commentId) });
            void queryClient.invalidateQueries({ queryKey: ["comments"] });
        },
    });
}

export function useDeleteVoteCommentMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (commentId: string | number) => votesApi.deleteVoteComment(commentId),
        onSuccess: (_data, commentId) => {
            void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.commentVote(commentId) });
            void queryClient.invalidateQueries({ queryKey: ["comments"] });
        },
    });
}

// -------------------------------------------------------------
// 8. Hooks for Games (/games/*)
// -------------------------------------------------------------
export function useGamesQuery(params?: GetGamesParams) {
    return useQuery({
        queryKey: QUERY_KEYS.games(params as Record<string, unknown>),
        queryFn: () => gamesApi.getAll(params),
    });
}

export function useGameDetailBySlugQuery(slug: string) {
    return useQuery({
        queryKey: QUERY_KEYS.gameBySlug(slug),
        queryFn: () => gamesApi.getBySlug(slug),
        enabled: Boolean(slug),
    });
}

export function useGameDetailByAppidQuery(appid: number | string) {
    return useQuery({
        queryKey: QUERY_KEYS.gameByAppid(appid),
        queryFn: () => gamesApi.getByAppid(appid),
        enabled: Boolean(appid),
    });
}

export function useCreateGameMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (dto: CreateGameDto) => gamesApi.create(dto),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ["games"] });
        },
    });
}

export function useUpdateGameMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ appid, dto }: { appid: number | string; dto: UpdateGameDto }) =>
            gamesApi.update(appid, dto),
        onSuccess: (_data, { appid }) => {
            void queryClient.invalidateQueries({ queryKey: ["games"] });
            void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.gameByAppid(appid) });
        },
    });
}

export function useDeleteGameMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (appid: number | string) => gamesApi.delete(appid),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ["games"] });
        },
    });
}

// -------------------------------------------------------------
// 9. Hooks for Game Guides (/games/{appid}/guides/*)
// -------------------------------------------------------------
export function useGameGuidesQuery(appid: number | string, params?: GetGameGuidesParams) {
    return useQuery({
        queryKey: QUERY_KEYS.gameGuides(appid, params as Record<string, unknown>),
        queryFn: () => gameGuidesApi.getAll(appid, params),
        enabled: Boolean(appid),
    });
}

export function useGameGuideDetailQuery(appid: number | string, id: string) {
    return useQuery({
        queryKey: QUERY_KEYS.gameGuideById(appid, id),
        queryFn: () => gameGuidesApi.getById(appid, id),
        enabled: Boolean(appid && id),
    });
}

export function useCreateGameGuideMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ appid, dto }: { appid: number | string; dto: CreateGameGuideDto }) =>
            gameGuidesApi.create(appid, dto),
        onSuccess: (_data, { appid }) => {
            void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.gameGuides(appid) });
        },
    });
}

export function useUpdateGameGuideMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ appid, id, dto }: { appid: number | string; id: string; dto: UpdateGameGuideDto }) =>
            gameGuidesApi.update(appid, id, dto),
        onSuccess: (_data, { appid, id }) => {
            void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.gameGuides(appid) });
            void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.gameGuideById(appid, id) });
        },
    });
}

export function useDeleteGameGuideMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ appid, id }: { appid: number | string; id: string }) =>
            gameGuidesApi.delete(appid, id),
        onSuccess: (_data, { appid }) => {
            void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.gameGuides(appid) });
        },
    });
}

export function useLikeGameGuideMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ appid, id }: { appid: number | string; id: string }) =>
            gameGuidesApi.like(appid, id),
        onSuccess: (_data, { appid, id }) => {
            void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.gameGuides(appid) });
            void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.gameGuideById(appid, id) });
        },
    });
}

// -------------------------------------------------------------
// 10. Hooks for Game Reviews (/games/{appid}/reviews/*)
// -------------------------------------------------------------
export function useGameReviewsQuery(appid: number | string, params?: GetGameReviewsParams) {
    return useQuery({
        queryKey: QUERY_KEYS.gameReviews(appid, params as Record<string, unknown>),
        queryFn: () => gameReviewsApi.getAll(appid, params),
        enabled: Boolean(appid),
    });
}

export function useGameReviewDetailQuery(appid: number | string, id: string) {
    return useQuery({
        queryKey: QUERY_KEYS.gameReviewById(appid, id),
        queryFn: () => gameReviewsApi.getById(appid, id),
        enabled: Boolean(appid && id),
    });
}

export function useCreateGameReviewMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ appid, dto }: { appid: number | string; dto: CreateGameReviewDto }) =>
            gameReviewsApi.create(appid, dto),
        onSuccess: (_data, { appid }) => {
            void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.gameReviews(appid) });
        },
    });
}

export function useUpdateGameReviewMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ appid, id, dto }: { appid: number | string; id: string; dto: UpdateGameReviewDto }) =>
            gameReviewsApi.update(appid, id, dto),
        onSuccess: (_data, { appid, id }) => {
            void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.gameReviews(appid) });
            void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.gameReviewById(appid, id) });
        },
    });
}

export function useDeleteGameReviewMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ appid, id }: { appid: number | string; id: string }) =>
            gameReviewsApi.delete(appid, id),
        onSuccess: (_data, { appid }) => {
            void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.gameReviews(appid) });
        },
    });
}

export function useLikeGameReviewMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ appid, id }: { appid: number | string; id: string }) =>
            gameReviewsApi.like(appid, id),
        onSuccess: (_data, { appid, id }) => {
            void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.gameReviews(appid) });
            void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.gameReviewById(appid, id) });
        },
    });
}

// -------------------------------------------------------------
// 11. Hooks for Game Patch Notes (/games/{appid}/patch-notes/*)
// -------------------------------------------------------------
export function useGamePatchNotesQuery(appid: number | string, params?: GetGamePatchNotesParams) {
    return useQuery({
        queryKey: QUERY_KEYS.gamePatchNotes(appid, params as Record<string, unknown>),
        queryFn: () => gamePatchNotesApi.getAll(appid, params),
        enabled: Boolean(appid),
    });
}

export function useGamePatchNoteDetailQuery(appid: number | string, id: string) {
    return useQuery({
        queryKey: QUERY_KEYS.gamePatchNoteById(appid, id),
        queryFn: () => gamePatchNotesApi.getById(appid, id),
        enabled: Boolean(appid && id),
    });
}

export function useCreateGamePatchNoteMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ appid, dto }: { appid: number | string; dto: CreateGamePatchNoteDto }) =>
            gamePatchNotesApi.create(appid, dto),
        onSuccess: (_data, { appid }) => {
            void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.gamePatchNotes(appid) });
        },
    });
}

export function useUpdateGamePatchNoteMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ appid, id, dto }: { appid: number | string; id: string; dto: UpdateGamePatchNoteDto }) =>
            gamePatchNotesApi.update(appid, id, dto),
        onSuccess: (_data, { appid, id }) => {
            void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.gamePatchNotes(appid) });
            void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.gamePatchNoteById(appid, id) });
        },
    });
}

export function useDeleteGamePatchNoteMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ appid, id }: { appid: number | string; id: string }) =>
            gamePatchNotesApi.delete(appid, id),
        onSuccess: (_data, { appid }) => {
            void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.gamePatchNotes(appid) });
        },
    });
}

// -------------------------------------------------------------
// 10. Hooks for Guestbook Comments
// -------------------------------------------------------------
export function useGuestbookCommentsQuery(profileId: string, enabled = true) {
    return useQuery({
        queryKey: QUERY_KEYS.guestbookComments(profileId),
        queryFn: () => guestbookCommentsApi.getByProfileId(profileId),
        enabled: !!profileId && enabled,
    });
}

export function useCreateGuestbookCommentMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ profileId, data }: { profileId: string; data: CreateGuestbookCommentDto }) =>
            guestbookCommentsApi.create(profileId, data),
        onSuccess: (_data, { profileId }) => {
            void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.guestbookComments(profileId) });
        },
    });
}

export function useDeleteGuestbookCommentMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ profileId, id }: { profileId: string; id: string }) =>
            guestbookCommentsApi.delete(profileId, id),
        onSuccess: (_data, { profileId }) => {
            void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.guestbookComments(profileId) });
        },
    });
}

// -------------------------------------------------------------
// 11. Hooks for Bookmarks
// -------------------------------------------------------------
export function useBookmarksQuery(params?: GetBookmarksParams, enabled = true) {
    return useQuery({
        queryKey: QUERY_KEYS.bookmarks(params as Record<string, unknown>),
        queryFn: () => bookmarksApi.getAll(params),
        enabled,
    });
}

export function useCheckBookmarkQuery(params: CheckBookmarkParams, enabled = true) {
    return useQuery({
        queryKey: QUERY_KEYS.bookmarkCheck(params.targetType, params.targetId),
        queryFn: () => bookmarksApi.check(params),
        enabled: enabled && !!params.targetType && !!params.targetId,
    });
}

export function useCreateBookmarkMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateBookmarkDto) => bookmarksApi.create(data),
        onSuccess: (_data, vars) => {
            void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bookmarks() });
            void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bookmarkCheck(vars.targetType, vars.targetId) });
        },
    });
}

export function useDeleteBookmarkMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ targetType, targetId }: { targetType: BookmarkTargetType; targetId: string }) =>
            bookmarksApi.delete(targetType, targetId),
        onSuccess: (_data, { targetType, targetId }) => {
            void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bookmarks() });
            void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bookmarkCheck(targetType, targetId) });
        },
    });
}

export function useToggleBookmarkMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data?: { targetType?: string; targetId?: string }) => bookmarksApi.toggle(data),
        onSuccess: (_data, vars) => {
            void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bookmarks() });
            if (vars?.targetType && vars?.targetId) {
                void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bookmarkCheck(vars.targetType, vars.targetId) });
            }
        },
    });
}

// -------------------------------------------------------------
// 12. Hooks for Library Games
// -------------------------------------------------------------
export function useLibraryGamesQuery(userId: string, enabled = true) {
    return useQuery({
        queryKey: QUERY_KEYS.libraryGames(userId),
        queryFn: () => libraryGamesApi.getByUserId(userId),
        enabled: !!userId && enabled,
    });
}

export function useCreateLibraryGameMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateLibraryGameDto) => libraryGamesApi.create(data),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ["library-games"] });
        },
    });
}

export function useUpdateLibraryGameMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateLibraryGameDto }) =>
            libraryGamesApi.update(id, data),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ["library-games"] });
        },
    });
}

export function useDeleteLibraryGameMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => libraryGamesApi.delete(id),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ["library-games"] });
        },
    });
}

// -------------------------------------------------------------
// 13. Hooks for Friendships
// -------------------------------------------------------------
export function useFriendsQuery(enabled = true) {
    return useQuery({
        queryKey: QUERY_KEYS.friends,
        queryFn: () => friendshipsApi.getFriends(),
        enabled,
    });
}

export function useIncomingFriendRequestsQuery(enabled = true) {
    return useQuery({
        queryKey: QUERY_KEYS.friendRequestsIncoming,
        queryFn: () => friendshipsApi.getIncomingRequests(),
        enabled,
    });
}

export function useOutgoingFriendRequestsQuery(enabled = true) {
    return useQuery({
        queryKey: QUERY_KEYS.friendRequestsOutgoing,
        queryFn: () => friendshipsApi.getOutgoingRequests(),
        enabled,
    });
}

export function useBlockedUsersQuery(enabled = true) {
    return useQuery({
        queryKey: QUERY_KEYS.friendshipsBlocked,
        queryFn: () => friendshipsApi.getBlocked(),
        enabled,
    });
}

export function useSendFriendRequestMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateFriendshipRequestDto) => friendshipsApi.sendRequest(data),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.friendRequestsOutgoing });
        },
    });
}

export function useAcceptFriendRequestMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => friendshipsApi.acceptRequest(id),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.friends });
            void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.friendRequestsIncoming });
        },
    });
}

export function useCancelFriendRequestMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => friendshipsApi.cancelRequest(id),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.friendRequestsOutgoing });
            void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.friendRequestsIncoming });
        },
    });
}

export function useUnfriendMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => friendshipsApi.unfriend(id),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.friends });
        },
    });
}

export function useBlockUserMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (targetUserId: string) => friendshipsApi.block(targetUserId),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.friends });
            void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.friendshipsBlocked });
        },
    });
}

export function useUnblockUserMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => friendshipsApi.unblock(id),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.friendshipsBlocked });
        },
    });
}

// Export API modules & query client
export {
    postsApi,
    profilesApi,
    communitiesApi,
    communityMembersApi,
    commentsApi,
    reportsApi,
    authApi,
    usersApi,
    votesApi,
    gamesApi,
    gameGuidesApi,
    gameReviewsApi,
    gamePatchNotesApi,
    guestbookCommentsApi,
    bookmarksApi,
    libraryGamesApi,
    friendshipsApi,
};

