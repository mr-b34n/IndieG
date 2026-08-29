import { useState, useMemo } from "react";
import { type CommunityData } from "@/features/community";
import { CommunityDrawerModal } from "./CommunityDrawerModal";
import { FeedSortDropdown, type FeedSortOption } from "./FeedSortDropdown";
import { useTranslation } from "@/shared/hooks/useTranslate";

interface CommunitySwitcherRailProps {
    joinedCommunities: CommunityData[];
    activeCommunityId: string | null;
    onSelectCommunity: (id: string | null) => void;
    sortOrder: FeedSortOption;
    onSortChange: (sort: FeedSortOption) => void;
}

const MAX_VISIBLE_COMMUNITIES = 3;

export const CommunitySwitcherRail = ({
    joinedCommunities,
    activeCommunityId,
    onSelectCommunity,
    sortOrder,
    onSortChange,
}: CommunitySwitcherRailProps) => {
    const { t } = useTranslation();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [recentIds, setRecentIds] = useState<string[]>(() => {
        try {
            const saved = localStorage.getItem("indieg_recent_communities");
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const recordRecent = (id: string | null) => {
        if (!id) return;
        setRecentIds((prev) => {
            const next = [id, ...prev.filter((item) => item !== id)].slice(0, 8);
            try {
                localStorage.setItem("indieg_recent_communities", JSON.stringify(next));
            } catch {
                // Ignore storage error
            }
            return next;
        });
    };

    const handleSelect = (id: string | null) => {
        recordRecent(id);
        onSelectCommunity(id);
    };

    // Calculate which 3-4 communities to display on the rail
    const visibleCommunities = useMemo(() => {
        if (joinedCommunities.length === 0) return [];

        // Prioritize recently interacted communities, then joined order
        const sorted = [...joinedCommunities].sort((a, b) => {
            const indexA = recentIds.indexOf(String(a.id));
            const indexB = recentIds.indexOf(String(b.id));
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            return 0;
        });

        let topItems = sorted.slice(0, MAX_VISIBLE_COMMUNITIES);

        // If the active community is not among the top items, insert it so user always sees the active filter
        if (activeCommunityId) {
            const activeCommunity = joinedCommunities.find((c) => String(c.id) === String(activeCommunityId));
            if (activeCommunity && !topItems.some((c) => String(c.id) === String(activeCommunityId))) {
                topItems = [activeCommunity, ...topItems.slice(0, MAX_VISIBLE_COMMUNITIES - 1)];
            }
        }

        return topItems;
    }, [joinedCommunities, recentIds, activeCommunityId]);

    // Number of hidden communities
    const hiddenCount = Math.max(0, joinedCommunities.length - visibleCommunities.length);

    return (
        <div className="w-full flex flex-col pt-3">
            {/* Top Micro-Header: YOUR FEED & Sort Dropdown */}
            <div className="flex items-center justify-between pb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-text-faint">
                    {t('feed.yourFeed', { defaultValue: 'YOUR FEED' })}
                </span>

                <FeedSortDropdown
                    value={sortOrder}
                    onChange={onSortChange}
                />
            </div>

            {/* Switcher Rail: ALL + Top Communities + (+N more) */}
            <div className="flex items-center gap-5 sm:gap-7 border-b border-divider-primary pt-1 overflow-x-hidden">
                {/* ALL Option */}
                <button
                    type="button"
                    onClick={() => handleSelect(null)}
                    className={`text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer pb-2.5 -mb-[1px] border-b-2 shrink-0 ${
                        activeCommunityId === null
                            ? "text-primary border-primary"
                            : "text-text-muted hover:text-text border-transparent"
                    }`}
                >
                    {t('common.all', { defaultValue: 'ALL' }).toUpperCase()}
                </button>

                {/* Visible Top Communities */}
                {visibleCommunities.map((c) => {
                    const isSelected = String(c.id) === String(activeCommunityId);
                    return (
                        <button
                            key={c.id}
                            type="button"
                            onClick={() => handleSelect(isSelected ? null : String(c.id))}
                            className={`flex items-center gap-2 text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer pb-2.5 -mb-[1px] border-b-2 shrink-0 ${
                                isSelected
                                    ? "text-primary border-primary"
                                    : "text-text-muted hover:text-text border-transparent"
                            }`}
                        >
                            <img
                                src={c.logo}
                                alt={c.name}
                                className="w-3.5 h-3.5 rounded-full object-cover shrink-0"
                            />
                            <span className="truncate max-w-[120px] sm:max-w-[180px]">{c.name}</span>
                        </button>
                    );
                })}

                {/* +N More Communities Button */}
                {hiddenCount > 0 && (
                    <button
                        type="button"
                        onClick={() => setIsDrawerOpen(true)}
                        className="text-xs font-bold text-text-faint hover:text-primary transition-colors cursor-pointer pb-2.5 -mb-[1px] border-b-2 border-transparent shrink-0 flex items-center gap-1"
                        title="View all joined communities"
                    >
                        <span>{t('feed.moreCommunities', { count: hiddenCount, defaultValue: `+${hiddenCount} more` })}</span>
                    </button>
                )}
            </div>

            {/* Community Drawer Modal */}
            <CommunityDrawerModal
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                joinedCommunities={joinedCommunities}
                activeCommunityId={activeCommunityId}
                onSelectCommunity={handleSelect}
                recentIds={recentIds}
            />
        </div>
    );
};
