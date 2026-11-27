import React, { useState, useEffect, memo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { Lightbox } from "@/shared/components/ui/Lightbox";
import { ReportModal } from "@/features/report";
import { useBookmarksStore } from "@/features/bookmark";
import { EditPostModal } from "./EditPostModal";
import { useCommunitiesStore } from "@/features/community";
import { getCurrentAuthor } from "../helpers/getCurrentAuthor";
import { useTranslation } from "@/shared/hooks/useTranslate";
import { type PostFileAttachment, type PostData } from "../types";
import { useBookmarkInteraction } from "../api/interaction-api";
import { useFeedNavigationStore } from "../store/useFeedNavigationStore";
import { usePostVote } from "../hooks/usePostVote";
import { usePostOperations } from "../hooks/usePostOperations";
import {
    PostHeader,
    type PostHeaderProps,
    PostTitle,
    type PostTitleProps,
    PostContent,
    type PostContentProps,
    PostMedia,
    type PostMediaProps,
    PostTags,
    type PostTagsProps,
    PostActions,
    type PostActionsProps,
} from "./post";

export type { PostData, PostFileAttachment };
export {
    PostHeader,
    type PostHeaderProps,
    PostTitle,
    type PostTitleProps,
    PostContent,
    type PostContentProps,
    PostMedia,
    type PostMediaProps,
    PostTags,
    type PostTagsProps,
    PostActions,
    type PostActionsProps,
};

export interface PostProps {
    post: PostData;
    isOwner?: boolean;
    onDelete?: (id: string | number) => void;
    onEdit?: (
        id: string | number,
        data: Partial<PostData>
    ) => void;
    onUnfollowAuthor?: (author: string) => void;
    isDetailView?: boolean;
    hideCommunity?: boolean;
}

/* =========================================================================
   Main Post Component (Orchestrator Container)
   ========================================================================= */
const PostComponent = ({
    post,
    isOwner: explicitIsOwner,
    onDelete,
    onEdit,
    isDetailView = false,
    hideCommunity = false,
}: PostProps) => {
    const { t, language } = useTranslation();
    const user = useAuthStore((state) => state.user);
    const isLoggedIn = !!user;

    const isStoredBookmarked = useBookmarksStore((state) => state.isBookmarked(post.id));
    const bookmarked = typeof (post as { isBookmarked?: boolean }).isBookmarked === "boolean"
        ? ((post as { isBookmarked?: boolean }).isBookmarked || isStoredBookmarked)
        : isStoredBookmarked;
    const toggleBookmark = useBookmarksStore((state) => state.toggleBookmark);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const [showActionMenu, setShowActionMenu] = useState(false);
    const [showShareMenu, setShowShareMenu] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);
    const [isRevealed, setIsRevealed] = useState(!(post.isSpoiler || post.isNsfw));
    const [isContentExpanded, setIsContentExpanded] = useState(isDetailView);

    const getCommunityById = useCommunitiesStore((state) => state.getCommunityById);
    const postCommunity = post.community
        || (post.communityId ? getCommunityById(post.communityId) : null)
        || (post.communityName ? { id: post.communityId || "", name: post.communityName } : null)
        || (post.gameTag ? { id: post.communityId || "", name: post.gameTag } : null);

    const { score, isLiked, isDownvoted, handleLike, handleDownvote } = usePostVote({ post, onEdit });

    const {
        handleDelete,
        handleEdit,
        handleSaveEdit,
        handleToggleAllowComments,
        handleToggleSpoiler,
        handleToggleNsfw,
        handleTogglePin,
    } = usePostOperations({
        post,
        onDelete,
        onEdit,
        setShowActionMenu,
        setShowEditModal,
    });

    const navigate = useNavigate();
    const bookmarkMutation = useBookmarkInteraction(post.id);
    const requireVerifiedEmail = useAuthStore((state) => state.requireVerifiedEmail);

    const isFocused = useFeedNavigationStore(
        (state) => state.focusedPostId !== null && String(state.focusedPostId) === String(post.id)
    );
    const setFocusedPostId = useFeedNavigationStore((state) => state.setFocusedPostId);
    const registerPostActions = useFeedNavigationStore((state) => state.registerPostActions);

    const handleToggleBookmark = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isLoggedIn) {
            navigate({ to: "/auth" });
            return;
        }
        if (!requireVerifiedEmail("lưu bài viết")) return;

        const nextBookmarked = !bookmarked;
        toggleBookmark(post.id);
        try {
            await bookmarkMutation.mutateAsync(nextBookmarked);
        } catch {
            toggleBookmark(post.id);
        }
    };

    const postUrl = typeof window !== "undefined" ? `${window.location.origin}/post/${post.id}` : "";

    const authorObj = typeof post.author === "object" && post.author !== null ? post.author : null;
    const authorName = authorObj?.name || (authorObj as { displayName?: string })?.displayName || authorObj?.username || (typeof post.author === "string" ? post.author : t('community.roleMember', { defaultValue: "Thành viên" }));
    const authorUsername = authorObj?.username || (typeof post.author === "object" ? (post.author as { handle?: string })?.handle : undefined);
    const authorAvatar = authorObj ? (authorObj.avatar || authorObj.avatarUrl || post.authorAvatar) : post.authorAvatar;
    const myAuthorName = getCurrentAuthor();

    const userDisplayName = (user as { displayName?: string })?.displayName || user?.name;
    const isMe = Boolean(
        user && (
            (authorObj?.id && String(authorObj.id) === String(user.id)) ||
            (authorUsername && user.username && authorUsername.replace(/^@/, "").toLowerCase() === user.username.replace(/^@/, "").toLowerCase()) ||
            (authorName && userDisplayName && authorName.toLowerCase() === userDisplayName.toLowerCase()) ||
            (authorName && user.username && authorName.toLowerCase() === user.username.toLowerCase()) ||
            (authorName && authorName === myAuthorName) ||
            (authorUsername && authorUsername === myAuthorName)
        )
    );
    const isOwner = explicitIsOwner !== undefined ? explicitIsOwner : isMe;

    const handleNavigate = () => {
        if (isDetailView) return;
        if (typeof window !== "undefined") {
            const container = document.querySelector('[data-scroll-container]') as HTMLElement | null;
            if (container && container.scrollTop > 0) {
                sessionStorage.setItem(`scroll_pos_${window.location.pathname}`, String(container.scrollTop));
            }
            sessionStorage.setItem('returning_from_post_id', post.id.toString());
        }
        navigate({ to: '/post/$postId', params: { postId: post.id.toString() } });
    };

    const handleAuthorClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        let targetUserId = "me";
        if (!isMe) {
            if (authorUsername) {
                targetUserId = authorUsername.startsWith("@") ? authorUsername : `@${authorUsername}`;
            } else if (authorObj?.id) {
                targetUserId = authorObj.id;
            } else {
                targetUserId = authorName.startsWith("@") ? authorName : `@${authorName}`;
            }
        }
        navigate({ to: "/profile/$userId", params: { userId: targetUserId } });
    };

    const handleCopyLink = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(postUrl);
            setLinkCopied(true);
            setTimeout(() => {
                setLinkCopied(false);
                setShowShareMenu(false);
            }, 1500);
        } catch {
            setShowShareMenu(false);
        }
    };

    const handleShareX = (e: React.MouseEvent) => {
        e.stopPropagation();
        const text = encodeURIComponent(post.title || "");
        const url = encodeURIComponent(postUrl);
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank", "noopener,noreferrer");
        setShowShareMenu(false);
    };

    const handleShareFacebook = (e: React.MouseEvent) => {
        e.stopPropagation();
        const url = encodeURIComponent(postUrl);
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank", "noopener,noreferrer");
        setShowShareMenu(false);
    };

    useEffect(() => {
        if (!isFocused && !isDetailView) return;
        return registerPostActions(post.id, {
            upvote: () => handleLike({ stopPropagation: () => {} } as React.MouseEvent),
            downvote: () => handleDownvote({ stopPropagation: () => {} } as React.MouseEvent),
            bookmark: () => handleToggleBookmark({ stopPropagation: () => {} } as React.MouseEvent),
            pin: () => handleTogglePin(),
        });
    }, [isFocused, isDetailView, post.id, handleLike, handleDownvote, handleToggleBookmark, post.pinned, authorName, authorUsername]);

    return (
        <article
            id={`post-article-${post.id}`}
            onClick={() => {
                setFocusedPostId(post.id);
                handleNavigate();
            }}
            className={`
                w-full border-none transition-all duration-150
                ${(showActionMenu || showShareMenu) ? "!overflow-visible z-[100]" : "z-0"}
                ${!isDetailView && !showActionMenu && !showShareMenu ? "[content-visibility:auto] [contain-intrinsic-size:auto_360px]" : ""}
                ${isFocused && !isDetailView ? "ring-2 ring-primary/60 shadow-lg rounded-[14px]" : ""}
                ${isDetailView 
                    ? "py-4 pb-5 mb-0 relative" 
                    : "cursor-pointer group px-3.5 sm:px-4 py-4 relative"
                }
            `}
        >
            {/* Hover Background Layer (scales up smoothly on hover like YouTube cards) */}
            {!isDetailView && (
                <div className="absolute inset-0 pointer-events-none rounded-[12px] sm:rounded-[16px] bg-black/[0.06] dark:bg-white/[0.08] opacity-0 scale-95 transition-all duration-200 ease-out group-hover:opacity-100 group-hover:scale-100 motion-reduce:transition-opacity motion-reduce:group-hover:scale-95 z-0" />
            )}

            <div className="relative z-10 w-full flex flex-col">
                {/* 1. Header (Avatar 40x40, Name, Community, @username, Time, More 32x32) */}
                <PostHeader
                    authorName={authorName}
                    authorUsername={authorUsername}
                    authorAvatar={authorAvatar}
                    postCommunity={hideCommunity ? undefined : postCommunity}
                    gameTag={post.gameTag}
                    timeAgo={post.timeAgo || ""}
                    onAuthorClick={handleAuthorClick}
                    onCommunityClick={(e) => {
                        e?.stopPropagation();
                        const targetId = postCommunity?.id || post.communityId;
                        if (targetId) {
                            navigate({ to: `/community/${targetId}` });
                        }
                    }}
                    isOwner={isOwner}
                    showActionMenu={showActionMenu}
                    setShowActionMenu={setShowActionMenu}
                    setShowShareMenu={setShowShareMenu}
                    handleEdit={handleEdit}
                    handleDelete={handleDelete}
                    handleReport={(e) => {
                        e.stopPropagation();
                        setShowActionMenu(false);
                        setShowReportModal(true);
                    }}
                    allowComments={post.allowComments !== false}
                    onToggleAllowComments={handleToggleAllowComments}
                    isSpoiler={post.isSpoiler}
                    onToggleSpoiler={handleToggleSpoiler}
                    isNsfw={post.isNsfw}
                    onToggleNsfw={handleToggleNsfw}
                    pinned={post.pinned}
                    onTogglePin={handleTogglePin}
                    t={t}
                    language={language}
                />

                {/* 2. Title (18–20px / 700 / max 2 lines) */}
                <PostTitle
                    title={post.title}
                    isDetailView={isDetailView}
                    isSpoiler={post.isSpoiler}
                    isNsfw={post.isNsfw}
                />

                {/* 3. Content (14–15px / 1.5 leading / max 3–5 lines / ...more) */}
                <PostContent
                    content={post.content}
                    isDetailView={isDetailView}
                    isExpanded={isContentExpanded}
                    onExpand={(e) => {
                        e.stopPropagation();
                        setIsContentExpanded(true);
                    }}
                    onCollapse={(e) => {
                        e.stopPropagation();
                        setIsContentExpanded(false);
                    }}
                />

                {/* 4. Media (1 ảnh full width, 2 ảnh 50/50, 3+ gallery, radius 8–10px) */}
                <PostMedia
                    images={post.images}
                    files={post.files}
                    isSpoiler={post.isSpoiler}
                    isNsfw={post.isNsfw}
                    isRevealed={isRevealed}
                    onRevealWarning={(e) => {
                        e.stopPropagation();
                        setIsRevealed(true);
                    }}
                    onImageClick={setLightboxIndex}
                    t={t}
                />

                {/* 5. Tags (#CS2 #Clutch #Premier / 12px / accent color / max 3–5 tags) */}
                <PostTags
                    tags={post.tags}
                    onTagClick={(tag) => {
                        navigate({ to: `/search?q=${encodeURIComponent(tag)}` });
                    }}
                />

                {/* 6. Actions ([↑] (score) [↓]   💬 24   ↗   🔖) */}
                <PostActions
                    score={score}
                    isLiked={isLiked}
                    isDownvoted={isDownvoted}
                    onLike={handleLike}
                    onDownvote={handleDownvote}
                    commentsCount={post.comments ?? 0}
                    allowComments={post.allowComments}
                    onCommentClick={(e) => {
                        e.stopPropagation();
                        if (!isDetailView) handleNavigate();
                    }}
                    showShareMenu={showShareMenu}
                    setShowShareMenu={setShowShareMenu}
                    handleCopyLink={handleCopyLink}
                    handleShareX={handleShareX}
                    handleShareFacebook={handleShareFacebook}
                    linkCopied={linkCopied}
                    bookmarked={bookmarked}
                    onToggleBookmark={handleToggleBookmark}
                    t={t}
                />
            </div>

            {lightboxIndex !== null && post.images && (
                <Lightbox
                    images={post.images}
                    initialIndex={lightboxIndex}
                    onClose={() => setLightboxIndex(null)}
                />
            )}

            {showReportModal && (
                <ReportModal
                    postId={post.id}
                    author={authorName}
                    onClose={() => setShowReportModal(false)}
                />
            )}

            {showEditModal && (
                <EditPostModal
                    initialTitle={post.title}
                    initialContent={post.content}
                    initialAttachments={post}
                    initialPrivacy={post.privacy}
                    initialAllowComments={post.allowComments !== false}
                    initialPinned={post.pinned ?? false}
                    initialSpoiler={post.isSpoiler ?? false}
                    initialNsfw={post.isNsfw ?? false}
                    onClose={() => setShowEditModal(false)}
                    onSave={handleSaveEdit}
                />
            )}
        </article>
    );
};

export const Post = memo(PostComponent);
