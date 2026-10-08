import { useEffect, useRef, useState } from "react";
import type { ProfileTab } from "../types";
import type { TranslateFn } from "@/shared/hooks/useTranslate";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faShareNodes, faEllipsisV, faPen, faLink, faFlag } from "@fortawesome/free-solid-svg-icons";
import { useClickOutside } from "../hooks/useClickOutside";

interface ProfileTabBarProps {
    activeTab: ProfileTab;
    onChange: (tab: ProfileTab) => void;
    friendsCount: number;
    showBookmarks?: boolean;
    isCustomizeMode?: boolean;
    isOwnProfile?: boolean;
    onStartEditMode?: () => void;
    onToggleCustomizeMode?: () => void;
    t: TranslateFn;
}

export const ProfileTabBar = ({
    activeTab,
    onChange,
    friendsCount,
    showBookmarks = true,
    isCustomizeMode = false,
    isOwnProfile = false,
    onStartEditMode,
    onToggleCustomizeMode,
    t,
}: ProfileTabBarProps) => {
    const tabs: { id: ProfileTab; label: string; count?: number }[] = [
        { id: "overview", label: t("profile.tabs.overview") || "Overview" },
        { id: "games", label: "Library" },
        { id: "posts", label: t("profile.tabs.posts") || "Posts" },
        { id: "communities", label: t("profile.tabs.communities") || "Communities" },
        { id: "friends", label: t("profile.friendsWidgetTitle") || "Friends", count: friendsCount },
        ...(showBookmarks ? [{ id: "bookmarks" as ProfileTab, label: t("common.bookmark") || "Bookmarks" }] : []),
        { id: "guestbook", label: t("profile.guestbookTitle") || "Guestbook" },
    ];

    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [showOverflowMenu, setShowOverflowMenu] = useState(false);
    const [toastMsg, setToastMsg] = useState("");
    
    const menuRef = useRef<HTMLDivElement>(null);
    useClickOutside(menuRef, () => setShowOverflowMenu(false), showOverflowMenu);

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        setToastMsg("Profile URL copied!");
        setTimeout(() => setToastMsg(""), 3000);
    };

    return (
        <div 
            className="sticky top-0 z-40 py-3 mb-2 transition-all bg-[rgba(255,255,255,0.03)] backdrop-blur-[8px] border-none"
            style={{ boxShadow: "0 8px 12px -8px rgba(0,0,0,0.5)" }}
        >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 max-w-7xl mx-auto px-4 sm:px-0">
                
                {/* Segmented Pill Tabs */}
                <div 
                    className="flex items-center gap-1 bg-[rgba(255,255,255,0.03)] p-1.5 rounded-[12px] overflow-x-auto scrollbar-none border-none"
                    style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.35), 0 1px 2px rgba(0,0,0,0.25)" }}
                >
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        const isLocked = isCustomizeMode && tab.id !== "overview";
                        return (
                            <button
                                key={tab.id}
                                role="tab"
                                aria-selected={isActive}
                                onClick={() => onChange(tab.id)}
                                title={isLocked ? "Vui lòng lưu hoặc hủy chỉnh sửa ở tab Tổng quan trước khi đổi tab" : undefined}
                                className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold whitespace-nowrap transition-all rounded-[8px] cursor-pointer border-none ${
                                    isActive
                                        ? "bg-[#222834] text-[#F0F1F2]"
                                        : isLocked
                                        ? "text-[#666A71] opacity-35 hover:opacity-50"
                                        : "text-[#8A8F98] hover:text-[#F0F1F2] hover:bg-[#1A1E28]"
                                }`}
                                style={isActive ? { boxShadow: "0 0 12px rgba(22, 136, 232, 0.25)" } : undefined}
                            >
                                <span>{tab.label}</span>
                                {tab.count !== undefined && !isLocked && (
                                    <span className={`px-1.5 py-0.5 rounded-[4px] text-[10px] font-bold leading-none transition-colors border-none ${
                                        isActive ? "bg-[#1688E8] text-white" : "bg-[rgba(255,255,255,0.03)] text-[#8A8F98]"
                                    }`}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Utility Cluster */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    {/* Search */}
                    <div className="relative flex items-center">
                        <input 
                            type="text" 
                            placeholder="Search profile..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setIsSearchExpanded(true)}
                            onBlur={() => !searchQuery && setIsSearchExpanded(false)}
                            className={`bg-[rgba(255,255,255,0.03)] border-none text-[#F0F1F2] text-xs rounded-full pl-8 pr-3 py-1.5 focus:outline-none transition-all duration-300 ${
                                isSearchExpanded || searchQuery ? "w-40 sm:w-48 opacity-100" : "w-8 sm:w-10 opacity-0 sm:opacity-100 sm:w-32 cursor-pointer"
                            }`}
                            style={{ boxShadow: (isSearchExpanded || searchQuery) ? "0 0 0 1px rgba(22, 136, 232, 0.12)" : "none" }}
                        />
                        <FontAwesomeIcon 
                            icon={faSearch} 
                            className={`absolute left-2.5 text-xs pointer-events-none transition-colors ${isSearchExpanded || searchQuery ? "text-[#1688E8]" : "text-[#8A8F98]"}`} 
                        />
                        {/* Mobile collapsed search icon trigger */}
                        {!(isSearchExpanded || searchQuery) && (
                            <button 
                                className="sm:hidden absolute inset-0 w-8 h-8 flex items-center justify-center rounded-full bg-[rgba(255,255,255,0.03)] border-none text-[#8A8F98]"
                                onClick={() => setIsSearchExpanded(true)}
                            >
                                <FontAwesomeIcon icon={faSearch} className="text-xs" />
                            </button>
                        )}
                    </div>

                    {/* Share */}
                    <div className="relative">
                        <button 
                            type="button"
                            onClick={handleShare}
                            className="w-8 h-8 rounded-full bg-[rgba(255,255,255,0.03)] border-none flex items-center justify-center text-[#8A8F98] hover:text-[#F0F1F2] hover:bg-[rgba(255,255,255,0.05)] transition-all duration-200 cursor-pointer"
                            title="Share Profile"
                        >
                            <FontAwesomeIcon icon={faShareNodes} className="text-xs" />
                        </button>
                        {toastMsg && (
                            <div className="absolute top-full right-0 mt-2 px-2 py-1 bg-[rgba(255,255,255,0.1)] backdrop-blur-md text-white text-[10px] font-bold rounded shadow-lg whitespace-nowrap animate-fade-in border-none">
                                {toastMsg}
                            </div>
                        )}
                    </div>

                    {/* Overflow Menu */}
                    <div className="relative" ref={menuRef}>
                        <button 
                            type="button"
                            onClick={() => setShowOverflowMenu(!showOverflowMenu)}
                            className="w-8 h-8 rounded-full bg-[rgba(255,255,255,0.03)] border-none flex items-center justify-center text-[#8A8F98] hover:text-[#F0F1F2] hover:bg-[rgba(255,255,255,0.05)] transition-all duration-200 cursor-pointer"
                        >
                            <FontAwesomeIcon icon={faEllipsisV} className="text-xs" />
                        </button>
                        
                        {showOverflowMenu && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-[rgba(13,17,23,0.8)] backdrop-blur-[12px] border-none rounded-[8px] p-1 z-50 animate-scale-up flex flex-col gap-0.5" style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.25)" }}>
                                {isOwnProfile && !isCustomizeMode && (
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            setShowOverflowMenu(false);
                                            if (onStartEditMode) onStartEditMode();
                                            else if (onToggleCustomizeMode) onToggleCustomizeMode();
                                        }}
                                        className="flex items-center gap-2.5 px-3 py-2 w-full text-left text-xs font-semibold text-[#F0F1F2] hover:bg-[rgba(255,255,255,0.05)] rounded-[6px] transition-all duration-200 cursor-pointer border-none"
                                    >
                                        <FontAwesomeIcon icon={faPen} className="text-[#1688E8] w-4" />
                                        <span>Edit Profile</span>
                                    </button>
                                )}
                                <button 
                                    type="button"
                                    onClick={() => {
                                        setShowOverflowMenu(false);
                                        handleShare();
                                    }}
                                    className="flex items-center gap-2.5 px-3 py-2 w-full text-left text-xs font-semibold text-[#F0F1F2] hover:bg-[rgba(255,255,255,0.05)] rounded-[6px] transition-all duration-200 cursor-pointer border-none"
                                >
                                    <FontAwesomeIcon icon={faLink} className="text-[#8A8F98] w-4" />
                                    <span>Copy Profile Link</span>
                                </button>
                                {!isOwnProfile && (
                                    <button 
                                        type="button"
                                        onClick={() => setShowOverflowMenu(false)}
                                        className="flex items-center gap-2.5 px-3 py-2 w-full text-left text-xs font-semibold text-[#FF6B6B] hover:bg-[rgba(255,107,107,0.1)] rounded-[6px] transition-all duration-200 cursor-pointer border-none"
                                    >
                                        <FontAwesomeIcon icon={faFlag} className="w-4" />
                                        <span>Report User</span>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

