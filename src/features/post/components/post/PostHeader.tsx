import React, { memo } from "react";
import { AppIcon as FontAwesomeIcon, type AppIconComponent as IconDefinition } from "@/shared/components/ui/Icon";
import { Chat as faComment, DotsThree as faEllipsis, EyeSlash as faEyeSlash, Flag as faFlag, Trash as faTrash, Pen as faPen, ChatSlash as faCommentSlash, PushPin as faThumbtack, Warning as faTriangleExclamation } from "@phosphor-icons/react";
import { formatTimeAgo } from "@/shared/utils/formatTimeAgo";
import { UserAvatar } from "@/shared/components/ui/UserAvatar";

export interface PostHeaderProps {
    authorName: string;
    authorUsername?: string;
    authorAvatar?: string;
    badge?: {
        label: string;
        classes: string;
        icon: IconDefinition;
    } | null;
    authorBadge?: string;
    gameBadge?: string;
    postCommunity?: {
        id: string | number;
        name: string;
        logo?: string;
        avatar?: string;
        backdrop?: string;
    } | null;
    gameTag?: string;
    timeAgo: string;
    onAuthorClick: (e: React.MouseEvent) => void;
    onCommunityClick?: (e: React.MouseEvent) => void;
    isOwner: boolean;
    showActionMenu: boolean;
    setShowActionMenu: React.Dispatch<React.SetStateAction<boolean>>;
    setShowShareMenu: React.Dispatch<React.SetStateAction<boolean>>;
    handleEdit: (e: React.MouseEvent) => void;
    handleDelete: (e: React.MouseEvent) => void;
    handleReport: (e: React.MouseEvent) => void;
    allowComments?: boolean;
    onToggleAllowComments?: (e: React.MouseEvent) => void;
    isSpoiler?: boolean;
    onToggleSpoiler?: (e: React.MouseEvent) => void;
    isNsfw?: boolean;
    onToggleNsfw?: (e: React.MouseEvent) => void;
    pinned?: boolean;
    onTogglePin?: (e: React.MouseEvent) => void;
    t: (key: string, options?: Record<string, unknown>) => string;
    language: string;
}

export const PostHeader = memo(({
    authorName,
    authorUsername,
    authorAvatar,
    postCommunity,
    gameTag: _gameTag,
    timeAgo,
    onAuthorClick,
    onCommunityClick,
    isOwner,
    showActionMenu,
    setShowActionMenu,
    setShowShareMenu,
    handleEdit,
    handleDelete,
    handleReport,
    allowComments = true,
    onToggleAllowComments,
    isSpoiler = false,
    onToggleSpoiler,
    isNsfw = false,
    onToggleNsfw,
    pinned = false,
    onTogglePin,
    t,
    language: _language,
}: PostHeaderProps) => {
    return (
        <div className="flex flex-row items-center justify-between gap-3 mb-3">
            <div className="flex flex-row items-center gap-3 min-w-0">
                {/* Avatar: 40x40 */}
                <div
                    className="relative shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={onAuthorClick}
                >
                    <UserAvatar
                        src={authorAvatar}
                        name={authorName || authorUsername}
                        className="w-10 h-10 ring-1 ring-border/80"
                        textClassName="text-sm"
                    />
                </div>

                {/* Author Information */}
                <div className="flex flex-col min-w-0 leading-tight">
                    {/* Line 1: Name & Community */}
                    <div className="flex flex-row items-center gap-1.5 flex-wrap">
                        <span
                            onClick={onAuthorClick}
                            className="text-[14px] sm:text-[15px] font-semibold text-text hover:underline cursor-pointer truncate"
                        >
                            {authorName}
                        </span>

                        {postCommunity && (
                            <>
                                <span className="text-text-muted text-xs select-none">·</span>
                                <span
                                    onClick={onCommunityClick}
                                    title={postCommunity.name}
                                    className="text-xs sm:text-[13px] text-text-muted hover:text-primary transition-colors cursor-pointer font-medium truncate flex items-center gap-1.5 max-w-[200px]"
                                >
                                    {postCommunity.logo ? (
                                        <img
                                            src={postCommunity.logo}
                                            alt={postCommunity.name}
                                            loading="lazy"
                                            decoding="async"
                                            className="w-3.5 h-3.5 rounded-[4px] object-cover shrink-0 ring-1 ring-white/10"
                                            onError={(e) => {
                                                (e.currentTarget as HTMLImageElement).style.display = "none";
                                            }}
                                        />
                                    ) : (
                                        <span className="w-3.5 h-3.5 rounded-[4px] bg-primary/20 text-primary flex items-center justify-center font-bold text-[9px] shrink-0">
                                            {postCommunity.name?.charAt(0)?.toUpperCase() || "C"}
                                        </span>
                                    )}
                                    <span className="truncate">{postCommunity.name}</span>
                                </span>
                            </>
                        )}
                    </div>

                    {/* Line 2: @username · Time */}
                    <div className="flex flex-row items-center gap-1.5 text-xs sm:text-[13px] text-text-muted mt-0.5 flex-wrap">
                        {authorUsername && (
                            <span
                                onClick={onAuthorClick}
                                className="hover:underline cursor-pointer truncate"
                            >
                                @{authorUsername.replace(/^@/, "")}
                            </span>
                        )}

                        {authorUsername && <span className="select-none">·</span>}
                        <span className="text-xs text-text-muted shrink-0">{formatTimeAgo(timeAgo, t)}</span>
                    </div>
                </div>
            </div>

            {/* More button: 32x32 */}
            <div className="relative shrink-0">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowActionMenu((prev) => !prev);
                        setShowShareMenu(false);
                    }}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-hover/70 transition-colors cursor-pointer"
                    aria-label="More options"
                >
                    <FontAwesomeIcon icon={faEllipsis} className="text-xs" />
                </button>

                {showActionMenu && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowActionMenu(false);
                            }}
                        />
                        <div
                            className="absolute right-0 top-full mt-1 w-52 sm:w-56 bg-surface border border-border/80 rounded-xl shadow-xl z-50 overflow-hidden animate-dropdown py-1 text-xs"
                        >
                            {isOwner ? (
                                <>
                                    <button
                                        onClick={handleEdit}
                                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-text-muted hover:bg-surface-hover hover:text-text transition-colors text-left cursor-pointer font-medium"
                                    >
                                        <FontAwesomeIcon icon={faPen} className="w-3.5 text-text-faint" />
                                        <span>{t('post.edit')}</span>
                                    </button>

                                    <div className="h-px bg-border/50 my-1" />

                                    {/* Quick Setting: Allow Comments */}
                                    {onToggleAllowComments && (
                                        <button
                                            onClick={onToggleAllowComments}
                                            className="w-full flex items-center justify-between px-3.5 py-2 text-text-muted hover:bg-surface-hover hover:text-text transition-colors text-left cursor-pointer"
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <FontAwesomeIcon
                                                    icon={allowComments ? faCommentSlash : faComment}
                                                    className={`w-3.5 ${allowComments ? "text-text-faint" : "text-primary"}`}
                                                />
                                                <span className="truncate">
                                                    {allowComments
                                                        ? t('post.disableComments', { defaultValue: 'Tắt tính năng bình luận' })
                                                        : t('post.enableComments', { defaultValue: 'Bật tính năng bình luận' })}
                                                </span>
                                            </div>
                                            {!allowComments && (
                                                <span className="text-[10px] bg-rose-500/15 text-rose-400 font-bold px-1.5 py-0.5 rounded ml-1 shrink-0">
                                                    {t('post.disabled', { defaultValue: 'Đã tắt' })}
                                                </span>
                                            )}
                                        </button>
                                    )}

                                    {/* Quick Setting: Spoiler */}
                                    {onToggleSpoiler && (
                                        <button
                                            onClick={onToggleSpoiler}
                                            className="w-full flex items-center justify-between px-3.5 py-2 text-text-muted hover:bg-surface-hover hover:text-text transition-colors text-left cursor-pointer"
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <FontAwesomeIcon
                                                    icon={faEyeSlash}
                                                    className={`w-3.5 ${isSpoiler ? "text-amber-400" : "text-text-faint"}`}
                                                />
                                                <span className="truncate">
                                                    {isSpoiler
                                                        ? t('post.unmarkSpoiler', { defaultValue: 'Bỏ cảnh báo Spoiler' })
                                                        : t('post.markSpoiler', { defaultValue: 'Đánh dấu Spoiler' })}
                                                </span>
                                            </div>
                                            {isSpoiler && (
                                                <span className="text-[10px] bg-amber-500/15 text-amber-400 font-bold px-1.5 py-0.5 rounded ml-1 shrink-0">
                                                    Spoiler
                                                </span>
                                            )}
                                        </button>
                                    )}

                                    {/* Quick Setting: NSFW */}
                                    {onToggleNsfw && (
                                        <button
                                            onClick={onToggleNsfw}
                                            className="w-full flex items-center justify-between px-3.5 py-2 text-text-muted hover:bg-surface-hover hover:text-text transition-colors text-left cursor-pointer"
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <FontAwesomeIcon
                                                    icon={faTriangleExclamation}
                                                    className={`w-3.5 ${isNsfw ? "text-rose-400" : "text-text-faint"}`}
                                                />
                                                <span className="truncate">
                                                    {isNsfw
                                                        ? t('post.unmarkNsfw', { defaultValue: 'Bỏ cảnh báo 18+ (NSFW)' })
                                                        : t('post.markNsfw', { defaultValue: 'Đánh dấu 18+ (NSFW)' })}
                                                </span>
                                            </div>
                                            {isNsfw && (
                                                <span className="text-[10px] bg-rose-500/15 text-rose-400 font-bold px-1.5 py-0.5 rounded ml-1 shrink-0">
                                                    18+
                                                </span>
                                            )}
                                        </button>
                                    )}

                                    {/* Quick Setting: Pin */}
                                    {onTogglePin && (
                                        <button
                                            onClick={onTogglePin}
                                            className="w-full flex items-center justify-between px-3.5 py-2 text-text-muted hover:bg-surface-hover hover:text-text transition-colors text-left cursor-pointer"
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <FontAwesomeIcon
                                                    icon={faThumbtack}
                                                    className={`w-3.5 ${pinned ? "text-primary" : "text-text-faint"}`}
                                                />
                                                <span className="truncate">
                                                    {pinned
                                                        ? t('post.unpin', { defaultValue: 'Bỏ ghim bài viết' })
                                                        : t('post.pin', { defaultValue: 'Ghim bài viết' })}
                                                </span>
                                            </div>
                                            {pinned && (
                                                <span className="text-[10px] bg-primary/15 text-primary font-bold px-1.5 py-0.5 rounded ml-1 shrink-0">
                                                    {t('post.pinned', { defaultValue: 'Đã ghim' })}
                                                </span>
                                            )}
                                        </button>
                                    )}

                                    <div className="h-px bg-border/50 my-1" />

                                    <button
                                        onClick={handleDelete}
                                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-rose-500 hover:bg-surface-hover transition-colors text-left font-medium cursor-pointer"
                                    >
                                        <FontAwesomeIcon icon={faTrash} className="w-3.5" />
                                        <span>{t('post.delete')}</span>
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={handleReport}
                                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-text-muted hover:text-rose-500 hover:bg-surface-hover transition-colors text-left cursor-pointer font-medium"
                                >
                                    <FontAwesomeIcon icon={faFlag} className="w-3.5" />
                                    <span>{t('post.report')}</span>
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
});
