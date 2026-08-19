import { useState } from "react";
import { useTranslation } from "@/shared/hooks/useTranslate";
import type { ExploreContentType, ExploreSortOption } from "../types";
import {
    FEATURED_STORIES,
    VIETNAMESE_NEWS_ITEMS,
    ONGOING_EVENTS,
    TRENDING_TAGS,
    VIRAL_TILES
} from "../data";
import { ExploreControlRail } from "./ExploreControlRail";
import { FeaturedHeroMagazine } from "./FeaturedHeroMagazine";
import { EditorialNewsSection } from "./EditorialNewsSection";
import { OngoingEventsSection } from "./OngoingEventsSection";
import { TrendingTagsSection } from "./TrendingTagsSection";
import { ViralMasonrySection } from "./ViralMasonrySection";

export const ExplorePage = () => {
    const { t } = useTranslation();
    const [activeType, setActiveType] = useState<ExploreContentType>("all");
    const [sortOrder, setSortOrder] = useState<ExploreSortOption>("latest");

    // Filter media tiles based on content tab
    const filteredViralTiles = (() => {
        if (activeType === "media") {
            return VIRAL_TILES.filter((tile) => tile.contentType === "VIDEO" || tile.contentType === "SCREENSHOT");
        }
        if (activeType === "viral") {
            return VIRAL_TILES;
        }
        return VIRAL_TILES;
    })();

    return (
        <div className="w-full flex flex-col gap-8 pb-16 animate-fade-in">
            {/* ── Page Header: Clean, High-Contrast Typography & Minimalist Divider ── */}
            <div className="flex flex-col gap-1 pt-1">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-text uppercase">
                        {t('explore.title')}
                    </h1>
                </div>
                <p className="text-xs text-text-muted">
                    {t('explore.subtitle')}
                </p>
            </div>

            {/* ── Discover Content Rail & Sort Selector ── */}
            <ExploreControlRail
                activeType={activeType}
                onSelectType={setActiveType}
                sortOrder={sortOrder}
                onSortChange={setSortOrder}
            />

            {/* ── View Rendering Based on Active Content Type Filter ── */}
            {activeType === "all" && (
                <div className="flex flex-col gap-10">
                    {/* 1. Featured Stories Magazine Hero */}
                    <FeaturedHeroMagazine stories={FEATURED_STORIES} />

                    {/* 2. News & Featured: Vietnamese Games & Studio Spotlights */}
                    <EditorialNewsSection items={VIETNAMESE_NEWS_ITEMS} />

                    {/* 3. Ongoing Events & Tournaments */}
                    <OngoingEventsSection events={ONGOING_EVENTS} />

                    {/* 4. Trending Topics (Text-Only, No Pills) */}
                    <TrendingTagsSection tags={TRENDING_TAGS} />

                    {/* 5. Viral Masonry Media Tiles with Content Type Badges */}
                    <ViralMasonrySection tiles={filteredViralTiles} />
                </div>
            )}

            {activeType === "news" && (
                <div className="flex flex-col gap-8">
                    <EditorialNewsSection items={VIETNAMESE_NEWS_ITEMS} />
                    <FeaturedHeroMagazine stories={FEATURED_STORIES.slice(0, 2)} />
                </div>
            )}

            {activeType === "events" && (
                <div className="flex flex-col gap-8">
                    <OngoingEventsSection events={ONGOING_EVENTS} />
                    <TrendingTagsSection tags={TRENDING_TAGS} />
                </div>
            )}

            {activeType === "viral" && (
                <div className="flex flex-col gap-8">
                    <ViralMasonrySection tiles={filteredViralTiles} />
                    <TrendingTagsSection tags={TRENDING_TAGS} />
                </div>
            )}

            {activeType === "media" && (
                <div className="flex flex-col gap-8">
                    <ViralMasonrySection tiles={filteredViralTiles} />
                </div>
            )}
        </div>
    );
};
