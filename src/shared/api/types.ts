/**
 * OpenAPI 3.0 TypeScript definitions for IndieG Backend Services
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
    parentId?: string;
    children?: CommentEntity[];
    depth?: number;
    content: string;
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
