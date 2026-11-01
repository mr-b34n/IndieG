import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faPaperPlane, faHeart, faTrash, faSpinner, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import type { GuestbookComment } from "../../types";

interface GuestbookTabProps {
    comments: GuestbookComment[];
    newCommentText: string;
    onChangeNewComment: (text: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    onToggleLike: (id: string) => void;
    onDeleteComment?: (id: string) => void;
    isLoading?: boolean;
    isSubmitting?: boolean;
    displayName: string;
    t: (key: string, opts?: Record<string, unknown>) => string;
}

/**
 * Chat-wall style guestbook: alternating left/right bubbles with clean monochrome tones.
 */
export const GuestbookTab = ({
    comments,
    newCommentText,
    onChangeNewComment,
    onSubmit,
    onToggleLike,
    onDeleteComment,
    isLoading = false,
    isSubmitting = false,
    displayName,
    t,
}: GuestbookTabProps) => (
    <div className="flex flex-col gap-5 animate-fade-in">
        <form onSubmit={onSubmit} className="bg-surface rounded-[14px] p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text">
                <FontAwesomeIcon icon={faPen} className="text-primary" />
                <span>{t("profile.guestbookFormTitle", { name: displayName })}</span>
            </div>
            <textarea
                value={newCommentText}
                onChange={(e) => onChangeNewComment(e.target.value)}
                rows={3}
                placeholder={t("profile.guestbookPlaceholder")}
                className="w-full px-4 py-3 rounded-[8px] bg-surface-inner text-text placeholder-text-faint text-xs font-medium focus:outline-none resize-none"
            />
            {newCommentText.trim().length > 0 && newCommentText.trim().length < 6 && (
                <p className="text-xs text-amber-500 font-medium flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faTriangleExclamation} />
                    <span>{t("profile.guestbookMinLenError", { min: 6, current: newCommentText.trim().length })}</span>
                </p>
            )}
            <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-text-muted">{t("profile.guestbookHint")}</span>
                <button
                    type="submit"
                    disabled={newCommentText.trim().length < 6 || isSubmitting}
                    className="px-4 py-2 rounded-[6px] bg-primary hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-2"
                >
                    <FontAwesomeIcon icon={isSubmitting ? faSpinner : faPaperPlane} className={isSubmitting ? "animate-spin" : ""} />
                    <span>{t("profile.postComment")}</span>
                </button>
            </div>
        </form>

        <div className="flex flex-col gap-4">
            {isLoading ? (
                <div className="bg-surface rounded-[12px] p-8 text-center text-text-muted text-xs flex items-center justify-center gap-2">
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin text-sm text-primary" />
                    <span>Đang tải lời nhắn...</span>
                </div>
            ) : comments.length > 0 ? (
                comments.map((c, idx) => {
                    const fromRight = idx % 2 === 1;
                    return (
                        <div key={c.id} className={`flex items-start gap-3 max-w-[92%] sm:max-w-[75%] ${fromRight ? "self-end flex-row-reverse" : "self-start"}`}>
                            <img src={c.avatar} alt={c.author} className="w-10 h-10 rounded-full object-cover shrink-0 mt-0.5" />
                            <div
                                className={`flex flex-col gap-1.5 min-w-0 rounded-[12px] px-4 py-3 ${
                                    fromRight 
                                        ? "bg-surface-inner rounded-tr-xs" 
                                        : "bg-surface rounded-tl-xs"
                                }`}
                            >
                                <div className={`flex items-center justify-between gap-3 ${fromRight ? "flex-row-reverse" : ""}`}>
                                    <div className={`flex items-center gap-2 ${fromRight ? "flex-row-reverse" : ""}`}>
                                        <h5 className="font-bold text-text text-sm">{c.author}</h5>
                                        <span className="text-[10px] text-text-muted">{c.date}</span>
                                    </div>
                                    {c.canDelete && onDeleteComment && (
                                        <button
                                            type="button"
                                            onClick={() => onDeleteComment(c.id)}
                                            title="Xóa lời nhắn"
                                            className="text-text-muted hover:text-rose-500 text-xs transition-colors p-1 cursor-pointer"
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    )}
                                </div>
                                <p className="text-xs text-text-muted leading-relaxed font-medium">{c.content}</p>
                                <button
                                    onClick={() => onToggleLike(c.id)}
                                    className={`self-start flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition-all cursor-pointer ${
                                        c.isLiked ? "bg-rose-500/15 text-rose-500" : "bg-surface-hover text-text-muted hover:text-text hover:bg-surface-active"
                                    } ${fromRight ? "self-end" : ""}`}
                                >
                                    <FontAwesomeIcon icon={faHeart} className={c.isLiked ? "animate-bounce text-rose-500" : ""} />
                                    <span>{c.likes > 0 ? c.likes : t("profile.likeBtn")}</span>
                                </button>
                            </div>
                        </div>
                    );
                })
            ) : (
                <div className="bg-surface rounded-[12px] p-8 text-center text-text-muted text-xs">
                    {t("profile.noComments")}
                </div>
            )}
        </div>
    </div>
);
