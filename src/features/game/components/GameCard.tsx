import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Star, Users, Gamepad2 } from "lucide-react";
import { useTranslation } from "@/shared/hooks/useTranslate";
import { type GameData } from "../types";

interface GameCardProps {
    game: GameData;
}

export const GameCard: React.FC<GameCardProps> = ({ game }) => {
    const { lang } = useTranslation();
    const isVi = lang === "vi";
    const navigate = useNavigate();

    const [imageError, setImageError] = useState(false);
    const artworkUrl = game.bannerUrl || game.headerImage || game.backgroundImage || game.logoUrl;

    const handleCardClick = () => {
        navigate({ to: "/game/$gameSlug", params: { gameSlug: game.slug } });
    };

    const handleCommunityClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (game.communityId) {
            navigate({ to: "/community/$communityId", params: { communityId: game.communityId } });
        }
    };

    // Extract clean genre tags
    const genreTags = React.useMemo(() => {
        const raw = [...(game.genres || []), ...(game.genre || [])];
        const unique = Array.from(new Set(raw.filter(Boolean)));
        return unique.slice(0, 3);
    }, [game.genres, game.genre]);

    // Format release year
    const releaseYear = React.useMemo(() => {
        if (!game.releaseDate) return null;
        const match = game.releaseDate.match(/\d{4}/);
        return match ? match[0] : null;
    }, [game.releaseDate]);

    return (
        <div
            onClick={handleCardClick}
            className="group relative w-full flex flex-col rounded-xl bg-surface-inner/60 hover:bg-surface-inner p-2.5 sm:p-3 cursor-pointer select-none transition-colors"
        >
            {/* 1. Artwork Window (16:9 Aspect Ratio) - Borderless clean presentation */}
            <div className="relative w-full aspect-[16/9] overflow-hidden rounded-lg bg-black/40">
                {artworkUrl && !imageError ? (
                    <img
                        src={artworkUrl}
                        alt={game.name}
                        loading="lazy"
                        onError={() => setImageError(true)}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-surface-inner text-text-faint/30">
                        <Gamepad2 className="w-8 h-8 opacity-30 mb-1" />
                        <span className="text-[10px] font-mono font-medium text-text-faint/50 uppercase tracking-widest">
                            {game.name}
                        </span>
                    </div>
                )}

                {/* Subtle dark gradient fading artwork into body */}
                <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

                {/* Rating Badge Overlay (Top Right) */}
                {game.ratingScore ? (
                    <div className="absolute top-2 right-2 z-10 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-amber-400 text-xs font-bold shadow-xs">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{game.ratingScore}</span>
                    </div>
                ) : game.sentimentVi ? (
                    <div className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-emerald-400 text-[10px] font-bold">
                        {isVi ? game.sentimentVi : game.sentiment}
                    </div>
                ) : null}

                {/* Genre Tag Overlay (Bottom Left) */}
                {genreTags.length > 0 && (
                    <span className="absolute bottom-2 left-2 z-10 px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/75 text-white/90 backdrop-blur-xs">
                        {genreTags[0]}
                    </span>
                )}
            </div>

            {/* 2. Content Body - Natural spacing, high-contrast typography */}
            <div className="pt-2.5 px-0.5 flex flex-col justify-between flex-1 gap-2">
                <div className="flex flex-col min-w-0">
                    {/* Developer & Year */}
                    <div className="flex items-center gap-1.5 text-xs font-medium text-text-muted truncate pb-0.5">
                        <span className="truncate">{game.developer || "Studio"}</span>
                        {releaseYear && (
                            <>
                                <span className="opacity-40">•</span>
                                <span className="shrink-0">{releaseYear}</span>
                            </>
                        )}
                    </div>

                    {/* Title */}
                    <h3
                        className="text-sm sm:text-base font-semibold text-text group-hover:text-primary transition-colors line-clamp-1 leading-snug"
                        title={game.name}
                    >
                        {game.name}
                    </h3>

                    {/* Tags */}
                    {genreTags.length > 0 && (
                        <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 min-h-[1.25rem] pt-1">
                            {genreTags.map((tag, idx) => (
                                <span
                                    key={`${tag}-${idx}`}
                                    className="text-xs text-sky-400 hover:text-sky-300 font-medium transition-colors"
                                >
                                    #{tag.replace(/\s+/g, "")}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Short synopsis description */}
                {(game.descriptionVi || game.description || game.shortDescription) && (
                    <p className="text-xs text-text-muted/80 line-clamp-2 leading-relaxed">
                        {game.descriptionVi || game.description || game.shortDescription}
                    </p>
                )}

                {/* 3. Footer Metadata & Action Layer - Natural spacing without border-t */}
                <div className="pt-2 mt-auto flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 min-w-0 text-xs text-text-muted">
                        {game.platforms && game.platforms.length > 0 ? (
                            <div className="flex items-center gap-1">
                                {game.platforms.slice(0, 3).map((p) => (
                                    <span key={p} className="text-[10px] text-text-faint font-medium">
                                        {p}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <span className="truncate text-text-faint">
                                {isVi ? game.sentimentVi || "Rất tích cực" : game.sentiment || "Positive"}
                            </span>
                        )}
                    </div>

                    {/* Community Hub Button */}
                    {game.communityId && (
                        <button
                            type="button"
                            onClick={handleCommunityClick}
                            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-text hover:text-primary bg-surface-hover/80 hover:bg-surface-hover rounded-full cursor-pointer transition-colors shrink-0"
                            title={isVi ? "Vào cộng đồng" : "Visit Community"}
                        >
                            <Users className="w-3.5 h-3.5 text-primary" />
                            <span>{isVi ? "Cộng đồng" : "Hub"}</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
