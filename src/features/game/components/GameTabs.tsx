import React, { useRef } from "react";
import { useTranslation } from "@/shared/hooks/useTranslate";
import { type GameTabType } from "../types";

interface GameTabsProps {
    activeTab: GameTabType;
    onTabChange: (tab: GameTabType) => void;
    counts?: {
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
    const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);

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

    const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
        let nextIndex = index;
        if (e.key === "ArrowRight") {
            nextIndex = (index + 1) % tabs.length;
        } else if (e.key === "ArrowLeft") {
            nextIndex = (index - 1 + tabs.length) % tabs.length;
        } else if (e.key === "Home") {
            nextIndex = 0;
        } else if (e.key === "End") {
            nextIndex = tabs.length - 1;
        } else {
            return;
        }
        e.preventDefault();
        tabsRef.current[nextIndex]?.focus();
        onTabChange(tabs[nextIndex].id);
    };

    return (
        <nav aria-label="Game navigation" className="w-full border-b border-border/20 mb-8 bg-background">
            <div
                role="tablist"
                aria-orientation="horizontal"
                aria-label="Game sections"
                className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-6 sm:gap-8 overflow-x-auto scroll-fade-mask [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
                {tabs.map((tab, idx) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            ref={(el) => {
                                tabsRef.current[idx] = el;
                            }}
                            role="tab"
                            id={`game-tab-${tab.id}`}
                            aria-selected={isActive}
                            aria-controls={`game-panel-${tab.id}`}
                            tabIndex={isActive ? 0 : -1}
                            type="button"
                            onClick={() => onTabChange(tab.id)}
                            onKeyDown={(e) => handleKeyDown(e, idx)}
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
