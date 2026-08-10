import { INITIAL_GAMES } from "@/features/game/constants";
import { type GameData } from "@/features/game/types";
import { type CommunityData } from "@/features/community/types";
import { type Post } from "@/features/post/types";
import { type Squad } from "@/features/squad/types";
import { type SearchResults } from "../types";

export function performSearch(
    query: string,
    allPosts: Post[] = [],
    allCommunities: CommunityData[] = [],
    allSquads: Squad[] = [],
    customGames: GameData[] = []
): SearchResults {
    const q = (query || "").trim().toLowerCase();
    if (!q) {
        return {
            games: [],
            communities: [],
            posts: [],
            squads: [],
            totalCount: 0,
        };
    }

    const safePosts = Array.isArray(allPosts) ? allPosts : [];
    const safeCommunities = Array.isArray(allCommunities) ? allCommunities : [];
    const safeSquads = Array.isArray(allSquads) ? allSquads : [];
    const safeCustomGames = Array.isArray(customGames) ? customGames : [];

    // Combined games list
    const gamesList = [...INITIAL_GAMES, ...safeCustomGames.filter(cg => cg && cg.slug && !INITIAL_GAMES.some(g => g.slug === cg.slug))];

    // Filter Games
    const matchedGames = gamesList.filter((game) => {
        if (!game) return false;
        const nameMatch = game.name?.toLowerCase().includes(q) ?? false;
        const tagMatch = (game as any).tags?.some((t: any) => typeof t === "string" && t.toLowerCase().includes(q)) ?? false;
        const aliasMatch = game.aliases?.some((a) => typeof a === "string" && a.toLowerCase().includes(q)) ?? false;
        const genreMatch = Array.isArray(game.genre)
            ? game.genre.some((g) => typeof g === "string" && g.toLowerCase().includes(q))
            : typeof game.genre === "string"
            ? (game.genre as string).toLowerCase().includes(q)
            : false;
        const devMatch = typeof game.developer === "string" ? game.developer.toLowerCase().includes(q) : false;
        return nameMatch || tagMatch || aliasMatch || genreMatch || devMatch;
    });

    // Filter Communities
    const matchedCommunities = safeCommunities.filter((c) => {
        if (!c) return false;
        const nameMatch = c.name?.toLowerCase().includes(q) ?? false;
        const descMatch = c.description?.toLowerCase().includes(q) ?? false;
        const catMatch = c.category?.toLowerCase().includes(q) ?? false;
        const tagMatch = c.tags?.some((t) => t?.toLowerCase().includes(q)) ?? false;
        return nameMatch || descMatch || catMatch || tagMatch;
    });

    // Filter Posts
    const matchedPosts = safePosts.filter((post) => {
        if (!post) return false;
        const titleMatch = post.title?.toLowerCase().includes(q) ?? false;
        const contentMatch = post.content?.toLowerCase().includes(q) ?? false;
        const authorMatch = post.author?.name?.toLowerCase().includes(q) ?? false;
        const hashtagMatch = post.hashtags?.some((h) => h?.toLowerCase().includes(q)) ?? false;
        const communityMatch = post.communityName?.toLowerCase().includes(q) ?? false;
        return titleMatch || contentMatch || authorMatch || hashtagMatch || communityMatch;
    });

    // Filter Squads
    const matchedSquads = safeSquads.filter((sq) => {
        if (!sq) return false;
        const nameMatch = sq.name?.toLowerCase().includes(q) ?? false;
        const gameMatch = sq.game?.toLowerCase().includes(q) ?? false;
        const descMatch = sq.description?.toLowerCase().includes(q) ?? false;
        const tagMatch = sq.tags?.some((t) => t?.toLowerCase().includes(q)) ?? false;
        const codeMatch = sq.roomCode?.toLowerCase().includes(q) ?? false;
        return nameMatch || gameMatch || descMatch || tagMatch || codeMatch;
    });

    const totalCount =
        matchedGames.length +
        matchedCommunities.length +
        matchedPosts.length +
        matchedSquads.length;

    return {
        games: matchedGames,
        communities: matchedCommunities,
        posts: matchedPosts,
        squads: matchedSquads,
        totalCount,
    };
}
