import { useTranslation } from "@/shared/hooks/useTranslate";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faHouse,
    faComments,
    faBook,
    faImages,
    faCalendarDays,
    faChevronLeft,
    faChevronRight,
    faUsers,
    faLink,
    faShieldHalved,
    faFlag,
    faGear,
    faSliders,
    faGavel,
} from "@fortawesome/free-solid-svg-icons";

interface CommunityHubSidebarProps {
    activeNav: string;
    onNavChange: (navId: string) => void;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
    isVi: boolean;
    userRole?: "owner" | "admin" | "moderator" | "member";
    pendingCount?: number;
    reportsCount?: number;
}

export const CommunityHubSidebar = ({
    activeNav,
    onNavChange,
    isCollapsed,
    onToggleCollapse,
    isVi,
    userRole = "owner",
    pendingCount,
    reportsCount,
}: CommunityHubSidebarProps) => {
    const { t } = useTranslation();
    const hasManagePermission = userRole === "owner" || userRole === "admin" || userRole === "moderator";

    // 1. Primary community feed & content navigation
    const primaryNavItems = [
        { id: "home", labelVi: "Trang chủ", labelEn: "Home", icon: faHouse },
        { id: "discussions", labelVi: "Thảo luận", labelEn: "Discussions", icon: faComments },
        { id: "guides", labelVi: "Hướng dẫn", labelEn: "Guides", icon: faBook },
        { id: "media", labelVi: "Media", labelEn: "Media", icon: faImages },
        { id: "events", labelVi: "Sự kiện", labelEn: "Events", icon: faCalendarDays },
    ];

    // 2. Direct visible info & resources navigation (no generic more dropdown)
    const resourceNavItems = [
        { id: "members", labelVi: "Thành viên", labelEn: "Members", icon: faUsers },
        { id: "rules", labelVi: "Quy tắc", labelEn: "Rules", icon: faShieldHalved },
        { id: "links", labelVi: "Liên kết", labelEn: "Links", icon: faLink },
    ];

    // 3. Operational Management navigation items
    const manageNavItems = [
        { id: "manage-overview", labelVi: "Tổng quan", labelEn: "Overview", icon: faSliders },
        { 
            id: "manage-moderation", 
            labelVi: "Kiểm duyệt", 
            labelEn: "Moderation", 
            icon: faGavel, 
            badge: pendingCount && pendingCount > 0 ? String(pendingCount) : undefined 
        },
        { 
            id: "manage-members", 
            labelVi: "Thành viên", 
            labelEn: "Members", 
            icon: faUsers 
        },
        { 
            id: "manage-reports", 
            labelVi: "Báo cáo", 
            labelEn: "Reports", 
            icon: faFlag, 
            badge: reportsCount && reportsCount > 0 ? String(reportsCount) : undefined 
        },
        ...(userRole === "owner" || userRole === "admin"
            ? [{ id: "manage-settings", labelVi: "Cài đặt", labelEn: "Settings", icon: faGear }]
            : []),
    ];

    const renderNavButton = (item: {
        id: string;
        labelVi: string;
        labelEn: string;
        icon: typeof faHouse;
        badge?: string;
    }) => {
        const isActive = activeNav === item.id;
        const label = isVi ? item.labelVi : item.labelEn;

        return (
            <button
                key={item.id}
                type="button"
                onClick={() => onNavChange(item.id)}
                title={isCollapsed ? label : undefined}
                className={`group relative flex items-center h-8.5 rounded-[6px] text-xs font-semibold transition-colors duration-150 cursor-pointer ${
                    isCollapsed
                        ? "w-9 justify-center"
                        : "w-full px-2.5 gap-2.5 text-left"
                } ${
                    isActive
                        ? "bg-surface-hover text-text font-bold border-l-2 border-primary"
                        : "text-text-muted hover:text-text hover:bg-surface-hover/60"
                }`}
            >
                <div className="w-4 h-4 flex items-center justify-center shrink-0">
                    <FontAwesomeIcon
                        icon={item.icon}
                        className={`text-xs shrink-0 transition-colors ${
                            isActive ? "text-primary" : "text-text-faint group-hover:text-text"
                        }`}
                    />
                </div>

                {!isCollapsed && (
                    <span className="truncate flex-1">{label}</span>
                )}

                {!isCollapsed && item.badge && (
                    <span className="ml-auto px-1.5 py-0.2 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 font-mono text-[9px] font-bold shrink-0">
                        {item.badge}
                    </span>
                )}

                {/* Collapsed Tooltip */}
                {isCollapsed && (
                    <div className="absolute left-full ml-2.5 px-2.5 py-1 bg-surface-inner border border-border rounded text-xs font-bold text-text shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                        {label}
                    </div>
                )}
            </button>
        );
    };

    return (
        <aside
            className={`flex flex-col justify-between select-none ${
                isCollapsed ? "w-12 items-start" : "w-full"
            }`}
        >
            <div className="w-full flex flex-col gap-4">
                {/* 1. SECTION: COMMUNITY */}
                <div className="w-full flex flex-col gap-1">
                    {!isCollapsed ? (
                        <div className="flex items-center justify-between px-2 pt-1 h-7">
                            <span className="text-[10px] font-mono font-bold tracking-widest text-text-faint uppercase">
                                COMMUNITY
                            </span>
                            <button
                                type="button"
                                onClick={onToggleCollapse}
                                title={t('hub.communityhubsidebar_41')}
                                className="w-6 h-6 flex items-center justify-center text-text-faint hover:text-text rounded hover:bg-surface-hover/60 transition-colors cursor-pointer text-xs"
                            >
                                <FontAwesomeIcon icon={faChevronLeft} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-start pl-1 pt-1 h-7">
                            <button
                                type="button"
                                onClick={onToggleCollapse}
                                title={t('hub.communityhubsidebar_42')}
                                className="w-7 h-7 flex items-center justify-center text-text-faint hover:text-text rounded hover:bg-surface-hover/60 transition-colors cursor-pointer text-xs"
                            >
                                <FontAwesomeIcon icon={faChevronRight} />
                            </button>
                        </div>
                    )}

                    <nav className="w-full flex flex-col gap-0.5">
                        {primaryNavItems.map(renderNavButton)}
                    </nav>
                </div>

                {/* 2. SECTION: INFO & RESOURCES (DIRECTLY VISIBLE) */}
                <div className="w-full flex flex-col gap-1 pt-2 border-t border-border/40">
                    {!isCollapsed && (
                        <div className="px-2 py-0.5 text-text-faint">
                            <span className="text-[10px] font-mono font-bold tracking-widest text-text-faint uppercase">
                                RESOURCES
                            </span>
                        </div>
                    )}
                    <nav className="w-full flex flex-col gap-0.5">
                        {resourceNavItems.map(renderNavButton)}
                    </nav>
                </div>

                {/* 3. SECTION: MANAGE (Action-oriented, shown for Stewards/Admins) */}
                {hasManagePermission && (
                    <div className="w-full flex flex-col gap-1 pt-2 border-t border-border/40">
                        {!isCollapsed && (
                            <div className="flex items-center gap-1.5 px-2 py-0.5 text-text-faint">
                                <FontAwesomeIcon icon={faShieldHalved} className="text-[9px] text-primary" />
                                <span className="text-[10px] font-mono font-bold tracking-widest text-text-faint uppercase">
                                    MANAGE
                                </span>
                            </div>
                        )}

                        <nav className="w-full flex flex-col gap-0.5">
                            {manageNavItems.map(renderNavButton)}
                        </nav>
                    </div>
                )}
            </div>
        </aside>
    );
};
