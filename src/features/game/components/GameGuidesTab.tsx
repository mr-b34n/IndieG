import React, { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlus,
    faHeart,
    faSearch,
    faBookOpen,
    faCalendarDays,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "@/shared/hooks/useTranslate";
import { useGameGuidesQuery, useLikeGameGuideMutation } from "@/shared/api/useQueries";
import { mapGameGuideDtoToGameGuide } from "@/shared/api/types";
import { type GameGuide, type GameData } from "../types";
import { CreateGuideModal } from "./CreateGuideModal";
import { GuideDetailModal } from "./GuideDetailModal";

interface GameGuidesTabProps {
    game: GameData;
    gameAppid: number;
}

export const GameGuidesTab: React.FC<GameGuidesTabProps> = ({ game, gameAppid }) => {
    const { lang } = useTranslation();
    const isVietnamese = lang === "vi";

    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<"newest" | "oldest" | "most_liked" | "most_viewed">("newest");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedGuide, setSelectedGuide] = useState<GameGuide | null>(null);
    const [likedGuideIds, setLikedGuideIds] = useState<Record<string, boolean>>({});

    // Fetch guides from backend
    const { data: remoteGuidesData, isLoading, refetch } = useGameGuidesQuery(
        gameAppid,
        {
            category: selectedCategory !== "all" ? (selectedCategory as any) : undefined,
            sort: sortBy,
            limit: 50,
        }
    );

    const likeMutation = useLikeGameGuideMutation();

    const guides: GameGuide[] = useMemo(() => {
        const rawList = Array.isArray(remoteGuidesData)
            ? remoteGuidesData
            : (remoteGuidesData as any)?.data || (remoteGuidesData as any)?.items || [];

        if (rawList.length > 0) {
            return rawList.map((g: any) => mapGameGuideDtoToGameGuide(g));
        }

        if (game.guides && game.guides.length > 0) {
            return game.guides;
        }

        return [];
    }, [remoteGuidesData, game.guides]);

    const filteredGuides = useMemo(() => {
        if (!searchQuery.trim()) return guides;
        const q = searchQuery.toLowerCase().trim();
        return guides.filter(
            (g) =>
                g.title.toLowerCase().includes(q) ||
                g.content.toLowerCase().includes(q) ||
                g.author.toLowerCase().includes(q)
        );
    }, [guides, searchQuery]);

    const handleLike = async (guide: GameGuide, e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (likedGuideIds[guide.id]) return;

        setLikedGuideIds((prev) => ({ ...prev, [guide.id]: true }));
        try {
            await likeMutation.mutateAsync({ appid: gameAppid, id: guide.id });
        } catch {
            setLikedGuideIds((prev) => ({ ...prev, [guide.id]: false }));
        }
    };

    const categories = [
        { id: "all", label: isVietnamese ? "Tất cả" : "All" },
        { id: "tactics", label: isVietnamese ? "Chiến thuật" : "Tactics" },
        { id: "builds", label: isVietnamese ? "Builds" : "Builds" },
        { id: "secrets", label: isVietnamese ? "Bí mật" : "Secrets" },
        { id: "general", label: isVietnamese ? "Kinh nghiệm chung" : "General" },
    ];

    return (
        <div className="flex flex-col gap-6">
            {/* Header with Title & Action */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
                <div>
                    <h2 className="text-xl font-bold tracking-tight text-text">
                        {isVietnamese ? "Cẩm nang & Hướng dẫn" : "Community Guides"}
                    </h2>
                    <p className="text-xs text-text-muted mt-0.5">
                        {isVietnamese
                            ? `Bí kíp chiến thuật và cẩm nang do game thủ ${game.name} chia sẻ`
                            : `Tactics, strategies, and guides shared by ${game.name} players`}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-4 py-2 rounded-xl font-semibold bg-primary text-white hover:bg-primary-hover transition-all text-xs sm:text-sm cursor-pointer shrink-0 shadow-sm active:scale-98 flex items-center gap-1.5"
                >
                    <FontAwesomeIcon icon={faPlus} />
                    <span>{isVietnamese ? "Viết cẩm nang" : "Write Guide"}</span>
                </button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-border/20">
                {/* Category Links */}
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                    {categories.map((c) => (
                        <button
                            key={c.id}
                            type="button"
                            onClick={() => setSelectedCategory(c.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                                selectedCategory === c.id
                                    ? "bg-surface-hover text-text font-semibold ring-1 ring-border/40 shadow-xs"
                                    : "text-text-muted hover:text-text hover:bg-surface/50"
                            }`}
                        >
                            {c.label}
                        </button>
                    ))}
                </div>

                {/* Search & Sort */}
                <div className="flex items-center gap-2 shrink-0">
                    <div className="relative flex-1 sm:w-48">
                        <FontAwesomeIcon
                            icon={faSearch}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xs pointer-events-none"
                        />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={isVietnamese ? "Tìm cẩm nang..." : "Search guides..."}
                            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-surface border border-border/30 text-xs text-text focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="px-2.5 py-1.5 rounded-lg bg-surface border border-border/30 text-xs text-text font-medium focus:outline-none focus:border-primary transition-colors cursor-pointer"
                    >
                        <option value="newest">{isVietnamese ? "Mới nhất" : "Newest"}</option>
                        <option value="most_liked">{isVietnamese ? "Nhiều like nhất" : "Most Liked"}</option>
                        <option value="most_viewed">{isVietnamese ? "Xem nhiều nhất" : "Most Viewed"}</option>
                        <option value="oldest">{isVietnamese ? "Cũ nhất" : "Oldest"}</option>
                    </select>
                </div>
            </div>

            {/* Guides Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-40 rounded-xl bg-surface/30 animate-pulse border border-border/10" />
                    ))}
                </div>
            ) : filteredGuides.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredGuides.map((guide) => {
                        const isLiked = Boolean(likedGuideIds[guide.id]);
                        const currentLikes = guide.likes + (isLiked ? 1 : 0);

                        return (
                            <div
                                key={guide.id}
                                onClick={() => setSelectedGuide(guide)}
                                className="p-4 sm:p-5 rounded-xl bg-surface/30 hover:bg-surface/50 border border-border/20 hover:border-border/40 transition-all cursor-pointer flex flex-col justify-between gap-4 group shadow-2xs"
                            >
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-semibold text-primary capitalize px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-[11px]">
                                            {guide.category}
                                        </span>
                                        {guide.rank && (
                                            <span className="text-[11px] font-mono text-text-muted bg-surface px-1.5 py-0.5 rounded border border-border/20">
                                                {guide.rank}
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="font-bold text-sm sm:text-base text-text group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                                        {guide.title}
                                    </h3>

                                    <p className="text-xs text-text-muted line-clamp-2 leading-relaxed font-normal">
                                        {guide.content.replace(/[#*`_]/g, "")}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-border/10 text-xs text-text-muted">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <img
                                            src={guide.authorAvatar}
                                            alt={guide.author}
                                            className="w-5 h-5 rounded-full object-cover shrink-0 bg-surface ring-1 ring-border/20"
                                        />
                                        <span className="font-medium text-text truncate max-w-[120px]">
                                            {guide.author}
                                        </span>
                                        <span className="text-border">·</span>
                                        <span className="text-[11px] text-text-muted/70">{guide.date}</span>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={(e) => handleLike(guide, e)}
                                        className={`flex items-center gap-1.5 transition-colors cursor-pointer px-2 py-0.5 rounded ${
                                            isLiked ? "text-rose-500 bg-rose-500/10 font-semibold" : "text-text-muted hover:text-text hover:bg-surface/50"
                                        }`}
                                    >
                                        <FontAwesomeIcon icon={faHeart} className="text-xs" />
                                        <span>{currentLikes}</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="py-16 text-center flex flex-col items-center justify-center gap-3 border border-dashed border-border/30 rounded-2xl bg-surface/10 p-6">
                    <div className="w-12 h-12 rounded-full bg-surface/50 border border-border/30 flex items-center justify-center text-text-muted text-lg">
                        <FontAwesomeIcon icon={faBookOpen} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-text">
                            {isVietnamese ? "Chưa có cẩm nang nào" : "No guides found"}
                        </p>
                        <p className="text-xs text-text-muted max-w-sm mt-1">
                            {isVietnamese
                                ? "Hãy là người đầu tiên chia sẻ cẩm nang và kinh nghiệm chơi game cùng cộng đồng."
                                : "Be the first to write and share a guide with fellow players."}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsCreateModalOpen(true)}
                        className="mt-2 px-4 py-2 rounded-xl font-semibold bg-primary text-white hover:bg-primary-hover transition-all text-xs cursor-pointer shadow-sm active:scale-98 flex items-center gap-1.5"
                    >
                        <FontAwesomeIcon icon={faPlus} />
                        <span>{isVietnamese ? "Viết cẩm nang đầu tiên" : "Write First Guide"}</span>
                    </button>
                </div>
            )}

            {/* Create Guide Modal */}
            <CreateGuideModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                gameAppid={gameAppid}
                gameName={game.name}
                onSuccess={() => refetch()}
            />

            {/* Read Guide Detail Modal */}
            <GuideDetailModal
                isOpen={Boolean(selectedGuide)}
                onClose={() => setSelectedGuide(null)}
                guide={selectedGuide}
                onLike={() => selectedGuide && handleLike(selectedGuide)}
                isLiked={selectedGuide ? Boolean(likedGuideIds[selectedGuide.id]) : false}
            />
        </div>
    );
};
