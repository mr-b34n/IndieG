import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as faHeartOutline } from "@fortawesome/free-regular-svg-icons";
import { faHeart as faHeartSolid, faReply, faImage, faFaceSmile } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "@tanstack/react-router";

import avatarUser from "../../../assets/logos/raft-logo.png";
import { useAuthStore } from "@/features/auth";

export interface CommentData {
    id: string | number;
    author: string;
    authorAvatar: string;
    content: string;
    timeAgo: string;
    likes: number;
    replies?: CommentData[]; // 👈 Bổ sung danh sách reply con
}

interface CommentSectionProps {
    postId: string;
}

interface CommentItemProps {
    comment: CommentData;
    isLoggedIn: boolean;
    onAddReply: (parentId: string | number, text: string) => void;
}

const CommentItem = ({ comment, isLoggedIn, onAddReply }: CommentItemProps) => {
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(comment.likes);
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState("");
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

    const handleSubmitSubReply = () => {
        if (!replyText.trim()) return;
        onAddReply(comment.id, replyText.trim());
        setReplyText("");
        setIsReplying(false);
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
                                value={replyText}
                                onChange={handleInput}
                                placeholder={`Replying to @${comment.author}...`}
                                className="w-full bg-transparent text-sm text-text placeholder:text-text-faint resize-none overflow-hidden focus:outline-none min-h-8"
                                rows={1}
                                autoFocus
                            />
                            <div className="flex flex-row justify-end gap-2 pt-1 border-t border-border/40">
                                <button
                                    onClick={() => setIsReplying(false)}
                                    className="px-3 py-1 rounded-full text-xs font-semibold text-text-muted hover:bg-surface-hover transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmitSubReply}
                                    disabled={!replyText.trim()}
                                    className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                                        replyText.trim()
                                            ? "bg-primary text-white hover:bg-primary-hover"
                                            : "bg-surface-hover text-text-faint cursor-not-allowed"
                                    }`}
                                >
                                    Reply
                                </button>
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
    const handleMainReplySubmit = () => {
        if (!commentText.trim()) return;
        const newComment: CommentData = {
            id: `${postId}-${Date.now()}`,
            author: "You",
            authorAvatar: avatarUser,
            content: commentText.trim(),
            timeAgo: "Just now",
            likes: 0,
        };
        setComments((prev) => [...prev, newComment]);
        setCommentText("");
    };

    // Đăng sub-reply (Reply cho một comment cụ thể)
    const handleAddSubReply = (parentId: string | number, text: string) => {
        const newSubReply: CommentData = {
            id: `sub-${Date.now()}`,
            author: "You",
            authorAvatar: avatarUser,
            content: text,
            timeAgo: "Just now",
            likes: 0,
        };
        setComments((prev) => addReplyToTree(prev, parentId, newSubReply));
    };

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
                                value={commentText}
                                onChange={handleInput}
                                placeholder="Post your reply..."
                                className="w-full bg-transparent text-[15px] text-text placeholder:text-text-faint resize-none overflow-hidden focus:outline-none min-h-6"
                                rows={1}
                            />
                            <div className="flex flex-row justify-between items-center pt-2 border-t border-border">
                                <div className="flex flex-row gap-1">
                                    <button className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:bg-surface-hover hover:text-primary transition-colors" title="Add image">
                                        <FontAwesomeIcon icon={faImage} className="text-sm" />
                                    </button>
                                    <button className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:bg-surface-hover hover:text-primary transition-colors" title="Add emoji">
                                        <FontAwesomeIcon icon={faFaceSmile} className="text-sm" />
                                    </button>
                                </div>
                                <button 
                                    onClick={handleMainReplySubmit}
                                    disabled={!commentText.trim()}
                                    className={`px-4 py-1.5 rounded-full font-bold text-sm transition-colors ${
                                        commentText.trim() 
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