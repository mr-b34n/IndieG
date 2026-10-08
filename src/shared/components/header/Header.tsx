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
    faHouse,
    faUser,
    faGear,
    faRightFromBracket,
    faChevronDown,
    faShieldHalved,
    faPenToSquare,
} from "@fortawesome/free-solid-svg-icons";
import { useAuthStore } from '@/features/auth';
import { getCurrentAuthor } from "@/features/post";
import { useCreatePostModalStore } from '@/features/feed/store/useCreatePostModalStore';
import { useReportsQuery } from "@/shared/api/useQueries";
import { extractReportList } from "@/shared/api";
import { useMemo } from "react";

export const Header = () => {
    const { t } = useTranslation();
    const user = useAuthStore((state) => state.user);
    const mockLogin = useAuthStore((state) => state.mockLogin);
    const customAvatar = useAuthStore((state) => state.customAvatar);
    const logout = useAuthStore((state) => state.logout);
    const isLoggedIn = !!user || mockLogin;
    const navigate = useNavigate();

    const toggleLeft = useSidebarStore((state) => state.toggleLeft);
    const toggleRight = useSidebarStore((state) => state.toggleRight);
    const { pathname } = useLocation();
    const hideSidebars = 
        pathname.startsWith('/settings') || 
        pathname.startsWith('/profile') || 
        pathname.startsWith('/explore') || 
        pathname.startsWith('/game') ||
        (pathname.startsWith('/community/') && pathname !== '/community');

    const isNotificationOpen = useNotificationStore((state) => state.isOpen ?? false);
    const setNotificationOpen = useNotificationStore((state) => state.setIsOpen);
    const toggleNotificationOpen = useNotificationStore((state) => state.toggleOpen);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const notifications = useNotificationStore((state) => state.notifications);
    const unreadCount = notifications.filter((n) => !n.isRead).length;

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

    const openCreatePost = useCreatePostModalStore((state) => state.openCreatePost);

    const handleCreatePostClick = () => {
        if (!isLoggedIn) {
            navigate({ to: "/auth" });
            return;
        }
        let currentCommunityId = undefined;
        if (pathname.startsWith('/community/')) {
            const parts = pathname.split('/');
            if (parts.length >= 3 && parts[2]) {
                currentCommunityId = parts[2];
            }
        }
        openCreatePost(currentCommunityId);
    };

    const handleLogout = () => {
        setShowUserMenu(false);
        logout();
        navigate({ to: "/auth" });
    };

    return (
        <header className="w-full h-16 sticky top-0 z-[60] flex items-center justify-between gap-4 px-4 sm:px-6 bg-surface/95 backdrop-blur-md border-b border-border select-none transition-colors">

            {/* LEFT: Logo & Mobile Toggle */}
            <div className="flex items-center gap-3 shrink-0">
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
                <div
                    className="flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-90 py-1"
                    onClick={() => navigate({ to: '/' })}
                >
                    <span className="text-[22px] sm:text-[24px] font-bold tracking-tight text-primary">
                        IndieG
                    </span>
                </div>
            </div>

            {/* CENTER: Compact Flat Search Bar */}
            <div className="flex-1 max-w-[420px] mx-auto hidden sm:flex justify-center">
                <Search />
            </div>

            {/* RIGHT: Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {/* Search icon trigger on tiny screens */}
                <div className="sm:hidden w-full max-w-[180px]">
                    <Search />
                </div>

                {/* Persistent CREATE POST Icon Button */}
                <button
                    type="button"
                    onClick={handleCreatePostClick}
                    title={t('feed.createPost', { defaultValue: 'Tạo bài viết' })}
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-transparent border border-border text-text-muted hover:text-text hover:bg-surface-hover transition-all shrink-0 cursor-pointer select-none active:scale-95 outline-none"
                >
                    <FontAwesomeIcon icon={faPenToSquare} className="text-sm" />
                </button>

                {!hideSidebars && (
                    <button
                        type="button"
                        onClick={toggleRight}
                        title={t('common.openExplore')}
                        className="lg:hidden w-9 h-9 flex items-center justify-center rounded-full border border-border bg-transparent
                            text-text-muted hover:text-text hover:bg-surface-hover
                            transition-colors duration-150 cursor-pointer shrink-0 outline-none"
                    >
                        <FontAwesomeIcon icon={faGamepad} className="text-sm" />
                    </button>
                )}

                {hideSidebars && (
                    <button
                        type="button"
                        onClick={() => navigate({ to: '/' })}
                        title={t('common.home')}
                        className="w-9 h-9 flex items-center justify-center rounded-full border border-border bg-transparent
                            text-text-muted hover:text-text hover:bg-surface-hover
                            transition-colors duration-150 cursor-pointer shrink-0 outline-none"
                    >
                        <FontAwesomeIcon icon={faHouse} className="text-sm" />
                    </button>
                )}

                {isLoggedIn ? (
                    <>
                        <div className="relative shrink-0">
                            <button
                                type="button"
                                onClick={() => {
                                    toggleNotificationOpen?.();
                                    setShowUserMenu(false);
                                }}
                                title={t('notification.title')}
                                className="relative w-9 h-9 flex items-center justify-center rounded-full border border-border bg-transparent
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

                        {/* User Avatar Menu (Only displayed when left sidebar is hidden/not present) */}
                        {hideSidebars && (
                            <div className="relative shrink-0" ref={userMenuRef}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowUserMenu(!showUserMenu);
                                        setNotificationOpen?.(false);
                                    }}
                                    className="flex items-center gap-1.5 p-1 pr-2 rounded-full border border-border bg-transparent hover:bg-surface-hover transition-colors cursor-pointer group outline-none"
                                >
                                    {avatarUrl ? (
                                        <img
                                            src={avatarUrl}
                                            alt="User avatar"
                                            className="w-8 h-8 rounded-full ring-1 ring-border/80 object-cover"
                                            onError={(e) => {
                                                (e.currentTarget as HTMLImageElement).style.display = "none";
                                            }}
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-surface-hover ring-1 ring-border/80 flex items-center justify-center text-xs font-bold text-primary uppercase select-none">
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
                                    <div className="absolute right-0 mt-2 w-56 rounded-xl bg-surface border border-border shadow-2xl py-2 z-[70] animate-in fade-in zoom-in-95 duration-150">
                                        <div className="px-4 py-2.5 border-b border-border">
                                            <p className="font-bold text-xs text-text truncate">{displayName}</p>
                                            <p className="text-[11px] text-text-muted truncate">{user?.email || "demo@indieg.com"}</p>
                                        </div>

                                        <div className="py-1">
                                            {isAdmin && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowUserMenu(false);
                                                        const targetId = pathname.startsWith("/community/") && pathname.split("/")[2]
                                                            ? pathname.split("/")[2]
                                                            : "cs2-vietnam";
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
                                        </div>

                                        <div className="border-t border-border pt-1 mt-1">
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
                        )}
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
        </header>
    );
};
