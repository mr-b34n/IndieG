import { useState, useRef, useEffect } from "react";
import {
    ChevronDown,
    Check,
    SlidersHorizontal,
    LayoutGrid,
    List,
} from "lucide-react";
import type { CommunityTabKey } from "../types";
import { useTranslation } from "@/shared/hooks/useTranslate";

interface CommunityNavigatorProps {
    activeTab: CommunityTabKey;
    onTabChange: (tab: CommunityTabKey) => void;
    categories: string[];
    activeCategory: string | null;
    onCategoryChange: (cat: string | null) => void;
    joinedCount: number;
    viewMode: "grid" | "list";
    onViewModeChange: (mode: "grid" | "list") => void;
}

export const CommunityNavigator = ({
    activeTab,
    onTabChange,
    categories,
    activeCategory,
    onCategoryChange,
    joinedCount,
    viewMode,
    onViewModeChange,
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
        return t("common.filter", { defaultValue: "Thể loại" });
    };

    return (
        <div className="w-full flex items-center justify-between gap-3 pt-1 pb-2 select-none">
            {/* Left: 2 Tabs (All / Joined) as borderless YouTube/Facebook chips */}
            <div className="flex items-center gap-2">
                {/* All */}
                <button
                    type="button"
                    onClick={() => {
                        onCategoryChange(null);
                        onTabChange("discover");
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer select-none ${
                        activeTab === "discover" && !activeCategory
                            ? "bg-white text-black shadow-xs"
                            : "bg-white/[0.08] text-white/90 hover:bg-white/[0.14]"
                    }`}
                >
                    {t("common.all", { defaultValue: "Tất cả" })}
                </button>

                {/* Joined */}
                <button
                    type="button"
                    onClick={() => {
                        onCategoryChange(null);
                        onTabChange("joined");
                    }}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer select-none ${
                        activeTab === "joined"
                            ? "bg-white text-black shadow-xs"
                            : "bg-white/[0.08] text-white/90 hover:bg-white/[0.14]"
                    }`}
                >
                    <span>{t("community.tabJoined", { defaultValue: "Đã tham gia" })}</span>
                    {joinedCount > 0 && (
                        <span
                            className={`px-1.5 py-0.2 rounded-md text-[11px] font-bold ${
                                activeTab === "joined"
                                    ? "bg-black/15 text-black"
                                    : "bg-white/15 text-white"
                            }`}
                        >
                            {joinedCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Right: Category Filter Chip + View Mode Switcher */}
            <div className="flex items-center gap-2 shrink-0">
                {/* Category Filter Dropdown */}
                {categories.length > 0 && (
                    <div ref={filterDropdownRef} className="relative">
                        <button
                            type="button"
                            onClick={() => setIsFilterOpen((prev) => !prev)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] text-xs font-medium text-white/90 cursor-pointer transition-colors"
                        >
                            <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
                            <span className="truncate max-w-[100px]">{getFilterLabel()}</span>
                            <ChevronDown className="w-3 h-3 text-white/60" />
                        </button>

                        {/* Dropdown Menu (Border-free elevated surface) */}
                        {isFilterOpen && (
                            <div className="absolute right-0 top-full mt-2 w-52 bg-[#212121] shadow-2xl rounded-xl z-50 p-1.5 flex flex-col gap-0.5 text-xs">
                                <button
                                    type="button"
                                    onClick={() => {
                                        onCategoryChange(null);
                                        setIsFilterOpen(false);
                                    }}
                                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-left cursor-pointer transition-colors ${
                                        activeCategory === null
                                            ? "bg-white/15 text-white font-semibold"
                                            : "text-white/80 hover:text-white hover:bg-white/[0.08]"
                                    }`}
                                >
                                    <span>{t("common.all", { defaultValue: "Tất cả thể loại" })}</span>
                                    {activeCategory === null && <Check className="w-3.5 h-3.5 text-primary" />}
                                </button>

                                <div className="max-h-52 overflow-y-auto scrollbar-none flex flex-col gap-0.5 pt-1 mt-1 border-t border-white/[0.08]">
                                    {categories.map((cat, idx) => {
                                        const isSelected = activeCategory?.toLowerCase() === cat.toLowerCase();
                                        return (
                                            <button
                                                key={`${cat}-${idx}`}
                                                type="button"
                                                onClick={() => {
                                                    onCategoryChange(isSelected ? null : cat);
                                                    setIsFilterOpen(false);
                                                }}
                                                className={`flex items-center justify-between px-3 py-2 rounded-lg text-left cursor-pointer transition-colors ${
                                                    isSelected
                                                        ? "bg-white/15 text-white font-semibold"
                                                        : "text-white/80 hover:text-white hover:bg-white/[0.08]"
                                                }`}
                                            >
                                                <span>{cat}</span>
                                                {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* View Mode Switcher: Borderless pill container */}
                <div className="inline-flex items-center p-0.5 bg-white/[0.08] rounded-lg gap-0.5">
                    <button
                        type="button"
                        onClick={() => onViewModeChange("grid")}
                        className={`p-1.5 rounded-md cursor-pointer transition-colors ${
                            viewMode === "grid"
                                ? "bg-white/20 text-white"
                                : "text-white/60 hover:text-white"
                        }`}
                        title={t("community.viewGrid", { defaultValue: "Dạng lưới" })}
                        aria-label="Grid view"
                    >
                        <LayoutGrid className="w-3.5 h-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => onViewModeChange("list")}
                        className={`p-1.5 rounded-md cursor-pointer transition-colors ${
                            viewMode === "list"
                                ? "bg-white/20 text-white"
                                : "text-white/60 hover:text-white"
                        }`}
                        title={t("community.viewList", { defaultValue: "Dạng danh sách" })}
                        aria-label="List view"
                    >
                        <List className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
};
