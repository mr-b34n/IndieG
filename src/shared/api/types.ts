/**
 * OpenAPI 3.0 TypeScript definitions & UI Mappers for Ludon Backend Services
 */
import { DEFAULT_GAME_LOGO, DEFAULT_BG, DEFAULT_AVATAR } from "@/shared/constants/images";

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

export interface AuthGoogleLoginDto {
    idToken?: string;
    credential?: string;
    accessToken?: string;
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
    customAvatar?: string;
    coverUrl?: string;
    bio?: string | Record<string, unknown> | unknown[];
    gear?: Record<string, string>;
    rank?: string;
    status?: string;
    archived?: boolean;
    platformStatus?: number;
    isVerified?: boolean;
    isEmailVerified?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface CheckUsernameResponseDto {
    username: string;
    exists: boolean;
    available: boolean;
}

export interface UpdateProfileDto {
    username?: string;
    name?: string;
    bio?: string | Record<string, unknown> | unknown[];
    avatarUrl?: string;
    coverUrl?: string;
    gear?: Record<string, string>;
}

export interface UserSessionDto {
    id: string;
    user_id: string;
    userAgent?: string;
    ip_address?: string;
    token_hash?: string;
    token_version?: number;
    expires_at?: string;
    revoked_at?: string | null;
    created_at?: string;
    browser?: string;
    os?: string;
    device?: string;
    ip?: string;
    isCurrent?: boolean;
    isRevoked?: boolean;
    lastActive?: string;
}

export interface UserSessionsResponseDto {
    active?: UserSessionDto[];
    history?: UserSessionDto[];
}

export interface ChangePasswordDto {
    oldPassword: string;
    newPassword: string;
}

export type UserSettingsTheme = "system" | "light" | "dark";
export type UserSettingsLanguage = "vi" | "en";
export type UserSettingsProfileVisibility = "public" | "community" | "private";
export type UserSettingsFeedSorting = "hot" | "new" | "top";

export interface UserSettingsNotificationDto {
    email?: boolean;
    push?: boolean;
    comment?: boolean;
    reply?: boolean;
    mention?: boolean;
    community?: boolean;
}

export interface UserSettingsPrivacyDto {
    profileVisibility?: UserSettingsProfileVisibility;
    onlineStatus?: boolean;
    allowMessages?: boolean;
    allowMentions?: boolean;
}

export interface UserSettingsContentDto {
    showNsfw?: boolean;
    autoplayMedia?: boolean;
    defaultFeedSorting?: UserSettingsFeedSorting;
}

export interface UserSettingsDto {
    id?: string;
    userId?: string;
    theme?: UserSettingsTheme;
    language?: UserSettingsLanguage;
    notifications?: UserSettingsNotificationDto;
    privacy?: UserSettingsPrivacyDto;
    content?: UserSettingsContentDto;
    createdAt?: string;
    updatedAt?: string;
}

export interface UpdateUserSettingsDto {
    theme?: UserSettingsTheme;
    language?: UserSettingsLanguage;
    notifications?: UserSettingsNotificationDto;
    privacy?: UserSettingsPrivacyDto;
    content?: UserSettingsContentDto;
}

export interface CommunityDto {
    id: string;
    name: string;
    slug?: string;
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
    gameSlug?: string;
    gameName?: string;
    gameId?: string;
    game?: string | { name: string; slug?: string; id?: string | number };
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateCommunityDto {
    name: string;
    gameId?: string;
    privacy?: "public" | "private" | "invite_only";
    rules?: string;
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
    privacy?: "public" | "private" | "invite_only";
    rules?: string;
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
    memberId?: string;
    muteMinutes?: number;
    reason?: string;
    durationMinutes?: number;
    role?: "member" | "moderator" | "owner";
    newOwnerId?: string;
    duration?: string;
}

export interface CommunityMembersResponseDto {
    items: CommunityMemberDto[];
    total?: number;
    page?: number;
    limit?: number;
}

export interface CommunityInviteDto {
    id: string;
    communityId: string;
    userId?: string;
    email?: string;
    status: "pending" | "accepted" | "declined" | "expired";
    invitedBy?: string;
    createdAt: string;
}

export interface CreateCommunityInviteDto {
    userId?: string;
    email?: string;
}

export interface CommunityStatsDto {
    totalMembers: number;
    activeMembers: number;
    pendingMembers: number;
    bannedMembers: number;
    onlineNow: number;
}

export interface CommunityModerationLogDto {
    id: string;
    communityId: string;
    moderatorId: string;
    targetUserId?: string;
    targetPostId?: string;
    action: string;
    reason?: string;
    createdAt: string;
}

export interface CommunityModerationLogsResponseDto {
    data: CommunityModerationLogDto[];
    meta: {
        total: number;
        limit: number;
        page: number;
        totalPages: number;
    };
}

export interface PostCommunityDto {
    id: string;
    name: string;
    logo?: string;
    backdrop?: string;
}

export interface PostDto {
    id: string;
    authorId: string;
    communityId: string;
    community?: PostCommunityDto | null;
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
    currentUserVoteType?: number | null;
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

export type ReportTargetType = "post" | "comment";
export type ReportStatus = "pending" | "in_review" | "resolved" | "dismissed";
export type ModerationAction = "none" | "warning" | "content_removed" | "user_banned" | "no_action";

export interface ReportHistoryItemDto {
    id: string;
    reportId?: string;
    action: string;
    status?: ReportStatus;
    moderatorId?: string;
    moderatorNote?: string;
    moderator?: {
        id?: string;
        username?: string;
        name?: string;
        avatarUrl?: string;
    };
    createdAt: string;
}

export interface ReportDto {
    id: string;
    targetType?: ReportTargetType;
    targetId?: string;
    postId?: string;
    commentId?: string;
    reporterId?: string;
    status?: ReportStatus;
    reason: string;
    communityId?: string;
    communityName?: string;
    moderatorNote?: string;
    moderationAction?: ModerationAction;
    createdAt?: string;
    updatedAt?: string;
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
    comment?: {
        id?: string;
        content?: string;
    };
    history?: ReportHistoryItemDto[];
}

export interface CreateReportDto {
    targetType?: ReportTargetType | string;
    targetId?: string;
    postId?: string;
    commentId?: string;
    userId?: string;
    type?: "post" | "comment" | "user" | string;
    reason: string;
}

export interface UpdateReportDto {
    reason: string;
}

export interface ResolveReportDto {
    status: ReportStatus;
    moderationAction?: ModerationAction;
    moderatorNote?: string;
}

export interface GetReportsParams {
    targetType?: ReportTargetType | string;
    targetId?: string;
    postId?: string;
    reporterId?: string;
    status?: ReportStatus | string;
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

export type VoteType = 1 | -1;

export interface VotePostDto {
    voteType: VoteType;
}

export interface VoteCommentDto {
    voteType: VoteType;
}

export interface PostActionResponse {
    message?: string;
    success?: boolean;
    pinned?: boolean;
    locked?: boolean;
}

export interface VoteDto {
    id?: string;
    postId?: string;
    commentId?: string;
    userId?: string;
    type?: "up" | "down" | number;
    voteType?: VoteType;
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

export interface PlatformGameInfoDto {
    exists: boolean;
    slug: string | null;
    communityId: string | null;
}

export interface UnifiedGameDetailDto {
    appid: number;
    name: string;
    type?: string;
    shortDescription?: string;
    aboutTheGame?: string;
    headerImage?: string;
    capsuleImage?: string;
    background?: string;
    backgroundRaw?: string;
    screenshots?: { id: number; thumbnail: string; full: string }[];
    developers?: string[];
    publishers?: string[];
    genres?: { id: string; description: string }[];
    categories?: { id: number; description: string }[];
    releaseDate?: { comingSoon: boolean; date: string } | null;
    platforms?: { windows: boolean; mac: boolean; linux: boolean } | null;
    isFree?: boolean;
    metacritic?: { score: number; url: string } | null;
    recommendations?: { total: number } | null;
    achievements?: { total: number } | null;
    platform?: PlatformGameInfoDto;
    steamAvailable?: boolean;
    [key: string]: unknown;
}

export interface SteamSearchResultDto {
    appid: number;
    name: string;
    icon?: string;
    logo?: string;
    thumbnail?: string;
    platform?: PlatformGameInfoDto;
    [key: string]: unknown;
}

export interface ExternalGameDataDto {
    appid: number;
    name?: string;
    headerImage?: string;
    description?: string;
    genres?: string[];
    developers?: string[];
    publishers?: string[];
    releaseDate?: string;
    priceOverview?: {
        currency?: string;
        initial?: number;
        final?: number;
        discountPercent?: number;
    };
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

export interface SteamSyncResponse {
    success?: boolean;
    message?: string;
    game?: GameDto;
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
export function mapPostDtoToPostData(rawInput: PostDto, authorName = "Gamer", authorAvatar = "") {
    const dto = (rawInput && typeof rawInput === "object" && "data" in rawInput && (rawInput as { data?: PostDto }).data)
        ? (rawInput as { data: PostDto }).data
        : rawInput;
    const rawAuthor = (dto as { author?: unknown }).author;
    const userObj = dto.user || (typeof rawAuthor === "object" && rawAuthor !== null ? (rawAuthor as { id?: string; username?: string; name?: string; displayName?: string; avatar?: string; avatarUrl?: string; avatar_url?: string; handle?: string }) : null) || (dto as { authorInfo?: { id?: string; username?: string; name?: string; avatar?: string } }).authorInfo;

    const resolvedName = userObj?.name || userObj?.displayName || userObj?.username || (typeof rawAuthor === "string" ? rawAuthor : authorName) || "Gamer";
    const resolvedUsername = userObj?.username || userObj?.handle || (dto as { username?: string }).username;
    const resolvedAvatar = userObj?.avatar || userObj?.avatarUrl || userObj?.avatar_url || authorAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(resolvedUsername || resolvedName || dto.authorId || dto.id)}`;

    const upvotes = dto.upvotes ?? dto.likes ?? 0;
    const downvotes = dto.downvotes ?? 0;
    const score = dto.score ?? (upvotes - downvotes);

    // Basic Community Information from updated backend response
    const resolvedCommunity = dto.community ? {
        id: dto.community.id,
        name: dto.community.name,
        logo: dto.community.logo,
        backdrop: dto.community.backdrop,
    } : undefined;

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
        communityId: dto.community?.id || dto.communityId,
        communityName: dto.community?.name || dto.gameTag,
        community: resolvedCommunity,
        likes: upvotes,
        upvotes: upvotes,
        downvotes: downvotes,
        score: score,
        comments: dto.commentsCount ?? 0,
        commentsCount: dto.commentsCount ?? 0,
        pinned: dto.pinned ?? false,
        allowComments: dto.allowComments ?? true,
        currentUserVoteType: typeof dto.currentUserVoteType === "number" ? dto.currentUserVoteType : 0,
        timeAgo: dto.createdAt ? new Date(dto.createdAt).toLocaleDateString("vi-VN") : "Vừa xong",
        privacy: "public" as const,
    };
}

export const mapPostDtoToPost = mapPostDtoToPostData;

export function mapCommunityDtoToCommunityData(dto: CommunityDto) {
    const raw = dto as Record<string, unknown>;
    const resolvedBackdrop = dto.backdrop || (raw.bannerUrl as string) || (raw.coverUrl as string) || (raw.banner as string) || (raw.headerImg as string) || (raw.header as string) || DEFAULT_BG;
    // Fallback avatar/logo to header image / backdrop if logo/avatar is not specified
    const resolvedLogo = dto.logo || (raw.avatarUrl as string) || (raw.avatar as string) || (raw.icon as string) || (raw.logoUrl as string) || (raw.headerImg as string) || (raw.header as string) || resolvedBackdrop || DEFAULT_GAME_LOGO;
    const resolvedMembers = dto.membersCount ?? dto.members ?? 1;

    const resolvedGameSlug = dto.gameSlug || (raw.gameSlug as string) || (typeof dto.game === "object" ? dto.game?.slug : undefined);
    const resolvedGameName = dto.gameName || (raw.gameName as string) || (typeof dto.game === "object" ? dto.game?.name : typeof dto.game === "string" ? dto.game : undefined);
    const resolvedGameId = dto.gameId || (raw.gameId as string) || (typeof dto.game === "object" ? String(dto.game?.id || "") : undefined);

    return {
        id: dto.id,
        name: dto.name || "Cộng đồng",
        slug: dto.slug || (raw.slug as string),
        logo: resolvedLogo,
        avatarUrl: resolvedLogo,
        backdrop: resolvedBackdrop,
        bannerUrl: resolvedBackdrop,
        category: dto.category || "",
        description: dto.description || "",
        members: resolvedMembers,
        membersCount: resolvedMembers,
        onlineNow: dto.onlineNow ?? 1,
        tags: dto.tags || [],
        joined: dto.joined === true || dto.isJoined === true,
        featured: dto.featured ?? false,
        game: dto.game,
        gameSlug: resolvedGameSlug,
        gameName: resolvedGameName,
        gameId: resolvedGameId,
    };
}

export function mapGameDtoToGameData(dto: GameDto | UnifiedGameDetailDto | Record<string, unknown>) {
    const raw = dto as Record<string, unknown>;
    const appidNum = typeof raw.appid === "number" ? raw.appid : (typeof raw.appid === "string" && !isNaN(Number(raw.appid)) ? parseInt(raw.appid, 10) : undefined);
    
    // Resolve slug: check raw.slug, platform.slug, or generate slug from name
    const platformObj = (raw.platform && typeof raw.platform === "object" ? raw.platform : {}) as Record<string, unknown>;
    const slug = (raw.slug as string) || (platformObj.slug as string) || (raw.name ? String(raw.name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") : String(appidNum || "game"));

    // Images
    const backgroundImage = (raw.background as string) || (raw.backgroundRaw as string) || undefined;
    const headerImage = (raw.headerImage as string) || (appidNum ? `https://cdn.akamai.steamstatic.com/steam/apps/${appidNum}/header.jpg` : undefined);
    const capsuleImage = (raw.capsuleImage as string) || undefined;
    
    // For hero background, prefer background artwork, then headerImage
    const resolvedBanner = backgroundImage || headerImage || (raw.bannerUrl as string) || DEFAULT_BG;
    // For cover artwork, prefer capsuleImage, then headerImage
    const resolvedCover = capsuleImage || headerImage || DEFAULT_GAME_LOGO;

    // Resolve developers & publishers
    const developers = Array.isArray(raw.developers) && raw.developers.length > 0
        ? (raw.developers as string[])
        : raw.developer ? [String(raw.developer)] : [];
    const developer = developers.length > 0
        ? developers.join(", ")
        : (raw.developer as string) || undefined;

    const publishers = Array.isArray(raw.publishers) && raw.publishers.length > 0
        ? (raw.publishers as string[])
        : raw.publisher ? [String(raw.publisher)] : [];
    const publisher = publishers.length > 0
        ? publishers.join(", ")
        : (raw.publisher as string) || undefined;

    // Resolve release date (ensure correct release date for franchise upgrades e.g. CS2 released in 2023 vs CS:GO in 2012)
    let releaseDate: string | undefined = undefined;
    let releaseDateComingSoon = false;
    if (appidNum === 730 && String(raw.name || "").toLowerCase().includes("counter-strike 2")) {
        releaseDate = "27 Thg 09, 2023";
    } else if (typeof raw.releaseDate === "string") {
        releaseDate = raw.releaseDate;
    } else if (raw.releaseDate && typeof raw.releaseDate === "object") {
        const rd = raw.releaseDate as { date?: string; comingSoon?: boolean };
        if (rd.date) releaseDate = rd.date;
        if (typeof rd.comingSoon === "boolean") releaseDateComingSoon = rd.comingSoon;
    }

    // Resolve platforms
    let platforms: string[] | undefined = undefined;
    if (Array.isArray(raw.platforms)) {
        platforms = raw.platforms as string[];
    } else if (raw.platforms && typeof raw.platforms === "object") {
        const pObj = raw.platforms as { windows?: boolean; mac?: boolean; linux?: boolean };
        const list: string[] = [];
        if (pObj.windows) list.push("Windows");
        if (pObj.mac) list.push("macOS");
        if (pObj.linux) list.push("Linux");
        if (list.length > 0) platforms = list;
    }

    // Resolve genres
    let genre: string[] = [];
    if (Array.isArray(raw.genres) && raw.genres.length > 0) {
        genre = raw.genres.map(g => typeof g === "object" && g !== null && "description" in g ? (g as { description: string }).description : String(g));
    } else if (Array.isArray(raw.genre) && raw.genre.length > 0) {
        genre = raw.genre as string[];
    } else if (typeof raw.genre === "string") {
        genre = [raw.genre];
    }

    // Resolve categories (Steam features)
    let categories: import("@/features/game/types").GameCategoryItem[] = [];
    if (Array.isArray(raw.categories) && raw.categories.length > 0) {
        categories = raw.categories.map((c, idx) => {
            if (typeof c === "object" && c !== null && "description" in c) {
                return {
                    id: (c as { id?: number | string }).id ?? idx,
                    description: String((c as { description?: unknown }).description || ""),
                };
            }
            return { id: idx, description: String(c) };
        }).filter(c => c.description.trim().length > 0);
    }
    const features: string[] = categories.map(c => c.description);

    // Resolve screenshots and screenshot items
    let screenshots: string[] = [];
    let screenshotItems: import("@/features/game/types").GameScreenshotItem[] = [];
    if (Array.isArray(raw.screenshots) && raw.screenshots.length > 0) {
        raw.screenshots.forEach((s, idx) => {
            if (typeof s === "string") {
                screenshots.push(s);
                screenshotItems.push({ id: idx, thumbnail: s, full: s });
            } else if (typeof s === "object" && s !== null) {
                const sObj = s as { id?: number | string; full?: string; thumbnail?: string; path_full?: string; path_thumbnail?: string };
                const fullUrl = sObj.full || sObj.path_full || sObj.thumbnail || sObj.path_thumbnail || "";
                const thumbUrl = sObj.thumbnail || sObj.path_thumbnail || fullUrl;
                if (fullUrl) {
                    screenshots.push(fullUrl);
                    screenshotItems.push({
                        id: sObj.id ?? idx,
                        thumbnail: thumbUrl,
                        full: fullUrl,
                    });
                }
            }
        });
    }

    // Steam recommendations count (accurate Steam metric, NOT player count or review count)
    const recommendationsObj = raw.recommendations as { total?: number } | undefined;
    const recommendationsCount = typeof raw.recommendationsCount === "number"
        ? raw.recommendationsCount
        : recommendationsObj?.total;

    // Metacritic score & url
    const metacriticObj = raw.metacritic as { score?: number; url?: string } | undefined;
    const metacriticScore = typeof raw.metacriticScore === "number"
        ? raw.metacriticScore
        : metacriticObj?.score;
    const metacriticUrl = typeof raw.metacriticUrl === "string"
        ? raw.metacriticUrl
        : metacriticObj?.url;

    // Steam achievements count
    const achievementsObj = raw.achievements as { total?: number } | undefined;
    const achievementsCount = typeof raw.achievementsCount === "number"
        ? raw.achievementsCount
        : achievementsObj?.total;

    const gameType = (raw.type as string) || "game";
    const shortDescription = (raw.shortDescription as string) || (raw.description as string) || "";
    const aboutTheGame = (raw.aboutTheGame as string) || shortDescription;
    const communityId = (raw.communityId as string) || (platformObj.communityId as string) || undefined;
    const steamAvailable = raw.steamAvailable !== false;

    return {
        slug,
        appid: appidNum,
        id: String(raw.id || raw.appid || slug),
        name: (raw.name as string) || "Game",
        tag: (raw.tag as string) || (raw.name as string) || "Game",
        type: gameType,
        communityId,
        steamUrl: (raw.steamUrl as string) || (appidNum ? `https://store.steampowered.com/app/${appidNum}` : undefined),
        steamAvailable,
        developer,
        developers,
        publisher,
        publishers,
        releaseDate,
        releaseDateComingSoon,
        platforms,
        genre,
        genres: genre,
        categories,
        features,
        recommendationsCount,
        metacriticScore,
        metacriticUrl,
        achievementsCount,
        headerImage,
        capsuleImage,
        backgroundImage,
        background: (raw.background as string) || undefined,
        backgroundRaw: (raw.backgroundRaw as string) || undefined,
        logoUrl: resolvedCover,
        bannerUrl: resolvedBanner,
        capsuleUrl: resolvedCover,
        shortDescription,
        description: shortDescription,
        descriptionVi: (raw.descriptionVi as string) || undefined,
        aboutTheGame,
        screenshots,
        screenshotItems,
        isFree: Boolean(raw.isFree),
        guides: Array.isArray(raw.guides) ? (raw.guides as import("@/features/game/types").GameGuide[]) : [],
        reviews: Array.isArray(raw.reviews) ? (raw.reviews as import("@/features/game/types").GameReview[]) : [],
        patchNotes: Array.isArray(raw.patchNotes) ? (raw.patchNotes as import("@/features/game/types").GamePatchNote[]) : [],
        systemReqs: (raw.systemReqs as import("@/features/game/types").GameSystemReqs) || undefined,
    };
}

export function mapGameGuideDtoToGameGuide(dto: GameGuideDto | Record<string, unknown>): import("@/features/game/types").GameGuide {
    const raw = dto as Record<string, unknown>;
    const authorObj = (raw.author && typeof raw.author === "object" ? raw.author : {}) as Record<string, unknown>;
    const authorName = (authorObj.name as string) || (authorObj.username as string) || (raw.author as string) || "Gamer";
    const authorAvatar = (authorObj.avatarUrl as string) || (raw.authorAvatar as string) || DEFAULT_AVATAR;
    const authorUsername = (authorObj.username as string) || undefined;

    let date = "Vừa xong";
    if (raw.createdAt) {
        try {
            date = new Date(raw.createdAt as string).toLocaleDateString("vi-VN");
        } catch {
            date = String(raw.createdAt);
        }
    } else if (raw.date) {
        date = String(raw.date);
    }

    return {
        id: String(raw.id || `guide-${Date.now()}`),
        title: (raw.title as string) || (raw.titleVi as string) || "Hướng dẫn Game",
        titleVi: (raw.titleVi as string) || undefined,
        author: authorName,
        authorAvatar,
        authorUsername,
        authorId: (raw.authorId as string) || (authorObj.id as string) || undefined,
        rank: (raw.rank as string) || (authorObj.rank as string) || undefined,
        category: ((raw.category as string)?.toLowerCase() as any) || "general",
        content: (raw.content as string) || "",
        contentVi: (raw.contentVi as string) || undefined,
        likes: typeof raw.likes === "number" ? raw.likes : 0,
        views: typeof raw.views === "number" ? raw.views : 0,
        date,
    };
}

export function mapGameReviewDtoToGameReview(dto: GameReviewDto | Record<string, unknown>): import("@/features/game/types").GameReview {
    const raw = dto as Record<string, unknown>;
    const authorObj = (raw.author && typeof raw.author === "object" ? raw.author : {}) as Record<string, unknown>;
    const authorName = (authorObj.name as string) || (authorObj.username as string) || (raw.author as string) || "Gamer";
    const authorAvatar = (authorObj.avatarUrl as string) || (raw.authorAvatar as string) || DEFAULT_AVATAR;
    const authorUsername = (authorObj.username as string) || undefined;

    let date = "Vừa xong";
    if (raw.createdAt) {
        try {
            date = new Date(raw.createdAt as string).toLocaleDateString("vi-VN");
        } catch {
            date = String(raw.createdAt);
        }
    } else if (raw.date) {
        date = String(raw.date);
    }

    return {
        id: String(raw.id || `rev-${Date.now()}`),
        author: authorName,
        authorAvatar,
        authorUsername,
        authorId: (raw.authorId as string) || (authorObj.id as string) || undefined,
        rating: typeof raw.rating === "number" ? raw.rating : 8,
        hoursPlayed: (raw.hoursPlayed as string) || "12 giờ",
        content: (raw.content as string) || (raw.contentVi as string) || "",
        contentVi: (raw.contentVi as string) || undefined,
        recommended: raw.recommended !== false,
        likes: typeof raw.likes === "number" ? raw.likes : 0,
        date,
    };
}

export function mapGamePatchNoteDtoToGamePatchNote(dto: GamePatchNoteDto | Record<string, unknown>): import("@/features/game/types").GamePatchNote {
    const raw = dto as Record<string, unknown>;
    let date = "Gần đây";
    if (raw.createdAt) {
        try {
            date = new Date(raw.createdAt as string).toLocaleDateString("vi-VN");
        } catch {
            date = String(raw.createdAt);
        }
    } else if (raw.date) {
        date = String(raw.date);
    }

    return {
        id: String(raw.id || `patch-${Date.now()}`),
        version: (raw.version as string) || "v1.0.0",
        title: (raw.title as string) || (raw.titleVi as string) || "Bản cập nhật",
        titleVi: (raw.titleVi as string) || undefined,
        summary: (raw.summary as string) || (raw.summaryVi as string) || "",
        summaryVi: (raw.summaryVi as string) || undefined,
        type: ((raw.type as string)?.toLowerCase() as any) || "patch",
        postId: typeof raw.postId === "number" ? raw.postId : undefined,
        date,
    };
}

export function mapUserProfileDtoToSearchUser(dto: UserProfileDto | Record<string, unknown>) {
    const raw = dto as Record<string, unknown>;
    const id = String(raw.id || raw.userId || "");
    const username = (raw.username as string) || "gamer";
    const formattedUsername = username.startsWith("@") ? username : `@${username}`;
    const bioText = typeof raw.bio === "string" ? raw.bio : "";
    const resolvedAvatar = (raw.avatarUrl as string) || (raw.avatar as string) || DEFAULT_AVATAR;
    const status = (raw.status === "in-game" ? "in-game" : raw.status === "online" ? "online" : "offline") as "online" | "in-game" | "offline";
    const isOnline = Boolean(raw.isOnline ?? (status === "online" || status === "in-game"));
    return {
        id,
        name: (raw.name as string) || (raw.displayName as string) || username || "Gamer",
        username: formattedUsername,
        avatar: resolvedAvatar,
        avatarUrl: resolvedAvatar,
        bio: bioText,
        status,
        isOnline,
        game: (raw.game as string) || (raw.currentGame as string) || null,
        favoriteGame: (raw.favoriteGame as string) || (raw.game as string) || null,
        isFriend: Boolean(raw.isFriend || raw.friendStatus === "accepted"),
        badge: (raw.badge as string) || undefined,
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

export interface UpdateGuestbookCommentDto {
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

export interface FriendshipStatusDto {
    status: "none" | "pending_incoming" | "pending_outgoing" | "accepted" | "friends" | "blocked";
    friendshipId?: string;
}

// -------------------------------------------------------------
// Notifications DTOs (/notifications/*)
// -------------------------------------------------------------
export interface NotificationDto {
    id: string;
    userId: string;
    type: "comment" | "reply" | "like" | "community" | "mention" | "system" | "friend_request" | "friend_accepted";
    referenceId?: string;
    title?: string;
    message: string;
    avatarUrl?: string;
    link?: string;
    read?: boolean;
    isRead?: boolean;
    createdAt: string;
}

export interface CreateNotificationDto {
    userId?: string;
    type: "comment" | "reply" | "like" | "community" | "mention" | "system" | "friend_request" | "friend_accepted";
    referenceId?: string;
    title?: string;
    message: string;
    avatarUrl?: string;
    link?: string;
}

// -------------------------------------------------------------
// Search DTOs (/search)
// -------------------------------------------------------------
export type SearchType = "game" | "community" | "profile" | "post";

export interface SearchParams {
    q: string;
    type?: SearchType;
    page?: number;
    limit?: number;
}

export interface SearchGroupMetaDto {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface SearchEntityGroupDto<T = unknown> {
    data: T[];
    meta: SearchGroupMetaDto;
}

export interface SearchApiResponseDto {
    query: string;
    results: {
        game?: SearchEntityGroupDto<GameDto>;
        community?: SearchEntityGroupDto<CommunityDto>;
        profile?: SearchEntityGroupDto<UserProfileDto>;
        post?: SearchEntityGroupDto<PostDto>;
        [key: string]: SearchEntityGroupDto | unknown;
    };
}

export interface SearchGlobalResultDto {
    games?: GameDto[];
    communities?: CommunityDto[];
    profiles?: UserProfileDto[];
    users?: UserProfileDto[];
    posts?: PostDto[];
    [key: string]: unknown;
}

export interface SearchScopedResultDto<T = unknown> {
    items?: T[];
    data?: T[];
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    [key: string]: unknown;
}


