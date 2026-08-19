import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faHouse,
    faComments,
    faCircleQuestion,
    faBook,
    faImages,
    faCalendarDays,
    faFileLines,
    faDownload,
    faLink,
    faShieldHalved,
    faCircleInfo,
} from "@fortawesome/free-solid-svg-icons";

interface CommunityHubSidebarProps {
    activeNav: string;
    onNavChange: (navId: string) => void;
    isVi: boolean;
    accentColor?: string;
}

export const CommunityHubSidebar = ({
    activeNav,
    onNavChange,
    isVi,
    accentColor = "text-teal-400",
}: CommunityHubSidebarProps) => {
    return (
        <div className="w-full flex flex-col gap-5 text-text select-none py-1">
            {/* COMMUNITY SECTION */}
            <div className="flex flex-col gap-1">
                <p className="px-2 text-[10px] font-mono font-bold uppercase tracking-wider text-text-faint">
                    COMMUNITY
                </p>
                <button
                    type="button"
                    onClick={() => onNavChange("overview")}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-[4px] text-xs font-semibold transition-colors cursor-pointer text-left ${
                        activeNav === "overview"
                            ? "bg-surface-hover text-text font-bold"
                            : "text-text-muted hover:text-text hover:bg-surface-hover/50"
                    }`}
                >
                    <FontAwesomeIcon
                        icon={faHouse}
                        className={`text-xs w-4 shrink-0 ${activeNav === "overview" ? accentColor : "text-text-faint"}`}
                    />
                    <span>{isVi ? "Tổng quan" : "Overview"}</span>
                    {activeNav === "overview" && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                </button>
            </div>

            {/* DISCUSSIONS SECTION */}
            <div className="flex flex-col gap-1">
                <p className="px-2 text-[10px] font-mono font-bold uppercase tracking-wider text-text-faint">
                    DISCUSSIONS
                </p>
                <div className="flex flex-col gap-0.5">
                    {[
                        { id: "all", labelVi: "Tất cả thảo luận", labelEn: "All Discussions", icon: faComments },
                        { id: "qa", labelVi: "Hỏi đáp & Trợ giúp", labelEn: "Q&A / Help", icon: faCircleQuestion },
                        { id: "guides", labelVi: "Guides & Tutorials", labelEn: "Guides & Tutorials", icon: faBook },
                        { id: "showcase", labelVi: "Showcase căn cứ", labelEn: "Showcase", icon: faImages },
                        { id: "events", labelVi: "Sự kiện cộng đồng", labelEn: "Events", icon: faCalendarDays },
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

            {/* RESOURCES SECTION */}
            <div className="flex flex-col gap-1 border-t border-divider-primary/50 pt-4">
                <p className="px-2 text-[10px] font-mono font-bold uppercase tracking-wider text-text-faint">
                    RESOURCES
                </p>
                <div className="flex flex-col gap-0.5">
                    <a
                        href="#wiki"
                        className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-[4px] text-xs text-text-muted hover:text-text hover:bg-surface-hover/50 font-medium transition-colors"
                    >
                        <FontAwesomeIcon icon={faFileLines} className="text-xs w-4 shrink-0 text-text-faint" />
                        <span>Wiki & Guides</span>
                    </a>
                    <a
                        href="#downloads"
                        className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-[4px] text-xs text-text-muted hover:text-text hover:bg-surface-hover/50 font-medium transition-colors"
                    >
                        <FontAwesomeIcon icon={faDownload} className="text-xs w-4 shrink-0 text-text-faint" />
                        <span>Downloads</span>
                    </a>
                    <a
                        href="#links"
                        className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-[4px] text-xs text-text-muted hover:text-text hover:bg-surface-hover/50 font-medium transition-colors"
                    >
                        <FontAwesomeIcon icon={faLink} className="text-xs w-4 shrink-0 text-text-faint" />
                        <span>Links</span>
                    </a>
                </div>
            </div>

            {/* ABOUT SECTION */}
            <div className="flex flex-col gap-1 border-t border-divider-primary/50 pt-4">
                <p className="px-2 text-[10px] font-mono font-bold uppercase tracking-wider text-text-faint">
                    ABOUT
                </p>
                <div className="flex flex-col gap-0.5">
                    <a
                        href="#rules"
                        className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-[4px] text-xs text-text-muted hover:text-text hover:bg-surface-hover/50 font-medium transition-colors"
                    >
                        <FontAwesomeIcon icon={faShieldHalved} className="text-xs w-4 shrink-0 text-text-faint" />
                        <span>{isVi ? "Nội quy" : "Rules"}</span>
                    </a>
                    <a
                        href="#about"
                        className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-[4px] text-xs text-text-muted hover:text-text hover:bg-surface-hover/50 font-medium transition-colors"
                    >
                        <FontAwesomeIcon icon={faCircleInfo} className="text-xs w-4 shrink-0 text-text-faint" />
                        <span>{isVi ? "Về chúng tôi" : "About"}</span>
                    </a>
                </div>
            </div>
        </div>
    );
};
