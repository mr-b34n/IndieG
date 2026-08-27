import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGamepad, faComments, faUsers, faCommentDots, faBookmark, faTrophy, faLayerGroup } from "@fortawesome/free-solid-svg-icons";
import type { ProfileTab } from "../types";
import type { TranslateFn } from "@/shared/hooks/useTranslate";

interface ProfileTabBarProps {
    activeTab: ProfileTab;
    onChange: (tab: ProfileTab) => void;
    friendsCount: number;
    showBookmarks?: boolean;
    t: TranslateFn;
}

export const ProfileTabBar = ({ activeTab, onChange, friendsCount, showBookmarks = true, t }: ProfileTabBarProps) => {
    const tabs: { id: ProfileTab; label: string; icon: typeof faGamepad; count?: number }[] = [
        { id: "overview", label: t("profile.tabs.overview") || "Overview", icon: faLayerGroup },
        { id: "games", label: t("profile.tabs.games") || "Game Mastery", icon: faGamepad },
        { id: "posts", label: t("profile.tabs.posts") || "Posts", icon: faComments },
        { id: "communities", label: t("profile.tabs.communities") || "Communities", icon: faUsers },
        { id: "achievements", label: t("profile.tabs.achievements") || "Achievements", icon: faTrophy },
        { id: "friends", label: t("profile.friendsWidgetTitle") || "Friends", icon: faUsers, count: friendsCount },
        ...(showBookmarks ? [{ id: "bookmarks" as ProfileTab, label: t("common.bookmark") || "Bookmarks", icon: faBookmark }] : []),
        { id: "guestbook", label: t("profile.guestbookTitle") || "Guestbook", icon: faCommentDots },
    ];

    const containerRef = useRef<HTMLDivElement>(null);
    const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
    const [indicator, setIndicator] = useState({ left: 0, width: 0 });

    useEffect(() => {
        const btn = btnRefs.current[activeTab];
        const container = containerRef.current;
        if (btn && container) {
            const br = btn.getBoundingClientRect();
            const cr = container.getBoundingClientRect();
            setIndicator({ left: br.left - cr.left, width: br.width });
        }
    }, [activeTab, friendsCount]);

    return (
        <div className="relative bg-[#0A0C0E] rounded-[12px] px-3 overflow-hidden shadow-sm">
            <div
                ref={containerRef}
                role="tablist"
                className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-2.5"
            >
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            ref={(el) => { btnRefs.current[tab.id] = el; }}
                            role="tab"
                            aria-selected={isActive}
                            onClick={() => onChange(tab.id)}
                            className={`relative flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold whitespace-nowrap transition-all rounded-[8px] cursor-pointer ${
                                isActive
                                    ? "bg-[#181C24] text-[#F0F1F2]"
                                    : "text-[#9A9DA3] hover:text-[#F0F1F2] hover:bg-[#12151B]"
                            }`}
                        >
                            <FontAwesomeIcon
                                icon={tab.icon}
                                className={`text-xs transition-colors ${isActive ? "text-[#1688E8]" : "text-[#8A8F98]"}`}
                            />
                            <span>{tab.label}</span>
                            {tab.count !== undefined && (
                                <span className={`px-1.5 py-0.5 rounded-[4px] text-[10px] font-bold leading-none transition-colors ${
                                    isActive ? "bg-[#252C3A] text-[#F0F1F2]" : "bg-[#14171E] text-[#8A8F98]"
                                }`}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Subtle 2px blue indicator */}
            <div
                className="absolute bottom-0 h-[2px] bg-[#1688E8] transition-all duration-200 ease-out"
                style={{ left: indicator.left, width: indicator.width }}
            />
        </div>
    );
};
