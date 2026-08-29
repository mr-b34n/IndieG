import { useEffect, useMemo, useRef, useState } from "react"
import { 
    faInbox, 
    faSpinner, 
    faCircleCheck, 
    faExclamationTriangle,
    faXmark,
    faUsers,
    faCompass
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "@/shared/hooks/useTranslate"

import { DEFAULT_AVATAR as avatarGame } from "@/shared/constants/images";
import { prepareAttachmentsForSave } from "@/features/post/helpers/postAttachments";
import { useAuthStore } from "@/features/auth";
import { getCurrentAuthor, Post, usePostsStore, type PostData } from "@/features/post";

import { useCommunitiesStore } from "@/features/community";
import { CreatePostBox, type CreatePostPayload } from "./CreatePostBox";
import { CommunitySwitcherRail } from "./CommunitySwitcherRail";
import { type FeedSortOption } from "./FeedSortDropdown";
import { type PostDataWithSettings } from "../types";
import { usePostsQuery, useCreatePostMutation } from "@/shared/api/useQueries";
import { mapPostDtoToPostData, type PostDto } from "@/shared/api";

function extractPostList(res: unknown): PostDto[] {
    if (!res) return [];
    if (Array.isArray(res)) return res as PostDto[];
    if (typeof res === "object") {
        const obj = res as Record<string, unknown>;
        if (Array.isArray(obj.items)) return obj.items as PostDto[];
        if (Array.isArray(obj.data)) return obj.data as PostDto[];
        if (Array.isArray(obj.posts)) return obj.posts as PostDto[];
    }
    return [];
}

export const FeedList = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const mockLogin = useAuthStore((state) => state.mockLogin);
    const isLoggedIn = !!user || mockLogin;

    // 1. TanStack Query for Posts
    const { data: remotePostsData } = usePostsQuery();
    const createPostMutation = useCreatePostMutation();


    const posts = usePostsStore((state) => state.posts);
    const addPost = usePostsStore((state) => state.addPost);
    const updatePost = usePostsStore((state) => state.updatePost);
    const deletePost = usePostsStore((state) => state.deletePost);

    // Sync remote posts from TanStack Query into posts list
    useEffect(() => {
        if (remotePostsData) {
            const list = extractPostList(remotePostsData);
            if (Array.isArray(list) && list.length > 0) {
                list.forEach((dto) => {
                    const exists = posts.some((p) => String(p.id) === String(dto.id));
                    if (!exists) {
                        const mapped = mapPostDtoToPostData(dto);
                        addPost({
                            ...mapped,
                            communityId: dto.communityId,
                        } as PostDataWithSettings);
                    }
                });
            }
        }
    }, [remotePostsData]);

    const communities = useCommunitiesStore((state) => state.communities);
    const getCommunityById = useCommunitiesStore((state) => state.getCommunityById);

    const joinedCommunities = useMemo(() => {
        return communities.filter((c) => c.joined);
    }, [communities]);

    const joinedCommunityIds = useMemo(() => {
        return new Set(joinedCommunities.map((c) => c.id.toString().toLowerCase()));
    }, [joinedCommunities]);

    const joinedCommunityNames = useMemo(() => {
        return new Set(joinedCommunities.map((c) => c.name.toLowerCase()));
    }, [joinedCommunities]);

    const [activeCommunityFilter, setActiveCommunityFilter] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<FeedSortOption>("latest");
    const [hiddenAuthors, setHiddenAuthors] = useState<string[]>([]);
    const [displayLimit, setDisplayLimit] = useState(5);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const sentinelRef = useRef<HTMLDivElement>(null);
    const currentAuthor = getCurrentAuthor();

    const handleCreatePost = async ({ title, content, attachments, privacy, tags, allowComments, pinned, communityId }: CreatePostPayload) => {
        setSubmitError(null);
        try {
            const { images, files } = await prepareAttachmentsForSave(attachments);
            const community = getCommunityById(communityId);

            const newPost: PostDataWithSettings = {
                id: Date.now(),
                author: currentAuthor,
                authorAvatar: avatarGame,
                gameTag: community?.name ?? "General",
                timeAgo: t('feed.justNow') || "Vừa xong",
                title: title || content.slice(0, 80) + (content.length > 80 ? "..." : ""),
                content,
                images: images.length > 0 ? images : undefined,
                files: files.length > 0 ? files : undefined,
                tags,
                likes: 0,
                comments: 0,
                privacy,
                allowComments,
                pinned,
                communityId,
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
            // Ensure new post is displayed at top
            setDisplayLimit((prev) => Math.max(prev, 5));
        } catch {
            setSubmitError("Đã có lỗi xảy ra khi đăng bài. Vui lòng thử lại!");
        }
    };


    const handleEditPost = (id: string | number, data: Partial<PostData>) => {
        updatePost(id, {
            ...data,
            title: data.title || (data.content ? data.content.slice(0, 80) + (data.content.length > 80 ? "..." : "") : ""),
        });
    };

    const handleUnfollowAuthor = (author: string) => {
        setHiddenAuthors((prev) => [...prev, author]);
    };

    // Filter and sort posts
    const filteredPosts = useMemo(() => {
        return posts
            .filter((p) => {
                if (hiddenAuthors.includes(p.author)) return false;

                // My own posts always show
                if (p.author === currentAuthor) return true;

                const postCommId = p.communityId?.toString().toLowerCase();
                const postGameTag = p.gameTag?.toLowerCase();

                // If a specific community filter is selected
                if (activeCommunityFilter) {
                    const targetComm = communities.find((c) => String(c.id) === activeCommunityFilter);
                    const targetId = activeCommunityFilter.toLowerCase();
                    const targetName = targetComm?.name.toLowerCase();

                    return postCommId === targetId || (postGameTag && targetName && postGameTag.includes(targetName));
                }

                // Otherwise, show posts from ANY joined community
                const belongsToJoinedCommunity =
                    (postCommId && joinedCommunityIds.has(postCommId)) ||
                    (postGameTag && Array.from(joinedCommunityNames).some((name) => postGameTag.includes(name)));

                return belongsToJoinedCommunity;
            })
            .slice()
            .sort((a, b) => {
                const pinDiff = Number(!!(b as PostDataWithSettings).pinned) - Number(!!(a as PostDataWithSettings).pinned);
                if (pinDiff !== 0) return pinDiff;

                if (sortOrder === "popular") {
                    return (b.likes || 0) - (a.likes || 0);
                }
                if (sortOrder === "discussed") {
                    return (b.comments || 0) - (a.comments || 0);
                }
                return Number(b.id) - Number(a.id);
            });
    }, [posts, hiddenAuthors, currentAuthor, activeCommunityFilter, sortOrder, communities, joinedCommunityIds, joinedCommunityNames]);

    const displayedPosts = useMemo(() => {
        return filteredPosts.slice(0, displayLimit);
    }, [filteredPosts, displayLimit]);

    const hasMore = displayLimit < filteredPosts.length;

    // Infinite Scroll IntersectionObserver
    useEffect(() => {
        if (!hasMore || isLoadingMore) return;
        const el = sentinelRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
                    setIsLoadingMore(true);
                    setTimeout(() => {
                        setDisplayLimit((prev) => prev + 4);
                        setIsLoadingMore(false);
                    }, 500);
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [hasMore, isLoadingMore]);

    return (
        <div className="w-full flex flex-col gap-4">
            {/* Submit Error Banner */}
            {submitError && (
                <div className="w-full flex items-center justify-between gap-3 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs font-semibold text-rose-500 animate-fade-in">
                    <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faExclamationTriangle} />
                        <span>{submitError}</span>
                    </div>
                    <button onClick={() => setSubmitError(null)} className="hover:opacity-80 p-1 cursor-pointer">
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                </div>
            )}

            {/* Home Feed Editorial Header */}
            <div className="w-full flex flex-col pt-1">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-text tracking-tight uppercase">
                            {t('feed.homeFeedTitle', { defaultValue: 'Home Feed' })}
                        </h1>
                        <p className="text-xs text-text-muted mt-0.5">
                            {t('feed.homeFeedSub', { defaultValue: 'Discussions & updates from your joined communities' })}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate({ to: "/community" })}
                        className="self-start sm:self-auto text-xs font-bold text-primary hover:underline transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                        <FontAwesomeIcon icon={faUsers} className="text-[11px]" />
                        <span>{t('feed.manageCommunities', { defaultValue: 'Manage communities' })}</span>
                    </button>
                </div>

                {/* Community Switcher Rail: YOUR FEED, Top Communities, +N More, and Sort Dropdown */}
                <CommunitySwitcherRail
                    joinedCommunities={joinedCommunities}
                    activeCommunityId={activeCommunityFilter}
                    onSelectCommunity={setActiveCommunityFilter}
                    sortOrder={sortOrder}
                    onSortChange={setSortOrder}
                />
            </div>

            {/* Create Post Area */}
            {isLoggedIn && (
                <CreatePostBox
                    key={activeCommunityFilter ? String(activeCommunityFilter) : "all"}
                    defaultCommunityId={activeCommunityFilter}
                    onPostCreated={handleCreatePost}
                />
            )}

            {/* Error State Display */}
            {hasError ? (
                <div className="w-full flex flex-col items-center justify-center gap-3 p-8 bg-surface/90 border border-rose-500/30 rounded-2xl text-center">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-3xl text-rose-500" />
                    <p className="font-bold text-text text-sm">Đã xảy ra lỗi khi tải nguồn cấp bài viết</p>
                    <button
                        onClick={() => setHasError(false)}
                        className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover transition-all cursor-pointer"
                    >
                        Thử lại
                    </button>
                </div>
            ) : displayedPosts.length > 0 ? (
                /* Posts Feed */
                <>
                    {displayedPosts.map((post) => (
                        <Post
                            key={post.id}
                            post={post}
                            isOwner={post.author === currentAuthor}
                            onDelete={deletePost}
                            onEdit={handleEditPost}
                            onUnfollowAuthor={handleUnfollowAuthor}
                        />
                    ))}

                    {/* Infinite Scroll Sentinel / Load More */}
                    <div ref={sentinelRef} className="w-full py-4 flex flex-col items-center justify-center gap-2">
                        {isLoadingMore && (
                            <div className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-primary animate-pulse">
                                <FontAwesomeIcon icon={faSpinner} className="animate-spin text-sm" />
                                <span>{t('feed.loadingMore') || "Loading more posts..."}</span>
                            </div>
                        )}
                        {!isLoadingMore && hasMore && (
                            <button
                                type="button"
                                onClick={() => {
                                    setIsLoadingMore(true);
                                    setTimeout(() => {
                                        setDisplayLimit((prev) => prev + 4);
                                        setIsLoadingMore(false);
                                    }, 300);
                                }}
                                className="px-4 py-1.5 text-xs font-bold text-text-muted hover:text-text bg-surface-hover hover:bg-surface-hover/80 rounded transition-colors cursor-pointer"
                            >
                                {t('feed.loadMoreCount', { count: filteredPosts.length - displayLimit })}
                            </button>
                        )}
                        {!hasMore && filteredPosts.length > 4 && (
                            <div className="flex items-center gap-2 text-xs text-text-faint py-3 font-medium">
                                <FontAwesomeIcon icon={faCircleCheck} className="text-primary text-xs" />
                                <span>{t('feed.allLoaded') || "You're all caught up ✨"}</span>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                /* Empty Feed State for Joined Communities */
                <div className="w-full flex flex-col items-center justify-center gap-3 py-12 px-6 text-center border-b border-border/40">
                    <div className="w-12 h-12 rounded-lg bg-surface-hover/70 flex items-center justify-center text-primary text-xl">
                        <FontAwesomeIcon icon={joinedCommunities.length === 0 ? faCompass : faInbox} />
                    </div>

                    <div className="flex flex-col gap-1 max-w-sm">
                        <p className="font-extrabold text-text text-sm">
                            {joinedCommunities.length === 0
                                ? "No communities joined yet"
                                : activeCommunityFilter
                                ? "No posts in this community yet"
                                : "No recent posts from your communities"}
                        </p>
                        <p className="text-text-muted text-xs leading-relaxed">
                            {joinedCommunities.length === 0
                                ? "Your home feed delivers discussions and guides from the game communities you follow. Explore and join communities to get started!"
                                : "Be the first to start the conversation or check back soon."}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <button
                            type="button"
                            onClick={() => navigate({ to: "/community" })}
                            className="px-4 py-1.5 rounded bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-2"
                        >
                            <FontAwesomeIcon icon={faCompass} />
                            <span>Explore Communities</span>
                        </button>
                        {activeCommunityFilter && (
                            <button
                                type="button"
                                onClick={() => setActiveCommunityFilter(null)}
                                className="px-3 py-1.5 rounded bg-surface-hover hover:bg-surface-hover/80 text-text text-xs font-semibold transition-colors cursor-pointer"
                            >
                                View All
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
