import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faComment,
    faHeart as faHeartRegular,
    faBookmark as faBookmarkRegular,
} from "@fortawesome/free-regular-svg-icons";
import {
    faHeart as faHeartSolid,
    faBookmark as faBookmarkSolid,
    faEye,
    faFire,
    faClock,
    faStar,
    faCircleQuestion,
    faCheck,
    faThumbtack,
    faShareNodes,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "@/shared/hooks/useTranslate";

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
    isVerified?: boolean;
    createdAt: string;
    repliesCount: number;
    viewsCount: number;
    likesCount: number;
    isLiked?: boolean;
    isBookmarked?: boolean;
    images?: string[];
    pollOptions?: { id: string; label: string; votes: number }[];
    userVotedPollId?: string;
    eventDate?: string;
    eventLocation?: string;
    readingTime?: string;
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
    const { t } = useTranslation();
    const [localLikes, setLocalLikes] = useState<Record<string, { count: number; liked: boolean }>>({});
    const [localBookmarks, setLocalBookmarks] = useState<Record<string, boolean>>({});
    const [localVotes, setLocalVotes] = useState<Record<string, { votedId: string; options: { id: string; label: string; votes: number }[] }>>({});

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

    const handleVotePoll = (e: React.MouseEvent, postId: string, optionId: string, initialOptions: { id: string; label: string; votes: number }[]) => {
        e.stopPropagation();
        setLocalVotes((prev) => {
            const current = prev[postId];
            if (current && current.votedId) return prev; // already voted
            const updated = initialOptions.map((opt) =>
                opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
            );
            return {
                ...prev,
                [postId]: { votedId: optionId, options: updated },
            };
        });
    };

    // Filter Chips (Level 3 Content filter)
    const filterChips = [
        { id: "all", labelVi: "Tất cả", labelEn: "All" },
        { id: "question", labelVi: "Hỏi đáp", labelEn: "Questions" },
        { id: "guide", labelVi: "Guides & Tips", labelEn: "Guides" },
        { id: "showcase", labelVi: "Showcase", labelEn: "Showcase" },
        { id: "poll", labelVi: "Bình chọn", labelEn: "Polls" },
        { id: "event", labelVi: "Sự kiện", labelEn: "Events" },
    ];

    // Sorting Modes
    const sortOptions = [
        { id: "hot", labelVi: "Hot", labelEn: "Hot", icon: faFire },
        { id: "new", labelVi: "Mới nhất", labelEn: "New", icon: faClock },
        { id: "top", labelVi: "Top bầu chọn", labelEn: "Top", icon: faStar },
        { id: "unanswered", labelVi: "Chưa trả lời", labelEn: "Unanswered", icon: faCircleQuestion },
    ] as const;

    const getTypeBadgeConfig = (type: PostType) => {
        switch (type) {
            case "question":
                return {
                    label: isVi ? "HỎI ĐÁP" : "QUESTION",
                    bg: "bg-blue-500/10 border-blue-500/30 text-blue-400",
                };
            case "guide":
                return {
                    label: isVi ? "GUIDE" : "GUIDE",
                    bg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
                };
            case "showcase":
                return {
                    label: isVi ? "SHOWCASE" : "SHOWCASE",
                    bg: "bg-purple-500/10 border-purple-500/30 text-purple-400",
                };
            case "poll":
                return {
                    label: isVi ? "BÌNH CHỌN" : "POLL",
                    bg: "bg-amber-500/10 border-amber-500/30 text-amber-400",
                };
            case "event":
                return {
                    label: isVi ? "SỰ KIỆN" : "EVENT",
                    bg: "bg-rose-500/10 border-rose-500/30 text-rose-400",
                };
            default:
                return {
                    label: isVi ? "THẢO LUẬN" : "DISCUSSION",
                    bg: "bg-primary/10 border-primary/30 text-primary",
                };
        }
    };

    return (
        <div className="w-full flex flex-col gap-4 select-none">
            {/* Level 3 Content Filter Bar & Sort Row */}
            <div className="flex flex-col gap-3 border-b border-divider-primary/60 pb-3">
                {/* 1. Category / Post Type Filter Chips */}
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
                    {filterChips.map((chip) => {
                        const isActive = activeFilter === chip.id;
                        return (
                            <button
                                key={chip.id}
                                type="button"
                                onClick={() => onFilterChange(chip.id)}
                                className={`px-3 py-1.5 rounded-[4px] text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                                    isActive
                                        ? "bg-primary text-white shadow-xs"
                                        : "bg-surface/80 hover:bg-surface-hover text-text-muted hover:text-text border border-divider-primary/60"
                                }`}
                            >
                                <span>{isVi ? chip.labelVi : chip.labelEn}</span>
                            </button>
                        );
                    })}
                </div>

                {/* 2. Sorting & Count Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                    <span className="text-xs font-mono font-bold text-text-muted">
                        {posts.length} {posts.length === 1 ? t('community.thread', { defaultValue: 'bài viết' }) : t('community.threads', { defaultValue: 'bài viết' })}
                    </span>

                    <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
                        {sortOptions.map((opt) => {
                            const isActive = sortMode === opt.id;
                            return (
                                <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => onSortChange(opt.id)}
                                    className={`px-2.5 py-1 rounded-[4px] font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                                        isActive
                                            ? "bg-primary/10 text-primary border border-primary/30 font-black"
                                            : "text-text-muted hover:text-text hover:bg-surface-hover/60 border border-transparent"
                                    }`}
                                >
                                    <FontAwesomeIcon icon={opt.icon} className="text-[10px]" />
                                    <span>{isVi ? opt.labelVi : opt.labelEn}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Posts Feed List */}
            {posts.length === 0 ? (
                <div className="py-16 text-center text-xs text-text-muted font-mono bg-surface/30 rounded-[4px] border border-dashed border-divider-primary/60">
                    <p className="font-bold text-text">{isVi ? "Chưa có bài viết nào trong mục này." : "No posts found in this feed."}</p>
                    <p className="text-[11px] text-text-faint mt-1">{isVi ? "Hãy là người đầu tiên bắt đầu cuộc trò chuyện!" : "Be the first to start a discussion!"}</p>
                </div>
            ) : (
                <div className="flex flex-col divide-y divide-divider-primary/40">
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
                        const badgeConfig = getTypeBadgeConfig(post.type);

                        return (
                            <article
                                key={post.id}
                                onClick={() => onPostClick(post.id)}
                                className={`group py-4 px-3 sm:px-4 rounded-[4px] transition-all cursor-pointer flex flex-col gap-2.5 ${
                                    post.isPinned
                                        ? "bg-primary/[0.03] border-l-2 border-primary hover:bg-primary/[0.06]"
                                        : "hover:bg-surface-hover/40"
                                }`}
                            >
                                {/* Pinned Banner */}
                                {post.isPinned && (
                                    <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-primary">
                                        <FontAwesomeIcon icon={faThumbtack} className="text-[10px]" />
                                        <span>{isVi ? "Ghim bài viết" : "Pinned by Moderators"}</span>
                                    </div>
                                )}

                                {/* Author Header & Type Badge */}
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <img
                                            src={post.authorAvatar}
                                            alt={post.authorName}
                                            className="w-8 h-8 rounded-full object-cover border border-divider-primary shrink-0"
                                        />
                                        <div className="flex items-center gap-2 min-w-0 truncate">
                                            <span className="font-bold text-xs text-text hover:underline truncate">
                                                {post.authorName}
                                            </span>
                                            <span className="text-[11px] text-text-muted font-mono hidden sm:inline">
                                                {post.authorHandle}
                                            </span>
                                            {post.authorRank && (
                                                <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded-[3px] bg-surface-inner text-text-muted border border-divider-primary/50 shrink-0">
                                                    {post.authorRank}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-[3px] border uppercase ${badgeConfig.bg}`}>
                                            {badgeConfig.label}
                                        </span>
                                        <span className="text-[11px] font-mono text-text-faint">
                                            {post.createdAt}
                                        </span>
                                    </div>
                                </div>

                                {/* Post Title & Content Preview */}
                                <div className="flex flex-col gap-1.5">
                                    <h2 className="font-extrabold text-sm sm:text-base text-text group-hover:text-primary transition-colors leading-snug">
                                        {post.title}
                                    </h2>

                                    {post.content && (
                                        <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                                            {post.content}
                                        </p>
                                    )}

                                    {/* Media Screenshot Preview if any */}
                                    {post.images && post.images.length > 0 && (
                                        <div className="mt-1 relative rounded-[4px] overflow-hidden border border-divider-primary/60 max-h-72 bg-surface-inner">
                                            <img
                                                src={post.images[0]}
                                                alt={post.title}
                                                className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-300"
                                            />
                                        </div>
                                    )}

                                    {/* Poll Interactive UI if post is a Poll */}
                                    {post.type === "poll" && pollState.options.length > 0 && (
                                        <div className="mt-2 flex flex-col gap-2 p-3 bg-surface/70 rounded-[4px] border border-divider-primary/60">
                                            {pollState.options.map((opt) => {
                                                const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                                                const isSelected = pollState.votedId === opt.id;
                                                return (
                                                    <button
                                                        key={opt.id}
                                                        type="button"
                                                        onClick={(e) => handleVotePoll(e, post.id, opt.id, pollState.options)}
                                                        className={`relative overflow-hidden w-full text-left p-2.5 rounded-[4px] text-xs font-semibold border transition-all cursor-pointer flex items-center justify-between ${
                                                            isSelected
                                                                ? "border-primary bg-primary/10 text-primary font-bold"
                                                                : "border-divider-primary/60 bg-surface-inner hover:border-primary/40 text-text"
                                                        }`}
                                                    >
                                                        {/* Progress bar fill */}
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
                                            <div className="text-[10px] font-mono text-text-faint text-right">
                                                {totalVotes} {isVi ? "tổng số phiếu" : "total votes"}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Engagement & Interaction Bar */}
                                <div className="flex items-center justify-between text-xs text-text-muted pt-1">
                                    <div className="flex items-center gap-4">
                                        <button
                                            type="button"
                                            onClick={(e) => handleLikeToggle(e, post.id, post.likesCount)}
                                            className={`flex items-center gap-1.5 transition-colors cursor-pointer text-xs font-semibold ${
                                                likesState.liked
                                                    ? "text-rose-500 font-bold"
                                                    : "text-text-muted hover:text-rose-500"
                                            }`}
                                        >
                                            <FontAwesomeIcon
                                                icon={likesState.liked ? faHeartSolid : faHeartRegular}
                                                className="text-[11px]"
                                            />
                                            <span className="font-mono text-[11px]">{likesState.count}</span>
                                        </button>

                                        <div className="flex items-center gap-1.5 text-text-muted hover:text-text text-xs">
                                            <FontAwesomeIcon icon={faComment} className="text-[11px]" />
                                            <span className="font-mono text-[11px]">{post.repliesCount}</span>
                                        </div>

                                        <div className="flex items-center gap-1.5 text-text-faint text-xs">
                                            <FontAwesomeIcon icon={faEye} className="text-[10px]" />
                                            <span className="font-mono text-[11px]">{post.viewsCount}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={(e) => handleBookmarkToggle(e, post.id, post.isBookmarked)}
                                            className={`transition-colors cursor-pointer text-xs ${
                                                isBookmarked ? "text-primary font-bold" : "text-text-faint hover:text-text"
                                            }`}
                                            title="Bookmark"
                                        >
                                            <FontAwesomeIcon icon={isBookmarked ? faBookmarkSolid : faBookmarkRegular} />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigator.clipboard?.writeText?.(window.location.href);
                                            }}
                                            className="text-text-faint hover:text-text cursor-pointer transition-colors"
                                            title="Share"
                                        >
                                            <FontAwesomeIcon icon={faShareNodes} className="text-xs" />
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
