import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from '@tanstack/react-router';
import { useSidebarStore } from "../../store/useSidebarStore";
import { useNotificationStore, NotificationDropdown, useNotificationPolling } from '@/features/notification';
import { useTranslation } from '@/shared/hooks/useTranslate';
import { Search } from '../search/Search';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUserCircle,
    faBell,
    faSignOutAlt,
    faBars,
    faGamepad,
    faHouse,
    faUserShield,
    faUserCheck,
    faUserXmark,
    faChevronDown,
    faGear,
    faUser,
} from "@fortawesome/free-solid-svg-icons";
import { useAuthStore, TEST_ACCOUNTS } from '@/features/auth';

export const Header = () => {
    const { t } = useTranslation();
    const user = useAuthStore((state) => state.user);
    const mockLogin = useAuthStore((state) => state.mockLogin);
    const customAvatar = useAuthStore((state) => state.customAvatar);
    const login = useAuthStore((state) => state.login);
    const logout = useAuthStore((state) => state.logout);
    const isLoggedIn = !!user || mockLogin;
    const navigate = useNavigate();

    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showDevAccounts, setShowDevAccounts] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

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
    const notifications = useNotificationStore((state) => state.notifications);
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    useNotificationPolling(15000);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const avatarUrl =
        customAvatar ??
        user?.user_metadata?.avatar_url ??
        "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix";

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

                {isLoggedIn && (
                    <div className="relative shrink-0">
                        <button
                            type="button"
                            onClick={() => setShowNotifications(!showNotifications)}
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
                )}

                {/* User Menu Trigger */}
                <div ref={menuRef} className="relative shrink-0">
                    <button
                        type="button"
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#14171A] text-[#E8E9EA] transition-colors cursor-pointer"
                    >
                        {user ? (
                            <img
                                src={avatarUrl}
                                alt="Avatar"
                                className="w-7 h-7 rounded-full object-cover ring-1 ring-[#1C1F22]"
                            />
                        ) : (
                            <div className="w-7 h-7 rounded-full bg-[#14171A] text-[#8B9097] flex items-center justify-center">
                                <FontAwesomeIcon icon={faUser} className="text-xs" />
                            </div>
                        )}
                        <span className="text-xs font-semibold max-w-[90px] truncate hidden md:inline">
                            {user ? user.username : t('authenticate.login')}
                        </span>
                        <FontAwesomeIcon icon={faChevronDown} className="text-[10px] text-[#8B9097] opacity-70" />
                    </button>

                    {/* User Dropdown Menu */}
                    {showUserMenu && (
                        <div className="absolute right-0 mt-2 w-64 bg-[#0B0D0F] border border-[#1C1F22] rounded-xl shadow-2xl p-2 z-[100] text-xs space-y-1 animate-fade-in">
                            {user && (
                                <div className="px-3 py-2.5 border-b border-[#1C1F22] flex items-center gap-2.5">
                                    <img
                                        src={avatarUrl}
                                        alt="Avatar"
                                        className="w-8 h-8 rounded-full object-cover ring-1 ring-[#1C1F22] shrink-0"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p className="font-bold text-xs text-[#E8E9EA] truncate">{user.username}</p>
                                        <p className="text-[10px] text-[#5F646B] truncate font-mono">{user.email || 'user@indieg.com'}</p>
                                    </div>
                                </div>
                            )}

                            {/* Core Menu Links */}
                            <button
                                type="button"
                                onClick={() => {
                                    setShowUserMenu(false);
                                    navigate({ to: "/profile/$userId", params: { userId: "me" } });
                                }}
                                className="w-full px-3 py-2 rounded-lg text-left text-[#8B9097] hover:text-[#E8E9EA] hover:bg-[#14171A] font-medium flex items-center gap-2.5 transition-colors cursor-pointer"
                            >
                                <FontAwesomeIcon icon={faUserCircle} className="text-xs w-4" />
                                <span>Trang cá nhân</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setShowUserMenu(false);
                                    navigate({ to: "/settings" });
                                }}
                                className="w-full px-3 py-2 rounded-lg text-left text-[#8B9097] hover:text-[#E8E9EA] hover:bg-[#14171A] font-medium flex items-center gap-2.5 transition-colors cursor-pointer"
                            >
                                <FontAwesomeIcon icon={faGear} className="text-xs w-4" />
                                <span>{t('common.settings')}</span>
                            </button>

                            {user?.role === "admin" && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowUserMenu(false);
                                        navigate({ to: "/admin" });
                                    }}
                                    className="w-full px-3 py-2 rounded-lg text-left text-amber-400 hover:bg-amber-500/10 font-medium flex items-center gap-2.5 transition-colors cursor-pointer"
                                >
                                    <FontAwesomeIcon icon={faUserShield} className="text-xs w-4" />
                                    <span>Quản trị hệ thống</span>
                                </button>
                            )}

                            {/* Dev Account Switcher (Moved cleanly inside dropdown menu) */}
                            <div className="pt-1 border-t border-[#1C1F22]">
                                <button
                                    type="button"
                                    onClick={() => setShowDevAccounts(!showDevAccounts)}
                                    className="w-full px-3 py-1.5 rounded-lg text-left text-[11px] font-bold text-[#8B9097] hover:text-[#E8E9EA] hover:bg-[#14171A] flex items-center justify-between cursor-pointer transition-colors"
                                >
                                    <span className="flex items-center gap-1.5">
                                        <FontAwesomeIcon icon={faUserCheck} className="text-xs text-[#1688E8]" />
                                        <span>Chuyển tài khoản Test</span>
                                    </span>
                                    <FontAwesomeIcon
                                        icon={faChevronDown}
                                        className={`text-[9px] transition-transform ${showDevAccounts ? 'rotate-180' : ''}`}
                                    />
                                </button>

                                {showDevAccounts && (
                                    <div className="mt-1 space-y-1 pl-1 pr-1 bg-[#090A0B] p-1.5 rounded-lg border border-[#1C1F22]">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                login(TEST_ACCOUNTS.admin);
                                                setShowUserMenu(false);
                                            }}
                                            className={`w-full p-1.5 rounded text-left flex items-center gap-2 transition-colors cursor-pointer ${
                                                user?.id === TEST_ACCOUNTS.admin.id ? "bg-rose-500/20 text-rose-400 font-bold" : "text-[#8B9097] hover:text-[#E8E9EA]"
                                            }`}
                                        >
                                            <FontAwesomeIcon icon={faUserShield} className="text-[10px] text-rose-400" />
                                            <span className="text-[11px] truncate">1. Admin (Quản trị)</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                login(TEST_ACCOUNTS.verifiedUser);
                                                setShowUserMenu(false);
                                            }}
                                            className={`w-full p-1.5 rounded text-left flex items-center gap-2 transition-colors cursor-pointer ${
                                                user?.id === TEST_ACCOUNTS.verifiedUser.id ? "bg-emerald-500/20 text-emerald-400 font-bold" : "text-[#8B9097] hover:text-[#E8E9EA]"
                                            }`}
                                        >
                                            <FontAwesomeIcon icon={faUserCheck} className="text-[10px] text-emerald-400" />
                                            <span className="text-[11px] truncate">2. User Bình thường</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                login(TEST_ACCOUNTS.unverifiedUser);
                                                setShowUserMenu(false);
                                            }}
                                            className={`w-full p-1.5 rounded text-left flex items-center gap-2 transition-colors cursor-pointer ${
                                                user?.id === TEST_ACCOUNTS.unverifiedUser.id ? "bg-amber-500/20 text-amber-400 font-bold" : "text-[#8B9097] hover:text-[#E8E9EA]"
                                            }`}
                                        >
                                            <FontAwesomeIcon icon={faUserXmark} className="text-[10px] text-amber-400" />
                                            <span className="text-[11px] truncate">3. User Chưa Verify</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Logout / Login button */}
                            {user ? (
                                <div className="pt-1 border-t border-[#1C1F22]">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            logout();
                                            setShowUserMenu(false);
                                        }}
                                        className="w-full px-3 py-2 rounded-lg text-left text-rose-400 hover:bg-rose-500/10 font-bold flex items-center gap-2 cursor-pointer transition-colors"
                                    >
                                        <FontAwesomeIcon icon={faSignOutAlt} className="text-xs" />
                                        <span>Đăng xuất</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="pt-1 border-t border-[#1C1F22]">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowUserMenu(false);
                                            navigate({ to: "/auth" });
                                        }}
                                        className="w-full px-3 py-2 rounded-lg text-left text-[#1688E8] hover:bg-[#1688E8]/10 font-bold flex items-center gap-2 cursor-pointer transition-colors"
                                    >
                                        <FontAwesomeIcon icon={faUserCircle} className="text-xs" />
                                        <span>Đăng nhập</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};