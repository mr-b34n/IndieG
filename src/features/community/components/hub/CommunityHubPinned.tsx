import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbtack } from "@fortawesome/free-solid-svg-icons";

export interface PinnedThreadItem {
    id: string;
    title: string;
    authorHandle: string;
    date: string;
    tag?: string;
    repliesCount: number;
}

interface CommunityHubPinnedProps {
    pinnedThreads: PinnedThreadItem[];
    onThreadClick: (id: string) => void;
    isVi: boolean;
}

export const CommunityHubPinned = ({
    pinnedThreads,
    onThreadClick,
}: CommunityHubPinnedProps) => {
    if (!pinnedThreads || pinnedThreads.length === 0) return null;

    return (
        <div className="w-full flex flex-col gap-2.5 select-none pb-4 border-b border-divider-primary/60">
            {/* Section Title */}
            <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-text-faint">
                    PINNED
                </span>
            </div>

            {/* Clean List Items (No Outer Box) */}
            <div className="flex flex-col gap-2">
                {pinnedThreads.map((thread) => (
                    <div
                        key={thread.id}
                        onClick={() => onThreadClick(thread.id)}
                        className="group flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 p-2 rounded-[4px] hover:bg-surface-hover/50 transition-colors cursor-pointer"
                    >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <FontAwesomeIcon
                                icon={faThumbtack}
                                className="text-[11px] text-primary shrink-0"
                            />
                            <span className="font-bold text-xs text-text group-hover:text-primary transition-colors truncate">
                                {thread.title}
                            </span>
                            {thread.tag && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-[3px] bg-primary/10 text-primary border border-primary/20 shrink-0">
                                    {thread.tag}
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-text-muted font-mono shrink-0 pl-6 sm:pl-0">
                            <span>{thread.authorHandle}</span>
                            <span>·</span>
                            <span>{thread.date}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
