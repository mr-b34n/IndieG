import React, { useState, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { 
    Gamepad2, 
    Search, 
    Star, 
    Pin, 
    Check, 
    Sparkles, 
    ExternalLink, 
    Users, 
    Flame,
    Layers,
    ChevronRight
} from "lucide-react";
import { useTranslation } from "@/shared/hooks/useTranslate";
import { useGameStore } from "../store/useGameStore";
import { INITIAL_GAMES } from "../constants";
import { useGamesQuery } from "@/shared/api/useQueries";
import { mapGameDtoToGameData } from "@/shared/api/types";
import { type GameData } from "../types";
import { Button } from "@/shared/components/ui/button";

const GENRE_FILTERS = [
    { key: "all", labelVi: "Tất cả", labelEn: "All" },
    { key: "Action", labelVi: "Hành động", labelEn: "Action" },
    { key: "FPS", labelVi: "FPS / Bắn súng", labelEn: "FPS / Shooter" },
    { key: "RPG", labelVi: "Nhập vai RPG", labelEn: "RPG" },
    { key: "Open World", labelVi: "Thế giới mở", labelEn: "Open World" },
    { key: "Survival", labelVi: "Sinh tồn", labelEn: "Survival" },
    { key: "Co-op", labelVi: "Chơi cùng bạn bè", labelEn: "Co-op" },
];

export const GamesHubPage: React.FC = () => {
    const { t, lang } = useTranslation();
    const isVi = lang === "vi";
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedGenre, setSelectedGenre] = useState("all");

    const quickAccessSlugs = useGameStore((state) => state.quickAccessSlugs);
    const setQuickAccessSlugs = useGameStore((state) => state.setQuickAccessSlugs);
    const storeGames = useGameStore((state) => state.games);

    // Fetch live games from API
    const { data: apiGamesData, isLoading: isApiLoading } = useGamesQuery({ limit: 50 });

    const allGames: GameData[] = useMemo(() => {
        const remoteList = Array.isArray(apiGamesData)
            ? apiGamesData
            : (apiGamesData as { items?: unknown[] })?.items || [];

        if (remoteList.length > 0) {
            const mapped = remoteList.map((item) => mapGameDtoToGameData(item));
            // Merge with INITIAL_GAMES to ensure rich asset coverage
            const map = new Map<string, GameData>();
            INITIAL_GAMES.forEach((g) => map.set(g.slug.toLowerCase(), g));
            mapped.forEach((g) => {
                const existing = map.get(g.slug.toLowerCase());
                map.set(g.slug.toLowerCase(), { ...existing, ...g });
            });
            return Array.from(map.values());
        }

        if (storeGames && storeGames.length > 0) return storeGames;
        return INITIAL_GAMES;
    }, [apiGamesData, storeGames]);

    // Filtering
    const filteredGames = useMemo(() => {
        let list = allGames;
        const q = searchQuery.trim().toLowerCase();

        if (q) {
            list = list.filter(
                (g) =>
                    g.name.toLowerCase().includes(q) ||
                    g.slug.toLowerCase().includes(q) ||
                    g.tag?.toLowerCase().includes(q) ||
                    g.developer?.toLowerCase().includes(q) ||
                    g.genre?.some((genre) => genre.toLowerCase().includes(q)) ||
                    g.genres?.some((genre) => genre.toLowerCase().includes(q))
            );
        }

        if (selectedGenre !== "all") {
            const targetGenre = selectedGenre.toLowerCase();
            list = list.filter((g) => {
                const combinedGenres = [...(g.genre || []), ...(g.genres || [])].map((item) =>
                    item.toLowerCase()
                );
                return (
                    combinedGenres.some((item) => item.includes(targetGenre)) ||
                    g.tag?.toLowerCase().includes(targetGenre)
                );
            });
        }

        return list;
    }, [allGames, searchQuery, selectedGenre]);

    const featuredGame = useMemo(() => {
        return allGames.find((g) => g.slug === "black-myth-wukong") || allGames[0];
    }, [allGames]);

    const handleTogglePin = (slug: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const cleanSlug = slug.toLowerCase();
        if (quickAccessSlugs.includes(cleanSlug)) {
            setQuickAccessSlugs(quickAccessSlugs.filter((s) => s !== cleanSlug));
        } else {
            if (quickAccessSlugs.length >= 4) {
                // Replace oldest slot or show alert
                setQuickAccessSlugs([...quickAccessSlugs.slice(1), cleanSlug]);
            } else {
                setQuickAccessSlugs([...quickAccessSlugs, cleanSlug]);
            }
        }
    };

    return (
        <div className="w-full flex flex-col gap-6 sm:gap-8 pb-16 animate-fade-in select-none">
            {/* 1. HERO HEADER */}
            <div className="flex flex-col gap-2 pt-1 border-b border-border pb-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0 shadow-xs">
                            <Gamepad2 className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-text uppercase flex items-center gap-2">
                                <span>{t("game.hubTitle", { defaultValue: "Trung tâm Trò chơi" })}</span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-primary/20 text-primary lowercase tracking-normal">
                                    {allGames.length} {isVi ? "tựa game" : "titles"}
                                </span>
                            </h1>
                            <p className="text-xs text-text-muted mt-0.5">
                                {t("game.hubSubtitle", {
                                    defaultValue:
                                        "Khám phá các tựa game nổi bật, cẩm nang chiến thuật và thảo luận sôi nổi",
                                })}
                            </p>
                        </div>
                    </div>

                    {/* Quick Access Settings link */}
                    <button
                        type="button"
                        onClick={() => navigate({ to: "/settings", search: { tab: "quick-access" } })}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-text-muted hover:text-text bg-surface hover:bg-surface-hover border border-border transition-colors cursor-pointer"
                    >
                        <Pin className="w-3.5 h-3.5 text-primary" />
                        <span>{t("common.manageShortcuts", { defaultValue: "Quản lý lối tắt" })}</span>
                        <ChevronRight className="w-3 h-3 text-text-faint" />
                    </button>
                </div>

                {/* Search & Genre Filters */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mt-3">
                    <div className="relative flex-1 max-w-md">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t("game.searchPlaceholder", {
                                defaultValue: "Tìm kiếm tựa game, thể loại, nhà phát triển...",
                            })}
                            className="w-full bg-surface border border-border/80 rounded-xl pl-9 pr-3 py-2 text-xs text-text placeholder:text-text-faint focus:outline-none focus:ring-1 focus:ring-primary shadow-xs transition-colors"
                        />
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
                        {GENRE_FILTERS.map((f) => {
                            const isSelected = selectedGenre === f.key;
                            return (
                                <button
                                    key={f.key}
                                    type="button"
                                    onClick={() => setSelectedGenre(f.key)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                                        isSelected
                                            ? "bg-primary text-white shadow-xs"
                                            : "bg-surface hover:bg-surface-hover text-text-muted hover:text-text border border-border/60"
                                    }`}
                                >
                                    {isVi ? f.labelVi : f.labelEn}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* 2. FEATURED SPOTLIGHT BANNER (Only when not searching) */}
            {!searchQuery && selectedGenre === "all" && featuredGame && (
                <div 
                    onClick={() => navigate({ to: "/game/$gameSlug", params: { gameSlug: featuredGame.slug } })}
                    className="relative w-full rounded-2xl overflow-hidden border border-border group cursor-pointer shadow-lg bg-surface hover:border-primary/40 transition-all duration-200"
                >
                    <div className="relative h-56 sm:h-72 w-full overflow-hidden">
                        <img
                            src={featuredGame.bannerUrl || featuredGame.logoUrl}
                            alt={featuredGame.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-90"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent" />
                        
                        <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/90 text-white text-[11px] font-bold backdrop-blur-md shadow-sm">
                            <Flame className="w-3.5 h-3.5" />
                            <span>{isVi ? "Tựa Game Nổi Bật Tuần Này" : "Featured Spotlight"}</span>
                        </div>

                        <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                            <div className="flex items-center gap-3.5">
                                <img
                                    src={featuredGame.logoUrl}
                                    alt={featuredGame.name}
                                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover ring-2 ring-border shadow-md shrink-0 bg-surface"
                                />
                                <div className="flex flex-col text-white">
                                    <h2 className="text-lg sm:text-2xl font-black tracking-tight drop-shadow-md">
                                        {featuredGame.name}
                                    </h2>
                                    <div className="flex items-center gap-2 text-xs text-zinc-300 mt-0.5">
                                        <span className="font-semibold text-primary">{featuredGame.developer}</span>
                                        <span>•</span>
                                        <span>{featuredGame.tag}</span>
                                        {featuredGame.ratingScore && (
                                            <>
                                                <span>•</span>
                                                <span className="inline-flex items-center gap-1 text-amber-400 font-bold">
                                                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                                                    {featuredGame.ratingScore}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <Button
                                size="sm"
                                className="bg-primary hover:bg-primary-hover text-white font-bold shadow-md shadow-primary/25 shrink-0"
                            >
                                <span>{isVi ? "Khám phá ngay" : "Explore Now"}</span>
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* 3. GAME CATALOG GRID */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-text flex items-center gap-2">
                        <Layers className="w-4 h-4 text-primary" />
                        <span>{t("game.allGamesCatalog", { defaultValue: "Kho trò chơi" })}</span>
                        <span className="text-xs text-text-muted font-normal">
                            ({filteredGames.length})
                        </span>
                    </h3>
                </div>

                {filteredGames.length === 0 ? (
                    <div className="w-full flex flex-col items-center justify-center gap-3 py-16 px-6 text-center rounded-2xl bg-surface border border-border/60">
                        <div className="w-12 h-12 rounded-xl bg-surface-hover flex items-center justify-center text-text-muted text-xl">
                            <Gamepad2 className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col gap-1 max-w-sm">
                            <p className="font-bold text-text text-sm">
                                {t("game.noGamesFound", { defaultValue: "Không tìm thấy tựa game nào" })}
                            </p>
                            <p className="text-text-muted text-xs">
                                {t("game.noGamesFoundDesc", {
                                    defaultValue: "Thử tìm kiếm với từ khóa khác hoặc chuyển sang thể loại khác.",
                                })}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredGames.map((game) => {
                            const isPinned = quickAccessSlugs.includes(game.slug.toLowerCase());
                            const primaryGenre = game.genres?.[0] || game.genre?.[0] || game.tag || "Game";

                            return (
                                <div
                                    key={game.slug}
                                    onClick={() => navigate({ to: "/game/$gameSlug", params: { gameSlug: game.slug } })}
                                    className="group relative flex flex-col rounded-2xl bg-surface hover:bg-surface-hover/50 border border-border hover:border-primary/40 transition-all duration-200 overflow-hidden cursor-pointer shadow-xs hover:shadow-md"
                                >
                                    {/* Cover Image */}
                                    <div className="relative w-full h-36 overflow-hidden bg-surface-hover">
                                        <img
                                            src={game.bannerUrl || game.logoUrl}
                                            alt={game.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-black/20" />

                                        {/* Pin Shortcut Button */}
                                        <button
                                            type="button"
                                            title={isPinned ? (isVi ? "Gỡ khỏi lối tắt" : "Unpin from shortcuts") : (isVi ? "Ghim vào lối tắt thanh điều hướng" : "Pin to sidebar shortcuts")}
                                            onClick={(e) => handleTogglePin(game.slug, e)}
                                            className={`absolute top-2.5 right-2.5 p-1.5 rounded-lg backdrop-blur-md transition-colors shadow-sm cursor-pointer ${
                                                isPinned
                                                    ? "bg-primary text-white"
                                                    : "bg-black/50 text-white/80 hover:text-white hover:bg-black/70"
                                            }`}
                                        >
                                            <Pin className={`w-3.5 h-3.5 ${isPinned ? "fill-white" : ""}`} />
                                        </button>

                                        {/* Genre Badge */}
                                        <span className="absolute bottom-2.5 left-3 px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/60 text-white/90 backdrop-blur-sm">
                                            {primaryGenre}
                                        </span>
                                    </div>

                                    {/* Game Info Body */}
                                    <div className="p-3.5 flex flex-col justify-between flex-1 gap-3">
                                        <div className="flex items-start gap-3">
                                            <img
                                                src={game.logoUrl}
                                                alt={game.name}
                                                className="w-10 h-10 rounded-xl object-cover shrink-0 ring-1 ring-border/50 bg-surface"
                                            />
                                            <div className="min-w-0 flex-1">
                                                <h4 className="font-bold text-sm text-text truncate group-hover:text-primary transition-colors">
                                                    {game.name}
                                                </h4>
                                                <p className="text-[11px] text-text-muted truncate mt-0.5">
                                                    {game.developer || "Studio"}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Footer meta */}
                                        <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
                                            <div className="flex items-center gap-1.5">
                                                {game.ratingScore ? (
                                                    <span className="inline-flex items-center gap-1 font-bold text-amber-400 text-xs">
                                                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                                                        {game.ratingScore}
                                                    </span>
                                                ) : (
                                                    <span className="text-[11px] text-text-faint">
                                                        {game.sentimentVi || game.sentiment || "Indie"}
                                                    </span>
                                                )}
                                            </div>

                                            {game.communityId && (
                                                <span className="inline-flex items-center gap-1 text-[11px] text-primary font-medium">
                                                    <Users className="w-3 h-3" />
                                                    <span>{isVi ? "Cộng đồng" : "Hub"}</span>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
