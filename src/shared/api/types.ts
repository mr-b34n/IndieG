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
    bio?: string;
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
    bio?: string;
    avatarUrl?: string;
    coverUrl?: string;
}

export interface UserSessionDto {
    id: string;
    user_id: string;
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
    tags?: string[];
    featured?: boolean;
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
        avatar?: string;
    };
}

export interface GetCommunityMembersParams {
    keyword?: string;
    page?: number;
    limit?: number;
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
    title?: string;
    content: string;
    images?: string[];
    tags?: string[];
    gameTag?: string;
    likes?: number;
    commentsCount?: number;
    visibility?: number;
    pinned?: boolean;
    locked?: boolean;
    allowComments?: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
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

export interface CommentEntity {
    id: string;
    postId: string;
    authorId: string;
    author?: string | { id: string; username?: string; name?: string; avatar?: string; avatar_url?: string };
    parentId?: string;
    children?: CommentEntity[];
    depth?: number;
    content: string;
    likes?: number;
    likesCount?: number;
    replyCount?: string[] | number;
    repliesCount?: number;
    deletedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCommentDto {
    postId: string;
    parentId?: string;
    content: string;
}

export interface ReportDto {
    id: string;
    postId: string;
    reporterId: string;
    reason: string;
    createdAt: string;
}

export interface CreateReportDto {
    postId: string;
    reason: string;
}

/**
 * Adapter Mappers: Safely convert backend DTOs into frontend UI models
 * handling all optional / missing fields gracefully without runtime errors.
 */
export function mapPostDtoToPostData(dto: PostDto, authorName = "Gamer", authorAvatar = "") {
    return {
        id: dto.id,
        author: authorName || "Gamer",
        authorAvatar: authorAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${dto.authorId || dto.id}`,
        title: dto.title || "",
        content: dto.content || "",
        images: dto.images || [],
        tags: dto.tags || [],
        gameTag: dto.gameTag,
        likes: dto.likes ?? 0,
        comments: dto.commentsCount ?? 0,
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
        category: dto.category || "Gaming",
        description: dto.description || "",
        members: 1,
        onlineNow: dto.onlineNow ?? 1,
        tags: dto.tags || [],
        joined: false,
        featured: dto.featured ?? false,
    };
}
