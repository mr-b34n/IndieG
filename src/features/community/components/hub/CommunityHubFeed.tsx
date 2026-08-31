import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faComment,
    faBookmark as faBookmarkRegular,
} from "@fortawesome/free-regular-svg-icons";
import {
    faArrowUp,
    faBookmark as faBookmarkSolid,
    faShareNodes,
    faChevronDown,
    faThumbtack,
    faCheck,
    faArrowRight,
    faClock,
    faLocationDot,
} from "@fortawesome/free-solid-svg-icons";

export type PostType = "discussion" | "question" | "guide" | "showcase" | "poll" | "event";

export interface CommunityFeedPost {
    id: string;
    type: PostType;
    title: string;
    content?: string;
    category?: string;
    authorName: string;
    authorHandle: string;
    authorAvatar: string;
    authorRank?: string;
    isPinned?: boolean;
    createdAt: string;
    repliesCount: number;
    viewsCount?: number;
    likesCount: number;
    repostsCount?: number;
    isLiked?: boolean;
    isReposted?: boolean;
    isBookmarked?: boolean;
    images?: string[];
    pollOptions?: { id: string; label: string; votes: number }[];
    userVotedPollId?: string;
    eventDate?: string;
    eventTime?: string;
    eventLocation?: string;
    tags?: string[];
}

interface CommunityHubFeedProps {
    posts: CommunityFeedPost[];
    activeFilter: string;
    onFilterChange: (filter: string) => void;
    sortMode: "hot" | "new" | "unanswered" | "top";
    onSortChange: (mode: "hot" | "new" | "unanswered" | "top") => void;
    onPostClick: (postId: string) => void;
    isVi: boolean;
}

export const CommunityHubFeed = ({
    posts,
    activeFilter,
    onFilterChange,
    sortMode,
    onSortChange,
    onPostClick,
    isVi,
}: CommunityHubFeedProps) => {
    // Dropdown controls states
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const sortRef = useRef<HTMLDivElement>(null);
    const filterRef = useRef<HTMLDivElement>(null);

    // Interactive social states
    const [localLikes, setLocalLikes] = useState<Record<string, { count: number; liked: boolean }>>({});
    const [localBookmarks, setLocalBookmarks] = useState<Record<string, boolean>>({});
    const [localVotes, setLocalVotes] = useState<Record<string, { votedId: string; options: { id: string; label: string; votes: number }[] }>>({});
    const [copiedPostId, setCopiedPostId] = useState<string | null>(null);

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
                setIsSortOpen(false);
            }
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setIsFilterOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filterOptions = [
        { id: "all", labelVi: "Tất cả bài viết", labelEn: "All Posts" },
        { id: "discussion", labelVi: "Thảo luận", labelEn: "Discussions" },
        { id: "question", labelVi: "Hỏi đáp", labelEn: "Questions" },
        { id: "guide", labelVi: "Hướng dẫn", labelEn: "Guides" },
        { id: "showcase", labelVi: "Media & Showcase", labelEn: "Showcases" },
        { id: "poll", labelVi: "Bình chọn", labelEn: "Polls" },
        { id: "event", labelVi: "Sự kiện", labelEn: "Events" },
    ];

    const sortOptions = [
        { id: "hot", labelVi: "Phổ biến", labelEn: "Hot" },
        { id: "new", labelVi: "Mới nhất", labelEn: "New" },
        { id: "top", labelVi: "Hàng đầu", labelEn: "Top" },
        { id: "unanswered", labelVi: "Chưa trả lời", labelEn: "Unanswered" },
    ] as const;

    const currentSortLabel = sortOptions.find((s) => s.id === sortMode);
    const currentFilterLabel = filterOptions.find((f) => f.id === activeFilter);

    // Social actions handlers
    const handleLikeToggle = (e: React.MouseEvent, postId: string, initialLikes: number) => {
        e.stopPropagation();
        setLocalLikes((prev) => {
            const current = prev[postId] || { count: initialLikes, liked: false };
            const liked = !current.liked;
            return {
                ...prev,
                [postId]: {
                    count: liked ? current.count + 1 : Math.max(0, current.count - 1),
                    liked,
                },
            };
        });
    };

    const handleBookmarkToggle = (e: React.MouseEvent, postId: string, initialBookmarked = false) => {
        e.stopPropagation();
        setLocalBookmarks((prev) => ({
            ...prev,
            [postId]: prev[postId] !== undefined ? !prev[postId] : !initialBookmarked,
        }));
    };

    const handleShare = (e: React.MouseEvent, postId: string) => {
        e.stopPropagation();
        const url = `${window.location.origin}/post/${postId}`;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(url);
            setCopiedPostId(postId);
            setTimeout(() => setCopiedPostId(null), 2000);
        }
    };

    const handleVotePoll = (
        e: React.MouseEvent,
        postId: string,
        optionId: string,
        initialOptions: { id: string; label: string; votes: number }[]
    ) => {
        e.stopPropagation();
        setLocalVotes((prev) => {
            const current = prev[postId];
            if (current && current.votedId) return prev;
            const updated = initialOptions.map((opt) =>
                opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
            );
            return {
                ...prev,
                [postId]: { votedId: optionId, options: updated },
            };
        });
    };

    // Minimal type indicator badge/symbol
    const getPostTypeMeta = (type: PostType) => {
        switch (type) {
            case "question":
                return { symbol: "?", label: isVi ? "Hỏi đáp" : "Question" };
            case "guide":
                return { symbol: "▤", label: isVi ? "Hướng dẫn" : "Guide" };
            case "showcase":
                return { symbol: "▧", label: isVi ? "Showcase" : "Showcase" };
            case "poll":
                return { symbol: "◉", label: isVi ? "Bình chọn" : "Poll" };
            case "event":
                return { symbol: "◷", label: isVi ? "Sự kiện" : "Event" };
            default:
                return { symbol: "◌", label: isVi ? "Thảo luận" : "Discussion" };
        }
    };

    return (
        <div className="w-full flex flex-col gap-5 select-none">
            {/* Feed Header: ACTIVITY + Dropdown Controls */}
            <div className="flex items-center justify-between pb-3 border-b border-divider-primary/40">
                <span className="text-xs font-mono font-bold tracking-wider text-text-muted uppercase">
                    ACTIVITY
                </span>

                <div className="flex items-center gap-2 text-xs">
                    {/* Filter Dropdown */}
                    <div ref={filterRef} className="relative">
                        <button
                            type="button"
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-surface-inner/80 hover:bg-surface-hover text-text-muted hover:text-text border border-divider-primary/50 transition-colors cursor-pointer text-xs font-medium"
                        >
                            <span>{isVi ? currentFilterLabel?.labelVi : currentFilterLabel?.labelEn}</span>
                            <FontAwesomeIcon icon={faChevronDown} className="text-[9px] text-text-faint" />
                        </button>

                        {isFilterOpen && (
                            <div className="absolute right-0 top-full mt-1 w-44 py-1 bg-surface border border-divider-primary/80 rounded-[6px] shadow-2xl z-40 animate-fade-in">
                                {filterOptions.map((opt) => (
                                    <button
                                        key={opt.id}
                                        type="button"
                                        onClick={() => {
                                            onFilterChange(opt.id);
                                            setIsFilterOpen(false);
                                        }}
                                        className={`w-full text-left px-3 py-1.5 text-xs transition-colors cursor-pointer flex items-center justify-between ${
                                            activeFilter === opt.id
                                                ? "text-primary font-bold bg-primary/10"
                                                : "text-text-muted hover:text-text hover:bg-surface-hover/60"
                                        }`}
                                    >
                                        <span>{isVi ? opt.labelVi : opt.labelEn}</span>
                                        {activeFilter === opt.id && (
                                            <FontAwesomeIcon icon={faCheck} className="text-[10px] text-primary" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sort Dropdown */}
                    <div ref={sortRef} className="relative">
                        <button
                            type="button"
                            onClick={() => setIsSortOpen(!isSortOpen)}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-surface-inner/80 hover:bg-surface-hover text-text-muted hover:text-text border border-divider-primary/50 transition-colors cursor-pointer text-xs font-medium"
                        >
                            <span>{isVi ? currentSortLabel?.labelVi : currentSortLabel?.labelEn}</span>
                            <FontAwesomeIcon icon={faChevronDown} className="text-[9px] text-text-faint" />
                        </button>

                        {isSortOpen && (
                            <div className="absolute right-0 top-full mt-1 w-36 py-1 bg-surface border border-divider-primary/80 rounded-[6px] shadow-2xl z-40 animate-fade-in">
                                {sortOptions.map((opt) => (
                                    <button
                                        key={opt.id}
                                        type="button"
                                        onClick={() => {
                                            onSortChange(opt.id);
                                            setIsSortOpen(false);
                                        }}
                                        className={`w-full text-left px-3 py-1.5 text-xs transition-colors cursor-pointer flex items-center justify-between ${
                                            sortMode === opt.id
                                                ? "text-primary font-bold bg-primary/10"
                                                : "text-text-muted hover:text-text hover:bg-surface-hover/60"
                                        }`}
                                    >
                                        <span>{isVi ? opt.labelVi : opt.labelEn}</span>
                                        {sortMode === opt.id && (
                                            <FontAwesomeIcon icon={faCheck} className="text-[10px] text-primary" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Posts Stream */}
            {posts.length === 0 ? (
                <div className="py-14 text-center text-xs text-text-muted font-mono bg-surface-inner/30 rounded-[6px] border border-dashed border-divider-primary/50">
                    <p className="font-semibold text-text">{isVi ? "Chưa có hoạt động nào trong mục này." : "No posts found."}</p>
                    <p className="text-[11px] text-text-faint mt-1">
                        {isVi ? "Hãy là người đầu tiên chia sẻ nội dung." : "Be the first to post something."}
                    </p>
                </div>
            ) : (
                <div className="flex flex-col divide-y divide-divider-primary/30">
                    {posts.map((post) => {
                        const likesState = localLikes[post.id] || {
                            count: post.likesCount,
                            liked: post.isLiked ?? false,
                        };
                        const isBookmarked = localBookmarks[post.id] ?? post.isBookmarked ?? false;
                        const pollState = localVotes[post.id] || {
                            votedId: post.userVotedPollId || "",
                            options: post.pollOptions || [],
                        };
                        const totalVotes = pollState.options.reduce((acc, curr) => acc + curr.votes, 0);
                        const typeMeta = getPostTypeMeta(post.type);

                        return (
                            <article
                                key={post.id}
                                onClick={() => onPostClick(post.id)}
                                className={`group py-5 px-1 sm:px-2 transition-all cursor-pointer flex flex-col gap-3 ${
                                    post.isPinned ? "bg-primary/[0.02] -mx-2 px-3 rounded-[6px]" : ""
                                }`}
                            >
                                {/* Pinned Label if any */}
                                {post.isPinned && (
                                    <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-primary">
                                        <FontAwesomeIcon icon={faThumbtack} className="text-[10px]" />
                                        <span>{isVi ? "Ghim" : "Pinned"}</span>
                                    </div>
                                )}

                                {/* Post Header: Author · username · role · type · time */}
                                <div className="flex items-center justify-between gap-3 text-xs">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <img
                                            src={post.authorAvatar}
                                            alt={post.authorName}
                                            className="w-7 h-7 rounded-full object-cover border border-divider-primary/70 shrink-0"
                                        />
                                        <div className="flex items-center gap-1.5 min-w-0 truncate text-xs">
                                            <span className="font-bold text-text truncate group-hover:text-primary transition-colors">
                                                {post.authorName}
                                            </span>
                                            <span className="text-text-faint font-mono text-[11px] hidden sm:inline truncate">
                                                {post.authorHandle}
                                            </span>
                                            {post.authorRank && (
                                                <>
                                                    <span className="text-divider-primary font-normal">·</span>
                                                    <span className="text-text-muted text-[11px] truncate">
                                                        {post.authorRank}
                                                    </span>
                                                </>
                                            )}
                                            <span className="text-divider-primary font-normal">·</span>
                                            <span className="text-text-muted text-[11px] font-mono">
                                                {typeMeta.symbol} {typeMeta.label}
                                            </span>
                                        </div>
                                    </div>

                                    <span className="text-[11px] font-mono text-text-faint shrink-0">
                                        {post.createdAt}
                                    </span>
                                </div>

                                {/* Post Title */}
                                <h2 className="text-base sm:text-lg font-bold text-text group-hover:text-primary transition-colors leading-snug">
                                    {post.title}
                                </h2>

                                {/* Post Content Excerpt */}
                                {post.content && (
                                    <p className="text-xs sm:text-sm text-text-muted leading-relaxed line-clamp-2 max-w-2xl">
                                        {post.content}
                                    </p>
                                )}

                                {/* TYPE SPECIFIC CONTENT PRESENTATION */}

                                {/* 1. Guide Editorial Style ("Read guide →") */}
                                {post.type === "guide" && (
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-primary group-hover:underline pt-0.5">
                                        <span>{isVi ? "Đọc cẩm nang chi tiết" : "Read full guide"}</span>
                                        <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
                                    </div>
                                )}

                                {/* 2. Showcase / Media: Large Visual Immersion */}
                                {post.images && post.images.length > 0 && (
                                    <div className="mt-1 relative rounded-[6px] overflow-hidden border border-divider-primary/50 max-h-96 bg-surface-inner">
                                        <img
                                            src={post.images[0]}
                                            alt={post.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.01]"
                                        />
                                    </div>
                                )}

                                {/* 3. Poll Interactive UI */}
                                {post.type === "poll" && pollState.options.length > 0 && (
                                    <div className="mt-1 flex flex-col gap-2 p-3 bg-surface-inner/60 rounded-[6px] border border-divider-primary/40">
                                        {pollState.options.map((opt) => {
                                            const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                                            const isSelected = pollState.votedId === opt.id;
                                            return (
                                                <button
                                                    key={opt.id}
                                                    type="button"
                                                    onClick={(e) => handleVotePoll(e, post.id, opt.id, pollState.options)}
                                                    className={`relative overflow-hidden w-full text-left p-2.5 rounded-[4px] text-xs font-medium border transition-all cursor-pointer flex items-center justify-between ${
                                                        isSelected
                                                            ? "border-primary bg-primary/10 text-primary font-bold"
                                                            : "border-divider-primary/40 bg-surface/50 hover:border-primary/40 text-text"
                                                    }`}
                                                >
                                                    {pollState.votedId && (
                                                        <div
                                                            className="absolute left-0 top-0 bottom-0 bg-primary/15 transition-all duration-500"
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                    )}
                                                    <span className="relative z-10 flex items-center gap-2 truncate">
                                                        {isSelected && <FontAwesomeIcon icon={faCheck} className="text-primary text-xs" />}
                                                        <span>{opt.label}</span>
                                                    </span>
                                                    <span className="relative z-10 text-[11px] font-mono text-text-muted shrink-0">
                                                        {pollState.votedId ? `${pct}% (${opt.votes})` : `${opt.votes} ${isVi ? "phiếu" : "votes"}`}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                        <div className="text-[11px] font-mono text-text-faint text-right">
                                            {totalVotes} {isVi ? "lượt bình chọn" : "votes"}
                                        </div>
                                    </div>
                                )}

                                {/* 4. Event Date / Time Card */}
                                {post.type === "event" && (
                                    <div className="flex items-center gap-4 text-xs font-mono text-text-muted bg-surface-inner/40 p-2.5 rounded-[6px] border border-divider-primary/40">
                                        <div className="flex items-center gap-1.5 text-primary font-bold">
                                            <FontAwesomeIcon icon={faClock} className="text-[11px]" />
                                            <span>{post.eventTime || "20:00 GMT+7"}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <FontAwesomeIcon icon={faLocationDot} className="text-[11px] text-text-faint" />
                                            <span>{post.eventLocation || "Discord Voice & Custom Lobby"}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Tags (Sparse, 2-3 max) */}
                                {post.tags && post.tags.length > 0 && (
                                    <div className="flex items-center gap-2 pt-0.5">
                                        {post.tags.slice(0, 3).map((tag) => (
                                            <span
                                                key={tag}
                                                className="text-[10px] font-mono text-text-muted hover:text-text"
                                            >
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Social Interactions Row: 💬 Comments   ▲ Upvote   🔖 Bookmark   ↗ Share */}
                                <div className="flex items-center justify-between text-xs text-text-muted pt-2">
                                    <div className="flex items-center gap-6">
                                        {/* Comments */}
                                        <div className="flex items-center gap-1.5 text-text-muted hover:text-text transition-colors">
                                            <FontAwesomeIcon icon={faComment} className="text-xs" />
                                            <span className="font-mono text-xs">{post.repliesCount}</span>
                                        </div>

                                        {/* Upvote */}
                                        <button
                                            type="button"
                                            onClick={(e) => handleLikeToggle(e, post.id, post.likesCount)}
                                            className={`flex items-center gap-1.5 transition-colors cursor-pointer text-xs ${
                                                likesState.liked
                                                    ? "text-primary font-bold"
                                                    : "text-text-muted hover:text-primary"
                                            }`}
                                            title="Upvote"
                                        >
                                            <FontAwesomeIcon
                                                icon={faArrowUp}
                                                className="text-xs"
                                            />
                                            <span className="font-mono text-xs">{likesState.count}</span>
                                        </button>
                                    </div>

                                    {/* Bookmark & Share */}
                                    <div className="flex items-center gap-4">
                                        <button
                                            type="button"
                                            onClick={(e) => handleBookmarkToggle(e, post.id, post.isBookmarked)}
                                            className={`transition-colors cursor-pointer text-xs ${
                                                isBookmarked
                                                    ? "text-primary font-bold"
                                                    : "text-text-faint hover:text-text"
                                            }`}
                                            title="Save"
                                        >
                                            <FontAwesomeIcon
                                                icon={isBookmarked ? faBookmarkSolid : faBookmarkRegular}
                                            />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={(e) => handleShare(e, post.id)}
                                            className={`cursor-pointer transition-colors text-xs flex items-center gap-1 ${
                                                copiedPostId === post.id ? "text-emerald-400 font-bold" : "text-text-faint hover:text-text"
                                            }`}
                                            title="Share link"
                                        >
                                            <FontAwesomeIcon icon={copiedPostId === post.id ? faCheck : faShareNodes} />
                                            {copiedPostId === post.id && (
                                                <span className="text-[10px] font-mono">{isVi ? "Đã chép" : "Copied"}</span>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
