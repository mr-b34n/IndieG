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
        { id: "popular", labelKey: "feed.sortPopular", defaultLabel: "Hot", icon: faFire },
        { id: "latest", labelKey: "feed.sortLatest", defaultLabel: "Newest", icon: faClock },
    ];

    const currentOption = options.find((o) => o.id === value) || options[0];

    return (
        <div className="relative inline-block text-left" ref={containerRef}>
            {/* Trigger */}
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="flex items-center gap-1.5 text-xs font-bold text-brand-400 hover:text-brand-300 transition-colors cursor-pointer whitespace-nowrap"
            >
                <span>{t(currentOption.labelKey, { defaultValue: currentOption.defaultLabel })}</span>
                <FontAwesomeIcon
                    icon={faChevronDown}
                    className={`text-[10px] transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
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
