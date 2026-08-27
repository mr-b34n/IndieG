import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faChevronLeft,
    faChevronRight,
    faStar,
    faUsers,
    faArrowRight
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "@/shared/hooks/useTranslate";
import type { FeaturedStory } from "../types";

interface FeaturedHeroMagazineProps {
    stories: FeaturedStory[];
}

export const FeaturedHeroMagazine = ({ stories }: FeaturedHeroMagazineProps) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        if (isHovered || stories.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % stories.length);
        }, 7000);
        return () => clearInterval(timer);
    }, [isHovered, stories.length]);

    if (!stories.length) return null;

    const currentStory = stories[currentIndex];

    const handlePrev = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + stories.length) % stories.length);
    };

    const handleNext = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % stories.length);
    };

    return (
        <section 
            className="w-full flex flex-col gap-3 select-none"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Editorial Section Label */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-text-faint">
                        {t('explore.featured', { defaultValue: 'FEATURED' })}
                    </span>
                    <span className="text-text-faint text-xs">•</span>
                    <span className="text-xs font-bold text-primary">
                        {currentStory.category}
                    </span>
                </div>

                {/* Editorial Index Tracker (01 / 04) & Arrow Controls */}
                <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-text-muted tracking-widest">
                        {String(currentIndex + 1).padStart(2, "0")} / {String(stories.length).padStart(2, "0")}
                    </span>
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={handlePrev}
                            className="w-7 h-7 rounded-[4px] bg-surface-hover hover:bg-surface-hover/80 text-text-muted hover:text-text flex items-center justify-center transition-colors cursor-pointer border border-divider-primary"
                            title={t('explore.prevStory', { defaultValue: 'Previous story' })}
                        >
                            <FontAwesomeIcon icon={faChevronLeft} className="text-[10px]" />
                        </button>
                        <button
                            type="button"
                            onClick={handleNext}
                            className="w-7 h-7 rounded-[4px] bg-surface-hover hover:bg-surface-hover/80 text-text-muted hover:text-text flex items-center justify-center transition-colors cursor-pointer border border-divider-primary"
                            title={t('explore.nextStory', { defaultValue: 'Next story' })}
                        >
                            <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Editorial Hero Canvas (4-6px radius, direct artwork overlay, no nested card boxes) */}
            <div 
                onClick={() => navigate({ to: `/game/${currentStory.slug}` })}
                className="relative w-full h-[320px] sm:h-[380px] lg:h-[420px] rounded-[6px] overflow-hidden group cursor-pointer border border-divider-primary bg-surface shadow-lg"
            >
                {/* Background Artwork */}
                <img
                    key={currentStory.id}
                    src={currentStory.artworkUrl}
                    alt={currentStory.title}
                    className="absolute inset-0 w-full h-full object-cover object-center scale-100 group-hover:scale-102 transition-transform duration-700 ease-out"
                />

                {/* Dark Gradient Overlay for high-contrast legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent pointer-events-none" />

                {/* Overlay Editorial Content */}
                <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end">
                    <div className="flex flex-col gap-2 max-w-3xl">
                        {/* Genres and Meta Info */}
                        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-text-muted">
                            <span className="text-white/90 uppercase tracking-wider font-bold">
                                {currentStory.genres.join(" · ")}
                            </span>
                            {currentStory.rating && (
                                <span className="flex items-center gap-1 text-amber-400 font-bold bg-black/50 px-2 py-0.5 rounded-[4px] border border-amber-400/20">
                                    <FontAwesomeIcon icon={faStar} className="text-[10px]" />
                                    {currentStory.rating}
                                </span>
                            )}
                            {currentStory.activePlayers && (
                                <span className="hidden sm:flex items-center gap-1 text-emerald-400 font-bold bg-black/50 px-2 py-0.5 rounded-[4px] border border-emerald-400/20">
                                    <FontAwesomeIcon icon={faUsers} className="text-[10px]" />
                                    {currentStory.activePlayers}
                                </span>
                            )}
                        </div>

                        {/* Title Display */}
                        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight uppercase leading-none drop-shadow-md group-hover:text-primary transition-colors duration-200">
                            {currentStory.title}
                        </h2>

                        {/* Editorial Description Snippet */}
                        <p className="text-xs sm:text-sm text-gray-200 line-clamp-2 leading-relaxed max-w-2xl mt-1 drop-shadow-sm font-normal">
                            {currentStory.description}
                        </p>

                        {/* Action CTA Row */}
                        <div className="flex items-center gap-3 mt-3">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate({ to: `/game/${currentStory.slug}` });
                                }}
                                className="px-4 py-2 rounded-[4px] bg-primary hover:bg-primary/90 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-md"
                            >
                                <span>{t('explore.exploreCommunity', { defaultValue: 'Explore Community' })}</span>
                                <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
                            </button>

                            {currentStory.communityMembers && (
                                <span className="text-xs font-semibold text-gray-300 hidden sm:inline-block">
                                    {t('explore.discussingCount', { count: currentStory.communityMembers, defaultValue: `${currentStory.communityMembers} discussing` })}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
