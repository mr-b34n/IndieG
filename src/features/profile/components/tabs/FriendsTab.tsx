import { useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUsers, faUserPlus, faSearch, faUserCheck, faChevronDown,
    faUserXmark, faBan, faClock, faCheck, faXmark, faSpinner, faPaperPlane
} from "@fortawesome/free-solid-svg-icons";
import { useClickOutside } from "../../hooks/useClickOutside";
import type { FriendEntry, FriendRequest } from "../../types";
export interface FriendsTabProps {
    friends: FriendEntry[];
    requests: FriendRequest[];
    outgoingRequests?: FriendRequest[];
    blockedUsers?: FriendEntry[];
    isLoading?: boolean;
    isOwnProfile?: boolean;
    onToggleFriend: (friend: FriendEntry | string) => void;
    onBlockFriend: (friend: FriendEntry | string) => void;
    onAcceptRequest: (req: FriendRequest) => void;
    onDeclineRequest: (id: string) => void;
    onCancelOutgoingRequest?: (id: string) => void;
    onUnblockUser?: (friend: FriendEntry | string) => void;
    t: (key: string, opts?: Record<string, unknown>) => string;
}

const FriendAvatar = ({
    src,
    name,
    className = "w-12 h-12 sm:w-14 sm:h-14 rounded-full",
    textClassName = "text-lg font-bold",
}: {
    src?: string | null;
    name: string;
    className?: string;
    textClassName?: string;
}) => {
    const [imgError, setImgError] = useState(false);
    const initial = (name || "G").replace(/^@/, "").charAt(0).toUpperCase() || "G";

    if (!src || imgError) {
        return (
            <div
                className={`${className} bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0 uppercase select-none ${textClassName}`}
            >
                {initial}
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={name}
            className={`${className} object-cover bg-surface-hover shrink-0`}
            onError={() => setImgError(true)}
        />
    );
};

const FriendCardMenu = ({
    isFriend, onUnfriend, onBlock, t,
}: { isFriend: boolean; onUnfriend: () => void; onBlock: () => void; t: FriendsTabProps["t"] }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    useClickOutside(ref, () => setOpen(false), open);

    if (!isFriend) return null;

    return (
        <div className="relative shrink-0" ref={ref}>
            <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
                className="justify-center py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 bg-[#E4E6EB] dark:bg-[#3A3B3C] hover:bg-[#D8DADF] dark:hover:bg-[#4E4F50] text-[#050505] dark:text-[#E4E6EB]"
            >
                <FontAwesomeIcon icon={faUserCheck} />
                <span>{t("profile.friendAdded")}</span>
                <FontAwesomeIcon icon={faChevronDown} className={`text-[10px] transition-transform ml-0.5 ${open ? "rotate-180" : ""}`} />
            </button>
            {open && (
                <div className="absolute right-0 bottom-full mb-1.5 w-44 bg-surface rounded-xl shadow-xl p-1.5 z-50 flex flex-col gap-1 animate-dropdown border border-border/80 text-left">
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onUnfriend(); setOpen(false); }}
                        className="w-full px-3 py-1.5 rounded-lg text-left text-xs font-medium text-text hover:bg-surface-hover transition-colors flex items-center gap-2.5 cursor-pointer"
                    >
                        <FontAwesomeIcon icon={faUserXmark} className="text-[#E5A93D] w-3.5 text-center" />
                        <span>{t("profile.unfriend")}</span>
                    </button>
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onBlock(); setOpen(false); }}
                        className="w-full px-3 py-1.5 rounded-lg text-left text-xs font-medium text-rose-500 hover:bg-rose-500/10 transition-colors flex items-center gap-2.5 cursor-pointer"
                    >
                        <FontAwesomeIcon icon={faBan} className="w-3.5 text-center" />
                        <span>{t("profile.blockUser")}</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export const FriendsTab = ({
    friends,
    requests,
    outgoingRequests = [],
    blockedUsers = [],
    isLoading = false,
    isOwnProfile = true,
    onToggleFriend,
    onBlockFriend,
    onAcceptRequest,
    onDeclineRequest,
    onCancelOutgoingRequest,
    onUnblockUser,
    t,
}: FriendsTabProps) => {
    const navigate = useNavigate();
    const [subTab, setSubTab] = useState<"list" | "requests" | "outgoing" | "blocked">("list");
    const [search, setSearch] = useState("");

    const visibleFriends = friends.filter((f) => {
        const query = search.trim().toLowerCase();
        if (!query) return true;
        const matchName = f.name?.toLowerCase().includes(query);
        const matchHandle = f.handle?.toLowerCase().includes(query);
        const matchGame = f.game?.toLowerCase().includes(query);
        return matchName || matchHandle || matchGame;
    });

    if (isLoading) {
        return (
            <div className="bg-surface rounded-2xl p-12 text-center text-text-muted text-sm flex flex-col items-center justify-center gap-3">
                <FontAwesomeIcon icon={faSpinner} className="animate-spin text-2xl text-primary" />
                <span>{t("profile.friendsLoading")}</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-5 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5 bg-surface-inner p-1 rounded-xl">
                    <button
                        type="button"
                        onClick={() => setSubTab("list")}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                            subTab === "list"
                                ? "bg-surface text-primary font-bold shadow-xs"
                                : "text-text-muted hover:text-text hover:bg-surface-hover"
                        }`}
                    >
                        <FontAwesomeIcon icon={faUsers} />
                        <span>{t("profile.friendsWidgetTitle")} ({friends.length})</span>
                    </button>

                    {isOwnProfile && (
                        <>
                            <button
                                type="button"
                                onClick={() => setSubTab("requests")}
                                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                                    subTab === "requests"
                                        ? "bg-surface text-primary font-bold shadow-xs"
                                        : "text-text-muted hover:text-text hover:bg-surface-hover"
                                }`}
                            >
                                <FontAwesomeIcon icon={faUserPlus} />
                                <span>{t("profile.friendRequests")} ({requests.length})</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setSubTab("outgoing")}
                                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                                    subTab === "outgoing"
                                        ? "bg-surface text-primary font-bold shadow-xs"
                                        : "text-text-muted hover:text-text hover:bg-surface-hover"
                                }`}
                            >
                                <FontAwesomeIcon icon={faPaperPlane} className="text-[11px]" />
                                <span>{t("profile.outgoingRequests")} ({outgoingRequests.length})</span>
                            </button>

                            {blockedUsers.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setSubTab("blocked")}
                                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                                        subTab === "blocked"
                                            ? "bg-surface text-primary font-bold shadow-xs"
                                            : "text-text-muted hover:text-text hover:bg-surface-hover"
                                    }`}
                                >
                                    <FontAwesomeIcon icon={faBan} className="text-[11px]" />
                                    <span>{t("profile.blockedUsers")} ({blockedUsers.length})</span>
                                </button>
                            )}
                        </>
                    )}
                </div>

                {subTab === "list" && (
                    <div className="relative flex-1 sm:max-w-xs">
                        <FontAwesomeIcon icon={faSearch} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-faint text-xs pointer-events-none" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={t("profile.searchFriends")}
                            className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface-inner text-text placeholder-text-faint text-xs font-medium focus:outline-none transition-all border border-transparent focus:border-primary/40"
                        />
                    </div>
                )}
            </div>

            {/* List subtab (Grid view) */}
            {subTab === "list" && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4 animate-fade-in w-full">
                    {visibleFriends.length > 0 ? (
                        visibleFriends.map((f, idx) => (
                            <div
                                key={f.friendshipId || f.userId || f.id || `${f.name}-${idx}`}
                                className="bg-surface rounded-2xl p-3.5 sm:p-4 border border-border/60 hover:border-border transition-all flex items-center justify-between gap-3 shadow-xs"
                            >
                                <div
                                    onClick={() => navigate({ to: "/profile/$userId", params: { userId: f.handle || f.userId || `@${f.name}` } })}
                                    className="flex items-center gap-3 min-w-0 cursor-pointer group flex-1"
                                >
                                    <div className="relative shrink-0">
                                        <FriendAvatar
                                            src={f.logo || f.avatar}
                                            name={f.name || f.handle || "Gamer"}
                                            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover ring-2 ring-border/50"
                                            textClassName="text-lg font-bold"
                                        />
                                        <span
                                            className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full ring-2 ring-surface ${
                                                f.status === "online"
                                                    ? "bg-emerald-500"
                                                    : f.status === "in-game"
                                                    ? "bg-amber-500"
                                                    : "bg-text-faint"
                                            }`}
                                            title={
                                                f.status === "online"
                                                    ? t("profile.statusOnline")
                                                    : f.status === "in-game"
                                                    ? "In Game"
                                                    : t("profile.statusOffline")
                                            }
                                        />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <h4 className="font-bold text-text text-sm sm:text-base leading-tight truncate group-hover:text-primary transition-colors">
                                            {f.name}
                                        </h4>
                                        <span className="text-[11px] font-mono text-text-faint truncate block mt-0.5">
                                            {f.handle || `@${f.name}`}
                                        </span>
                                        <span className="text-xs text-text-muted truncate block mt-0.5">
                                            {f.game || (f.status === "online" ? t("profile.statusOnline") : t("profile.statusOffline"))}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    {isOwnProfile && f.isFriend ? (
                                        <FriendCardMenu
                                            isFriend={f.isFriend}
                                            onUnfriend={() => onToggleFriend(f)}
                                            onBlock={() => onBlockFriend(f)}
                                            t={t}
                                        />
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); onToggleFriend(f); }}
                                            className="py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 bg-primary hover:bg-primary-hover text-white shadow-xs"
                                        >
                                            <FontAwesomeIcon icon={faUserPlus} />
                                            <span>{t("profile.addFriend")}</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full bg-surface rounded-2xl p-10 text-center text-text-muted text-xs flex flex-col items-center gap-2 border border-border/40">
                            <FontAwesomeIcon icon={faUsers} className="text-3xl text-text-faint mb-1" />
                            <span className="text-sm font-semibold text-text">{t("profile.noFriendsFound")}</span>
                        </div>
                    )}
                </div>
            )}

            {/* Incoming Requests subtab (Grid view) */}
            {subTab === "requests" && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4 animate-fade-in w-full">
                    {requests.length > 0 ? (
                        requests.map((req) => (
                            <div
                                key={req.id}
                                className="bg-surface rounded-2xl p-3.5 sm:p-4 border border-border/60 hover:border-border transition-all flex items-center justify-between gap-3 shadow-xs"
                            >
                                <div
                                    onClick={() => navigate({ to: "/profile/$userId", params: { userId: req.handle || req.username || req.userId || `@${req.name}` } })}
                                    className="flex items-center gap-3 min-w-0 cursor-pointer group flex-1"
                                >
                                    <FriendAvatar
                                        src={req.logo || req.avatar}
                                        name={req.name || req.username || "Gamer"}
                                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover ring-2 ring-border/50 shrink-0"
                                        textClassName="text-lg font-bold"
                                    />
                                    <div className="flex flex-col min-w-0">
                                        <h4 className="font-bold text-text text-sm sm:text-base leading-tight truncate group-hover:text-primary transition-colors">
                                            {req.name}
                                        </h4>
                                        {(req.handle || req.username) && (
                                            <span className="text-[11px] font-mono text-text-faint truncate block mt-0.5">
                                                {req.handle ? req.handle : `@${req.username}`}
                                            </span>
                                        )}
                                        <span className="text-xs text-text-muted truncate block mt-0.5">
                                            {req.time}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => onAcceptRequest(req)}
                                        className="py-1.5 px-3 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                                        title={t("profile.accept")}
                                    >
                                        <FontAwesomeIcon icon={faCheck} className="text-[10px]" />
                                        <span>{t("profile.accept")}</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onDeclineRequest(req.id)}
                                        className="py-1.5 px-3 rounded-lg bg-[#E4E6EB] dark:bg-[#3A3B3C] hover:bg-[#D8DADF] dark:hover:bg-[#4E4F50] text-[#050505] dark:text-[#E4E6EB] text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                                        title={t("profile.decline")}
                                    >
                                        <FontAwesomeIcon icon={faXmark} className="text-[10px]" />
                                        <span>{t("profile.decline")}</span>
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full bg-surface rounded-2xl p-10 text-center text-text-muted text-xs flex flex-col items-center gap-2 border border-border/40">
                            <FontAwesomeIcon icon={faUserPlus} className="text-3xl text-text-faint mb-1" />
                            <span className="text-sm font-semibold text-text">{t("profile.noFriendRequests")}</span>
                        </div>
                    )}
                </div>
            )}

            {/* Outgoing Requests subtab (Grid view) */}
            {subTab === "outgoing" && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4 animate-fade-in w-full">
                    {outgoingRequests.length > 0 ? (
                        outgoingRequests.map((req) => (
                            <div
                                key={req.id}
                                className="bg-surface rounded-2xl p-3.5 sm:p-4 border border-border/60 hover:border-border transition-all flex items-center justify-between gap-3 shadow-xs"
                            >
                                <div
                                    onClick={() => navigate({ to: "/profile/$userId", params: { userId: req.handle || req.username || req.userId || `@${req.name}` } })}
                                    className="flex items-center gap-3 min-w-0 cursor-pointer group flex-1"
                                >
                                    <FriendAvatar
                                        src={req.logo || req.avatar}
                                        name={req.name || req.username || "Gamer"}
                                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover ring-2 ring-border/50 shrink-0"
                                        textClassName="text-lg font-bold"
                                    />
                                    <div className="flex flex-col min-w-0">
                                        <h4 className="font-bold text-text text-sm sm:text-base leading-tight truncate group-hover:text-primary transition-colors">
                                            {req.name}
                                        </h4>
                                        {(req.handle || req.username) && (
                                            <span className="text-[11px] font-mono text-text-faint truncate block mt-0.5">
                                                {req.handle ? req.handle : `@${req.username}`}
                                            </span>
                                        )}
                                        <span className="text-xs text-text-muted truncate block mt-0.5">
                                            {req.time}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => onCancelOutgoingRequest?.(req.id)}
                                        className="py-1.5 px-3 rounded-lg bg-[#E4E6EB] dark:bg-[#3A3B3C] hover:bg-[#D8DADF] dark:hover:bg-[#4E4F50] text-[#050505] dark:text-[#E4E6EB] text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                                    >
                                        <FontAwesomeIcon icon={faXmark} className="text-[10px]" />
                                        <span>{t("profile.cancelFriendRequest", { defaultValue: "Hủy lời mời" })}</span>
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full bg-surface rounded-2xl p-10 text-center text-text-muted text-xs flex flex-col items-center gap-2 border border-border/40">
                            <FontAwesomeIcon icon={faPaperPlane} className="text-3xl text-text-faint mb-1" />
                            <span className="text-sm font-semibold text-text">{t("profile.noOutgoingRequests", { defaultValue: "Không có lời mời nào đã gửi" })}</span>
                        </div>
                    )}
                </div>
            )}

            {/* Blocked subtab (Grid view) */}
            {subTab === "blocked" && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4 animate-fade-in w-full">
                    {blockedUsers.length > 0 ? (
                        blockedUsers.map((b, idx) => (
                            <div
                                key={b.id || idx}
                                className="bg-surface rounded-2xl p-3.5 sm:p-4 border border-border/60 hover:border-border transition-all flex items-center justify-between gap-3 shadow-xs"
                            >
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <FriendAvatar
                                        src={b.logo || b.avatar}
                                        name={b.name || b.handle || "User"}
                                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover ring-2 ring-border/50 grayscale opacity-70 shrink-0"
                                        textClassName="text-lg font-bold"
                                    />
                                    <div className="flex flex-col min-w-0">
                                        <h4 className="font-bold text-text text-sm sm:text-base leading-tight truncate">
                                            {b.name}
                                        </h4>
                                        <span className="text-[11px] font-mono text-text-faint truncate block mt-0.5">
                                            ID: {b.handle || `@${b.name}`}
                                        </span>
                                        <span className="text-xs font-medium text-rose-500 truncate block mt-0.5">
                                            {t("profile.blockedLabel")}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => onUnblockUser?.(b)}
                                        className="py-1.5 px-3 rounded-lg bg-[#E4E6EB] dark:bg-[#3A3B3C] hover:bg-[#D8DADF] dark:hover:bg-[#4E4F50] text-[#050505] dark:text-[#E4E6EB] text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                                    >
                                        <FontAwesomeIcon icon={faBan} className="text-[10px]" />
                                        <span>{t("profile.unblock")}</span>
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full bg-surface rounded-2xl p-10 text-center text-text-muted text-xs flex flex-col items-center gap-2 border border-border/40">
                            <FontAwesomeIcon icon={faBan} className="text-3xl text-text-faint mb-1" />
                            <span className="text-sm font-semibold text-text">{t("profile.noBlockedUsers")}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
