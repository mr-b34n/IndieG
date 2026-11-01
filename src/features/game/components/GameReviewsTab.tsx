import React, { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faThumbsUp,
    faThumbsDown,
    faPlus,
    faHeart,
    faStar,
    faClock,
    faComments,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "@/shared/hooks/useTranslate";
import { useGameReviewsQuery, useLikeGameReviewMutation } from "@/shared/api/useQueries";
import { mapGameReviewDtoToGameReview } from "@/shared/api/types";
import { type GameReview, type GameData } from "../types";
import { CreateReviewModal } from "./CreateReviewModal";

interface GameReviewsTabProps {
    game: GameData;
    gameAppid: number;
}

export const GameReviewsTab: React.FC<GameReviewsTabProps> = ({ game, gameAppid }) => {
    const { lang } = useTranslation();
    const isVietnamese = lang === "vi";

    const [recommendedFilter, setRecommendedFilter] = useState<"all" | "recommended" | "not_recommended">("all");
    const [sortBy, setSortBy] = useState<"newest" | "oldest" | "most_liked" | "highest_rating" | "lowest_rating">("newest");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [likedReviewIds, setLikedReviewIds] = useState<Record<string, boolean>>({});

    const isRecBoolean =
        recommendedFilter === "recommended"
            ? true
            : recommendedFilter === "not_recommended"
            ? false
            : undefined;

    // Fetch reviews from backend
    const { data: remoteReviewsData, isLoading, refetch } = useGameReviewsQuery(
        gameAppid,
        {
            recommended: isRecBoolean,
            sort: sortBy,
            limit: 50,
        }
    );

    const likeMutation = useLikeGameReviewMutation();

    const reviews: GameReview[] = useMemo(() => {
        const rawList = Array.isArray(remoteReviewsData)
            ? remoteReviewsData
            : (remoteReviewsData as any)?.data || (remoteReviewsData as any)?.items || [];

        if (rawList.length > 0) {
            return rawList.map((r: any) => mapGameReviewDtoToGameReview(r));
        }

        if (game.reviews && game.reviews.length > 0) {
            return game.reviews;
        }

        return [];
    }, [remoteReviewsData, game.reviews]);

    const handleLike = async (review: GameReview, e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (likedReviewIds[review.id]) return;

        setLikedReviewIds((prev) => ({ ...prev, [review.id]: true }));
        try {
            await likeMutation.mutateAsync({ appid: gameAppid, id: review.id });
        } catch {
            setLikedReviewIds((prev) => ({ ...prev, [review.id]: false }));
        }
    };

    const totalCount = reviews.length;
    const recommendedCount = reviews.filter((r) => r.recommended).length;
    const positivePercentage = totalCount > 0 ? Math.round((recommendedCount / totalCount) * 100) : null;
    const averageScore = totalCount > 0
        ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / totalCount).toFixed(1)
        : null;

    const getSentimentLabel = (percentage: number | null) => {
        if (percentage === null) return "";
        if (percentage >= 80) return isVietnamese ? "Rất tích cực" : "Very Positive";
        if (percentage >= 70) return isVietnamese ? "Tích cực" : "Positive";
        if (percentage >= 40) return isVietnamese ? "Trộn lẫn" : "Mixed";
        return isVietnamese ? "Tiêu cực" : "Negative";
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Header & Overall Summary Card */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-text">
                            {isVietnamese ? "Đánh giá từ người chơi" : "Player Reviews"}
                        </h2>
                        <p className="text-xs text-text-muted mt-0.5">
                            {isVietnamese
                                ? `Những nhận xét và đánh giá chân thực từ cộng đồng game thủ ${game.name}`
                                : `Honest impressions and ratings from ${game.name} players`}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-4 py-2 rounded-xl font-semibold bg-primary text-white hover:bg-primary-hover transition-all text-xs sm:text-sm cursor-pointer shrink-0 shadow-sm active:scale-98 flex items-center gap-1.5"
                    >
                        <FontAwesomeIcon icon={faPlus} />
                        <span>{isVietnamese ? "Viết đánh giá" : "Write a Review"}</span>
                    </button>
                </div>

                {/* Score Summary Banner if reviews exist */}
                {totalCount > 0 && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-surface/35 border border-border/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-surface/80 border border-border/40 flex flex-col items-center justify-center shrink-0 shadow-xs">
                                <span className="font-mono font-black text-xl text-primary leading-none">
                                    {averageScore}
                                </span>
                                <span className="text-[10px] text-text-muted mt-0.5 font-medium">/ 10</span>
                            </div>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-text">
                                        {getSentimentLabel(positivePercentage)}
                                    </span>
                                    {positivePercentage !== null && (
                                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                            {positivePercentage}% {isVietnamese ? "khuyên chơi" : "positive"}
                                        </span>
                                    )}
                                </div>
                                <span className="text-xs text-text-muted mt-0.5">
                                    {isVietnamese
                                        ? `Dựa trên tổng cộng ${totalCount} bài đánh giá`
                                        : `Based on ${totalCount} player reviews`}
                                </span>
                            </div>
                        </div>

                        {/* Visual Ratio Progress Bar */}
                        {positivePercentage !== null && (
                            <div className="w-full sm:w-56 flex flex-col gap-1.5">
                                <div className="h-2 w-full bg-rose-500/30 rounded-full overflow-hidden flex">
                                    <div
                                        className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                                        style={{ width: `${positivePercentage}%` }}
                                    />
                                </div>
                                <div className="flex items-center justify-between text-[11px] text-text-muted font-medium">
                                    <span className="text-emerald-400">{recommendedCount} {isVietnamese ? "ủng hộ" : "recommend"}</span>
                                    <span className="text-rose-400">{totalCount - recommendedCount} {isVietnamese ? "không ủng hộ" : "not recommend"}</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Filter & Sort Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-border/20">
                {/* Recommendation Filters */}
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                    <button
                        type="button"
                        onClick={() => setRecommendedFilter("all")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                            recommendedFilter === "all"
                                ? "bg-surface-hover text-text font-semibold ring-1 ring-border/40 shadow-xs"
                                : "text-text-muted hover:text-text hover:bg-surface/50"
                        }`}
                    >
                        {isVietnamese ? "Tất cả" : "All"} ({totalCount})
                    </button>
                    <button
                        type="button"
                        onClick={() => setRecommendedFilter("recommended")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                            recommendedFilter === "recommended"
                                ? "bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/30 shadow-xs"
                                : "text-text-muted hover:text-emerald-400 hover:bg-surface/50"
                        }`}
                    >
                        <FontAwesomeIcon icon={faThumbsUp} className="text-[11px]" />
                        <span>{isVietnamese ? "Khuyên chơi" : "Recommended"}</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setRecommendedFilter("not_recommended")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                            recommendedFilter === "not_recommended"
                                ? "bg-rose-500/15 text-rose-400 font-semibold border border-rose-500/30 shadow-xs"
                                : "text-text-muted hover:text-rose-400 hover:bg-surface/50"
                        }`}
                    >
                        <FontAwesomeIcon icon={faThumbsDown} className="text-[11px]" />
                        <span>{isVietnamese ? "Không khuyên" : "Not Recommended"}</span>
                    </button>
                </div>

                {/* Sort selector */}
                <div className="flex items-center gap-2">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="px-3 py-1.5 rounded-lg bg-surface border border-border/30 text-xs text-text font-medium focus:outline-none focus:border-primary transition-colors cursor-pointer"
                    >
                        <option value="newest">{isVietnamese ? "Mới nhất" : "Newest"}</option>
                        <option value="most_liked">{isVietnamese ? "Nhiều like nhất" : "Most Liked"}</option>
                        <option value="highest_rating">{isVietnamese ? "Điểm cao nhất" : "Highest Rating"}</option>
                        <option value="lowest_rating">{isVietnamese ? "Điểm thấp nhất" : "Lowest Rating"}</option>
                        <option value="oldest">{isVietnamese ? "Cũ nhất" : "Oldest"}</option>
                    </select>
                </div>
            </div>

            {/* Reviews List */}
            {isLoading ? (
                <div className="flex flex-col gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-32 rounded-xl bg-surface/30 animate-pulse border border-border/10" />
                    ))}
                </div>
            ) : reviews.length > 0 ? (
                <div className="flex flex-col gap-4">
                    {reviews.map((rev) => {
                        const isLiked = Boolean(likedReviewIds[rev.id]);
                        const currentLikes = rev.likes + (isLiked ? 1 : 0);

                        return (
                            <article
                                key={rev.id}
                                className="p-4 sm:p-5 rounded-xl bg-surface/30 hover:bg-surface/45 border border-border/20 hover:border-border/40 transition-all flex flex-col gap-3.5 shadow-2xs"
                            >
                                {/* Author & Recommendation Header */}
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={rev.authorAvatar}
                                            alt={rev.author}
                                            className="w-10 h-10 rounded-full object-cover shrink-0 bg-surface ring-1 ring-border/30"
                                        />
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-sm text-text">
                                                {rev.author}
                                            </span>
                                            <div className="flex items-center gap-2 text-xs text-text-muted">
                                                {rev.hoursPlayed && (
                                                    <span className="flex items-center gap-1 text-text-muted/80">
                                                        <FontAwesomeIcon icon={faClock} className="text-[10px]" />
                                                        <span>{rev.hoursPlayed}</span>
                                                    </span>
                                                )}
                                                {rev.hoursPlayed && <span>·</span>}
                                                <span>{rev.date}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Recommendation & Score Badges */}
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`text-xs font-semibold px-2.5 py-1 rounded-md border flex items-center gap-1.5 ${
                                                rev.recommended
                                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                                                    : "bg-rose-500/10 text-rose-400 border-rose-500/25"
                                            }`}
                                        >
                                            <FontAwesomeIcon icon={rev.recommended ? faThumbsUp : faThumbsDown} className="text-[11px]" />
                                            <span>
                                                {rev.recommended
                                                    ? (isVietnamese ? "Khuyên chơi" : "Recommended")
                                                    : (isVietnamese ? "Không khuyên" : "Not Recommended")}
                                            </span>
                                        </span>

                                        <span className="font-mono text-xs font-bold px-2 py-1 rounded-md bg-surface border border-border/30 text-text">
                                            {rev.rating}/10
                                        </span>
                                    </div>
                                </div>

                                {/* Review Content */}
                                <p className="text-sm text-text-muted leading-relaxed whitespace-pre-line font-normal">
                                    {rev.content}
                                </p>

                                {/* Like action footer */}
                                <div className="flex items-center justify-between pt-2 border-t border-border/10 text-xs">
                                    <button
                                        type="button"
                                        onClick={(e) => handleLike(rev, e)}
                                        className={`flex items-center gap-1.5 transition-colors cursor-pointer px-2.5 py-1 rounded-md ${
                                            isLiked
                                                ? "text-rose-500 bg-rose-500/10 font-semibold"
                                                : "text-text-muted hover:text-text hover:bg-surface/50"
                                        }`}
                                    >
                                        <FontAwesomeIcon icon={faHeart} className="text-xs" />
                                        <span>{currentLikes > 0 ? `${currentLikes} ${isVietnamese ? "hữu ích" : "helpful"}` : (isVietnamese ? "Hữu ích" : "Helpful")}</span>
                                    </button>

                                    <span className="text-[11px] text-text-muted/60">
                                        {isVietnamese ? "Đánh giá cộng đồng" : "Community Review"}
                                    </span>
                                </div>
                            </article>
                        );
                    })}
                </div>
            ) : (
                <div className="py-16 text-center flex flex-col items-center justify-center gap-3 border border-dashed border-border/30 rounded-2xl bg-surface/10 p-6">
                    <div className="w-12 h-12 rounded-full bg-surface/50 border border-border/30 flex items-center justify-center text-text-muted text-lg">
                        <FontAwesomeIcon icon={faStar} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-text">
                            {isVietnamese ? "Chưa có đánh giá nào từ cộng đồng" : "No community reviews yet"}
                        </p>
                        <p className="text-xs text-text-muted max-w-sm mt-1">
                            {isVietnamese
                                ? "Hãy là người đầu tiên trải nghiệm và chia sẻ cảm nghĩ của bạn về trò chơi này."
                                : "Be the first to share your gameplay impressions with the community."}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsCreateModalOpen(true)}
                        className="mt-2 px-4 py-2 rounded-xl font-semibold bg-primary text-white hover:bg-primary-hover transition-all text-xs cursor-pointer shadow-sm active:scale-98 flex items-center gap-1.5"
                    >
                        <FontAwesomeIcon icon={faPlus} />
                        <span>{isVietnamese ? "Viết đánh giá đầu tiên" : "Write First Review"}</span>
                    </button>
                </div>
            )}

            {/* Create Review Modal */}
            <CreateReviewModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                gameAppid={gameAppid}
                gameName={game.name}
                onSuccess={() => refetch()}
            />
        </div>
    );
};
