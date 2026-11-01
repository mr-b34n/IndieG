import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faStar,
    faThumbsUp,
    faThumbsDown,
    faSpinner,
    faClock,
} from "@fortawesome/free-solid-svg-icons";
import { AppModal } from "@/shared/components/ui/AppModal";
import { useTranslation } from "@/shared/hooks/useTranslate";
import { useCreateGameReviewMutation } from "@/shared/api/useQueries";
import { useAuthStore } from "@/features/auth";

interface CreateReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    gameAppid: number;
    gameName?: string;
    onSuccess?: () => void;
}

export const CreateReviewModal: React.FC<CreateReviewModalProps> = ({
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

    const [rating, setRating] = useState<number>(9);
    const [recommended, setRecommended] = useState<boolean>(true);
    const [hoursPlayed, setHoursPlayed] = useState<string>("25 giờ");
    const [content, setContent] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const createMutation = useCreateGameReviewMutation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);

        if (!content.trim() || content.trim().length < 10) {
            setErrorMessage(isVietnamese ? "Vui lòng nhập nhận xét tối thiểu 10 ký tự" : "Review must be at least 10 characters");
            return;
        }

        if (!requireVerifiedEmail("viết đánh giá game")) return;

        try {
            await createMutation.mutateAsync({
                appid: gameAppid,
                dto: {
                    rating,
                    recommended,
                    hoursPlayed: hoursPlayed.trim() || undefined,
                    content: content.trim(),
                },
            });

            setContent("");
            onClose();
            onSuccess?.();
        } catch (err: any) {
            setErrorMessage(err?.message || (isVietnamese ? "Không thể gửi đánh giá, bạn có thể đã đánh giá game này rồi" : "Failed to submit review"));
        }
    };

    return (
        <AppModal
            isOpen={isOpen}
            onClose={onClose}
            title={isVietnamese ? "Viết Đánh Giá Game" : "Write a Review"}
            subtitle={
                gameName
                    ? (isVietnamese ? `Chia sẻ trải nghiệm của bạn về tựa game ${gameName}` : `Share your thoughts about ${gameName}`)
                    : undefined
            }
            icon={faStar}
            maxWidth="lg"
        >
            <form onSubmit={handleSubmit} className="flex flex-col gap-5 pt-2">
                {errorMessage && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
                        {errorMessage}
                    </div>
                )}

                {/* Recommended choice: Yes / No */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                        {isVietnamese ? "Bạn có khuyến nghị tựa game này?" : "Do you recommend this game?"} *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setRecommended(true)}
                            className={`p-3.5 rounded-xl border flex items-center justify-center gap-2 font-bold text-sm transition-all cursor-pointer ${
                                recommended
                                    ? "bg-emerald-500/15 border-emerald-500 text-emerald-400 shadow-sm shadow-emerald-500/10"
                                    : "bg-surface border-border/30 text-text-muted hover:border-border hover:text-text"
                            }`}
                        >
                            <FontAwesomeIcon icon={faThumbsUp} />
                            <span>{isVietnamese ? "Khuyên chơi (Yes)" : "Recommended"}</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setRecommended(false)}
                            className={`p-3.5 rounded-xl border flex items-center justify-center gap-2 font-bold text-sm transition-all cursor-pointer ${
                                !recommended
                                    ? "bg-rose-500/15 border-rose-500 text-rose-400 shadow-sm shadow-rose-500/10"
                                    : "bg-surface border-border/30 text-text-muted hover:border-border hover:text-text"
                            }`}
                        >
                            <FontAwesomeIcon icon={faThumbsDown} />
                            <span>{isVietnamese ? "Không khuyên (No)" : "Not Recommended"}</span>
                        </button>
                    </div>
                </div>

                {/* Rating score (1 to 10) */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                            {isVietnamese ? "Điểm đánh giá (1 - 10)" : "Rating Score (1 - 10)"} *
                        </label>
                        <span className="text-sm font-black text-amber-400 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                            {rating} / 10
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5 justify-between">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                            <button
                                key={score}
                                type="button"
                                onClick={() => setRating(score)}
                                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                                    rating >= score
                                        ? "bg-amber-500 text-white shadow-sm shadow-amber-500/20"
                                        : "bg-surface text-text-muted border border-border/30 hover:border-amber-400/50"
                                }`}
                            >
                                {score}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Hours Played */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                        {isVietnamese ? "Thời gian đã trải nghiệm game" : "Hours Played"}
                    </label>
                    <div className="relative">
                        <FontAwesomeIcon icon={faClock} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint text-xs" />
                        <input
                            type="text"
                            value={hoursPlayed}
                            onChange={(e) => setHoursPlayed(e.target.value)}
                            placeholder="VD: 30 giờ, 50.5 hours..."
                            className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-surface border border-border/40 text-text text-sm focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>
                </div>

                {/* Review Content */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                        {isVietnamese ? "Nội dung nhận xét & cảm nhận" : "Review Content"} *
                    </label>
                    <textarea
                        rows={5}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={
                            isVietnamese
                                ? "Chia sẻ cảm nhận về gameplay, đồ họa, âm thanh, điểm hay và điểm trừ của trò chơi..."
                                : "Describe your thoughts on gameplay, mechanics, graphics, audio, pros and cons..."
                        }
                        className="w-full px-4 py-3 rounded-xl bg-surface border border-border/40 text-text text-sm focus:outline-none focus:border-primary transition-colors resize-y leading-relaxed font-sans"
                        maxLength={5000}
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
                                <span>{isVietnamese ? "Đang gửi..." : "Submitting..."}</span>
                            </>
                        ) : (
                            <span>{isVietnamese ? "Đăng đánh giá" : "Submit Review"}</span>
                        )}
                    </button>
                </div>
            </form>
        </AppModal>
    );
};
