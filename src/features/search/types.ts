import { type GameData } from "@/features/game/types";
import { type CommunityData } from "@/features/community/types";
import { type Post } from "@/features/post/types";
import { type Squad } from "@/features/squad/types";

export type SearchTabCategory = "all" | "games" | "communities" | "posts" | "squads";

export interface SearchResults {
    games: GameData[];
    communities: CommunityData[];
    posts: Post[];
    squads: Squad[];
    totalCount: number;
}
