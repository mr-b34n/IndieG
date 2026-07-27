import {
    faUsers, faHouse, faBookmark, faGamepad,
    faAngleDown, faGear,
    faUserCircle,
} from "@fortawesome/free-solid-svg-icons"
import { faHubspot } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"

import cs2Logo from "../../../assets/logos/cs2-logo.webp";
import rdr2Logo from "../../../assets/logos/rdr2-logo.png";
import raftLogo from "../../../assets/logos/raft-logo.png";
import { useAuthStore } from "@/features/auth";
import { getCurrentAuthor } from "@/features/post";
import { useTranslation } from "@/shared/hooks/useTranslate";

const navItem = `
    w-full flex flex-row items-center gap-2.5 px-2.5 py-1.5
    rounded-lg text-xs sm:text-sm font-medium text-text-muted
    bg-transparent hover:bg-surface-hover hover:text-text
    transition-colors duration-150 cursor-pointer select-none
`;
const navItemActive = `
    w-full flex flex-row items-center gap-2.5 px-2.5 py-1.5
    rounded-lg text-xs sm:text-sm font-semibold
    bg-primary-soft text-primary cursor-pointer select-none
`;
const sectionLabel = `
    px-2.5 pt-2 pb-1
    text-[10px] font-bold uppercase tracking-widest text-text-faint
`;

const MY_GAMES = [
    { logo: raftLogo, label: "Raft", slug: "raft", active: false },
    { logo: rdr2Logo, label: "RDR 2", slug: "red-dead-redemption-2", active: false },
    { logo: cs2Logo, label: "CS 2", slug: "counter-strike-2", active: false },
];


export const LeftBar = () => {
    const navigate = useNavigate();
    const {t} = useTranslation();
    const user = useAuthStore((state) => state.user);
    const mockLogin = useAuthStore((state) => state.mockLogin);
    const customAvatar = useAuthStore((state) => state.customAvatar);
    const isLoggedIn = !!user || mockLogin;

    const [gamesDrop, setGamesDrop] = useState<boolean>(true);
    const [activePage, setActivePage] = useState<string>("home");

    const displayName = getCurrentAuthor();
    const avatarUrl =
        customAvatar ??
        user?.user_metadata?.avatar_url ??
        "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix";

    const handleProfileClick = () => {
        navigate({ to: "/profile/$userId", params: { userId: "me" } });
    };

    return (
        <div className="
            w-full h-fit flex flex-col overflow-hidden
            bg-surface/90 backdrop-blur-md
            border border-border
            rounded-xl
        ">

            {isLoggedIn ? (
                <button
                    type="button"
                    onClick={handleProfileClick}
                    className="flex flex-row items-center gap-2.5 px-3 py-2.5
                        border-b border-border w-full text-left
                        cursor-pointer hover:bg-surface-hover transition-colors duration-150"
                >
                    <img
                        src={avatarUrl}
                        alt="avatar"
                        className="w-8 h-8 rounded-full ring-2 ring-primary/30 shrink-0 object-cover"
                    />
                    <div className="flex flex-col leading-tight min-w-0 flex-1">
                        <p className="font-semibold text-xs sm:text-sm text-text truncate">{displayName}</p>
                        <p className="text-[11px] text-text-faint">
                            {user ? t('common.viewProfile') : t('common.signedInDemo')}
                        </p>
                    </div>
                </button>
            ) : (
                <div className="flex flex-col items-center gap-2.5 px-3 py-3.5 border-b border-border text-center">
                    <div className="w-10 h-10 rounded-full bg-surface-hover flex items-center justify-center">
                        <FontAwesomeIcon icon={faUserCircle} className="text-xl text-text-faint" />
                    </div>
                    <div>
                        <p className="font-semibold text-xs sm:text-sm text-text">{t('authenticate.notLoginRemindTitle')}</p>
                        <p className="text-[11px] text-text-faint mt-0.5 leading-relaxed">
                            {t('authenticate.notLoginRemindDetail')}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate({ to: "/auth" })}
                        className="w-full px-3 py-1.5 rounded-full text-xs font-semibold
                            bg-primary text-white hover:bg-primary-hover
                            shadow-[0_2px_10px_rgba(124,77,255,0.35)]
                            transition-colors duration-150 cursor-pointer"
                    >
                        {t('authenticate.login')}
                    </button>
                </div>
            )}

            <p className={sectionLabel}>{t('common.menu')}</p>
            <div className="flex flex-col gap-1 px-2 pb-1">
                <button
                    type="button"
                    onClick={() => {
                        setActivePage("home");
                        navigate({to: "/"});
                    }}
                    className={activePage === "home" ? navItemActive : navItem}
                >
                    <FontAwesomeIcon icon={faHouse} className="w-4 shrink-0" />
                    <span>{t('common.home')}</span>
                </button>

                <button
                    type="button"
                    onClick={() => {
                        setActivePage("community");
                        navigate({ to: "/community" });
                    }}
                    className={activePage === "community" ? navItemActive : navItem}
                >
                    <FontAwesomeIcon icon={faUsers} className="w-4 shrink-0" />
                    <span>{t('common.community')}</span>
                </button>

                {isLoggedIn && (
                    <>
                        <button
                            type="button"
                            onClick={() => {
                                setActivePage("bookmarks");
                                navigate({to: "/bookmark"})
                            }}
                            className={activePage === "bookmarks" ? navItemActive : navItem}
                        >
                            <FontAwesomeIcon icon={faBookmark} className="w-4 shrink-0" />
                            <span>{t('common.bookmark')}</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setActivePage("squad");
                                navigate({to: "/squad"});
                            }}
                            className={`${activePage === "squad" ? navItemActive : navItem} justify-between`}
                        >
                            <div className="flex flex-row items-center gap-3">
                                <FontAwesomeIcon icon={faHubspot} className="w-4 shrink-0" />
                                <span>{t('common.squad')}</span>
                            </div>
                            <span className="text-[10px] font-bold bg-accent-500 text-white
                                rounded-full w-4 h-4 flex items-center justify-center shrink-0">
                                3
                            </span>
                        </button>
                    </>
                )}
            </div>

            {isLoggedIn && (
                <>
                    <p className={sectionLabel}>{t('common.library')}</p>
                    <div className="flex flex-col gap-1 px-2 pb-1.5">
                        <button
                            type="button"
                            onClick={() => setGamesDrop(!gamesDrop)}
                            className={`${navItem} justify-between ${gamesDrop ? "bg-surface-hover text-text" : ""}`}
                        >
                            <div className="flex flex-row items-center gap-2.5">
                                <FontAwesomeIcon icon={faGamepad} className="w-4 shrink-0" />
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
                                <div className="flex flex-col gap-0.5 pl-8 pr-2 pb-1">
                                    {MY_GAMES.map(({ logo, label, slug, active }) => (
                                        <div
                                            key={label}
                                            onClick={() => navigate({ to: `/game/${slug}` })}
                                            className={`flex flex-row items-center gap-2 px-2 py-1
                                                rounded-lg text-xs sm:text-sm
                                                hover:bg-surface-hover
                                                transition-colors duration-150 cursor-pointer
                                                ${active ? "text-text font-medium" : "text-text-muted"}`}
                                        >
                                            <div className="relative shrink-0">
                                                <img
                                                    src={logo}
                                                    alt={label}
                                                    className="w-3.5 h-3.5 rounded object-cover"
                                                />
                                                {active && (
                                                    <span className="absolute -top-0.5 -right-0.5
                                                        w-1.5 h-1.5 rounded-full bg-success-500
                                                        ring-1 ring-surface" />
                                                )}
                                            </div>
                                            <span>{label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {isLoggedIn && (
                <div className="border-t border-border px-2 py-1.5">
                    <button
                        type="button"
                        onClick={() => {
                            setActivePage("settings");
                            navigate({to: "/settings"});
                        }}
                        className={`${activePage === "settings" ? navItemActive : navItem}`}
                    >
                        <FontAwesomeIcon icon={faGear} className="w-4 shrink-0" />
                        <span>{t('common.settings')}</span>
                    </button>
                </div>
            )}
        </div>
    )
}