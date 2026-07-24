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
}

interface CommentSectionProps {
    postId: string;
}

const CommentItem = ({ comment }: { comment: CommentData }) => {
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(comment.likes);

    const toggleLike = () => {
        setLiked((prev) => !prev);
        setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
    };

    return (
        <div className="flex flex-row items-start gap-3 w-full animate-fade-in group">
            <img
                src={comment.authorAvatar}
                alt={comment.author}
                className="w-10 h-10 rounded-full object-cover shrink-0"
            />

            <div className="flex flex-col flex-1 gap-1 pb-4 border-b border-border/50 group-last:border-0">
                <div className="flex flex-col">
                    <div className="flex flex-row items-center gap-2">
                        <p className="font-bold text-[15px] text-text hover:underline cursor-pointer">{comment.author}</p>
                        <span className="text-sm text-text-faint">· {comment.timeAgo}</span>
                    </div>
                    <p className="text-[15px] text-text mt-0.5 leading-snug">
                        {comment.content}
                    </p>
                </div>

                <div className="flex flex-row items-center gap-6 mt-1 text-[13px] font-medium text-text-faint">
                    <button 
                        onClick={toggleLike} 
                        className={`flex flex-row items-center gap-1.5 hover:text-like transition-colors ${liked ? "text-like" : ""}`}
                    >
                        <FontAwesomeIcon icon={liked ? faHeartSolid : faHeartOutline} className="text-sm" />
                        <span>{likeCount > 0 ? likeCount : ""}</span>
                    </button>
                    <button className="flex flex-row items-center gap-1.5 hover:text-text transition-colors">
                        <FontAwesomeIcon icon={faReply} className="text-sm" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export const CommentSection = ({ postId }: CommentSectionProps) => {
    const [commentText, setCommentText] = useState("");
    const user = useAuthStore((state) => state.user);
    const mockLogin = useAuthStore((state) => state.mockLogin);
    const isLoggedIn = !!user || mockLogin;
    const navigate = useNavigate();

    const [comments, setComments] = useState<CommentData[]>([
        {
            id: 1,
            author: "ProGamer99",
            authorAvatar: avatarUser,
            content: "Wow, layout đẹp quá bạn ơi! Có chia sẻ preset không?",
            timeAgo: "2 giờ trước",
            likes: 5,
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

    const handleReplySubmit = () => {
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

    return (
        <div className="w-full flex flex-col pt-4 mt-2 border-t border-border">
            <h3 className="font-bold text-lg text-text px-4 mb-4">
                Comments <span className="text-text-muted font-normal text-base ml-1">{comments.length}</span>
            </h3>

            <div className="flex flex-row gap-3 px-4 mb-6">
                {isLoggedIn ? (
                    <>
                        <img src={avatarUser} alt="You" className="w-9 h-9 rounded-full object-cover ring-1 ring-border shrink-0" />
                        <div className="flex flex-col flex-1 gap-2">
                            <textarea
                                value={commentText}
                                onChange={handleInput}
                                placeholder="Post your reply..."
                                className="w-full bg-transparent text-[15px] text-text placeholder:text-text-faint resize-none overflow-hidden focus:outline-none min-h-[24px]"
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
                                    onClick={handleReplySubmit}
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

            <div className="flex flex-col gap-4 px-4 pb-4">
                {comments.map((cmt) => (
                    <CommentItem key={cmt.id} comment={cmt} />
                ))}
            </div>
        </div>
    );
};
