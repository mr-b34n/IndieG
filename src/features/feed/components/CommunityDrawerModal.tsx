import { useState, useMemo, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faXmark, 
    faMagnifyingGlass, 
    faUsers, 
    faClockRotateLeft,
    faArrowRight,
    faCheck
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "@tanstack/react-router";
import { type CommunityData } from "@/features/community";
import { useTranslation } from "@/shared/hooks/useTranslate";

interface CommunityDrawerModalProps {
    isOpen: boolean;
    onClose: () => void;
    joinedCommunities: CommunityData[];
    activeCommunityId: string | null;
    onSelectCommunity: (id: string | null) => void;
    recentIds: string[];
}

export const CommunityDrawerModal = ({
    isOpen,
    onClose,
    joinedCommunities,
    activeCommunityId,
    onSelectCommunity,
    recentIds,
}: CommunityDrawerModalProps) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-focus search input when opened & listen for Escape
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleClose = () => {
        setSearchQuery("");
        onClose();
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                setSearchQuery("");
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    // Filter communities
    const filteredCommunities = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return joinedCommunities;
        return joinedCommunities.filter((c) =>
            c.name.toLowerCase().includes(query) ||
            (c.game && (typeof c.game === "string" ? c.game.toLowerCase().includes(query) : c.game.name.toLowerCase().includes(query)))
        );
    }, [joinedCommunities, searchQuery]);

    // Recent community list
    const recentCommunities = useMemo(() => {
        return recentIds
            .map((id) => joinedCommunities.find((c) => String(c.id) === id))
            .filter((c): c is CommunityData => !!c);
    }, [recentIds, joinedCommunities]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                onClick={handleClose} 
            />

            {/* Modal Box */}
            <div className="relative w-full max-w-2xl bg-surface border border-divider-primary rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh] z-10">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-divider-primary bg-surface-hover/30">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-widest text-text">
                            {t('community.communitiesLabel', { defaultValue: 'Communities' })}
                        </span>
                        <span className="text-[11px] font-bold text-text-faint">
                            ({joinedCommunities.length})
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-[10px] uppercase font-bold text-text-faint hidden sm:inline px-1.5 py-0.5 rounded border border-divider-secondary">
                            ESC
                        </span>
                        <button
                            type="button"
                            onClick={handleClose}
                            className="text-text-faint hover:text-text p-1 cursor-pointer transition-colors"
                        >
                            <FontAwesomeIcon icon={faXmark} className="text-sm" />
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="px-5 py-3 border-b border-divider-secondary bg-surface-hover/10">
                    <div className="relative flex items-center">
                        <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-3 text-text-faint text-xs" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t('community.searchDrawerPlaceholder', { defaultValue: 'Search your joined communities...' })}
                            className="w-full bg-surface-hover/40 border border-divider-secondary focus:border-primary rounded-[6px] pl-9 pr-8 py-2 text-xs text-text placeholder:text-text-faint outline-none transition-colors"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery("")}
                                className="absolute right-2.5 text-text-faint hover:text-text p-1 cursor-pointer text-xs"
                            >
                                <FontAwesomeIcon icon={faXmark} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Communities Grid / List Area */}
                <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5">
                    {/* All Joined Feed Option */}
                    <div>
                        <button
                            type="button"
                            onClick={() => {
                                onSelectCommunity(null);
                                onClose();
                            }}
                            className={`w-full flex items-center justify-between p-3 rounded-[6px] transition-all cursor-pointer border ${
                                activeCommunityId === null
                                    ? "bg-primary/10 border-primary text-primary font-bold"
                                    : "bg-surface-hover/20 hover:bg-surface-hover/60 border-divider-secondary text-text"
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-xs text-primary ring-1 ring-divider-primary">
                                    <FontAwesomeIcon icon={faUsers} />
                                </div>
                                <div className="flex flex-col text-left">
                                    <span className="font-bold text-xs uppercase tracking-wide">
                                        {t('feed.generalFeed', { defaultValue: 'All Communities Feed' })}
                                    </span>
                                    <span className="text-[11px] text-text-faint">
                                        {t('feed.homeFeedSub', { defaultValue: 'Discussions & updates from your joined communities' })}
                                    </span>
                                </div>
                            </div>
                            {activeCommunityId === null && (
                                <FontAwesomeIcon icon={faCheck} className="text-primary text-sm mr-1" />
                            )}
                        </button>
                    </div>

                    {/* RECENT Communities Section (if no active search query and recents exist) */}
                    {!searchQuery && recentCommunities.length > 0 && (
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-text-faint">
                                <FontAwesomeIcon icon={faClockRotateLeft} className="text-[9px]" />
                                <span>{t('common.recent', { defaultValue: 'Recent' })}</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {recentCommunities.map((c) => {
                                    const isSelected = String(c.id) === String(activeCommunityId);
                                    return (
                                        <button
                                            key={`recent-modal-${c.id}`}
                                            type="button"
                                            onClick={() => {
                                                onSelectCommunity(String(c.id));
                                                onClose();
                                            }}
                                            className={`flex items-center justify-between p-2.5 rounded-[6px] text-left transition-all cursor-pointer border ${
                                                isSelected
                                                    ? "bg-primary/10 border-primary text-primary font-bold"
                                                    : "bg-surface-hover/20 hover:bg-surface-hover/60 border-divider-secondary text-text"
                                            }`}
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <img
                                                    src={c.logo}
                                                    alt={c.name}
                                                    className="w-6 h-6 rounded-full object-cover shrink-0 ring-1 ring-border/50"
                                                />
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-xs font-bold truncate leading-tight">
                                                        {c.name}
                                                    </span>
                                                    {c.onlineCount ? (
                                                        <span className="text-[10px] text-emerald-400/90 font-medium">
                                                            {c.onlineCount.toLocaleString()} online
                                                        </span>
                                                    ) : c.membersCount ? (
                                                        <span className="text-[10px] text-text-faint">
                                                            {c.membersCount.toLocaleString()} members
                                                        </span>
                                                    ) : null}
                                                </div>
                                            </div>
                                            {isSelected && (
                                                <FontAwesomeIcon icon={faCheck} className="text-primary text-xs shrink-0 ml-2" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ALL JOINED COMMUNITIES Grid */}
                    <div className="flex flex-col gap-2">
                        <div className="text-[10px] font-black uppercase tracking-wider text-text-faint">
                            {searchQuery ? `Search Results (${filteredCommunities.length})` : "All Your Communities"}
                        </div>

                        {filteredCommunities.length === 0 ? (
                            <div className="py-8 text-center text-xs text-text-faint">
                                No matching communities found.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {filteredCommunities.map((c) => {
                                    const isSelected = String(c.id) === String(activeCommunityId);
                                    return (
                                        <button
                                            key={c.id}
                                            type="button"
                                            onClick={() => {
                                                onSelectCommunity(String(c.id));
                                                onClose();
                                            }}
                                            className={`flex items-center justify-between p-2.5 rounded-[6px] text-left transition-all cursor-pointer border ${
                                                isSelected
                                                    ? "bg-primary/10 border-primary text-primary font-bold"
                                                    : "bg-surface-hover/20 hover:bg-surface-hover/60 border-divider-secondary text-text"
                                            }`}
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <img
                                                    src={c.logo}
                                                    alt={c.name}
                                                    className="w-6 h-6 rounded-full object-cover shrink-0 ring-1 ring-border/50"
                                                />
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-xs font-bold truncate leading-tight">
                                                        {c.name}
                                                    </span>
                                                    {c.onlineCount ? (
                                                        <span className="text-[10px] text-emerald-400/90 font-medium">
                                                            {c.onlineCount.toLocaleString()} online
                                                        </span>
                                                    ) : c.membersCount ? (
                                                        <span className="text-[10px] text-text-faint">
                                                            {c.membersCount.toLocaleString()} members
                                                        </span>
                                                    ) : null}
                                                </div>
                                            </div>
                                            {isSelected && (
                                                <FontAwesomeIcon icon={faCheck} className="text-primary text-xs shrink-0 ml-2" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t border-divider-primary bg-surface-hover/20 flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() => {
                            onClose();
                            navigate({ to: "/community" });
                        }}
                        className="text-xs font-bold text-primary hover:underline cursor-pointer flex items-center gap-1.5"
                    >
                        <span>{t('feed.manageCommunities', { defaultValue: 'Manage all communities' })}</span>
                        <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
                    </button>

                    <button
                        type="button"
                        onClick={handleClose}
                        className="px-3 py-1.5 rounded-[4px] bg-surface-hover hover:bg-surface-hover/80 text-xs font-bold text-text cursor-pointer transition-colors"
                    >
                        {t('common.close', { defaultValue: 'Close' })}
                    </button>
                </div>
            </div>
        </div>
    );
};
