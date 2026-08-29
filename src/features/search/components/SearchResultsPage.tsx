import { useState, useEffect, useTransition } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faMagnifyingGlass,
    faGamepad,
    faUsers,
    faFileLines,
    faUserCheck,
    faUserPlus,
    faXmark,
    faCheck,
    faPlus,
    faChevronRight,
    faFilter,
    faWandMagicSparkles,
    faUser,
    faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "@/shared/hooks/useTranslate";
import { usePostsStore } from "@/features/post";
import { useCommunitiesStore } from "@/features/community";
import { useGameStore } from "@/features/game";
import { fetchSearchResults } from "../api/searchApi";
import { MOCK_USERS } from "../mockUsers";
import { type SearchTabCategory, type SearchResponse, type SearchUser } from "../types";
import { formatCompactNumber } from "@/features/community/constants";
import { Pagination } from "@/shared/components/ui/Pagination";

const POPULAR_TAGS = [
    "#cs2",
    "#fps",
    "#survival",
    "#raft",
    "#esports",
    "#rdr2",
    "#ghostrider",
    "#s1mple",
    "#highlight",
    "#mods",
];

export const SearchResultsPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const searchParams = useSearch({ strict: false }) as {
        q?: string;
        tab?: SearchTabCategory;
        type?: SearchTabCategory;
        page?: number;
        size?: number;
    };

    const initialQuery = searchParams.q || "";
    const activeTab = searchParams.type || searchParams.tab || "all";
    const currentPage = Number(searchParams.page) || 1;
    const pageSize = Number(searchParams.size) || 10;

    const [inputValue, setInputValue] = useState(initialQuery);
    const [, startTransition] = useTransition();

    // Data stores for client fallback context
    const { posts } = usePostsStore();
    const { communities, toggleJoinCommunity } = useCommunitiesStore();
    const { followedSlugs, toggleFollowGame } = useGameStore();

    // Local state for friends management in user search results
    const [usersList, setUsersList] = useState<SearchUser[]>(MOCK_USERS);

    // Response state from API
    const [searchData, setSearchData] = useState<SearchResponse>({
        success: true,
        query: initialQuery,
        type: activeTab,
        pagination: {
            page: currentPage,
            size: pageSize,
            total: 0,
            totalPages: 0,
            hasMore: false,
        },
        data: {
            posts: [],
            users: [],
            communities: [],
            games: [],
        },
        meta: {
            totalPosts: 0,
            totalUsers: 0,
            totalCommunities: 0,
            totalGames: 0,
        },
    });

    const [isLoading, setIsLoading] = useState(false);

    // Sync input value when route search params change
    useEffect(() => {
        if (searchParams.q !== undefined) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setInputValue(searchParams.q);
        }
    }, [searchParams.q]);

    // Fetch search results from /api/search
    useEffect(() => {
        let isMounted = true;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsLoading(true);

        fetchSearchResults(initialQuery, activeTab, currentPage, pageSize, {
            posts,
            communities,
            users: usersList,
        }).then((res) => {
            if (isMounted) {
                setSearchData(res);
                setIsLoading(false);
            }
        });

        return () => {
            isMounted = false;
        };
    }, [initialQuery, activeTab, currentPage, pageSize, posts, communities, usersList]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const clean = inputValue.trim();
        startTransition(() => {
            navigate({
                to: "/search",
                search: { q: clean, type: activeTab, page: 1, size: pageSize },
            });
        });
    };

    const handleTagClick = (tag: string) => {
        const cleanTag = tag.replace("#", "");
        setInputValue(cleanTag);
        startTransition(() => {
            navigate({
                to: "/search",
                search: { q: cleanTag, type: "all", page: 1, size: pageSize },
            });
        });
    };

    const handleTabChange = (type: SearchTabCategory) => {
        startTransition(() => {
            navigate({
                to: "/search",
                search: { q: inputValue, type, page: 1, size: pageSize },
            });
        });
    };

    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > searchData.pagination.totalPages) return;
        startTransition(() => {
            navigate({
                to: "/search",
                search: { q: inputValue, type: activeTab, page: newPage, size: pageSize },
            });
        });
    };

    const handleSizeChange = (newSize: number) => {
        startTransition(() => {
            navigate({
                to: "/search",
                search: { q: inputValue, type: activeTab, page: 1, size: newSize },
            });
        });
    };

    const toggleFriendStatus = (userId: string) => {
        setUsersList((prev) =>
            prev.map((u) => (u.id === userId ? { ...u, isFriend: !u.isFriend } : u))
        );
    };

    const tabsList: {
        key: SearchTabCategory;
        label: string;
        icon: import("@fortawesome/fontawesome-svg-core").IconDefinition;
        count: number;
    }[] = [
        { key: "all", label: t("search.tabAll", { defaultValue: "Tất cả" }), icon: faFilter, count: searchData.pagination.total },
        { key: "games", label: t("search.tabGames", { defaultValue: "Game" }), icon: faGamepad, count: searchData.meta.totalGames },
        { key: "communities", label: t("search.tabCommunities", { defaultValue: "Cộng đồng" }), icon: faUsers, count: searchData.meta.totalCommunities },
        { key: "users", label: t("search.tabUsers", { defaultValue: "Người dùng" }), icon: faUser, count: searchData.meta.totalUsers },
        { key: "posts", label: t("search.tabPosts", { defaultValue: "Bài viết" }), icon: faFileLines, count: searchData.meta.totalPosts },
    ];

    const { posts: resPosts, users: resUsers, communities: resCommunities, games: resGames } = searchData.data;

    return (
        <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto py-4 px-3 sm:px-6">
            {/* Top Search Header - Quiet Dark: No Outer Card/Border */}
            <div className="flex flex-col gap-4 select-none">
                <div className="flex flex-col gap-1">
                    <h1 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#979BA2]">
                        {t("search.headerTitle", { defaultValue: "TÌM KIẾM GAME, CỘNG ĐỒNG, BÀI VIẾT & NGƯỜI DÙNG" })}
                    </h1>
                </div>

                {/* Search Input - Surface #151719, No Border */}
                <form onSubmit={handleSearchSubmit} className="relative w-full">
                    <div className="flex items-center gap-3 w-full bg-[#151719] hover:bg-[#17191C] focus-within:bg-[#191B1E] rounded-2xl px-4 py-3.5 transition-all">
                        <FontAwesomeIcon icon={faMagnifyingGlass} className="text-[#656A72] text-base shrink-0" />
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={t("search.placeholder", { defaultValue: "Tìm kiếm game, cộng đồng, bài viết..." })}
                            className="w-full bg-transparent text-[#ECEDEF] placeholder:text-[#656A72] text-sm sm:text-base font-medium focus:outline-none"
                        />
                        {inputValue && (
                            <button
                                type="button"
                                onClick={() => {
                                    setInputValue("");
                                    startTransition(() => {
                                        navigate({ to: "/search", search: { q: "", type: activeTab, page: 1, size: pageSize } });
                                    });
                                }}
                                className="p-1 rounded-full text-[#656A72] hover:text-[#ECEDEF] transition-colors text-xs cursor-pointer"
                            >
                                <FontAwesomeIcon icon={faXmark} />
                            </button>
                        )}
                        <button
                            type="submit"
                            className="shrink-0 px-5 py-2.5 rounded-xl bg-[#1688E8] hover:bg-[#1688E8]/90 text-white text-xs sm:text-sm font-bold transition-all cursor-pointer"
                        >
                            {t("search.searchBtn", { defaultValue: "Tìm kiếm" })}
                        </button>
                    </div>
                </form>

                {/* Popular Hot Keywords */}
                <div className="flex items-center gap-2 flex-wrap text-xs pt-0.5">
                    <span className="font-bold text-[#656A72] flex items-center gap-1.5 shrink-0">
                        <FontAwesomeIcon icon={faWandMagicSparkles} className="text-amber-400 text-xs" />
                        <span>{t("search.hotKeywords", { defaultValue: "Từ khóa hot:" })}</span>
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {POPULAR_TAGS.map((tag) => (
                            <button
                                key={tag}
                                type="button"
                                onClick={() => handleTagClick(tag)}
                                className="px-3 py-1 rounded-full bg-[#121416] hover:bg-[#191C20] text-[#979BA2] hover:text-[#ECEDEF] text-xs font-semibold transition-colors cursor-pointer"
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Target Category Filter Tabs - Pill Style, No Borders */}
            <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar py-1">
                <div className="flex items-center gap-2 shrink-0">
                    {tabsList.map((tab) => {
                        const isActive = activeTab === tab.key;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => handleTabChange(tab.key)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
                                    isActive
                                        ? "bg-[#1688E8] text-white shadow-md shadow-[#1688E8]/20"
                                        : "bg-[#121416] hover:bg-[#191C20] text-[#979BA2] hover:text-[#ECEDEF]"
                                }`}
                            >
                                <FontAwesomeIcon icon={tab.icon} className={isActive ? "text-white text-xs" : "text-[#656A72] text-xs"} />
                                <span>{tab.label}</span>
                                <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                        isActive ? "bg-white/20 text-white" : "bg-[#17191C] text-[#656A72]"
                                    }`}
                                >
                                    {tab.count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Page Size selector (Only shown on specific category tabs) */}
                {activeTab !== "all" && (
                    <div className="hidden md:flex items-center gap-2 shrink-0 text-xs font-medium text-[#979BA2] bg-[#121416] px-3.5 py-1.5 rounded-full">
                        <span>{t("search.pageSize", { defaultValue: "Hiển thị" })}:</span>
                        <select
                            value={pageSize}
                            onChange={(e) => handleSizeChange(Number(e.target.value))}
                            className="bg-transparent text-[#ECEDEF] font-bold focus:outline-none cursor-pointer"
                        >
                            <option value={5} className="bg-[#111315] text-[#ECEDEF]">5</option>
                            <option value={10} className="bg-[#111315] text-[#ECEDEF]">10</option>
                            <option value={20} className="bg-[#111315] text-[#ECEDEF]">20</option>
                        </select>
                    </div>
                )}
            </div>

            {/* Back Button Header when viewing a specific category tab */}
            {activeTab !== "all" && (
                <div className="flex items-center justify-between pb-3 border-b border-[#1A1C1F]">
                    <div className="flex items-center gap-2">
                        <span className="text-sm sm:text-base font-black text-[#ECEDEF]">
                            {tabsList.find((t) => t.key === activeTab)?.label} · {searchData.pagination.total} {t("common.results", { defaultValue: "kết quả" })}
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={() => handleTabChange("all")}
                        className="text-xs font-bold text-[#1688E8] hover:underline flex items-center gap-1.5 cursor-pointer"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="text-[10px]" />
                        <span>Quay lại tất cả</span>
                    </button>
                </div>
            )}

            {/* Loading Indicator */}
            {isLoading && (
                <div className="flex items-center justify-center p-8 text-[#1688E8] gap-2 font-bold text-sm">
                    <span className="w-4 h-4 rounded-full border-2 border-[#1688E8] border-t-transparent animate-spin" />
                    <span>Đang tìm kiếm...</span>
                </div>
            )}

            {/* Results Section */}
            {!isLoading && (
                !inputValue.trim() ? (
                    <div className="flex flex-col items-center justify-center p-12 bg-[#111315] rounded-2xl text-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-[#1688E8]/10 text-[#1688E8] flex items-center justify-center text-xl font-bold mb-1">
                            <FontAwesomeIcon icon={faMagnifyingGlass} />
                        </div>
                        <h3 className="text-base font-bold text-[#ECEDEF]">Hãy nhập từ khóa để tìm kiếm</h3>
                        <p className="text-xs text-[#979BA2] max-w-md">
                            Bạn có thể tìm kiếm tựa game, cộng đồng thảo luận, bài viết kinh nghiệm hoặc tài khoản người dùng trên hệ thống.
                        </p>
                    </div>
                ) : searchData.pagination.total === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 bg-[#111315] rounded-2xl text-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center text-xl font-bold mb-1">
                            <FontAwesomeIcon icon={faXmark} />
                        </div>
                        <h3 className="text-base font-bold text-[#ECEDEF]">{t("search.noResultsTitle", { defaultValue: "Không tìm thấy kết quả" })}</h3>
                        <p className="text-xs text-[#979BA2] max-w-md">
                            {t("search.noResultsDesc", { defaultValue: "Thử tìm kiếm bằng từ khóa khác hoặc kiểm tra lại lỗi chính tả." })}
                        </p>
                    </div>
                ) : (
                <div className="flex flex-col gap-8">
                    {/* 🎮 GAMES SECTION - Compact Horizontal Rows */}
                    {(activeTab === "all" || activeTab === "games") && resGames.length > 0 && (
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between pb-2 border-b border-[#1A1C1F]">
                                <div className="flex items-center gap-2">
                                    <FontAwesomeIcon icon={faGamepad} className="text-[#1688E8]" />
                                    <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#ECEDEF]">
                                        GAME · {searchData.meta.totalGames}
                                    </h2>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                {resGames.slice(0, activeTab === "all" ? 3 : undefined).map((game) => {
                                    const isFollowed = followedSlugs.includes(game.slug.toLowerCase());
                                    return (
                                        <div
                                            key={game.slug}
                                            onClick={() => navigate({ to: "/game/$gameSlug", params: { gameSlug: game.slug } })}
                                            className="group flex items-center justify-between gap-3 p-3.5 rounded-xl bg-[#111315] hover:bg-[#151719] transition-all cursor-pointer"
                                        >
                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                                <img
                                                    src={game.bannerUrl || game.logoUrl || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=120&auto=format&fit=crop&q=80"}
                                                    alt={game.name}
                                                    className="w-12 h-12 rounded-lg object-cover shrink-0"
                                                />
                                                <div className="flex flex-col min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h3 className="text-sm font-bold text-[#ECEDEF] group-hover:text-[#1688E8] transition-colors truncate">
                                                            {game.name}
                                                        </h3>
                                                        <span className="text-[10px] font-bold text-[#1688E8] uppercase tracking-wider bg-[#1688E8]/10 px-2 py-0.5 rounded">
                                                            {Array.isArray(game.genre) ? game.genre.join(", ") : game.genre || "Game"}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-[#979BA2] mt-0.5 line-clamp-1">
                                                        {game.descriptionVi || game.description}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 shrink-0">
                                                <span className="text-xs font-semibold text-[#656A72] hidden sm:inline">
                                                    ★ {game.ratingScore ?? 5} / 5
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleFollowGame(game.slug);
                                                    }}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                                        isFollowed
                                                            ? "bg-[#17191C] text-[#979BA2]"
                                                            : "bg-[#1688E8]/10 text-[#1688E8] hover:bg-[#1688E8] hover:text-white"
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

                            {/* View All games link (Rule: Only if count > 3 in all mode) */}
                            {activeTab === "all" && searchData.meta.totalGames > 3 && (
                                <div className="flex justify-center pt-1">
                                    <button
                                        type="button"
                                        onClick={() => handleTabChange("games")}
                                        className="text-xs font-bold text-[#1688E8] hover:underline flex items-center gap-1 cursor-pointer"
                                    >
                                        <span>Xem tất cả {searchData.meta.totalGames} game</span>
                                        <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 🌐 COMMUNITIES SECTION - Content Row Format */}
                    {(activeTab === "all" || activeTab === "communities") && resCommunities.length > 0 && (
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between pb-2 border-b border-[#1A1C1F]">
                                <div className="flex items-center gap-2">
                                    <FontAwesomeIcon icon={faUsers} className="text-[#1688E8]" />
                                    <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#ECEDEF]">
                                        CỘNG ĐỒNG · {searchData.meta.totalCommunities}
                                    </h2>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                {resCommunities.slice(0, activeTab === "all" ? 3 : undefined).map((comm) => (
                                    <div
                                        key={comm.id}
                                        onClick={() => navigate({ to: "/community/$communityId", params: { communityId: String(comm.id) } })}
                                        className="group relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#111315] hover:bg-[#151719] transition-all cursor-pointer"
                                    >
                                        <div className="flex items-start gap-3.5 min-w-0 flex-1">
                                            <img
                                                src={comm.logo || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=120&auto=format&fit=crop&q=80"}
                                                alt={comm.name}
                                                className="w-12 h-12 rounded-xl object-cover shrink-0"
                                            />
                                            <div className="flex flex-col min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="text-sm font-bold text-[#ECEDEF] group-hover:text-[#1688E8] transition-colors truncate">
                                                        {comm.name}
                                                    </h3>
                                                    <span className="text-[11px] font-semibold text-[#656A72]">
                                                        · {formatCompactNumber(comm.members)} thành viên
                                                    </span>
                                                </div>
                                                <p className="text-xs text-[#979BA2] mt-0.5 line-clamp-1 leading-relaxed">
                                                    {comm.description || `Cộng đồng thảo luận ${comm.name}`}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#656A72] bg-[#17191C] px-2.5 py-1 rounded-md">
                                                {comm.category}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleJoinCommunity(comm.id);
                                                }}
                                                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                                    comm.joined
                                                        ? "bg-[#17191C] text-[#979BA2] hover:text-[#ECEDEF]"
                                                        : "bg-[#1688E8] text-white hover:bg-[#1688E8]/90"
                                                }`}
                                            >
                                                <FontAwesomeIcon icon={comm.joined ? faCheck : faPlus} className="text-[10px]" />
                                                <span>{comm.joined ? "Đã tham gia" : "+ Tham gia"}</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* View All communities link (Rule: Only if count > 3 in all mode) */}
                            {activeTab === "all" && searchData.meta.totalCommunities > 3 && (
                                <div className="flex justify-center pt-1">
                                    <button
                                        type="button"
                                        onClick={() => handleTabChange("communities")}
                                        className="text-xs font-bold text-[#1688E8] hover:underline flex items-center gap-1 cursor-pointer"
                                    >
                                        <span>Xem tất cả {searchData.meta.totalCommunities} cộng đồng</span>
                                        <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 👤 USERS SECTION - 2-Column Desktop, 1-Column Mobile Layout */}
                    {(activeTab === "all" || activeTab === "users") && resUsers.length > 0 && (
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between pb-2 border-b border-[#1A1C1F]">
                                <div className="flex items-center gap-2">
                                    <FontAwesomeIcon icon={faUser} className="text-[#1688E8]" />
                                    <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#ECEDEF]">
                                        NGƯỜI DÙNG · {searchData.meta.totalUsers}
                                    </h2>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {resUsers.slice(0, activeTab === "all" ? 4 : undefined).map((u) => (
                                    <div
                                        key={u.id}
                                        onClick={() => navigate({ to: "/profile/$userId", params: { userId: u.id || "me" } })}
                                        className="group flex flex-col justify-between p-3.5 rounded-xl bg-[#111315] hover:bg-[#151719] transition-all cursor-pointer"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="relative shrink-0">
                                                    <img
                                                        src={u.avatar}
                                                        alt={u.name}
                                                        className="w-10 h-10 rounded-full object-cover"
                                                    />
                                                    <span
                                                        className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-[#111315] ${
                                                            u.status === "online"
                                                                ? "bg-[#20B77A]"
                                                                : u.status === "in-game"
                                                                ? "bg-amber-500"
                                                                : "bg-gray-500"
                                                        }`}
                                                    />
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <h3 className="text-sm font-bold text-[#ECEDEF] group-hover:text-[#1688E8] transition-colors truncate">
                                                        {u.name}
                                                    </h3>
                                                    <span className="text-xs text-[#656A72] font-mono">
                                                        {u.username}
                                                    </span>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleFriendStatus(u.id);
                                                }}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                                                    u.isFriend
                                                        ? "bg-[#17191C] text-[#20B77A]"
                                                        : "bg-[#1688E8]/10 text-[#1688E8] hover:bg-[#1688E8] hover:text-white"
                                                }`}
                                            >
                                                <FontAwesomeIcon icon={u.isFriend ? faUserCheck : faUserPlus} className="text-[10px]" />
                                                <span>{u.isFriend ? t("search.friend", { defaultValue: "Bạn bè" }) : t("search.addFriend", { defaultValue: "+ Kết bạn" })}</span>
                                            </button>
                                        </div>

                                        {u.bio && (
                                            <p className="text-xs text-[#979BA2] mt-2 line-clamp-1 leading-relaxed">
                                                {u.bio}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* View All users link (Rule: Only if count > 4 in all mode) */}
                            {activeTab === "all" && searchData.meta.totalUsers > 4 && (
                                <div className="flex justify-center pt-1">
                                    <button
                                        type="button"
                                        onClick={() => handleTabChange("users")}
                                        className="text-xs font-bold text-[#1688E8] hover:underline flex items-center gap-1 cursor-pointer"
                                    >
                                        <span>Xem tất cả {searchData.meta.totalUsers} người dùng</span>
                                        <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 📝 POSTS SECTION - Feed Style */}
                    {(activeTab === "all" || activeTab === "posts") && resPosts.length > 0 && (
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between pb-2 border-b border-[#1A1C1F]">
                                <div className="flex items-center gap-2">
                                    <FontAwesomeIcon icon={faFileLines} className="text-[#1688E8]" />
                                    <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#ECEDEF]">
                                        BÀI VIẾT · {searchData.meta.totalPosts}
                                    </h2>
                                </div>
                            </div>

                            <div className="flex flex-col">
                                {resPosts.slice(0, activeTab === "all" ? 3 : undefined).map((post, idx, arr) => {
                                    const authorObj = typeof post.author === "object" && post.author !== null ? post.author : null;
                                    const authorName = authorObj ? (authorObj.name || authorObj.username || "Vô danh") : (typeof post.author === "string" ? post.author : "Vô danh");
                                    const authorAvatar = authorObj ? (authorObj.avatar || authorObj.avatarUrl) : post.authorAvatar;

                                    return (
                                        <div
                                            key={post.id}
                                            onClick={() => navigate({ to: "/post/$postId", params: { postId: String(post.id) } })}
                                            className={`group flex flex-col py-3 px-2 hover:bg-[#121416]/50 transition-all cursor-pointer ${
                                                idx !== arr.length - 1 ? "border-b border-[#1A1C1F]" : ""
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2.5">
                                                    <img
                                                        src={authorAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80"}
                                                        alt={authorName}
                                                        className="w-7 h-7 rounded-full object-cover"
                                                    />
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold text-[#ECEDEF] group-hover:text-[#1688E8] transition-colors">
                                                            {authorName}
                                                        </span>
                                                    {post.communityName && (
                                                        <>
                                                            <span className="text-[#656A72] text-[10px]">·</span>
                                                            <span className="text-[11px] font-semibold text-[#1688E8]">
                                                                {post.communityName}
                                                            </span>
                                                        </>
                                                    )}
                                                    <span className="text-[#656A72] text-[10px]">·</span>
                                                    <span className="text-[10px] text-[#656A72]">
                                                        {post.timestamp}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {post.title && (
                                            <h3 className="text-sm sm:text-base font-bold text-[#ECEDEF] mt-2 group-hover:text-[#1688E8] transition-colors line-clamp-1">
                                                {post.title}
                                            </h3>
                                        )}

                                        <p className="text-xs sm:text-sm text-[#979BA2] mt-1 line-clamp-2 leading-relaxed">
                                            {post.content}
                                        </p>

                                        <div className="flex items-center gap-5 pt-2 mt-1 text-xs text-[#656A72] font-medium">
                                            <span className="flex items-center gap-1 hover:text-rose-400 transition-colors">
                                                ♥ {post.likes}
                                            </span>
                                            <span className="flex items-center gap-1 hover:text-[#1688E8] transition-colors">
                                                💬 {post.commentsCount || 0}
                                            </span>
                                            {post.hashtags && post.hashtags.length > 0 && (
                                                <div className="flex items-center gap-2 ml-auto">
                                                    {post.hashtags.map((h) => (
                                                        <span key={h} className="text-[11px] font-mono text-[#1688E8]">
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

                            {/* View All posts link (Rule: Only if count > 3 in all mode) */}
                            {activeTab === "all" && searchData.meta.totalPosts > 3 && (
                                <div className="flex justify-center pt-1">
                                    <button
                                        type="button"
                                        onClick={() => handleTabChange("posts")}
                                        className="text-xs font-bold text-[#1688E8] hover:underline flex items-center gap-1 cursor-pointer"
                                    >
                                        <span>Xem tất cả {searchData.meta.totalPosts} bài viết</span>
                                        <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Pagination Bar (Only for specific category tabs) */}
                    {activeTab !== "all" && (
                        <Pagination
                            currentPage={searchData.pagination.page}
                            totalPages={searchData.pagination.totalPages}
                            onPageChange={handlePageChange}
                            totalItems={searchData.pagination.total}
                            itemsPerPage={searchData.pagination.size}
                        />
                    )}
                </div>
            ))}
        </div>
    );
};


