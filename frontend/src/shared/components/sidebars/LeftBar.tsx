import {
    faUsers, faHouse, faBookmark, faGamepad,
    faAngleDown, faGear, faCircle,
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

const navItem = `
    w-full flex flex-row items-center gap-3 px-3 py-2.5
    rounded-xl text-sm font-medium text-text-muted
    bg-transparent hover:bg-surface-hover hover:text-text
    transition-colors duration-150 cursor-pointer select-none
`;
const navItemActive = `
    w-full flex flex-row items-center gap-3 px-3 py-2.5
    rounded-xl text-sm font-semibold
    bg-primary-soft text-primary cursor-pointer select-none
`;
const sectionLabel = `
    px-3 pt-4 pb-1.5
    text-[10px] font-bold uppercase tracking-widest text-text-faint
`;

const CURRENT_GAME = {
    name: "Raft",
    logo: raftLogo,
    duration: "2h 14m",
    sessionLabel: "Current session",
};

const MY_GAMES = [
    { logo: raftLogo, label: "Raft", active: true },
    { logo: rdr2Logo, label: "RDR 2", active: false },
    { logo: cs2Logo, label: "CS 2", active: false },
];

export const LeftBar = () => {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const mockLogin = useAuthStore((state) => state.mockLogin);
    const isLoggedIn = !!user || mockLogin;

    const [gamesDrop, setGamesDrop] = useState<boolean>(true);
    const [activePage, setActivePage] = useState<string>("home");

    const displayName = getCurrentAuthor();
    const avatarUrl =
        user?.user_metadata?.avatar_url ??
        "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix";

    const handleProfileClick = () => {
        if (user) {
            navigate({ to: "/profile/$userId", params: { userId: user.id } });
        }
    };

    return (
        <div className="
            w-full h-fit flex flex-col overflow-hidden
            bg-surface/90 backdrop-blur-md
            border border-border
            rounded-2xl
        ">

            {isLoggedIn ? (
                <button
                    type="button"
                    onClick={handleProfileClick}
                    disabled={!user}
                    className="flex flex-row items-center gap-3 px-4 py-3
                        border-b border-border w-full text-left
                        cursor-pointer hover:bg-surface-hover transition-colors duration-150
                        disabled:cursor-default disabled:hover:bg-transparent"
                >
                    <img
                        src={avatarUrl}
                        alt="avatar"
                        className="w-9 h-9 rounded-full ring-2 ring-primary/30 shrink-0 object-cover"
                    />
                    <div className="flex flex-col leading-tight min-w-0 flex-1">
                        <p className="font-semibold text-sm text-text truncate">{displayName}</p>
                        <p className="text-xs text-text-faint">
                            {user ? "View profile" : "Signed in (demo)"}
                        </p>
                    </div>
                </button>
            ) : (
                <div className="flex flex-col items-center gap-3 px-4 py-5 border-b border-border text-center">
                    <div className="w-12 h-12 rounded-full bg-surface-hover flex items-center justify-center">
                        <FontAwesomeIcon icon={faUserCircle} className="text-2xl text-text-faint" />
                    </div>
                    <div>
                        <p className="font-semibold text-sm text-text">You're not signed in</p>
                        <p className="text-xs text-text-faint mt-1 leading-relaxed">
                            Log in to create posts, save bookmarks, and manage your library.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate({ to: "/auth" })}
                        className="w-full px-4 py-2 rounded-full text-sm font-semibold
                            bg-primary text-white hover:bg-primary-hover
                            shadow-[0_2px_10px_rgba(124,77,255,0.35)]
                            transition-colors duration-150 cursor-pointer"
                    >
                        Log in
                    </button>
                </div>
            )}

            {isLoggedIn && (
                <div className="px-3 pt-3">
                    <div className="
                        flex flex-row items-center gap-3 px-3 py-2.5
                        rounded-xl
                        bg-success-500/8 dark:bg-success-500/10
                        border border-success-500/20
                    ">
                        <div className="relative shrink-0">
                            <img
                                src={CURRENT_GAME.logo}
                                alt={CURRENT_GAME.name}
                                className="w-9 h-9 rounded-lg object-cover"
                            />
                            <span className="absolute -top-1 -right-1
                                w-3 h-3 rounded-full bg-success-500
                                ring-2 ring-surface animate-pulse"
                            />
                        </div>

                        <div className="flex flex-col min-w-0 flex-1">
                            <div className="flex flex-row items-center gap-1.5">
                                <FontAwesomeIcon
                                    icon={faCircle}
                                    className="text-[6px] text-success-500"
                                />
                                <p className="text-[10px] font-bold uppercase tracking-wide text-success-500">
                                    Playing now
                                </p>
                            </div>
                            <p className="text-sm font-semibold text-text truncate">
                                {CURRENT_GAME.name}
                            </p>
                            <p className="text-[11px] text-text-faint">
                                {CURRENT_GAME.sessionLabel} · {CURRENT_GAME.duration}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <p className={sectionLabel}>Menu</p>
            <div className="flex flex-col gap-1 px-2 pb-1">
                <button
                    type="button"
                    onClick={() => setActivePage("home")}
                    className={activePage === "home" ? navItemActive : navItem}
                >
                    <FontAwesomeIcon icon={faHouse} className="w-4 shrink-0" />
                    <span>Home</span>
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
                    <span>Community</span>
                </button>

                {isLoggedIn && (
                    <>
                        <button
                            type="button"
                            onClick={() => setActivePage("bookmarks")}
                            className={activePage === "bookmarks" ? navItemActive : navItem}
                        >
                            <FontAwesomeIcon icon={faBookmark} className="w-4 shrink-0" />
                            <span>Bookmarks</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActivePage("squad")}
                            className={`${activePage === "squad" ? navItemActive : navItem} justify-between`}
                        >
                            <div className="flex flex-row items-center gap-3">
                                <FontAwesomeIcon icon={faHubspot} className="w-4 shrink-0" />
                                <span>My squad</span>
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
                    <p className={sectionLabel}>Library</p>
                    <div className="flex flex-col gap-1 px-2 pb-2">
                        <button
                            type="button"
                            onClick={() => setGamesDrop(!gamesDrop)}
                            className={`${navItem} justify-between ${gamesDrop ? "bg-surface-hover text-text" : ""}`}
                        >
                            <div className="flex flex-row items-center gap-3">
                                <FontAwesomeIcon icon={faGamepad} className="w-4 shrink-0" />
                                <span>My Games</span>
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
                                <div className="flex flex-col gap-0.5 pl-10 pr-2 pb-1">
                                    {MY_GAMES.map(({ logo, label, active }) => (
                                        <div
                                            key={label}
                                            className={`flex flex-row items-center gap-2.5 px-2 py-1.5
                                                rounded-lg text-sm
                                                hover:bg-surface-hover
                                                transition-colors duration-150 cursor-pointer
                                                ${active ? "text-text font-medium" : "text-text-muted"}`}
                                        >
                                            <div className="relative shrink-0">
                                                <img
                                                    src={logo}
                                                    alt={label}
                                                    className="w-4 h-4 rounded object-cover"
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
                <div className="border-t border-border px-2 py-2">
                    <button type="button" className={navItem}>
                        <FontAwesomeIcon icon={faGear} className="w-4 shrink-0" />
                        <span>Settings</span>
                    </button>
                </div>
            )}
        </div>
    )
}