import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faComment,
    faHeart as faHeartRegular,
} from "@fortawesome/free-regular-svg-icons";
import {
    faHeart as faHeartSolid,
    faEye,
    faFire,
    faClock,
    faCircleQuestion,
    faStar,
} from "@fortawesome/free-solid-svg-icons";

export interface DiscussionThread {
    id: string;
    title: string;
    category: string;
    categoryLabel: string;
    authorName: string;
    authorHandle: string;
    authorAvatar: string;
    repliesCount: number;
    viewsCount: number;
    likesCount?: number;
    isLiked?: boolean;
    createdAt: string;
}

interface CommunityHubDiscussionsProps {
    threads: DiscussionThread[];
    sortMode: "hot" | "new" | "unanswered" | "top";
    onSortChange: (mode: "hot" | "new" | "unanswered" | "top") => void;
    onThreadClick: (threadId: string) => void;
    isVi: boolean;
}

export const CommunityHubDiscussions = ({
    threads,
    sortMode,
    onSortChange,
    onThreadClick,
    isVi,
}: CommunityHubDiscussionsProps) => {
    const [localLikes, setLocalLikes] = useState<Record<string, { count: number; liked: boolean }>>({});

    const handleLikeToggle = (e: React.MouseEvent, threadId: string, initialLikes = 12) => {
        e.stopPropagation();
        setLocalLikes((prev) => {
            const current = prev[threadId] || { count: initialLikes, liked: false };
            const liked = !current.liked;
            return {
                ...prev,
                [threadId]: {
                    count: liked ? current.count + 1 : Math.max(0, current.count - 1),
                    liked,
                },
            };
        });
    };

    const sortOptions = [
        { id: "hot", labelVi: "Hot", labelEn: "Hot", icon: faFire },
        { id: "new", labelVi: "Mới nhất", labelEn: "New", icon: faClock },
        { id: "top", labelVi: "Top bầu chọn", labelEn: "Top", icon: faStar },
        { id: "unanswered", labelVi: "Chưa trả lời", labelEn: "Unanswered", icon: faCircleQuestion },
    ] as const;

    return (
        <div className="w-full flex flex-col gap-4 select-none">
            {/* Section Header: Title + Thread Count + Sort Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-divider-primary/60 pb-2.5">
                <div className="flex items-center gap-3">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-text-faint">
                        RECENT DISCUSSIONS
                    </span>
                    <span className="text-xs font-mono font-semibold text-text-muted">
                        {threads.length} {threads.length === 1 ? "thread" : "threads"}
                    </span>
                </div>

                {/* Sort Mode Text Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
                    {sortOptions.map((opt) => {
                        const isActive = sortMode === opt.id;
                        return (
                            <button
                                key={opt.id}
                                type="button"
                                onClick={() => onSortChange(opt.id)}
                                className={`px-2 py-1 rounded-[4px] font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                                    isActive
                                        ? "bg-primary/10 text-primary border border-primary/30"
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

            {/* Discussions List (Post DNA: Avatar, Title, Author & Category, Likes, Comments, Time) */}
            {threads.length === 0 ? (
                <div className="py-12 text-center text-xs text-text-muted font-mono">
                    {isVi ? "Chưa có bài thảo luận nào phù hợp." : "No discussions found in this section."}
                </div>
            ) : (
                <div className="flex flex-col divide-y divide-divider-primary/40">
                    {threads.map((thread) => {
                        const likesState = localLikes[thread.id] || {
                            count: thread.likesCount ?? 12,
                            liked: thread.isLiked ?? false,
                        };

                        return (
                            <div
                                key={thread.id}
                                onClick={() => onThreadClick(thread.id)}
                                className="group py-3.5 px-2 rounded-[4px] hover:bg-surface-hover/40 transition-colors cursor-pointer flex flex-col gap-2"
                            >
                                <div className="flex items-start gap-3">
                                    <img
                                        src={thread.authorAvatar}
                                        alt={thread.authorName}
                                        className="w-8 h-8 rounded-full object-cover border border-divider-primary/80 shrink-0 mt-0.5"
                                    />

                                    <div className="flex flex-col min-w-0 flex-1">
                                        <h3 className="font-bold text-xs sm:text-sm text-text group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                                            {thread.title}
                                        </h3>

                                        <div className="flex items-center gap-2 text-[11px] text-text-muted font-mono pt-1 truncate">
                                            <span className="font-sans font-semibold text-text">
                                                {thread.authorHandle}
                                            </span>
                                            <span>·</span>
                                            <span className="text-text-faint">{thread.categoryLabel}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Engagement & Meta Row */}
                                <div className="flex items-center justify-between text-xs text-text-muted pl-11">
                                    <div className="flex items-center gap-4">
                                        <button
                                            type="button"
                                            onClick={(e) => handleLikeToggle(e, thread.id, thread.likesCount)}
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
                                            <span className="font-mono text-[11px]">{thread.repliesCount}</span>
                                        </div>

                                        <div className="flex items-center gap-1.5 text-text-faint text-xs">
                                            <FontAwesomeIcon icon={faEye} className="text-[10px]" />
                                            <span className="font-mono text-[11px]">{thread.viewsCount}</span>
                                        </div>
                                    </div>

                                    <span className="text-[11px] text-text-faint font-mono">
                                        {thread.createdAt}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
