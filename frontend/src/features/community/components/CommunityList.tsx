import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faMagnifyingGlass,
    faUsers,
    faCircle,
    faCompass,
    faFire,
    faLayerGroup,
    faCheck,
    faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "@tanstack/react-router";
import { useCommunitiesStore, type CommunityData } from "../store/useCommunitiesStore";


const TAG_CLASSES = [
    "bg-tag-1/10 text-tag-1",
    "bg-tag-2/10 text-tag-2",
    "bg-tag-3/10 text-tag-3",
    "bg-tag-4/10 text-tag-4",
    "bg-tag-5/10 text-tag-5",
];

const BANNER_GRADIENTS = [
    "from-brand-500/40 via-brand-400/15 to-transparent",
    "from-accent-500/40 via-accent-400/15 to-transparent",
    "from-success-500/40 via-success-400/15 to-transparent",
    "from-tag-5/40 via-tag-5/15 to-transparent",
];

type TabKey = "discover" | "trending" | "joined";

const TABS: { key: TabKey; label: string; icon: typeof faCompass }[] = [
    { key: "discover", label: "Discover", icon: faCompass },
    { key: "trending", label: "Trending", icon: faFire },
    { key: "joined", label: "Joined", icon: faLayerGroup },
];

const CommunityCard = ({ community, index }: { community: CommunityData; index: number }) => {
    const toggleJoin = useCommunitiesStore((state) => state.toggleJoin);
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate({ to: "/community/$communityId", params: { communityId: community.id.toString() } })}
            className="
                group w-full flex flex-col overflow-hidden
                bg-surface/90 backdrop-blur-md
                border border-border rounded-2xl
                shadow-[0_2px_12px_rgba(0,0,0,0.06)]
                dark:shadow-[0_2px_16px_rgba(0,0,0,0.30)]
                hover:border-primary/30
                transition-all duration-200 ease-out
                cursor-pointer
            "
        >
            {/* Phần Banner Backdrop */}
            <div className={`relative h-36 overflow-hidden bg-gradient-to-br ${BANNER_GRADIENTS[index % BANNER_GRADIENTS.length]}`}>
                {community.backdrop && (
                    <img
                        src={community.backdrop}
                        alt={`${community.name} backdrop`}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                )}

                {community.featured && (
                    <span className="absolute z-20 top-3 right-3 flex flex-row items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-accent-500 text-white shadow-lg">
                        <FontAwesomeIcon icon={faFire} className="text-[10px]" />
                        Featured
                    </span>
                )}
            </div>

            {/* Phần Nội dung */}
            <div className="flex flex-col px-5 pb-5">
                {/* Hàng chứa Logo và nút Join */}
                <div className="flex flex-row items-end justify-between mb-3">
                    {/* 
                Bọc Avatar trong một div riêng biệt có lề âm (-mt-8) 
                để kéo nó lên chính giữa ranh giới banner và nền.
                Sử dụng border-[3px] và rounded-full để viền mượt mà.
            */}
                    <div className="relative z-10 -mt-8">
                        <img
                            src={community.logo}
                            alt={community.name}
                            className="w-16 h-16 rounded-2xl object-cover border-4 border-surface bg-surface shadow-sm"
                        />
                    </div>

                    {/* Nút Join giờ đây nằm hoàn toàn ở div bên dưới, không bị kéo lên theo lề âm */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleJoin(community.id);
                        }}
                        className={`flex flex-row items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-colors duration-150 ${community.joined
                            ? "bg-surface-hover text-text-muted hover:bg-accent-500/10 hover:text-accent-500"
                            : "bg-primary text-white hover:bg-primary-hover shadow-[0_2px_10px_rgba(0,170,255,0.3)]"
                            }`}
                    >
                        <FontAwesomeIcon icon={community.joined ? faCheck : faPlus} className="text-[10px]" />
                        {community.joined ? "Joined" : "Join"}
                    </button>
                </div>

                <div className="flex flex-col gap-0.5 mt-1">
                    <p className="font-extrabold text-[17px] text-text group-hover:text-primary transition-colors">
                        {community.name}
                    </p>
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-text-faint">
                        {community.category}
                    </p>
                </div>

                <p className="text-sm text-text-muted mt-3 leading-relaxed line-clamp-3">
                    {community.description}
                </p>

                <div className="flex flex-row items-center gap-4 mt-4 text-[13px] text-text-faint border-t border-border pt-4">
                    <span className="flex flex-row items-center gap-2">
                        <FontAwesomeIcon icon={faUsers} className="text-[12px]" />
                        {community.members.toLocaleString()} members
                    </span>
                    <span className="flex flex-row items-center gap-2 text-success-500 font-medium">
                        <FontAwesomeIcon icon={faCircle} className="text-[7px]" />
                        {community.onlineNow} online
                    </span>
                </div>

                {community.tags.length > 0 && (
                    <div className="flex flex-row gap-2 flex-wrap mt-4">
                        {community.tags.map((tag, idx) => (
                            <span
                                key={tag}
                                className={`px-2.5 py-1 rounded-full text-[11px] font-medium ${TAG_CLASSES[idx % TAG_CLASSES.length]}`}
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export const CommunityList = () => {
    const communities = useCommunitiesStore((state) => state.communities);
    const [activeTab, setActiveTab] = useState<TabKey>("discover");
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    const categories = useMemo(
        () => Array.from(new Set(communities.map((c) => c.category))),
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
                    c.tags.some((t) => t.toLowerCase().includes(q))
            );
        }

        return list;
    }, [communities, activeTab, activeCategory, search]);

    return (
        <div className="w-full flex flex-col gap-4">

            <div
                className="
                    w-full p-4
                    bg-surface/90 backdrop-blur-md
                    border border-border rounded-2xl
                    shadow-[0_2px_12px_rgba(0,0,0,0.06)]
                    dark:shadow-[0_2px_16px_rgba(0,0,0,0.30)]
                    flex flex-col gap-4
                "
            >
                <div className="flex flex-row items-center justify-between gap-3">
                    <div>
                        <h1 className="font-bold text-xl text-text">Communities</h1>
                        <p className="text-sm text-text-muted mt-0.5">
                            Find your squad and dive into game communities.
                        </p>
                    </div>
                </div>

                <div className="relative w-full">
                    <FontAwesomeIcon
                        icon={faMagnifyingGlass}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-faint text-sm"
                    />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search communities or tags..."
                        className="w-full h-10 pl-10 pr-4 bg-surface-hover border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-text placeholder:text-text-faint"
                    />
                </div>

                <div className="flex flex-row items-center gap-1 border-b border-border -mb-4 overflow-x-auto scrollbar-none">
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex flex-row items-center gap-2 px-3 pb-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.key
                                ? "border-primary text-primary"
                                : "border-transparent text-text-faint hover:text-text"
                                }`}
                        >
                            <FontAwesomeIcon icon={tab.icon} className="text-xs" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {categories.length > 0 && (
                <div className="flex flex-row items-center gap-2 overflow-x-auto scrollbar-none px-0.5">
                    <button
                        onClick={() => setActiveCategory(null)}
                        className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${activeCategory === null
                            ? "bg-primary text-white border-primary"
                            : "bg-surface/80 text-text-muted border-border hover:text-text"
                            }`}
                    >
                        All
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${activeCategory === cat
                                ? "bg-primary text-white border-primary"
                                : "bg-surface/80 text-text-muted border-border hover:text-text"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            )}

            {filtered.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filtered.map((community, idx) => (
                        <CommunityCard key={community.id} community={community} index={idx} />
                    ))}
                </div>
            ) : (
                <div
                    className="
                        w-full flex flex-col items-center justify-center gap-2 p-10
                        bg-surface/90 backdrop-blur-md border border-border rounded-2xl
                        text-text-muted text-sm
                    "
                >
                    <FontAwesomeIcon icon={faUsers} className="text-2xl text-text-faint mb-1" />
                    <p className="font-semibold text-text">No communities found</p>
                    <p className="text-text-faint text-center">Try a different search or category.</p>
                </div>
            )}
        </div>
    );
};