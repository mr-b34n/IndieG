import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faComment,
    faBookmark as faBookmarkOutline,
} from "@fortawesome/free-regular-svg-icons"
import {
    faBookmark as faBookmarkSolid,
    faShare,
    faEllipsis,
    faEyeSlash,
    faUserMinus,
    faFlag,
    faLink,
    faTrash,
    faPen,
    faFile,
    faDownload,
    faLock,
    faBan,
    faArrowUp,
    faArrowDown,
} from "@fortawesome/free-solid-svg-icons"
import { faTwitter, faFacebook } from "@fortawesome/free-brands-svg-icons"
import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useAuthStore } from "@/features/auth"
import { formatFileSize } from "../helpers/postAttachmentLimits"
import EmojiBox from "@/shared/components/ui/EmojiBox"
import { Lightbox } from "@/shared/components/ui/Lightbox"
import { ReportModal } from "@/features/report"
import { useBookmarksStore } from "@/features/bookmark"
import { EditPostModal } from ".."
import { RANK_CONFIG, getUserRankConfig, getRankLabel } from "../helpers/userRanks"
import { getCurrentAuthor } from "../helpers/getCurrentAuthor"
import { useTranslation } from "@/shared/hooks/useTranslate"
import { formatTimeAgo } from "@/shared/utils/formatTimeAgo"
import { type PostFileAttachment, type PostData } from "../types";
import { POST_TAG_CLASSES, POST_BADGE_MAP } from "../constants";
import { getGameBySlug } from "@/features/game";


interface PostProps {
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
                className="w-full max-h-80 object-cover rounded-xl border border-border cursor-pointer hover:opacity-95 transition-opacity"
                onClick={(e) => { e.stopPropagation(); onImageClick(0); }}
            />
        );
    }

    if (count === 2) {
        return (
            <div className="grid grid-cols-2 gap-1 aspect-4/3 sm:aspect-video rounded-xl overflow-hidden border border-border">
                <img src={images[0]} alt="" onClick={(e) => { e.stopPropagation(); onImageClick(0); }} className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity" />
                <img src={images[1]} alt="" onClick={(e) => { e.stopPropagation(); onImageClick(1); }} className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity" />
            </div>
        );
    }

    if (count === 3) {
        return (
            <div className="grid grid-cols-2 gap-1 aspect-4/3 sm:aspect-video rounded-xl overflow-hidden border border-border">
                <img src={images[0]} alt="" onClick={(e) => { e.stopPropagation(); onImageClick(0); }} className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity" />
                <div className="flex flex-col gap-1 h-full min-h-0">
                    <img src={images[1]} alt="" onClick={(e) => { e.stopPropagation(); onImageClick(1); }} className="w-full flex-1 object-cover min-h-0 cursor-pointer hover:opacity-95 transition-opacity" />
                    <img src={images[2]} alt="" onClick={(e) => { e.stopPropagation(); onImageClick(2); }} className="w-full flex-1 object-cover min-h-0 cursor-pointer hover:opacity-95 transition-opacity" />
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-1 aspect-4/3 sm:aspect-video rounded-xl overflow-hidden border border-border">
            <div className="flex flex-col gap-1 h-full min-h-0">
                <img src={images[0]} alt="" onClick={(e) => { e.stopPropagation(); onImageClick(0); }} className="w-full flex-1 object-cover min-h-0 cursor-pointer hover:opacity-95 transition-opacity" />
                <img src={images[1]} alt="" onClick={(e) => { e.stopPropagation(); onImageClick(1); }} className="w-full flex-1 object-cover min-h-0 cursor-pointer hover:opacity-95 transition-opacity" />
            </div>
            <div className="flex flex-col gap-1 h-full min-h-0">
                <img src={images[2]} alt="" onClick={(e) => { e.stopPropagation(); onImageClick(2); }} className="w-full flex-1 object-cover min-h-0 cursor-pointer hover:opacity-95 transition-opacity" />
                <div className="relative w-full flex-1 min-h-0 cursor-pointer hover:opacity-95 transition-opacity" onClick={(e) => { e.stopPropagation(); onImageClick(3); }}>
                    <img src={images[3]} alt="" className="w-full h-full object-cover" />
                    {count > 4 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
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
                    className="flex flex-row items-center gap-2 px-3 py-2 rounded-xl bg-surface-hover border border-border hover:border-primary/30 transition-colors"
                >
                    <FontAwesomeIcon icon={faFile} className="text-primary text-sm shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-text truncate">{file.name}</p>
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

export const Post = ({ post, isOwner = false, onDelete, onEdit, onUnfollowAuthor, isDetailView = false }: PostProps) => {
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
    const [hidden, setHidden] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);

    const [voteState, setVoteState] = useState<"up" | "down" | null>(null);
    const [score, setScore] = useState(post.likes);
    const [activeReaction, setActiveReaction] = useState<string | null>(null);

    const [isEmojiOpen, setIsEmojiOpen] = useState(false);

    const navigate = useNavigate();

    if (hidden) return null;

    const postUrl = `${window.location.origin}/post/${post.id}`;

    const handleNavigate = () => {
        if (isDetailView) return;
        navigate({ to: '/post/$postId', params: { postId: post.id.toString() } });
    };

    const handleAuthorClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        const isMe = post.author === getCurrentAuthor();
        navigate({ to: "/profile/$userId", params: { userId: isMe ? "me" : `@${post.author.toLowerCase().replace(/\s+/g, "_")}` } });
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
        onDelete?.(post.id);
        setShowActionMenu(false);
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowActionMenu(false);
        setShowEditModal(true);
    };

    const handleSaveEdit = (data: Partial<PostData>) => {
        onEdit?.(post.id, data);
    };

    const handleNotInterested = (e: React.MouseEvent) => {
        e.stopPropagation();
        setHidden(true);
        setShowActionMenu(false);
    };

    const handleUnfollow = (e: React.MouseEvent) => {
        e.stopPropagation();
        onUnfollowAuthor?.(post.author);
        setShowActionMenu(false);
    };

    const badge = post.tab ? POST_BADGE_MAP[post.tab] : null;
    const rank = post.authorRank ? (RANK_CONFIG[post.authorRank] || getUserRankConfig(post.author)) : getUserRankConfig(post.author);

    return (
        <article
            onClick={handleNavigate}
            className={`
            w-full ${(showActionMenu || showShareMenu || isEmojiOpen) ? "!overflow-visible relative z-[100]" : "overflow-hidden relative"}
            bg-surface/95 backdrop-blur-sm
            border border-border
            rounded-xl
            shadow-[0_10px_30px_-5px_rgba(0,0,0,0.12),0_4px_12px_-5px_rgba(0,0,0,0.06)]
            dark:shadow-[0_10px_30px_-5px_rgba(0,0,0,0.40),0_4px_12px_-5px_rgba(0,0,0,0.20)]
            hover:shadow-[0_16px_40px_-5px_rgba(0,0,0,0.18),0_6px_16px_-5px_rgba(0,0,0,0.10)]
            dark:hover:shadow-[0_16px_40px_-5px_rgba(0,0,0,0.50),0_6px_16px_-5px_rgba(0,0,0,0.28)]
            hover:-translate-y-0.5
            transition-all duration-300 ease-out
            ${isDetailView ? "" : "cursor-pointer"}
        `}>

            <div className="flex flex-row items-center gap-2.5 px-3.5 pt-3.5 pb-2.5">
                <div className="relative shrink-0 cursor-pointer hover:opacity-80 transition-opacity" onClick={handleAuthorClick}>
                    <img
                        src={post.authorAvatar}
                        alt={post.author}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-border"
                    />
                    {rank && (
                        <span
                            title={getRankLabel(rank, language)}
                            className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 flex items-center justify-center rounded-full ring-2 ring-surface text-[8px] ${rank.classes}`}
                        >
                            <FontAwesomeIcon icon={rank.icon} />
                        </span>
                    )}
                </div>

                <div className="flex flex-col flex-1 leading-tight min-w-0">
                    <div className="flex flex-row items-center gap-2 flex-wrap">
                        <p onClick={handleAuthorClick} className={`font-semibold text-[15px] hover:underline cursor-pointer ${rank?.textColor || "text-text"}`}>{post.author}</p>

                        {rank && (
                            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${rank.classes}`}>
                                {getRankLabel(rank, language)}
                            </span>
                        )}

                        {badge && (
                            <span className={`flex flex-row items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider ${badge.classes}`}>
                                <FontAwesomeIcon icon={badge.icon} />
                                {badge.label}
                            </span>
                        )}
                    </div>
                    <div className="flex flex-row items-center gap-1.5 text-xs text-text-faint mt-1">
                        <span>{formatTimeAgo(post.timeAgo, t)}</span>
                        <span>•</span>
                        <span
                            onClick={(e) => {
                                e.stopPropagation();
                                const gameInfo = getGameBySlug(post.gameTag);
                                navigate({ to: `/game/${gameInfo.slug}` });
                            }}
                            className="hover:text-primary hover:underline transition-colors font-medium cursor-pointer"
                        >
                            {post.gameTag}
                        </span>
                    </div>
                </div>

                <div className="relative">
                    <button
                        onClick={(e) => { e.stopPropagation(); setShowActionMenu(prev => !prev); setShowShareMenu(false); }}
                        className="
                        w-8 h-8 flex items-center justify-center rounded-full
                        text-text-faint hover:text-text hover:bg-surface-hover
                        transition-colors duration-150
                    ">
                        <FontAwesomeIcon icon={faEllipsis} />
                    </button>

                    {showActionMenu && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setShowActionMenu(false); }} />
                            <div
                                className="absolute right-0 top-full mt-1 w-48 bg-surface border border-border rounded-xl shadow-lg z-50 overflow-hidden animate-fade-in py-1"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {isOwner ? (
                                    <>
                                        <button onClick={handleEdit} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-muted hover:bg-surface-hover hover:text-text transition-colors text-left">
                                            <FontAwesomeIcon icon={faPen} className="w-4" />
                                            {t('post.edit')}
                                        </button>
                                        <button onClick={handleDelete} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-accent-500 hover:bg-surface-hover transition-colors text-left font-medium border-t border-border/50">
                                            <FontAwesomeIcon icon={faTrash} className="w-4" />
                                            {t('post.delete')}
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={handleNotInterested} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-muted hover:bg-surface-hover hover:text-text transition-colors text-left">
                                            <FontAwesomeIcon icon={faEyeSlash} className="w-4" />
                                            {t('post.notInterested')}
                                        </button>
                                        <button onClick={handleUnfollow} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-muted hover:bg-surface-hover hover:text-text transition-colors text-left">
                                            <FontAwesomeIcon icon={faUserMinus} className="w-4" />
                                            {t('post.unfollow', { name: post.author })}
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); setShowActionMenu(false); setShowReportModal(true); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-accent-500 hover:bg-surface-hover transition-colors text-left mt-1 border-t border-border/50">
                                            <FontAwesomeIcon icon={faFlag} className="w-4" />
                                            {t('post.report')}
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); setShowActionMenu(false); alert("Đã chặn người dùng: " + post.author); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-500 hover:bg-surface-hover transition-colors text-left font-medium">
                                            <FontAwesomeIcon icon={faBan} className="w-4" />
                                            {t('post.blockUser')}
                                        </button>
                                    </>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="px-4 pb-3 flex flex-col gap-2">
                <p className="font-semibold text-base text-text leading-snug">
                    {post.title}
                </p>
                <p className="text-sm text-text-muted leading-relaxed whitespace-pre-line">
                    {post.content}
                </p>

                {post.tags.length > 0 && (
                    <div className="flex flex-row gap-1.5 flex-wrap pt-0.5">
                        {post.tags.map((tag, idx) => (
                            <span
                                key={tag}
                                className={`px-2 py-0.5 rounded-full text-xs font-medium
                                    hover:opacity-75 transition-opacity
                                    ${POST_TAG_CLASSES[idx % POST_TAG_CLASSES.length]}`}
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {post.images && post.images.length > 0 && (
                <div className="px-4 pb-3">
                    <ImageGallery images={post.images} onImageClick={setLightboxIndex} />
                </div>
            )}

            {post.files && post.files.length > 0 && (
                <div className="px-4 pb-3">
                    <FileAttachments files={post.files} />
                </div>
            )}

            <div className="flex flex-row items-center gap-1.5 px-3 py-2.5 border-t border-border">

                {/* Reddit-style Upvote / Downvote Pill */}
                <div className="flex flex-row items-center bg-surface-hover/70 rounded-full border border-border/50 px-1 py-0.5" onClick={(e) => e.stopPropagation()}>
                    <button
                        type="button"
                        onClick={() => {
                            if (!isLoggedIn) {
                                navigate({ to: "/auth" });
                                return;
                            }
                            if (voteState === "up") {
                                setVoteState(null);
                                setScore((s) => s - 1);
                            } else {
                                setScore((s) => s + (voteState === "down" ? 2 : 1));
                                setVoteState("up");
                            }
                        }}
                        className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors cursor-pointer ${
                            voteState === "up" ? "text-orange-500 bg-orange-500/15 font-bold" : "text-text-muted hover:text-orange-500 hover:bg-surface-hover"
                        }`}
                        title="Upvote"
                    >
                        <FontAwesomeIcon icon={faArrowUp} className="text-xs" />
                    </button>

                    <span className={`px-1.5 text-xs font-bold ${voteState === "up" ? "text-orange-500" : voteState === "down" ? "text-indigo-500" : "text-text"}`}>
                        {score}
                    </span>

                    <button
                        type="button"
                        onClick={() => {
                            if (!isLoggedIn) {
                                navigate({ to: "/auth" });
                                return;
                            }
                            if (voteState === "down") {
                                setVoteState(null);
                                setScore((s) => s + 1);
                            } else {
                                setScore((s) => s - (voteState === "up" ? 2 : 1));
                                setVoteState("down");
                            }
                        }}
                        className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors cursor-pointer ${
                            voteState === "down" ? "text-indigo-500 bg-indigo-500/15 font-bold" : "text-text-muted hover:text-indigo-500 hover:bg-surface-hover"
                        }`}
                        title="Downvote"
                    >
                        <FontAwesomeIcon icon={faArrowDown} className="text-xs" />
                    </button>
                </div>

                {/* FB-style Emoji Reaction Picker */}
                <div className="relative inline-block">
                    <EmojiBox
                        isOpen={isEmojiOpen}
                        onClose={() => setIsEmojiOpen(false)}
                        onSelect={(_id, char) => {
                            setActiveReaction((prev) => (prev === char ? null : char));
                            setIsEmojiOpen(false);
                        }}
                    />

                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!isLoggedIn) {
                                navigate({ to: "/auth" });
                                return;
                            }
                            setIsEmojiOpen((prev) => !prev);
                        }}
                        className={`flex flex-row items-center gap-1.5 px-3 py-1.5 select-none rounded-full text-xs font-semibold transition-all ${
                            activeReaction
                                ? "bg-primary/15 text-primary border border-primary/30"
                                : "text-text-muted hover:bg-surface-hover hover:text-text"
                        }`}
                    >
                        <span className="text-sm">{activeReaction || "😍"}</span>
                        <span>{activeReaction ? t('post.reacted') : t('post.react')}</span>
                    </button>
                </div>

                {post.allowComments === false ? (
                    <div
                        className="
                        flex flex-row items-center gap-1.5 px-3 py-1.5
                        rounded-full text-sm font-medium
                        text-text-faint bg-surface-hover/40 cursor-not-allowed
                    "
                        title={t('post.commentsDisabledTitle')}
                    >
                        <FontAwesomeIcon icon={faLock} className="text-xs" />
                        <span>{t('post.commentsDisabled')}</span>
                    </div>
                ) : (
                    <button
                        onClick={(e) => { e.stopPropagation(); if (!isDetailView) handleNavigate(); }}
                        className="
                        flex flex-row items-center gap-1.5 px-3 py-1.5
                        rounded-full text-sm font-medium
                        text-text-muted hover:bg-surface-hover hover:text-text
                        transition-colors duration-150
                    ">
                        <FontAwesomeIcon icon={faComment} className="text-xs" />
                        <span>{post.comments}</span>
                    </button>
                )}

                <div className="relative">
                    <button
                        onClick={(e) => { e.stopPropagation(); setShowShareMenu(prev => !prev); setShowActionMenu(false); }}
                        className="
                        flex flex-row items-center gap-1.5 px-3 py-1.5
                        rounded-full text-sm font-medium
                        text-text-muted hover:bg-surface-hover hover:text-text
                        transition-colors duration-150
                    ">
                        <FontAwesomeIcon icon={faShare} className="text-xs" />
                        <span>{t('post.share')}</span>
                    </button>

                    {showShareMenu && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setShowShareMenu(false); }} />
                            <div
                                className="absolute left-0 bottom-full mb-1 w-44 bg-surface border border-border rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] z-50 overflow-hidden animate-fade-in py-1"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button onClick={handleCopyLink} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-muted hover:bg-surface-hover hover:text-text transition-colors text-left">
                                    <FontAwesomeIcon icon={faLink} className="w-4" />
                                    {linkCopied ? t('post.copied') : t('post.copyLink')}
                                </button>
                                <button onClick={handleShareX} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-muted hover:bg-surface-hover hover:text-text transition-colors text-left">
                                    <FontAwesomeIcon icon={faTwitter} className="w-4 text-[#1DA1F2]" />
                                    {t('post.shareX')}
                                </button>
                                <button onClick={handleShareFacebook} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-muted hover:bg-surface-hover hover:text-text transition-colors text-left">
                                    <FontAwesomeIcon icon={faFacebook} className="w-4 text-[#1877F2]" />
                                    {t('post.shareFB')}
                                </button>
                            </div>
                        </>
                    )}
                </div>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (!isLoggedIn) {
                            navigate({ to: "/auth" });
                            return;
                        }
                        toggleBookmark(post.id);
                    }}
                    className={`ml-auto w-8 h-8 flex items-center justify-center
                        rounded-full transition-colors duration-150 cursor-pointer
                        ${bookmarked
                            ? "text-primary "
                            : "text-text-faint hover:text-text hover:bg-surface-hover"}`}
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
                    author={post.author}
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
    )
}