import { useEffect, useRef, useState } from "react";
import type { ProfileTab } from "../types";
import type { TranslateFn } from "@/shared/hooks/useTranslate";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShareNodes, faEllipsisV, faPen, faLink, faFlag } from "@fortawesome/free-solid-svg-icons";
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
        <div className="py-3 mb-2 z-40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 max-w-7xl mx-auto px-4 sm:px-0">
                
                {/* Segmented Pill Tabs */}
                <div className="flex items-center gap-1 bg-[#14171D] p-1.5 rounded-[12px] overflow-x-auto scrollbar-none border border-[#1A1F2A]/80 shadow-xs">
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
                                className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold whitespace-nowrap transition-all rounded-[8px] cursor-pointer ${
                                    isActive
                                        ? "bg-[#222834] text-[#F0F1F2] shadow-sm"
                                        : isLocked
                                        ? "text-[#666A71] opacity-35 hover:opacity-50"
                                        : "text-[#8A8F98] hover:text-[#F0F1F2] hover:bg-[#1A1E28]"
                                }`}
                            >
                                <span>{tab.label}</span>
                                {tab.count !== undefined && !isLocked && (
                                    <span className={`px-1.5 py-0.5 rounded-[4px] text-[10px] font-bold leading-none transition-colors ${
                                        isActive ? "bg-[#1688E8] text-white" : "bg-[#0A0C0E] text-[#8A8F98]"
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
                    {/* Share */}
                    <div className="relative">
                        <button 
                            type="button"
                            onClick={handleShare}
                            className="w-8 h-8 rounded-full bg-[#14171D] border border-[#222834] flex items-center justify-center text-[#8A8F98] hover:text-[#F0F1F2] hover:bg-[#1A1E28] transition-all cursor-pointer"
                            title="Share Profile"
                        >
                            <FontAwesomeIcon icon={faShareNodes} className="text-xs" />
                        </button>
                        {toastMsg && (
                            <div className="absolute top-full right-0 mt-2 px-2 py-1 bg-[#24C58A] text-white text-[10px] font-bold rounded shadow-lg whitespace-nowrap animate-fade-in">
                                {toastMsg}
                            </div>
                        )}
                    </div>

                    {/* Overflow Menu */}
                    <div className="relative" ref={menuRef}>
                        <button 
                            type="button"
                            onClick={() => setShowOverflowMenu(!showOverflowMenu)}
                            className="w-8 h-8 rounded-full bg-[#14171D] border border-[#222834] flex items-center justify-center text-[#8A8F98] hover:text-[#F0F1F2] hover:bg-[#1A1E28] transition-all cursor-pointer"
                        >
                            <FontAwesomeIcon icon={faEllipsisV} className="text-xs" />
                        </button>
                        
                        {showOverflowMenu && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-[#14171D] border border-[#222834] rounded-[8px] shadow-xl p-1 z-50 animate-scale-up flex flex-col gap-0.5">
                                {isOwnProfile && !isCustomizeMode && (
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            setShowOverflowMenu(false);
                                            if (onStartEditMode) onStartEditMode();
                                            else if (onToggleCustomizeMode) onToggleCustomizeMode();
                                        }}
                                        className="flex items-center gap-2.5 px-3 py-2 w-full text-left text-xs font-semibold text-[#F0F1F2] hover:bg-[#1A1E28] rounded-[6px] transition-colors cursor-pointer"
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
                                    className="flex items-center gap-2.5 px-3 py-2 w-full text-left text-xs font-semibold text-[#F0F1F2] hover:bg-[#1A1E28] rounded-[6px] transition-colors cursor-pointer"
                                >
                                    <FontAwesomeIcon icon={faLink} className="text-[#8A8F98] w-4" />
                                    <span>Copy Profile Link</span>
                                </button>
                                {!isOwnProfile && (
                                    <button 
                                        type="button"
                                        onClick={() => setShowOverflowMenu(false)}
                                        className="flex items-center gap-2.5 px-3 py-2 w-full text-left text-xs font-semibold text-[#FF6B6B] hover:bg-rose-500/10 rounded-[6px] transition-colors cursor-pointer"
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

