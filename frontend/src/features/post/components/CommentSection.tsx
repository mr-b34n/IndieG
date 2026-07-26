import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as faHeartOutline } from "@fortawesome/free-regular-svg-icons";
import { faHeart as faHeartSolid, faReply, faImage, faFaceSmile, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "@tanstack/react-router";

import avatarUser from "../../../assets/logos/raft-logo.png";
import { useAuthStore } from "@/features/auth";

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
}

interface CommentSectionProps {
    postId: string;
}

interface CommentItemProps {
    comment: CommentData;
    isLoggedIn: boolean;
    onAddReply: (parentId: string | number, text: string, image?: string) => void;
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

const CommentItem = ({ comment, isLoggedIn, onAddReply }: CommentItemProps) => {
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(comment.likes);
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState("");
    const replyTextareaRef = useRef<HTMLTextAreaElement>(null);
    const replyImage = useCommentImageAttachment();
    const navigate = useNavigate();

    const toggleLike = () => {
        setLiked((prev) => !prev);
        setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
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

    return (
        <div className="flex flex-col w-full animate-fade-in group">
            <div className="flex flex-row items-start gap-3 w-full">
                <img
                    src={comment.authorAvatar}
                    alt={comment.author}
                    className="w-9 h-9 rounded-full object-cover shrink-0"
                />

                <div className="flex flex-col flex-1 gap-1">
                    <div className="flex flex-col">
                        <div className="flex flex-row items-center gap-2">
                            <p className="font-bold text-[14px] text-text hover:underline cursor-pointer">
                                {comment.author}
                            </p>
                            <span className="text-xs text-text-faint">· {comment.timeAgo}</span>
                        </div>
                        <p className="text-[14px] text-text mt-0.5 leading-snug">
                            {comment.content}
                        </p>
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

                        <button 
                            onClick={handleReplyClick}
                            className={`flex flex-row items-center gap-1.5 hover:text-primary transition-colors ${isReplying ? "text-primary font-semibold" : ""}`}
                        >
                            <FontAwesomeIcon icon={faReply} className="text-xs" />
                            <span>Reply</span>
                        </button>
                    </div>

                    {/* Inline Reply Input Box */}
                    {isReplying && (
                        <div className="flex flex-col gap-2 mt-3 p-3 bg-surface-hover/40 border border-border/60 rounded-xl animate-fade-in">
                            <textarea
                                ref={replyTextareaRef}
                                value={replyText}
                                onChange={handleInput}
                                placeholder={`Replying to @${comment.author}...`}
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
                    {comment.replies.map((subCmt) => (
                        <CommentItem
                            key={subCmt.id}
                            comment={subCmt}
                            isLoggedIn={isLoggedIn}
                            onAddReply={onAddReply}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export const CommentSection = ({ postId }: CommentSectionProps) => {
    const [commentText, setCommentText] = useState("");
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
            author: "You",
            authorAvatar: avatarUser,
            content: commentText.trim(),
            timeAgo: "Just now",
            likes: 0,
            image: imageDataUrl,
        };
        setComments((prev) => [...prev, newComment]);
        setCommentText("");
        mainImage.clear();
        if (mainTextareaRef.current) mainTextareaRef.current.style.height = "auto";
    };

    // Đăng sub-reply (Reply cho một comment cụ thể)
    const handleAddSubReply = (parentId: string | number, text: string, image?: string) => {
        const newSubReply: CommentData = {
            id: `sub-${Date.now()}`,
            author: "You",
            authorAvatar: avatarUser,
            content: text,
            timeAgo: "Just now",
            likes: 0,
            image,
        };
        setComments((prev) => addReplyToTree(prev, parentId, newSubReply));
    };

    const canSubmitMain = commentText.trim().length > 0 || !!mainImage.previewUrl;

    return (
        <div className="w-full flex flex-col pt-4 mt-2 border-t border-border">
            <h3 className="font-bold text-lg text-text px-4 mb-4">
                Comments <span className="text-text-muted font-normal text-base ml-1">{comments.length}</span>
            </h3>

            {/* Main comment input */}
            <div className="flex flex-row gap-3 px-4 mb-6">
                {isLoggedIn ? (
                    <>
                        <img src={avatarUser} alt="You" className="w-9 h-9 rounded-full object-cover ring-1 ring-border shrink-0" />
                        <div className="flex flex-col flex-1 gap-2">
                            <textarea
                                ref={mainTextareaRef}
                                value={commentText}
                                onChange={handleInput}
                                placeholder="Post your reply..."
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
                {comments.map((cmt) => (
                    <CommentItem
                        key={cmt.id}
                        comment={cmt}
                        isLoggedIn={isLoggedIn}
                        onAddReply={handleAddSubReply}
                    />
                ))}
            </div>
        </div>
    );
};