import {
    faUsers, faUserGroup, faHouse, faGamepad,
    faAngleDown, faGear, faShieldHalved,
    faCompass, faPlus
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useState } from "react"
import { useNavigate, useLocation } from "@tanstack/react-router"

import { useAuthStore } from "@/features/auth";
import { useGameStore } from "@/features/game";
import { getCurrentAuthor } from "@/features/post";
import { useCommunitiesStore } from "@/features/community";
import { useTranslation } from "@/shared/hooks/useTranslate";

const navItem = `
    w-full flex flex-row items-center gap-3 px-3 py-2
    rounded-md text-xs sm:text-sm font-semibold text-text-muted
    hover:text-text hover:bg-surface-hover/70
    transition-colors duration-150 cursor-pointer select-none
`;
const navItemActive = `
    w-full flex flex-row items-center gap-3 px-3 py-2
    rounded-md text-xs sm:text-sm font-bold
    bg-primary/10 text-primary cursor-pointer select-none
`;
const sectionLabel = `
    px-3 pt-3 pb-1.5
    text-[10px] font-black uppercase tracking-wider text-text-faint/90
`;

export const LeftBar = () => {
    const quickAccessSlugs = useGameStore((state) => state.quickAccessSlugs);
    const games = useGameStore((state) => state.games);
    const communities = useCommunitiesStore((state) => state.communities);
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const {t} = useTranslation();
    const user = useAuthStore((state) => state.user);
    const mockLogin = useAuthStore((state) => state.mockLogin);
    const customAvatar = useAuthStore((state) => state.customAvatar);
    const isLoggedIn = !!user || mockLogin;
    const isAdmin = user?.role === "admin" || isLoggedIn;

    const [gamesDrop, setGamesDrop] = useState<boolean>(true);

    const isHomeActive = pathname === "/" || pathname.startsWith("/post");
    const isExploreActive = pathname.startsWith("/explore");
    const isCommunityActive = pathname.startsWith("/community");
    const isSquadActive = pathname.startsWith("/squad");
    const isSettingsActive = pathname.startsWith("/settings");
    const isAdminActive = pathname.startsWith("/admin");
    const isGameSectionActive = pathname.startsWith("/game");

    const displayName = getCurrentAuthor();
    const avatarUrl =
        customAvatar ??
        user?.user_metadata?.avatar_url ??
        "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix";

    const handleProfileClick = () => {
        navigate({ to: "/profile/$userId", params: { userId: "me" } });
    };

    const joinedCommunities = communities.filter((c) => c.joined);

    return (
        <div className="w-full flex flex-col gap-1 py-1 text-text select-none">
            {/* User Profile Mini Snippet */}
            {isLoggedIn ? (
                <div
                    onClick={handleProfileClick}
                    className="flex flex-row items-center gap-3 px-3 py-2.5 mb-1
                        rounded-md cursor-pointer hover:bg-surface-hover/70 transition-colors"
                >
                    <img
                        src={avatarUrl}
                        alt="avatar"
                        className="w-8 h-8 rounded-full ring-1 ring-border/80 shrink-0 object-cover"
                    />
                    <div className="flex flex-col leading-tight min-w-0 flex-1">
                        <p className="font-bold text-xs sm:text-sm text-text truncate">{displayName}</p>
                        <p className="text-[11px] text-text-faint">
                            {user ? t('common.viewProfile') : t('common.signedInDemo')}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-2 px-3 py-2 mb-2 pb-3 border-b border-border/40">
                    <p className="text-xs font-semibold text-text-muted">{t('authenticate.notLoginRemindTitle')}</p>
                    <button
                        type="button"
                        onClick={() => navigate({ to: "/auth" })}
                        className="w-full px-3 py-1.5 rounded-md text-xs font-bold
                            bg-primary text-white hover:bg-primary-hover
                            transition-colors duration-150 cursor-pointer text-center"
                    >
                        {t('authenticate.login')}
                    </button>
                </div>
            )}

            {/* SECTION: SOCIAL */}
            <p className={sectionLabel}>Social</p>
            <div className="flex flex-col gap-0.5 px-1 pb-2">
                <button
                    type="button"
                    onClick={() => navigate({to: "/"})}
                    className={isHomeActive ? navItemActive : navItem}
                >
                    <FontAwesomeIcon icon={faHouse} className="w-4 shrink-0 text-text-muted" />
                    <span>{t('common.home')}</span>
                </button>

                <button
                    type="button"
                    onClick={() => navigate({to: "/explore"})}
                    className={isExploreActive ? navItemActive : navItem}
                >
                    <FontAwesomeIcon icon={faCompass} className="w-4 shrink-0 text-text-muted" />
                    <span>{t('common.explore', { defaultValue: 'Explore' })}</span>
                </button>

                <button
                    type="button"
                    onClick={() => navigate({ to: "/community" })}
                    className={isCommunityActive ? navItemActive : navItem}
                >
                    <FontAwesomeIcon icon={faUsers} className="w-4 shrink-0 text-text-muted" />
                    <span>{t('common.community')}</span>
                </button>

                {isLoggedIn && (
                    <button
                        type="button"
                        onClick={() => navigate({ to: "/squad" })}
                        className={isSquadActive ? navItemActive : navItem}
                    >
                        <FontAwesomeIcon icon={faUserGroup} className="w-4 shrink-0 text-text-muted" />
                        <span>{t('common.squad')}</span>
                    </button>
                )}
            </div>

            {/* SECTION: MY COMMUNITIES */}
            <div className="border-t border-divider-primary pt-4 mt-3">
                <div className="flex items-center justify-between px-3 pb-2">
                    <p className="text-[10px] font-black uppercase tracking-wider text-text-faint/90">
                        My Communities
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate({ to: "/community" })}
                        className="text-[10px] font-bold text-primary hover:underline cursor-pointer flex items-center gap-1"
                        title="Khám phá thêm cộng đồng"
                    >
                        <FontAwesomeIcon icon={faPlus} className="text-[9px]" />
                        <span>Khám phá</span>
                    </button>
                </div>

                <div className="flex flex-col gap-0.5 px-1 pb-1">
                    {joinedCommunities.length > 0 ? (
                        joinedCommunities.map((c) => {
                            const isThisCommActive = pathname.startsWith(`/community/${c.id}`);
                            return (
                                <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => navigate({ to: `/community/${c.id}` })}
                                    className={`w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                                        isThisCommActive
                                            ? "bg-primary/10 text-primary font-bold"
                                            : "text-text-muted hover:text-text hover:bg-surface-hover/70"
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                                        <span className="truncate">{c.name}</span>
                                    </div>
                                    <span className="text-[10px] font-medium text-text-faint shrink-0">
                                        {c.onlineNow ? `${c.onlineNow} online` : "active"}
                                    </span>
                                </button>
                            );
                        })
                    ) : (
                        <div className="px-3 py-2 text-xs text-text-faint">
                            Chưa có cộng đồng nào
                        </div>
                    )}
                </div>
            </div>

            {/* SECTION: LIBRARY */}
            {isLoggedIn && (
                <div className="border-t border-divider-primary pt-4 mt-3">
                    <p className={sectionLabel}>{t('common.library')}</p>
                    <div className="flex flex-col gap-0.5 px-1 pb-1">
                        <button
                            type="button"
                            onClick={() => setGamesDrop(!gamesDrop)}
                            className={`${isGameSectionActive ? navItemActive : navItem} justify-between`}
                        >
                            <div className="flex flex-row items-center gap-3">
                                <FontAwesomeIcon icon={faGamepad} className="w-4 shrink-0 text-text-muted" />
                                <span>{t('common.game')}</span>
                            </div>
                            <FontAwesomeIcon
                                icon={faAngleDown}
                                className={`text-xs text-text-faint transition-transform duration-200
                                    ${gamesDrop ? "rotate-180" : "rotate-0"}`}
                            />
                        </button>

                        <div
                            className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
                                gamesDrop
                                    ? "grid-rows-[1fr] opacity-100"
                                    : "grid-rows-[0fr] opacity-0 pointer-events-none"
                            }`}
                            aria-hidden={!gamesDrop}
                        >
                            <div className="overflow-hidden min-h-0">
                                <div className="flex flex-col gap-0.5 pl-8 pr-1 pb-1">
                                    {quickAccessSlugs.map((slug) => {
                                        const g = games.find(item => item.slug === slug || item.id === slug);
                                        if (!g) return null;
                                        const isThisGameActive = pathname.startsWith(`/game/${slug}`);
                                        return (
                                            <div
                                                key={slug}
                                                onClick={() => navigate({ to: `/game/${slug}` })}
                                                className={`flex flex-row items-center gap-2 px-2 py-1.5
                                                    rounded-md text-xs
                                                    hover:bg-surface-hover/70
                                                    transition-colors duration-150 cursor-pointer
                                                    ${isThisGameActive ? "text-primary font-bold bg-primary/10" : "text-text-muted"}`}
                                            >
                                                <img
                                                    src={g.logoUrl}
                                                    alt={g.name}
                                                    className="w-3.5 h-3.5 rounded object-cover shrink-0"
                                                />
                                                <span className="truncate">{g.name}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* SYSTEM SETTINGS */}
            <div className="border-t border-divider-primary pt-4 mt-3 px-1 flex flex-col gap-0.5">
                {isAdmin && (
                    <button
                        type="button"
                        onClick={() => navigate({ to: "/admin" })}
                        className={`${isAdminActive ? navItemActive : navItem}`}
                    >
                        <FontAwesomeIcon icon={faShieldHalved} className="w-4 shrink-0 text-amber-500" />
                        <span>Admin UI</span>
                    </button>
                )}

                <button
                    type="button"
                    onClick={() => navigate({to: "/settings"})}
                    className={`${isSettingsActive ? navItemActive : navItem}`}
                >
                    <FontAwesomeIcon icon={faGear} className="w-4 shrink-0 text-text-muted" />
                    <span>{t('common.settings')}</span>
                </button>
            </div>
        </div>
    )
}
