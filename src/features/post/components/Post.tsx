import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faComment,
    faBookmark as faBookmarkOutline,
} from "@fortawesome/free-regular-svg-icons"
import {
    faBookmark as faBookmarkSolid,
    faArrowUp,
    faArrowDown,
    faShare,
    faEllipsis,
    faEyeSlash,
    faFlag,
    faLink,
    faTrash,
    faPen,
    faFile,
    faDownload,
    faLock,
    faShieldHalved,
} from "@fortawesome/free-solid-svg-icons"
import { faTwitter, faFacebook } from "@fortawesome/free-brands-svg-icons"
import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useAuthStore } from "@/features/auth"
import { notificationApi } from "@/features/notification"
import { formatFileSize } from "../helpers/postAttachmentLimits"
import { Lightbox } from "@/shared/components/ui/Lightbox"
import { ReportModal } from "@/features/report"
import { useBookmarksStore } from "@/features/bookmark"
import { EditPostModal } from ".."
import { RANK_CONFIG, getUserRankConfig, getRankLabel } from "../helpers/userRanks"
import { useCommunitiesStore } from "@/features/community";
import { getCurrentAuthor } from "../helpers/getCurrentAuthor"
import { useTranslation } from "@/shared/hooks/useTranslate"
import { formatTimeAgo } from "@/shared/utils/formatTimeAgo"
import { type PostFileAttachment, type PostData } from "../types";
import { POST_BADGE_MAP } from "../constants";
import { getGameBySlug } from "@/features/game";
import { useLikeInteraction, useBookmarkInteraction } from "../api/interaction-api";


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

const ImageGallery = ({ images, onImageClick }: { images: string[], onImageClick: (index: number) => void }) => {
    if (!images || images.length === 0) return null;

    const count = images.length;

    if (count === 1) {
        return (
            <img
                src={images[0]}
                alt=""
                className="w-full max-h-96 object-cover rounded-md cursor-pointer hover:opacity-95 transition-opacity"
                onClick={(e) => { e.stopPropagation(); onImageClick(0); }}
            />
        );
    }

    if (count === 2) {
        return (
            <div className="grid grid-cols-2 gap-1.5 aspect-4/3 sm:aspect-video rounded-md overflow-hidden">
                <img src={images[0]} alt="" onClick={(e) => { e.stopPropagation(); onImageClick(0); }} className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity" />
                <img src={images[1]} alt="" onClick={(e) => { e.stopPropagation(); onImageClick(1); }} className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity" />
            </div>
        );
    }

    if (count === 3) {
        return (
            <div className="grid grid-cols-2 gap-1.5 aspect-4/3 sm:aspect-video rounded-md overflow-hidden">
                <img src={images[0]} alt="" onClick={(e) => { e.stopPropagation(); onImageClick(0); }} className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity" />
                <div className="flex flex-col gap-1.5 h-full min-h-0">
                    <img src={images[1]} alt="" onClick={(e) => { e.stopPropagation(); onImageClick(1); }} className="w-full flex-1 object-cover min-h-0 cursor-pointer hover:opacity-95 transition-opacity" />
                    <img src={images[2]} alt="" onClick={(e) => { e.stopPropagation(); onImageClick(2); }} className="w-full flex-1 object-cover min-h-0 cursor-pointer hover:opacity-95 transition-opacity" />
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-1.5 aspect-4/3 sm:aspect-video rounded-md overflow-hidden">
            <div className="flex flex-col gap-1.5 h-full min-h-0">
                <img src={images[0]} alt="" onClick={(e) => { e.stopPropagation(); onImageClick(0); }} className="w-full flex-1 object-cover min-h-0 cursor-pointer hover:opacity-95 transition-opacity" />
                <img src={images[1]} alt="" onClick={(e) => { e.stopPropagation(); onImageClick(1); }} className="w-full flex-1 object-cover min-h-0 cursor-pointer hover:opacity-95 transition-opacity" />
            </div>
            <div className="flex flex-col gap-1.5 h-full min-h-0">
                <img src={images[2]} alt="" onClick={(e) => { e.stopPropagation(); onImageClick(2); }} className="w-full flex-1 object-cover min-h-0 cursor-pointer hover:opacity-95 transition-opacity" />
                <div className="relative w-full flex-1 min-h-0 cursor-pointer hover:opacity-95 transition-opacity" onClick={(e) => { e.stopPropagation(); onImageClick(3); }}>
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
                    className="flex flex-row items-center gap-2.5 px-3 py-2 rounded-md bg-surface-hover/60 hover:bg-surface-hover transition-colors"
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

export const Post = ({ post, isOwner = false, onDelete, onEdit, isDetailView = false }: PostProps) => {
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
    const [isRevealed, setIsRevealed] = useState(!post.isSpoiler);
    const [isContentExpanded, setIsContentExpanded] = useState(isDetailView);

    const getCommunityById = useCommunitiesStore((state) => state.getCommunityById);
    const postCommunity = post.communityId ? getCommunityById(post.communityId) : null;

    const [isLiked, setIsLiked] = useState(false);
    const [isDownvoted, setIsDownvoted] = useState(false);
    const [likeCount, setLikeCount] = useState(post.likes);

    const navigate = useNavigate();
    const likeMutation = useLikeInteraction(post.id);
    const bookmarkMutation = useBookmarkInteraction(post.id);

    const requireVerifiedEmail = useAuthStore((state) => state.requireVerifiedEmail);

    const handleLike = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isLoggedIn) {
            navigate({ to: "/auth" });
            return;
        }
        if (!requireVerifiedEmail("upvote bài viết")) return;

        const nextLiked = !isLiked;
        setIsLiked(nextLiked);
        setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
        if (nextLiked && isDownvoted) {
            setIsDownvoted(false);
        }
        likeMutation.mutate(nextLiked);

        if (nextLiked) {
            void notificationApi.createNotification({
                type: "like",
                referenceId: String(post.id),
                title: "Upvote bài viết",
                message: `Bạn đã upvote bài viết: "${post.title}"`,
                link: `/post/${post.id}`,
            });
        }
    };

    const handleDownvote = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isLoggedIn) {
            navigate({ to: "/auth" });
            return;
        }
        if (!requireVerifiedEmail("downvote bài viết")) return;

        if (isDownvoted) {
            setIsDownvoted(false);
        } else {
            setIsDownvoted(true);
            if (isLiked) {
                setIsLiked(false);
                setLikeCount((prev) => Math.max(0, prev - 1));
                likeMutation.mutate(false);
            }
        }
    };

    const handleToggleBookmark = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isLoggedIn) {
            navigate({ to: "/auth" });
            return;
        }
        if (!requireVerifiedEmail("lưu bài viết")) return;

        const nextBookmarked = !bookmarked;
        toggleBookmark(post.id);
        bookmarkMutation.mutate(nextBookmarked);
    };

    const postUrl = `${window.location.origin}/post/${post.id}`;

    const authorName = typeof post.author === "string" ? post.author : (post.author?.name || post.author?.username || "Thành viên");
    const authorAvatar = typeof post.author === "object" && post.author !== null ? (post.author.avatar || post.author.avatarUrl || post.authorAvatar) : post.authorAvatar;

    const handleNavigate = () => {
        if (isDetailView) return;
        navigate({ to: '/post/$postId', params: { postId: post.id.toString() } });
    };

    const handleAuthorClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        const isMe = authorName === getCurrentAuthor();
        navigate({ to: "/profile/$userId", params: { userId: isMe ? "me" : `@${authorName.toLowerCase().replace(/\s+/g, "_")}` } });
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
        const text = encodeURIComponent(post.title);
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

    const badge = post.tab ? POST_BADGE_MAP[post.tab] : null;
    const rank = post.authorRank ? (RANK_CONFIG[post.authorRank] || getUserRankConfig(authorName)) : getUserRankConfig(authorName);

    return (
        <article
            onClick={handleNavigate}
            className={`
                w-full py-4 pb-5 border-b border-divider-secondary
                ${(showActionMenu || showShareMenu) ? "!overflow-visible relative z-[100]" : "relative"}
                ${isDetailView ? "" : "cursor-pointer group"}
            `}
        >
            {/* Header / Author row */}
            <div className="flex flex-row items-center justify-between gap-3 mb-2.5">
                <div className="flex flex-row items-center gap-2.5 min-w-0">
                    <div className="relative shrink-0 cursor-pointer hover:opacity-85 transition-opacity" onClick={handleAuthorClick}>
                        <img
                            src={authorAvatar}
                            alt={authorName}
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-border/80"
                        />
                        {rank && (
                            <span
                                title={getRankLabel(rank, language)}
                                className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 flex items-center justify-center rounded-full ring-1 ring-bg text-[7px] ${rank.classes}`}
                            >
                                <FontAwesomeIcon icon={rank.icon} />
                            </span>
                        )}
                    </div>

                    <div className="flex flex-col leading-tight min-w-0">
                        <div className="flex flex-row items-center gap-1.5 flex-wrap">
                            <span
                                onClick={handleAuthorClick}
                                className={`font-bold text-xs sm:text-sm uppercase tracking-wide hover:underline cursor-pointer ${
                                    (authorName.toLowerCase().includes("admin") || authorName.toLowerCase().includes("quản trị"))
                                        ? "text-rose-500 font-extrabold"
                                        : rank?.textColor || "text-text"
                                }`}
                            >
                                {authorName}
                            </span>

                            {(authorName.toLowerCase().includes("admin") || authorName.toLowerCase().includes("quản trị")) ? (
                                <span className="px-1.5 py-0.2 rounded bg-rose-500 text-white font-black text-[9px] uppercase tracking-wider flex items-center gap-1 shadow-xs border border-rose-400/50">
                                    <FontAwesomeIcon icon={faShieldHalved} className="text-[8px]" />
                                    <span>ADMIN</span>
                                </span>
                            ) : rank && (
                                <span className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider ${rank.classes}`}>
                                    {getRankLabel(rank, language)}
                                </span>
                            )}

                            {badge && (
                                <span className={`flex flex-row items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider ${badge.classes}`}>
                                    <FontAwesomeIcon icon={badge.icon} />
                                    {badge.label}
                                </span>
                            )}
                        </div>

                        {/* Community context & Time */}
                        <div className="flex flex-row items-center gap-1.5 text-[11px] text-text-faint mt-0.5">
                            {postCommunity ? (
                                <span
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate({ to: `/community/${postCommunity.id}` });
                                    }}
                                    className="font-bold text-primary hover:underline transition-colors cursor-pointer flex items-center gap-1"
                                >
                                    <span>{postCommunity.name}</span>
                                </span>
                            ) : post.gameTag ? (
                                <span
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const gameInfo = getGameBySlug(post.gameTag!);
                                        navigate({ to: `/game/${gameInfo.slug}` });
                                    }}
                                    className="font-bold text-text-muted hover:text-primary transition-colors cursor-pointer"
                                >
                                    {post.gameTag}
                                </span>
                            ) : null}
                            <span>·</span>
                            <span>{formatTimeAgo(post.timeAgo, t)}</span>
                        </div>
                    </div>
                </div>

                {/* Top Action / More button */}
                <div className="relative shrink-0">
                    <button
                        onClick={(e) => { e.stopPropagation(); setShowActionMenu(prev => !prev); setShowShareMenu(false); }}
                        className="w-7 h-7 flex items-center justify-center rounded-md text-text-faint hover:text-text hover:bg-surface-hover/70 transition-colors cursor-pointer"
                    >
                        <FontAwesomeIcon icon={faEllipsis} className="text-xs" />
                    </button>

                    {showActionMenu && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setShowActionMenu(false); }} />
                            <div
                                className="absolute right-0 top-full mt-1 w-44 bg-surface border border-border/80 rounded-md shadow-xl z-50 overflow-hidden animate-fade-in py-1"
                            >
                                {isOwner ? (
                                    <>
                                        <button onClick={handleEdit} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-text-muted hover:bg-surface-hover hover:text-text transition-colors text-left cursor-pointer">
                                            <FontAwesomeIcon icon={faPen} className="w-3.5" />
                                            {t('post.edit')}
                                        </button>
                                        <button onClick={handleDelete} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-500 hover:bg-surface-hover transition-colors text-left font-medium border-t border-border/40 cursor-pointer">
                                            <FontAwesomeIcon icon={faTrash} className="w-3.5" />
                                            {t('post.delete')}
                                        </button>
                                    </>
                                ) : (
                                    <button onClick={(e) => { e.stopPropagation(); setShowActionMenu(false); setShowReportModal(true); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-text-muted hover:text-rose-500 hover:bg-surface-hover transition-colors text-left cursor-pointer">
                                        <FontAwesomeIcon icon={faFlag} className="w-3.5" />
                                        {t('post.report')}
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Content Body */}
            <div className="flex flex-col gap-2 relative">
                {post.isSpoiler && !isRevealed && (
                    <div 
                        onClick={(e) => { e.stopPropagation(); setIsRevealed(true); }}
                        className="absolute inset-0 z-10 flex items-center justify-center bg-surface/60 backdrop-blur-md rounded cursor-pointer"
                    >
                        <div className="px-3 py-1.5 bg-black/80 rounded text-white text-[11px] font-bold flex items-center gap-2">
                            <FontAwesomeIcon icon={faEyeSlash} />
                            <span>{t('post.clickToViewSpoiler')}</span>
                        </div>
                    </div>
                )}
                
                <div className={post.isSpoiler && !isRevealed ? "blur-md select-none pointer-events-none" : ""}>
                    {post.title && (
                        <h2 className={`font-bold text-text leading-snug tracking-tight mb-2 group-hover:text-primary transition-colors break-words ${
                            isDetailView ? "text-xl sm:text-[26px]" : "text-lg sm:text-[22px] md:text-[24px]"
                        }`}>
                            {post.title}
                        </h2>
                    )}
                    {(() => {
                        const content = post.content || "";
                        const MAX_LENGTH = 250;
                        const isLong = content.length > MAX_LENGTH;
                        const displayContent = (isLong && !isContentExpanded)
                            ? content.slice(0, MAX_LENGTH) + "..."
                            : content;

                        return (
                            <div className="text-xs sm:text-sm text-text-muted leading-relaxed whitespace-pre-line font-normal break-words">
                                <span>{displayContent}</span>
                                {isLong && !isContentExpanded && (
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); setIsContentExpanded(true); }}
                                        className="inline font-bold text-text hover:underline cursor-pointer ml-1"
                                    >
                                        {t('common.viewMore')}
                                    </button>
                                )}
                            </div>
                        );
                    })()}

                    {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-row gap-1.5 flex-wrap pt-2">
                            {post.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="text-xs font-medium text-primary hover:underline cursor-pointer"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Media Gallery */}
            {post.images && post.images.length > 0 && (
                <div className="mt-3 relative">
                    {post.isSpoiler && !isRevealed && (
                        <div 
                            onClick={(e) => { e.stopPropagation(); setIsRevealed(true); }}
                            className="absolute inset-0 z-10 flex items-center justify-center bg-surface/40 backdrop-blur-xl rounded cursor-pointer"
                        />
                    )}
                    <div className={post.isSpoiler && !isRevealed ? "blur-xl select-none pointer-events-none" : ""}>
                        <ImageGallery images={post.images} onImageClick={setLightboxIndex} />
                    </div>
                </div>
            )}

            {/* Files */}
            {post.files && post.files.length > 0 && (
                <div className="mt-2.5">
                    <FileAttachments files={post.files} />
                </div>
            )}

            {/* Action Row */}
            <div className="flex flex-row items-center gap-4 sm:gap-6 pt-3 mt-1 text-xs text-text-muted">
                {/* Upvote & Downvote */}
                <div className="flex flex-row items-center gap-3">
                    <button
                        onClick={handleLike}
                        className={`
                            flex flex-row items-center gap-1.5 font-semibold transition-colors cursor-pointer
                            ${isLiked 
                                ? "text-primary font-bold" 
                                : "hover:text-text"}
                        `}
                        title={isLiked ? "Đã upvote" : "Upvote"}
                    >
                        <FontAwesomeIcon icon={faArrowUp} className="text-xs" />
                        <span>{likeCount}</span>
                    </button>

                    <button
                        onClick={handleDownvote}
                        className={`
                            flex flex-row items-center gap-1.5 font-semibold transition-colors cursor-pointer
                            ${isDownvoted 
                                ? "text-rose-500 font-bold" 
                                : "hover:text-text"}
                        `}
                        title={isDownvoted ? "Đã downvote" : "Downvote"}
                    >
                        <FontAwesomeIcon icon={faArrowDown} className="text-xs" />
                    </button>
                </div>

                {/* Comment Button */}
                {post.allowComments === false ? (
                    <div
                        className="flex flex-row items-center gap-1.5 text-text-faint cursor-not-allowed"
                        title={t('post.commentsDisabledTitle')}
                    >
                        <FontAwesomeIcon icon={faLock} className="text-xs" />
                        <span className="text-[11px]">{t('post.commentsDisabled')}</span>
                    </div>
                ) : (
                    <button
                        onClick={(e) => { e.stopPropagation(); if (!isDetailView) handleNavigate(); }}
                        className="flex flex-row items-center gap-1.5 font-semibold hover:text-text transition-colors cursor-pointer"
                    >
                        <FontAwesomeIcon icon={faComment} className="text-xs" />
                        <span>{post.comments} {t('post.replies', { defaultValue: 'Replies' })}</span>
                    </button>
                )}

                {/* Share Button */}
                <div className="relative">
                    <button
                        onClick={(e) => { e.stopPropagation(); setShowShareMenu(prev => !prev); setShowActionMenu(false); }}
                        className="flex flex-row items-center gap-1.5 font-semibold hover:text-text transition-colors cursor-pointer"
                    >
                        <FontAwesomeIcon icon={faShare} className="text-xs" />
                        <span>{t('post.share')}</span>
                    </button>

                    {showShareMenu && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setShowShareMenu(false); }} />
                            <div
                                className="absolute left-0 bottom-full mb-1 w-44 bg-surface border border-border/80 rounded-md shadow-xl z-50 overflow-hidden animate-fade-in py-1"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button onClick={handleCopyLink} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-text-muted hover:bg-surface-hover hover:text-text transition-colors text-left cursor-pointer">
                                    <FontAwesomeIcon icon={faLink} className="w-3.5" />
                                    {linkCopied ? t('post.copied') : t('post.copyLink')}
                                </button>
                                <button onClick={handleShareX} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-text-muted hover:bg-surface-hover hover:text-text transition-colors text-left cursor-pointer">
                                    <FontAwesomeIcon icon={faTwitter} className="w-3.5 text-[#1DA1F2]" />
                                    {t('post.shareX')}
                                </button>
                                <button onClick={handleShareFacebook} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-text-muted hover:bg-surface-hover hover:text-text transition-colors text-left cursor-pointer">
                                    <FontAwesomeIcon icon={faFacebook} className="w-3.5 text-[#1877F2]" />
                                    {t('post.shareFB')}
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Bookmark Button */}
                <button
                    onClick={handleToggleBookmark}
                    className={`ml-auto flex items-center justify-center transition-colors cursor-pointer ${
                        bookmarked
                            ? "text-primary font-bold"
                            : "text-text-faint hover:text-text"
                    }`}
                    title={bookmarked ? t('post.saved') : t('post.save')}
                >
                    <FontAwesomeIcon icon={bookmarked ? faBookmarkSolid : faBookmarkOutline} className="text-xs" />
                </button>
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
                    initialAllowComments={post.allowComments ?? true}
                    initialPinned={post.pinned ?? false}
                    onClose={() => setShowEditModal(false)}
                    onSave={handleSaveEdit}
                />
            )}
        </article>
    );
};