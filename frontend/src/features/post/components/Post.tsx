import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faHeart as faHeartOutline,
    faComment,
    faBookmark as faBookmarkOutline,
} from "@fortawesome/free-regular-svg-icons"
import {
    faHeart as faHeartSolid,
    faBookmark as faBookmarkSolid,
    faShare,
    faEllipsis,
    faEyeSlash,
    faUserMinus,
    faFlag,
    faLink,
    faTrash,
    faPen,
    faFire,
    faStar,
    faUsers,
    faSeedling,
    faShieldHalved,
    faCrown,
    faGem,
    faFile,
    faDownload,
} from "@fortawesome/free-solid-svg-icons"
import { faTwitter, faFacebook } from "@fortawesome/free-brands-svg-icons"
import { useRef, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { formatFileSize } from "../helpers/postAttachmentLimits"
import EmojiBox from "@/shared/components/ui/EmojiBox"
import { Lightbox } from "@/shared/components/ui/Lightbox"
import { ReportModal } from "@/features/report"
import { EditPostModal } from ".."

const TAG_CLASSES = [
    "bg-tag-1/10 text-tag-1",
    "bg-tag-2/10 text-tag-2",
    "bg-tag-3/10 text-tag-3",
    "bg-tag-4/10 text-tag-4",
    "bg-tag-5/10 text-tag-5",
];

const BADGE_MAP = {
    foryou: { icon: faStar, label: "Recommended", classes: "text-tag-4 bg-tag-4/10 border border-tag-4/20" },
    following: { icon: faUsers, label: "Following", classes: "text-primary bg-primary-soft border border-primary/20" },
    hot: { icon: faFire, label: "Trending", classes: "text-accent-500 bg-accent-500/10 border border-accent-500/20" },
};

const RANK_MAP = {
    rookie: { icon: faSeedling, label: "Rookie", classes: "bg-neutral-400 text-white" },
    pro: { icon: faShieldHalved, label: "Pro", classes: "bg-success-500 text-white" },
    master: { icon: faCrown, label: "Master", classes: "bg-primary text-white" },
    legend: { icon: faGem, label: "Legend", classes: "bg-accent-500 text-white" },
};

export interface PostFileAttachment {
    id: string;
    name: string;
    url: string;
    size: number;
    mimeType: string;
}

export interface PostData {
    id: string | number;
    author: string;
    authorAvatar: string;
    authorRank?: "rookie" | "pro" | "master" | "legend";
    gameTag: string;
    timeAgo: string;
    title: string;
    content: string;
    images?: string[];
    files?: PostFileAttachment[];
    tags: string[];
    likes: number;
    comments: number;
    tab?: "foryou" | "following" | "hot";
}

interface PostProps {
    post: PostData;
    isOwner?: boolean;
    onDelete?: (id: string | number) => void;
    onEdit?: (
        id: string | number,
        data: { title: string; content: string; images?: string[]; files?: PostFileAttachment[] }
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
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(post.likes);
    const [bookmarked, setBookmarked] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const [showActionMenu, setShowActionMenu] = useState(false);
    const [showShareMenu, setShowShareMenu] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [hidden, setHidden] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);

    const [isEmojiOpen, setIsEmojiOpen] = useState(false);

    const pressHoldTimeoutRef = useRef<number | null>(null);
    const isLongPressRef = useRef(false);

    const navigate = useNavigate();

    if (hidden) return null;

    const postUrl = `${window.location.origin}/post/${post.id}`;

    const toggleLike = () => {
        setLiked((prev) => !prev);
        setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
    };

    const handleNavigate = () => {
        if (isDetailView) return;
        navigate({ to: '/post/$postId', params: { postId: post.id.toString() } });
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

    const handleSaveEdit = (data: {
        title: string;
        content: string;
        images?: string[];
        files?: PostFileAttachment[];
    }) => {
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

    const handleMouseDown = (e: React.MouseEvent) => {
        e.stopPropagation();
        isLongPressRef.current = false;

        pressHoldTimeoutRef.current = setTimeout(() => {
            setIsEmojiOpen(true);
            isLongPressRef.current = true;
        }, 700);
    };

    const handleMouseUp = (e: React.MouseEvent) => {
        e.stopPropagation();

        if (pressHoldTimeoutRef.current) {
            clearTimeout(pressHoldTimeoutRef.current);
        }

        if (!isLongPressRef.current) {
            toggleLike();
        }
    };

    const handleMouseLeave = () => {
        if (pressHoldTimeoutRef.current) {
            clearTimeout(pressHoldTimeoutRef.current);
        }
    };

    const handleSelectEmoji = (reactionId: string, char: string) => {
        console.log(`Đã chọn cảm xúc: ${reactionId} (${char})`);
        setIsEmojiOpen(false);
    };

    const badge = post.tab ? BADGE_MAP[post.tab] : null;
    const rank = post.authorRank ? RANK_MAP[post.authorRank] : null;

    return (
        <article
            onClick={handleNavigate}
            className={`
            w-full overflow-hidden
            bg-surface/90 backdrop-blur-sm
            border border-border
            rounded-2xl
            shadow-[0_2px_12px_rgba(0,0,0,0.06)]
            dark:shadow-[0_2px_16px_rgba(0,0,0,0.30)]
            transition-all duration-200 ease-out
            ${isDetailView ? "" : "cursor-pointer"}
        `}>

            <div className="flex flex-row items-center gap-3 px-4 pt-4 pb-3">
                <div className="relative shrink-0">
                    <img
                        src={post.authorAvatar}
                        alt={post.author}
                        className="w-9 h-9 rounded-full object-cover ring-1 ring-border"
                    />
                    {rank && (
                        <span
                            title={rank.label}
                            className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 flex items-center justify-center rounded-full ring-2 ring-surface text-[8px] ${rank.classes}`}
                        >
                            <FontAwesomeIcon icon={rank.icon} />
                        </span>
                    )}
                </div>

                <div className="flex flex-col flex-1 leading-tight min-w-0">
                    <div className="flex flex-row items-center gap-2 flex-wrap">
                        <p className="font-semibold text-[15px] text-text hover:underline">{post.author}</p>

                        {rank && (
                            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${rank.classes}`}>
                                {rank.label}
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
                        <span>{post.timeAgo}</span>
                        <span>•</span>
                        <span>{post.gameTag}</span>
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
                            <div className="absolute right-0 top-full mt-1 w-48 bg-surface border border-border rounded-xl shadow-lg z-50 overflow-hidden animate-fade-in py-1">
                                {isOwner ? (
                                    <>
                                        <button onClick={handleEdit} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-muted hover:bg-surface-hover hover:text-text transition-colors text-left">
                                            <FontAwesomeIcon icon={faPen} className="w-4" />
                                            Edit Post
                                        </button>
                                        <button onClick={handleDelete} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-accent-500 hover:bg-surface-hover transition-colors text-left font-medium border-t border-border/50">
                                            <FontAwesomeIcon icon={faTrash} className="w-4" />
                                            Delete Post
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={handleNotInterested} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-muted hover:bg-surface-hover hover:text-text transition-colors text-left">
                                            <FontAwesomeIcon icon={faEyeSlash} className="w-4" />
                                            Not interested
                                        </button>
                                        <button onClick={handleUnfollow} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-muted hover:bg-surface-hover hover:text-text transition-colors text-left">
                                            <FontAwesomeIcon icon={faUserMinus} className="w-4" />
                                            Unfollow @{post.author}
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); setShowActionMenu(false); setShowReportModal(true); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-accent-500 hover:bg-surface-hover transition-colors text-left mt-1 border-t border-border/50">
                                            <FontAwesomeIcon icon={faFlag} className="w-4" />
                                            Report post
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
                                    ${TAG_CLASSES[idx % TAG_CLASSES.length]}`}
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

            <div className="flex flex-row items-center gap-0.5 px-3 py-2.5 border-t border-border">

                <div className="relative inline-block">
                    <EmojiBox
                        isOpen={isEmojiOpen}
                        onClose={() => setIsEmojiOpen(false)}
                        onSelect={handleSelectEmoji}
                    />

                    <button
                        onMouseDown={handleMouseDown}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseLeave}
                        className={`flex flex-row items-center gap-1.5 px-3 py-1.5 select-none
                    rounded-full text-sm font-medium transition-colors duration-150
                    ${liked
                                ? "text-like bg-like/10"
                                : "text-text-muted hover:bg-surface-hover hover:text-text"}`}
                    >
                        <FontAwesomeIcon icon={liked ? faHeartSolid : faHeartOutline} className="text-xs" />
                        <span>{likeCount}</span>
                    </button>
                </div>

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
                        <span>Share</span>
                    </button>

                    {showShareMenu && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setShowShareMenu(false); }} />
                            <div className="absolute left-0 bottom-full mb-1 w-44 bg-surface border border-border rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] z-50 overflow-hidden animate-fade-in py-1">
                                <button onClick={handleCopyLink} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-muted hover:bg-surface-hover hover:text-text transition-colors text-left">
                                    <FontAwesomeIcon icon={faLink} className="w-4" />
                                    {linkCopied ? "Copied!" : "Copy Link"}
                                </button>
                                <button onClick={handleShareX} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-muted hover:bg-surface-hover hover:text-text transition-colors text-left">
                                    <FontAwesomeIcon icon={faTwitter} className="w-4 text-[#1DA1F2]" />
                                    Share to X
                                </button>
                                <button onClick={handleShareFacebook} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-muted hover:bg-surface-hover hover:text-text transition-colors text-left">
                                    <FontAwesomeIcon icon={faFacebook} className="w-4 text-[#1877F2]" />
                                    Share to Facebook
                                </button>
                            </div>
                        </>
                    )}
                </div>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setBookmarked((prev) => !prev);
                    }}
                    className={`ml-auto w-8 h-8 flex items-center justify-center
                        rounded-full transition-colors duration-150
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
                    onClose={() => setShowEditModal(false)}
                    onSave={handleSaveEdit}
                />
            )}
        </article>
    )
}