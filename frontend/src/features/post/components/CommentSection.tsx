import { useEffect, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as faHeartOutline } from "@fortawesome/free-regular-svg-icons";
import { faHeart as faHeartSolid, faReply, faImage, faFaceSmile, faXmark, faLock, faEllipsis, faTrash, faFlag, faCopy, faCheck, faPen, faThumbtack } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "@tanstack/react-router";

import avatarUser from "../../../assets/logos/raft-logo.png";
import { useAuthStore } from "@/features/auth";
import { usePostsStore } from "../store/usePostsStore";
import { useNotificationStore } from "@/features/notification/store/useNotificationStore";
import { ReportModal } from "@/features/report";
import { getCurrentAuthor } from "../helpers/getCurrentAuthor";
import { getUserRankConfig } from "../helpers/userRanks";

// Chỉ cho phép đính kèm ảnh trong bình luận, tối đa 2MB/ảnh, không hỗ trợ gửi file khác.
const MAX_COMMENT_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB
const COMMENT_IMAGE_ACCEPT = "image/*";

export interface CommentData {
    id: string | number;
    author: string;
    authorAvatar: string;
    content: string;
    timeAgo: string;
    likes: number;
    image?: string; // URL ảnh đính kèm (nếu có)
    replies?: CommentData[]; // 👈 Bổ sung danh sách reply con
    pinned?: boolean; // 👈 Ghim bình luận
}

interface CommentSectionProps {
    postId: string;
}

interface CommentItemProps {
    comment: CommentData;
    isLoggedIn: boolean;
    isCommentsAllowed?: boolean;
    sortBy?: "top" | "newest";
    onAddReply: (parentId: string | number, text: string, image?: string) => void;
    onDeleteComment?: (commentId: string | number) => void;
    onEditComment?: (commentId: string | number, newContent: string) => void;
    onTogglePinComment?: (commentId: string | number) => void;
}

/**
 * Hook nhỏ gọn xử lý chọn/validate/preview 1 ảnh đính kèm cho ô nhập bình luận.
 * Giới hạn: chỉ ảnh, tối đa MAX_COMMENT_IMAGE_SIZE, không cho phép file khác.
 */
function useCommentImageAttachment() {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Thu hồi object URL khi component unmount để tránh rò rỉ bộ nhớ
    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSelect = (selected: File | null) => {
        if (!selected) return;

        if (!selected.type.startsWith("image/")) {
            setError("Chỉ hỗ trợ đính kèm file ảnh.");
            return;
        }

        if (selected.size > MAX_COMMENT_IMAGE_SIZE) {
            setError("Ảnh không được vượt quá 2MB.");
            return;
        }

        if (previewUrl) URL.revokeObjectURL(previewUrl);

        setFile(selected);
        setPreviewUrl(URL.createObjectURL(selected));
        setError(null);
    };

    const clear = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setFile(null);
        setPreviewUrl(null);
        setError(null);
        if (inputRef.current) inputRef.current.value = "";
    };

    const openPicker = () => inputRef.current?.click();

    // Convert file gốc sang base64 data URL để lưu bền vững vào comment
    // (khác với previewUrl là blob URL, chỉ dùng tạm lúc soạn thảo và sẽ bị revoke sau khi gửi).
    const toDataUrl = (): Promise<string | undefined> => {
        return new Promise((resolve) => {
            if (!file) {
                resolve(undefined);
                return;
            }
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => resolve(undefined);
            reader.readAsDataURL(file);
        });
    };

    return { previewUrl, error, inputRef, handleSelect, clear, openPicker, toDataUrl };
}

const CommentImageInput = ({ inputRef, onSelect }: { inputRef: React.RefObject<HTMLInputElement | null>; onSelect: (file: File | null) => void }) => (
    <input
        ref={inputRef}
        type="file"
        accept={COMMENT_IMAGE_ACCEPT}
        className="hidden"
        onChange={(e) => {
            onSelect(e.target.files?.[0] ?? null);
            e.target.value = "";
        }}
    />
);

const CommentImagePreview = ({ url, onRemove }: { url: string; onRemove: () => void }) => (
    <div className="relative w-20 h-20 group">
        <img src={url} alt="Ảnh đính kèm" className="w-20 h-20 object-cover rounded-xl border border-border" />
        <button
            type="button"
            onClick={onRemove}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center rounded-full bg-surface border border-border text-text-muted hover:text-accent-500 hover:border-accent-500/50 shadow-sm"
            title="Gỡ ảnh"
        >
            <FontAwesomeIcon icon={faXmark} className="text-[10px]" />
        </button>
    </div>
);

const MENTION_USERS = [
    "ProGamer99",
    "DevCreator",
    "ChillVibes",
    "CyberSamurai",
    "PixelQueen",
    "Alex_Dev",
    "Elena_V",
    "GamerMaster",
    "RetroKing",
    "Shouko_Pro",
    "NeoCyber",
    "GamerX99",
];

const triggerMentionNotifications = (text: string, postId: string) => {
    const matches = text.match(/@(\w+)/g) || [];
    const seen = new Set<string>();
    matches.forEach((m) => {
        const username = m.slice(1);
        if (seen.has(username)) return;
        seen.add(username);
        useNotificationStore.getState().addNotification({
            type: "mention",
            title: `${getCurrentAuthor()} đã nhắc đến bạn (@${username}) trong một bình luận`,
            message: text.slice(0, 100),
            avatarUrl: avatarUser,
            timestamp: "Vừa xong",
            link: `/post/${postId}`,
        });
    });
};

const renderCommentContent = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(@\w+)/g);
    return parts.map((part, idx) => {
        if (/^@\w+$/.test(part)) {
            const username = part.slice(1);
            const rankConfig = getUserRankConfig(username);
            return (
                <span
                    key={idx}
                    className={`${rankConfig.textColor} hover:underline cursor-pointer transition-colors inline-block font-bold`}
                    title={`Mentioned user ${part} (${rankConfig.label})`}
                >
                    {part}
                </span>
            );
        }
        return <span key={idx}>{part}</span>;
    });
};

const MentionTextArea = ({
    value,
    onChange,
    placeholder,
    className = "",
    rows = 1,
    autoFocus = false,
    inputRef,
}: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder?: string;
    className?: string;
    rows?: number;
    autoFocus?: boolean;
    inputRef?: React.RefObject<HTMLTextAreaElement | null>;
}) => {
    const [mentionState, setMentionState] = useState<{ query: string; start: number; end: number } | null>(null);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const internalRef = useRef<HTMLTextAreaElement>(null);
    const ref = inputRef || internalRef;

    const filteredUsers = useMemo(() => {
        if (!mentionState) return [];
        return MENTION_USERS.filter((u) => u.toLowerCase().startsWith(mentionState.query)).slice(0, 5);
    }, [mentionState]);

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        onChange(e);

        const cursor = e.target.selectionStart;
        const textBeforeCursor = val.slice(0, cursor);
        const match = textBeforeCursor.match(/@(\w*)$/);
        if (match) {
            setMentionState({ query: match[1].toLowerCase(), start: match.index!, end: cursor });
            setSelectedIndex(0);
        } else {
            setMentionState(null);
        }
    };

    const insertMention = (username: string) => {
        if (!mentionState) return;
        const before = value.slice(0, mentionState.start);
        const after = value.slice(mentionState.end);
        const nextVal = `${before}@${username} ${after}`;

        if (ref.current) {
            ref.current.value = nextVal;
            const fakeEvent = {
                target: ref.current,
                currentTarget: ref.current,
            } as unknown as React.ChangeEvent<HTMLTextAreaElement>;
            onChange(fakeEvent);
        }
        setMentionState(null);
    };

    return (
        <div className="relative w-full">
            {mentionState && filteredUsers.length > 0 && (
                <div className="absolute bottom-full left-0 mb-1 w-56 bg-surface border border-border rounded-xl shadow-xl overflow-hidden z-50 animate-fade-in">
                    <div className="px-3 py-1.5 bg-surface-hover/60 border-b border-border/50 text-[10px] font-bold text-text-faint uppercase tracking-wider flex items-center justify-between">
                        <span>Tag người dùng (@username)</span>
                        <span>↑↓ Enter</span>
                    </div>
                    <div className="max-h-40 overflow-y-auto">
                        {filteredUsers.map((user, idx) => {
                            const rankConfig = getUserRankConfig(user);
                            return (
                                <button
                                    key={user}
                                    type="button"
                                    onClick={() => insertMention(user)}
                                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-left text-xs transition-colors ${
                                        idx === selectedIndex ? "bg-surface-hover/80 font-semibold" : "hover:bg-surface-hover"
                                    }`}
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 ${rankConfig.classes}`}>
                                            <FontAwesomeIcon icon={rankConfig.icon} />
                                        </span>
                                        <span className={`truncate ${rankConfig.textColor}`}>@{user}</span>
                                    </div>
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${rankConfig.classes} shrink-0`}>
                                        {rankConfig.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
            <textarea
                ref={ref as React.Ref<HTMLTextAreaElement>}
                value={value}
                onChange={handleTextChange}
                onKeyDown={(e) => {
                    if (mentionState && filteredUsers.length > 0) {
                        if (e.key === "ArrowDown") {
                            e.preventDefault();
                            setSelectedIndex((prev) => (prev + 1) % filteredUsers.length);
                        } else if (e.key === "ArrowUp") {
                            e.preventDefault();
                            setSelectedIndex((prev) => (prev - 1 + filteredUsers.length) % filteredUsers.length);
                        } else if (e.key === "Enter" || e.key === "Tab") {
                            e.preventDefault();
                            insertMention(filteredUsers[selectedIndex]);
                        } else if (e.key === "Escape") {
                            setMentionState(null);
                        }
                    }
                }}
                placeholder={placeholder}
                className={className}
                rows={rows}
                autoFocus={autoFocus}
            />
        </div>
    );
};

const sortComments = (list: CommentData[], sort: "top" | "newest" = "top"): CommentData[] => {
    return [...list]
        .sort((a, b) => {
            if (a.pinned !== b.pinned) return Number(!!b.pinned) - Number(!!a.pinned);
            if (sort === "top") {
                return (b.likes || 0) - (a.likes || 0);
            } else {
                return b.id.toString().localeCompare(a.id.toString(), undefined, { numeric: true });
            }
        })
        .map((item) => {
            if (item.replies && item.replies.length > 0) {
                return { ...item, replies: sortComments(item.replies, sort) };
            }
            return item;
        });
};

const CommentItem = ({
    comment,
    isLoggedIn,
    isCommentsAllowed = true,
    sortBy = "top",
    onAddReply,
    onDeleteComment,
    onEditComment,
    onTogglePinComment,
}: CommentItemProps) => {
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(comment.likes);
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState("");
    const replyTextareaRef = useRef<HTMLTextAreaElement>(null);
    const replyImage = useCommentImageAttachment();
    const navigate = useNavigate();

    // Menu & Edit states
    const [showMenu, setShowMenu] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(comment.content);
    const [copied, setCopied] = useState(false);

    const currentAuthor = getCurrentAuthor();
    const isAuthor = comment.author === currentAuthor || comment.author === "You";

    const toggleLike = () => {
        setLiked((prev) => !prev);
        setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
        // Optimistic UI Update: Phản hồi ngay lập tức trên giao diện trước khi đồng bộ server
    };

    const handleReplyClick = () => {
        if (!isLoggedIn) {
            navigate({ to: "/auth" });
            return;
        }
        setIsReplying((prev) => !prev);
    };

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setReplyText(e.target.value);
        e.target.style.height = "auto";
        e.target.style.height = `${e.target.scrollHeight}px`;
    };

    const handleSubmitSubReply = async () => {
        if (!replyText.trim() && !replyImage.previewUrl) return;
        const imageDataUrl = await replyImage.toDataUrl();
        onAddReply(comment.id, replyText.trim(), imageDataUrl);
        setReplyText("");
        replyImage.clear();
        setIsReplying(false);
        if (replyTextareaRef.current) replyTextareaRef.current.style.height = "auto";
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(comment.content);
        setCopied(true);
        setTimeout(() => {
            setCopied(false);
            setShowMenu(false);
        }, 1500);
    };

    const handleSaveEdit = () => {
        if (!editText.trim()) return;
        if (onEditComment) {
            onEditComment(comment.id, editText.trim());
        }
        setIsEditing(false);
    };

    const handleDelete = () => {
        if (onDeleteComment) {
            onDeleteComment(comment.id);
        }
        setShowMenu(false);
    };

    const handleTogglePin = () => {
        if (onTogglePinComment) {
            onTogglePinComment(comment.id);
        }
        setShowMenu(false);
    };

    return (
        <div className={`flex flex-col w-full animate-fade-in group ${showMenu ? "relative z-[100]" : "relative has-[.menu-dropdown]:z-[100]"}`}>
            <div className="flex flex-row items-start gap-3 w-full">
                <img
                    src={comment.authorAvatar}
                    alt={comment.author}
                    className="w-9 h-9 rounded-full object-cover shrink-0"
                />

                <div className="flex flex-col flex-1 gap-1 min-w-0">
                    <div className="flex flex-col">
                        <div className="flex flex-row items-center justify-between gap-2">
                            <div className="flex flex-row items-center gap-2 flex-wrap">
                                <p className={`font-bold text-[14px] hover:underline cursor-pointer ${getUserRankConfig(comment.author).textColor}`}>
                                    {comment.author}
                                </p>
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${getUserRankConfig(comment.author).classes}`}>
                                    <FontAwesomeIcon icon={getUserRankConfig(comment.author).icon} className="mr-1" />
                                    {getUserRankConfig(comment.author).label}
                                </span>
                                <span className="text-xs text-text-faint">· {comment.timeAgo}</span>
                                {comment.pinned && (
                                    <span 
                                        className="inline-flex items-center justify-center w-5 h-5 text-primary bg-primary/10 rounded-full"
                                        title="Bình luận đã ghim"
                                    >
                                        <FontAwesomeIcon icon={faThumbtack} className="text-[10px]" />
                                    </span>
                                )}
                            </div>

                            {/* 3 dots action menu */}
                            <div className={`relative shrink-0 ${showMenu ? "z-[100]" : ""}`}>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowMenu((prev) => !prev);
                                    }}
                                    className="w-7 h-7 flex items-center justify-center rounded-full text-text-faint hover:text-text hover:bg-surface-hover transition-colors opacity-70 group-hover:opacity-100 focus:opacity-100"
                                    title="Tùy chọn bình luận"
                                >
                                    <FontAwesomeIcon icon={faEllipsis} className="text-xs" />
                                </button>

                                {showMenu && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowMenu(false);
                                            }}
                                        />
                                        <div className="menu-dropdown absolute right-0 top-full mt-1 w-44 bg-surface border border-border rounded-xl shadow-[0_10px_30px_-5px_rgba(0,0,0,0.15)] dark:shadow-[0_10px_30px_-5px_rgba(0,0,0,0.45)] z-50 overflow-hidden animate-fade-in py-1">
                                            <button
                                                type="button"
                                                onClick={handleCopy}
                                                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-text-muted hover:bg-surface-hover hover:text-text transition-colors text-left"
                                            >
                                                <FontAwesomeIcon icon={copied ? faCheck : faCopy} className={`w-3.5 ${copied ? "text-success-500" : ""}`} />
                                                <span>{copied ? "Đã sao chép!" : "Sao chép bình luận"}</span>
                                            </button>

                                            {isAuthor && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditText(comment.content);
                                                        setIsEditing(true);
                                                        setShowMenu(false);
                                                    }}
                                                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-text-muted hover:bg-surface-hover hover:text-text transition-colors text-left"
                                                >
                                                    <FontAwesomeIcon icon={faPen} className="w-3.5" />
                                                    <span>Chỉnh sửa</span>
                                                </button>
                                            )}

                                            <button
                                                type="button"
                                                onClick={handleTogglePin}
                                                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-text-muted hover:bg-surface-hover hover:text-text transition-colors text-left"
                                            >
                                                <FontAwesomeIcon icon={faThumbtack} className="w-3.5" />
                                                <span>{comment.pinned ? "Bỏ ghim" : "Ghim bình luận"}</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowMenu(false);
                                                    setShowReportModal(true);
                                                }}
                                                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-text-muted hover:bg-surface-hover hover:text-text transition-colors text-left border-t border-border/40 mt-0.5 pt-2"
                                            >
                                                <FontAwesomeIcon icon={faFlag} className="w-3.5 text-accent-500" />
                                                <span>Báo cáo bình luận</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={handleDelete}
                                                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-accent-500 hover:bg-surface-hover transition-colors text-left font-medium"
                                            >
                                                <FontAwesomeIcon icon={faTrash} className="w-3.5" />
                                                <span>Xóa bình luận</span>
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {isEditing ? (
                            <div className="flex flex-col gap-2 mt-1.5 p-2.5 bg-surface-hover/50 border border-border/80 rounded-xl animate-fade-in">
                                <textarea
                                    value={editText}
                                    onChange={(e) => {
                                        setEditText(e.target.value);
                                        e.target.style.height = "auto";
                                        e.target.style.height = `${e.target.scrollHeight}px`;
                                    }}
                                    className="w-full bg-transparent text-sm text-text resize-none focus:outline-none min-h-12"
                                    rows={2}
                                    autoFocus
                                />
                                <div className="flex justify-end gap-2 pt-1 border-t border-border/40">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="px-3 py-1 rounded-full text-xs font-semibold text-text-muted hover:bg-surface transition-colors"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSaveEdit}
                                        disabled={!editText.trim()}
                                        className="px-3 py-1 rounded-full text-xs font-bold bg-primary text-white hover:bg-primary-hover disabled:opacity-50 transition-colors"
                                    >
                                        Lưu
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-[14px] text-text mt-0.5 leading-snug whitespace-pre-wrap break-words">
                                {renderCommentContent(comment.content)}
                            </p>
                        )}
                        {comment.image && (
                            <img
                                src={comment.image}
                                alt="Ảnh đính kèm"
                                className="mt-2 max-w-[220px] max-h-56 object-cover rounded-xl border border-border cursor-pointer hover:opacity-95 transition-opacity"
                            />
                        )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-row items-center gap-5 mt-1 text-xs font-medium text-text-faint">
                        <button 
                            onClick={toggleLike} 
                            className={`flex flex-row items-center gap-1.5 hover:text-like transition-colors ${liked ? "text-like" : ""}`}
                        >
                            <FontAwesomeIcon icon={liked ? faHeartSolid : faHeartOutline} className="text-xs" />
                            <span>{likeCount > 0 ? likeCount : ""}</span>
                        </button>

                        {isCommentsAllowed && (
                            <button 
                                onClick={handleReplyClick}
                                className={`flex flex-row items-center gap-1.5 hover:text-primary transition-colors ${isReplying ? "text-primary font-semibold" : ""}`}
                            >
                                <FontAwesomeIcon icon={faReply} className="text-xs" />
                                <span>Reply</span>
                            </button>
                        )}
                    </div>

                    {/* Inline Reply Input Box */}
                    {isReplying && isCommentsAllowed && (
                        <div className="flex flex-col gap-2 mt-3 p-3 bg-surface-hover/40 border border-border/60 rounded-xl animate-fade-in">
                            <MentionTextArea
                                inputRef={replyTextareaRef}
                                value={replyText}
                                onChange={handleInput}
                                placeholder={`Replying to @${comment.author}... Use @ to mention users`}
                                className="w-full bg-transparent text-sm text-text placeholder:text-text-faint resize-none overflow-hidden focus:outline-none min-h-8"
                                rows={1}
                                autoFocus
                            />

                            <CommentImageInput inputRef={replyImage.inputRef} onSelect={replyImage.handleSelect} />

                            {replyImage.previewUrl && (
                                <CommentImagePreview url={replyImage.previewUrl} onRemove={replyImage.clear} />
                            )}
                            {replyImage.error && (
                                <p className="text-xs text-accent-500 font-medium">{replyImage.error}</p>
                            )}

                            <div className="flex flex-row items-center justify-between gap-2 pt-1 border-t border-border/40">
                                <button
                                    type="button"
                                    onClick={replyImage.openPicker}
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:bg-surface-hover hover:text-primary transition-colors"
                                    title="Đính kèm ảnh (tối đa 2MB)"
                                >
                                    <FontAwesomeIcon icon={faImage} className="text-sm" />
                                </button>

                                <div className="flex flex-row gap-2">
                                    <button
                                        onClick={() => {
                                            setIsReplying(false);
                                            replyImage.clear();
                                        }}
                                        className="px-3 py-1 rounded-full text-xs font-semibold text-text-muted hover:bg-surface-hover transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSubmitSubReply}
                                        disabled={!replyText.trim() && !replyImage.previewUrl}
                                        className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                                            replyText.trim() || replyImage.previewUrl
                                                ? "bg-primary text-white hover:bg-primary-hover"
                                                : "bg-surface-hover text-text-faint cursor-not-allowed"
                                        }`}
                                    >
                                        Reply
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Render các Reply con (Nested Replies) */}
            {comment.replies && comment.replies.length > 0 && (
                <div className="ml-4 pl-4 border-l-2 border-border/40 flex flex-col gap-4 mt-3">
                    {sortComments(comment.replies, sortBy).map((subCmt) => (
                        <CommentItem
                            key={subCmt.id}
                            comment={subCmt}
                            isLoggedIn={isLoggedIn}
                            isCommentsAllowed={isCommentsAllowed}
                            sortBy={sortBy}
                            onAddReply={onAddReply}
                            onDeleteComment={onDeleteComment}
                            onEditComment={onEditComment}
                            onTogglePinComment={onTogglePinComment}
                        />
                    ))}
                </div>
            )}

            {showReportModal && (
                <ReportModal
                    postId={`comment-${comment.id}`}
                    author={comment.author}
                    onClose={() => setShowReportModal(false)}
                />
            )}
        </div>
    );
};

export const CommentSection = ({ postId }: CommentSectionProps) => {
    const post = usePostsStore((state) => state.getPostById(postId));
    const isCommentsAllowed = post?.allowComments !== false;
    const [commentText, setCommentText] = useState("");
    const [sortBy, setSortBy] = useState<"top" | "newest">("top");
    const mainTextareaRef = useRef<HTMLTextAreaElement>(null);
    const mainImage = useCommentImageAttachment();
    const user = useAuthStore((state) => state.user);
    const mockLogin = useAuthStore((state) => state.mockLogin);
    const isLoggedIn = !!user || mockLogin;
    const navigate = useNavigate();

    // Mock Data có chứa Reply con
    const [comments, setComments] = useState<CommentData[]>([
        {
            id: 1,
            author: "ProGamer99",
            authorAvatar: avatarUser,
            content: "Wow, layout đẹp quá bạn ơi! Có chia sẻ preset không?",
            timeAgo: "2 giờ trước",
            likes: 5,
            replies: [
                {
                    id: "1-1",
                    author: "DevCreator",
                    authorAvatar: avatarUser,
                    content: "Cảm ơn bạn! Mình dùng TailwindCSS kết hợp custom config thôi nhé.",
                    timeAgo: "1 giờ trước",
                    likes: 3,
                },
            ],
        },
        {
            id: 2,
            author: "ChillVibes",
            authorAvatar: avatarUser,
            content: "Nhìn cái này muốn tải game lại chơi luôn quá :D",
            timeAgo: "1 giờ trước",
            likes: 2,
        },
        {
            id: 3,
            author: getCurrentAuthor(),
            authorAvatar: avatarUser,
            content: "Bài viết rất chất lượng, mình đã ghim và xin phép lưu lại nhé!",
            timeAgo: "30 phút trước",
            likes: 10,
            pinned: true,
        },
    ]);

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setCommentText(e.target.value);
        e.target.style.height = "auto";
        e.target.style.height = `${e.target.scrollHeight}px`;
    };

    // Hàm đệ quy chèn reply mới vào đúng comment cha (kể cả comment con nhiều cấp)
    const addReplyToTree = (
        list: CommentData[],
        parentId: string | number,
        newReply: CommentData
    ): CommentData[] => {
        return list.map((cmt) => {
            if (cmt.id === parentId) {
                return {
                    ...cmt,
                    replies: [...(cmt.replies || []), newReply],
                };
            }
            if (cmt.replies && cmt.replies.length > 0) {
                return {
                    ...cmt,
                    replies: addReplyToTree(cmt.replies, parentId, newReply),
                };
            }
            return cmt;
        });
    };

    // Đăng bài reply chính (Top level comment)
    const handleMainReplySubmit = async () => {
        if (!commentText.trim() && !mainImage.previewUrl) return;
        const imageDataUrl = await mainImage.toDataUrl();
        const newComment: CommentData = {
            id: `${postId}-${Date.now()}`,
            author: getCurrentAuthor(),
            authorAvatar: avatarUser,
            content: commentText.trim(),
            timeAgo: "Vừa xong",
            likes: 0,
            image: imageDataUrl,
        };
        setComments((prev) => [...prev, newComment]);
        triggerMentionNotifications(commentText.trim(), postId);
        setCommentText("");
        mainImage.clear();
        if (mainTextareaRef.current) mainTextareaRef.current.style.height = "auto";
    };

    // Đăng sub-reply (Reply cho một comment cụ thể)
    const handleAddSubReply = (parentId: string | number, text: string, image?: string) => {
        const newSubReply: CommentData = {
            id: `sub-${Date.now()}`,
            author: getCurrentAuthor(),
            authorAvatar: avatarUser,
            content: text,
            timeAgo: "Vừa xong",
            likes: 0,
            image,
        };
        setComments((prev) => addReplyToTree(prev, parentId, newSubReply));
        triggerMentionNotifications(text, postId);
    };

    const canSubmitMain = commentText.trim().length > 0 || !!mainImage.previewUrl;

    const removeCommentFromTree = (list: CommentData[], targetId: string | number): CommentData[] => {
        return list
            .filter((item) => item.id !== targetId)
            .map((item) => {
                if (item.replies && item.replies.length > 0) {
                    return { ...item, replies: removeCommentFromTree(item.replies, targetId) };
                }
                return item;
            });
    };

    const editCommentInTree = (list: CommentData[], targetId: string | number, newContent: string): CommentData[] => {
        return list.map((item) => {
            if (item.id === targetId) {
                return { ...item, content: newContent };
            }
            if (item.replies && item.replies.length > 0) {
                return { ...item, replies: editCommentInTree(item.replies, targetId, newContent) };
            }
            return item;
        });
    };

    const togglePinCommentInTree = (list: CommentData[], targetId: string | number): CommentData[] => {
        return list.map((item) => {
            if (item.id === targetId) {
                return { ...item, pinned: !item.pinned };
            }
            if (item.replies && item.replies.length > 0) {
                return { ...item, replies: togglePinCommentInTree(item.replies, targetId) };
            }
            return item;
        });
    };

    const handleDeleteComment = (commentId: string | number) => {
        setComments((prev) => removeCommentFromTree(prev, commentId));
    };

    const handleEditComment = (commentId: string | number, newContent: string) => {
        setComments((prev) => editCommentInTree(prev, commentId, newContent));
    };

    const handleTogglePinComment = (commentId: string | number) => {
        setComments((prev) => togglePinCommentInTree(prev, commentId));
    };

    return (
        <div className="w-full flex flex-col pt-4 mt-2 border-t border-border">
            <div className="flex items-center justify-between px-4 mb-4">
                <h3 className="font-bold text-lg text-text">
                    Comments <span className="text-text-muted font-normal text-base ml-1">{comments.length}</span>
                </h3>
                {comments.length > 0 && (
                    <div className="flex items-center gap-1 bg-surface-hover/70 p-1 rounded-xl border border-border/60 text-xs font-semibold">
                        <button
                            type="button"
                            onClick={() => setSortBy("top")}
                            className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                                sortBy === "top" ? "bg-surface text-primary shadow-sm font-bold" : "text-text-muted hover:text-text"
                            }`}
                        >
                            <span>Nổi bật nhất</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setSortBy("newest")}
                            className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                                sortBy === "newest" ? "bg-surface text-primary shadow-sm font-bold" : "text-text-muted hover:text-text"
                            }`}
                        >
                            <span>Mới nhất</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Main comment input */}
            <div className="flex flex-row gap-3 px-4 mb-6">
                {!isCommentsAllowed ? (
                    <div className="w-full flex flex-col items-center justify-center p-6 bg-surface-hover/50 rounded-xl border border-border">
                        <div className="w-10 h-10 rounded-full bg-surface-hover flex items-center justify-center text-text-muted mb-2 shadow-sm">
                            <FontAwesomeIcon icon={faLock} className="text-base" />
                        </div>
                        <p className="font-bold text-text mb-1">Tính năng bình luận đã bị tắt</p>
                        <p className="text-sm text-text-muted text-center">Tác giả bài viết không cho phép để lại bình luận mới.</p>
                    </div>
                ) : isLoggedIn ? (
                    <>
                        <img src={avatarUser} alt="You" className="w-9 h-9 rounded-full object-cover ring-1 ring-border shrink-0" />
                        <div className="flex flex-col flex-1 gap-2">
                            <MentionTextArea
                                inputRef={mainTextareaRef}
                                value={commentText}
                                onChange={handleInput}
                                placeholder="Post your reply... Use @ to tag users"
                                className="w-full bg-transparent text-[15px] text-text placeholder:text-text-faint resize-none overflow-hidden focus:outline-none min-h-6"
                                rows={1}
                            />

                            <CommentImageInput inputRef={mainImage.inputRef} onSelect={mainImage.handleSelect} />

                            {mainImage.previewUrl && (
                                <CommentImagePreview url={mainImage.previewUrl} onRemove={mainImage.clear} />
                            )}
                            {mainImage.error && (
                                <p className="text-xs text-accent-500 font-medium">{mainImage.error}</p>
                            )}

                            <div className="flex flex-row justify-between items-center pt-2 border-t border-border">
                                <div className="flex flex-row gap-1">
                                    <button
                                        type="button"
                                        onClick={mainImage.openPicker}
                                        className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:bg-surface-hover hover:text-primary transition-colors"
                                        title="Đính kèm ảnh (tối đa 2MB)"
                                    >
                                        <FontAwesomeIcon icon={faImage} className="text-sm" />
                                    </button>
                                    <button className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:bg-surface-hover hover:text-primary transition-colors" title="Add emoji">
                                        <FontAwesomeIcon icon={faFaceSmile} className="text-sm" />
                                    </button>
                                </div>
                                <button 
                                    onClick={handleMainReplySubmit}
                                    disabled={!canSubmitMain}
                                    className={`px-4 py-1.5 rounded-full font-bold text-sm transition-colors ${
                                        canSubmitMain 
                                        ? "bg-primary text-white hover:bg-primary-hover" 
                                        : "bg-surface-hover text-text-faint cursor-not-allowed"
                                    }`}
                                >
                                    Reply
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="w-full flex flex-col items-center justify-center p-6 bg-surface-hover/50 rounded-xl border border-border">
                        <p className="font-semibold text-text mb-2">Join the discussion</p>
                        <p className="text-sm text-text-muted mb-4">You need to be logged in to leave a comment.</p>
                        <button 
                            onClick={() => navigate({ to: "/auth" })}
                            className="px-6 py-2 bg-primary text-white font-bold rounded-full hover:bg-primary-hover transition-colors shadow-sm"
                        >
                            Log in / Sign up
                        </button>
                    </div>
                )}
            </div>

            {/* List các comments */}
            <div className="flex flex-col gap-6 px-4 pb-4">
                {sortComments(comments, sortBy).map((cmt) => (
                    <CommentItem
                        key={cmt.id}
                        comment={cmt}
                        isLoggedIn={isLoggedIn}
                        isCommentsAllowed={isCommentsAllowed}
                        sortBy={sortBy}
                        onAddReply={handleAddSubReply}
                        onDeleteComment={handleDeleteComment}
                        onEditComment={handleEditComment}
                        onTogglePinComment={handleTogglePinComment}
                    />
                ))}
            </div>
        </div>
    );
};