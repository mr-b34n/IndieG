import { useEffect, useRef, useState } from "react"
import { faInbox, faSpinner, faCircleCheck } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useTranslation } from "@/shared/hooks/useTranslate"

import { DEFAULT_AVATAR as avatarGame } from "@/shared/constants/images";
import { prepareAttachmentsForSave } from "@/features/post/helpers/postAttachments";
import { useAuthStore } from "@/features/auth";
import { getCurrentAuthor, Post, usePostsStore, type PostData } from "@/features/post";

import { useCommunitiesStore } from "@/features/community";
import { CreatePostBox, type CreatePostPayload } from "./CreatePostBox";
import { type PostDataWithSettings } from "../types";

export const FeedList = () => {
    const { t } = useTranslation();
    const user = useAuthStore((state) => state.user);
    const mockLogin = useAuthStore((state) => state.mockLogin);
    const isLoggedIn = !!user || mockLogin;

    const posts = usePostsStore((state) => state.posts);
    const addPost = usePostsStore((state) => state.addPost);
    const updatePost = usePostsStore((state) => state.updatePost);
    const deletePost = usePostsStore((state) => state.deletePost);

    const [hiddenAuthors, setHiddenAuthors] = useState<string[]>([]);
    const [displayLimit, setDisplayLimit] = useState(4);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const sentinelRef = useRef<HTMLDivElement>(null);
    const currentAuthor = getCurrentAuthor();
    const getCommunityById = useCommunitiesStore((state) => state.getCommunityById);

    const handleCreatePost = async ({ title, content, attachments, privacy, tags, allowComments, pinned, communityId }: CreatePostPayload) => {
        const { images, files } = await prepareAttachmentsForSave(attachments);
        const community = getCommunityById(communityId);

        const newPost: PostDataWithSettings = {
            id: Date.now(),
            author: currentAuthor,
            authorAvatar: avatarGame,
            gameTag: community?.name ?? "General",
            timeAgo: t('feed.justNow'),
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
        addPost(newPost);
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

    const filteredPosts = posts
        .filter((p) => !hiddenAuthors.includes(p.author))
        .slice()
        .sort((a, b) => Number(!!(b as PostDataWithSettings).pinned) - Number(!!(a as PostDataWithSettings).pinned));

    const displayedPosts = filteredPosts.slice(0, displayLimit);
    const hasMore = displayLimit < filteredPosts.length;

    useEffect(() => {
        if (!hasMore || isLoadingMore) return;
        const el = sentinelRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
                    setIsLoadingMore(true);
                    setTimeout(() => {
                        setDisplayLimit((prev) => prev + 3);
                        setIsLoadingMore(false);
                    }, 500);
                }
            },
            { threshold: 0.1, rootMargin: "150px" }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [hasMore, isLoadingMore]);

    return (
        <div className="w-full flex flex-col gap-3">
            {isLoggedIn && <CreatePostBox onPost={handleCreatePost} />}

            {displayedPosts.length > 0 ? (
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

                    <div ref={sentinelRef} className="w-full py-4 flex flex-col items-center justify-center gap-2">
                        {isLoadingMore && (
                            <div className="flex items-center gap-2.5 px-5 py-2.5 bg-surface/90 border border-border rounded-full shadow-sm text-sm font-semibold text-primary animate-pulse">
                                <FontAwesomeIcon icon={faSpinner} className="animate-spin text-base" />
                                <span>{t('feed.loadingMore')}</span>
                            </div>
                        )}
                        {!isLoadingMore && hasMore && (
                            <button
                                type="button"
                                onClick={() => {
                                    setIsLoadingMore(true);
                                    setTimeout(() => {
                                        setDisplayLimit((prev) => prev + 3);
                                        setIsLoadingMore(false);
                                    }, 400);
                                }}
                                className="px-5 py-2 text-xs font-semibold text-text-muted hover:text-text bg-surface-hover hover:bg-border/60 border border-border rounded-full transition-all"
                            >
                                {t('feed.loadMoreCount', { count: filteredPosts.length - displayLimit })}
                            </button>
                        )}
                        {!hasMore && filteredPosts.length > 4 && (
                            <div className="flex items-center gap-2 text-xs text-text-faint py-3 font-medium bg-surface/50 border border-border/50 rounded-xl px-4">
                                <FontAwesomeIcon icon={faCircleCheck} className="text-primary" />
                                <span>{t('feed.allLoaded')}</span>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="
                    w-full flex flex-col items-center justify-center gap-2 p-10
                    bg-surface/90 backdrop-blur-md border border-border rounded-2xl
                    text-text-muted text-sm
                ">
                    <FontAwesomeIcon icon={faInbox} className="text-2xl text-text-faint mb-1" />
                    <p className="font-semibold text-text">{t('feed.emptyTitle')}</p>
                    <p className="text-text-faint text-center">{t('feed.emptyDesc')}</p>
                </div>
            )}
        </div>
    );
}