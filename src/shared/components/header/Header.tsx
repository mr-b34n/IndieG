import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from '@tanstack/react-router';
import { useSidebarStore } from "../../store/useSidebarStore";
import { useNotificationStore, NotificationDropdown, useNotificationPolling } from '@/features/notification';
import { useTranslation } from '@/shared/hooks/useTranslate';
import { Search } from '../search/Search';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBell,
    faBars,
    faGamepad,
    faHouse,
    faUser,
    faGear,
    faShieldHalved,
    faRightFromBracket,
    faChevronDown
} from "@fortawesome/free-solid-svg-icons";
import { useAuthStore } from '@/features/auth';
import { getCurrentAuthor } from "@/features/post";

export const Header = () => {
    const { t } = useTranslation();
    const user = useAuthStore((state) => state.user);
    const mockLogin = useAuthStore((state) => state.mockLogin);
    const customAvatar = useAuthStore((state) => state.customAvatar);
    const logout = useAuthStore((state) => state.logout);
    const isLoggedIn = !!user || mockLogin;
    const isAdmin = user?.role === "admin";
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

    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const notifications = useNotificationStore((state) => state.notifications);
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    useNotificationPolling(15000);

    const displayName = getCurrentAuthor();
    const avatarUrl =
        customAvatar ??
        user?.user_metadata?.avatar_url ??
        "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix";

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        setShowUserMenu(false);
        logout();
        navigate({ to: "/auth" });
    };

    return (
        <header className="w-full h-16 sticky top-0 z-[60] flex items-center justify-between gap-4 px-4 sm:px-6 bg-[#090A0B] border-b border-[#1C1F22] select-none">

            {/* LEFT: Logo & Mobile Toggle */}
            <div className="flex items-center gap-3 shrink-0">
                {!hideSidebars && (
                    <button
                        type="button"
                        onClick={toggleLeft}
                        title={t('common.menu')}
                        className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center text-[#8B9097] hover:text-[#E8E9EA] hover:bg-[#14171A] transition-colors cursor-pointer"
                    >
                        <FontAwesomeIcon icon={faBars} className="text-base" />
                    </button>
                )}

                {/* Flat Borderless Logo */}
                <div
                    className="flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-90 py-1"
                    onClick={() => navigate({ to: '/' })}
                >
                    <span className="text-[22px] sm:text-[24px] font-bold tracking-tight text-[#1688E8]">
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

                {!hideSidebars && (
                    <button
                        type="button"
                        onClick={toggleRight}
                        title={t('common.openExplore')}
                        className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg
                            text-[#8B9097] hover:text-[#E8E9EA] hover:bg-[#14171A]
                            transition-colors duration-150 cursor-pointer shrink-0"
                    >
                        <FontAwesomeIcon icon={faGamepad} className="text-sm" />
                    </button>
                )}

                {hideSidebars && (
                    <button
                        type="button"
                        onClick={() => navigate({ to: '/' })}
                        title={t('common.home')}
                        className="w-9 h-9 flex items-center justify-center rounded-lg
                            text-[#8B9097] hover:text-[#E8E9EA] hover:bg-[#14171A]
                            transition-colors duration-150 cursor-pointer shrink-0"
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
                                    setShowNotifications(!showNotifications);
                                    setShowUserMenu(false);
                                }}
                                title={t('notification.title')}
                                className="relative w-9 h-9 flex items-center justify-center rounded-lg
                                    text-[#8B9097] hover:text-[#E8E9EA] hover:bg-[#14171A]
                                    transition-colors duration-150 cursor-pointer"
                            >
                                <FontAwesomeIcon icon={faBell} className="text-sm" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#ef4444]" />
                                )}
                            </button>
                            {showNotifications && (
                                <NotificationDropdown onClose={() => setShowNotifications(false)} />
                            )}
                        </div>

                        {/* User Avatar Menu */}
                        <div className="relative shrink-0" ref={userMenuRef}>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowUserMenu(!showUserMenu);
                                    setShowNotifications(false);
                                }}
                                className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-[#14171A] transition-colors cursor-pointer group"
                            >
                                <img
                                    src={avatarUrl}
                                    alt="User avatar"
                                    className="w-8 h-8 rounded-full ring-1 ring-border/80 object-cover"
                                />
                                <FontAwesomeIcon
                                    icon={faChevronDown}
                                    className={`text-[10px] text-[#8B9097] group-hover:text-[#E8E9EA] transition-transform duration-200 ${
                                        showUserMenu ? "rotate-180" : ""
                                    }`}
                                />
                            </button>

                            {/* User Dropdown */}
                            {showUserMenu && (
                                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#121417] border border-[#23272C] shadow-2xl py-2 z-[70] animate-in fade-in zoom-in-95 duration-150">
                                    <div className="px-4 py-2.5 border-b border-[#23272C]/80">
                                        <p className="font-bold text-xs text-[#E8E9EA] truncate">{displayName}</p>
                                        <p className="text-[11px] text-[#8B9097] truncate">{user?.email || "demo@indieg.com"}</p>
                                    </div>

                                    <div className="py-1">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowUserMenu(false);
                                                navigate({ to: "/profile/$userId", params: { userId: "me" } });
                                            }}
                                            className="w-full px-4 py-2 text-xs font-medium text-[#C2C7CE] hover:text-white hover:bg-[#1C2026] flex items-center gap-2.5 transition-colors cursor-pointer"
                                        >
                                            <FontAwesomeIcon icon={faUser} className="w-3.5 text-[#8B9097]" />
                                            <span>{t('common.viewProfile', { defaultValue: 'Trang cá nhân' })}</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowUserMenu(false);
                                                navigate({ to: "/settings" });
                                            }}
                                            className="w-full px-4 py-2 text-xs font-medium text-[#C2C7CE] hover:text-white hover:bg-[#1C2026] flex items-center gap-2.5 transition-colors cursor-pointer"
                                        >
                                            <FontAwesomeIcon icon={faGear} className="w-3.5 text-[#8B9097]" />
                                            <span>{t('common.settings', { defaultValue: 'Cài đặt' })}</span>
                                        </button>

                                        {isAdmin && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowUserMenu(false);
                                                    navigate({ to: "/admin" });
                                                }}
                                                className="w-full px-4 py-2 text-xs font-medium text-amber-400 hover:bg-[#1C2026] flex items-center gap-2.5 transition-colors cursor-pointer"
                                            >
                                                <FontAwesomeIcon icon={faShieldHalved} className="w-3.5 text-amber-500" />
                                                <span>{t('common.adminUi', { defaultValue: 'Quản trị hệ thống' })}</span>
                                            </button>
                                        )}
                                    </div>

                                    <div className="border-t border-[#23272C]/80 pt-1 mt-1">
                                        <button
                                            type="button"
                                            onClick={handleLogout}
                                            className="w-full px-4 py-2 text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center gap-2.5 transition-colors cursor-pointer"
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
                        className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                        {t('authenticate.login', { defaultValue: 'Đăng nhập' })}
                    </button>
                )}
            </div>
        </header>
    );
};