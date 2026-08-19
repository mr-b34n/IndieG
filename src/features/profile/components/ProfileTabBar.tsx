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
        <div className="relative bg-[#101421] rounded-2xl px-2.5 overflow-hidden shadow-md">
            <div
                ref={containerRef}
                role="tablist"
                className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-2"
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
                            className={`relative flex items-center gap-2 px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all rounded-xl cursor-pointer ${
                                isActive ? "text-[#1687FF] bg-[#151A29] shadow-xs" : "text-text-muted hover:text-text hover:bg-[#151A29]/50"
                            }`}
                        >
                            <FontAwesomeIcon
                                icon={tab.icon}
                                className={`text-xs transition-colors ${isActive ? "text-[#22D3EE]" : "text-text-faint"}`}
                            />
                            <span>{tab.label}</span>
                            {tab.count !== undefined && (
                                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black leading-none transition-colors ${
                                    isActive ? "bg-gradient-to-r from-[#1687FF] to-[#22D3EE] text-white" : "bg-[#181D2F] text-text-faint"
                                }`}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Sliding signature gradient underline indicator */}
            <div
                className="absolute bottom-0 h-0.5 bg-gradient-to-r from-[#1687FF] to-[#22D3EE] rounded-full transition-all duration-300 ease-out shadow-[0_0_8px_rgba(22,135,255,0.5)]"
                style={{ left: indicator.left, width: indicator.width }}
            />
        </div>
    );
};
