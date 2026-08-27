import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPen,
    faXmark,
    faImages,
    faLink,
} from "@fortawesome/free-solid-svg-icons";
import { useAuthStore } from "@/features/auth";
import type { CategoryItem } from "./CommunityHubCategories";

interface CreateThreadModalProps {
    isOpen: boolean;
    onClose: () => void;
    categories: CategoryItem[];
    onSubmit: (threadData: { title: string; category: string; content: string }) => void;
    communityName: string;
    isVi: boolean;
}

export const CreateThreadModal = ({
    isOpen,
    onClose,
    categories,
    onSubmit,
    communityName,
    isVi,
}: CreateThreadModalProps) => {
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState(categories[0]?.id || "general");
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        if (!useAuthStore.getState().requireVerifiedEmail("tạo thảo luận mới")) return;

        setIsSubmitting(true);
        setTimeout(() => {
            onSubmit({ title: title.trim(), category, content: content.trim() });
            setTitle("");
            setContent("");
            setIsSubmitting(false);
            onClose();
        }, 300);
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <div className="bg-surface border border-divider-primary w-full max-w-lg p-5 rounded-[4px] space-y-4 shadow-2xl relative animate-slide-up">
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-divider-primary pb-3">
                    <span className="font-extrabold text-sm text-text uppercase tracking-tight flex items-center gap-2">
                        <FontAwesomeIcon icon={faPen} className="text-primary text-xs" />
                        <span>{isVi ? `Đăng bài trong ${communityName}` : `Start Discussion in ${communityName}`}</span>
                    </span>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-7 h-7 rounded-[4px] border border-divider-primary flex items-center justify-center text-text-muted hover:text-text cursor-pointer text-xs transition-colors"
                    >
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3.5">
                    {/* Title */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-text block">
                            {isVi ? "Tiêu đề bài viết:" : "Title:"}
                        </label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={isVi ? "Nhập tiêu đề thảo luận..." : "What do you want to discuss?"}
                            className="w-full bg-surface-inner border border-divider-primary rounded-[4px] px-3 py-2 text-xs text-text placeholder:text-text-faint focus:outline-none focus:border-primary"
                        />
                    </div>

                    {/* Category */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-text block">
                            {isVi ? "Danh mục:" : "Category:"}
                        </label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full bg-surface-inner border border-divider-primary rounded-[4px] px-3 py-2 text-xs font-bold text-text focus:outline-none focus:border-primary"
                        >
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {isVi ? cat.titleVi : cat.titleEn}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Content */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-text block">
                            {isVi ? "Nội dung:" : "Content:"}
                        </label>
                        <textarea
                            rows={5}
                            required
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder={isVi ? "Chia sẻ chi tiết câu hỏi, kinh nghiệm hoặc thiết kế..." : "Write your thoughts, tips, or questions..."}
                            className="w-full bg-surface-inner border border-divider-primary rounded-[4px] px-3 py-2 text-xs text-text placeholder:text-text-faint focus:outline-none focus:border-primary resize-y"
                        />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                        <button
                            type="button"
                            className="px-2.5 py-1 rounded-[4px] border border-divider-primary text-xs font-semibold text-text-muted hover:text-text cursor-pointer flex items-center gap-1.5"
                        >
                            <FontAwesomeIcon icon={faImages} className="text-[11px]" />
                            <span>Image</span>
                        </button>
                        <button
                            type="button"
                            className="px-2.5 py-1 rounded-[4px] border border-divider-primary text-xs font-semibold text-text-muted hover:text-text cursor-pointer flex items-center gap-1.5"
                        >
                            <FontAwesomeIcon icon={faLink} className="text-[11px]" />
                            <span>Link</span>
                        </button>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-divider-primary">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-[4px] border border-divider-primary hover:bg-surface-hover text-xs font-bold text-text-muted hover:text-text cursor-pointer transition-colors"
                        >
                            {isVi ? "Hủy" : "Cancel"}
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-5 py-2 rounded-[4px] bg-primary hover:bg-primary/90 text-white text-xs font-bold cursor-pointer shadow-xs transition-colors disabled:opacity-50"
                        >
                            {isSubmitting
                                ? (isVi ? "Đang đăng..." : "Publishing...")
                                : (isVi ? "Đăng bài" : "Publish Discussion")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
