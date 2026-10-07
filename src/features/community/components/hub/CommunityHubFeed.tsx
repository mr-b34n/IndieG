import { useTranslation } from "@/shared/hooks/useTranslate";
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
            rank: parseUserRank(p.authorRank),
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
}: CommunityHubFeedProps) => {
    const { t } = useTranslation();
    const user = useAuthStore((state) => state.user);
    const currentAuthor = getCurrentAuthor(user);
    const deletePost = usePostsStore((state) => state.deletePost);
    const updatePost = usePostsStore((state) => state.updatePost);

    return (
        <div className="w-full flex flex-col gap-3">
            {/* Feed Header: Compact Sort Selector (Newest & Hot only) */}
            <div className="flex items-center justify-between gap-3 pb-2 border-b border-border/50 select-none">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase text-text-faint tracking-wider font-bold">
                        {t('hub.communityhubfeed_19')}
                    </span>
                    <div className="inline-flex items-center bg-surface-inner border border-border/60 rounded-[6px] p-0.5">
                        <button
                            type="button"
                            onClick={() => onSortChange("hot")}
                            className={`px-2.5 py-1 rounded-[4px] text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                                sortMode === "hot"
                                    ? "bg-surface-hover text-primary font-bold shadow-2xs"
                                    : "text-text-muted hover:text-text"
                            }`}
                        >
                            <span>{t('hub.communityhubfeed_20')}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => onSortChange("new")}
                            className={`px-2.5 py-1 rounded-[4px] text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                                sortMode === "new"
                                    ? "bg-surface-hover text-primary font-bold shadow-2xs"
                                    : "text-text-muted hover:text-text"
                            }`}
                        >
                            <span>{t('hub.communityhubfeed_21')}</span>
                        </button>
                    </div>
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
