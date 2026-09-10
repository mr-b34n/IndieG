import { performSearchAPI } from "../helpers/performSearch";
import { type SearchTabCategory, type SearchResponse, type SearchUser } from "../types";
import { type Post } from "@/features/post/types";
import { type CommunityData } from "@/features/community/types";
import { type GameData } from "@/features/game/types";
import { apiRequest } from "@/shared/api/client";

export async function fetchSearchResults(
    query: string,
    type: SearchTabCategory = "all",
    page: number = 1,
    size: number = 10,
    clientContext?: {
        posts?: Post[];
        communities?: CommunityData[];
        users?: SearchUser[];
        customGames?: GameData[];
    }
): Promise<SearchResponse> {
    try {
        const data = await apiRequest<SearchResponse>("/search", {
            method: "GET",
            params: {
                q: query,
                type,
                page,
                size,
            },
        });

        if (data && typeof data.success === "boolean") {
            return data;
        }
    } catch {
        // Fallback to in-memory search if API call fails or runs purely client-side
    }

    return performSearchAPI(
        query,
        type,
        page,
        size,
        clientContext?.posts,
        clientContext?.communities,
        clientContext?.users,
        clientContext?.customGames
    );
}
