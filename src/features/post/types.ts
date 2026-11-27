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
}

export interface PostCommunityInfo {
    id: string | number;
    name: string;
    logo?: string;
    backdrop?: string;
}

export interface PostData {
    id: string | number;
    author: string | PostAuthorInfo;
    authorAvatar?: string;
    gameTag?: string;
    communityId?: string | number | null;
    communityName?: string;
    community?: PostCommunityInfo | null;
    timeAgo?: string;
    timestamp?: string | number;
    title: string;
    content: string;
    images?: string[];
    files?: PostFileAttachment[];
    tags?: string[];
    hashtags?: string[];
    likes: number;
    upvotes?: number;
    downvotes?: number;
    score?: number;
    comments?: number;
    commentsCount?: number;
    tab?: "foryou" | "following" | "hot";
    privacy: "public" | "friends" | "private";
    pinned?: boolean;
    allowComments?: boolean;
    isSpoiler?: boolean;
    isNsfw?: boolean;
    warningType?: "spoiler" | "nsfw";
    currentUserVoteType?: number;
    gameBadge?: string;
    postType?: "highlight" | "discussion" | "question" | "achievement" | "discovery" | "debate";
    postTypeLabel?: string;
    authorBadge?: string;
}

export type Post = PostData;

export interface PostsState {
    posts: PostData[];
    overrides: Record<string, Partial<PostData>>;
    addPost: (post: PostData) => void;
    updatePost: (id: string | number, updates: Partial<PostData>) => void;
    deletePost: (id: string | number) => void;
    getPostById: (id: string | number) => PostData | undefined;
}
