import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faHouse,
    faComments,
    faBook,
    faImages,
    faCalendarDays,
    faEllipsis,
    faChevronLeft,
    faChevronRight,
    faUsers,
    faTrophy,
    faFileLines,
    faLink,
    faShieldHalved,
    faCircleInfo,
    faGavel,
    faFlag,
    faGear,
    faSliders,
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
    const [isMoreOpen, setIsMoreOpen] = useState(false);
    const moreRef = useRef<HTMLDivElement>(null);

    const hasManagePermission = userRole === "owner" || userRole === "admin" || userRole === "moderator";

    // Primary community navigation items
    const primaryNavItems = [
        { id: "home", labelVi: "Trang chủ", labelEn: "Home", icon: faHouse },
        { id: "discussions", labelVi: "Thảo luận", labelEn: "Discussions", icon: faComments },
        { id: "guides", labelVi: "Hướng dẫn", labelEn: "Guides", icon: faBook },
        { id: "media", labelVi: "Hình ảnh & Media", labelEn: "Media", icon: faImages },
        { id: "events", labelVi: "Sự kiện", labelEn: "Events", icon: faCalendarDays },
    ];

    // Secondary items hidden under "More"
    const moreNavItems = [
        { id: "members", labelVi: "Thành viên", labelEn: "Members", icon: faUsers },
        { id: "leaderboard", labelVi: "Bảng xếp hạng", labelEn: "Leaderboard", icon: faTrophy },
        { id: "wiki", labelVi: "Wiki & Tài liệu", labelEn: "Wiki", icon: faFileLines },
        { id: "links", labelVi: "Liên kết cộng đồng", labelEn: "Links", icon: faLink },
        { id: "rules", labelVi: "Quy tắc cộng đồng", labelEn: "Rules", icon: faShieldHalved },
        { id: "about", labelVi: "Về chúng tôi", labelEn: "About", icon: faCircleInfo },
    ];

    // Management navigation items
    const manageNavItems = [
        { id: "manage-overview", labelVi: "Tổng quan", labelEn: "Overview", icon: faSliders },
        { 
            id: "manage-moderation", 
            labelVi: "Kiểm duyệt", 
            labelEn: "Moderation", 
            icon: faGavel, 
            badge: pendingCount && pendingCount > 0 ? String(pendingCount) : undefined 
        },
        { id: "manage-members", labelVi: "Thành viên", labelEn: "Members", icon: faUsers },
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

    // Close "More" dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
                setIsMoreOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const isMoreActive = moreNavItems.some((item) => item.id === activeNav);

    return (
        <aside
            className={`flex flex-col justify-between select-none ${
                isCollapsed ? "w-12 items-center" : "w-full"
            }`}
        >
            <div className="w-full flex flex-col gap-3">
                {/* Header Title / Toggle */}
                {!isCollapsed ? (
                    <div className="flex items-center justify-between px-2 pt-1 h-8">
                        <span className="text-[11px] font-mono font-bold tracking-widest text-text-faint uppercase">
                            COMMUNITY
                        </span>
                        <button
                            type="button"
                            onClick={onToggleCollapse}
                            title={isVi ? "Thu gọn thanh điều hướng" : "Collapse sidebar"}
                            className="w-7 h-7 flex items-center justify-center text-text-faint hover:text-text rounded hover:bg-surface-hover/60 transition-colors cursor-pointer text-xs"
                        >
                            <FontAwesomeIcon icon={faChevronLeft} />
                        </button>
                    </div>
                ) : (
                    <div className="flex justify-center pt-1 h-8">
                        <button
                            type="button"
                            onClick={onToggleCollapse}
                            title={isVi ? "Mở rộng thanh điều hướng" : "Expand sidebar"}
                            className="w-7 h-7 flex items-center justify-center text-text-faint hover:text-text rounded hover:bg-surface-hover/60 transition-colors cursor-pointer text-xs"
                        >
                            <FontAwesomeIcon icon={faChevronRight} />
                        </button>
                    </div>
                )}

                {/* Primary Nav Links */}
                <nav className="w-full flex flex-col gap-1">
                    {primaryNavItems.map((item) => {
                        const isActive = activeNav === item.id;
                        const label = isVi ? item.labelVi : item.labelEn;

                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => {
                                    onNavChange(item.id);
                                    setIsMoreOpen(false);
                                }}
                                title={isCollapsed ? label : undefined}
                                className={`group relative flex items-center h-9 rounded-[6px] text-xs font-semibold transition-colors duration-150 cursor-pointer ${
                                    isCollapsed
                                        ? "w-9 justify-center mx-auto"
                                        : "w-full px-2.5 gap-2.5 text-left"
                                } ${
                                    isActive
                                        ? "bg-surface-hover text-text font-bold"
                                        : "text-text-muted hover:text-text hover:bg-surface-hover/50"
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

                                {isActive && !isCollapsed && (
                                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                )}

                                {/* Collapsed Tooltip */}
                                {isCollapsed && (
                                    <div className="absolute left-full ml-2.5 px-2.5 py-1 bg-surface-inner border border-divider-primary rounded text-xs font-bold text-text shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                                        {label}
                                    </div>
                                )}
                            </button>
                        );
                    })}

                    {/* "More" Destination Item */}
                    <div ref={moreRef} className="relative w-full">
                        <button
                            type="button"
                            onClick={() => setIsMoreOpen(!isMoreOpen)}
                            title={isCollapsed ? (isVi ? "Thêm" : "More") : undefined}
                            className={`group relative flex items-center h-9 rounded-[6px] text-xs font-semibold transition-colors duration-150 cursor-pointer ${
                                isCollapsed
                                    ? "w-9 justify-center mx-auto"
                                    : "w-full px-2.5 gap-2.5 text-left"
                            } ${
                                isMoreActive || isMoreOpen
                                    ? "bg-surface-hover text-text font-bold"
                                    : "text-text-muted hover:text-text hover:bg-surface-hover/50"
                            }`}
                        >
                            <div className="w-4 h-4 flex items-center justify-center shrink-0">
                                <FontAwesomeIcon
                                    icon={faEllipsis}
                                    className={`text-xs shrink-0 transition-colors ${
                                        isMoreActive || isMoreOpen ? "text-primary" : "text-text-faint group-hover:text-text"
                                    }`}
                                />
                            </div>

                            {!isCollapsed && (
                                <span className="truncate flex-1">{isVi ? "Thêm..." : "More"}</span>
                            )}

                            {isMoreActive && !isCollapsed && (
                                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                            )}

                            {/* Collapsed Tooltip */}
                            {isCollapsed && (
                                <div className="absolute left-full ml-2.5 px-2.5 py-1 bg-surface-inner border border-divider-primary rounded text-xs font-bold text-text shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                                    {isVi ? "Thêm" : "More"}
                                </div>
                            )}
                        </button>

                        {/* More Popup Dropdown Menu */}
                        {isMoreOpen && (
                            <div
                                className={`absolute z-50 py-1.5 bg-surface border border-divider-primary/80 rounded-[6px] shadow-2xl animate-fade-in ${
                                    isCollapsed
                                        ? "left-full ml-2 top-0 w-44"
                                        : "left-0 top-full mt-1.5 w-full"
                                }`}
                            >
                                {moreNavItems.map((subItem) => {
                                    const isSubActive = activeNav === subItem.id;
                                    const subLabel = isVi ? subItem.labelVi : subItem.labelEn;
                                    return (
                                        <button
                                            key={subItem.id}
                                            type="button"
                                            onClick={() => {
                                                onNavChange(subItem.id);
                                                setIsMoreOpen(false);
                                            }}
                                            className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors cursor-pointer text-left ${
                                                isSubActive
                                                    ? "bg-primary/10 text-primary font-bold"
                                                    : "text-text-muted hover:text-text hover:bg-surface-hover/60"
                                            }`}
                                        >
                                            <FontAwesomeIcon
                                                icon={subItem.icon}
                                                className={`text-xs w-4 shrink-0 ${isSubActive ? "text-primary" : "text-text-faint"}`}
                                            />
                                            <span className="truncate">{subLabel}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </nav>

                {/* MANAGE SECTION (Only shown to users with management permission) */}
                {hasManagePermission && (
                    <div className="w-full flex flex-col gap-1 pt-2 border-t border-divider-primary/40 mt-1">
                        {!isCollapsed && (
                            <div className="flex items-center gap-1.5 px-2 py-1 text-text-faint">
                                <FontAwesomeIcon icon={faShieldHalved} className="text-[10px] text-primary" />
                                <span className="text-[11px] font-mono font-bold tracking-widest text-text-faint uppercase">
                                    MANAGE
                                </span>
                            </div>
                        )}

                        <nav className="w-full flex flex-col gap-1">
                            {manageNavItems.map((item) => {
                                const isActive = activeNav === item.id;
                                const label = isVi ? item.labelVi : item.labelEn;

                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => {
                                            onNavChange(item.id);
                                            setIsMoreOpen(false);
                                        }}
                                        title={isCollapsed ? label : undefined}
                                        className={`group relative flex items-center h-9 rounded-[6px] text-xs font-semibold transition-colors duration-150 cursor-pointer ${
                                            isCollapsed
                                                ? "w-9 justify-center mx-auto"
                                                : "w-full px-2.5 gap-2.5 text-left"
                                        } ${
                                            isActive
                                                ? "bg-surface-hover text-text font-bold"
                                                : "text-text-muted hover:text-text hover:bg-surface-hover/50"
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

                                        {isActive && !isCollapsed && !item.badge && (
                                            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                        )}

                                        {/* Collapsed Tooltip */}
                                        {isCollapsed && (
                                            <div className="absolute left-full ml-2.5 px-2.5 py-1 bg-surface-inner border border-divider-primary rounded text-xs font-bold text-text shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                                                {label}
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                )}
            </div>
        </aside>
    );
};

