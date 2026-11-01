import React from "react";
import { useTranslation } from "@/shared/hooks/useTranslate";
import { type GameTabType } from "../types";

interface GameTabsProps {
    activeTab: GameTabType;
    onTabChange: (tab: GameTabType) => void;
    counts?: {
        guides?: number;
        reviews?: number;
        updates?: number;
        discussions?: number;
    };
}

export const GameTabs: React.FC<GameTabsProps> = ({
    activeTab,
    onTabChange,
}) => {
    const { lang } = useTranslation();
    const isVietnamese = lang === "vi";

    const tabs: { id: GameTabType; label: string }[] = [
        {
            id: "overview",
            label: isVietnamese ? "Tổng quan" : "Overview",
        },
        {
            id: "updates",
            label: isVietnamese ? "Bản cập nhật" : "Updates",
        },
        {
            id: "discussions",
            label: isVietnamese ? "Thảo luận" : "Discussions",
        },
    ];

    return (
        <nav aria-label="Game navigation" className="w-full border-b border-border/20 mb-8 bg-background">
            <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-6 sm:gap-8 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => onTabChange(tab.id)}
                            className={`py-3.5 text-xs sm:text-sm font-medium transition-all border-b-2 -mb-px whitespace-nowrap cursor-pointer ${
                                isActive
                                    ? "border-primary text-text font-semibold"
                                    : "border-transparent text-text-muted hover:text-text hover:border-border/60"
                            }`}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};
