import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AppIcon as FontAwesomeIcon } from "@/shared/components/ui/Icon";
import { CircleNotch as faSpinner } from "@phosphor-icons/react";
import { useTranslation } from "@/shared/hooks/useTranslate";
import { useGameStore } from "../store/useGameStore";
import { usePostsStore } from "@/features/post";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { useCommunitiesStore } from "@/features/community";
import { useAuthStore } from "@/features/auth";
import {
    useGameDetailBySlugQuery,
    useUnifiedGameDetailQuery,
    useGamePatchNotesQuery,
    useGamesQuery,
} from "@/shared/api/useQueries";
import { mapGameDtoToGameData } from "@/shared/api/types";
import { GAME_APPID_MAP, getGameBySlug as fallbackGetGameBySlug } from "../constants";
import { type GameData, type GameTabType } from "../types";
import { GameHero } from "./GameHero";
import { GameTabs } from "./GameTabs";
import { GameOverviewTab } from "./GameOverviewTab";
import { GamePatchNotesTab } from "./GamePatchNotesTab";
import { GameDiscussionsTab } from "./GameDiscussionsTab";
import { GameSidebar } from "./GameSidebar";

interface GameDetailProps {
    slug: string;
}

export const GameDetail = ({ slug }: GameDetailProps) => {
    const { lang } = useTranslation();
    const navigate = useNavigate();
    const isVietnamese = lang === "vi";

    const cleanSlug = (slug || "").trim().toLowerCase();
    const isNumericSlug = /^\d+$/.test(cleanSlug);

    // 1. Resolve numeric AppID if known or passed directly
    const knownAppid = isNumericSlug
        ? parseInt(cleanSlug, 10)
        : GAME_APPID_MAP[cleanSlug];

    // 2. If appid is not known yet, query backend by slug
    const { data: slugGameDto, isLoading: isSlugLoading } = useGameDetailBySlugQuery(
        !knownAppid ? cleanSlug : ""
    );

    const effectiveAppid = knownAppid || (slugGameDto?.appid ? Number(slugGameDto.appid) : undefined);

    // 3. Query rich unified game detail (Steam store data + platform data)
    const { data: unifiedData, isLoading: isUnifiedLoading } = useUnifiedGameDetailQuery(effectiveAppid);

    // 4. Fetch counts for sub-tabs
    const { data: patchNotesData } = useGamePatchNotesQuery(effectiveAppid || 0, { limit: 1 });

    const patchNotesCount = Array.isArray(patchNotesData)
        ? patchNotesData.length
        : (patchNotesData as any)?.total || 0;

    // 5. Construct merged GameData
    const localFallback = useMemo(() => fallbackGetGameBySlug(cleanSlug), [cleanSlug]);

    const game: GameData = useMemo(() => {
        if (unifiedData) {
            const mapped = mapGameDtoToGameData(unifiedData);
            return {
                ...localFallback,
                ...mapped,
                appid: effectiveAppid,
                slug: cleanSlug,
                // Preserve system requirements if local has them and steam doesn't
                systemReqs: mapped.systemReqs || localFallback.systemReqs,
            };
        }

        if (slugGameDto) {
            const mapped = mapGameDtoToGameData(slugGameDto);
            return {
                ...localFallback,
                ...mapped,
                appid: effectiveAppid,
                slug: cleanSlug,
            };
        }

        return localFallback;
    }, [unifiedData, slugGameDto, effectiveAppid, cleanSlug, localFallback]);

    useDocumentTitle(game ? (game.name || game.tag || cleanSlug) : null);

    // Scroll to top when game slug changes
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "instant" });
    }, [cleanSlug]);

    // Following state (checks both cleanSlug and resolved game.slug)
    const followedSlugs = useGameStore((state) => state.followedSlugs);
    const isFollowing = useMemo(() => {
        if (followedSlugs.includes(cleanSlug)) return true;
        if (game?.slug && followedSlugs.includes(game.slug.toLowerCase())) return true;
        return false;
    }, [followedSlugs, cleanSlug, game?.slug]);
    const toggleFollowGame = useGameStore((state) => state.toggleFollowGame);

    // Community connection
    const communities = useCommunitiesStore((state) => state.communities);
    const joinedCommunityIds = useCommunitiesStore((state) => state.joinedCommunityIds);
    const toggleJoin = useCommunitiesStore((state) => state.toggleJoin);
    const requireVerifiedEmail = useAuthStore((state) => state.requireVerifiedEmail);

    const matchingCommunity = useMemo(() => {
        const commId = game?.communityId ? String(game.communityId).toLowerCase() : "";
        const targetSlug = cleanSlug;
        const gameSlugLower = (game?.slug || "").toLowerCase();
        const targetName = (game?.name || "").toLowerCase();

        return (
            communities.find((c) => {
                const cId = String(c.id).toLowerCase();
                const cSlug = (c.slug || "").toLowerCase();
                const cGameSlug = (c.gameSlug || "").toLowerCase();
                const cName = c.name.toLowerCase();

                if (commId && (cId === commId || cSlug === commId)) return true;
                if (cGameSlug && (cGameSlug === targetSlug || (gameSlugLower && cGameSlug === gameSlugLower))) return true;
                if (cSlug && (cSlug.includes(targetSlug) || targetSlug.includes(cSlug) || (gameSlugLower && cSlug.includes(gameSlugLower)))) return true;
                if (cName.includes(targetName) || (targetName && targetName.includes(cName))) return true;
                return false;
            }) || null
        );
    }, [communities, game?.communityId, game?.name, game?.slug, cleanSlug]);

    const resolvedCommunityId = matchingCommunity ? String(matchingCommunity.id) : game?.communityId;
    const isCommunityJoined = resolvedCommunityId
        ? joinedCommunityIds.includes(String(resolvedCommunityId))
        : false;

    const handleCommunityAction = () => {
        if (!resolvedCommunityId) {
            navigate({ to: "/community" });
            return;
        }

        if (isCommunityJoined) {
            navigate({ to: "/community/$communityId", params: { communityId: String(resolvedCommunityId) } });
        } else {
            if (!requireVerifiedEmail("tham gia cộng đồng")) return;
            toggleJoin(resolvedCommunityId);
        }
    };

    // Related discussions from all posts
    const allPosts = usePostsStore((state) => state.posts);
    const relatedPosts = useMemo(() => {
        if (!game) return [];
        const gameTagLower = (game.tag || game.name || "").toLowerCase();
        const communityIdLower = (resolvedCommunityId || "").toString().toLowerCase();

        return allPosts.filter((p) => {
            const postTag = (p.gameTag || "").toLowerCase();
            const postCommunity = (p.communityId || "").toString().toLowerCase();
            return (
                (postTag && (postTag.includes(gameTagLower) || gameTagLower.includes(postTag))) ||
                (communityIdLower && postCommunity === communityIdLower)
            );
        }).slice(0, 10);
    }, [allPosts, game, resolvedCommunityId]);

    // Related games for overview tab (filtered by genre, excluding current game)
    const { data: allGamesData } = useGamesQuery({ limit: 12 });
    const relatedGames = useMemo(() => {
        if (!game) return [];
        const rawGames: any[] = Array.isArray(allGamesData)
            ? allGamesData
            : (allGamesData as any)?.items || [];
        if (!rawGames.length) return [];

        const currentGenres = (game.genres || []).map((g) => g.toLowerCase());

        return rawGames
            .filter((item: any) => {
                const sameAppid = effectiveAppid && String(item.appid) === String(effectiveAppid);
                const sameSlug = cleanSlug && item.slug === cleanSlug;
                return !sameAppid && !sameSlug;
            })
            .map((item: any) => mapGameDtoToGameData(item))
            .filter((item: GameData) => {
                if (currentGenres.length === 0) return true;
                return item.genres?.some((genre) => currentGenres.includes(genre.toLowerCase()));
            })
            .slice(0, 4);
    }, [allGamesData, game, effectiveAppid, cleanSlug]);

    // Active Tab state
    const [activeTab, setActiveTab] = useState<GameTabType>("overview");

    const isInitialLoading = !unifiedData && (isSlugLoading || isUnifiedLoading);

    return (
        <div className="w-full pb-24 animate-fade-in bg-background min-h-screen text-text">
            {/* Loading Indicator when initial request is resolving */}
            {isInitialLoading && (
                <div className="w-full py-1.5 bg-primary/10 text-primary text-xs font-medium text-center flex items-center justify-center gap-2">
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin text-[11px]" />
                    <span>
                        {isVietnamese ? "Đang đồng bộ dữ liệu game..." : "Syncing game data..."}
                    </span>
                </div>
            )}

            {/* 1. GAME HERO */}
            <GameHero
                game={game}
                isFollowing={isFollowing}
                onToggleFollow={() => toggleFollowGame(game?.slug || cleanSlug)}
                isCommunityJoined={isCommunityJoined}
                onCommunityAction={handleCommunityAction}
            />

            {/* 2. SUB-TABS NAVIGATION */}
            <GameTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
                counts={{
                    updates: patchNotesCount,
                    discussions: relatedPosts.length,
                }}
            />

            {/* 3. MAIN CONTENT: TWO-COLUMN LAYOUT (~70% Main, ~30% Sidebar) */}
            <div className="flex flex-col lg:flex-row gap-10 max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
                {/* Left Column: Active Tab Content */}
                <div className="flex-1 min-w-0">
                    {activeTab === "overview" && (
                        <GameOverviewTab
                            game={game}
                            relatedPosts={relatedPosts}
                            relatedGames={relatedGames}
                            onViewCommunity={
                                resolvedCommunityId
                                    ? () => navigate({ to: "/community/$communityId", params: { communityId: String(resolvedCommunityId) } })
                                    : undefined
                            }
                            onNavigateToTab={setActiveTab}
                        />
                    )}

                    {activeTab === "updates" && (
                        <GamePatchNotesTab game={game} gameAppid={effectiveAppid || 0} />
                    )}

                    {activeTab === "discussions" && (
                        <GameDiscussionsTab
                            game={game}
                            posts={relatedPosts}
                            communityId={resolvedCommunityId || game.communityId}
                            onViewCommunityFeed={
                                resolvedCommunityId
                                    ? () => navigate({ to: "/community/$communityId", params: { communityId: String(resolvedCommunityId) } })
                                    : undefined
                            }
                        />
                    )}
                </div>

                {/* Right Column: Game Info & Community Widget Sidebar */}
                <GameSidebar
                    game={game}
                    community={matchingCommunity}
                    isCommunityJoined={isCommunityJoined}
                    onCommunityAction={handleCommunityAction}
                />
            </div>
        </div>
    );
};
