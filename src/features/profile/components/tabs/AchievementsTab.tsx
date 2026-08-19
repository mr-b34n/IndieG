import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrophy, faCheckCircle, faLock } from "@fortawesome/free-solid-svg-icons";
import type { Badge } from "../../types";
import type { TranslateFn } from "@/shared/hooks/useTranslate";

interface AchievementsTabProps {
    badges: Badge[];
    t: TranslateFn;
}

export const AchievementsTab = ({ badges }: AchievementsTabProps) => {
    const [selectedCategory, setSelectedCategory] = useState<string>("All");

    const categories = ["All", "FPS", "Survival", "Competitive", "Platform"];
    const filteredBadges = selectedCategory === "All"
        ? badges
        : badges.filter((b) => b.category === selectedCategory);

    return (
        <div className="flex flex-col gap-5 w-full animate-fade-in">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faTrophy} className="text-amber-400 text-lg" />
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-text">Collectible Badges & Trophies</h3>
                        <p className="text-xs text-text-faint font-semibold">Danh hiệu độc quyền thu thập qua quá trình chơi game & hoạt động</p>
                    </div>
                </div>
                <span className="text-xs font-black text-amber-400 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                    {badges.filter((b) => b.unlocked !== false).length} / {badges.length} Unlocked
                </span>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            selectedCategory === cat
                                ? "bg-amber-400/15 text-amber-400 border border-amber-400/30"
                                : "bg-surface-hover/60 text-text-muted hover:text-text"
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Badges Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBadges.map((badge) => {
                    const isUnlocked = badge.unlocked !== false;

                    return (
                        <div
                            key={badge.id}
                            className={`flex flex-col justify-between p-5 rounded-2xl border transition-all ${
                                isUnlocked
                                    ? "bg-surface border-border/60 shadow-sm hover:border-amber-400/50 hover:shadow-md"
                                    : "bg-surface/30 border-border/20 opacity-50 grayscale"
                            }`}
                        >
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 ${badge.color}`}>
                                    <FontAwesomeIcon icon={badge.icon} />
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                                    isUnlocked
                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                        : "bg-neutral-500/10 text-text-faint border-neutral-500/20"
                                }`}>
                                    <FontAwesomeIcon icon={isUnlocked ? faCheckCircle : faLock} className="mr-1 text-[9px]" />
                                    {isUnlocked ? "Unlocked" : "Locked"}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1">
                                <h4 className="font-black text-text text-sm">{badge.title}</h4>
                                <p className="text-xs text-text-muted leading-relaxed">{badge.desc}</p>
                            </div>

                            <div className="flex items-center justify-between text-[11px] font-bold text-text-faint border-t border-border/30 pt-3 mt-4">
                                <span>Category: {badge.category || "General"}</span>
                                <span>{badge.earnedDate ? `Earned ${badge.earnedDate}` : "Locked"}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
