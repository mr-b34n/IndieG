import { useNavigate } from '@tanstack/react-router';
import { useThemeStore } from "../../store/useThemeStore";

import { Search } from '../search/Search';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUserCircle,
    faBell,
    faSun,
    faMoon,
    faSignOutAlt,
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
    const theme = useThemeStore((state) => state.theme);
    const toggleTheme = useThemeStore((state) => state.toggleTheme);
    const user = useAuthStore((state) => state.user);
    const mockLogin = useAuthStore((state) => state.mockLogin);
    const toggleMockLogin = useAuthStore((state) => state.toggleMockLogin);
    const isLoggedIn = !!user || mockLogin;
    const navigate = useNavigate();

    return (
        <header className="w-full sticky top-0 z-20 flex flex-row items-center gap-3 px-4 py-3">

            <div
                className={`shrink-0 ${floatCard} rounded-2xl px-4 py-2
                    cursor-pointer hover:-translate-y-0.5
                    hover:shadow-[0_6px_24px_rgba(124,77,255,0.18)]`}
                onClick={() => navigate({ to: '/' })}
            >
                <p className="text-xl font-extrabold tracking-tight text-primary select-none">
                    IndieG
                </p>
            </div>

            <div className="flex-1 flex justify-center">
                <Search />
            </div>

            <div className={`shrink-0 ${floatCard} rounded-full px-2 py-2
                flex flex-row items-center gap-1`}>

                <button
                    onClick={toggleTheme}
                    title={theme === "light" ? "Switch to dark" : "Switch to light"}
                    className="w-9 h-9 flex items-center justify-center rounded-full
                        text-text-muted
                        hover:bg-primary-soft hover:text-primary
                        transition-colors duration-150 cursor-pointer"
                >
                    <FontAwesomeIcon icon={theme === "light" ? faSun : faMoon} />
                </button>

                <button
                    title="Notifications"
                    className="relative w-9 h-9 flex items-center justify-center rounded-full
                        text-text-muted
                        hover:bg-primary-soft hover:text-primary
                        transition-colors duration-150 cursor-pointer"
                >
                    <FontAwesomeIcon icon={faBell} />
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-like
                        ring-2 ring-surface" />
                </button>

                <div className="relative group/dev">
                    <button
                        onClick={toggleMockLogin}
                        title={isLoggedIn ? "[DEV] Mock Logout" : "[DEV] Mock Login"}
                        className={`w-9 h-9 flex items-center justify-center rounded-full
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
                        className="h-9 px-4 ml-1 flex items-center justify-center rounded-full
                            bg-primary text-white font-semibold text-sm
                            hover:bg-primary-hover shadow-sm transition-colors duration-150 cursor-pointer"
                    >
                        Login
                    </button>
                )}
                {isLoggedIn && (
                    <img 
                        src={user?.user_metadata?.avatar_url ?? "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"}
                        alt="Profile" 
                        onClick={() => user && navigate({ to: "/profile/$userId", params: { userId: user.id } })}
                        className="w-9 h-9 ml-1 rounded-full object-cover ring-2 ring-border shrink-0 cursor-pointer hover:opacity-80 transition-opacity" 
                    />
                )}
            </div>
        </header>
    )
}