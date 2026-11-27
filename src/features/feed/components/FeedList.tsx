import { useEffect, useMemo, useRef, useState, useCallback } from "react"
import { Tray as Inbox, CircleNotch as Loader2, CheckCircle as CheckCircle2, Warning as AlertTriangle, X, Compass } from "@phosphor-icons/react"
import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "@/shared/hooks/useTranslate"

import { prepareAttachmentsForSave } from "@/features/post/helpers/postAttachments";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { getCurrentAuthor, Post, usePostsStore, useFeedNavigationStore, FeedListSkeleton, type PostData } from "@/features/post";

import { useCommunitiesStore } from "@/features/community";
import { CreatePostBox, type CreatePostPayload } from "./CreatePostBox";
import { type FeedSortOption } from "./FeedSortDropdown";
import { type PostDataWithSettings } from "../types";
import { useInfinitePostsQuery, useCreatePostMutation } from "@/shared/api/useQueries";
import { mapPostDtoToPostData, extractPostList } from "@/shared/api";

export const FeedList = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const isLoggedIn = useAuthStore((state) => !!state.user);

    const [sortOrder] = useState<FeedSortOption>("latest");

    // 1. TanStack Query for Posts with Infinite Pagination
    const {
        data: infinitePostsData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: isPostsLoading,
        isError: isPostsQueryError,
        refetch: refetchPosts,
    } = useInfinitePostsQuery({
        sortBy: sortOrder === "popular" ? "trending" : "latest",
    });
    const createPostMutation = useCreatePostMutation();

    const posts = usePostsStore((state) => state.posts);
    const postOverrides = usePostsStore((state) => state.overrides);
    const addPost = usePostsStore((state) => state.addPost);
    const updatePost = usePostsStore((state) => state.updatePost);
    const deletePost = usePostsStore((state) => state.deletePost);

    const communities = useCommunitiesStore((state) => state.communities);
    const getCommunityById = useCommunitiesStore((state) => state.getCommunityById);

    const { joinedCommunities } = useMemo(() => {
        const joined = communities.filter((c) => c.joined);
        return { joinedCommunities: joined };
    }, [communities]);

    const [activeCommunityFilter, setActiveCommunityFilter] = useState<string | null>(null);
    const [hiddenAuthors, setHiddenAuthors] = useState<string[]>([]);
    const [deletedIds, setDeletedIds] = useState<Set<string>>(() => new Set());
    const [hasError, setHasError] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const sentinelRef = useRef<HTMLDivElement>(null);
    const currentAuthor = getCurrentAuthor();

    const handleDeletePost = useCallback((id: string | number) => {
        deletePost(id);
        setDeletedIds((prev) => new Set(prev).add(String(id)));
    }, [deletePost]);

    const handleCreatePost = useCallback(async ({ title, content, attachments, privacy, tags, allowComments, pinned, communityId }: CreatePostPayload) => {
        setSubmitError(null);
        try {
            const { images, files } = await prepareAttachmentsForSave(attachments);
            const community = communityId ? getCommunityById(communityId) : undefined;
            const currentUser = useAuthStore.getState().user;

            const newPost: PostDataWithSettings = {
                id: Date.now(),
                author: currentAuthor,
                authorAvatar: currentUser?.avatarUrl || currentUser?.avatar_url || "",
                community: community ? {
                    id: community.id,
                    name: community.name,
                    logo: community.logo,
                    backdrop: community.backdrop,
                } : undefined,
                communityId,
                communityName: community?.name,
                gameTag: community?.name ?? "General",
                timeAgo: t('feed.justNow') || "Vừa xong",
                title: title || content.slice(0, 80) + (content.length > 80 ? "..." : ""),
                content,
                images: images.length > 0 ? images : undefined,
                files: files.length > 0 ? files : undefined,
                tags,
                likes: 0,
                upvotes: 0,
                downvotes: 0,
                score: 0,
                comments: 0,
                privacy,
                allowComments,
                pinned,
            };

            // Post via TanStack Mutation to backend if communityId is available
            if (communityId) {
                try {
                    await createPostMutation.mutateAsync({
                        communityId: String(communityId),
                        title: title || undefined,
                        content,
                        images: images.length > 0 ? images : undefined,
                        tags,
                        pinned,
                        allowComments,
                    });
                } catch {
                    // Fallback to local optimistic update
                }
            }

            addPost(newPost);
        } catch {
            setSubmitError(t('feed.postSubmitError', { defaultValue: "Đã có lỗi xảy ra khi đăng bài. Vui lòng thử lại!" }));
        }
    }, [addPost, createPostMutation, currentAuthor, getCommunityById, t]);

    const handleEditPost = useCallback((id: string | number, data: Partial<PostData>) => {
        updatePost(id, {
            ...data,
            ...(data.title !== undefined
                ? { title: data.title || (data.content ? data.content.slice(0, 80) + (data.content.length > 80 ? "..." : "") : "") }
                : {}),
        });
    }, [updatePost]);

    const handleUnfollowAuthor = useCallback((author: string) => {
        setHiddenAuthors((prev) => [...prev, author]);
    }, []);

    // Flatten remote posts across all loaded pages
    const remotePosts = useMemo(() => {
        if (!infinitePostsData?.pages) return [];
        return infinitePostsData.pages.flatMap((page) => extractPostList(page));
    }, [infinitePostsData?.pages]);

    // Track locally created posts that may not be in remote response yet
    const localPendingPosts = useMemo(() => {
        const remoteIds = new Set(remotePosts.map((p) => String(p.id)));
        return posts.filter((p) => {
            const authorName = typeof p.author === "string" ? p.author : (p.author?.name || p.author?.username || "");
            return authorName === currentAuthor && !remoteIds.has(String(p.id));
        });
    }, [posts, remotePosts, currentAuthor]);

    // Merge remote posts (Single Source of Truth from TanStack Query) with lightweight local overrides
    const mergedPosts = useMemo(() => {
        const storeMap = new Map(posts.map((p) => [String(p.id), p]));
        const mappedRemote: PostDataWithSettings[] = remotePosts.map((dto) => {
            const key = String(dto.id);
            const base = {
                ...mapPostDtoToPostData(dto),
                communityId: dto.communityId,
            } as PostDataWithSettings;
            const local = storeMap.get(key);
            const patch = postOverrides[key];
            if (!local && !patch) return base;
            return { ...base, ...(local || {}), ...(patch || {}) } as PostDataWithSettings;
        });
        return [...localPendingPosts, ...mappedRemote];
    }, [localPendingPosts, remotePosts, posts, postOverrides]);

    const displayedPosts = useMemo(() => {
        const seenIds = new Set<string>();

        return mergedPosts.filter((p) => {
            const idStr = String(p.id);
            if (seenIds.has(idStr) || deletedIds.has(idStr)) return false;
            seenIds.add(idStr);

            const authorName = typeof p.author === "string" ? p.author : (p.author?.name || p.author?.username || "");
            if (hiddenAuthors.includes(authorName)) return false;

            // My own posts always show
            if (authorName === currentAuthor) return true;

            const postCommId = (p.community?.id || p.communityId)?.toString().toLowerCase();
            const postCommName = (p.community?.name || p.communityName || p.gameTag)?.toLowerCase();

            // If a specific community filter is selected
            if (activeCommunityFilter) {
                const targetComm = communities.find((c) => String(c.id) === activeCommunityFilter);
                const targetId = activeCommunityFilter.toLowerCase();
                const targetName = targetComm?.name.toLowerCase();

                return postCommId === targetId || (postCommName && targetName && postCommName.includes(targetName));
            }

            return true;
        });
    }, [mergedPosts, deletedIds, hiddenAuthors, currentAuthor, activeCommunityFilter, communities]);

    const registerPostIds = useFeedNavigationStore((state) => state.registerPostIds);
    useEffect(() => {
        registerPostIds(displayedPosts.map((p) => p.id));
    }, [displayedPosts, registerPostIds]);

    // Infinite Scroll IntersectionObserver
    useEffect(() => {
        if (!hasNextPage || isFetchingNextPage) return;
        const el = sentinelRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    void fetchNextPage();
                }
            },
            { rootMargin: "300px 0px", threshold: 0.1 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    return (
        <div className="w-full flex flex-col gap-4">
            {/* Submit Error Banner */}
            {submitError && (
                <div className="w-full flex items-center justify-between gap-3 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs font-semibold text-rose-500 animate-fade-in">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>{submitError}</span>
                    </div>
                    <button onClick={() => setSubmitError(null)} className="hover:opacity-80 p-1 cursor-pointer">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Creation Area */}
            {isLoggedIn && (
                <div className="flex flex-col mb-1 sm:mb-2">
                    <CreatePostBox
                        onPostCreated={handleCreatePost}
                    />
                </div>
            )}

            {/* Error State Display */}
            {(isPostsQueryError || hasError) ? (
                <div className="w-full flex flex-col items-center justify-center gap-3 p-8 bg-surface/90 border border-rose-500/30 rounded-2xl text-center">
                    <AlertTriangle className="w-8 h-8 text-rose-500" />
                    <p className="font-bold text-text text-sm">
                        {t('feed.feedLoadError', { defaultValue: 'Đã xảy ra lỗi khi tải nguồn cấp bài viết' })}
                    </p>
                    <button
                        onClick={() => {
                            setHasError(false);
                            void refetchPosts();
                        }}
                        className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover transition-all cursor-pointer"
                    >
                        {t('feed.retry', { defaultValue: 'Thử lại' })}
                    </button>
                </div>
            ) : (isPostsLoading && displayedPosts.length === 0) ? (
                /* Facebook-style Skeleton Loading (approx 3 items) */
                <FeedListSkeleton count={3} />
            ) : displayedPosts.length > 0 ? (
                /* Posts Feed */
                <>
                    <div className="flex flex-col">
                        {displayedPosts.map((post, index) => (
                            <div key={post.id} className="flex flex-col">
                                {index > 0 && <div className="w-full h-px bg-divider-primary my-1" />}
                                <Post
                                    post={post}
                                    isOwner={post.author === currentAuthor}
                                    onDelete={handleDeletePost}
                                    onEdit={handleEditPost}
                                    onUnfollowAuthor={handleUnfollowAuthor}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Infinite Scroll Sentinel / Load More */}
                    <div ref={sentinelRef} className="w-full py-4 flex flex-col items-center justify-center gap-2">
                        {isFetchingNextPage && (
                            <div className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-primary animate-pulse">
                                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                                <span>{t('feed.loadingMore', { defaultValue: "Loading more posts..." })}</span>
                            </div>
                        )}
                        {!isFetchingNextPage && hasNextPage && (
                            <button
                                type="button"
                                onClick={() => void fetchNextPage()}
                                className="px-4 py-1.5 text-xs font-bold text-text-muted hover:text-text bg-surface-hover hover:bg-surface-hover/80 rounded transition-colors cursor-pointer"
                            >
                                {t('feed.loadMore', { defaultValue: "Tải thêm bài viết" })}
                            </button>
                        )}
                        {!hasNextPage && !isPostsLoading && displayedPosts.length > 0 && (
                            <div className="flex items-center gap-2 text-xs text-text-faint py-3 font-medium">
                                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                                <span>{t('feed.allLoaded', { defaultValue: "You're all caught up ✨" })}</span>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                /* Empty Feed State for Joined Communities (Border-free) */
                <div className="w-full flex flex-col items-center justify-center gap-3 py-12 px-6 text-center">
                    <div className="w-12 h-12 rounded-lg bg-surface-hover/70 flex items-center justify-center text-primary text-xl">
                        {joinedCommunities.length === 0 ? <Compass className="w-6 h-6" /> : <Inbox className="w-6 h-6" />}
                    </div>

                    <div className="flex flex-col gap-1 max-w-sm">
                        <p className="font-extrabold text-text text-sm">
                            {joinedCommunities.length === 0
                                ? t('feed.noCommunitiesJoinedTitle', { defaultValue: 'No communities joined yet' })
                                : activeCommunityFilter
                                ? t('feed.noPostsInCommunityTitle', { defaultValue: 'No posts in this community yet' })
                                : t('feed.noPostsInFeedTitle', { defaultValue: 'No recent posts from your communities' })}
                        </p>
                        <p className="text-text-muted text-xs leading-relaxed">
                            {joinedCommunities.length === 0
                                ? t('feed.noCommunitiesJoinedDesc', { defaultValue: 'Your home feed delivers discussions and guides from the game communities you follow. Explore and join communities to get started!' })
                                : t('feed.noPostsFeedDesc', { defaultValue: 'Be the first to start the conversation or check back soon.' })}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <button
                            type="button"
                            onClick={() => navigate({ to: "/community" })}
                            className="px-4 py-1.5 rounded bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-2"
                        >
                            <Compass className="w-4 h-4" />
                            <span>{t('feed.exploreCommunities', { defaultValue: 'Explore Communities' })}</span>
                        </button>
                        {activeCommunityFilter && (
                            <button
                                type="button"
                                onClick={() => setActiveCommunityFilter(null)}
                                className="px-3 py-1.5 rounded bg-surface-hover hover:bg-surface-hover/80 text-text text-xs font-semibold transition-colors cursor-pointer"
                            >
                                {t('feed.viewAll', { defaultValue: 'View All' })}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
