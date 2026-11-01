import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrophy, faCheckCircle, faLock } from "@fortawesome/free-solid-svg-icons";
import type { Badge } from "../../types";
import { useTranslation, type TranslateFn } from "@/shared/hooks/useTranslate";

interface AchievementsTabProps {
    badges: Badge[];
    t?: TranslateFn;
}

export const AchievementsTab = ({ badges, t: propT }: AchievementsTabProps) => {
    const { t: hookT } = useTranslation();
    const t = propT || hookT;
    const [selectedCategory, setSelectedCategory] = useState<string>("All");

    const categories = ["All", "FPS", "Survival", "Competitive", "Platform"];
    const filteredBadges = selectedCategory === "All"
        ? badges
        : badges.filter((b) => b.category === selectedCategory);

    return (
        <div className="flex flex-col gap-5 w-full animate-fade-in bg-surface border border-border rounded-[14px] p-5 shadow-sm">
            <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faTrophy} className="text-gold-400 text-base" />
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-text">Collectible Badges & Trophies</h3>
                        <p className="text-xs text-text-muted">Danh hiệu độc quyền thu thập qua quá trình chơi game & hoạt động</p>
                    </div>
                </div>
                <span className="text-xs font-semibold text-text px-3 py-1 rounded-[6px] bg-surface-inner border border-border/50">
                    {badges.filter((b) => b.unlocked !== false).length} / {badges.length} Unlocked
                </span>
            </div>

            {/* Filter Pills with Subtle Background Selection */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
                {categories.map((cat) => {
                    const isSelected = selectedCategory === cat;
                    return (
                        <button
                            key={cat}
                            type="button"
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-3.5 py-1.5 rounded-[6px] text-xs font-semibold transition-all cursor-pointer ${
                                isSelected
                                    ? "bg-primary/15 text-primary font-bold border border-primary/25"
                                    : "bg-surface-inner text-text-muted hover:text-text hover:bg-surface-hover border border-border/50"
                            }`}
                        >
                            {cat}
                        </button>
                    );
                })}
            </div>

            {/* Badges Grid */}
            {filteredBadges.length === 0 ? (
                <div className="w-full bg-surface-inner border border-border/60 rounded-[10px] p-8 text-center flex flex-col items-center justify-center gap-2">
                    <FontAwesomeIcon icon={faTrophy} className="text-2xl text-text-faint" />
                    <h4 className="text-xs font-bold text-text">{t("profile.empty.achievementsTitle")}</h4>
                    <p className="text-[11px] text-text-muted">{t("profile.empty.achievementsDesc")}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {filteredBadges.map((badge) => {
                        const isUnlocked = badge.unlocked !== false;

                        return (
                            <div
                                key={badge.id}
                                className={`flex flex-col justify-between p-4 rounded-[10px] transition-all ${
                                    isUnlocked
                                        ? "bg-surface-inner hover:bg-surface-hover border border-border/60"
                                        : "bg-surface-inner/40 border border-border/30 opacity-40 grayscale"
                                }`}
                            >
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-[8px] bg-surface flex items-center justify-center text-lg shrink-0 text-gold-400 border border-border/50">
                                        <FontAwesomeIcon icon={badge.icon} />
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-semibold uppercase ${
                                        isUnlocked
                                            ? "bg-emerald-500/15 text-emerald-500"
                                            : "bg-surface text-text-faint border border-border/40"
                                    }`}>
                                        <FontAwesomeIcon icon={isUnlocked ? faCheckCircle : faLock} className="mr-1 text-[9px]" />
                                        {isUnlocked ? "Unlocked" : "Locked"}
                                    </span>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <h4 className="font-bold text-text text-sm">{badge.title}</h4>
                                    <p className="text-xs text-text-muted leading-relaxed">{badge.desc}</p>
                                </div>

                                <div className="flex items-center justify-between text-[11px] font-medium text-text-muted pt-3 mt-3 bg-surface p-2 rounded-[6px] border border-border/40">
                                    <span>Category: {badge.category || "General"}</span>
                                    <span>{badge.earnedDate ? `Earned ${badge.earnedDate}` : "Locked"}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
