import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faMagnifyingGlass,
    faUsers,
    faCircle,
    faFire,
    faLayerGroup,
    faCheck,
    faPlus,
    faXmark,
    faGamepad,
    faArrowRight,
    faFilter,
    faChevronDown,
    faChevronUp,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "@tanstack/react-router";
import { useCommunitiesStore } from "../store/useCommunitiesStore";
import { type CommunityData, type CommunityTabKey } from "../types";
import { TAG_CLASSES, BANNER_GRADIENTS, COMMUNITY_TABS } from "../constants";
import { useTranslation } from "@/shared/hooks/useTranslate";

const CommunityCard = ({ community, index }: { community: CommunityData; index: number }) => {
    const { t } = useTranslation();
    const toggleJoin = useCommunitiesStore((state) => state.toggleJoin);
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate({ to: "/community/$communityId", params: { communityId: community.id.toString() } })}
            className="
                group w-full flex flex-col overflow-hidden
                bg-surface/90 backdrop-blur-md
                border border-border rounded-2xl
                shadow-sm hover:shadow-md dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)]
                hover:border-primary/40
                transition-colors duration-200
                cursor-pointer relative
            "
        >
            {/* Phần Banner Backdrop */}
            <div className={`relative h-36 sm:h-40 overflow-hidden bg-linear-to-br ${BANNER_GRADIENTS[index % BANNER_GRADIENTS.length]}`}>
                {community.backdrop && (
                    <img
                        src={community.backdrop}
                        alt={`${community.name} backdrop`}
                        className="absolute inset-0 w-full h-full object-cover object-top"
                    />
                )}
                
                {/* Lớp gradient tối phủ lên trên để làm nổi bật logo và text (fade từ dưới lên) */}
                <div className="absolute inset-0 bg-linear-to-t from-surface via-surface/70 to-transparent" />

                {/* Badge Category & Featured bên góc phải trên */}
                <div className="absolute z-20 top-3 right-3 flex items-center gap-1.5">
                    {community.featured && (
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-linear-to-r from-amber-500 to-orange-500 text-white shadow-md">
                            <FontAwesomeIcon icon={faFire} />
                            HOT
                        </span>
                    )}
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wide bg-black/60 backdrop-blur-md text-white border border-white/15">
                        {community.category}
                    </span>
                </div>

                {/* Chỉ số Online Live ngay trên banner */}
                <div className="absolute z-20 bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/50 backdrop-blur-sm text-white text-[11px] font-semibold border border-white/10">
                    <span className="w-2 h-2 rounded-full bg-success-500 inline-flex" />
                    <span className="text-success-400 font-bold ml-1">{community.onlineNow}</span>
                    <span className="text-white/80 text-[10px]">online</span>
                </div>
            </div>

            {/* Phần Nội dung */}
            <div className="flex flex-col px-5 pb-5 flex-1 justify-between">
                <div>
                    {/* Hàng chứa Logo và nút Join */}
                    <div className="flex flex-row items-end justify-between mb-3.5">
                        <div className="relative z-10 -mt-10">
                            <img
                                src={community.logo}
                                alt={community.name}
                                className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover border-4 border-surface bg-surface shadow-md ring-1 ring-border/50"
                            />
                        </div>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleJoin(community.id);
                            }}
                            className={`flex flex-row items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-colors duration-150 cursor-pointer ${
                                community.joined
                                    ? "bg-surface-hover text-text hover:bg-like/15 hover:text-like border border-border"
                                    : "bg-primary text-white hover:bg-primary-hover shadow-sm shadow-primary/20"
                            }`}
                        >
                            <FontAwesomeIcon icon={community.joined ? faCheck : faPlus} className="text-[10px]" />
                            {community.joined ? t('community.joinedButton') : t('community.join')}
                        </button>
                    </div>

                    <div className="flex flex-col gap-1 mt-1">
                        <p className="font-extrabold text-lg text-text group-hover:text-primary transition-colors duration-150 line-clamp-1">
                            {community.name}
                        </p>
                    </div>

                    <p className="text-xs sm:text-sm text-text-muted mt-2 leading-relaxed line-clamp-2 min-h-[2.5rem]">
                        {community.description}
                    </p>

                    {community.tags.length > 0 && (
                        <div className="flex flex-row gap-1.5 flex-wrap mt-3.5">
                            {community.tags.map((tag, idx) => (
                                <span
                                    key={tag}
                                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${TAG_CLASSES[idx % TAG_CLASSES.length]}`}
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer số thành viên & lời mời vào xem */}
                <div className="flex flex-row items-center justify-between mt-4 text-xs text-text-muted border-t border-border/60 pt-3.5 font-medium">
                    <span className="flex flex-row items-center gap-1.5" title="Thành viên">
                        <FontAwesomeIcon icon={faUsers} className="text-text-faint" />
                        <strong className="text-text font-bold">{community.members.toLocaleString()}</strong>
                    </span>
                    <span className="text-primary font-bold flex items-center gap-1 group-hover:underline">
                        {t('community.enterCommunity')} <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
                    </span>
                </div>
            </div>
        </div>
    );
};

export const CommunityList = () => {
    const { t } = useTranslation();
    const communities = useCommunitiesStore((state) => state.communities);
    
    const [activeTab, setActiveTab] = useState<CommunityTabKey>("discover");
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [showAllCategories, setShowAllCategories] = useState(false);

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

    return (
        <div className="w-full flex flex-col gap-6 animate-fade-in">
            {/* Hero Header Banner */}
            <div className="relative w-full overflow-hidden bg-linear-to-r from-primary/15 via-accent-500/10 to-brand-500/15 border border-border/80 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-lg">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-wider mb-3">
                            <FontAwesomeIcon icon={faGamepad} />
                            <span>Gaming Squads & Guilds</span>
                        </div>
                        <h1 className="font-extrabold text-2xl sm:text-3xl lg:text-4xl text-text tracking-tight">
                            {t('community.heroTitle')}
                        </h1>
                        <p className="text-sm sm:text-base text-text-muted mt-2 max-w-2xl leading-relaxed">
                            {t('community.communityDesc')}
                        </p>

                        {/* Stats counters */}
                        <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-6 pt-6 border-t border-border/50 text-xs sm:text-sm">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center font-bold">
                                    <FontAwesomeIcon icon={faLayerGroup} />
                                </div>
                                <div>
                                    <p className="font-extrabold text-text text-sm sm:text-base">{communities.length}</p>
                                    <p className="text-text-faint text-xs">{t('community.communitiesLabel')}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-success-500/15 text-success-500 flex items-center justify-center font-bold">
                                    <FontAwesomeIcon icon={faCircle} className="text-xs" />
                                </div>
                                <div>
                                    <p className="font-extrabold text-text text-sm sm:text-base">{totalOnline.toLocaleString()}</p>
                                    <p className="text-text-faint text-xs">{t('community.onlineLabel')}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-accent-500/15 text-accent-500 flex items-center justify-center font-bold">
                                    <FontAwesomeIcon icon={faUsers} />
                                </div>
                                <div>
                                    <p className="font-extrabold text-text text-sm sm:text-base">{totalMembers.toLocaleString()}</p>
                                    <p className="text-text-faint text-xs">{t('community.gamersLabel')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toolbar: Search, Tabs & Filters */}
            <div className="w-full bg-surface/90 backdrop-blur-md border border-border rounded-2xl p-4 shadow-sm flex flex-col gap-4">
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                    {/* Search Input */}
                    <div className="relative flex-1">
                        <FontAwesomeIcon
                            icon={faMagnifyingGlass}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-faint text-sm"
                        />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={t('community.searchPlaceholder')}
                            className="w-full h-11 pl-10 pr-10 bg-surface-hover border border-border rounded-xl text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-text placeholder:text-text-faint"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-faint hover:text-text cursor-pointer w-5 h-5 flex items-center justify-center"
                            >
                                <FontAwesomeIcon icon={faXmark} />
                            </button>
                        )}
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-1 bg-bg p-1 rounded-xl border border-border/60 shrink-0 overflow-x-auto">
                        {COMMUNITY_TABS.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                                    activeTab === tab.key
                                        ? "bg-primary text-white shadow-sm"
                                        : "text-text-muted hover:text-text hover:bg-surface-hover"
                                }`}
                            >
                                <FontAwesomeIcon icon={tab.icon} className="text-xs" />
                                <span>{tab.label}</span>
                                {tab.key === "joined" && (
                                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                                        activeTab === "joined" ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
                                    }`}>
                                        {communities.filter((c) => c.joined).length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Categories Filter Bar */}
                {categories.length > 0 && (
                    <div className="flex flex-col gap-3 pt-3 border-t border-border/60">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-xs font-bold text-text-muted">
                                <FontAwesomeIcon icon={faFilter} className="text-primary" />
                                <span>{t('community.category')}:</span>
                                <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-extrabold border border-primary/20">
                                    {activeCategory ? activeCategory : t('community.allCommunities', { count: communities.length })}
                                </span>
                                {activeCategory && (
                                    <button
                                        type="button"
                                        onClick={() => setActiveCategory(null)}
                                        className="text-[11px] text-text-faint hover:text-rose-500 underline ml-1 cursor-pointer"
                                    >
                                        Xóa bộ lọc
                                    </button>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowAllCategories(!showAllCategories)}
                                className="px-3 py-1.5 rounded-xl bg-surface hover:bg-surface-hover text-text-muted hover:text-text border border-border text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
                            >
                                <span>{showAllCategories ? "Thu gọn" : `Bộ lọc thể loại (${categories.length})`}</span>
                                <FontAwesomeIcon icon={showAllCategories ? faChevronUp : faChevronDown} className="text-[10px]" />
                            </button>
                        </div>

                        {showAllCategories && (
                            <div className="flex flex-wrap items-center gap-2 p-3 bg-surface-hover/50 rounded-2xl border border-border/60 animate-fade-in">
                                <button
                                    onClick={() => setActiveCategory(null)}
                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                        activeCategory === null
                                            ? "bg-primary text-white shadow-sm"
                                            : "bg-surface text-text-muted border border-border hover:text-text hover:border-primary/50"
                                    }`}
                                >
                                    {t('community.allCommunities', { count: communities.length })}
                                </button>
                                {categories.map((cat) => {
                                    const count = communities.filter((c) => c.category === cat).length;
                                    return (
                                        <button
                                            key={cat}
                                            onClick={() => setActiveCategory(cat)}
                                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                                activeCategory === cat
                                                    ? "bg-primary text-white shadow-sm"
                                                    : "bg-surface text-text-muted border border-border hover:text-text hover:border-primary/50"
                                            }`}
                                        >
                                            <span>{cat}</span>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-extrabold ${activeCategory === cat ? "bg-white/20 text-white" : "bg-surface-hover text-text-faint"}`}>
                                                {count}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Grid kết quả */}
            {filtered.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filtered.map((community, idx) => (
                        <CommunityCard key={community.id} community={community} index={idx} />
                    ))}
                </div>
            ) : (
                <div
                    className="
                        w-full flex flex-col items-center justify-center gap-3 py-16 px-4
                        bg-surface/90 backdrop-blur-md border border-border rounded-3xl
                        text-text-muted text-sm text-center
                    "
                >
                    <div className="w-16 h-16 rounded-full bg-surface-hover flex items-center justify-center text-3xl text-text-faint mb-1">
                        <FontAwesomeIcon icon={faGamepad} />
                    </div>
                    <p className="font-extrabold text-lg text-text">{t('community.emptyTitle')}</p>
                    <p className="text-text-faint max-w-md text-xs sm:text-sm">
                        {t('community.emptyDesc')}
                    </p>
                    <button
                        onClick={() => {
                            setSearch("");
                            setActiveCategory(null);
                            setActiveTab("discover");
                        }}
                        className="mt-2 px-4 py-2 rounded-xl bg-primary-soft text-primary font-bold text-xs hover:bg-primary hover:text-white transition-colors cursor-pointer"
                    >
                        {t('community.viewAll')}
                    </button>
                </div>
            )}
        </div>
    );
};
