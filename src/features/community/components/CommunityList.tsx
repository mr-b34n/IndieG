import { useEffect, useMemo, useState } from "react";
import { Gamepad2, RotateCcw } from "lucide-react";
import { useCommunitiesStore } from "../store/useCommunitiesStore";
import type { CommunityTabKey } from "../types";
import { useTranslation } from "@/shared/hooks/useTranslate";
import { useAuthStore } from "@/features/auth";
import { Pagination } from "@/shared/components/ui/Pagination";
import { CommunityNavigator } from "./CommunityNavigator";
import { CommunityGameTile } from "./CommunityGameTile";
import { CommunityListRow } from "./CommunityListRow";
import { CommunityGridSkeleton, CommunityListSkeleton } from "./CommunitySkeleton";
import { useCommunitiesQuery } from "@/shared/api/useQueries";
import { isGenericTestCommunity } from "@/shared/api";

export const CommunityList = () => {
    const { t } = useTranslation();
    const user = useAuthStore((state) => state.user);
    const isLoggedIn = !!user;

    const [currentPage, setCurrentPage] = useState(1);
    const [activeTab, setActiveTab] = useState<CommunityTabKey>("discover");
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<"grid" | "list">(() => {
        try {
            return (localStorage.getItem("indieg_community_view_mode") as "grid" | "list") || "grid";
        } catch {
            return "grid";
        }
    });

    const ITEMS_PER_PAGE = 8;

    const communities = useCommunitiesStore((state) => state.communities);
    const storeLoading = useCommunitiesStore((state) => state.isLoading);
    const mergeCommunities = useCommunitiesStore((state) => state.mergeCommunities);
    const syncJoinedCommunities = useCommunitiesStore((state) => state.syncJoinedCommunities);
    const joinedCommunityIds = useCommunitiesStore((state) => state.joinedCommunityIds);

    // 1. Keep joined communities updated in store
    const { data: rawJoinedData } = useCommunitiesQuery(
        { type: "joined", limit: 50 },
        { enabled: isLoggedIn }
    );

    useEffect(() => {
        if (rawJoinedData) {
            syncJoinedCommunities(rawJoinedData);
        }
    }, [rawJoinedData, syncJoinedCommunities]);

    // 2. Query for current tab / pagination
    const { data: rawCommunitiesData, isLoading: isQueryLoading } = useCommunitiesQuery({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        type: activeTab === "joined" ? "joined" : "all",
    });

    useEffect(() => {
        if (rawCommunitiesData) {
            mergeCommunities(rawCommunitiesData, activeTab === "joined");
        }
    }, [rawCommunitiesData, mergeCommunities, activeTab]);

    const isLoading = isQueryLoading || storeLoading;

    const handleViewModeChange = (mode: "grid" | "list") => {
        setViewMode(mode);
        try {
            localStorage.setItem("indieg_community_view_mode", mode);
        } catch {
            // Ignore storage error
        }
    };

    const isCommunityJoined = (c: { id: string | number; slug?: string; joined?: boolean }) => {
        return Boolean(
            c.joined ||
            joinedCommunityIds.some(
                (jid) =>
                    String(jid).toLowerCase() === String(c.id).toLowerCase() ||
                    (c.slug && String(jid).toLowerCase() === String(c.slug).toLowerCase())
            )
        );
    };

    const categories = useMemo(() => {
        const catSet = new Set<string>();
        communities.forEach((c) => {
            if (isGenericTestCommunity(c)) return;
            if (c.category && c.category.trim() && c.category.trim().toLowerCase() !== "indie") {
                catSet.add(c.category.trim());
            }
        });
        return Array.from(catSet);
    }, [communities]);

    const joinedCount = useMemo(
        () => communities.filter((c) => isCommunityJoined(c) && !isGenericTestCommunity(c)).length,
        [communities, joinedCommunityIds]
    );

    const filtered = useMemo(() => {
        let list = communities.filter((c) => !isGenericTestCommunity(c));

        if (activeTab === "joined") {
            list = list.filter((c) => isCommunityJoined(c));
        }

        if (activeCategory) {
            const catLower = activeCategory.toLowerCase();
            list = list.filter((c) => {
                const matchCategory = c.category && c.category.toLowerCase() === catLower;
                const matchTags = c.tags && c.tags.some((t) => t.toLowerCase() === catLower);
                return Boolean(matchCategory || matchTags);
            });
        }

        return list;
    }, [communities, activeTab, activeCategory, joinedCommunityIds]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
    const totalItems = filtered.length;

    const paginatedCommunities = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filtered.slice(start, start + ITEMS_PER_PAGE);
    }, [filtered, currentPage]);

    const handleTabChange = (tab: CommunityTabKey) => {
        setActiveTab(tab);
        setCurrentPage(1);
    };

    const handleCategoryChange = (cat: string | null) => {
        setActiveCategory(cat);
        setCurrentPage(1);
    };

    return (
        <div className="w-full flex flex-col gap-4 pb-16 select-none">
            {/* Community Navigator (No search bar, no corner title, 2 tabs, view toggle) */}
            <CommunityNavigator
                activeTab={activeTab}
                onTabChange={handleTabChange}
                categories={categories}
                activeCategory={activeCategory}
                onCategoryChange={handleCategoryChange}
                joinedCount={joinedCount}
                viewMode={viewMode}
                onViewModeChange={handleViewModeChange}
            />

            {/* Directory Content: Grid / List / Skeletons / Empty State */}
            {isLoading && communities.length === 0 ? (
                <div className="w-full">
                    {viewMode === "grid" ? (
                        <CommunityGridSkeleton count={6} />
                    ) : (
                        <CommunityListSkeleton count={6} />
                    )}
                </div>
            ) : filtered.length > 0 ? (
                <div className="flex flex-col gap-4">
                    {viewMode === "grid" ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                            {paginatedCommunities.map((community, idx) => (
                                <CommunityGameTile
                                    key={`${community.id || community.slug || 'comm'}-${idx}`}
                                    community={community}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1.5">
                            {paginatedCommunities.map((community, idx) => (
                                <CommunityListRow
                                    key={`${community.id || community.slug || 'comm'}-${idx}`}
                                    community={community}
                                />
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="pt-2">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                                totalItems={totalItems}
                                itemsPerPage={ITEMS_PER_PAGE}
                            />
                        </div>
                    )}
                </div>
            ) : (
                /* Empty / No Results State (Border-free YouTube / Facebook style) */
                <div className="w-full flex flex-col items-center justify-center gap-2 py-16 px-4 bg-surface-inner/40 rounded-2xl text-center">
                    <div className="w-12 h-12 rounded-2xl bg-white/[0.06] flex items-center justify-center text-text-faint mb-1">
                        <Gamepad2 className="w-6 h-6 opacity-40" />
                    </div>
                    <p className="font-semibold text-sm text-white">
                        {t('community.emptyTitle', { defaultValue: 'Không có cộng đồng nào phù hợp' })}
                    </p>
                    <p className="text-white/60 max-w-md text-xs">
                        {t('community.emptyDesc', { defaultValue: 'Thử chọn tab hoặc thể loại khác.' })}
                    </p>
                    <button
                        type="button"
                        onClick={() => {
                            setActiveCategory(null);
                            setActiveTab("discover");
                            setCurrentPage(1);
                        }}
                        className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 text-white font-medium text-xs cursor-pointer transition-colors"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{t('community.viewAll', { defaultValue: 'Xem tất cả' })}</span>
                    </button>
                </div>
            )}
        </div>
    );
};
