export type ExploreContentType = "all" | "news" | "events" | "viral" | "media";

export type ExploreSortOption = "latest" | "trending" | "top";

export interface FeaturedStory {
    id: string;
    title: string;
    slug: string;
    category: string;
    genres: string[];
    artworkUrl: string;
    description: string;
    activePlayers?: string;
    rating?: string;
    communityName?: string;
    communityMembers?: string;
}

export interface NewsItem {
    id: string;
    title: string;
    developer: string;
    genre: string;
    status: string;
    rating: string;
    date: string;
    description: string;
    imageUrl: string;
    linkSlug?: string;
    tags: string[];
    isHighlight?: boolean;
}

export interface EventItem {
    id: string;
    title: string;
    subtitle: string;
    date: string;
    statusText: string;
    isLive?: boolean;
    imageUrl: string;
    tags: string[];
    linkUrl?: string;
}

export interface ViralMediaTile {
    id: string;
    author: string;
    authorAvatar?: string;
    title: string;
    contentType: "DISCUSSION" | "VIDEO" | "SCREENSHOT" | "NEWS" | "MEME";
    imageUrl: string;
    likes: string;
    commentsCount?: string;
    videoDuration?: string;
    colSpan?: string;
    aspectRatio?: string;
    gameTag?: string;
}

export interface TrendingTag {
    id: string;
    name: string;
    count?: string;
    isHot?: boolean;
}
