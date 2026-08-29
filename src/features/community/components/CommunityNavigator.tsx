import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faMagnifyingGlass,
    faXmark,
    faChevronDown,
    faCheck
} from "@fortawesome/free-solid-svg-icons";
import type { CommunityTabKey } from "../types";
import { useTranslation } from "@/shared/hooks/useTranslate";

interface CommunityNavigatorProps {
    search: string;
    onSearchChange: (val: string) => void;
    activeTab: CommunityTabKey;
    onTabChange: (tab: CommunityTabKey) => void;
    categories: string[];
    activeCategory: string | null;
    onCategoryChange: (cat: string | null) => void;
    joinedCount: number;
}

export const CommunityNavigator = ({
    search,
    onSearchChange,
    activeTab,
    onTabChange,
    categories,
    activeCategory,
    onCategoryChange,
    joinedCount
}: CommunityNavigatorProps) => {
    const { t } = useTranslation();
    const [isMoreOpen, setIsMoreOpen] = useState(false);
    const moreDropdownRef = useRef<HTMLDivElement>(null);

    // Primary visible categories in the rail, rest in "More ▾" dropdown
    const primaryCategories = categories.slice(0, 5);
    const moreCategories = categories.slice(5);
    const isMoreSelected = activeCategory !== null && !primaryCategories.includes(activeCategory);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (moreDropdownRef.current && !moreDropdownRef.current.contains(e.target as Node)) {
                setIsMoreOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="w-full flex flex-col gap-3 select-none">
            {/* 1. Search Bar */}
            <div className="relative w-full">
                <FontAwesomeIcon
                    icon={faMagnifyingGlass}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint text-xs"
                />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder={t('community.searchPlaceholder', { defaultValue: 'Search communities, games, or tags...' })}
                    className="w-full h-9.5 pl-9 pr-9 bg-surface hover:bg-surface-hover/70 focus:bg-surface border border-divider-primary/60 focus:border-primary rounded-[4px] text-xs font-semibold text-text placeholder:text-text-faint focus:outline-none transition-colors"
                />
                {search && (
                    <button
                        type="button"
                        onClick={() => onSearchChange("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-faint hover:text-text cursor-pointer w-4 h-4 flex items-center justify-center"
                    >
                        <FontAwesomeIcon icon={faXmark} className="text-xs" />
                    </button>
                )}
            </div>

            {/* 2. Mode Tabs: DISCOVER · TRENDING · JOINED */}
            <div className="flex items-center gap-6 border-b border-divider-primary pt-1 overflow-x-auto scrollbar-none">
                <button
                    type="button"
                    onClick={() => onTabChange("discover")}
                    className={`relative pb-2.5 text-xs font-bold transition-colors cursor-pointer tracking-wider whitespace-nowrap ${
                        activeTab === "discover" ? "text-primary" : "text-text-muted hover:text-text"
                    }`}
                >
                    {t('community.tabDiscover', { defaultValue: 'DISCOVER' })}
                    {activeTab === "discover" && (
                        <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />
                    )}
                </button>

                <button
                    type="button"
                    onClick={() => onTabChange("trending")}
                    className={`relative pb-2.5 text-xs font-bold transition-colors cursor-pointer tracking-wider whitespace-nowrap ${
                        activeTab === "trending" ? "text-primary" : "text-text-muted hover:text-text"
                    }`}
                >
                    {t('community.tabTrending', { defaultValue: 'TRENDING' })}
                    {activeTab === "trending" && (
                        <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />
                    )}
                </button>

                <button
                    type="button"
                    onClick={() => onTabChange("joined")}
                    className={`relative pb-2.5 text-xs font-bold transition-colors cursor-pointer tracking-wider whitespace-nowrap flex items-center gap-1.5 ${
                        activeTab === "joined" ? "text-primary" : "text-text-muted hover:text-text"
                    }`}
                >
                    <span>{t('community.tabJoined', { defaultValue: 'JOINED' })}</span>
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-[3px] ${
                        activeTab === "joined" ? "bg-primary/20 text-primary" : "bg-surface-hover text-text-faint"
                    }`}>
                        {joinedCount}
                    </span>
                    {activeTab === "joined" && (
                        <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />
                    )}
                </button>
            </div>

            {/* 3. Unified Category Quick Filter Row */}
            {categories.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 text-xs">
                    <button
                        type="button"
                        onClick={() => onCategoryChange(null)}
                        className={`px-2.5 py-1 rounded-[4px] font-bold transition-colors cursor-pointer whitespace-nowrap ${
                            activeCategory === null
                                ? "bg-primary/15 text-primary border border-primary/30"
                                : "text-text-muted hover:text-text hover:bg-surface-hover/60 border border-transparent"
                        }`}
                    >
                        {t('common.all', { defaultValue: 'All' })}
                    </button>

                    {primaryCategories.map((cat) => {
                        const isSelected = activeCategory === cat;
                        return (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => onCategoryChange(isSelected ? null : cat)}
                                className={`px-2.5 py-1 rounded-[4px] font-bold transition-colors cursor-pointer whitespace-nowrap ${
                                    isSelected
                                        ? "bg-primary/15 text-primary border border-primary/30"
                                        : "text-text-muted hover:text-text hover:bg-surface-hover/60 border border-transparent"
                                }`}
                            >
                                {cat}
                            </button>
                        );
                    })}

                    {moreCategories.length > 0 && (
                        <div ref={moreDropdownRef} className="relative">
                            <button
                                type="button"
                                onClick={() => setIsMoreOpen((prev) => !prev)}
                                className={`px-2.5 py-1 rounded-[4px] font-bold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                                    isMoreSelected
                                        ? "bg-primary/15 text-primary border border-primary/30"
                                        : "text-text-muted hover:text-text hover:bg-surface-hover/60 border border-transparent"
                                }`}
                            >
                                <span>{isMoreSelected ? activeCategory : t('common.more', { defaultValue: 'More' })}</span>
                                <FontAwesomeIcon
                                    icon={faChevronDown}
                                    className={`text-[8px] transition-transform duration-200 ${
                                        isMoreOpen ? "rotate-180" : ""
                                    }`}
                                />
                            </button>

                            {isMoreOpen && (
                                <div className="absolute left-0 top-full mt-1.5 w-44 bg-surface border border-divider-primary rounded-[4px] shadow-2xl z-50 overflow-hidden animate-fade-in p-1 flex flex-col gap-0.5 max-h-56 overflow-y-auto">
                                    {moreCategories.map((cat) => {
                                        const isSelected = activeCategory === cat;
                                        return (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => {
                                                    onCategoryChange(cat);
                                                    setIsMoreOpen(false);
                                                }}
                                                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-[4px] text-xs font-semibold transition-colors cursor-pointer text-left ${
                                                    isSelected
                                                        ? "bg-primary/10 text-primary font-bold"
                                                        : "text-text-muted hover:text-text hover:bg-surface-hover/60"
                                                }`}
                                            >
                                                <span>{cat}</span>
                                                {isSelected && (
                                                    <FontAwesomeIcon icon={faCheck} className="text-[10px] text-primary" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
