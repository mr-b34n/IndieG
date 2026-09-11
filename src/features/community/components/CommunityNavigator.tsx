import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faMagnifyingGlass,
    faXmark,
    faChevronDown,
    faCheck,
    faFilter,
    faPlus,
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
    canCreateCommunity: boolean;
    onCreateCommunity: () => void;
}

export const CommunityNavigator = ({
    search,
    onSearchChange,
    activeTab,
    onTabChange,
    categories,
    activeCategory,
    onCategoryChange,
    joinedCount,
    canCreateCommunity,
    onCreateCommunity,
}: CommunityNavigatorProps) => {
    const { t } = useTranslation();
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const filterDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (filterDropdownRef.current && !filterDropdownRef.current.contains(e.target as Node)) {
                setIsFilterOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getFilterLabel = () => {
        if (activeCategory) {
            return activeCategory;
        }
        if (activeTab === "joined") {
            return `joined (${joinedCount})`;
        }
        if (activeTab === "trending") {
            return "trending";
        }
        return "all";
    };

    return (
        <div className="w-full flex flex-col gap-4 select-none">
            {/* 1. Search Bar */}
            <div className="relative w-full">
                <FontAwesomeIcon
                    icon={faMagnifyingGlass}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-faint text-xs"
                />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder={t('community.searchPlaceholder', { defaultValue: 'Search communities, games, or tags...' })}
                    className="w-full h-10 pl-10 pr-9 bg-surface hover:bg-surface-hover/70 focus:bg-surface border border-divider-primary/80 focus:border-primary rounded-md text-xs font-semibold text-text placeholder:text-text-faint focus:outline-none transition-colors"
                />
                {search && (
                    <button
                        type="button"
                        onClick={() => onSearchChange("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-faint hover:text-text cursor-pointer w-5 h-5 flex items-center justify-center"
                    >
                        <FontAwesomeIcon icon={faXmark} className="text-xs" />
                    </button>
                )}
            </div>

            {/* 2. Communities Header + Filter Trigger Row */}
            {/* Format: | communities        [icon filter]all | */}
            <div className="flex items-center justify-between pt-1 pb-1">
                <div className="flex items-center gap-3">
                    <h1 className="text-sm sm:text-base font-black text-text uppercase tracking-tight">
                        {t('community.title', { defaultValue: 'COMMUNITIES' })}
                    </h1>

                    {canCreateCommunity && (
                        <button
                            type="button"
                            onClick={onCreateCommunity}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-primary text-white hover:bg-primary-hover text-xs font-bold transition-colors cursor-pointer shadow-xs shadow-primary/20"
                        >
                            <FontAwesomeIcon icon={faPlus} className="text-[10px]" />
                            <span>{t('community.createBtn', { defaultValue: 'Tạo cộng đồng' })}</span>
                        </button>
                    )}
                </div>

                {/* Filter Dropdown Trigger */}
                <div ref={filterDropdownRef} className="relative">
                    <button
                        type="button"
                        onClick={() => setIsFilterOpen((prev) => !prev)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-[4px] bg-surface hover:bg-surface-hover border border-divider-primary/80 text-xs font-bold text-text-muted hover:text-text transition-all cursor-pointer shadow-xs"
                    >
                        <FontAwesomeIcon icon={faFilter} className="text-xs text-primary" />
                        <span className="lowercase font-mono font-bold text-text">{getFilterLabel()}</span>
                        <FontAwesomeIcon icon={faChevronDown} className={`text-[10px] transition-transform duration-200 text-text-faint ${isFilterOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Popover Filter Menu */}
                    {isFilterOpen && (
                        <div className="absolute right-0 top-full mt-1.5 w-56 bg-surface border border-divider-primary rounded-[6px] shadow-2xl z-50 p-2 flex flex-col gap-2.5 animate-fade-in text-xs">
                            {/* View Modes */}
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black uppercase text-text-faint px-2 tracking-wider">
                                    {t('community.viewMode', { defaultValue: 'Chế độ xem' })}
                                </span>

                                <button
                                    type="button"
                                    onClick={() => {
                                        onCategoryChange(null);
                                        onTabChange("discover");
                                        setIsFilterOpen(false);
                                    }}
                                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-[4px] font-semibold text-left transition-colors cursor-pointer ${
                                        activeTab === "discover" && activeCategory === null
                                            ? "bg-primary/10 text-primary font-bold"
                                            : "text-text-muted hover:text-text hover:bg-surface-hover/70"
                                    }`}
                                >
                                    <span>all (Tất cả)</span>
                                    {activeTab === "discover" && activeCategory === null && (
                                        <FontAwesomeIcon icon={faCheck} className="text-[10px]" />
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        onCategoryChange(null);
                                        onTabChange("joined");
                                        setIsFilterOpen(false);
                                    }}
                                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-[4px] font-semibold text-left transition-colors cursor-pointer ${
                                        activeTab === "joined" && activeCategory === null
                                            ? "bg-primary/10 text-primary font-bold"
                                            : "text-text-muted hover:text-text hover:bg-surface-hover/70"
                                    }`}
                                >
                                    <span className="flex items-center gap-1.5">
                                        <span>joined (Đã tham gia)</span>
                                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface-hover text-text-faint">
                                            {joinedCount}
                                        </span>
                                    </span>
                                    {activeTab === "joined" && activeCategory === null && (
                                        <FontAwesomeIcon icon={faCheck} className="text-[10px]" />
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        onCategoryChange(null);
                                        onTabChange("trending");
                                        setIsFilterOpen(false);
                                    }}
                                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-[4px] font-semibold text-left transition-colors cursor-pointer ${
                                        activeTab === "trending" && activeCategory === null
                                            ? "bg-primary/10 text-primary font-bold"
                                            : "text-text-muted hover:text-text hover:bg-surface-hover/70"
                                    }`}
                                >
                                    <span>trending (Nổi bật)</span>
                                    {activeTab === "trending" && activeCategory === null && (
                                        <FontAwesomeIcon icon={faCheck} className="text-[10px]" />
                                    )}
                                </button>
                            </div>

                            {/* Category Filter */}
                            {categories.length > 0 && (
                                <div className="flex flex-col gap-1 pt-2 border-t border-divider-primary/60">
                                    <span className="text-[10px] font-black uppercase text-text-faint px-2 tracking-wider">
                                        {t('community.categoriesLabel', { defaultValue: 'Thể loại' })}
                                    </span>

                                    {categories.map((cat, idx) => {
                                        const isSelected = activeCategory === cat;
                                        return (
                                            <button
                                                key={`${cat}-${idx}`}
                                                type="button"
                                                onClick={() => {
                                                    onCategoryChange(isSelected ? null : cat);
                                                    setIsFilterOpen(false);
                                                }}
                                                className={`flex items-center justify-between px-2.5 py-1.5 rounded-[4px] font-semibold text-left transition-colors cursor-pointer ${
                                                    isSelected
                                                        ? "bg-primary/10 text-primary font-bold"
                                                        : "text-text-muted hover:text-text hover:bg-surface-hover/70"
                                                }`}
                                            >
                                                <span>{cat}</span>
                                                {isSelected && <FontAwesomeIcon icon={faCheck} className="text-[10px]" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
