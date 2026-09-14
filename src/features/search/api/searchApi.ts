import {
    searchApi,
    mapCommunityDtoToCommunityData,
    mapPostDtoToPost,
    mapGameDtoToGameData,
    mapUserProfileDtoToSearchUser,
    type PostDto,
    type CommunityDto,
    type GameDto,
    type UserProfileDto,
} from "@/shared/api";
import { performSearchAPI } from "../helpers/performSearch";
import {
    type SearchTabCategory,
    type SearchResponse,
    type SearchUser,
    mapTabToSearchType,
    normalizeTabCategory,
} from "../types";
import { type Post } from "@/features/post/types";
import { type CommunityData } from "@/features/community/types";
import { type GameData } from "@/features/game/types";

interface SearchContext {
    posts?: Post[];
    communities?: CommunityData[];
    users?: SearchUser[];
    customGames?: GameData[];
}

// In-flight request deduplication & short response cache to prevent duplicate burst requests (e.g. on page reload / StrictMode)
const inFlightSearchRequests = new Map<string, Promise<SearchResponse>>();
const searchCache = new Map<string, { timestamp: number; data: SearchResponse }>();
const SEARCH_CACHE_TTL_MS = 20_000; // 20 seconds

export function clearSearchCache() {
    searchCache.clear();
}

/**
 * Executes unified search request against backend GET /search
 *
 * Constraints per OpenAPI spec:
 * - q: min 2, max 100 characters
 * - type: enum ['game', 'community', 'profile', 'post'] (omitted for global preview)
 * - page: min 1, default 1
 * - limit: min 1, max 50, default 10
 */
export async function fetchSearchResults(
    query: string,
    type: SearchTabCategory = "all",
    page: number = 1,
    size: number = 10,
    clientContext?: SearchContext,
    options?: { forceRefresh?: boolean }
): Promise<SearchResponse> {
    const cleanQuery = (query || "").trim().slice(0, 100);
    const normalizedTab = normalizeTabCategory(type);
    const validPage = Math.max(1, page || 1);
    const validLimit = Math.min(50, Math.max(1, size || 10));

    // If query is empty, return empty response immediately
    if (!cleanQuery) {
        return {
            success: true,
            query: "",
            type: normalizedTab,
            pagination: {
                page: 1,
                size: validLimit,
                total: 0,
                totalPages: 0,
                hasMore: false,
            },
            data: { posts: [], users: [], communities: [], games: [] },
            meta: { totalPosts: 0, totalUsers: 0, totalCommunities: 0, totalGames: 0 },
        };
    }

    // Backend enforces min 2 characters. If 1 char, use fallback search to prevent 400 Bad Request
    if (cleanQuery.length < 2) {
        return performSearchAPI(
            cleanQuery,
            normalizedTab,
            validPage,
            validLimit,
            clientContext?.posts,
            clientContext?.communities,
            clientContext?.users,
            clientContext?.customGames
        );
    }

    const cacheKey = `${cleanQuery.toLowerCase()}::${normalizedTab}::${validPage}::${validLimit}`;

    // 1. Return fresh cached response if available
    if (!options?.forceRefresh) {
        const cached = searchCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < SEARCH_CACHE_TTL_MS) {
            return cached.data;
        }
    }

    // 2. Return in-flight promise if an identical request is already pending
    const existingInflight = inFlightSearchRequests.get(cacheKey);
    if (existingInflight) {
        return existingInflight;
    }

    // 3. Initiate request with in-flight deduplication
    const searchPromise = (async () => {
        const searchType = mapTabToSearchType(type);

        try {
            const response = await searchApi.search<Record<string, unknown>>({
                q: cleanQuery,
                type: searchType,
                page: validPage,
                limit: validLimit,
            });

            if (response && typeof response === "object") {
                const parsed = parseSearchResponse(response, cleanQuery, normalizedTab, validPage, validLimit, searchType);
                searchCache.set(cacheKey, { timestamp: Date.now(), data: parsed });
                return parsed;
            }
        } catch {
            // Fall back gracefully to local client stores when backend is unreachable
        }

        return performSearchAPI(
            cleanQuery,
            normalizedTab,
            validPage,
            validLimit,
            clientContext?.posts,
            clientContext?.communities,
            clientContext?.users,
            clientContext?.customGames
        );
    })();

    inFlightSearchRequests.set(cacheKey, searchPromise);

    try {
        const result = await searchPromise;
        return result;
    } finally {
        inFlightSearchRequests.delete(cacheKey);
    }
}

/**
 * Normalizes backend response data shapes into standard frontend SearchResponse
 */
function parseSearchResponse(
    raw: Record<string, unknown>,
    query: string,
    tab: "all" | "games" | "communities" | "posts" | "users",
    page: number,
    limit: number,
    searchType?: string
): SearchResponse {
    // 1. Check for standard backend format: { query: string, results: { game, community, profile, post } }
    const resultsObj = (
        raw.results && typeof raw.results === "object" && !Array.isArray(raw.results)
            ? raw.results
            : raw.data && typeof raw.data === "object" && (raw.data as Record<string, unknown>).results
            ? ((raw.data as Record<string, unknown>).results as Record<string, unknown>)
            : null
    ) as Record<string, unknown> | null;

    if (resultsObj) {
        const gameGroup = resultsObj.game as { data?: unknown[]; meta?: { total?: number; page?: number; limit?: number; totalPages?: number } } | undefined;
        const commGroup = resultsObj.community as { data?: unknown[]; meta?: { total?: number; page?: number; limit?: number; totalPages?: number } } | undefined;
        const profileGroup = (resultsObj.profile || resultsObj.user) as { data?: unknown[]; meta?: { total?: number; page?: number; limit?: number; totalPages?: number } } | undefined;
        const postGroup = resultsObj.post as { data?: unknown[]; meta?: { total?: number; page?: number; limit?: number; totalPages?: number } } | undefined;

        const games = Array.isArray(gameGroup?.data) ? gameGroup.data.map((g) => mapGameDtoToGameData(g as GameDto)) : [];
        const communities = Array.isArray(commGroup?.data) ? commGroup.data.map((c) => mapCommunityDtoToCommunityData(c as CommunityDto)) : [];
        const users = Array.isArray(profileGroup?.data) ? profileGroup.data.map((u) => mapUserProfileDtoToSearchUser(u as UserProfileDto)) : [];
        const posts = Array.isArray(postGroup?.data) ? postGroup.data.map((p) => mapPostDtoToPost(p as PostDto)) : [];

        const totalGames = typeof gameGroup?.meta?.total === "number" ? gameGroup.meta.total : games.length;
        const totalCommunities = typeof commGroup?.meta?.total === "number" ? commGroup.meta.total : communities.length;
        const totalUsers = typeof profileGroup?.meta?.total === "number" ? profileGroup.meta.total : users.length;
        const totalPosts = typeof postGroup?.meta?.total === "number" ? postGroup.meta.total : posts.length;

        let activeTotal = totalGames + totalCommunities + totalUsers + totalPosts;
        let activePage = page;
        let activeTotalPages = Math.max(1, Math.ceil(activeTotal / limit));

        if (tab === "games" || searchType === "game") {
            activeTotal = totalGames;
            activePage = gameGroup?.meta?.page ?? page;
            activeTotalPages = gameGroup?.meta?.totalPages ?? (activeTotal === 0 ? 0 : Math.max(1, Math.ceil(activeTotal / limit)));
        } else if (tab === "communities" || searchType === "community") {
            activeTotal = totalCommunities;
            activePage = commGroup?.meta?.page ?? page;
            activeTotalPages = commGroup?.meta?.totalPages ?? (activeTotal === 0 ? 0 : Math.max(1, Math.ceil(activeTotal / limit)));
        } else if (tab === "users" || searchType === "profile") {
            activeTotal = totalUsers;
            activePage = profileGroup?.meta?.page ?? page;
            activeTotalPages = profileGroup?.meta?.totalPages ?? (activeTotal === 0 ? 0 : Math.max(1, Math.ceil(activeTotal / limit)));
        } else if (tab === "posts" || searchType === "post") {
            activeTotal = totalPosts;
            activePage = postGroup?.meta?.page ?? page;
            activeTotalPages = postGroup?.meta?.totalPages ?? (activeTotal === 0 ? 0 : Math.max(1, Math.ceil(activeTotal / limit)));
        }

        const hasMore = activeTotal > 0 && activePage < activeTotalPages;

        return {
            success: true,
            query: (raw.query as string) || query,
            type: tab,
            pagination: {
                page: activePage,
                size: limit,
                total: activeTotal,
                totalPages: activeTotal === 0 ? 0 : activeTotalPages,
                hasMore,
            },
            data: {
                posts,
                users,
                communities,
                games,
            },
            meta: {
                totalPosts,
                totalUsers,
                totalCommunities,
                totalGames,
            },
        };
    }

    // 2. If backend formatted as legacy SearchResponse { data: { posts, communities, games, users }, meta: { totalPosts... } }
    if (raw.data && typeof raw.data === "object" && !Array.isArray(raw.data) && (raw.data as Record<string, unknown>).posts) {
        const existingData = raw.data as Record<string, unknown>;
        const posts = Array.isArray(existingData.posts) ? existingData.posts.map(mapPostDtoToPost) : [];
        const communities = Array.isArray(existingData.communities) ? existingData.communities.map(mapCommunityDtoToCommunityData) : [];
        const games = Array.isArray(existingData.games) ? existingData.games.map(mapGameDtoToGameData) : [];
        const users = Array.isArray(existingData.users)
            ? existingData.users.map(mapUserProfileDtoToSearchUser)
            : Array.isArray(existingData.profiles)
            ? existingData.profiles.map(mapUserProfileDtoToSearchUser)
            : [];

        const totalPosts = Number(raw.meta && (raw.meta as Record<string, unknown>).totalPosts) || posts.length;
        const totalCommunities = Number(raw.meta && (raw.meta as Record<string, unknown>).totalCommunities) || communities.length;
        const totalGames = Number(raw.meta && (raw.meta as Record<string, unknown>).totalGames) || games.length;
        const totalUsers = Number(raw.meta && (raw.meta as Record<string, unknown>).totalUsers) || users.length;

        let total = totalPosts + totalCommunities + totalGames + totalUsers;
        if (tab === "posts") total = totalPosts;
        if (tab === "communities") total = totalCommunities;
        if (tab === "games") total = totalGames;
        if (tab === "users") total = totalUsers;

        const totalPages = Math.max(1, Math.ceil(total / limit));

        return {
            success: true,
            query: (raw.query as string) || query,
            type: tab,
            pagination: {
                page,
                size: limit,
                total,
                totalPages: total === 0 ? 0 : totalPages,
                hasMore: total > 0 && page < totalPages,
            },
            data: { posts, users, communities, games },
            meta: { totalPosts, totalUsers, totalCommunities, totalGames },
        };
    }

    // 3. Fallback: Flat or scoped item list responses (e.g. { data: [...], meta: { total... } })
    const rawList: unknown[] = Array.isArray(raw)
        ? raw
        : Array.isArray(raw.items)
        ? raw.items
        : Array.isArray(raw.data)
        ? (raw.data as unknown[])
        : [];

    const metaObj = raw.meta as Record<string, unknown> | undefined;
    const totalFromApi = typeof raw.total === "number" ? raw.total : typeof metaObj?.total === "number" ? metaObj.total : typeof raw.count === "number" ? raw.count : rawList.length;
    const totalPagesFromApi = typeof raw.totalPages === "number" ? raw.totalPages : typeof metaObj?.totalPages === "number" ? (metaObj.totalPages as number) : Math.max(1, Math.ceil(totalFromApi / limit));
    const pageFromApi = typeof raw.page === "number" ? raw.page : typeof metaObj?.page === "number" ? (metaObj.page as number) : page;

    let posts: Post[] = [];
    let communities: CommunityData[] = [];
    let games: GameData[] = [];
    let users: SearchUser[] = [];

    // Check if raw payload has entity arrays at root
    const rawGames = (raw.games || (raw.data && (raw.data as Record<string, unknown>).games)) as unknown[];
    const rawCommunities = (raw.communities || (raw.data && (raw.data as Record<string, unknown>).communities)) as unknown[];
    const rawProfiles = (raw.profiles || raw.users || (raw.data && ((raw.data as Record<string, unknown>).profiles || (raw.data as Record<string, unknown>).users))) as unknown[];
    const rawPosts = (raw.posts || (raw.data && (raw.data as Record<string, unknown>).posts)) as unknown[];

    if (Array.isArray(rawGames)) {
        games = rawGames.map((g) => mapGameDtoToGameData(g as GameDto));
    }
    if (Array.isArray(rawCommunities)) {
        communities = rawCommunities.map((c) => mapCommunityDtoToCommunityData(c as CommunityDto));
    }
    if (Array.isArray(rawProfiles)) {
        users = rawProfiles.map((u) => mapUserProfileDtoToSearchUser(u as UserProfileDto));
    }
    if (Array.isArray(rawPosts)) {
        posts = rawPosts.map((p) => mapPostDtoToPost(p as PostDto));
    }

    // Handle scoped list mapping
    if (searchType === "game" && rawList.length > 0) {
        games = rawList.map((g) => mapGameDtoToGameData(g as GameDto));
    } else if (searchType === "community" && rawList.length > 0) {
        communities = rawList.map((c) => mapCommunityDtoToCommunityData(c as CommunityDto));
    } else if (searchType === "profile" && rawList.length > 0) {
        users = rawList.map((u) => mapUserProfileDtoToSearchUser(u as UserProfileDto));
    } else if (searchType === "post" && rawList.length > 0) {
        posts = rawList.map((p) => mapPostDtoToPost(p as PostDto));
    }

    const totalPosts = tab === "posts" ? totalFromApi : posts.length;
    const totalCommunities = tab === "communities" ? totalFromApi : communities.length;
    const totalGames = tab === "games" ? totalFromApi : games.length;
    const totalUsers = tab === "users" ? totalFromApi : users.length;

    let total = totalPosts + totalCommunities + totalGames + totalUsers;
    if (tab === "posts") total = totalPosts;
    if (tab === "communities") total = totalCommunities;
    if (tab === "games") total = totalGames;
    if (tab === "users") total = totalUsers;

    const totalPages = totalPagesFromApi || Math.max(1, Math.ceil(total / limit));

    return {
        success: true,
        query: (raw.query as string) || query,
        type: tab,
        pagination: {
            page: pageFromApi,
            size: limit,
            total,
            totalPages: total === 0 ? 0 : totalPages,
            hasMore: total > 0 && pageFromApi < totalPages,
        },
        data: {
            posts,
            users,
            communities,
            games,
        },
        meta: {
            totalPosts,
            totalUsers,
            totalCommunities,
            totalGames,
        },
    };
}
