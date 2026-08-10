import { useState } from 'react';
import { useNavigate, useLocation } from '@tanstack/react-router';
import { useThemeStore } from "../../store/useThemeStore";
import { useSidebarStore } from "../../store/useSidebarStore";
import { useNotificationStore, NotificationDropdown } from '@/features/notification';
import { useTranslation } from '@/shared/hooks/useTranslate';
import { Search } from '../search/Search';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUserCircle,
    faBell,
    faSun,
    faMoon,
    faSignOutAlt,
    faBars,
    faGamepad
} from "@fortawesome/free-solid-svg-icons";
import { useAuthStore } from '@/features/auth';

const floatCard = `
    bg-surface/90 backdrop-blur-md
    border border-border
    shadow-[0_4px_16px_rgba(0,0,0,0.07)]
    dark:shadow-[0_4px_20px_rgba(0,0,0,0.35)]
    transition-all duration-200 ease-out
`;

export const Header = () => {
    const { t } = useTranslation();
    const theme = useThemeStore((state) => state.theme);
    const toggleTheme = useThemeStore((state) => state.toggleTheme);
    const user = useAuthStore((state) => state.user);
    const mockLogin = useAuthStore((state) => state.mockLogin);
    const toggleMockLogin = useAuthStore((state) => state.toggleMockLogin);
    const isLoggedIn = !!user || mockLogin;
    const navigate = useNavigate();

    const language = useThemeStore((state) => state.language);
    const toggleLanguage = useThemeStore((state) => state.toggleLanguage);

    const toggleLeft = useSidebarStore((state) => state.toggleLeft);
    const toggleRight = useSidebarStore((state) => state.toggleRight);
    const { pathname } = useLocation();
    const hideSidebars = pathname.startsWith('/settings') || pathname.startsWith('/profile');

    const [showNotifications, setShowNotifications] = useState(false);
    const notifications = useNotificationStore((state) => state.notifications);
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return (
        <header className="w-full sticky top-0 z-[60] flex flex-wrap md:flex-nowrap items-center justify-between md:justify-start gap-2 sm:gap-3 px-2 sm:px-4 py-1 sm:py-1.5">

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 order-1">
                {!hideSidebars && (
                    <button
                        onClick={toggleLeft}
                        title={t('common.menu')}
                        className={`lg:hidden shrink-0 ${floatCard} w-8 h-8 rounded-xl sm:rounded-2xl flex items-center justify-center text-primary hover:bg-primary-soft transition-colors cursor-pointer`}
                    >
                        <FontAwesomeIcon icon={faBars} className="text-sm sm:text-base" />
                    </button>
                )}

                <div
                    className={`shrink-0 ${floatCard} rounded-xl sm:rounded-2xl px-3 sm:px-4 py-1 sm:py-1.5
                        cursor-pointer hover:-translate-y-0.5
                        hover:shadow-[0_6px_24px_rgba(124,77,255,0.18)]`}
                    onClick={() => navigate({ to: '/' })}
                >
                    <p className="text-lg sm:text-xl font-extrabold tracking-tight text-primary select-none">
                        IndieG
                    </p>
                </div>
            </div>

            <div className="w-full md:w-auto flex-1 flex justify-center order-3 md:order-2 mt-1 md:mt-0">
                <Search />
            </div>

            <div className={`shrink-0 ${floatCard} rounded-full px-1.5 sm:px-2 py-1 sm:py-1.5
                flex flex-row items-center gap-1 order-2 md:order-3`}>
                {!hideSidebars && (
                    <button
                        onClick={toggleRight}
                        title={t('common.openExplore')}
                        className="lg:hidden w-8 h-8 flex items-center justify-center rounded-full
                            text-primary bg-primary/10 hover:bg-primary/20
                            transition-colors duration-150 cursor-pointer shrink-0"
                    >
                        <FontAwesomeIcon icon={faGamepad} className="text-xs sm:text-sm" />
                    </button>
                )}

                <button
                    onClick={toggleLanguage}
                    title={t('common.switchLanguage')}
                    className="w-8 h-8 flex items-center justify-center rounded-full
                        text-text-muted
                        hover:bg-primary-soft hover:text-primary
                        transition-colors duration-150 cursor-pointer shrink-0"
                >
                    <p className="font-extrabold text-xs sm:text-sm">{language.toUpperCase()}</p>
                </button>

                <button
                    onClick={toggleTheme}
                    title={theme === "light" ? t('common.switchThemeDark') : t('common.switchThemeLight')}
                    className="w-8 h-8 flex items-center justify-center rounded-full
                        text-text-muted
                        hover:bg-primary-soft hover:text-primary
                        transition-colors duration-150 cursor-pointer shrink-0"
                >
                    <FontAwesomeIcon icon={theme === "light" ? faSun : faMoon} className="text-xs sm:text-sm" />
                </button>

                {isLoggedIn && (
                    <div className="relative shrink-0">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            title={t('notification.title')}
                            className="relative w-8 h-8 flex items-center justify-center rounded-full
                                text-text-muted
                                hover:bg-primary-soft hover:text-primary
                                transition-colors duration-150 cursor-pointer"
                        >
                            <FontAwesomeIcon icon={faBell} className="text-xs sm:text-sm" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-like ring-2 ring-surface" />
                            )}
                        </button>
                        {showNotifications && (
                            <NotificationDropdown onClose={() => setShowNotifications(false)} />
                        )}
                    </div>
                )}

                <div className="relative group/dev hidden sm:block shrink-0">
                    <button
                        onClick={toggleMockLogin}
                        title={isLoggedIn ? "[DEV] Mock Logout" : "[DEV] Mock Login"}
                        className={`w-8 h-8 flex items-center justify-center rounded-full
                            transition-colors duration-150 cursor-pointer
                            ${isLoggedIn
                                ? "text-amber-500 bg-amber-500/10 hover:bg-amber-500/20"
                                : "text-text-muted hover:bg-amber-500/20 hover:text-amber-500"
                            }`}
                    >
                        <FontAwesomeIcon icon={isLoggedIn ? faSignOutAlt : faUserCircle} />
                    </button>
                    <span className="pointer-events-none absolute -top-1 -right-1 text-[9px] font-black text-amber-500 bg-amber-500/15 px-0.5 rounded">
                        DEV
                    </span>
                </div>

                {!isLoggedIn && (
                    <button
                        onClick={() => navigate({ to: "/auth" })}
                        className="h-8 px-3 sm:px-4 ml-0.5 sm:ml-1 flex items-center justify-center rounded-full
                            bg-primary text-white font-semibold text-xs sm:text-sm
                            hover:bg-primary-hover shadow-sm transition-colors duration-150 cursor-pointer shrink-0"
                    >
                        {t('authenticate.login')}
                    </button>
                )}
            </div>
        </header>
    )
}