import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faChevronDown,
    faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { Post, type PostData, usePostsStore, getCurrentAuthor, type UserRank } from "@/features/post";
import { useAuthStore } from "@/features/auth/store/useAuthStore";

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

export interface CommunityHubFeedProps {
    posts: CommunityFeedPost[];
    activeFilter: string;
    onFilterChange: (filter: string) => void;
    sortMode: "hot" | "new" | "unanswered" | "top";
    onSortChange: (mode: "hot" | "new" | "unanswered" | "top") => void;
    onPostClick?: (postId: string) => void;
    communityId?: string;
    communityName?: string;
    isVi: boolean;
}

function parseUserRank(rank?: string): UserRank | undefined {
    if (!rank) return undefined;
    const lower = rank.toLowerCase();
    if (["rookie", "veteran", "pro", "elite", "master", "grandmaster", "legend", "immortal"].includes(lower)) {
        return lower as UserRank;
    }
    return "veteran";
}

function mapFeedPostToPostData(
    p: CommunityFeedPost,
    communityId?: string,
    communityName?: string
): PostData {
    return {
        id: p.id,
        author: {
            name: p.authorName,
            username: p.authorHandle ? p.authorHandle.replace(/^@/, "") : p.authorName,
            avatar: p.authorAvatar,
            avatarUrl: p.authorAvatar,
            rank: parseUserRank(p.authorRank),
        },
        authorAvatar: p.authorAvatar,
        title: p.title,
        content: p.content || "",
        images: p.images,
        tags: p.tags,
        likes: p.likesCount,
        comments: p.repliesCount,
        commentsCount: p.repliesCount,
        pinned: p.isPinned,
        privacy: "public",
        timeAgo: p.createdAt,
        communityId: communityId,
        communityName: communityName,
    };
}

export const CommunityHubFeed = ({
    posts,
    activeFilter,
    onFilterChange,
    sortMode,
    onSortChange,
    communityId,
    communityName,
    isVi,
}: CommunityHubFeedProps) => {
    // Dropdown controls states
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const sortRef = useRef<HTMLDivElement>(null);
    const filterRef = useRef<HTMLDivElement>(null);

    const user = useAuthStore((state) => state.user);
    const currentAuthor = getCurrentAuthor(user);
    const deletePost = usePostsStore((state) => state.deletePost);
    const updatePost = usePostsStore((state) => state.updatePost);

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

    return (
        <div className="w-full flex flex-col gap-4">
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

            {/* Posts Stream - Reusing standardized Post component */}
            {posts.length === 0 ? (
                <div className="py-14 text-center text-xs text-text-muted font-mono bg-surface-inner/30 rounded-[6px] border border-dashed border-divider-primary/50">
                    <p className="font-semibold text-text">{isVi ? "Chưa có hoạt động nào trong mục này." : "No posts found."}</p>
                    <p className="text-[11px] text-text-faint mt-1">
                        {isVi ? "Hãy là người đầu tiên chia sẻ nội dung." : "Be the first to post something."}
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {posts.map((feedPost) => {
                        const postData = mapFeedPostToPostData(feedPost, communityId, communityName);
                        const isOwner =
                            feedPost.authorName === currentAuthor ||
                            feedPost.authorHandle === `@${currentAuthor}` ||
                            feedPost.authorHandle === currentAuthor;

                        return (
                            <Post
                                key={feedPost.id}
                                post={postData}
                                isOwner={isOwner}
                                onDelete={(postId) => deletePost(postId)}
                                onEdit={(postId, data) => updatePost(postId, data)}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
};
