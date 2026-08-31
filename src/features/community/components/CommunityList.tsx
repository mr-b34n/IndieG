import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGamepad, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useCommunitiesStore } from "../store/useCommunitiesStore";
import type { CommunityTabKey, CommunityData } from "../types";
import { useTranslation } from "@/shared/hooks/useTranslate";
import { CreateCommunityModal } from "./CreateCommunityModal";
import { useAuthStore } from "@/features/auth";
import { Pagination } from "@/shared/components/ui/Pagination";
import { CommunityHeader } from "./CommunityHeader";
import { CommunityNavigator } from "./CommunityNavigator";
import { CommunityGameTile } from "./CommunityGameTile";
import { useCommunitiesQuery } from "@/shared/api/useQueries";
import { mapCommunityDtoToCommunityData, extractPaginationMeta, type CommunityDto } from "@/shared/api";

function extractCommunityList(res: unknown): CommunityDto[] {
    if (!res) return [];
    if (Array.isArray(res)) return res as CommunityDto[];
    if (typeof res === "object") {
        const obj = res as Record<string, unknown>;
        if (Array.isArray(obj.items)) return obj.items as CommunityDto[];
        if (Array.isArray(obj.data)) return obj.data as CommunityDto[];
        if (Array.isArray(obj.communities)) return obj.communities as CommunityDto[];
    }
    return [];
}

export const CommunityList = () => {
    const { t } = useTranslation();
    const user = useAuthStore((state) => state.user);
    const isAdmin = user?.role === "admin";
    const canCreateCommunity = isAdmin;

    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 9;

    // 1. TanStack Query for communities
    const { data: rawCommunitiesData, isLoading: isQueryLoading } = useCommunitiesQuery({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
    });

    const communities = useCommunitiesStore((state) => state.communities);
    const storeLoading = useCommunitiesStore((state) => state.isLoading);
    const isLoading = isQueryLoading || storeLoading;
    
    // Sync query results to global store if needed
    useEffect(() => {
        if (rawCommunitiesData) {
            const list = extractCommunityList(rawCommunitiesData);
            if (Array.isArray(list) && list.length > 0) {
                const mapped: CommunityData[] = list.map((item) => {
                    const existing = communities.find((c) => String(c.id) === String(item.id));
                    return {
                        ...mapCommunityDtoToCommunityData(item),
                        joined: existing?.joined ?? false,
                    };
                });
                useCommunitiesStore.setState({ communities: mapped, isLoading: false });
            }
        }
    }, [rawCommunitiesData]);
    
    const [activeTab, setActiveTab] = useState<CommunityTabKey>("discover");
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);

    const categories = useMemo(
        () => Array.from(new Set(communities.map((c) => c.category))),
        [communities]
    );

    const totalMembers = useMemo(
        () => communities.reduce((acc, c) => acc + c.members, 0),
        [communities]
    );

    const totalOnline = useMemo(
        () => communities.reduce((acc, c) => acc + c.onlineNow, 0),
        [communities]
    );

    const joinedCount = useMemo(
        () => communities.filter((c) => c.joined).length,
        [communities]
    );

    const filtered = useMemo(() => {
        let list = [...communities];

        if (activeTab === "joined") list = list.filter((c) => c.joined);
        if (activeTab === "trending") list = list.sort((a, b) => b.onlineNow - a.onlineNow);

        if (activeCategory) list = list.filter((c) => c.category === activeCategory);

        if (search.trim()) {
            const q = search.trim().toLowerCase();
            list = list.filter(
                (c) =>
                    c.name.toLowerCase().includes(q) ||
                    c.tags.some((t) => t.toLowerCase().includes(q)) ||
                    c.category.toLowerCase().includes(q)
            );
        }

        return list;
    }, [communities, activeTab, activeCategory, search]);

    const isFilteredLocally = Boolean(search.trim() || activeCategory || activeTab !== "discover");

    const apiMeta = useMemo(() => {
        return extractPaginationMeta(rawCommunitiesData, filtered.length, ITEMS_PER_PAGE, currentPage);
    }, [rawCommunitiesData, filtered.length, currentPage]);

    const totalPages = isFilteredLocally
        ? Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
        : Math.max(1, apiMeta.totalPages || Math.ceil(filtered.length / ITEMS_PER_PAGE));

    const totalItems = isFilteredLocally
        ? filtered.length
        : apiMeta.total || filtered.length;

    const paginatedCommunities = useMemo(() => {
        const rawList = extractCommunityList(rawCommunitiesData);
        if (!isFilteredLocally && rawList.length > 0 && rawList.length <= ITEMS_PER_PAGE && apiMeta.total > ITEMS_PER_PAGE) {
            return filtered.slice(0, ITEMS_PER_PAGE);
        }
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filtered.slice(start, start + ITEMS_PER_PAGE);
    }, [filtered, currentPage, rawCommunitiesData, isFilteredLocally, apiMeta.total]);

    const handleTabChange = (tab: CommunityTabKey) => {
        setActiveTab(tab);
        setCurrentPage(1);
    };

    const handleCategoryChange = (cat: string | null) => {
        setActiveCategory(cat);
        setCurrentPage(1);
    };

    return (
        <div className="w-full flex flex-col gap-6 pb-16 animate-fade-in select-none">
            {showCreateModal && (
                <CreateCommunityModal onClose={() => setShowCreateModal(false)} />
            )}

            {/* 1. Header with Title + Typography-based Stats + Create Action */}
            <CommunityHeader
                communityCount={communities.length}
                totalOnline={totalOnline}
                totalMembers={totalMembers}
                canCreateCommunity={canCreateCommunity}
                onCreateCommunity={() => {
                    if (!isAdmin) {
                        return;
                    }
                    if (!useAuthStore.getState().requireVerifiedEmail("tạo cộng đồng")) return;
                    setShowCreateModal(true);
                }}
            />

            {/* 2. Community Navigator: Search Bar + Tabs + Category Filters */}
            <CommunityNavigator
                search={search}
                onSearchChange={setSearch}
                activeTab={activeTab}
                onTabChange={handleTabChange}
                categories={categories}
                activeCategory={activeCategory}
                onCategoryChange={handleCategoryChange}
                joinedCount={joinedCount}
            />

            {/* 3. Community Directory 3-Column Grid */}
            {isLoading && communities.length === 0 ? (
                <div className="w-full flex flex-col items-center justify-center gap-3 py-20 px-4 bg-surface border border-divider-primary rounded-[6px] text-text-muted text-sm text-center">
                    <FontAwesomeIcon icon={faSpinner} className="text-2xl text-primary animate-spin" />
                    <p className="text-xs font-semibold text-text-muted">Đang tải danh sách cộng đồng...</p>
                </div>
            ) : filtered.length > 0 ? (
                <div className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {paginatedCommunities.map((community) => (
                            <CommunityGameTile key={community.id} community={community} />
                        ))}
                    </div>

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        totalItems={totalItems}
                        itemsPerPage={ITEMS_PER_PAGE}
                    />
                </div>
            ) : (
                <div className="w-full flex flex-col items-center justify-center gap-2.5 py-16 px-4 bg-surface border border-divider-primary rounded-[6px] text-text-muted text-sm text-center">
                    <div className="w-12 h-12 rounded-[4px] bg-surface-hover flex items-center justify-center text-xl text-text-faint mb-1">
                        <FontAwesomeIcon icon={faGamepad} />
                    </div>
                    <p className="font-black text-base text-text uppercase tracking-tight">
                        {t('community.emptyTitle')}
                    </p>
                    <p className="text-text-faint max-w-md text-xs">
                        {t('community.emptyDesc')}
                    </p>
                    <button
                        type="button"
                        onClick={() => {
                            setSearch("");
                            setActiveCategory(null);
                            setActiveTab("discover");
                        }}
                        className="mt-2 px-3.5 py-1.5 rounded-[4px] bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs transition-colors cursor-pointer border border-primary/20"
                    >
                        {t('community.viewAll')}
                    </button>
                </div>
            )}
        </div>
    );
};
