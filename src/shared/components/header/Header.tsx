import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from '@tanstack/react-router';
import { useSidebarStore } from "../../store/useSidebarStore";
import { useNotificationStore, NotificationDropdown, useNotificationPolling } from '@/features/notification';
import { useTranslation } from '@/shared/hooks/useTranslate';
import { useRegisterOverlay } from "@/shared/utils/overlayManager";
import { Search } from '../search/Search';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBell,
    faBars,
    faGamepad,
    faUser,
    faGear,
    faRightFromBracket,
    faChevronDown,
    faShieldHalved,
    faMagnifyingGlass,
    faXmark,
    faTriangleExclamation,
    faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import { Sun, Moon, Monitor, Palette } from "lucide-react";
import { useAuthStore } from '@/features/auth';
import { useCommunitiesStore } from '@/features/community';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { getCurrentAuthor } from "@/features/post";
import { useReportsQuery } from "@/shared/api/useQueries";
import { extractReportList } from "@/shared/api";
import { useMemo } from "react";
import { LudonLogo } from "@/shared/components/logo/LudonLogo";

export const Header = () => {
    const { t } = useTranslation();
    const user = useAuthStore((state) => state.user);
    const firstCommunityId = useCommunitiesStore((state) => state.communities[0]?.id);
    const customAvatar = useAuthStore((state) => state.customAvatar);
    const logout = useAuthStore((state) => state.logout);
    const isLoggedIn = !!user;
    const navigate = useNavigate();

    const themeMode = useThemeStore((state) => state.mode);
    const setThemeMode = useThemeStore((state) => state.setThemeMode);
    const language = useThemeStore((state) => state.language);
    const isVi = language === "vi";
    const isUnverified = Boolean(user && !user.isVerified);

    const toggleLeft = useSidebarStore((state) => state.toggleLeft);
    const toggleRight = useSidebarStore((state) => state.toggleRight);
    const { pathname } = useLocation();
    const hideSidebars = 
        pathname.startsWith('/settings') || 
        pathname.startsWith('/profile') || 
        pathname.startsWith('/explore') || 
        (pathname.startsWith('/game') && pathname !== '/game') ||
        (pathname.startsWith('/community') && pathname !== '/community');

    const isNotificationOpen = useNotificationStore((state) => state.isOpen ?? false);
    const setNotificationOpen = useNotificationStore((state) => state.setIsOpen);
    const toggleNotificationOpen = useNotificationStore((state) => state.toggleOpen);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const notifications = useNotificationStore((state) => state.notifications);
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    // Close mobile search on navigation
    useEffect(() => {
        setIsMobileSearchOpen(false);
    }, [pathname]);

    useRegisterOverlay({
        id: "header-notifications",
        isOpen: isNotificationOpen,
        onClose: () => setNotificationOpen?.(false),
        priority: 60,
    });

    useRegisterOverlay({
        id: "header-user-menu",
        isOpen: showUserMenu,
        onClose: () => setShowUserMenu(false),
        priority: 50,
    });

    useNotificationPolling(15000);

    const displayName = user?.name || user?.username || getCurrentAuthor();
    const avatarUrl =
        user?.avatarUrl ||
        user?.avatar_url ||
        customAvatar ||
        (user?.user_metadata?.avatar_url as string | undefined) ||
        "";

    const isAdmin = Boolean(
        user?.role === "admin" ||
        user?.id === "usr_admin" ||
        user?.username === "IndieAdmin" ||
        user?.username === "LudonAdmin" ||
        user?.email === "admin@ludon.com" ||
        user?.email === "admin@indieg.com"
    );

    const { data: reportsData } = useReportsQuery(undefined, { enabled: isAdmin });
    const pendingReportsCount = useMemo(() => {
        if (!isAdmin) return 0;
        return extractReportList(reportsData).filter((r) => r.status === "pending").length;
    }, [isAdmin, reportsData]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleCycleThemeMode = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (themeMode === 'auto') {
            setThemeMode('dark');
        } else if (themeMode === 'dark') {
            setThemeMode('light');
        } else {
            setThemeMode('auto');
        }
    };

    const handleLogout = () => {
        setShowUserMenu(false);
        logout();
        navigate({ to: "/auth" });
    };

    const handleLogoClick = () => {
        if (typeof window !== "undefined") {
            if (window.location.pathname === '/' && !window.location.search && !window.location.hash) {
                window.location.reload();
            } else {
                window.location.href = '/';
            }
        }
    };

    return (
        <header className="w-full h-16 sticky top-0 z-[60] flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-6 bg-surface/95 backdrop-blur-md select-none transition-colors border-b border-border">

            {/* MOBILE SEARCH OVERLAY MODE */}
            {isMobileSearchOpen ? (
                <div className="w-full flex items-center gap-2 animate-fade-in py-1 h-full">
                    <button
                        type="button"
                        onClick={() => setIsMobileSearchOpen(false)}
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-hover transition-colors cursor-pointer shrink-0"
                        title={t('common.close', { defaultValue: 'Đóng' })}
                    >
                        <FontAwesomeIcon icon={faXmark} className="text-base" />
                    </button>
                    <div className="flex-1 min-w-0 h-full flex items-center">
                        <Search autoFocus onCloseMobile={() => setIsMobileSearchOpen(false)} />
                    </div>
                </div>
            ) : (
                <>
                    {/* LEFT: Logo & Mobile Toggle */}
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        {!hideSidebars && (
                            <button
                                type="button"
                                onClick={toggleLeft}
                                title={t('common.menu')}
                                className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-hover transition-colors cursor-pointer"
                            >
                                <FontAwesomeIcon icon={faBars} className="text-base" />
                            </button>
                        )}

                        {/* Flat Borderless Logo */}
                        <button
                            type="button"
                            className="flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-90 py-1 border-none bg-transparent outline-none select-none text-left"
                            onClick={handleLogoClick}
                            title={t('common.home', { defaultValue: 'Trang chủ' })}
                        >
                            <LudonLogo size="md" />
                        </button>
                    </div>

                    {/* CENTER: Compact Flat Search Bar (Tablet & Desktop) */}
                    <div className="flex-1 max-w-[460px] mx-auto hidden sm:flex items-center justify-center px-2 h-full">
                        <Search />
                    </div>

                    {/* RIGHT: Actions */}
                    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                        {/* Search icon button on mobile screens */}
                        <button
                            type="button"
                            onClick={() => setIsMobileSearchOpen(true)}
                            title={t('search.placeholder', { defaultValue: 'Tìm kiếm...' })}
                            className="sm:hidden w-9 h-9 flex items-center justify-center rounded-full bg-transparent text-text-muted hover:text-text hover:bg-surface-hover transition-all shrink-0 cursor-pointer outline-none"
                        >
                            <FontAwesomeIcon icon={faMagnifyingGlass} className="text-sm" />
                        </button>



                        {!hideSidebars && (
                            <button
                                type="button"
                                onClick={toggleRight}
                                title={t('common.openExplore')}
                                className="xl:hidden w-9 h-9 flex items-center justify-center rounded-full bg-transparent
                                    text-text-muted hover:text-text hover:bg-surface-hover
                                    transition-colors duration-150 cursor-pointer shrink-0 outline-none"
                            >
                                <FontAwesomeIcon icon={faGamepad} className="text-sm" />
                            </button>
                        )}



                {isLoggedIn ? (
                    <>
                        {/* Unverified Email Warning Icon with Hover Information */}
                        {isUnverified && (
                            <div className="relative group shrink-0">
                                <button
                                    type="button"
                                    onClick={() => navigate({ to: "/settings", search: { tab: "account" } as Record<string, unknown> })}
                                    className="w-9 h-9 rounded-full flex items-center justify-center text-amber-400 bg-transparent hover:bg-amber-500/15 transition-all cursor-pointer relative outline-none"
                                    title={isVi ? "Chưa xác thực email" : "Email not verified"}
                                    aria-label="Email verification warning"
                                >
                                    <FontAwesomeIcon icon={faEnvelope} className="text-sm" />
                                </button>

                                {/* Popover Tooltip on Hover */}
                                <div className="absolute top-full right-0 mt-2.5 w-72 p-3.5 bg-surface rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[80] pointer-events-auto">
                                    <div className="flex items-start gap-2.5">
                                        <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                                            <FontAwesomeIcon icon={faEnvelope} className="text-xs" />
                                        </div>
                                        <div className="flex flex-col gap-1 text-left min-w-0 flex-1">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="text-xs font-bold text-text">
                                                    {isVi ? "Xác thực email" : "Verify your email"}
                                                </span>
                                                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 text-[9px] font-mono font-bold uppercase">
                                                    {isVi ? "Cảnh báo" : "Warning"}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-text-muted leading-relaxed">
                                                {isVi
                                                    ? `Email (${user?.email || "của bạn"}) chưa được xác minh. Vui lòng xác thực email để mở khóa đầy đủ tính năng và bảo vệ tài khoản.`
                                                    : `Your email (${user?.email || "account"}) is not verified. Please verify your email to unlock all features.`}
                                            </p>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate({ to: "/settings", search: { tab: "account" } as Record<string, unknown> });
                                                }}
                                                className="mt-1.5 w-full py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors text-center cursor-pointer shadow-xs"
                                            >
                                                {isVi ? "Xác thực ngay" : "Verify now"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="relative shrink-0">
                            <button
                                type="button"
                                onClick={() => {
                                    toggleNotificationOpen?.();
                                    setShowUserMenu(false);
                                }}
                                title={t('notification.title')}
                                className="relative w-9 h-9 flex items-center justify-center rounded-full bg-transparent
                                    text-text-muted hover:text-text hover:bg-surface-hover
                                    transition-colors duration-150 cursor-pointer outline-none"
                            >
                                <FontAwesomeIcon icon={faBell} className="text-sm" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#ef4444]" />
                                )}
                            </button>
                            {isNotificationOpen && (
                                <NotificationDropdown onClose={() => setNotificationOpen?.(false)} />
                            )}
                        </div>

                        {/* User Avatar Menu - Always present in top right */}
                        <div className="relative shrink-0" ref={userMenuRef}>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowUserMenu(!showUserMenu);
                                    setNotificationOpen?.(false);
                                }}
                                className="flex items-center gap-1.5 p-1 pr-2 rounded-full bg-transparent hover:bg-surface-hover transition-colors cursor-pointer group outline-none"
                            >
                                {avatarUrl ? (
                                    <img
                                        src={avatarUrl}
                                        alt="User avatar"
                                        className="w-8 h-8 rounded-full object-cover"
                                        onError={(e) => {
                                            (e.currentTarget as HTMLImageElement).style.display = "none";
                                        }}
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-surface-hover flex items-center justify-center text-xs font-bold text-primary uppercase select-none">
                                        {(displayName || "G").replace(/^@/, "").charAt(0) || "G"}
                                    </div>
                                )}
                                <FontAwesomeIcon
                                    icon={faChevronDown}
                                    className={`text-[10px] text-text-muted group-hover:text-text transition-transform duration-200 ${
                                        showUserMenu ? "rotate-180" : ""
                                    }`}
                                />
                            </button>

                            {/* User Dropdown */}
                            {showUserMenu && (
                                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-surface border border-border/80 shadow-2xl py-2 z-[70] animate-dropdown">
                                    <div className="px-4 py-2.5 border-b border-border/40">
                                        <p className="font-bold text-xs text-text truncate">{displayName}</p>
                                        <p className="text-[11px] text-text-muted truncate">{user?.email || "demo@ludon.com"}</p>
                                    </div>

                                    <div className="py-1">
                                        {isAdmin && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowUserMenu(false);
                                                    const targetId = pathname.startsWith("/community/") && pathname.split("/")[2]
                                                        ? pathname.split("/")[2]
                                                        : firstCommunityId ? String(firstCommunityId) : "1";
                                                    navigate({
                                                        to: "/community/$communityId",
                                                        params: { communityId: targetId },
                                                        search: { nav: "manage-reports" },
                                                    });
                                                }}
                                                className="w-full px-4 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center justify-between transition-colors cursor-pointer"
                                            >
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <FontAwesomeIcon icon={faShieldHalved} className="w-3.5 text-rose-400 shrink-0" />
                                                    <span className="truncate">{t('common.adminReports', { defaultValue: 'Quản trị & Báo cáo' })}</span>
                                                </div>
                                                {pendingReportsCount > 0 && (
                                                    <span className="px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-mono font-bold">
                                                        {pendingReportsCount}
                                                    </span>
                                                )}
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowUserMenu(false);
                                                navigate({ to: "/profile/$userId", params: { userId: "me" } });
                                            }}
                                            className="w-full px-4 py-2 text-xs font-medium text-text-muted hover:text-text hover:bg-surface-hover flex items-center gap-2.5 transition-colors cursor-pointer"
                                        >
                                            <FontAwesomeIcon icon={faUser} className="w-3.5 text-text-muted" />
                                            <span>{t('common.viewProfile', { defaultValue: 'Trang cá nhân' })}</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowUserMenu(false);
                                                navigate({ to: "/settings" });
                                            }}
                                            className="w-full px-4 py-2 text-xs font-medium text-text-muted hover:text-text hover:bg-surface-hover flex items-center gap-2.5 transition-colors cursor-pointer"
                                        >
                                            <FontAwesomeIcon icon={faGear} className="w-3.5 text-text-muted" />
                                            <span>{t('common.settings', { defaultValue: 'Cài đặt' })}</span>
                                        </button>

                                        {/* Appearance / Theme Switcher matching Auth Page design */}
                                        <div className="w-full px-4 py-2 text-xs font-medium text-text-muted flex items-center justify-between select-none">
                                            <div
                                                onClick={handleCycleThemeMode}
                                                className="flex items-center gap-2.5 min-w-0 cursor-pointer hover:text-text transition-colors"
                                                title={isVi ? "Nhấp để đổi chế độ giao diện" : "Click to cycle theme"}
                                            >
                                                <Palette className="w-3.5 h-3.5 text-text-muted shrink-0" />
                                                <span className="truncate">{t('settings.general.appearance', { defaultValue: 'Giao diện' })}</span>
                                            </div>

                                            {/* Segmented Pill Switcher (Auto / Dark / Light) matching Auth Page */}
                                            <div className="flex items-center p-0.5 rounded-full bg-surface-inner border border-border/60 shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setThemeMode('auto');
                                                    }}
                                                    title={isVi ? "Theo hệ thống" : "System / Auto"}
                                                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                                                        themeMode === 'auto'
                                                            ? 'bg-surface text-primary shadow-xs font-bold'
                                                            : 'text-text-muted hover:text-text hover:bg-surface-hover/50'
                                                    }`}
                                                >
                                                    <Monitor className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setThemeMode('dark');
                                                    }}
                                                    title={isVi ? "Giao diện tối" : "Dark mode"}
                                                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                                                        themeMode === 'dark'
                                                            ? 'bg-surface text-primary shadow-xs font-bold'
                                                            : 'text-text-muted hover:text-text hover:bg-surface-hover/50'
                                                    }`}
                                                >
                                                    <Moon className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setThemeMode('light');
                                                    }}
                                                    title={isVi ? "Giao diện sáng" : "Light mode"}
                                                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                                                        themeMode === 'light'
                                                            ? 'bg-surface text-primary shadow-xs font-bold'
                                                            : 'text-text-muted hover:text-text hover:bg-surface-hover/50'
                                                    }`}
                                                >
                                                    <Sun className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t border-border/40 pt-1 mt-1">
                                        <button
                                            type="button"
                                            onClick={handleLogout}
                                            className="w-full px-4 py-2 text-xs font-bold text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 flex items-center gap-2.5 transition-colors cursor-pointer"
                                        >
                                            <FontAwesomeIcon icon={faRightFromBracket} className="w-3.5" />
                                            <span>{t('common.logout', { defaultValue: 'Đăng xuất' })}</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <button
                        type="button"
                        onClick={() => navigate({ to: "/auth" })}
                        className="px-4 py-1.5 rounded-full bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-colors cursor-pointer shadow-sm shadow-primary/20 outline-none"
                    >
                        {t('authenticate.login', { defaultValue: 'Đăng nhập' })}
                    </button>
                )}
            </div>
                </>
            )}
        </header>
    );
};
