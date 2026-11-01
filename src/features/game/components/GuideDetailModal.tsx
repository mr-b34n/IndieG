import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBookOpen,
    faHeart,
    faEye,
    faCalendarAlt,
    faUser,
    faTag,
} from "@fortawesome/free-solid-svg-icons";
import { AppModal } from "@/shared/components/ui/AppModal";
import { MarkdownContent } from "@/shared/components/ui/MarkdownContent";
import { useTranslation } from "@/shared/hooks/useTranslate";
import { type GameGuide } from "../types";

interface GuideDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    guide: GameGuide | null;
    onLike?: () => void;
    isLiked?: boolean;
}

export const GuideDetailModal: React.FC<GuideDetailModalProps> = ({
    isOpen,
    onClose,
    guide,
    onLike,
    isLiked,
}) => {
    const { lang } = useTranslation();
    const isVietnamese = lang === "vi";

    if (!guide) return null;

    const categoryLabels: Record<string, string> = {
        tactics: isVietnamese ? "Chiến thuật" : "Tactics",
        builds: isVietnamese ? "Xây dựng" : "Builds",
        secrets: isVietnamese ? "Bí mật" : "Secrets",
        general: isVietnamese ? "Tổng quan" : "General",
    };

    return (
        <AppModal
            isOpen={isOpen}
            onClose={onClose}
            title={guide.title}
            subtitle={
                <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                        <FontAwesomeIcon icon={faTag} className="mr-1 text-[10px]" />
                        {categoryLabels[guide.category] || guide.category}
                    </span>
                    {guide.rank && (
                        <span className="px-2 py-0.5 rounded-full bg-surface-hover text-text-muted text-xs font-medium border border-border/30">
                            {guide.rank}
                        </span>
                    )}
                </div>
            }
            icon={faBookOpen}
            maxWidth="2xl"
        >
            <div className="flex flex-col gap-6 pt-2">
                {/* Author & Stats Meta */}
                <div className="flex items-center justify-between pb-4 border-b border-border/30">
                    <div className="flex items-center gap-3">
                        <img
                            src={guide.authorAvatar}
                            alt={guide.author}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20 bg-surface"
                        />
                        <div className="flex flex-col">
                            <span className="font-bold text-sm text-text">{guide.author}</span>
                            <div className="flex items-center gap-2 text-xs text-text-muted">
                                <span>
                                    <FontAwesomeIcon icon={faCalendarAlt} className="mr-1 opacity-70" />
                                    {guide.date}
                                </span>
                                <span>·</span>
                                <span>
                                    <FontAwesomeIcon icon={faEye} className="mr-1 opacity-70" />
                                    {guide.views} {isVietnamese ? "lượt xem" : "views"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Like button */}
                    <button
                        type="button"
                        onClick={onLike}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isLiked
                                ? "bg-rose-500/10 text-rose-500 border border-rose-500/30"
                                : "bg-surface text-text-muted hover:text-rose-400 hover:bg-surface-hover border border-border/30"
                        }`}
                    >
                        <FontAwesomeIcon icon={faHeart} className={isLiked ? "text-rose-500" : ""} />
                        <span>{guide.likes}</span>
                    </button>
                </div>

                {/* Content with rich markdown */}
                <div className="text-[15px] text-text/90 leading-relaxed max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin">
                    <MarkdownContent content={guide.content} />
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-border/30 text-xs text-text-muted">
                    <span>
                        {isVietnamese
                            ? "Bài viết thuộc cẩm nang cộng đồng Ludon"
                            : "Ludon Community Guide"}
                    </span>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl bg-surface hover:bg-surface-hover text-text font-semibold border border-border/40 transition-colors cursor-pointer"
                    >
                        {isVietnamese ? "Đóng" : "Close"}
                    </button>
                </div>
            </div>
        </AppModal>
    );
};
