import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBookOpen,
    faCheck,
    faSpinner,
    faLightbulb,
} from "@fortawesome/free-solid-svg-icons";
import { AppModal } from "@/shared/components/ui/AppModal";
import { useTranslation } from "@/shared/hooks/useTranslate";
import { useCreateGameGuideMutation } from "@/shared/api/useQueries";
import { useAuthStore } from "@/features/auth";

interface CreateGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
    gameAppid: number;
    gameName?: string;
    onSuccess?: () => void;
}

export const CreateGuideModal: React.FC<CreateGuideModalProps> = ({
    isOpen,
    onClose,
    gameAppid,
    gameName,
    onSuccess,
}) => {
    const { lang } = useTranslation();
    const isVietnamese = lang === "vi";

    const user = useAuthStore((state) => state.user);
    const requireVerifiedEmail = useAuthStore((state) => state.requireVerifiedEmail);

    const [title, setTitle] = useState("");
    const [category, setCategory] = useState<"general" | "tactics" | "builds" | "secrets">("tactics");
    const [rank, setRank] = useState("All Ranks");
    const [content, setContent] = useState("");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const createMutation = useCreateGameGuideMutation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);

        if (!title.trim()) {
            setErrorMessage(isVietnamese ? "Vui lòng nhập tiêu đề bài viết" : "Title is required");
            return;
        }

        if (!content.trim() || content.trim().length < 20) {
            setErrorMessage(isVietnamese ? "Nội dung bài viết quá ngắn (tối thiểu 20 ký tự)" : "Content must be at least 20 characters");
            return;
        }

        if (!requireVerifiedEmail("viết cẩm nang hướng dẫn")) return;

        try {
            await createMutation.mutateAsync({
                appid: gameAppid,
                dto: {
                    title: title.trim(),
                    category,
                    rank: rank.trim() || undefined,
                    content: content.trim(),
                },
            });

            setTitle("");
            setContent("");
            onClose();
            onSuccess?.();
        } catch (err: any) {
            setErrorMessage(err?.message || (isVietnamese ? "Không thể tạo bài viết, vui lòng thử lại" : "Failed to create guide"));
        }
    };

    const categories: { id: "general" | "tactics" | "builds" | "secrets"; label: string; desc: string }[] = [
        {
            id: "tactics",
            label: isVietnamese ? "Chiến thuật & Kỹ năng" : "Tactics & Gameplay",
            desc: isVietnamese ? "Mẹo combat, di chuyển, chiến lược" : "Combat, movement, strategy",
        },
        {
            id: "builds",
            label: isVietnamese ? "Builds & Trang bị" : "Character Builds",
            desc: isVietnamese ? "Cộng điểm, vũ khí, combo đồ" : "Stats, weapons, gear sets",
        },
        {
            id: "secrets",
            label: isVietnamese ? "Bí mật & Trứng phục sinh" : "Secrets & Easter Eggs",
            desc: isVietnamese ? "Khu vực ẩn, vật phẩm hiếm, lore" : "Hidden areas, rare items, lore",
        },
        {
            id: "general",
            label: isVietnamese ? "Kinh nghiệm chung" : "General Guides",
            desc: isVietnamese ? "Hướng dẫn tân thủ, thiết lập phím" : "Beginner advice, keybinds",
        },
    ];

    return (
        <AppModal
            isOpen={isOpen}
            onClose={onClose}
            title={isVietnamese ? "Viết Cẩm Nang Hướng Dẫn" : "Create Game Guide"}
            subtitle={
                gameName
                    ? (isVietnamese ? `Chia sẻ kinh nghiệm chơi tựa game ${gameName}` : `Share your knowledge for ${gameName}`)
                    : undefined
            }
            icon={faBookOpen}
            maxWidth="2xl"
        >
            <form onSubmit={handleSubmit} className="flex flex-col gap-5 pt-2">
                {errorMessage && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
                        {errorMessage}
                    </div>
                )}

                {/* Title */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                        {isVietnamese ? "Tiêu đề bài hướng dẫn" : "Guide Title"} *
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={
                            isVietnamese
                                ? "VD: Cách kiểm soát độ giật súng AK-47 chuẩn cao thủ..."
                                : "E.g. Ultimate beginner guide to map control..."
                        }
                        className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border/40 text-text text-sm focus:outline-none focus:border-primary transition-colors"
                        maxLength={200}
                    />
                </div>

                {/* Category Selection */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                        {isVietnamese ? "Danh mục cẩm nang" : "Category"} *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {categories.map((c) => {
                            const isSelected = category === c.id;
                            return (
                                <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => setCategory(c.id)}
                                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-0.5 ${
                                        isSelected
                                            ? "border-primary bg-primary/10 text-text"
                                            : "border-border/30 bg-surface/60 text-text-muted hover:border-border/70 hover:text-text"
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-xs text-text">{c.label}</span>
                                        {isSelected && <FontAwesomeIcon icon={faCheck} className="text-primary text-xs" />}
                                    </div>
                                    <span className="text-[11px] text-text-muted">{c.desc}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Rank / Audience */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                        {isVietnamese ? "Cấp bậc người xem phù hợp" : "Target Rank / Experience"}
                    </label>
                    <input
                        type="text"
                        value={rank}
                        onChange={(e) => setRank(e.target.value)}
                        placeholder="All Ranks / Beginner / Pro"
                        className="w-full px-4 py-2 rounded-xl bg-surface border border-border/40 text-text text-sm focus:outline-none focus:border-primary transition-colors"
                    />
                </div>

                {/* Content */}
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                            {isVietnamese ? "Nội dung chi tiết" : "Content (Markdown supported)"} *
                        </label>
                        <span className="text-[11px] text-text-muted">
                            <FontAwesomeIcon icon={faLightbulb} className="mr-1 text-amber-400" />
                            {isVietnamese ? "Hỗ trợ định dạng Markdown" : "Supports Markdown"}
                        </span>
                    </div>
                    <textarea
                        rows={8}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={
                            isVietnamese
                                ? "Viết chi tiết các bước, mẹo thực chiến, kinh nghiệm của bạn...\n\n### 1. Bước chuẩn bị\n- Điểm A...\n- Điểm B..."
                                : "Write your step-by-step tactics, strategies, tips...\n\n### 1. Preparation\n- Step A..."
                        }
                        className="w-full px-4 py-3 rounded-xl bg-surface border border-border/40 text-text text-sm focus:outline-none focus:border-primary transition-colors resize-y leading-relaxed font-sans"
                    />
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/30">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2.5 rounded-xl text-sm font-semibold text-text-muted hover:text-text transition-colors cursor-pointer"
                    >
                        {isVietnamese ? "Hủy" : "Cancel"}
                    </button>
                    <button
                        type="submit"
                        disabled={createMutation.isPending}
                        className="px-6 py-2.5 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary-hover transition-colors shadow-md shadow-primary/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                        {createMutation.isPending ? (
                            <>
                                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                                <span>{isVietnamese ? "Đang xuất bản..." : "Publishing..."}</span>
                            </>
                        ) : (
                            <span>{isVietnamese ? "Xuất bản cẩm nang" : "Publish Guide"}</span>
                        )}
                    </button>
                </div>
            </form>
        </AppModal>
    );
};
