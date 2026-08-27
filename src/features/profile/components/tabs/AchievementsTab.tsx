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
        <div className="flex flex-col gap-5 w-full animate-fade-in bg-[#0A0C0E] rounded-[14px] p-5 shadow-sm">
            <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faTrophy} className="text-[#E5A93D] text-base" />
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#F0F1F2]">Collectible Badges & Trophies</h3>
                        <p className="text-xs text-[#9A9DA3]">Danh hiệu độc quyền thu thập qua quá trình chơi game & hoạt động</p>
                    </div>
                </div>
                <span className="text-xs font-semibold text-[#F0F1F2] px-3 py-1 rounded-[6px] bg-[#13161C]">
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
                                    ? "bg-[#181C24] text-[#1688E8] font-bold"
                                    : "bg-[#13161C] text-[#9A9DA3] hover:text-[#F0F1F2] hover:bg-[#181C24]"
                            }`}
                        >
                            {cat}
                        </button>
                    );
                })}
            </div>

            {/* Badges Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredBadges.map((badge) => {
                    const isUnlocked = badge.unlocked !== false;

                    return (
                        <div
                            key={badge.id}
                            className={`flex flex-col justify-between p-4 rounded-[10px] transition-all ${
                                isUnlocked
                                    ? "bg-[#13161C] hover:bg-[#181C24]"
                                    : "bg-[#0E1014] opacity-35 grayscale"
                            }`}
                        >
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="w-10 h-10 rounded-[8px] bg-[#181C24] flex items-center justify-center text-lg shrink-0 text-[#E5A93D]">
                                    <FontAwesomeIcon icon={badge.icon} />
                                </div>
                                <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-semibold uppercase ${
                                    isUnlocked
                                        ? "bg-[#24C58A]/15 text-[#24C58A]"
                                        : "bg-[#181C24] text-[#8A8F98]"
                                }`}>
                                    <FontAwesomeIcon icon={isUnlocked ? faCheckCircle : faLock} className="mr-1 text-[9px]" />
                                    {isUnlocked ? "Unlocked" : "Locked"}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1">
                                <h4 className="font-bold text-[#F0F1F2] text-sm">{badge.title}</h4>
                                <p className="text-xs text-[#9A9DA3] leading-relaxed">{badge.desc}</p>
                            </div>

                            <div className="flex items-center justify-between text-[11px] font-medium text-[#8A8F98] pt-3 mt-3 bg-[#0E1116] p-2 rounded-[6px]">
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
