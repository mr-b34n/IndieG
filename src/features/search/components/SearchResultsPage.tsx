import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faMagnifyingGlass,
    faGamepad,
    faUsers,
    faFileLines,
    faUserGroup,
    faXmark,
    faHashtag,
    faCheck,
    faPlus,
    faChevronRight,
    faFire,
    faFilter,
    faWandMagicSparkles,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "@/shared/hooks/useTranslate";
import { usePostsStore, Post } from "@/features/post";
import { useCommunitiesStore } from "@/features/community";
import { useSquadStore } from "@/features/squad";
import { useGameStore } from "@/features/game";
import { performSearch } from "../helpers/performSearch";
import { type SearchTabCategory } from "../types";
import { formatCompactNumber } from "@/features/community/constants";

const POPULAR_TAGS = [
    "#cs2",
    "#fps",
    "#survival",
    "#raft",
    "#esports",
    "#rdr2",
    "#eldenring",
    "#lfg",
    "#highlight",
    "#mods",
];

export const SearchResultsPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const searchParams = useSearch({ strict: false }) as { q?: string; tab?: SearchTabCategory };

    const initialQuery = searchParams.q || "";
    const [inputValue, setInputValue] = useState(initialQuery);
    const [activeTab, setActiveTab] = useState<SearchTabCategory>(searchParams.tab || "all");

    // Sync input with route query param if URL changes
    useEffect(() => {
        if (searchParams.q !== undefined) {
            setInputValue(searchParams.q);
        }
    }, [searchParams.q]);

    // Data stores
    const { posts } = usePostsStore();
    const { communities, toggleJoinCommunity } = useCommunitiesStore();
    const { squads, joinSquad } = useSquadStore();
    const { followedSlugs, toggleFollowGame } = useGameStore();

    // Perform Search
    const results = useMemo(() => {
        return performSearch(inputValue, posts, communities, squads);
    }, [inputValue, posts, communities, squads]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim()) {
            navigate({
                to: "/search",
                search: { q: inputValue.trim(), tab: activeTab },
            });
        }
    };

    const handleTagClick = (tag: string) => {
        const cleanTag = tag.replace("#", "");
        setInputValue(cleanTag);
        navigate({
            to: "/search",
            search: { q: cleanTag, tab: "all" },
        });
    };

    const handleTabChange = (tab: SearchTabCategory) => {
        setActiveTab(tab);
        navigate({
            to: "/search",
            search: { q: inputValue, tab },
        });
    };

    const tabsList: { key: SearchTabCategory; label: string; icon: any; count: number }[] = [
        { key: "all", label: "Tất cả", icon: faFilter, count: results.totalCount },
        { key: "games", label: "Games", icon: faGamepad, count: results.games.length },
        { key: "communities", label: "Cộng đồng", icon: faUsers, count: results.communities.length },
        { key: "posts", label: "Bài viết", icon: faFileLines, count: results.posts.length },
        { key: "squads", label: "Tổ đội / LFG", icon: faUserGroup, count: results.squads.length },
    ];

    return (
        <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto py-4 px-3 sm:px-6">
            {/* Top Search Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-surface p-5 sm:p-8 shadow-lg border border-border">
                <div className="relative z-10 flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                            <FontAwesomeIcon icon={faMagnifyingGlass} />
                        </span>
                        <h1 className="text-xl sm:text-2xl font-black text-text">
                            Tìm Kiếm Game, Cộng Đồng & Thảo Luận
                        </h1>
                    </div>

                    {/* Search Form */}
                    <form onSubmit={handleSearchSubmit} className="relative w-full">
                        <div className="flex items-center gap-2 w-full bg-surface-hover/80 border border-border rounded-2xl px-4 py-3 shadow-inner focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                            <FontAwesomeIcon icon={faMagnifyingGlass} className="text-text-faint text-base" />
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Nhập tựa game, tên cộng đồng, nội dung bài viết hoặc #hashtag..."
                                className="w-full bg-transparent text-text placeholder:text-text-faint text-sm sm:text-base font-medium focus:outline-none"
                            />
                            {inputValue && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setInputValue("");
                                        navigate({ to: "/search", search: { q: "", tab: activeTab } });
                                    }}
                                    className="p-1 rounded-full text-text-faint hover:text-text hover:bg-surface transition-colors text-xs"
                                >
                                    <FontAwesomeIcon icon={faXmark} />
                                </button>
                            )}
                            <button
                                type="submit"
                                className="shrink-0 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer"
                            >
                                Tìm kiếm
                            </button>
                        </div>
                    </form>

                    {/* Popular Tags */}
                    <div className="flex items-center gap-2 flex-wrap pt-1">
                        <span className="text-xs font-bold text-text-faint flex items-center gap-1 shrink-0">
                            <FontAwesomeIcon icon={faWandMagicSparkles} className="text-amber-400 text-xs" />
                            Từ khóa hot:
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                            {POPULAR_TAGS.map((tag) => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => handleTagClick(tag)}
                                    className="px-2.5 py-1 rounded-full bg-surface-hover hover:bg-primary/10 hover:text-primary text-text-muted text-xs font-semibold transition-all cursor-pointer"
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {tabsList.map((tab) => {
                    const isActive = activeTab === tab.key;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => handleTabChange(tab.key)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
                                isActive
                                    ? "bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]"
                                    : "bg-surface hover:bg-surface-hover text-text-muted hover:text-text border border-border"
                            }`}
                        >
                            <FontAwesomeIcon icon={tab.icon} className={isActive ? "text-white" : "text-text-faint"} />
                            <span>{tab.label}</span>
                            <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                    isActive ? "bg-white/20 text-white" : "bg-surface-hover text-text-faint"
                                }`}
                            >
                                {tab.count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Results Section */}
            {!inputValue.trim() ? (
                /* Empty state when query is blank */
                <div className="flex flex-col items-center justify-center p-12 bg-surface rounded-3xl border border-border text-center gap-3">
                    <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold mb-2">
                        <FontAwesomeIcon icon={faMagnifyingGlass} />
                    </div>
                    <h3 className="text-lg font-bold text-text">Hãy nhập từ khóa để tìm kiếm</h3>
                    <p className="text-sm text-text-muted max-w-md">
                        Bạn có thể tìm kiếm tựa game yêu thích, cộng đồng thảo luận, bài viết chia sẻ kinh nghiệm hoặc tổ đội tuyển thành viên.
                    </p>
                </div>
            ) : results.totalCount === 0 ? (
                /* Empty state when no match */
                <div className="flex flex-col items-center justify-center p-12 bg-surface rounded-3xl border border-border text-center gap-3">
                    <div className="w-16 h-16 rounded-3xl bg-rose-500/10 text-rose-500 flex items-center justify-center text-2xl font-bold mb-2">
                        <FontAwesomeIcon icon={faXmark} />
                    </div>
                    <h3 className="text-lg font-bold text-text">Không tìm thấy kết quả phù hợp</h3>
                    <p className="text-sm text-text-muted max-w-md">
                        Thử kiểm tra lại chính tả hoặc tìm kiếm với từ khóa ngắn hơn như tên game, #tag hoặc tên tác giả.
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-8">
                    {/* 🎮 GAMES SECTION */}
                    {(activeTab === "all" || activeTab === "games") && results.games.length > 0 && (
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <h2 className="text-base sm:text-lg font-bold text-text flex items-center gap-2">
                                    <FontAwesomeIcon icon={faGamepad} className="text-primary" />
                                    <span>Tựa Game ({results.games.length})</span>
                                </h2>
                                {activeTab === "all" && results.games.length > 3 && (
                                    <button
                                        onClick={() => handleTabChange("games")}
                                        className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                                    >
                                        <span>Xem tất cả</span>
                                        <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                                {(activeTab === "all" ? results.games.slice(0, 3) : results.games).map((game) => {
                                    const isFollowed = followedSlugs.includes(game.slug.toLowerCase());
                                    return (
                                        <div
                                            key={game.slug}
                                            onClick={() => navigate({ to: `/game/${game.slug}` })}
                                            className="group flex flex-col justify-between p-3.5 rounded-2xl bg-surface hover:bg-surface-hover border border-border transition-all cursor-pointer shadow-xs hover:shadow-md"
                                        >
                                            <div className="flex gap-3">
                                                <img
                                                    src={game.bannerUrl || game.logoUrl}
                                                    alt={game.name}
                                                    className="w-16 h-20 rounded-xl object-cover shrink-0 group-hover:scale-105 transition-transform"
                                                />
                                                <div className="flex flex-col gap-1 min-w-0">
                                                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                                                        {Array.isArray(game.genre) ? game.genre.join(", ") : (game.genre || "")}
                                                    </span>
                                                    <h3 className="text-sm font-bold text-text group-hover:text-primary transition-colors line-clamp-1">
                                                        {game.name}
                                                    </h3>
                                                    <p className="text-xs text-text-muted line-clamp-2">
                                                        {game.descriptionVi || game.description}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-3 mt-2 border-t border-border/60">
                                                <span className="text-[11px] font-medium text-text-faint">
                                                    ★ {game.ratingScore ?? 5} / 5
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleFollowGame(game.slug);
                                                    }}
                                                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                                        isFollowed
                                                            ? "bg-surface-hover text-text-muted hover:text-text"
                                                            : "bg-primary/10 text-primary hover:bg-primary hover:text-white"
                                                    }`}
                                                >
                                                    <FontAwesomeIcon icon={isFollowed ? faCheck : faPlus} className="text-[10px]" />
                                                    <span>{isFollowed ? "Đã theo dõi" : "Theo dõi"}</span>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* 🌐 COMMUNITIES SECTION */}
                    {(activeTab === "all" || activeTab === "communities") && results.communities.length > 0 && (
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <h2 className="text-base sm:text-lg font-bold text-text flex items-center gap-2">
                                    <FontAwesomeIcon icon={faUsers} className="text-emerald-500" />
                                    <span>Cộng Đồng ({results.communities.length})</span>
                                </h2>
                                {activeTab === "all" && results.communities.length > 3 && (
                                    <button
                                        onClick={() => handleTabChange("communities")}
                                        className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                                    >
                                        <span>Xem tất cả</span>
                                        <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                                {(activeTab === "all" ? results.communities.slice(0, 3) : results.communities).map((comm) => {
                                    return (
                                        <div
                                            key={comm.id}
                                            onClick={() => navigate({ to: `/community/${comm.id}` })}
                                            className="group flex flex-col justify-between p-3.5 rounded-2xl bg-surface hover:bg-surface-hover border border-border transition-all cursor-pointer shadow-xs hover:shadow-md"
                                        >
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={comm.logo}
                                                    alt={comm.name}
                                                    className="w-12 h-12 rounded-2xl object-cover shrink-0 border border-border group-hover:scale-105 transition-transform"
                                                />
                                                <div className="flex flex-col min-w-0">
                                                    <h3 className="text-sm font-bold text-text group-hover:text-primary transition-colors truncate">
                                                        {comm.name}
                                                    </h3>
                                                    <span className="text-[11px] text-text-muted">
                                                        {formatCompactNumber(comm.members)} thành viên
                                                    </span>
                                                </div>
                                            </div>

                                            <p className="text-xs text-text-muted mt-2 line-clamp-2">
                                                {comm.description}
                                            </p>

                                            <div className="flex items-center justify-between pt-3 mt-2 border-t border-border/60">
                                                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                                    {comm.category}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleJoinCommunity(comm.id);
                                                    }}
                                                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                                        comm.joined
                                                            ? "bg-surface-hover text-text-muted hover:text-text"
                                                            : "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white"
                                                    }`}
                                                >
                                                    <FontAwesomeIcon icon={comm.joined ? faCheck : faPlus} className="text-[10px]" />
                                                    <span>{comm.joined ? "Đã tham gia" : "Tham gia"}</span>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* 👥 SQUADS SECTION */}
                    {(activeTab === "all" || activeTab === "squads") && results.squads.length > 0 && (
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <h2 className="text-base sm:text-lg font-bold text-text flex items-center gap-2">
                                    <FontAwesomeIcon icon={faUserGroup} className="text-amber-500" />
                                    <span>Tổ Đội & LFG ({results.squads.length})</span>
                                </h2>
                                {activeTab === "all" && results.squads.length > 3 && (
                                    <button
                                        onClick={() => handleTabChange("squads")}
                                        className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                                    >
                                        <span>Xem tất cả</span>
                                        <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                {(activeTab === "all" ? results.squads.slice(0, 4) : results.squads).map((sq) => {
                                    return (
                                        <div
                                            key={sq.id}
                                            onClick={() => navigate({ to: "/squad" })}
                                            className="group flex flex-col justify-between p-4 rounded-2xl bg-surface hover:bg-surface-hover border border-border transition-all cursor-pointer shadow-xs hover:shadow-md"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={sq.gameLogo}
                                                        alt={sq.game}
                                                        className="w-10 h-10 rounded-xl object-cover shrink-0"
                                                    />
                                                    <div className="flex flex-col min-w-0">
                                                        <h3 className="text-sm font-bold text-text group-hover:text-primary transition-colors line-clamp-1">
                                                            {sq.name}
                                                        </h3>
                                                        <span className="text-xs text-text-muted font-medium">
                                                            {sq.game}
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                                    {sq.currentMembers}/{sq.maxMembers} Người
                                                </span>
                                            </div>

                                            <p className="text-xs text-text-muted mt-2.5 line-clamp-2">
                                                {sq.description}
                                            </p>

                                            <div className="flex items-center justify-between pt-3 mt-3 border-t border-border/60">
                                                <div className="flex items-center gap-1.5">
                                                    {sq.tags?.map((tag) => (
                                                        <span key={tag} className="text-[10px] font-semibold text-text-faint bg-surface-hover px-2 py-0.5 rounded-md">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        joinSquad(sq.id);
                                                    }}
                                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                                        sq.isMySquad
                                                            ? "bg-emerald-500/10 text-emerald-500"
                                                            : "bg-amber-500 hover:bg-amber-600 text-white shadow-xs"
                                                    }`}
                                                >
                                                    {sq.isMySquad ? "Đã tham gia" : "Vào Squad"}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* 📝 POSTS SECTION */}
                    {(activeTab === "all" || activeTab === "posts") && results.posts.length > 0 && (
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <h2 className="text-base sm:text-lg font-bold text-text flex items-center gap-2">
                                    <FontAwesomeIcon icon={faFileLines} className="text-rose-500" />
                                    <span>Bài Viết & Thảo Luận ({results.posts.length})</span>
                                </h2>
                                {activeTab === "all" && results.posts.length > 5 && (
                                    <button
                                        onClick={() => handleTabChange("posts")}
                                        className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                                    >
                                        <span>Xem tất cả</span>
                                        <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
                                    </button>
                                )}
                            </div>

                            <div className="flex flex-col gap-3">
                                {(activeTab === "all" ? results.posts.slice(0, 5) : results.posts).map((post) => {
                                    return (
                                        <div
                                            key={post.id}
                                            onClick={() => navigate({ to: `/post/${post.id}` })}
                                            className="group flex flex-col p-4 rounded-2xl bg-surface hover:bg-surface-hover border border-border transition-all cursor-pointer shadow-xs hover:shadow-md"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2.5">
                                                    <img
                                                        src={post.author.avatar}
                                                        alt={post.author.name}
                                                        className="w-8 h-8 rounded-full object-cover"
                                                    />
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold text-text group-hover:text-primary transition-colors">
                                                            {post.author.name}
                                                        </span>
                                                        <span className="text-[10px] text-text-faint">
                                                            {post.timestamp}
                                                        </span>
                                                    </div>
                                                </div>

                                                {post.communityName && (
                                                    <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                                                        {post.communityName}
                                                    </span>
                                                )}
                                            </div>

                                            {post.title && (
                                                <h3 className="text-sm font-bold text-text mt-2.5 line-clamp-1">
                                                    {post.title}
                                                </h3>
                                            )}

                                            <p className="text-xs text-text-muted mt-1 line-clamp-2 leading-relaxed">
                                                {post.content}
                                            </p>

                                            <div className="flex items-center gap-4 pt-3 mt-2 text-xs text-text-faint font-medium">
                                                <span>❤️ {post.likes} Lượt thích</span>
                                                <span>💬 {post.commentsCount || 0} Bình luận</span>
                                                {post.hashtags && post.hashtags.length > 0 && (
                                                    <div className="flex items-center gap-1.5 ml-auto">
                                                        {post.hashtags.map((h) => (
                                                            <span key={h} className="text-[10px] font-semibold text-primary">
                                                                {h}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
