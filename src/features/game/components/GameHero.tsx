import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSteam } from "@fortawesome/free-brands-svg-icons";
import {
    faWindows,
    faApple,
    faLinux,
    faPlaystation,
    faXbox,
} from "@fortawesome/free-brands-svg-icons";
import {
    Users,
    Check,
    Library,
    ExternalLink,
    Clock,
    Copy,
} from "lucide-react";
import { useTranslation } from "@/shared/hooks/useTranslate";
import { type GameData } from "../types";

interface GameHeroProps {
    game: GameData;
    isFollowing: boolean;
    onToggleFollow: () => void;
    isCommunityJoined: boolean;
    onCommunityAction: () => void;
}

const getPlatformIcon = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes("win") || p.includes("pc")) {
        return { icon: faWindows, title: "Windows", colorClass: "text-[#00adef]" };
    }
    if (p.includes("mac") || p.includes("apple") || p.includes("osx")) {
        return { icon: faApple, title: "macOS", colorClass: "text-zinc-200" };
    }
    if (p.includes("linux")) {
        // Linux penguin icon in white
        return { icon: faLinux, title: "Linux", colorClass: "text-white" };
    }
    if (p.includes("ps") || p.includes("playstation")) {
        return { icon: faPlaystation, title: "PlayStation", colorClass: "text-[#0070d1]" };
    }
    if (p.includes("xbox")) {
        return { icon: faXbox, title: "Xbox", colorClass: "text-[#107c10]" };
    }
    return null;
};

export const GameHero: React.FC<GameHeroProps> = ({
    game,
    isFollowing,
    onToggleFollow,
    isCommunityJoined,
    onCommunityAction,
}) => {
    const { lang } = useTranslation();
    const isVietnamese = lang === "vi";
    const [copiedAppId, setCopiedAppId] = useState(false);

    const heroArtwork =
        game.background ||
        game.backgroundRaw ||
        game.backgroundImage ||
        game.headerImage ||
        game.bannerUrl;

    const posterArtwork =
        game.headerImage ||
        game.capsuleImage ||
        game.capsuleUrl ||
        game.logoUrl;

    const isFree = game.isFree;

    // Filter out duplicate free-to-play tags if the game already has free status
    const rawGenres =
        (game.genres && game.genres.length > 0)
            ? game.genres
            : (game.genre && game.genre.length > 0)
            ? game.genre
            : [];

    const duplicateFreeKeywords = [
        "free to play",
        "free-to-play",
        "free",
        "miễn phí",
        "chơi miễn phí",
        "free to play game",
    ];

    const genresList = rawGenres.filter((genreItem) => {
        const lower = genreItem.toLowerCase().trim();
        if (isFree && duplicateFreeKeywords.some((kw) => lower === kw || lower.includes("miễn phí") || lower.includes("free to play"))) {
            return false;
        }
        return true;
    });

    // Steam-style text rating & count resolver
    const getRatingInfo = () => {
        // 1. If explicit sentiment exists
        if (game.sentiment || game.sentimentVi) {
            const text = isVietnamese ? (game.sentimentVi || game.sentiment) : (game.sentiment || game.sentimentVi);
            const lower = (game.sentiment || "").toLowerCase();
            let colorClass = "text-[#66c0f4]"; // Steam blue for positive
            if (lower.includes("mixed") || lower.includes("hỗn hợp")) colorClass = "text-[#b9a074]";
            if (lower.includes("negative") || lower.includes("tiêu cực")) colorClass = "text-rose-400";
            return {
                text,
                colorClass,
                count: game.totalReviewsCount || game.recommendationsCount,
            };
        }

        // 2. From metacriticScore or ratingScore
        const score = typeof game.metacriticScore === "number"
            ? game.metacriticScore
            : typeof game.ratingScore === "number"
            ? Math.round(game.ratingScore * 10)
            : null;

        if (score !== null) {
            if (score >= 75) {
                return {
                    text: score >= 90
                        ? (isVietnamese ? "Cực kỳ tích cực" : "Overwhelmingly Positive")
                        : (isVietnamese ? "Rất tích cực" : "Very Positive"),
                    colorClass: "text-[#66c0f4]",
                    count: game.totalReviewsCount || game.recommendationsCount,
                };
            }
            if (score >= 50) {
                return {
                    text: isVietnamese ? "Đánh giá hỗn hợp" : "Mixed Reviews",
                    colorClass: "text-[#b9a074]",
                    count: game.totalReviewsCount || game.recommendationsCount,
                };
            }
            return {
                text: isVietnamese ? "Đánh giá tiêu cực" : "Mostly Negative",
                colorClass: "text-rose-400",
                count: game.totalReviewsCount || game.recommendationsCount,
            };
        }

        if (typeof game.recommendationsCount === "number" && game.recommendationsCount > 0) {
            return {
                text: isVietnamese ? "Đánh giá tích cực" : "Positive",
                colorClass: "text-[#66c0f4]",
                count: game.recommendationsCount,
            };
        }

        return null;
    };

    const ratingInfo = getRatingInfo();

    const handleCopyAppId = async () => {
        if (!game.appid) return;
        try {
            await navigator.clipboard.writeText(String(game.appid));
            setCopiedAppId(true);
            setTimeout(() => setCopiedAppId(false), 2000);
        } catch {
            setCopiedAppId(false);
        }
    };

    return (
        <section className="relative w-full overflow-hidden bg-background border-b border-border/20">
            {/* 1. Cinematic Ambient Backdrop */}
            {heroArtwork && (
                <div className="absolute inset-0 h-[460px] sm:h-[500px] lg:h-[540px] w-full overflow-hidden pointer-events-none select-none">
                    <img
                        src={heroArtwork}
                        alt=""
                        className="w-full h-full object-cover object-top opacity-35 sm:opacity-45 filter blur-[1px]"
                    />
                    {/* Directional gradients fading into solid black */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-background/50" />
                </div>
            )}

            {/* 2. Hero Content Container */}
            <div className="relative z-10 max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-8 sm:pb-10">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 sm:gap-8">
                    {/* Left Column: Game Identity (Title, Capsule Image, Tags, Actions) */}
                    <div className="flex flex-col gap-4 flex-1 min-w-0">
                        {/* Game Title (No duplicate subtitle below) */}
                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-text tracking-tight leading-[1.15] drop-shadow-md">
                            {game.name}
                        </h1>

                        {/* Capsule Art & Actions/Tags Row */}
                        <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                            {/* Standardized 460x215 Capsule Art without scale animation */}
                            {posterArtwork && (
                                <div className="w-full sm:w-[320px] md:w-[380px] lg:w-[460px] aspect-[460/215] rounded-none sm:rounded-md overflow-hidden bg-surface ring-1 ring-border/40 shadow-xl shrink-0">
                                    <img
                                        src={posterArtwork}
                                        alt={game.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}

                            {/* Tags & Action Buttons next to capsule */}
                            <div className="flex flex-col gap-3.5 min-w-0 flex-1">
                                {/* Genres / Tags (Without duplicate free tags) */}
                                {genresList.length > 0 && (
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        {genresList.slice(0, 5).map((genreItem) => (
                                            <span
                                                key={genreItem}
                                                className="px-2.5 py-1 rounded-md text-xs font-medium bg-surface/70 hover:bg-surface text-text-muted hover:text-text border border-border/40 transition-colors"
                                            >
                                                {genreItem}
                                            </span>
                                        ))}
                                        {genresList.length > 5 && (
                                            <span className="text-xs text-text-muted/70 px-1">
                                                +{genresList.length - 5}
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Action Toolbar */}
                                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                                    {/* Primary Action: Community Action */}
                                    <button
                                        type="button"
                                        onClick={onCommunityAction}
                                        className={`px-4 py-2 sm:px-4 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer shadow-md flex items-center gap-2 active:scale-95 ${
                                            isCommunityJoined
                                                ? "bg-surface-hover text-emerald-400 border border-emerald-500/30 hover:bg-surface"
                                                : "bg-primary text-white hover:bg-primary-hover shadow-primary/20"
                                        }`}
                                    >
                                        {isCommunityJoined ? (
                                            <Check className="w-4 h-4" />
                                        ) : (
                                            <Users className="w-4 h-4" />
                                        )}
                                        <span>
                                            {isCommunityJoined
                                                ? (isVietnamese ? "Đã tham gia cộng đồng" : "Joined Community")
                                                : (isVietnamese ? "Khám phá cộng đồng" : "Explore Community")}
                                        </span>
                                    </button>

                                    {/* Add to Library */}
                                    <button
                                        type="button"
                                        onClick={onToggleFollow}
                                        className={`px-3.5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer border flex items-center gap-2 active:scale-95 ${
                                            isFollowing
                                                ? "bg-surface-hover text-primary border-primary/40 shadow-xs"
                                                : "bg-surface/80 text-text-muted hover:text-text border-border/40 hover:border-border/70"
                                        }`}
                                        title={isFollowing ? (isVietnamese ? "Xóa khỏi thư viện" : "Remove from Library") : (isVietnamese ? "Thêm vào thư viện" : "Add to Library")}
                                    >
                                        {isFollowing ? (
                                            <Check className="w-4 h-4 text-primary" />
                                        ) : (
                                            <Library className="w-4 h-4" />
                                        )}
                                        <span>
                                            {isFollowing
                                                ? (isVietnamese ? "Trong thư viện" : "In Library")
                                                : (isVietnamese ? "Thêm vào thư viện" : "Add to Library")}
                                        </span>
                                    </button>

                                    {/* Steam Store Button */}
                                    {game.steamAvailable && game.steamUrl && (
                                        <a
                                            href={game.steamUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-3.5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium text-text-muted hover:text-text bg-surface/80 hover:bg-surface border border-border/40 hover:border-border/70 transition-all inline-flex items-center gap-2 cursor-pointer group active:scale-95"
                                        >
                                            <FontAwesomeIcon icon={faSteam} className="text-sm group-hover:text-primary transition-colors" />
                                            <span>Steam</span>
                                            <ExternalLink className="w-3.5 h-3.5 text-text-muted/60 group-hover:text-text transition-colors" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Steam-Style Info Card - NO BORDER RADIUS (rounded-none) */}
                    <div className="shrink-0 w-full lg:w-[320px] xl:w-[340px] p-4 sm:p-5 rounded-none bg-surface/85 backdrop-blur-md border border-border/40 shadow-xl flex flex-col gap-3.5">
                        {/* 1. Rating on Top (Steam Text Rating & Count format) */}
                        <div className="flex flex-col gap-1">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                                {isVietnamese ? "TẤT CẢ ĐÁNH GIÁ:" : "ALL REVIEWS:"}
                            </span>
                            {ratingInfo ? (
                                <div className="flex flex-wrap items-baseline gap-1.5">
                                    <span className={`text-sm sm:text-base font-bold ${ratingInfo.colorClass}`}>
                                        {ratingInfo.text}
                                    </span>
                                    {typeof ratingInfo.count === "number" && (
                                        <span className="text-xs text-text-muted font-normal">
                                            ({ratingInfo.count.toLocaleString()} {isVietnamese ? "bài đánh giá" : "reviews"})
                                        </span>
                                    )}
                                </div>
                            ) : (
                                <span className="text-xs text-text-muted">
                                    {isVietnamese ? "Chưa có đủ bài đánh giá" : "No user reviews yet"}
                                </span>
                            )}
                        </div>

                        {/* Thin Divider */}
                        <div className="w-full h-px bg-border/20" />

                        {/* 2. Info Rows: dev, platform, paid, release time, appid */}
                        <div className="flex flex-col divide-y divide-border/15 text-xs">
                            {/* DEV (Nhà phát triển & Nhà phát hành) */}
                            {(game.developer || game.publisher) && (
                                <div className="py-2 flex items-baseline justify-between gap-3 first:pt-0">
                                    <span className="text-text-muted shrink-0">
                                        {isVietnamese ? "Nhà phát triển:" : "Developer:"}
                                    </span>
                                    <span className="text-text font-medium text-right break-words">
                                        {game.developer || game.publisher}
                                    </span>
                                </div>
                            )}

                            {/* PLATFORM (Nền tảng, Linux chim cánh cụt màu trắng) */}
                            {game.platforms && game.platforms.length > 0 && (
                                <div className="py-2 flex items-center justify-between gap-3">
                                    <span className="text-text-muted shrink-0">
                                        {isVietnamese ? "Nền tảng:" : "Platform:"}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        {game.platforms.map((platform) => {
                                            const info = getPlatformIcon(platform);
                                            return info ? (
                                                <span
                                                    key={platform}
                                                    title={info.title}
                                                    className={`text-sm cursor-default ${info.colorClass}`}
                                                >
                                                    <FontAwesomeIcon icon={info.icon} />
                                                </span>
                                            ) : (
                                                <span
                                                    key={platform}
                                                    className="text-[11px] text-text font-medium bg-surface px-1.5 py-0.5 rounded"
                                                >
                                                    {platform}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* PAID (Phí bản quyền / Free to Play) */}
                            <div className="py-2 flex items-baseline justify-between gap-3">
                                <span className="text-text-muted shrink-0">
                                    {isVietnamese ? "Bản quyền:" : "Price:"}
                                </span>
                                <span className={`font-semibold text-right ${isFree ? "text-emerald-400" : "text-text"}`}>
                                    {isFree
                                        ? (isVietnamese ? "Miễn phí (Free to Play)" : "Free to Play")
                                        : (isVietnamese ? "Có phí (Paid)" : "Paid")}
                                </span>
                            </div>

                            {/* RELEASE TIME (Thời gian phát hành) */}
                            {(game.releaseDate || game.releaseDateComingSoon) && (
                                <div className="py-2 flex items-center justify-between gap-3">
                                    <span className="text-text-muted shrink-0">
                                        {isVietnamese ? "Ngày phát hành:" : "Release Date:"}
                                    </span>
                                    <div className="flex items-center gap-1.5 text-right">
                                        {game.releaseDateComingSoon ? (
                                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                <span>{isVietnamese ? "Sắp ra mắt" : "Coming Soon"}</span>
                                            </span>
                                        ) : (
                                            <span className="text-text font-medium">{game.releaseDate}</span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* APPID (Steam AppID kèm nút copy) */}
                            {game.appid && (
                                <div className="py-2 flex items-center justify-between gap-3 last:pb-0">
                                    <span className="text-text-muted shrink-0">
                                        Steam AppID:
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleCopyAppId}
                                        className="group/appid px-2 py-0.5 rounded bg-surface hover:bg-surface-hover text-text font-mono text-[11px] border border-border/30 hover:border-border/60 transition-colors flex items-center gap-1.5 cursor-pointer"
                                        title={isVietnamese ? "Bấm để sao chép Steam AppID" : "Click to copy Steam AppID"}
                                    >
                                        <span>{game.appid}</span>
                                        {copiedAppId ? (
                                            <Check className="w-3 h-3 text-emerald-400" />
                                        ) : (
                                            <Copy className="w-3 h-3 text-text-muted/60 group-hover/appid:text-text" />
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
