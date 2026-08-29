import { useState } from 'react';
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
} from "@fortawesome/free-solid-svg-icons";
import { useAuthStore } from '@/features/auth';

export const Header = () => {
    const { t } = useTranslation();
    const user = useAuthStore((state) => state.user);
    const mockLogin = useAuthStore((state) => state.mockLogin);
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

    const [showNotifications, setShowNotifications] = useState(false);
    const notifications = useNotificationStore((state) => state.notifications);
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    useNotificationPolling(15000);

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
            </div>
        </header>
    );
};