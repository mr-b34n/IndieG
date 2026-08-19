import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowDownWideShort,
    faChevronDown,
    faCheck
} from "@fortawesome/free-solid-svg-icons";
import type { ExploreContentType, ExploreSortOption } from "../types";

interface ExploreControlRailProps {
    activeType: ExploreContentType;
    onSelectType: (type: ExploreContentType) => void;
    sortOrder: ExploreSortOption;
    onSortChange: (sort: ExploreSortOption) => void;
}

const CONTENT_TABS: { id: ExploreContentType; label: string }[] = [
    { id: "all", label: "ALL" },
    { id: "news", label: "NEWS" },
    { id: "events", label: "EVENTS" },
    { id: "viral", label: "VIRAL" },
    { id: "media", label: "MEDIA" },
];

const SORT_OPTIONS: { id: ExploreSortOption; label: string }[] = [
    { id: "latest", label: "Latest" },
    { id: "trending", label: "Trending" },
    { id: "top", label: "Top Rated" },
];

export const ExploreControlRail = ({
    activeType,
    onSelectType,
    sortOrder,
    onSortChange
}: ExploreControlRailProps) => {
    const [isSortOpen, setIsSortOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsSortOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const currentSort = SORT_OPTIONS.find((s) => s.id === sortOrder) || SORT_OPTIONS[0];

    return (
        <div className="w-full flex flex-col gap-2 pt-1 select-none">
            {/* Top row: Section Label + Sort Selector */}
            <div className="flex items-center justify-between gap-4">
                <span className="text-[11px] font-black uppercase tracking-wider text-text-faint">
                    DISCOVER
                </span>

                {/* Minimalist Sort Dropdown */}
                <div ref={dropdownRef} className="relative">
                    <button
                        type="button"
                        onClick={() => setIsSortOpen((prev) => !prev)}
                        className="flex items-center gap-1.5 text-xs font-bold text-text-muted hover:text-text transition-colors cursor-pointer py-0.5 px-1.5 rounded hover:bg-surface-hover/50 whitespace-nowrap"
                    >
                        <FontAwesomeIcon icon={faArrowDownWideShort} className="text-text-faint text-[10px]" />
                        <span className="text-text text-xs">{currentSort.label}</span>
                        <FontAwesomeIcon
                            icon={faChevronDown}
                            className={`text-[9px] text-text-faint transition-transform duration-200 ml-0.5 ${
                                isSortOpen ? "rotate-180" : ""
                            }`}
                        />
                    </button>

                    {isSortOpen && (
                        <div className="absolute right-0 top-full mt-1 w-36 bg-surface border border-divider-primary rounded-[6px] shadow-2xl z-50 overflow-hidden animate-fade-in p-1 flex flex-col gap-0.5">
                            {SORT_OPTIONS.map((opt) => {
                                const isSelected = opt.id === sortOrder;
                                return (
                                    <button
                                        key={opt.id}
                                        type="button"
                                        onClick={() => {
                                            onSortChange(opt.id);
                                            setIsSortOpen(false);
                                        }}
                                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-[4px] text-xs font-semibold transition-colors cursor-pointer text-left ${
                                            isSelected
                                                ? "bg-primary/10 text-primary font-bold"
                                                : "text-text-muted hover:text-text hover:bg-surface-hover/60"
                                        }`}
                                    >
                                        <span>{opt.label}</span>
                                        {isSelected && (
                                            <FontAwesomeIcon icon={faCheck} className="text-[10px] text-primary" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Row: Editorial Content Switcher Tabs */}
            <div className="flex items-center gap-6 overflow-x-auto scrollbar-none border-b border-divider-primary">
                {CONTENT_TABS.map((tab) => {
                    const isActive = activeType === tab.id;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => onSelectType(tab.id)}
                            className={`relative pb-2.5 text-xs font-bold transition-all duration-150 cursor-pointer whitespace-nowrap tracking-wide ${
                                isActive
                                    ? "text-primary"
                                    : "text-text-muted hover:text-text"
                            }`}
                        >
                            {tab.label}
                            {/* Active Accent Underline */}
                            {isActive && (
                                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
