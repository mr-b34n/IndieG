import React from "react";
import {
    LayoutDashboard,
    Images,
    MessageSquare,
    type LucideIcon,
} from "lucide-react";
import { useTranslation } from "@/shared/hooks/useTranslate";
import { type GameTabType } from "../types";

interface GameTabsProps {
    activeTab: GameTabType;
    onTabChange: (tab: GameTabType) => void;
    counts?: {
        gallery?: number;
        discussions?: number;
    };
}

interface TabItem {
    id: GameTabType;
    label: string;
    icon: LucideIcon;
    count?: number;
}

export const GameTabs: React.FC<GameTabsProps> = ({
    activeTab,
    onTabChange,
    counts,
}) => {
    const { lang } = useTranslation();
    const isVietnamese = lang === "vi";

    const tabs: TabItem[] = [
        {
            id: "overview",
            label: isVietnamese ? "Tổng quan" : "Overview",
            icon: LayoutDashboard,
        },
        {
            id: "gallery",
            label: isVietnamese ? "Hình ảnh & Media" : "Gallery",
            icon: Images,
        },
        {
            id: "discussions",
            label: isVietnamese ? "Thảo luận" : "Discussions",
            icon: MessageSquare,
            count: counts?.discussions,
        },
    ];

    return (
        <nav
            aria-label="Game navigation"
            className="w-full bg-surface border-y border-border/40 mb-8"
        >
            <div
                role="tablist"
                className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 sm:gap-4 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;

                    return (
                        <button
                            key={tab.id}
                            role="tab"
                            type="button"
                            aria-selected={isActive}
                            onClick={() => onTabChange(tab.id)}
                            className={`group py-3.5 px-3 sm:px-4 text-xs sm:text-sm font-medium transition-all border-b-2 -mb-px whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                                isActive
                                    ? "border-primary text-text font-semibold bg-surface-hover/50"
                                    : "border-transparent text-text-muted hover:text-text hover:border-border/60"
                            }`}
                        >
                            <Icon
                                className={`w-4 h-4 transition-colors ${
                                    isActive ? "text-primary" : "text-text-muted group-hover:text-text"
                                }`}
                            />
                            <span>{tab.label}</span>

                            {typeof tab.count === "number" && tab.count > 0 && (
                                <span
                                    className={`px-1.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-mono leading-none transition-colors ${
                                        isActive
                                            ? "bg-primary/20 text-primary font-bold"
                                            : "bg-surface-inner text-text-muted group-hover:text-text border border-border/40"
                                    }`}
                                >
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};
