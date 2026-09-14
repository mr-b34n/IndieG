import { useState, useEffect, useRef, useTransition } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faMagnifyingGlass,
    faUserCheck,
    faUserPlus,
    faXmark,
    faCheck,
    faPlus,
    faChevronRight,
    faArrowLeft,
    faArrowUp,
    faArrowDown,
    faComment,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "@/shared/hooks/useTranslate";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { usePostsStore } from "@/features/post";
import { useCommunitiesStore } from "@/features/community";
import { useGameStore } from "@/features/game";
import { fetchSearchResults } from "../api/searchApi";
import { MOCK_USERS } from "../mockUsers";
import { type SearchTabCategory, type SearchResponse, type SearchUser, normalizeTabCategory } from "../types";
import { formatCompactNumber } from "@/features/community/constants";
import { Pagination } from "@/shared/components/ui/Pagination";

const PAGE_SIZE = 10;

export const SearchResultsPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const searchParams = useSearch({ strict: false }) as {
        q?: string;
        tab?: SearchTabCategory;
        type?: SearchTabCategory;
        page?: number;
    };

    const initialQuery = searchParams.q || "";
    const activeTab = normalizeTabCategory(searchParams.type || searchParams.tab || "all");
    const currentPage = Number(searchParams.page) || 1;

    const [inputValue, setInputValue] = useState(initialQuery);
    const [, startTransition] = useTransition();

    // Data stores for client fallback context
    const { posts } = usePostsStore();
    const { communities, toggleJoinCommunity } = useCommunitiesStore();
    const { followedSlugs, toggleFollowGame } = useGameStore();

    // Local state for friends management in user search results
    const [usersList, setUsersList] = useState<SearchUser[]>(MOCK_USERS);

    // Keep client context in ref to avoid re-triggering search effect on background store changes
    const clientContextRef = useRef({ posts, communities, users: usersList });
    useEffect(() => {
        clientContextRef.current = { posts, communities, users: usersList };
    }, [posts, communities, usersList]);

    // Response state from API
    const [searchData, setSearchData] = useState<SearchResponse>({
        success: true,
        query: initialQuery,
        type: activeTab,
        pagination: {
            page: currentPage,
            size: PAGE_SIZE,
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

    // Persistent category counts across tab switches for current query
    const [categoryCounts, setCategoryCounts] = useState({
        totalPosts: 0,
        totalUsers: 0,
        totalCommunities: 0,
        totalGames: 0,
    });
    const lastQueryForCountsRef = useRef(initialQuery.trim());

    const [isLoading, setIsLoading] = useState(false);

    const lastNavigatedQRef = useRef(searchParams.q || "");
    const isInitialMountRef = useRef(true);
    const debouncedInputValue = useDebounce(inputValue, 1000);

    // Sync input value when route search params change from external navigation (e.g. browser back/forward or top search)
    useEffect(() => {
        const urlQ = searchParams.q || "";
        if (urlQ !== lastNavigatedQRef.current) {
            lastNavigatedQRef.current = urlQ;
            setInputValue(urlQ);
        }
    }, [searchParams.q]);

    // Automatically update search route when debouncedInputValue changes
    useEffect(() => {
        if (isInitialMountRef.current) {
            isInitialMountRef.current = false;
            return;
        }
        const cleanDebounced = debouncedInputValue.trim();
        const currentUrlQ = (searchParams.q || "").trim();
        if (cleanDebounced !== currentUrlQ) {
            lastNavigatedQRef.current = cleanDebounced;
            startTransition(() => {
                navigate({
                    to: "/search",
                    search: { q: cleanDebounced, type: activeTab, page: 1 },
                });
            });
        }
    }, [debouncedInputValue, searchParams.q, activeTab, navigate]);

    // Fetch search results from /api/search (Single execution per query/tab/page)
    useEffect(() => {
        const cleanQuery = initialQuery.trim();
        let isMounted = true;

        if (!cleanQuery) {
            Promise.resolve().then(() => {
                if (isMounted) setIsLoading(false);
            });
            return () => {
                isMounted = false;
            };
        }

        Promise.resolve().then(() => {
            if (isMounted) setIsLoading(true);
        });

        fetchSearchResults(cleanQuery, activeTab, currentPage, PAGE_SIZE, clientContextRef.current)
            .then((res) => {
                if (isMounted) {
                    setSearchData(res);
                    setIsLoading(false);

                    // Update and persist category counts across tab transitions
                    setCategoryCounts((prev) => {
                        if (cleanQuery !== lastQueryForCountsRef.current) {
                            lastQueryForCountsRef.current = cleanQuery;
                            return {
                                totalGames: res.meta.totalGames,
                                totalCommunities: res.meta.totalCommunities,
                                totalUsers: res.meta.totalUsers,
                                totalPosts: res.meta.totalPosts,
                            };
                        }
                        return {
                            totalGames: activeTab === "all" || activeTab === "games" ? res.meta.totalGames : (prev.totalGames || res.meta.totalGames),
                            totalCommunities: activeTab === "all" || activeTab === "communities" ? res.meta.totalCommunities : (prev.totalCommunities || res.meta.totalCommunities),
                            totalUsers: activeTab === "all" || activeTab === "users" ? res.meta.totalUsers : (prev.totalUsers || res.meta.totalUsers),
                            totalPosts: activeTab === "all" || activeTab === "posts" ? res.meta.totalPosts : (prev.totalPosts || res.meta.totalPosts),
                        };
                    });
                }
            })
            .catch(() => {
                if (isMounted) {
                    setIsLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [initialQuery, activeTab, currentPage]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const clean = inputValue.trim();
        lastNavigatedQRef.current = clean;
        startTransition(() => {
            navigate({
                to: "/search",
                search: { q: clean, type: activeTab, page: 1 },
            });
        });
    };

    const handleTabChange = (type: SearchTabCategory) => {
        startTransition(() => {
            navigate({
                to: "/search",
                search: { q: inputValue, type, page: 1 },
            });
        });
    };

    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > searchData.pagination.totalPages) return;
        startTransition(() => {
            navigate({
                to: "/search",
                search: { q: inputValue, type: activeTab, page: newPage },
            });
        });
    };

    const toggleFriendStatus = (userId: string) => {
        setUsersList((prev) =>
            prev.map((u) => (u.id === userId ? { ...u, isFriend: !u.isFriend } : u))
        );
    };

    const totalAllCount =
        categoryCounts.totalGames +
        categoryCounts.totalCommunities +
        categoryCounts.totalUsers +
        categoryCounts.totalPosts;

    const tabsList: {
        key: SearchTabCategory;
        label: string;
        count: number;
    }[] = [
        { key: "all", label: t("search.tabAll", { defaultValue: "Tất cả" }), count: totalAllCount || searchData.pagination.total },
        { key: "games", label: t("search.tabGames", { defaultValue: "Game" }), count: categoryCounts.totalGames },
        { key: "communities", label: t("search.tabCommunities", { defaultValue: "Cộng đồng" }), count: categoryCounts.totalCommunities },
        { key: "users", label: t("search.tabUsers", { defaultValue: "Người dùng" }), count: categoryCounts.totalUsers },
        { key: "posts", label: t("search.tabPosts", { defaultValue: "Bài viết" }), count: categoryCounts.totalPosts },
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
                                    lastNavigatedQRef.current = "";
                                    startTransition(() => {
                                        navigate({ to: "/search", search: { q: "", type: activeTab, page: 1 } });
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
            </div>

            {/* Target Category Filter Tabs - Unified Segmented Control */}
            <div className="flex items-center overflow-x-auto no-scrollbar py-1">
                <div className="inline-flex items-center p-1 bg-[#131517] rounded-xl border border-[#1A1C1F]/60 gap-1 shrink-0">
                    {tabsList.map((tab) => {
                        const isActive = activeTab === tab.key;
                        return (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => handleTabChange(tab.key)}
                                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all shrink-0 cursor-pointer ${
                                    isActive
                                        ? "bg-[#1E2126] text-[#ECEDEF] font-semibold shadow-sm"
                                        : "bg-transparent text-[#979BA2] hover:text-[#ECEDEF] hover:bg-[#1A1D22]/50"
                                }`}
                            >
                                <span>{tab.label}</span>
                                {tab.count > 0 && (
                                    <span className={`text-xs ${isActive ? "text-[#979BA2]" : "text-[#656A72]"}`}>
                                        | {tab.count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
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
                        <span>{t("search.backToAll", { defaultValue: "Quay lại tất cả" })}</span>
                    </button>
                </div>
            )}

            {/* Loading Indicator */}
            {isLoading && (
                <div className="flex items-center justify-center p-8 text-[#1688E8] gap-2 font-bold text-sm">
                    <span className="w-4 h-4 rounded-full border-2 border-[#1688E8] border-t-transparent animate-spin" />
                    <span>{t("search.searching", { defaultValue: "Đang tìm kiếm..." })}</span>
                </div>
            )}

            {/* Results Section */}
            {!isLoading && (
                !inputValue.trim() ? (
                    <div className="flex flex-col items-center justify-center p-12 bg-[#111315] rounded-2xl text-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-[#1688E8]/10 text-[#1688E8] flex items-center justify-center text-xl font-bold mb-1">
                            <FontAwesomeIcon icon={faMagnifyingGlass} />
                        </div>
                        <h3 className="text-base font-bold text-[#ECEDEF]">{t("search.emptyPromptTitle", { defaultValue: "Hãy nhập từ khóa để tìm kiếm" })}</h3>
                        <p className="text-xs text-[#979BA2] max-w-md">
                            {t("search.emptyPromptDesc", { defaultValue: "Bạn có thể tìm kiếm tựa game, cộng đồng thảo luận, bài viết kinh nghiệm hoặc tài khoản người dùng trên hệ thống." })}
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
                                <h2 className="text-sm sm:text-base font-bold text-[#ECEDEF]">
                                    {t("search.gamesTitle", { defaultValue: "Game liên quan" })}
                                </h2>
                                {activeTab === "all" && categoryCounts.totalGames > 5 && (
                                    <button
                                        type="button"
                                        onClick={() => handleTabChange("games")}
                                        className="text-xs font-bold text-[#1688E8] hover:underline flex items-center gap-1 cursor-pointer"
                                    >
                                        <span>{t("search.viewAllWithCount", { count: categoryCounts.totalGames, defaultValue: `Xem tất cả (${categoryCounts.totalGames})` })}</span>
                                        <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
                                    </button>
                                )}
                            </div>

                            <div className="flex flex-col gap-2">
                                {resGames.map((game) => {
                                    const isFollowed = followedSlugs.includes(game.slug);
                                    return (
                                        <div
                                            key={game.id}
                                            onClick={() => navigate({ to: `/game/${game.slug}` })}
                                            className="group flex items-center justify-between p-2.5 rounded-xl bg-[#111315] hover:bg-[#151719] transition-all cursor-pointer"
                                        >
                                            <div className="flex items-center gap-3.5 min-w-0">
                                                <div className="w-14 h-9 sm:w-16 sm:h-10 rounded-lg overflow-hidden shrink-0 bg-[#17191C]">
                                                    <img
                                                        src={game.coverUrl || game.headerImage}
                                                        alt={game.name}
                                                        referrerPolicy="no-referrer"
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        loading="lazy"
                                                        onError={(e) => {
                                                            e.currentTarget.onerror = null;
                                                            e.currentTarget.src = "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300&auto=format&fit=crop&q=80";
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="text-xs sm:text-sm font-bold text-[#ECEDEF] group-hover:text-[#1688E8] transition-colors truncate">
                                                            {game.name}
                                                        </h3>
                                                        {game.steamRating && (
                                                            <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#1688E8]/10 text-[#1688E8]">
                                                                ★ {game.steamRating}%
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[11px] text-[#656A72] truncate">
                                                        <span>{game.genre}</span>
                                                        <span>•</span>
                                                        <span>{t("search.followers", { count: formatCompactNumber(game.followersCount), defaultValue: `${formatCompactNumber(game.followersCount)} theo dõi` })}</span>
                                                        {game.developer && (
                                                            <>
                                                                <span className="hidden sm:inline">•</span>
                                                                <span className="hidden sm:inline truncate">{game.developer}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleFollowGame(game.slug);
                                                }}
                                                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                                    isFollowed
                                                        ? "bg-[#17191C] text-[#979BA2] hover:text-rose-400"
                                                        : "bg-[#1688E8] hover:bg-[#1688E8]/90 text-white"
                                                }`}
                                            >
                                                <FontAwesomeIcon icon={isFollowed ? faCheck : faPlus} className="text-[10px]" />
                                                <span className="hidden sm:inline">{isFollowed ? t("game.followed", { defaultValue: "Đã theo dõi" }) : t("game.follow", { defaultValue: "Theo dõi" })}</span>
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* View All games link (Rule: Only if count > 5 in all mode) */}
                            {activeTab === "all" && categoryCounts.totalGames > 5 && (
                                <div className="flex justify-center pt-1">
                                    <button
                                        type="button"
                                        onClick={() => handleTabChange("games")}
                                        className="text-xs font-bold text-[#1688E8] hover:underline flex items-center gap-1 cursor-pointer"
                                    >
                                        <span>{t("search.viewAllGames", { count: categoryCounts.totalGames, defaultValue: `Xem tất cả ${categoryCounts.totalGames} game` })}</span>
                                        <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 👥 COMMUNITIES SECTION - Compact Row Layout */}
                    {(activeTab === "all" || activeTab === "communities") && resCommunities.length > 0 && (
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between pb-2 border-b border-[#1A1C1F]">
                                <h2 className="text-sm sm:text-base font-bold text-[#ECEDEF]">
                                    {t("search.communitiesTitle", { defaultValue: "Cộng đồng" })}
                                </h2>
                                {activeTab === "all" && categoryCounts.totalCommunities > 4 && (
                                    <button
                                        type="button"
                                        onClick={() => handleTabChange("communities")}
                                        className="text-xs font-bold text-[#1688E8] hover:underline flex items-center gap-1 cursor-pointer"
                                    >
                                        <span>{t("search.viewAllWithCount", { count: categoryCounts.totalCommunities, defaultValue: `Xem tất cả (${categoryCounts.totalCommunities})` })}</span>
                                        <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {resCommunities.map((comm) => (
                                    <div
                                        key={comm.id}
                                        onClick={() => navigate({ to: "/community/$communityId", params: { communityId: String(comm.id) } })}
                                        className="group flex items-center justify-between p-3 rounded-xl bg-[#111315] hover:bg-[#151719] transition-all cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-[#17191C]">
                                                <img
                                                    src={comm.avatarUrl || comm.logo}
                                                    alt={comm.name}
                                                    referrerPolicy="no-referrer"
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                    loading="lazy"
                                                />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <h3 className="text-xs sm:text-sm font-bold text-[#ECEDEF] group-hover:text-[#1688E8] transition-colors truncate">
                                                    {comm.name}
                                                </h3>
                                                <div className="flex items-center gap-2 text-[11px] text-[#656A72]">
                                                    <span>{t("search.members", { count: formatCompactNumber(comm.membersCount), defaultValue: `${formatCompactNumber(comm.membersCount)} thành viên` })}</span>
                                                    <span>•</span>
                                                    <span>{comm.gameCategory}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleJoinCommunity(comm.id);
                                            }}
                                            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                                comm.isJoined
                                                    ? "bg-[#17191C] text-[#979BA2] hover:text-rose-400"
                                                    : "bg-[#1688E8] hover:bg-[#1688E8]/90 text-white"
                                            }`}
                                        >
                                            <FontAwesomeIcon icon={comm.isJoined ? faCheck : faPlus} className="text-[10px]" />
                                            <span className="hidden sm:inline">{comm.isJoined ? t("community.joinedButton", { defaultValue: "Đã tham gia" }) : t("community.join", { defaultValue: "Tham gia" })}</span>
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* View All communities link (Rule: Only if count > 4 in all mode) */}
                            {activeTab === "all" && categoryCounts.totalCommunities > 4 && (
                                <div className="flex justify-center pt-1">
                                    <button
                                        type="button"
                                        onClick={() => handleTabChange("communities")}
                                        className="text-xs font-bold text-[#1688E8] hover:underline flex items-center gap-1 cursor-pointer"
                                    >
                                        <span>{t("search.viewAllCommunities", { count: categoryCounts.totalCommunities, defaultValue: `Xem tất cả ${categoryCounts.totalCommunities} cộng đồng` })}</span>
                                        <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 👤 USERS SECTION - Horizontal User Cards */}
                    {(activeTab === "all" || activeTab === "users") && resUsers.length > 0 && (
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between pb-2 border-b border-[#1A1C1F]">
                                <h2 className="text-sm sm:text-base font-bold text-[#ECEDEF]">
                                    {t("search.usersTitle", { defaultValue: "Người dùng" })}
                                </h2>
                                {activeTab === "all" && categoryCounts.totalUsers > 4 && (
                                    <button
                                        type="button"
                                        onClick={() => handleTabChange("users")}
                                        className="text-xs font-bold text-[#1688E8] hover:underline flex items-center gap-1 cursor-pointer"
                                    >
                                        <span>{t("search.viewAllWithCount", { count: categoryCounts.totalUsers, defaultValue: `Xem tất cả (${categoryCounts.totalUsers})` })}</span>
                                        <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {resUsers.map((user) => (
                                    <div
                                        key={user.id}
                                        onClick={() => navigate({ to: `/profile/${user.id}` })}
                                        className="group flex items-center justify-between p-3 rounded-xl bg-[#111315] hover:bg-[#151719] transition-all cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 bg-[#17191C]">
                                                <img
                                                    src={user.avatarUrl || user.avatar}
                                                    alt={user.name}
                                                    referrerPolicy="no-referrer"
                                                    className="w-full h-full object-cover"
                                                    loading="lazy"
                                                />
                                                {user.isOnline && (
                                                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#111315]" />
                                                )}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <h3 className="text-xs sm:text-sm font-bold text-[#ECEDEF] group-hover:text-[#1688E8] transition-colors truncate">
                                                        {user.name}
                                                    </h3>
                                                    {user.badge && (
                                                        <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-[#1688E8]/10 text-[#1688E8]">
                                                            {user.badge}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[11px] text-[#656A72] truncate">
                                                    <span>{user.username}</span>
                                                    {user.favoriteGame && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="text-[#1688E8]/80 truncate">{user.favoriteGame}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleFriendStatus(user.id);
                                            }}
                                            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                                user.isFriend
                                                    ? "bg-[#17191C] text-[#979BA2] hover:text-rose-400"
                                                    : "bg-[#1688E8] hover:bg-[#1688E8]/90 text-white"
                                            }`}
                                        >
                                            <FontAwesomeIcon icon={user.isFriend ? faUserCheck : faUserPlus} className="text-[10px]" />
                                            <span className="hidden sm:inline">{user.isFriend ? t("search.friend", { defaultValue: "Bạn bè" }) : t("search.addFriend", { defaultValue: "Kết bạn" })}</span>
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* View All users link (Rule: Only if count > 4 in all mode) */}
                            {activeTab === "all" && categoryCounts.totalUsers > 4 && (
                                <div className="flex justify-center pt-1">
                                    <button
                                        type="button"
                                        onClick={() => handleTabChange("users")}
                                        className="text-xs font-bold text-[#1688E8] hover:underline flex items-center gap-1 cursor-pointer"
                                    >
                                        <span>{t("search.viewAllUsers", { count: categoryCounts.totalUsers, defaultValue: `Xem tất cả ${categoryCounts.totalUsers} người dùng` })}</span>
                                        <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 📝 POSTS SECTION - Feed-like Cards */}
                    {(activeTab === "all" || activeTab === "posts") && resPosts.length > 0 && (
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between pb-2 border-b border-[#1A1C1F]">
                                <h2 className="text-sm sm:text-base font-bold text-[#ECEDEF]">
                                    {t("search.postsTitle", { defaultValue: "Bài viết" })}
                                </h2>
                                {activeTab === "all" && categoryCounts.totalPosts > 3 && (
                                    <button
                                        type="button"
                                        onClick={() => handleTabChange("posts")}
                                        className="text-xs font-bold text-[#1688E8] hover:underline flex items-center gap-1 cursor-pointer"
                                    >
                                        <span>{t("search.viewAllWithCount", { count: categoryCounts.totalPosts, defaultValue: `Xem tất cả (${categoryCounts.totalPosts})` })}</span>
                                        <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
                                    </button>
                                )}
                            </div>

                            <div className="flex flex-col gap-3">
                                {resPosts.map((post) => {
                                    return (
                                        <div
                                            key={post.id}
                                            onClick={() => navigate({ to: `/post/${post.id}` })}
                                            className="group flex flex-col p-4 rounded-2xl bg-[#111315] hover:bg-[#151719] transition-all cursor-pointer"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-7 h-7 rounded-full overflow-hidden bg-[#17191C]">
                                                        <img
                                                            src={post.author.avatarUrl || post.author.avatar || post.authorAvatar}
                                                            alt={post.author.name}
                                                            referrerPolicy="no-referrer"
                                                            className="w-full h-full object-cover"
                                                            loading="lazy"
                                                        />
                                                    </div>
                                                    <span className="text-xs font-bold text-[#ECEDEF] group-hover:text-[#1688E8] transition-colors">
                                                        {post.author.name}
                                                    </span>
                                                    {post.community && (
                                                        <>
                                                            <span className="text-xs text-[#656A72]">{t("search.inCommunity", { defaultValue: "trong" })}</span>
                                                            <span className="text-xs font-bold text-[#1688E8]">
                                                                {post.community.name}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                                <span className="text-[11px] text-[#656A72]">{post.createdAt}</span>
                                            </div>

                                            {post.title && (
                                                <h3 className="text-sm sm:text-base font-bold text-[#ECEDEF] mt-2 group-hover:text-[#1688E8] transition-colors line-clamp-1">
                                                    {post.title}
                                                </h3>
                                            )}

                                            <p className="text-xs sm:text-sm text-[#979BA2] mt-1 line-clamp-2 leading-relaxed">
                                                {post.content}
                                            </p>

                                            <div className="flex items-center gap-4 pt-2 mt-1 text-xs text-[#656A72] font-medium">
                                                <div className="flex items-center gap-3">
                                                    <span className="flex items-center gap-1.5 hover:text-[#1688E8] transition-colors">
                                                        <FontAwesomeIcon icon={faArrowUp} className="text-[11px]" />
                                                        <span>{post.upvotes ?? post.likes ?? 0}</span>
                                                    </span>
                                                    <span className="flex items-center gap-1.5 hover:text-rose-400 transition-colors">
                                                        <FontAwesomeIcon icon={faArrowDown} className="text-[11px]" />
                                                        <span>{post.downvotes ?? 0}</span>
                                                    </span>
                                                </div>
                                                <span className="flex items-center gap-1.5 hover:text-[#1688E8] transition-colors">
                                                    <FontAwesomeIcon icon={faComment} className="text-[11px]" />
                                                    <span>{post.commentsCount ?? post.comments ?? 0}</span>
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
                            {activeTab === "all" && categoryCounts.totalPosts > 3 && (
                                <div className="flex justify-center pt-1">
                                    <button
                                        type="button"
                                        onClick={() => handleTabChange("posts")}
                                        className="text-xs font-bold text-[#1688E8] hover:underline flex items-center gap-1 cursor-pointer"
                                    >
                                        <span>{t("search.viewAllPosts", { count: categoryCounts.totalPosts, defaultValue: `Xem tất cả ${categoryCounts.totalPosts} bài viết` })}</span>
                                        <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Pagination Bar (Only for specific category tabs) */}
                    {activeTab !== "all" && searchData.pagination.totalPages > 1 && (
                        <Pagination
                            currentPage={searchData.pagination.page}
                            totalPages={searchData.pagination.totalPages}
                            onPageChange={handlePageChange}
                            totalItems={searchData.pagination.total}
                            itemsPerPage={PAGE_SIZE}
                        />
                    )}
                </div>
            ))}
        </div>
    );
};
