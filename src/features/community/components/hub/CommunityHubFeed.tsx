import { useState, useRef, useEffect } from "react";
import { AppIcon as FontAwesomeIcon } from "@/shared/components/ui/Icon";
import { CaretDown as faChevronDown, Check as faCheck } from "@phosphor-icons/react";
import { CircleNotch as Loader2, CheckCircle as CheckCircle2 } from "@phosphor-icons/react";
import { useTranslation } from "@/shared/hooks/useTranslate";
import { Post, type PostData, usePostsStore, getCurrentAuthor } from "@/features/post";

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
    upvotes?: number;
    downvotes?: number;
    score?: number;
    repostsCount?: number;
    isLiked?: boolean;
    isReposted?: boolean;
    isBookmarked?: boolean;
    currentUserVoteType?: number;
    images?: string[];
    pollOptions?: { id: string; label: string; votes: number }[];
    userVotedPollId?: string;
    eventDate?: string;
    eventTime?: string;
    eventLocation?: string;
    tags?: string[];
    isSpoiler?: boolean;
    isNsfw?: boolean;
}

export interface CommunityHubFeedProps {
    posts: CommunityFeedPost[];
    activeFilter?: string;
    onFilterChange?: (filter: string) => void;
    sortMode: "hot" | "new" | "unanswered" | "top";
    onSortChange: (mode: "hot" | "new") => void;
    onPostClick?: (postId: string) => void;
    communityId?: string;
    communityName?: string;
    isVi: boolean;
    hasNextPage?: boolean;
    isFetchingNextPage?: boolean;
    onLoadMore?: () => void;
}

function mapFeedPostToPostData(
    p: CommunityFeedPost,
    communityId?: string,
    communityName?: string
): PostData {
    const upvotes = p.upvotes ?? p.likesCount ?? 0;
    const downvotes = p.downvotes ?? 0;
    const score = p.score ?? (upvotes - downvotes);

    return {
        id: p.id,
        author: {
            name: p.authorName,
            username: p.authorHandle ? p.authorHandle.replace(/^@/, "") : p.authorName,
            avatar: p.authorAvatar,
            avatarUrl: p.authorAvatar,
        },
        authorAvatar: p.authorAvatar,
        title: p.title,
        content: p.content || "",
        images: p.images,
        tags: p.tags,
        likes: upvotes,
        upvotes: upvotes,
        downvotes: downvotes,
        score: score,
        comments: p.repliesCount,
        commentsCount: p.repliesCount,
        pinned: p.isPinned,
        privacy: "public",
        isSpoiler: p.isSpoiler,
        isNsfw: p.isNsfw,
        currentUserVoteType: p.currentUserVoteType ?? (p.isLiked ? 1 : 0),
        timeAgo: p.createdAt,
        communityId: communityId,
        communityName: communityName,
    };
}

export const CommunityHubFeed = ({
    posts,
    sortMode,
    onSortChange,
    communityId,
    communityName,
    isVi,
    hasNextPage,
    isFetchingNextPage,
    onLoadMore,
}: CommunityHubFeedProps) => {
    const { t } = useTranslation();
    const currentAuthor = getCurrentAuthor();
    const deletePost = usePostsStore((state) => state.deletePost);
    const updatePost = usePostsStore((state) => state.updatePost);

    const [isSortOpen, setIsSortOpen] = useState(false);
    const sortDropdownRef = useRef<HTMLDivElement>(null);
    const sentinelRef = useRef<HTMLDivElement>(null);

    // Infinite Scroll IntersectionObserver
    useEffect(() => {
        if (!hasNextPage || isFetchingNextPage || !onLoadMore) return;
        const el = sentinelRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    onLoadMore();
                }
            },
            { rootMargin: "300px 0px", threshold: 0.1 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, onLoadMore]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target as Node)) {
                setIsSortOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const sortOptions = [
        { id: "hot" as const, label: isVi ? "Nổi bật nhất (Hot)" : "Hot" },
        { id: "new" as const, label: isVi ? "Mới nhất (Newest)" : "Newest" },
    ];
    const currentSort = sortOptions.find((o) => o.id === sortMode) || sortOptions[0];

    return (
        <div className="w-full flex flex-col gap-3">
            {/* Feed Header: Sort Dropdown */}
            <div className="flex items-center justify-between gap-3 pb-2 border-b border-border/50 select-none">
                <div className="relative inline-block text-left" ref={sortDropdownRef}>
                    <button
                        type="button"
                        onClick={() => setIsSortOpen((prev) => !prev)}
                        className="flex items-center gap-1.5 text-xs font-bold text-brand-400 hover:text-brand-300 transition-colors cursor-pointer whitespace-nowrap py-0.5"
                    >
                        <span>{currentSort.label}</span>
                        <FontAwesomeIcon
                            icon={faChevronDown}
                            className={`text-[10px] transition-transform duration-200 ${
                                isSortOpen ? "rotate-180" : ""
                            }`}
                        />
                    </button>

                    {isSortOpen && (
                        <div className="absolute left-0 top-full mt-1.5 w-44 bg-surface border border-border rounded-[6px] shadow-2xl z-50 p-1 flex flex-col gap-0.5 animate-fade-in">
                            {sortOptions.map((opt) => {
                                const isSelected = sortMode === opt.id;
                                return (
                                    <button
                                        key={opt.id}
                                        type="button"
                                        onClick={() => {
                                            onSortChange(opt.id);
                                            setIsSortOpen(false);
                                        }}
                                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-[4px] text-left text-xs transition-colors cursor-pointer ${
                                            isSelected
                                                ? "bg-primary/10 text-primary font-bold"
                                                : "hover:bg-surface-hover text-text"
                                        }`}
                                    >
                                        <span>{opt.label}</span>
                                        {isSelected && (
                                            <FontAwesomeIcon icon={faCheck} className="text-primary text-[10px] shrink-0" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Posts Stream - Reusing standardized Post component */}
            {posts.length === 0 ? (
                <div className="py-14 text-center text-xs text-text-muted font-mono bg-surface-inner/30 rounded-[6px] border border-dashed border-divider-primary/50">
                    <p className="font-semibold text-text">{t('hub.communityhubfeed_23')}</p>
                    <p className="text-[11px] text-text-faint mt-1">
                        {t('hub.communityhubfeed_24')}
                    </p>
                </div>
            ) : (
                <div className="flex flex-col">
                    {posts.map((feedPost, index) => {
                        const postData = mapFeedPostToPostData(feedPost, communityId, communityName);
                        const isOwner =
                            feedPost.authorName === currentAuthor ||
                            feedPost.authorHandle === `@${currentAuthor}` ||
                            feedPost.authorHandle === currentAuthor;

                        return (
                            <div key={feedPost.id} className="flex flex-col">
                                {index > 0 && <div className="w-full h-px bg-divider-primary my-1" />}
                                <Post
                                    post={postData}
                                    isOwner={isOwner}
                                    hideCommunity={true}
                                    onDelete={(postId) => deletePost(postId)}
                                    onEdit={(postId, data) => updatePost(postId, data)}
                                />
                            </div>
                        );
                    })}
                    {/* Infinite Scroll Sentinel / Load More */}
                    <div ref={sentinelRef} className="w-full py-4 flex flex-col items-center justify-center gap-2">
                        {isFetchingNextPage && (
                            <div className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-primary animate-pulse">
                                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                                <span>{t('feed.loadingMore', { defaultValue: "Loading more posts..." })}</span>
                            </div>
                        )}
                        {!isFetchingNextPage && hasNextPage && onLoadMore && (
                            <button
                                type="button"
                                onClick={() => onLoadMore()}
                                className="px-4 py-1.5 text-xs font-bold text-text-muted hover:text-text bg-surface-hover hover:bg-surface-hover/80 rounded transition-colors cursor-pointer"
                            >
                                {t('feed.loadMore', { defaultValue: "Tải thêm bài viết" })}
                            </button>
                        )}
                        {!hasNextPage && posts.length > 0 && (
                            <div className="flex items-center gap-2 text-xs text-text-faint py-3 font-medium">
                                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                                <span>{t('feed.allLoaded', { defaultValue: "You're all caught up ✨" })}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
