import { useState, useEffect, useRef, useTransition, useCallback } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretUp, faCaretDown } from "@fortawesome/free-solid-svg-icons";
import { faComment } from "@fortawesome/free-regular-svg-icons";
import {
    Check,
    Plus,
    UserCheck,
    UserPlus,
    Clock,
} from "lucide-react";
import { useTranslation } from "@/shared/hooks/useTranslate";
import { useHotkeys } from "@/shared/hooks/useHotkeys";
import { usePostsStore } from "@/features/post";
import { useCommunitiesStore } from "@/features/community";
import { useGameStore } from "@/features/game";
import { useAuthStore } from "@/features/auth";
import { fetchSearchResults } from "../api/searchApi";
import { DEFAULT_GAME_LOGO } from "@/shared/constants/images";
import {
    type SearchTabCategory,
    type SearchResponse,
    type SearchUser,
    normalizeTabCategory,
} from "../types";
import {
    useSendFriendRequestMutation,
    useCancelFriendRequestMutation,
    useUnfriendMutation,
} from "@/shared/api/useQueries";
import { formatCompactNumber } from "@/features/community/constants";
import { Pagination } from "@/shared/components/ui/Pagination";

const PAGE_SIZE = 10;

export const SearchResultsPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const sendFriendRequestMutation = useSendFriendRequestMutation();
    const cancelFriendRequestMutation = useCancelFriendRequestMutation();
    const unfriendMutation = useUnfriendMutation();

    const searchParams = useSearch({ strict: false }) as {
        q?: string;
        tab?: SearchTabCategory;
        type?: SearchTabCategory;
        page?: number;
    };

    const initialQuery = searchParams.q || "";
    const activeTab = normalizeTabCategory(searchParams.type || searchParams.tab || "all");
    const currentPage = Number(searchParams.page) || 1;

    const [, startTransition] = useTransition();

    // Data stores for client fallback context
    const { posts } = usePostsStore();
    const { communities, toggleJoinCommunity } = useCommunitiesStore();
    const { followedSlugs, toggleFollowGame } = useGameStore();
    const requireVerifiedEmail = useAuthStore((state) => state.requireVerifiedEmail);

    // Local state for friends management in user search results
    const [usersList, setUsersList] = useState<SearchUser[]>([]);

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

    // Fetch search results from /api/search
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
                            totalGames:
                                activeTab === "all" || activeTab === "games"
                                    ? res.meta.totalGames
                                    : prev.totalGames || res.meta.totalGames,
                            totalCommunities:
                                activeTab === "all" || activeTab === "communities"
                                    ? res.meta.totalCommunities
                                    : prev.totalCommunities || res.meta.totalCommunities,
                            totalUsers:
                                activeTab === "all" || activeTab === "users"
                                    ? res.meta.totalUsers
                                    : prev.totalUsers || res.meta.totalUsers,
                            totalPosts:
                                activeTab === "all" || activeTab === "posts"
                                    ? res.meta.totalPosts
                                    : prev.totalPosts || res.meta.totalPosts,
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

    const handleTabChange = useCallback(
        (type: SearchTabCategory) => {
            startTransition(() => {
                navigate({
                    to: "/search",
                    search: { q: initialQuery, type, page: 1 },
                });
            });
        },
        [initialQuery, navigate]
    );

    // Quick tab switching: 1 - 5
    useHotkeys(["1"], () => handleTabChange("all"));
    useHotkeys(["2"], () => handleTabChange("games"));
    useHotkeys(["3"], () => handleTabChange("communities"));
    useHotkeys(["4"], () => handleTabChange("users"));
    useHotkeys(["5"], () => handleTabChange("posts"));

    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > searchData.pagination.totalPages) return;
        startTransition(() => {
            navigate({
                to: "/search",
                search: { q: initialQuery, type: activeTab, page: newPage },
            });
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const toggleFriendStatus = (targetUser: SearchUser) => {
        const isFriend = Boolean(targetUser.isFriend);
        const isPending = Boolean(targetUser.isPending);

        const nextIsFriend = false;
        let nextIsPending = false;

        if (isFriend) {
            unfriendMutation.mutate(targetUser.id);
        } else if (isPending) {
            cancelFriendRequestMutation.mutate(targetUser.id);
        } else {
            nextIsPending = true;
            sendFriendRequestMutation.mutate({ addresseeId: targetUser.id });
        }

        setSearchData((prev) => ({
            ...prev,
            data: {
                ...prev.data,
                users: prev.data.users.map((u) =>
                    u.id === targetUser.id ? { ...u, isFriend: nextIsFriend, isPending: nextIsPending } : u
                ),
            },
        }));

        setUsersList((prev) =>
            prev.map((u) => (u.id === targetUser.id ? { ...u, isFriend: nextIsFriend, isPending: nextIsPending } : u))
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
        <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto py-4 sm:py-6 px-3 sm:px-6">
            {/* Segmented Category Filter Tabs - Pure typography, no icon clutter, no border lines */}
            <div className="flex items-center overflow-x-auto scrollbar-none py-0.5">
                <div className="inline-flex items-center p-1 bg-surface-inner/80 rounded-xl gap-1 shrink-0">
                    {tabsList.map((tab) => {
                        const isActive = activeTab === tab.key;
                        return (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => handleTabChange(tab.key)}
                                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 cursor-pointer ${
                                    isActive
                                        ? "bg-surface text-text font-semibold shadow-xs"
                                        : "text-text-muted hover:text-text hover:bg-surface/50"
                                }`}
                            >
                                <span>{tab.label}</span>
                                {tab.count > 0 && (
                                    <span className={`text-[11px] font-mono ${isActive ? "text-text" : "text-text-faint"}`}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Header when viewing a specific category tab */}
            {activeTab !== "all" && initialQuery.trim() && !isLoading && (
                <div className="flex items-center justify-between pb-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                        {tabsList.find((t) => t.key === activeTab)?.label} · {searchData.pagination.total} {t("common.results", { defaultValue: "kết quả" })}
                    </span>
                </div>
            )}

            {/* Loading Indicator - Quiet Skeletons */}
            {isLoading && (
                <div className="flex flex-col gap-6 animate-pulse">
                    <div className="h-3 w-20 bg-surface-inner rounded" />
                    <div className="flex flex-col gap-2">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-14 bg-surface rounded-xl" />
                        ))}
                    </div>
                </div>
            )}

            {/* Results Section */}
            {!isLoading && (
                !initialQuery.trim() ? (
                    <div className="flex flex-col items-center justify-center py-24 px-4 text-center gap-2">
                        <p className="text-sm font-medium text-text">
                            {t("search.emptyPromptTitle", { defaultValue: "Tìm kiếm trên Ludon" })}
                        </p>
                        <p className="text-xs text-text-muted max-w-sm leading-relaxed">
                            {t("search.emptyPromptDesc", {
                                defaultValue: "Sử dụng thanh tìm kiếm phía trên để tìm kiếm game, cộng đồng, bài viết hoặc người dùng.",
                            })}
                        </p>
                    </div>
                ) : searchData.pagination.total === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 px-4 text-center gap-2">
                        <p className="text-sm font-medium text-text">
                            {t("search.noResultsTitle", { defaultValue: "Không tìm thấy kết quả phù hợp" })}
                        </p>
                        <p className="text-xs text-text-muted max-w-sm leading-relaxed">
                            {t("search.noResultsDesc", {
                                defaultValue: "Thử tìm kiếm bằng từ khóa khác hoặc kiểm tra lại lỗi chính tả.",
                            })}
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-10">
                        {/* 🎮 GAMES SECTION */}
                        {(activeTab === "all" || activeTab === "games") && resGames.length > 0 && (
                            <div className="flex flex-col gap-2.5">
                                <div className="flex items-baseline justify-between">
                                    <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                                        {t("search.gamesTitle", { defaultValue: "Game" })}
                                    </h2>
                                    {activeTab === "all" && categoryCounts.totalGames > 5 && (
                                        <button
                                            type="button"
                                            onClick={() => handleTabChange("games")}
                                            className="text-xs text-text-muted hover:text-text transition-colors cursor-pointer"
                                        >
                                            {t("search.viewAllWithCount", {
                                                count: categoryCounts.totalGames,
                                                defaultValue: `Xem tất cả (${categoryCounts.totalGames})`,
                                            })}
                                        </button>
                                    )}
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    {resGames.map((game) => {
                                        const isFollowed = followedSlugs.includes(game.slug);
                                        return (
                                            <div
                                                key={game.id}
                                                onClick={() => navigate({ to: `/game/${game.slug}` })}
                                                className="group flex items-center justify-between p-2.5 rounded-xl bg-surface hover:bg-surface-hover transition-colors cursor-pointer"
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-14 h-9 sm:w-16 sm:h-10 rounded-lg overflow-hidden shrink-0 bg-surface-inner">
                                                        <img
                                                            src={game.coverUrl || game.headerImage}
                                                            alt={game.name}
                                                            referrerPolicy="no-referrer"
                                                            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-200"
                                                            loading="lazy"
                                                            onError={(e) => {
                                                                e.currentTarget.onerror = null;
                                                                e.currentTarget.src = DEFAULT_GAME_LOGO;
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <h3 className="text-xs sm:text-sm font-semibold text-text truncate">
                                                            {game.name}
                                                        </h3>
                                                        <div className="flex items-center gap-2 text-[11px] text-text-faint truncate">
                                                            {game.steamRating && <span>{game.steamRating}% tích cực</span>}
                                                            {game.steamRating && <span>·</span>}
                                                            {game.genre && <span>{game.genre}</span>}
                                                            {game.genre && <span>·</span>}
                                                            <span>
                                                                {t("search.followers", {
                                                                    count: formatCompactNumber(game.followersCount),
                                                                    defaultValue: `${formatCompactNumber(game.followersCount)} theo dõi`,
                                                                })}
                                                            </span>
                                                            {game.developer && (
                                                                <>
                                                                    <span className="hidden sm:inline">·</span>
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
                                                    className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                                                        isFollowed
                                                            ? "bg-surface-inner text-text-muted hover:text-rose-400"
                                                            : "bg-surface-inner hover:bg-surface-hover text-text"
                                                    }`}
                                                >
                                                    {isFollowed ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                                                    <span className="hidden sm:inline">
                                                        {isFollowed ? t("game.followed", { defaultValue: "Đã theo dõi" }) : t("game.follow", { defaultValue: "Theo dõi" })}
                                                    </span>
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* 👥 COMMUNITIES SECTION */}
                        {(activeTab === "all" || activeTab === "communities") && resCommunities.length > 0 && (
                            <div className="flex flex-col gap-2.5">
                                <div className="flex items-baseline justify-between">
                                    <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                                        {t("search.communitiesTitle", { defaultValue: "Cộng đồng" })}
                                    </h2>
                                    {activeTab === "all" && categoryCounts.totalCommunities > 4 && (
                                        <button
                                            type="button"
                                            onClick={() => handleTabChange("communities")}
                                            className="text-xs text-text-muted hover:text-text transition-colors cursor-pointer"
                                        >
                                            {t("search.viewAllWithCount", {
                                                count: categoryCounts.totalCommunities,
                                                defaultValue: `Xem tất cả (${categoryCounts.totalCommunities})`,
                                            })}
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {resCommunities.map((comm) => (
                                        <div
                                            key={comm.id}
                                            onClick={() => navigate({ to: "/community/$communityId", params: { communityId: String(comm.id) } })}
                                            className="group flex items-center justify-between p-3 rounded-xl bg-surface hover:bg-surface-hover transition-colors cursor-pointer"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-surface-inner">
                                                    <img
                                                        src={comm.avatarUrl || comm.logo || comm.backdrop || comm.bannerUrl}
                                                        alt={comm.name}
                                                        referrerPolicy="no-referrer"
                                                        className="w-full h-full object-cover group-hover:scale-102 transition-transform"
                                                        loading="lazy"
                                                        onError={(e) => {
                                                            const fallback = comm.backdrop || comm.bannerUrl;
                                                            if (fallback && e.currentTarget.src !== fallback) {
                                                                e.currentTarget.src = fallback;
                                                            }
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <h3 className="text-xs sm:text-sm font-semibold text-text truncate">
                                                        {comm.name}
                                                    </h3>
                                                    <div className="flex items-center gap-1.5 text-[11px] text-text-faint truncate">
                                                        <span>
                                                            {t("search.members", {
                                                                count: formatCompactNumber(comm.membersCount),
                                                                defaultValue: `${formatCompactNumber(comm.membersCount)} thành viên`,
                                                            })}
                                                        </span>
                                                        {comm.gameCategory && <span>·</span>}
                                                        {comm.gameCategory && <span>{comm.gameCategory}</span>}
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (!requireVerifiedEmail("tham gia cộng đồng")) return;
                                                    toggleJoinCommunity(comm.id);
                                                }}
                                                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                                                    comm.isJoined
                                                        ? "bg-surface-inner text-text-muted hover:text-rose-400"
                                                        : "bg-surface-inner hover:bg-surface-hover text-text"
                                                }`}
                                            >
                                                {comm.isJoined ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                                                <span className="hidden sm:inline">
                                                    {comm.isJoined ? t("community.joinedButton", { defaultValue: "Đã tham gia" }) : t("community.join", { defaultValue: "Tham gia" })}
                                                </span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 👤 USERS SECTION */}
                        {(activeTab === "all" || activeTab === "users") && resUsers.length > 0 && (
                            <div className="flex flex-col gap-2.5">
                                <div className="flex items-baseline justify-between">
                                    <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                                        {t("search.usersTitle", { defaultValue: "Người dùng" })}
                                    </h2>
                                    {activeTab === "all" && categoryCounts.totalUsers > 4 && (
                                        <button
                                            type="button"
                                            onClick={() => handleTabChange("users")}
                                            className="text-xs text-text-muted hover:text-text transition-colors cursor-pointer"
                                        >
                                            {t("search.viewAllWithCount", {
                                                count: categoryCounts.totalUsers,
                                                defaultValue: `Xem tất cả (${categoryCounts.totalUsers})`,
                                            })}
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {resUsers.map((user) => {
                                        const profileParam = user.username ? user.username.replace(/^@/, '') : user.id;
                                        return (
                                            <div
                                                key={user.id}
                                                onClick={() => navigate({ to: "/profile/$userId", params: { userId: profileParam } })}
                                                className="group flex items-center justify-between p-3 rounded-xl bg-surface hover:bg-surface-hover transition-colors cursor-pointer"
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 bg-surface-inner">
                                                        <img
                                                            src={user.avatarUrl || user.avatar}
                                                            alt={user.name}
                                                            referrerPolicy="no-referrer"
                                                            className="w-full h-full object-cover"
                                                            loading="lazy"
                                                        />
                                                        {user.isOnline && (
                                                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-surface" />
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <div className="flex items-center gap-1.5">
                                                            <h3 className="text-xs sm:text-sm font-semibold text-text truncate">
                                                                {user.name}
                                                            </h3>
                                                            {user.badge && (
                                                                <span className="px-1.5 py-0.2 rounded text-[10px] text-text-faint bg-surface-inner">
                                                                    {user.badge}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-[11px] text-text-faint truncate">
                                                            <span>{user.username}</span>
                                                            {user.favoriteGame && (
                                                                <>
                                                                    <span>·</span>
                                                                    <span className="truncate">{user.favoriteGame}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleFriendStatus(user);
                                                    }}
                                                    className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                                                        user.isFriend
                                                            ? "bg-surface-inner text-text-muted hover:text-rose-400"
                                                            : user.isPending
                                                            ? "bg-surface-inner text-amber-400/90"
                                                            : "bg-surface-inner hover:bg-surface-hover text-text"
                                                    }`}
                                                >
                                                    {user.isFriend ? (
                                                        <UserCheck className="w-3 h-3" />
                                                    ) : user.isPending ? (
                                                        <Clock className="w-3 h-3" />
                                                    ) : (
                                                        <UserPlus className="w-3 h-3" />
                                                    )}
                                                    <span className="hidden sm:inline">
                                                        {user.isFriend
                                                            ? t("search.friend", { defaultValue: "Bạn bè" })
                                                            : user.isPending
                                                            ? t("search.pendingRequest", { defaultValue: "Đã gửi" })
                                                            : t("search.addFriend", { defaultValue: "Kết bạn" })}
                                                    </span>
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* 📝 POSTS SECTION */}
                        {(activeTab === "all" || activeTab === "posts") && resPosts.length > 0 && (
                            <div className="flex flex-col gap-2.5">
                                <div className="flex items-baseline justify-between">
                                    <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                                        {t("search.postsTitle", { defaultValue: "Bài viết" })}
                                    </h2>
                                    {activeTab === "all" && categoryCounts.totalPosts > 3 && (
                                        <button
                                            type="button"
                                            onClick={() => handleTabChange("posts")}
                                            className="text-xs text-text-muted hover:text-text transition-colors cursor-pointer"
                                        >
                                            {t("search.viewAllWithCount", {
                                                count: categoryCounts.totalPosts,
                                                defaultValue: `Xem tất cả (${categoryCounts.totalPosts})`,
                                            })}
                                        </button>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2">
                                    {resPosts.map((post) => {
                                        const authorName = typeof post.author === 'string' ? post.author : (post.author?.name || 'Vô danh');
                                        const authorAvatar = typeof post.author === 'object' ? (post.author?.avatarUrl || post.author?.avatar) : post.authorAvatar;
                                        const score = (post.upvotes ?? post.likes ?? 0) - (post.downvotes ?? 0);
                                        const commentsCount = post.commentsCount ?? post.comments ?? 0;

                                        return (
                                            <div
                                                key={post.id}
                                                onClick={() => navigate({ to: `/post/${post.id}` })}
                                                className="group flex flex-col p-4 rounded-xl bg-surface hover:bg-surface-hover transition-colors cursor-pointer gap-2"
                                            >
                                                <div className="flex items-center justify-between text-xs">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full overflow-hidden bg-surface-inner shrink-0">
                                                            <img
                                                                src={authorAvatar}
                                                                alt={authorName}
                                                                referrerPolicy="no-referrer"
                                                                className="w-full h-full object-cover"
                                                                loading="lazy"
                                                            />
                                                        </div>
                                                        <span className="font-semibold text-text truncate">
                                                            {authorName}
                                                        </span>
                                                        {post.community && (
                                                            <>
                                                                <span className="text-text-faint">{t("search.inCommunity", { defaultValue: "trong" })}</span>
                                                                <span className="text-text-muted truncate">
                                                                    {post.community.name}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                    <span className="text-[11px] text-text-faint">{post.createdAt || post.timeAgo}</span>
                                                </div>

                                                {post.title && (
                                                    <h3 className="text-sm font-semibold text-text line-clamp-1">
                                                        {post.title}
                                                    </h3>
                                                )}

                                                <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                                                    {post.content}
                                                </p>

                                                <div className="flex items-center justify-between text-xs text-text-faint pt-1">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-inner text-text-muted">
                                                            <FontAwesomeIcon icon={faCaretUp} className="text-xs" />
                                                            <span className="text-[11px] font-semibold text-text min-w-[1rem] text-center">
                                                                {score}
                                                            </span>
                                                            <FontAwesomeIcon icon={faCaretDown} className="text-xs" />
                                                        </div>
                                                        <span className="flex items-center gap-1.5 text-text-muted">
                                                            <FontAwesomeIcon icon={faComment} className="text-xs" />
                                                            <span>{commentsCount}</span>
                                                        </span>
                                                    </div>

                                                    {post.hashtags && post.hashtags.length > 0 && (
                                                        <div className="flex items-center gap-2">
                                                            {post.hashtags.slice(0, 3).map((h) => (
                                                                <span key={h} className="text-[11px] font-mono text-text-faint">
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
                )
            )}
        </div>
    );
};
