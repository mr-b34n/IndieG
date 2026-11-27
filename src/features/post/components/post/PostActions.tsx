import React, { memo } from "react";
import { AppIcon as FontAwesomeIcon } from "@/shared/components/ui/Icon";
import { Chat as faComment, BookmarkSimple as faBookmarkOutline, BookmarkSimple as faBookmarkSolid, CaretUp as faCaretUp, CaretDown as faCaretDown, Link as faLink, Lock as faLock, ArrowSquareOut as faArrowUpRightFromSquare } from "@phosphor-icons/react";
import { TwitterBrandIcon as faTwitter, FacebookBrandIcon as faFacebook } from "@/shared/components/ui/BrandIcons";

export interface PostActionsProps {
    score: number;
    isLiked: boolean;
    isDownvoted: boolean;
    onLike: (e: React.MouseEvent) => void;
    onDownvote: (e: React.MouseEvent) => void;
    commentsCount: number;
    allowComments?: boolean;
    onCommentClick: (e: React.MouseEvent) => void;
    showShareMenu: boolean;
    setShowShareMenu: React.Dispatch<React.SetStateAction<boolean>>;
    handleCopyLink: (e: React.MouseEvent) => void;
    handleShareX: (e: React.MouseEvent) => void;
    handleShareFacebook: (e: React.MouseEvent) => void;
    linkCopied: boolean;
    bookmarked: boolean;
    onToggleBookmark: (e: React.MouseEvent) => void;
    t: (key: string, options?: Record<string, unknown>) => string;
}

export const PostActions = memo(({
    score,
    isLiked,
    isDownvoted,
    onLike,
    onDownvote,
    commentsCount,
    allowComments = true,
    onCommentClick,
    showShareMenu,
    setShowShareMenu,
    handleCopyLink,
    handleShareX,
    handleShareFacebook,
    linkCopied,
    bookmarked,
    onToggleBookmark,
    t,
}: PostActionsProps) => {
    return (
        <div className="flex flex-row items-center gap-3 sm:gap-5 text-[13px] sm:text-[14px] text-text-muted">
            {/* Vote Capsule: [up] (score) [down] */}
            <div className="flex flex-row items-center rounded-full bg-surface-hover/40 border border-border/40 hover:border-border/70 transition-colors p-0.5">
                <button
                    onClick={onLike}
                    className={`w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                        isLiked
                            ? "text-primary bg-primary/10 scale-105"
                            : "text-text-muted hover:text-text hover:bg-surface-hover/60"
                    }`}
                    title={isLiked ? t('post.unupvote', { defaultValue: "Bỏ upvote" }) : t('post.upvote', { defaultValue: "Upvote" })}
                    aria-label={t('post.upvote', { defaultValue: "Upvote" })}
                >
                    <FontAwesomeIcon icon={faCaretUp} className="text-base sm:text-lg" />
                </button>

                <span
                    className={`text-xs sm:text-[13px] font-semibold px-1.5 min-w-[1.5rem] text-center select-none transition-colors ${
                        isLiked
                            ? "text-primary font-bold"
                            : isDownvoted
                            ? "text-rose-500 font-bold"
                            : "text-text-muted"
                    }`}
                >
                    {score}
                </span>

                <button
                    onClick={onDownvote}
                    className={`w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                        isDownvoted
                            ? "text-rose-500 bg-rose-500/10 scale-105"
                            : "text-text-muted hover:text-text hover:bg-surface-hover/60"
                    }`}
                    title={isDownvoted ? t('post.undownvote', { defaultValue: "Bỏ downvote" }) : t('post.downvote', { defaultValue: "Downvote" })}
                    aria-label={t('post.downvote', { defaultValue: "Downvote" })}
                >
                    <FontAwesomeIcon icon={faCaretDown} className="text-base sm:text-lg" />
                </button>
            </div>

            {/* Comment Button: 💬 24 */}
            {allowComments === false ? (
                <div
                    className="flex flex-row items-center gap-1.5 text-text-faint cursor-not-allowed text-xs sm:text-[13px] px-2 py-1"
                    title={t('post.commentsDisabledTitle')}
                >
                    <FontAwesomeIcon icon={faLock} className="text-xs" />
                    <span>{t('post.commentsDisabled')}</span>
                </div>
            ) : (
                <button
                    onClick={onCommentClick}
                    className="h-8 sm:h-9 px-2.5 rounded-full hover:bg-surface-hover/60 flex items-center gap-1.5 font-semibold text-text-muted hover:text-text transition-colors cursor-pointer text-xs sm:text-[13px]"
                    title={t('post.comment', { defaultValue: "Bình luận" })}
                >
                    <FontAwesomeIcon icon={faComment} className="text-sm sm:text-base text-text-muted" />
                    <span>{commentsCount}</span>
                </button>
            )}

            {/* Share Button: ↗ */}
            <div className="relative">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowShareMenu((prev) => !prev);
                    }}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full hover:bg-surface-hover/60 flex items-center justify-center font-semibold text-text-muted hover:text-text transition-colors cursor-pointer text-xs sm:text-[13px]"
                    title={t('post.share')}
                    aria-label="Share"
                >
                    <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-sm" />
                </button>

                {showShareMenu && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowShareMenu(false);
                            }}
                        />
                        <div
                            className="absolute left-0 bottom-full mb-1 w-44 bg-surface border border-border/80 rounded-xl shadow-xl z-50 overflow-hidden animate-popover origin-bottom-left py-1"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={handleCopyLink}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-text-muted hover:bg-surface-hover hover:text-text transition-colors text-left cursor-pointer"
                            >
                                <FontAwesomeIcon icon={faLink} className="w-3.5" />
                                {linkCopied ? t('post.copied') : t('post.copyLink')}
                            </button>
                            <button
                                onClick={handleShareX}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-text-muted hover:bg-surface-hover hover:text-text transition-colors text-left cursor-pointer"
                            >
                                <FontAwesomeIcon icon={faTwitter} className="w-3.5 text-[#1DA1F2]" />
                                {t('post.shareX')}
                            </button>
                            <button
                                onClick={handleShareFacebook}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-text-muted hover:bg-surface-hover hover:text-text transition-colors text-left cursor-pointer"
                            >
                                <FontAwesomeIcon icon={faFacebook} className="w-3.5 text-[#1877F2]" />
                                {t('post.shareFB')}
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Bookmark Button: 🔖 */}
            <button
                onClick={onToggleBookmark}
                className={`ml-auto w-8 h-8 sm:w-9 sm:h-9 rounded-full hover:bg-surface-hover/60 flex items-center justify-center transition-colors cursor-pointer ${
                    bookmarked
                        ? "text-primary font-bold"
                        : "text-text-faint hover:text-text"
                }`}
                title={bookmarked ? t('post.saved') : t('post.save')}
                aria-label="Bookmark"
            >
                <FontAwesomeIcon icon={bookmarked ? faBookmarkSolid : faBookmarkOutline} className="text-sm" />
            </button>
        </div>
    );
});
