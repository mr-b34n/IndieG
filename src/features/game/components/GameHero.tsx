import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSteam } from "@fortawesome/free-brands-svg-icons";
import {
    faBookmark,
    faCheck,
    faThumbsUp,
    faArrowUpRightFromSquare,
    faClock,
    faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "@/shared/hooks/useTranslate";
import { type GameData } from "../types";

interface GameHeroProps {
    game: GameData;
    isFollowing: boolean;
    onToggleFollow: () => void;
    isCommunityJoined: boolean;
    onCommunityAction: () => void;
}

export const GameHero: React.FC<GameHeroProps> = ({
    game,
    isFollowing,
    onToggleFollow,
    isCommunityJoined,
    onCommunityAction,
}) => {
    const { lang } = useTranslation();
    const isVietnamese = lang === "vi";

    const heroArtwork =
        game.background ||
        game.backgroundRaw ||
        game.backgroundImage ||
        game.headerImage ||
        game.bannerUrl;

    const headerArtwork =
        game.headerImage ||
        game.capsuleImage ||
        game.capsuleUrl;

    const isFree = game.isFree;

    const genresList =
        (game.genres && game.genres.length > 0)
            ? game.genres
            : (game.genre && game.genre.length > 0)
            ? game.genre
            : [];

    const hasEvaluation =
        typeof game.metacriticScore === "number" ||
        typeof game.recommendationsCount === "number";

    const getScoreStyle = (score: number) => {
        if (score >= 75) {
            return {
                textColor: "text-emerald-400",
                label: score >= 90
                    ? (isVietnamese ? "Cực kỳ tích cực" : "Overwhelmingly Positive")
                    : (isVietnamese ? "Rất tích cực" : "Very Positive"),
            };
        }
        if (score >= 50) {
            return {
                textColor: "text-amber-400",
                label: isVietnamese ? "Đánh giá hỗn hợp" : "Mixed Reviews",
            };
        }
        return {
            textColor: "text-rose-400",
            label: isVietnamese ? "Đánh giá tiêu cực" : "Mostly Negative",
        };
    };

    const scoreMeta = typeof game.metacriticScore === "number" ? getScoreStyle(game.metacriticScore) : null;

    return (
        <section className="relative w-full overflow-hidden bg-background">
            {/* 1. Cinematic Ambient Artwork Background */}
            {heroArtwork && (
                <div className="absolute inset-0 h-[480px] sm:h-[520px] lg:h-[560px] w-full overflow-hidden pointer-events-none select-none">
                    <img
                        src={heroArtwork}
                        alt=""
                        className="w-full h-full object-cover object-top opacity-50 sm:opacity-65 scale-105 filter blur-[0.5px] transition-transform duration-1000"
                    />
                    {/* Natural directional gradients & vignette into page background */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent/30" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_0%,rgba(0,0,0,0.5)_100%)]" />
                </div>
            )}

            {/* 2. Hero Content Container */}
            <div className="relative z-10 max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 md:pt-16 pb-8 sm:pb-12 min-h-[340px] md:min-h-[400px] flex items-end">
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between w-full gap-8">
                    {/* Left Column: Header Image, Title, Tags, Actions */}
                    <div className="flex flex-col gap-5 max-w-2xl">
                        {/* Header Image with small text above */}
                        <div className="flex flex-col gap-1.5 self-start">
                            <span className="text-[11px] font-semibold tracking-wider uppercase text-text-muted/80">
                                {isFree ? (isVietnamese ? "Miễn phí" : "Free") : (isVietnamese ? "Có phí" : "Paid")}
                            </span>
                            {headerArtwork && (
                                <div className="w-[240px] sm:w-[280px] md:w-[320px] aspect-[460/215] rounded overflow-hidden bg-surface ring-1 ring-white/10 shrink-0">
                                    <img
                                        src={headerArtwork}
                                        alt={game.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Game Title & Category Badges */}
                        <div className="flex flex-col gap-3.5">
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-text tracking-tight leading-[1.15] drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)]">
                                {game.name}
                            </h1>

                            {/* Tag Badges: Category & Status */}
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                                {/* Type if not standard game */}
                                {game.type && game.type.toLowerCase() !== "game" && (
                                    <span className="px-3 py-1 rounded font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30 backdrop-blur-md">
                                        {game.type}
                                    </span>
                                )}

                                {/* Release Status */}
                                {game.releaseDateComingSoon && (
                                    <span className="px-3 py-1 rounded font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30 backdrop-blur-md flex items-center gap-1.5 animate-pulse">
                                        <FontAwesomeIcon icon={faClock} className="text-[10px]" />
                                        <span>{isVietnamese ? "Sắp ra mắt" : "Coming Soon"}</span>
                                    </span>
                                )}

                                {/* Genres / Categories */}
                                {genresList.map((genreItem) => (
                                    <span
                                        key={genreItem}
                                        className="px-3 py-1 rounded font-medium bg-surface/80 text-text-muted hover:text-text border border-border/40 backdrop-blur-md transition-colors"
                                    >
                                        {genreItem}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Actions Row with Visual Hierarchy */}
                        <div className="flex flex-wrap items-center gap-3 pt-1">
                            {/* Primary Action: Explore Community */}
                            <button
                                type="button"
                                onClick={onCommunityAction}
                                className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer shadow-lg flex items-center gap-2 active:scale-95 ${
                                    isCommunityJoined
                                        ? "bg-surface-hover text-emerald-400 border border-emerald-500/30 hover:bg-surface shadow-emerald-500/5"
                                        : "bg-primary text-white hover:bg-primary-hover shadow-primary/20 hover:shadow-primary/30"
                                }`}
                            >
                                <FontAwesomeIcon icon={isCommunityJoined ? faCheck : faUsers} className="text-xs" />
                                <span>
                                    {isCommunityJoined
                                        ? (isVietnamese ? "Đã tham gia cộng đồng" : "Joined Community")
                                        : (isVietnamese ? "Khám phá cộng đồng" : "Explore Community")}
                                </span>
                            </button>

                            {/* Secondary Action: Follow Game */}
                            <button
                                type="button"
                                onClick={onToggleFollow}
                                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer border flex items-center gap-2 active:scale-95 ${
                                    isFollowing
                                        ? "bg-surface-hover text-text border-primary/40 shadow-xs"
                                        : "bg-surface/85 text-text-muted hover:text-text border-border/40 hover:border-border/70 backdrop-blur-sm"
                                }`}
                            >
                                <FontAwesomeIcon
                                    icon={isFollowing ? faCheck : faBookmark}
                                    className={`text-xs ${isFollowing ? "text-primary" : "text-text-muted"}`}
                                />
                                <span>
                                    {isFollowing
                                        ? (isVietnamese ? "Đang theo dõi" : "Following")
                                        : (isVietnamese ? "Theo dõi game" : "Follow Game")}
                                </span>
                            </button>

                            {/* Tertiary Action: Steam Store */}
                            {game.steamAvailable && game.steamUrl && (
                                <a
                                    href={game.steamUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2.5 rounded-lg text-sm font-medium text-text-muted hover:text-text bg-surface/85 hover:bg-surface border border-border/40 hover:border-border/70 transition-all duration-200 inline-flex items-center gap-2 cursor-pointer backdrop-blur-sm group active:scale-95"
                                >
                                    <FontAwesomeIcon icon={faSteam} className="text-sm group-hover:text-primary transition-colors" />
                                    <span>Steam Store</span>
                                    <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-[10px] text-text-muted/60 group-hover:text-text transition-colors" />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Prominent Rating / Metacritic Display (Restrained radius & border, prominent score) */}
                    {hasEvaluation && (
                        <div className="shrink-0 mb-1 self-start lg:self-end">
                            <div className="p-4 rounded-md bg-surface/80 backdrop-blur-md border border-border/25 flex flex-col gap-2 min-w-[220px]">
                                <div className="flex items-center gap-3.5">
                                    {typeof game.metacriticScore === "number" && scoreMeta ? (
                                        <div className="flex items-baseline gap-1">
                                            <span className={`text-4xl sm:text-5xl font-black tracking-tight leading-none ${scoreMeta.textColor}`}>
                                                {game.metacriticScore}
                                            </span>
                                            <span className="text-xs font-semibold text-text-muted">
                                                /100
                                            </span>
                                        </div>
                                    ) : (
                                        typeof game.recommendationsCount === "number" && (
                                            <div className="text-primary text-3xl font-bold">
                                                <FontAwesomeIcon icon={faThumbsUp} />
                                            </div>
                                        )
                                    )}

                                    <div className="flex flex-col min-w-0">
                                        <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                                            {typeof game.metacriticScore === "number" ? "Metascore" : (isVietnamese ? "Đánh giá" : "Reviews")}
                                        </span>
                                        <span className="text-sm font-bold text-text leading-tight mt-0.5">
                                            {scoreMeta ? scoreMeta.label : (isVietnamese ? "Đánh giá tích cực" : "Positive Reviews")}
                                        </span>
                                        {typeof game.recommendationsCount === "number" && (
                                            <span className="text-[11px] text-text-muted mt-0.5">
                                                {game.recommendationsCount.toLocaleString()}{" "}
                                                {isVietnamese ? "lượt khuyên chơi" : "recommendations"}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};
