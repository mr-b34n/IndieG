import { type GameData } from "@/features/game/types";
import { type CommunityData } from "@/features/community/types";
import { type Post } from "@/features/post/types";
import { type SearchType } from "@/shared/api";

export type SearchTabCategory = "all" | "games" | "communities" | "posts" | "users" | "game" | "community" | "post" | "profile";

export interface SearchUser {
    id: string;
    name: string;
    username: string;
    avatar: string;
    bio: string;
    status: "online" | "in-game" | "offline";
    game?: string | null;
    isFriend?: boolean;
}

export interface PaginationInfo {
    page: number;
    size: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
}

export interface SearchMeta {
    totalPosts: number;
    totalUsers: number;
    totalCommunities: number;
    totalGames: number;
}

export interface SearchResults {
    games: GameData[];
    communities: CommunityData[];
    posts: Post[];
    users: SearchUser[];
    squads?: unknown[];
    totalCount: number;
}

export interface SearchResponse {
    success: boolean;
    query: string;
    type: SearchTabCategory;
    pagination: PaginationInfo;
    data: {
        posts: Post[];
        users: SearchUser[];
        communities: CommunityData[];
        games: GameData[];
    };
    meta: SearchMeta;
    error?: string;
}

/**
 * Maps a frontend search tab to the backend OpenAPI `type` parameter
 * Global search ("all") omits `type`.
 */
export function mapTabToSearchType(tab: SearchTabCategory): SearchType | undefined {
    switch (tab) {
        case "games":
        case "game":
            return "game";
        case "communities":
        case "community":
            return "community";
        case "users":
        case "profile":
            return "profile";
        case "posts":
        case "post":
            return "post";
        case "all":
        default:
            return undefined;
    }
}

/**
 * Normalizes tab parameter string to standard UI category
 */
export function normalizeTabCategory(category?: string | null): "all" | "games" | "communities" | "posts" | "users" {
    if (!category) return "all";
    const lower = category.toLowerCase().trim();
    if (lower === "game" || lower === "games") return "games";
    if (lower === "community" || lower === "communities") return "communities";
    if (lower === "profile" || lower === "users" || lower === "user") return "users";
    if (lower === "post" || lower === "posts") return "posts";
    return "all";
}
