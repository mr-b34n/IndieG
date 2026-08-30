import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faHouse,
    faComments,
    faBook,
    faImages,
    faCalendarDays,
    faUsers,
    faTrophy,
    faFileLines,
    faLink,
    faShieldHalved,
    faCircleInfo,
} from "@fortawesome/free-solid-svg-icons";

interface CommunityHubSidebarProps {
    communityName?: string;
    activeNav: string;
    onNavChange: (navId: string) => void;
    isVi: boolean;
    accentColor?: string;
}

export const CommunityHubSidebar = ({
    activeNav,
    onNavChange,
    isVi,
    accentColor = "text-primary",
}: CommunityHubSidebarProps) => {
    return (
        <div className="w-full flex flex-col gap-5 text-text select-none py-1">
            {/* 1. COMMUNITY UTILITY */}
            <div className="flex flex-col gap-1">
                <p className="px-2 text-[10px] font-mono font-bold uppercase tracking-wider text-text-faint">
                    COMMUNITY
                </p>
                <div className="flex flex-col gap-0.5">
                    {[
                        { id: "home", labelVi: "Home", labelEn: "Home", icon: faHouse },
                        { id: "discussions", labelVi: "Discussions", labelEn: "Discussions", icon: faComments },
                        { id: "guides", labelVi: "Guides", labelEn: "Guides", icon: faBook },
                        { id: "media", labelVi: "Media", labelEn: "Media", icon: faImages },
                        { id: "events", labelVi: "Events", labelEn: "Events", icon: faCalendarDays },
                    ].map((item) => {
                        const isActive = activeNav === item.id;
                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => onNavChange(item.id)}
                                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-[4px] text-xs font-semibold transition-colors cursor-pointer text-left ${
                                    isActive
                                        ? "bg-surface-hover text-text font-bold"
                                        : "text-text-muted hover:text-text hover:bg-surface-hover/50"
                                }`}
                            >
                                <FontAwesomeIcon
                                    icon={item.icon}
                                    className={`text-xs w-4 shrink-0 ${isActive ? accentColor : "text-text-faint"}`}
                                />
                                <span className="truncate">{isVi ? item.labelVi : item.labelEn}</span>
                                {isActive && (
                                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 2. PEOPLE */}
            <div className="flex flex-col gap-1 border-t border-divider-primary/50 pt-4">
                <p className="px-2 text-[10px] font-mono font-bold uppercase tracking-wider text-text-faint">
                    {isVi ? "THÀNH VIÊN" : "PEOPLE"}
                </p>
                <div className="flex flex-col gap-0.5">
                    {[
                        { id: "members", labelVi: "Members", labelEn: "Members", icon: faUsers },
                        { id: "leaderboard", labelVi: "Leaderboard", labelEn: "Leaderboard", icon: faTrophy },
                    ].map((item) => {
                        const isActive = activeNav === item.id;
                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => onNavChange(item.id)}
                                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-[4px] text-xs font-semibold transition-colors cursor-pointer text-left ${
                                    isActive
                                        ? "bg-surface-hover text-text font-bold"
                                        : "text-text-muted hover:text-text hover:bg-surface-hover/50"
                                }`}
                            >
                                <FontAwesomeIcon
                                    icon={item.icon}
                                    className={`text-xs w-4 shrink-0 ${isActive ? accentColor : "text-text-faint"}`}
                                />
                                <span className="truncate">{isVi ? item.labelVi : item.labelEn}</span>
                                {isActive && (
                                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 3. RESOURCES */}
            <div className="flex flex-col gap-1 border-t border-divider-primary/50 pt-4">
                <p className="px-2 text-[10px] font-mono font-bold uppercase tracking-wider text-text-faint">
                    {isVi ? "TÀI NGUYÊN" : "RESOURCES"}
                </p>
                <div className="flex flex-col gap-0.5">
                    {[
                        { id: "wiki", labelVi: "Wiki & Docs", labelEn: "Wiki & Docs", icon: faFileLines },
                        { id: "links", labelVi: "Links liên kết", labelEn: "Links", icon: faLink },
                    ].map((item) => {
                        const isActive = activeNav === item.id;
                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => onNavChange(item.id)}
                                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-[4px] text-xs font-semibold transition-colors cursor-pointer text-left ${
                                    isActive
                                        ? "bg-surface-hover text-text font-bold"
                                        : "text-text-muted hover:text-text hover:bg-surface-hover/50"
                                }`}
                            >
                                <FontAwesomeIcon
                                    icon={item.icon}
                                    className={`text-xs w-4 shrink-0 ${isActive ? accentColor : "text-text-faint"}`}
                                />
                                <span className="truncate">{isVi ? item.labelVi : item.labelEn}</span>
                                {isActive && (
                                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 4. ABOUT */}
            <div className="flex flex-col gap-1 border-t border-divider-primary/50 pt-4">
                <p className="px-2 text-[10px] font-mono font-bold uppercase tracking-wider text-text-faint">
                    {isVi ? "THÔNG TIN" : "ABOUT"}
                </p>
                <div className="flex flex-col gap-0.5">
                    {[
                        { id: "rules", labelVi: "Nội quy", labelEn: "Rules", icon: faShieldHalved },
                        { id: "about", labelVi: "Về cộng đồng", labelEn: "About", icon: faCircleInfo },
                    ].map((item) => {
                        const isActive = activeNav === item.id;
                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => onNavChange(item.id)}
                                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-[4px] text-xs font-semibold transition-colors cursor-pointer text-left ${
                                    isActive
                                        ? "bg-surface-hover text-text font-bold"
                                        : "text-text-muted hover:text-text hover:bg-surface-hover/50"
                                }`}
                            >
                                <FontAwesomeIcon
                                    icon={item.icon}
                                    className={`text-xs w-4 shrink-0 ${isActive ? accentColor : "text-text-faint"}`}
                                />
                                <span className="truncate">{isVi ? item.labelVi : item.labelEn}</span>
                                {isActive && (
                                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

