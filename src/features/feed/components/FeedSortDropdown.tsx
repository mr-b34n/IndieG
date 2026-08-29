import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faChevronDown, 
    faCheck, 
    faFire, 
    faClock, 
    faComments,
    faArrowDownWideShort
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "@/shared/hooks/useTranslate";

export type FeedSortOption = "latest" | "popular" | "discussed";

interface FeedSortDropdownProps {
    value: FeedSortOption;
    onChange: (val: FeedSortOption) => void;
}

export const FeedSortDropdown = ({ value, onChange }: FeedSortDropdownProps) => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const options: { id: FeedSortOption; labelKey: string; defaultLabel: string; icon: typeof faClock }[] = [
        { id: "latest", labelKey: "feed.sortLatest", defaultLabel: "Latest", icon: faClock },
        { id: "popular", labelKey: "feed.sortPopular", defaultLabel: "Popular", icon: faFire },
        { id: "discussed", labelKey: "feed.sortDiscussed", defaultLabel: "Discussed", icon: faComments },
    ];

    const currentOption = options.find((o) => o.id === value) || options[0];

    return (
        <div className="relative inline-block text-left" ref={containerRef}>
            {/* Trigger */}
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="flex items-center gap-1.5 text-xs font-bold text-text-muted hover:text-text transition-colors cursor-pointer py-0.5 px-1 rounded hover:bg-surface-hover/50 whitespace-nowrap"
            >
                <FontAwesomeIcon icon={faArrowDownWideShort} className="text-text-faint text-[10px]" />
                <span className="text-text text-xs">{t(currentOption.labelKey, { defaultValue: currentOption.defaultLabel })}</span>
                <FontAwesomeIcon
                    icon={faChevronDown}
                    className={`text-[9px] text-text-faint transition-transform duration-200 ml-0.5 ${
                        isOpen ? "rotate-180 text-primary" : ""
                    }`}
                />
            </button>

            {/* Menu */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-1 w-36 bg-surface border border-divider-primary rounded-[6px] shadow-2xl z-50 overflow-hidden animate-fade-in p-1 flex flex-col gap-0.5">
                    {options.map((opt) => {
                        const isSelected = opt.id === value;
                        return (
                            <button
                                key={opt.id}
                                type="button"
                                onClick={() => {
                                    onChange(opt.id);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-[4px] text-left text-xs transition-colors cursor-pointer ${
                                    isSelected
                                        ? "bg-primary/10 text-primary font-bold"
                                        : "hover:bg-surface-hover text-text"
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <FontAwesomeIcon icon={opt.icon} className="text-[11px] opacity-70" />
                                    <span>{t(opt.labelKey, { defaultValue: opt.defaultLabel })}</span>
                                </div>
                                {isSelected && (
                                    <FontAwesomeIcon icon={faCheck} className="text-primary text-[10px] shrink-0" />
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
