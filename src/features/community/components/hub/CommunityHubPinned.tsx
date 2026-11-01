import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbtack, faComment, faArrowUp } from "@fortawesome/free-solid-svg-icons";
import { formatCompactNumber } from "../../constants";

export interface PinnedThreadItem {
    id: string;
    title: string;
    authorHandle: string;
    authorName?: string;
    date?: string;
    tag?: string;
    repliesCount: number;
    likesCount?: number;
    upvotes?: number;
}

interface CommunityHubPinnedProps {
    pinnedThreads: PinnedThreadItem[];
    onThreadClick: (id: string) => void;
    isVi: boolean;
}

export const CommunityHubPinned = ({
    pinnedThreads,
    onThreadClick,
    isVi,
}: CommunityHubPinnedProps) => {
    if (!pinnedThreads || pinnedThreads.length === 0) return null;

    return (
        <div className="w-full flex flex-col gap-2.5 select-none pt-1 pb-2">
            {/* Reddit-style Header: "Bài viết đã ghim" / "Pinned Posts" */}
            <div className="flex items-center gap-2 px-1">
                <FontAwesomeIcon icon={faThumbtack} className="text-xs text-primary rotate-45" />
                <span className="text-xs font-bold text-text tracking-tight">
                    {isVi ? "Bài viết đã ghim" : "Pinned Posts"}
                </span>
            </div>

            {/* Reddit-style Side-by-Side Highlighted Cards (1 col on mobile, 2 cols on tablet/desktop) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                {pinnedThreads.map((thread) => {
                    const votes = thread.upvotes ?? thread.likesCount ?? 0;
                    return (
                        <div
                            key={thread.id}
                            onClick={() => onThreadClick(thread.id)}
                            className="group p-3.5 rounded-2xl bg-surface-inner/60 hover:bg-surface-hover border border-border/70 hover:border-primary/40 transition-all cursor-pointer flex flex-col justify-between gap-2.5 shadow-xs"
                        >
                            <div className="flex flex-col gap-1.5 min-w-0">
                                {/* Pinned Badge & Author */}
                                <div className="flex items-center justify-between gap-2 text-[10px] font-mono text-text-faint">
                                    <span className="flex items-center gap-1 font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                                        <FontAwesomeIcon icon={faThumbtack} className="text-[8px] rotate-45" />
                                        <span>{isVi ? "Ghim" : "Pinned"}</span>
                                    </span>
                                    <span className="truncate">{thread.authorHandle || thread.authorName}</span>
                                </div>

                                {/* Title (2 lines clamp) */}
                                <h3 className="font-bold text-xs sm:text-[13px] text-text group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                                    {thread.title}
                                </h3>
                            </div>

                            {/* Engagement Stats footer (Reddit-style: X lượt bình chọn • Y bình luận) */}
                            <div className="flex items-center gap-2 text-[11px] font-mono text-text-muted pt-1 border-t border-border/30">
                                <span className="flex items-center gap-1">
                                    <FontAwesomeIcon icon={faArrowUp} className="text-[10px] text-primary" />
                                    <span>
                                        {formatCompactNumber(votes)} {isVi ? "lượt bình chọn" : "votes"}
                                    </span>
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <FontAwesomeIcon icon={faComment} className="text-[10px] text-text-faint" />
                                    <span>
                                        {formatCompactNumber(thread.repliesCount)} {isVi ? "bình luận" : "comments"}
                                    </span>
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
