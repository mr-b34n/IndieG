/**
 * OpenAPI 3.0 TypeScript definitions & UI Mappers for IndieG Backend Services
 */

export interface AuthRegisterDto {
    email: string;
    password: string;
}

export interface AuthLoginDto {
    email: string;
    password: string;
}

export interface AuthForgotPasswordDto {
    email: string;
}

export interface AuthResetPasswordDto {
    token: string;
    newPassword: string;
}

export interface AuthResendVerificationDto {
    email: string;
}

export interface AuthLoginResponse {
    accessToken?: string;
    token?: string;
    user?: UserProfileDto;
    [key: string]: unknown;
}

export interface UserProfileDto {
    id: string;
    username: string;
    name: string;
    avatarUrl?: string;
    coverUrl?: string;
    bio?: string | Record<string, unknown> | unknown[];
    rank?: string;
    status?: string;
    archived?: boolean;
    platformStatus?: number;
    isVerified?: boolean;
    isEmailVerified?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface UpdateProfileDto {
    username?: string;
    name?: string;
    bio?: string | Record<string, unknown> | unknown[];
    avatarUrl?: string;
    coverUrl?: string;
}

export interface UserSessionDto {
    id: string;
    user_id: string;
    userAgent?: string;
    ip_address: string;
    token_hash: string;
    token_version: number;
    expires_at: string;
    revoked_at?: string;
    created_at: string;
}

export interface ChangePasswordDto {
    oldPassword: string;
    newPassword: string;
}

export interface CommunityDto {
    id: string;
    name: string;
    logo?: string;
    backdrop?: string;
    category?: string;
    description?: string;
    onlineNow?: number;
    members?: number;
    membersCount?: number;
    tags?: string[];
    featured?: boolean;
    joined?: boolean;
    isJoined?: boolean;
    status?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateCommunityDto {
    name: string;
    logo?: string;
    backdrop?: string;
    category?: string;
    description?: string;
    tags?: string[];
}

export interface UpdateCommunityDto {
    name?: string;
    logo?: string;
    backdrop?: string;
    category?: string;
    description?: string;
    tags?: string[];
    featured?: boolean;
}

export interface GetCommunitiesParams {
    type?: "all" | "joined";
    page?: number;
    limit?: number;
}

export interface CommunityMemberDto {
    communityId: string;
    userId: string;
    role: "member" | "moderator" | "owner";
    status: "active" | "pending" | "muted" | "banned" | "left";
    mutedUntil?: string;
    joinedAt: string;
    user?: {
        id?: string;
        name?: string;
        username?: string;
        displayName?: string;
        avatar?: string;
        avatarUrl?: string;
    };
    displayName?: string;
    name?: string;
    username?: string;
    avatar?: string;
    avatarUrl?: string;
    userRole?: string;
    email?: string;
    points?: number;
}

export interface GetCommunityMembersParams {
    page?: number;
    limit?: number;
    keyword?: string;
}

export interface SearchCommunityMembersParams {
    keyword: string;
    page?: number;
    limit?: number;
}

export interface CommunityMemberActionDto {
    userId?: string;
    duration?: string;
    reason?: string;
}

export interface CommunityMembersResponseDto {
    items: CommunityMemberDto[];
    total?: number;
    page?: number;
    limit?: number;
}

export interface PostDto {
    id: string;
    authorId: string;
    communityId: string;
    user?: {
        id?: string;
        username?: string;
        name?: string;
        displayName?: string;
        avatar?: string;
        avatarUrl?: string;
    };
    title?: string;
    content: string;
    images?: string[];
    tags?: string[];
    gameTag?: string;
    likes?: number;
    upvotes?: number;
    downvotes?: number;
    score?: number;
    status?: string;
    commentsCount?: number;
    visibility?: number;
    pinned?: boolean;
    locked?: boolean;
    allowComments?: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
}

export interface CreatePostDto {
    communityId: string;
    title?: string;
    content: string;
    images?: string[];
    tags?: string[];
    gameTag?: string;
    pinned?: boolean;
    allowComments?: boolean;
}

export interface UpdatePostDto {
    title?: string;
    content?: string;
    images?: string[];
    tags?: string[];
    gameTag?: string;
    pinned?: boolean;
    allowComments?: boolean;
    locked?: boolean;
}

export interface CommentAuthor {
    id: string;
    username?: string;
    name?: string;
    avatarUrl?: string;
    coverUrl?: string;
    bio?: string;
    rank?: string;
    status?: string;
    archived?: boolean;
    platformStatus?: number;
    createdAt?: string;
    updatedAt?: string;
    // fallback aliases
    avatar?: string;
    avatar_url?: string;
}

export interface CommentEntity {
    id: string;
    postId: string;
    authorId: string;
    author?: string | CommentAuthor;
    parentId?: string | null;
    parent?: string | CommentEntity | null;
    children?: (string | CommentEntity)[];
    depth?: number;
    content: string;
    score?: number;
    upvotes?: number;
    downvotes?: number;
    deletedAt?: string | null;
    createdAt: string;
    updatedAt: string;

    // legacy / UI properties
    likes?: number;
    likesCount?: number;
    replyCount?: string[] | number;
    repliesCount?: number;
    pinned?: boolean;
    image?: string;
}

export interface RootCommentsMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface RootCommentsResponse {
    data: CommentEntity[];
    meta: RootCommentsMeta;
}

export interface ReplyCommentsMeta {
    limit: number;
    hasNextPage: boolean;
    nextCursor: string | null;
}

export interface ReplyCommentsResponse {
    data: CommentEntity[];
    meta: ReplyCommentsMeta;
}

export interface CreateCommentDto {
    postId: string;
    parentId?: string | null;
    content: string;
}

export interface UpdateCommentDto {
    content: string;
}

export interface ReportDto {
    id: string;
    postId?: string;
    reporterId?: string;
    reason?: string;
    createdAt?: string;
    reporter?: {
        id?: string;
        username?: string;
        name?: string;
        avatarUrl?: string;
        avatar?: string;
    };
    post?: {
        id?: string;
        title?: string;
        content?: string;
    };
}

export interface CreateReportDto {
    postId: string;
    reason: string;
}

export interface UpdateReportDto {
    reason: string;
}

export interface GetReportsParams {
    postId?: string;
    reporterId?: string;
    reason?: string;
    page?: number;
    limit?: number;
}

export interface GetPostsParams {
    authorId?: string;
    communityId?: string;
    title?: string;
    content?: string;
    tags?: string[];
    page?: number;
    limit?: number;
}

export interface CommunitySearchParams {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    featured?: boolean;
}

export interface VoteDto {
    id?: string;
    postId?: string;
    commentId?: string;
    userId?: string;
    type?: "up" | "down" | number;
    createdAt?: string;
    [key: string]: unknown;
}

export interface VoteResponse {
    success?: boolean;
    message?: string;
    data?: VoteDto | VoteDto[];
    [key: string]: unknown;
}

// -------------------------------------------------------------
// Games Types (/games/*)
// -------------------------------------------------------------
export interface GameDto {
    appid: number;
    slug?: string;
    name: string;
    communityId?: string;
    createdAt?: string;
    updatedAt?: string;
    [key: string]: unknown;
}

export interface CreateGameDto {
    appid: number;
    slug?: string;
    name: string;
    communityId?: string;
}

export interface UpdateGameDto {
    slug?: string;
    name?: string;
    communityId?: string;
}

export interface GetGamesParams {
    search?: string;
    communityId?: string;
    page?: number;
    limit?: number;
}

// -------------------------------------------------------------
// Game Guides Types (/games/{appid}/guides/*)
// -------------------------------------------------------------
export type GuideCategory = "tactics" | "builds" | "secrets" | "general";
export type GuideSort = "newest" | "oldest" | "most_liked" | "most_viewed";

export interface GameGuideDto {
    id: string;
    appid: number;
    title?: string;
    titleVi?: string;
    rank?: string;
    category?: GuideCategory;
    content: string;
    contentVi?: string;
    authorId?: string;
    author?: {
        id?: string;
        username?: string;
        name?: string;
        avatarUrl?: string;
    };
    likes?: number;
    views?: number;
    createdAt?: string;
    updatedAt?: string;
    [key: string]: unknown;
}

export interface CreateGameGuideDto {
    title?: string;
    titleVi?: string;
    rank?: string;
    category?: GuideCategory;
    content: string;
    contentVi?: string;
}

export interface UpdateGameGuideDto {
    title?: string;
    titleVi?: string;
    rank?: string;
    category?: GuideCategory;
    content?: string;
    contentVi?: string;
}

export interface GetGameGuidesParams {
    category?: GuideCategory;
    authorId?: string;
    sort?: GuideSort;
    page?: number;
    limit?: number;
}

// -------------------------------------------------------------
// Game Reviews Types (/games/{appid}/reviews/*)
// -------------------------------------------------------------
export type ReviewSort = "newest" | "oldest" | "most_liked" | "highest_rating" | "lowest_rating";

export interface GameReviewDto {
    id: string;
    appid: number;
    rating: number;
    hoursPlayed?: string;
    content?: string;
    contentVi?: string;
    recommended?: boolean;
    authorId?: string;
    author?: {
        id?: string;
        username?: string;
        name?: string;
        avatarUrl?: string;
    };
    likes?: number;
    createdAt?: string;
    updatedAt?: string;
    [key: string]: unknown;
}

export interface CreateGameReviewDto {
    rating: number;
    hoursPlayed?: string;
    content?: string;
    contentVi?: string;
    recommended?: boolean;
}

export interface UpdateGameReviewDto {
    rating?: number;
    hoursPlayed?: string;
    content?: string;
    contentVi?: string;
    recommended?: boolean;
}

export interface GetGameReviewsParams {
    recommended?: boolean;
    sort?: ReviewSort;
    page?: number;
    limit?: number;
}

// -------------------------------------------------------------
// Game Patch Notes Types (/games/{appid}/patch-notes/*)
// -------------------------------------------------------------
export type PatchNoteType = "major" | "patch" | "hotfix" | "event";

export interface GamePatchNoteDto {
    id: string;
    appid: number;
    version?: string;
    title?: string;
    titleVi?: string;
    summary?: string;
    summaryVi?: string;
    type?: PatchNoteType;
    postId?: number;
    createdAt?: string;
    updatedAt?: string;
    [key: string]: unknown;
}

export interface CreateGamePatchNoteDto {
    version?: string;
    title?: string;
    titleVi?: string;
    summary?: string;
    summaryVi?: string;
    type?: PatchNoteType;
    postId?: number;
}

export interface UpdateGamePatchNoteDto {
    version?: string;
    title?: string;
    titleVi?: string;
    summary?: string;
    summaryVi?: string;
    type?: PatchNoteType;
    postId?: number;
}

export interface GetGamePatchNotesParams {
    type?: PatchNoteType;
    page?: number;
    limit?: number;
}

/**
 * Adapter Mappers: Safely convert backend DTOs into frontend UI models
 * handling all optional / missing fields gracefully without runtime errors.
 */
export function mapPostDtoToPostData(dto: PostDto, authorName = "Gamer", authorAvatar = "") {
    const rawAuthor = (dto as { author?: unknown }).author;
    const userObj = dto.user || (typeof rawAuthor === "object" && rawAuthor !== null ? (rawAuthor as { id?: string; username?: string; name?: string; displayName?: string; avatar?: string; avatarUrl?: string; avatar_url?: string; handle?: string }) : null) || (dto as { authorInfo?: { id?: string; username?: string; name?: string; avatar?: string } }).authorInfo;

    const resolvedName = userObj?.name || userObj?.displayName || userObj?.username || (typeof rawAuthor === "string" ? rawAuthor : authorName) || "Gamer";
    const resolvedUsername = userObj?.username || userObj?.handle || (dto as { username?: string }).username;
    const resolvedAvatar = userObj?.avatar || userObj?.avatarUrl || userObj?.avatar_url || authorAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(resolvedUsername || resolvedName || dto.authorId || dto.id)}`;

    const upvotes = dto.upvotes ?? dto.likes ?? 0;
    const downvotes = dto.downvotes ?? 0;
    const score = dto.score ?? (upvotes - downvotes);

    return {
        id: dto.id,
        author: {
            id: userObj?.id || dto.authorId,
            name: resolvedName,
            username: resolvedUsername,
            avatar: resolvedAvatar,
            avatarUrl: resolvedAvatar,
        },
        authorAvatar: resolvedAvatar,
        title: dto.title || "",
        content: dto.content || "",
        images: dto.images || [],
        tags: dto.tags || [],
        gameTag: dto.gameTag,
        likes: upvotes,
        upvotes: upvotes,
        downvotes: downvotes,
        score: score,
        comments: dto.commentsCount ?? 0,
        commentsCount: dto.commentsCount ?? 0,
        pinned: dto.pinned ?? false,
        allowComments: dto.allowComments ?? true,
        timeAgo: dto.createdAt ? new Date(dto.createdAt).toLocaleDateString("vi-VN") : "Vừa xong",
        privacy: "public" as const,
    };
}

export function mapCommunityDtoToCommunityData(dto: CommunityDto) {
    return {
        id: dto.id,
        name: dto.name || "Cộng đồng",
        logo: dto.logo || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=150",
        backdrop: dto.backdrop || "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200",
        category: dto.category || "Indie",
        description: dto.description || "",
        members: dto.membersCount ?? dto.members ?? 1,
        onlineNow: dto.onlineNow ?? 1,
        tags: dto.tags || [],
        joined: dto.joined === true || dto.isJoined === true,
        featured: dto.featured ?? false,
    };
}

// -------------------------------------------------------------
// Guestbook Comments DTOs
// -------------------------------------------------------------
export interface GuestbookAuthorDto {
    id?: string;
    username?: string;
    name?: string;
    avatarUrl?: string;
    avatar_url?: string;
    avatar?: string;
}

export interface GuestbookCommentDto {
    id: string;
    profileId: string;
    authorId?: string;
    author?: GuestbookAuthorDto;
    authorName?: string;
    authorUsername?: string;
    authorAvatar?: string;
    content: string;
    likes?: number;
    createdAt: string;
    updatedAt?: string;
}

export interface CreateGuestbookCommentDto {
    content: string;
}

// -------------------------------------------------------------
// Bookmarks DTOs
// -------------------------------------------------------------
export type BookmarkTargetType = "post" | "project" | "user" | "comment";

export interface BookmarkDto {
    id: string;
    userId: string;
    targetType: BookmarkTargetType;
    targetId: string;
    createdAt: string;
    target?: unknown;
}

export interface CreateBookmarkDto {
    targetType: BookmarkTargetType;
    targetId: string;
}

export interface GetBookmarksParams {
    targetType?: BookmarkTargetType;
    page?: number;
    limit?: number;
}

export interface CheckBookmarkParams {
    targetType: BookmarkTargetType;
    targetId: string;
}

// -------------------------------------------------------------
// Library Games DTOs
// -------------------------------------------------------------
export interface LibraryGameDto {
    id: string;
    userId: string;
    gameAppid?: string;
    name: string;
    logo?: string;
    hours?: number;
    achievements?: number;
    totalAchievements?: number;
    lastPlayed?: string;
    keyStat?: string;
    rank?: string;
    mvpCount?: string;
    kdRatio?: string;
    tagColor?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateLibraryGameDto {
    gameAppid?: string;
    name: string;
    logo?: string;
    hours?: number;
    achievements?: number;
    totalAchievements?: number;
    lastPlayed?: string;
    keyStat?: string;
    rank?: string;
    mvpCount?: string;
    kdRatio?: string;
    tagColor?: string;
}

export type UpdateLibraryGameDto = Partial<CreateLibraryGameDto>;

// -------------------------------------------------------------
// Friendships DTOs
// -------------------------------------------------------------
export interface FriendshipDto {
    id: string;
    requesterId?: string;
    addresseeId?: string;
    status?: "pending" | "accepted" | "blocked";
    user?: UserProfileDto;
    requester?: UserProfileDto;
    addressee?: UserProfileDto;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateFriendshipRequestDto {
    addresseeId: string;
}

