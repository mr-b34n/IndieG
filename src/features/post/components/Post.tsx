import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
    faComment,
    faBookmark as faBookmarkOutline,
} from "@fortawesome/free-regular-svg-icons";
import {
    faBookmark as faBookmarkSolid,
    faCaretUp,
    faCaretDown,
    faEllipsis,
    faEyeSlash,
    faFlag,
    faLink,
    faTrash,
    faPen,
    faFile,
    faDownload,
    faLock,
    faArrowUpRightFromSquare,
} from "@fortawesome/free-solid-svg-icons";
import { faTwitter, faFacebook } from "@fortawesome/free-brands-svg-icons";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "@/features/auth";
import { formatFileSize } from "../helpers/postAttachmentLimits";
import { Lightbox } from "@/shared/components/ui/Lightbox";
import { ReportModal } from "@/features/report";
import { useBookmarksStore } from "@/features/bookmark";
import { EditPostModal } from "./EditPostModal";
import { getRankLabel, getRankConfigIfPresent, type UserRankConfig } from "../helpers/userRanks";
import { useCommunitiesStore } from "@/features/community";
import { getCurrentAuthor } from "../helpers/getCurrentAuthor";
import { useTranslation } from "@/shared/hooks/useTranslate";
import { formatTimeAgo } from "@/shared/utils/formatTimeAgo";
import { type PostFileAttachment, type PostData } from "../types";
import { getGameBySlug } from "@/features/game";
import { usePostVoteInteraction, useBookmarkInteraction } from "../api/interaction-api";
import { usePostsStore } from "../store/usePostsStore";

export type { PostData, PostFileAttachment };

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
}

/* =========================================================================
   1. PostHeader Component
   [Avatar] Name   [Rank] · Community
            @username · Time       (...)
   ========================================================================= */
export interface PostHeaderProps {
    authorName: string;
    authorUsername?: string;
    authorAvatar?: string;
    rank?: UserRankConfig | null;
    badge?: {
        label: string;
        classes: string;
        icon: IconDefinition;
    } | null;
    authorBadge?: string;
    gameBadge?: string;
    postCommunity?: {
        id: string;
        name: string;
        logo?: string;
        avatar?: string;
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
    t: (key: string, options?: Record<string, unknown>) => string;
    language: string;
}

export const PostHeader = ({
    authorName,
    authorUsername,
    authorAvatar,
    rank,
    postCommunity,
    gameTag,
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
    t,
    language,
}: PostHeaderProps) => {
    return (
        <div className="flex flex-row items-center justify-between gap-3 mb-3">
            <div className="flex flex-row items-center gap-3 min-w-0">
                {/* Avatar: 40x40 */}
                <div
                    className="relative shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={onAuthorClick}
                >
                    {authorAvatar ? (
                        <img
                            src={authorAvatar}
                            alt={authorName}
                            className="w-10 h-10 rounded-full object-cover ring-1 ring-border/80"
                            onError={(e) => {
                                (e.currentTarget as HTMLImageElement).style.display = "none";
                            }}
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-surface-hover ring-1 ring-border/80 flex items-center justify-center text-sm font-bold text-primary uppercase select-none">
                            {(authorName || "G").replace(/^@/, "").charAt(0) || "G"}
                        </div>
                    )}
                    {rank && (
                        <span
                            title={getRankLabel(rank, language)}
                            className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 flex items-center justify-center rounded-full ring-2 ring-bg text-[8px] ${rank.classes}`}
                        >
                            <FontAwesomeIcon icon={rank.icon} />
                        </span>
                    )}
                </div>

                {/* Author Information */}
                <div className="flex flex-col min-w-0 leading-tight">
                    {/* Line 1: Name, Rank & Community */}
                    <div className="flex flex-row items-center gap-1.5 flex-wrap">
                        <span
                            onClick={onAuthorClick}
                            className={`text-[14px] sm:text-[15px] font-semibold text-text hover:underline cursor-pointer truncate ${
                                rank?.textColor || "text-text"
                            }`}
                        >
                            {authorName}
                        </span>

                        {rank && (
                            <span className={`px-1.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider shrink-0 ${rank.classes}`}>
                                {getRankLabel(rank, language)}
                            </span>
                        )}

                        {(postCommunity || gameTag) && (
                            <span className="text-text-muted text-xs select-none">·</span>
                        )}

                        {postCommunity ? (
                            <span
                                onClick={onCommunityClick}
                                className="text-xs sm:text-[13px] text-text-muted hover:text-primary transition-colors cursor-pointer font-medium truncate flex items-center gap-1.5"
                            >
                                {postCommunity.logo && (
                                    <img
                                        src={postCommunity.logo}
                                        alt=""
                                        className="w-3.5 h-3.5 rounded-[4px] object-cover shrink-0"
                                    />
                                )}
                                <span className="truncate">{postCommunity.name}</span>
                            </span>
                        ) : gameTag ? (
                            <span
                                onClick={onCommunityClick}
                                className="text-xs sm:text-[13px] text-text-muted hover:text-primary transition-colors cursor-pointer font-medium truncate"
                            >
                                {gameTag}
                            </span>
                        ) : null}
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
                            className="absolute right-0 top-full mt-1 w-44 bg-surface border border-border/80 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in py-1"
                        >
                            {isOwner ? (
                                <>
                                    <button
                                        onClick={handleEdit}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-text-muted hover:bg-surface-hover hover:text-text transition-colors text-left cursor-pointer"
                                    >
                                        <FontAwesomeIcon icon={faPen} className="w-3.5" />
                                        {t('post.edit')}
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-500 hover:bg-surface-hover transition-colors text-left font-medium border-t border-border/40 cursor-pointer"
                                    >
                                        <FontAwesomeIcon icon={faTrash} className="w-3.5" />
                                        {t('post.delete')}
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={handleReport}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-text-muted hover:text-rose-500 hover:bg-surface-hover transition-colors text-left cursor-pointer"
                                >
                                    <FontAwesomeIcon icon={faFlag} className="w-3.5" />
                                    {t('post.report')}
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

/* =========================================================================
   2. PostTitle Component
   18–20px / 700 / max 2 lines
   ========================================================================= */
export interface PostTitleProps {
    title?: string;
    isDetailView?: boolean;
    isSpoiler?: boolean;
    isNsfw?: boolean;
}

export const PostTitle = ({ title, isDetailView = false, isSpoiler = false, isNsfw = false }: PostTitleProps) => {
    if (!title) return null;

    return (
        <div className="flex items-start gap-2 mb-2 flex-wrap">
            {isNsfw && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-black tracking-wider uppercase bg-rose-500/15 text-rose-400 border border-rose-500/30 shrink-0 self-center">
                    🔞 18+ NSFW
                </span>
            )}
            {isSpoiler && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-black tracking-wider uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0 self-center">
                    SPOILER
                </span>
            )}
            <h2
                className={`text-[18px] sm:text-[20px] font-bold text-text leading-snug tracking-tight break-words flex-1 min-w-0 ${
                    isDetailView ? "" : "line-clamp-2"
                }`}
            >
                {title}
            </h2>
        </div>
    );
};

/* =========================================================================
   3. PostContent Component
   14–15px / line-height: 1.5 / max 3–5 lines trên feed / ...more nếu dài
   ========================================================================= */
export interface PostContentProps {
    content?: string;
    isDetailView?: boolean;
    isExpanded: boolean;
    onExpand: (e: React.MouseEvent) => void;
}

export const PostContent = ({
    content,
    isDetailView = false,
    isExpanded,
    onExpand,
}: PostContentProps) => {
    if (!content) return null;

    const isLong = content.length > 220;

    return (
        <div className="text-[14px] sm:text-[15px] leading-[1.5] text-text/90 font-normal break-words whitespace-pre-line mb-3">
            {isDetailView || isExpanded ? (
                <span>{content}</span>
            ) : (
                <div className="relative">
                    <div className="line-clamp-3">{content}</div>
                    {isLong && (
                        <button
                            type="button"
                            onClick={onExpand}
                            className="block font-semibold text-text hover:underline cursor-pointer mt-1 text-xs sm:text-sm"
                        >
                            ...more
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

/* =========================================================================
   4. PostMedia Component
   1 ảnh: full width, radius 8–10px
   2 ảnh: 50/50 hoặc 70/30
   3+ ảnh: gallery / carousel
   ========================================================================= */
const ImageGallery = ({
    images,
    onImageClick,
}: {
    images: string[];
    onImageClick: (index: number) => void;
}) => {
    if (!images || images.length === 0) return null;

    const count = images.length;

    if (count === 1) {
        return (
            <img
                src={images[0]}
                alt=""
                className="w-full max-h-[520px] object-cover rounded-[8px] cursor-pointer hover:opacity-95 transition-opacity"
                onClick={(e) => {
                    e.stopPropagation();
                    onImageClick(0);
                }}
            />
        );
    }

    if (count === 2) {
        return (
            <div className="grid grid-cols-2 gap-2 aspect-4/3 sm:aspect-video rounded-[8px] overflow-hidden">
                <img
                    src={images[0]}
                    alt=""
                    onClick={(e) => {
                        e.stopPropagation();
                        onImageClick(0);
                    }}
                    className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                />
                <img
                    src={images[1]}
                    alt=""
                    onClick={(e) => {
                        e.stopPropagation();
                        onImageClick(1);
                    }}
                    className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                />
            </div>
        );
    }

    if (count === 3) {
        return (
            <div className="grid grid-cols-2 gap-2 aspect-4/3 sm:aspect-video rounded-[8px] overflow-hidden">
                <img
                    src={images[0]}
                    alt=""
                    onClick={(e) => {
                        e.stopPropagation();
                        onImageClick(0);
                    }}
                    className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                />
                <div className="flex flex-col gap-2 h-full min-h-0">
                    <img
                        src={images[1]}
                        alt=""
                        onClick={(e) => {
                            e.stopPropagation();
                            onImageClick(1);
                        }}
                        className="w-full flex-1 object-cover min-h-0 cursor-pointer hover:opacity-95 transition-opacity"
                    />
                    <img
                        src={images[2]}
                        alt=""
                        onClick={(e) => {
                            e.stopPropagation();
                            onImageClick(2);
                        }}
                        className="w-full flex-1 object-cover min-h-0 cursor-pointer hover:opacity-95 transition-opacity"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-2 aspect-4/3 sm:aspect-video rounded-[8px] overflow-hidden">
            <div className="flex flex-col gap-2 h-full min-h-0">
                <img
                    src={images[0]}
                    alt=""
                    onClick={(e) => {
                        e.stopPropagation();
                        onImageClick(0);
                    }}
                    className="w-full flex-1 object-cover min-h-0 cursor-pointer hover:opacity-95 transition-opacity"
                />
                <img
                    src={images[1]}
                    alt=""
                    onClick={(e) => {
                        e.stopPropagation();
                        onImageClick(1);
                    }}
                    className="w-full flex-1 object-cover min-h-0 cursor-pointer hover:opacity-95 transition-opacity"
                />
            </div>
            <div className="flex flex-col gap-2 h-full min-h-0">
                <img
                    src={images[2]}
                    alt=""
                    onClick={(e) => {
                        e.stopPropagation();
                        onImageClick(2);
                    }}
                    className="w-full flex-1 object-cover min-h-0 cursor-pointer hover:opacity-95 transition-opacity"
                />
                <div
                    className="relative w-full flex-1 min-h-0 cursor-pointer hover:opacity-95 transition-opacity"
                    onClick={(e) => {
                        e.stopPropagation();
                        onImageClick(3);
                    }}
                >
                    <img src={images[3]} alt="" className="w-full h-full object-cover" />
                    {count > 4 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <span className="text-white text-xl font-bold">+{count - 4}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const FileAttachments = ({ files }: { files: PostFileAttachment[] }) => {
    if (!files || files.length === 0) return null;

    return (
        <div className="flex flex-col gap-1.5">
            {files.map((file) => (
                <a
                    key={file.id}
                    href={file.url}
                    download={file.name}
                    onClick={(e) => e.stopPropagation()}
                    className="flex flex-row items-center gap-2.5 px-3 py-2 rounded-[8px] bg-surface-hover/60 hover:bg-surface-hover transition-colors"
                >
                    <FontAwesomeIcon icon={faFile} className="text-primary text-sm shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-text truncate">{file.name}</p>
                        {file.size > 0 && (
                            <p className="text-[10px] text-text-faint">{formatFileSize(file.size)}</p>
                        )}
                    </div>
                    <FontAwesomeIcon icon={faDownload} className="text-text-faint text-xs shrink-0" />
                </a>
            ))}
        </div>
    );
};

export interface PostMediaProps {
    images?: string[];
    files?: PostFileAttachment[];
    isSpoiler?: boolean;
    isNsfw?: boolean;
    isRevealed: boolean;
    onRevealWarning: (e: React.MouseEvent) => void;
    onImageClick: (index: number) => void;
    t: (key: string, options?: Record<string, unknown>) => string;
}

export const PostMedia = ({
    images,
    files,
    isSpoiler = false,
    isNsfw = false,
    isRevealed,
    onRevealWarning,
    onImageClick,
    t,
}: PostMediaProps) => {
    const hasImages = images && images.length > 0;
    const hasFiles = files && files.length > 0;

    if (!hasImages && !hasFiles) return null;

    const hasWarning = isSpoiler || isNsfw;

    return (
        <div className="mb-3 relative">
            {hasWarning && !isRevealed && (
                <div
                    onClick={onRevealWarning}
                    className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-lg rounded-[8px] cursor-pointer hover:bg-black/70 transition-colors p-4 text-center"
                >
                    {isNsfw ? (
                        <div className="px-3.5 py-2 bg-black/90 border border-rose-500/50 rounded-lg text-white text-xs font-bold flex items-center gap-2 shadow-2xl animate-fade-in">
                            <span className="text-rose-400 font-black tracking-wide">🔞 18+ NSFW</span>
                            <span className="text-white/40">·</span>
                            <span>{t('post.clickToViewNsfw', { defaultValue: 'Nội dung 18+ nhạy cảm · Nhấn để xem' })}</span>
                        </div>
                    ) : (
                        <div className="px-3.5 py-2 bg-black/90 border border-amber-500/50 rounded-lg text-white text-xs font-bold flex items-center gap-2 shadow-2xl animate-fade-in">
                            <FontAwesomeIcon icon={faEyeSlash} className="text-amber-400" />
                            <span>{t('post.clickToViewSpoiler', { defaultValue: 'Cảnh báo Spoiler · Nhấn để xem nội dung' })}</span>
                        </div>
                    )}
                </div>
            )}

            <div className={hasWarning && !isRevealed ? "blur-2xl select-none pointer-events-none" : "transition-all duration-300"}>
                {hasImages && (
                    <ImageGallery images={images} onImageClick={onImageClick} />
                )}
                {hasFiles && (
                    <div className={hasImages ? "mt-2.5" : ""}>
                        <FileAttachments files={files} />
                    </div>
                )}
            </div>
        </div>
    );
};

/* =========================================================================
   5. PostTags Component
   Style: #CS2 #Clutch #Premier / 12px / accent color / max 3–5 tags
   ========================================================================= */
export interface PostTagsProps {
    tags?: string[];
    onTagClick?: (tag: string, e: React.MouseEvent) => void;
}

export const PostTags = ({ tags, onTagClick }: PostTagsProps) => {
    if (!tags || tags.length === 0) return null;

    const displayTags = tags.slice(0, 5);

    return (
        <div className="flex flex-row gap-2 flex-wrap mb-4">
            {displayTags.map((tag, idx) => (
                <span
                    key={`${tag}-${idx}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        onTagClick?.(tag, e);
                    }}
                    className="text-xs text-primary font-medium hover:underline cursor-pointer"
                >
                    #{tag.replace(/^#/, '')}
                </span>
            ))}
        </div>
    );
};

/* =========================================================================
   6. PostActions Component
   [↑] (152) [↓]   💬 24   ↗   🔖
   Button: 32–36px, Icon: 16–18px, Score: 13–14px / 600, Vote active: accent
   ========================================================================= */
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

export const PostActions = ({
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
                    title={isLiked ? "Bỏ upvote" : "Upvote"}
                    aria-label="Upvote"
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
                    title={isDownvoted ? "Bỏ downvote" : "Downvote"}
                    aria-label="Downvote"
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
                    title="Bình luận"
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
                            className="absolute left-0 bottom-full mb-1 w-44 bg-surface border border-border/80 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in py-1"
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
};

/* =========================================================================
   Main Post Component (Orchestrator)
   ========================================================================= */
export const Post = ({
    post,
    isOwner = false,
    onDelete,
    onEdit,
    isDetailView = false,
}: PostProps) => {
    const { t, language } = useTranslation();
    const user = useAuthStore((state) => state.user);
    const mockLogin = useAuthStore((state) => state.mockLogin);
    const isLoggedIn = !!user || mockLogin;

    const bookmarked = useBookmarksStore((state) => state.isBookmarked(post.id));
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
    const postCommunity = post.communityId ? getCommunityById(post.communityId) : null;

    const [localVoteOverride, setLocalVoteOverride] = useState<{
        postId: string | number;
        voteType: number;
        upvotes: number;
        downvotes: number;
    } | null>(null);

    const currentVoteType = (localVoteOverride && String(localVoteOverride.postId) === String(post.id))
        ? localVoteOverride.voteType
        : (post.currentUserVoteType ?? 0);

    const upvoteCount = (localVoteOverride && String(localVoteOverride.postId) === String(post.id))
        ? localVoteOverride.upvotes
        : (post.upvotes ?? post.likes ?? 0);

    const downvoteCount = (localVoteOverride && String(localVoteOverride.postId) === String(post.id))
        ? localVoteOverride.downvotes
        : (post.downvotes ?? 0);

    const isLiked = currentVoteType === 1;
    const isDownvoted = currentVoteType === -1;
    const score = upvoteCount - downvoteCount;

    const navigate = useNavigate();
    const voteMutation = usePostVoteInteraction(post.id);
    const bookmarkMutation = useBookmarkInteraction(post.id);

    const requireVerifiedEmail = useAuthStore((state) => state.requireVerifiedEmail);

    const handleLike = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isLoggedIn) {
            navigate({ to: "/auth" });
            return;
        }
        if (!requireVerifiedEmail("upvote bài viết")) return;

        let nextUp: number;
        let nextDown = downvoteCount;
        let nextVoteType: number;

        if (isLiked) {
            nextUp = Math.max(0, upvoteCount - 1);
            nextVoteType = 0;
            voteMutation.mutate(null);
        } else {
            nextUp = upvoteCount + 1;
            if (isDownvoted) {
                nextDown = Math.max(0, downvoteCount - 1);
            }
            nextVoteType = 1;
            voteMutation.mutate(1);
        }

        setLocalVoteOverride({
            postId: post.id,
            voteType: nextVoteType,
            upvotes: nextUp,
            downvotes: nextDown,
        });

        const updates = {
            upvotes: nextUp,
            downvotes: nextDown,
            likes: nextUp,
            score: nextUp - nextDown,
            currentUserVoteType: nextVoteType,
        };

        usePostsStore.getState().updatePost(post.id, updates);
        if (onEdit) {
            onEdit(post.id, updates);
        }
    };

    const handleDownvote = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isLoggedIn) {
            navigate({ to: "/auth" });
            return;
        }
        if (!requireVerifiedEmail("downvote bài viết")) return;

        let nextUp = upvoteCount;
        let nextDown: number;
        let nextVoteType: number;

        if (isDownvoted) {
            nextDown = Math.max(0, downvoteCount - 1);
            nextVoteType = 0;
            voteMutation.mutate(null);
        } else {
            nextDown = downvoteCount + 1;
            if (isLiked) {
                nextUp = Math.max(0, upvoteCount - 1);
            }
            nextVoteType = -1;
            voteMutation.mutate(-1);
        }

        setLocalVoteOverride({
            postId: post.id,
            voteType: nextVoteType,
            upvotes: nextUp,
            downvotes: nextDown,
        });

        const updates = {
            upvotes: nextUp,
            downvotes: nextDown,
            likes: nextUp,
            score: nextUp - nextDown,
            currentUserVoteType: nextVoteType,
        };

        usePostsStore.getState().updatePost(post.id, updates);
        if (onEdit) {
            onEdit(post.id, updates);
        }
    };

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
    const authorName = authorObj?.name || authorObj?.displayName || authorObj?.username || (typeof post.author === "string" ? post.author : "Thành viên");
    const authorUsername = authorObj?.username || (typeof post.author === "object" ? (post.author as { handle?: string })?.handle : undefined);
    const authorAvatar = authorObj ? (authorObj.avatar || authorObj.avatarUrl || post.authorAvatar) : post.authorAvatar;

    const handleNavigate = () => {
        if (isDetailView) return;
        navigate({ to: '/post/$postId', params: { postId: post.id.toString() } });
    };

    const handleAuthorClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        const authorObj = typeof post.author === "object" ? post.author : null;
        const authorUsername = authorObj?.username;
        const authorId = authorObj?.id;
        const isMe = authorName === getCurrentAuthor() || (authorUsername && authorUsername === getCurrentAuthor());

        let targetUserId = "me";
        if (!isMe) {
            if (authorUsername) {
                targetUserId = authorUsername.startsWith("@") ? authorUsername : `@${authorUsername}`;
            } else if (authorId) {
                targetUserId = authorId;
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

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!requireVerifiedEmail("xóa bài viết")) return;
        onDelete?.(post.id);
        setShowActionMenu(false);
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!requireVerifiedEmail("chỉnh sửa bài viết")) return;
        setShowActionMenu(false);
        setShowEditModal(true);
    };

    const handleSaveEdit = (data: Partial<PostData>) => {
        if (!requireVerifiedEmail("chỉnh sửa bài viết")) return;
        onEdit?.(post.id, data);
    };

    const rawRank = post.authorRank || (typeof post.author === "object" && post.author !== null ? post.author.rank : undefined);
    const rank = getRankConfigIfPresent(rawRank);

    return (
        <article
            onClick={handleNavigate}
            className={`
                w-full transition-all duration-200 ease-in-out border-none
                ${(showActionMenu || showShareMenu) ? "!overflow-visible relative z-[100]" : "relative"}
                ${isDetailView 
                    ? "py-4 pb-5 mb-0" 
                    : "cursor-pointer group px-3.5 sm:px-4 py-4 rounded-[12px] sm:rounded-[16px] bg-[#161b22] shadow-[0_2px_8px_rgba(0,0,0,0.3)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.4)] hover:-translate-y-[2px]"
                }
            `}
        >
            {/* 1. Header (Avatar 40x40, Name, Rank, Community, @username, Time, More 32x32) */}
            <PostHeader
                authorName={authorName}
                authorUsername={authorUsername}
                authorAvatar={authorAvatar}
                rank={rank}
                postCommunity={postCommunity}
                gameTag={post.gameTag}
                timeAgo={post.timeAgo}
                onAuthorClick={handleAuthorClick}
                onCommunityClick={(e) => {
                    e?.stopPropagation();
                    if (postCommunity) {
                        navigate({ to: `/community/${postCommunity.id}` });
                    } else if (post.gameTag) {
                        const gameInfo = getGameBySlug(post.gameTag);
                        navigate({ to: `/game/${gameInfo.slug}` });
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
                commentsCount={post.comments}
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
                    initialAllowComments={post.allowComments ?? true}
                    initialPinned={post.pinned ?? false}
                    onClose={() => setShowEditModal(false)}
                    onSave={handleSaveEdit}
                />
            )}
        </article>
    );
};
