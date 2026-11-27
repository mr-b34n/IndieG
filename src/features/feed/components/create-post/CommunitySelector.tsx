import React, { useState, useRef, useMemo, useEffect } from "react";
import { AppIcon as FontAwesomeIcon } from "@/shared/components/ui/Icon";
import { CaretDown as faChevronDown, Check as faCheck } from "@phosphor-icons/react";
import { useTranslation } from "@/shared/hooks/useTranslate";
import { type CommunityData } from "@/features/community/types";

export interface CommunitySelectorProps {
    value: number | string | null;
    onChange: (id: number | string | null) => void;
    communities: CommunityData[];
    hasError?: boolean;
}

export const CommunitySelector: React.FC<CommunitySelectorProps> = ({
    value,
    onChange,
    communities,
    hasError = false,
}) => {
    const { t, language } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [filterQuery, setFilterQuery] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedCommunity = useMemo(
        () => communities.find((c) => String(c.id) === String(value)) || null,
        [communities, value]
    );

    const filteredCommunities = useMemo(() => {
        if (!filterQuery.trim()) return communities;
        const q = filterQuery.toLowerCase();
        return communities.filter(
            (c) => c.name.toLowerCase().includes(q) || (c.tag && c.tag.toLowerCase().includes(q))
        );
    }, [communities, filterQuery]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative inline-block" ref={dropdownRef}>
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => {
                        setIsOpen((prev) => !prev);
                        setFilterQuery("");
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text transition-colors select-none group cursor-pointer py-0.5"
                >
                    <span className="text-text-faint font-normal">{language === "vi" ? "Đăng trong" : "Posting in"}</span>
                    {selectedCommunity ? (
                        <span className="inline-flex items-center gap-1.5 font-semibold text-text">
                            {selectedCommunity.logo ? (
                                <img
                                    src={selectedCommunity.logo}
                                    alt=""
                                    className="w-3.5 h-3.5 rounded object-cover ring-1 ring-white/10"
                                />
                            ) : (
                                <span className="w-3.5 h-3.5 rounded bg-primary/20 text-primary flex items-center justify-center font-bold text-[9px]">
                                    {selectedCommunity.name.charAt(0)}
                                </span>
                            )}
                            <span className="underline decoration-white/20 underline-offset-4 group-hover:decoration-primary/60 transition-colors">
                                {selectedCommunity.name}
                            </span>
                        </span>
                    ) : (
                        <span className={`font-medium ${hasError ? "text-rose-400" : "text-text-faint group-hover:text-text-muted"} underline decoration-dotted underline-offset-4`}>
                            {t('feed.selectCommunityPlaceholder', { defaultValue: 'Chọn cộng đồng...' })}
                        </span>
                    )}
                    <FontAwesomeIcon
                        icon={faChevronDown}
                        className={`text-[9px] text-text-faint group-hover:text-text-muted transition-transform ml-0.5 ${
                            isOpen ? "rotate-180 text-primary" : ""
                        }`}
                    />
                </button>

                {hasError && !selectedCommunity && (
                    <span className="text-[11px] text-rose-400 font-medium animate-fade-in">
                        {t('feed.selectCommunityRequired', { defaultValue: 'Vui lòng chọn một cộng đồng' })}
                    </span>
                )}
            </div>

            {/* Dropdown Menu (Clean, border-only elevation) */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 sm:w-72 bg-[#10131a] border border-white/[0.1] rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in p-1.5 flex flex-col gap-1 max-h-72">
                    {communities.length > 5 && (
                        <div className="px-2 py-1 border-b border-white/[0.06]">
                            <input
                                type="text"
                                value={filterQuery}
                                onChange={(e) => setFilterQuery(e.target.value)}
                                placeholder={t('common.search', { defaultValue: 'Tìm cộng đồng...' })}
                                className="w-full bg-transparent border-none outline-none text-xs text-text placeholder:text-text-faint/50 py-0.5"
                                autoFocus
                            />
                        </div>
                    )}

                    <div className="overflow-y-auto max-h-56 flex flex-col gap-0.5">
                        {filteredCommunities.length === 0 ? (
                            <div className="px-3 py-3 text-xs text-text-faint text-center">
                                {communities.length === 0
                                    ? t('feed.noCommunitiesJoined', { defaultValue: 'Chưa tham gia cộng đồng nào' })
                                    : t('search.noResults', { defaultValue: 'Không tìm thấy cộng đồng' })}
                            </div>
                        ) : (
                            filteredCommunities.map((c) => {
                                const isSelected = String(c.id) === String(value);
                                return (
                                    <button
                                        key={c.id}
                                        type="button"
                                        onClick={() => {
                                            onChange(c.id);
                                            setIsOpen(false);
                                        }}
                                        className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                                            isSelected
                                                ? "bg-primary/10 text-primary font-semibold"
                                                : "hover:bg-white/[0.05] text-text-muted hover:text-text"
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 min-w-0 truncate">
                                            {c.logo ? (
                                                <img
                                                    src={c.logo}
                                                    alt={c.name}
                                                    className="w-4 h-4 rounded object-cover"
                                                />
                                            ) : (
                                                <span className="w-4 h-4 rounded bg-primary/20 text-primary flex items-center justify-center font-bold text-[10px] shrink-0">
                                                    {c.name.charAt(0)}
                                                </span>
                                            )}
                                            <span className="truncate">{c.name}</span>
                                            {c.tag && (
                                                <span className="px-1 py-0.2 rounded text-[9px] font-bold uppercase bg-white/[0.06] text-text-faint shrink-0">
                                                    {c.tag}
                                                </span>
                                            )}
                                        </div>
                                        {isSelected && (
                                            <FontAwesomeIcon icon={faCheck} className="text-primary text-xs shrink-0 ml-1.5" />
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
