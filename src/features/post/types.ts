import { type UserRank } from "./helpers/userRanks";
import { type EditableAttachment } from "./helpers/postAttachments";

export interface PostFileAttachment {
    id: string;
    name: string;
    url: string;
    size: number;
    mimeType: string;
}

export interface PostAuthorInfo {
    id?: string;
    name?: string;
    username?: string;
    avatar?: string;
    avatarUrl?: string;
    avatar_url?: string;
    rank?: UserRank;
}

export interface PostData {
    id: string | number;
    author: string | PostAuthorInfo;
    authorAvatar?: string;
    authorRank?: UserRank;
    gameTag?: string;
    communityId?: string | number | null;
    communityName?: string;
    timeAgo?: string;
    timestamp?: string | number;
    title: string;
    content: string;
    images?: string[];
    files?: PostFileAttachment[];
    tags?: string[];
    hashtags?: string[];
    likes: number;
    comments?: number;
    commentsCount?: number;
    tab?: "foryou" | "following" | "hot";
    privacy: "public" | "friends" | "private";
    pinned?: boolean;
    allowComments?: boolean;
    isSpoiler?: boolean;
}

export type Post = PostData;

export interface PostDraft {
    id: string;
    title: string;
    content: string;
    attachments?: EditableAttachment[];
    privacy: "public" | "friends" | "private";
    allowComments: boolean;
    pinned: boolean;
    isSpoiler?: boolean;
    communityId: string | number | null;
    updatedAt: string;
}

export interface PostsState {
    posts: PostData[];
    addPost: (post: PostData) => void;
    updatePost: (id: string | number, updates: Partial<PostData>) => void;
    deletePost: (id: string | number) => void;
    getPostById: (id: string | number) => PostData | undefined;
}

export interface DraftsState {
    drafts: PostDraft[];
    saveDraft: (draft: Omit<PostDraft, "id" | "updatedAt"> & { id?: string }) => string;
    deleteDraft: (id: string) => void;
    clearDrafts: () => void;
}
