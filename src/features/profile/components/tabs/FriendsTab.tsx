import { useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUsers, faUserPlus, faSearch, faUserCheck, faChevronDown, faUserXmark, faBan, faClock, faCheck, faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { useClickOutside } from "../../hooks/useClickOutside";
import type { FriendEntry, FriendRequest } from "../../types";
import { RAFT_LOGO as raftLogo } from "@/shared/constants/images";

interface FriendsTabProps {
    friends: FriendEntry[];
    requests: FriendRequest[];
    onToggleFriend: (name: string) => void;
    onBlockFriend: (name: string) => void;
    onAcceptRequest: (req: FriendRequest) => void;
    onDeclineRequest: (id: string) => void;
    t: (key: string, opts?: Record<string, unknown>) => string;
}

const FriendCardMenu = ({
    isFriend, onUnfriend, onBlock, t,
}: { isFriend: boolean; onUnfriend: () => void; onBlock: () => void; t: FriendsTabProps["t"] }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    useClickOutside(ref, () => setOpen(false), open);

    if (!isFriend) return null;

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
                className="px-3 py-1.5 rounded-[6px] text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 bg-[#13161C] text-[#24C58A] hover:bg-[#181C24] shadow-xs"
            >
                <FontAwesomeIcon icon={faUserCheck} />
                <span>{t("profile.friendAdded")}</span>
                <FontAwesomeIcon icon={faChevronDown} className={`text-[10px] transition-transform ml-0.5 ${open ? "rotate-180" : ""}`} />
            </button>
            {open && (
                <div className="absolute right-0 top-full mt-1.5 w-44 bg-[#181C24] rounded-[8px] shadow-lg p-1.5 z-50 flex flex-col gap-1 animate-scale-up">
                    <button
                        onClick={(e) => { e.stopPropagation(); onUnfriend(); setOpen(false); }}
                        className="w-full px-3 py-1.5 rounded-[6px] text-left text-xs font-medium text-[#F0F1F2] hover:bg-[#202530] transition-colors flex items-center gap-2.5 cursor-pointer"
                    >
                        <FontAwesomeIcon icon={faUserXmark} className="text-[#E5A93D] w-3.5 text-center" />
                        <span>{t("profile.unfriend")}</span>
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onBlock(); setOpen(false); }}
                        className="w-full px-3 py-1.5 rounded-[6px] text-left text-xs font-medium text-[#E05252] hover:bg-[#E05252]/10 transition-colors flex items-center gap-2.5 cursor-pointer"
                    >
                        <FontAwesomeIcon icon={faBan} className="w-3.5 text-center" />
                        <span>{t("profile.blockUser")}</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export const FriendsTab = ({ friends, requests, onToggleFriend, onBlockFriend, onAcceptRequest, onDeclineRequest, t }: FriendsTabProps) => {
    const navigate = useNavigate();
    const [subTab, setSubTab] = useState<"list" | "requests">("list");
    const [search, setSearch] = useState("");

    const visibleFriends = friends.filter((f) => f.isFriend && f.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="flex flex-col gap-5 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0A0C0E] p-3 rounded-[12px] shadow-sm">
                <div className="flex items-center gap-1.5 bg-[#13161C] p-1 rounded-[8px]">
                    <button
                        onClick={() => setSubTab("list")}
                        className={`px-3.5 py-1.5 rounded-[6px] text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                            subTab === "list"
                                ? "bg-[#181C24] text-[#1688E8] font-bold shadow-xs"
                                : "text-[#9A9DA3] hover:text-[#F0F1F2] hover:bg-[#181C24]"
                        }`}
                    >
                        <FontAwesomeIcon icon={faUsers} />
                        <span>{t("profile.friendsWidgetTitle")} ({friends.length})</span>
                    </button>
                    <button
                        onClick={() => setSubTab("requests")}
                        className={`px-3.5 py-1.5 rounded-[6px] text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 relative ${
                            subTab === "requests"
                                ? "bg-[#181C24] text-[#1688E8] font-bold shadow-xs"
                                : "text-[#9A9DA3] hover:text-[#F0F1F2] hover:bg-[#181C24]"
                        }`}
                    >
                        <FontAwesomeIcon icon={faUserPlus} />
                        <span>{t("profile.friendRequests")}</span>
                        {requests.length > 0 && (
                            <span className="w-4 h-4 rounded-full bg-[#E05252] text-white text-[10px] font-bold flex items-center justify-center">
                                {requests.length}
                            </span>
                        )}
                    </button>
                </div>

                {subTab === "list" && (
                    <div className="relative flex-1 sm:max-w-xs">
                        <FontAwesomeIcon icon={faSearch} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#666A71] text-xs pointer-events-none" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={t("profile.searchFriends")}
                            className="w-full pl-9 pr-4 py-2 rounded-[6px] bg-[#13161C] text-[#F0F1F2] placeholder-[#666A71] text-xs font-medium focus:outline-none focus:bg-[#181C24] transition-all"
                        />
                    </div>
                )}
            </div>

            {subTab === "list" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 animate-fade-in">
                    {visibleFriends.length > 0 ? (
                        visibleFriends.map((f) => (
                            <div key={f.name} className="bg-[#0A0C0E] rounded-[12px] p-4 flex items-center justify-between gap-4 shadow-xs hover:bg-[#13161C] transition-all group relative">
                                <div
                                    onClick={() => navigate({ to: "/profile/$userId", params: { userId: `@${f.name.toLowerCase().replace(/\s+/g, "_")}` } })}
                                    className="flex items-center gap-3.5 min-w-0 cursor-pointer flex-1"
                                >
                                    <div className="relative shrink-0">
                                        <img src={f.logo || raftLogo} alt={f.name} className="w-12 h-12 rounded-[8px] object-cover" />
                                        <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-[#0A0C0E] ${f.status === "online" ? "bg-[#24C58A]" : f.status === "in-game" ? "bg-[#E5A93D]" : "bg-[#666A71]"}`} />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <h4 className="font-bold text-[#F0F1F2] text-sm truncate group-hover:text-[#1688E8] transition-colors">{f.name}</h4>
                                        <span className="text-xs font-medium text-[#9A9DA3] truncate mt-0.5">{f.game || (f.status === "online" ? t("profile.statusOnline") : t("profile.statusOffline"))}</span>
                                        <span className="text-[10px] text-[#666A71] mt-0.5">ID: @{f.name.toLowerCase()}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0 relative">
                                    {f.isFriend ? (
                                        <FriendCardMenu isFriend={f.isFriend} onUnfriend={() => onToggleFriend(f.name)} onBlock={() => onBlockFriend(f.name)} t={t} />
                                    ) : (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onToggleFriend(f.name); }}
                                            className="px-3 py-1.5 rounded-[6px] text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 bg-[#1688E8] hover:bg-[#1478D0] text-white shadow-xs"
                                        >
                                            <FontAwesomeIcon icon={faUserPlus} />
                                            <span>{t("profile.addFriend")}</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full bg-[#0A0C0E] rounded-[12px] p-8 text-center text-[#9A9DA3] text-xs flex flex-col items-center gap-2 shadow-xs">
                            <FontAwesomeIcon icon={faUsers} className="text-2xl text-[#666A71]" />
                            <span>{t("profile.noFriendsFound")}</span>
                        </div>
                    )}
                </div>
            )}

            {subTab === "requests" && (
                <div className="flex flex-col gap-3 animate-fade-in">
                    {requests.length > 0 ? (
                        requests.map((req) => (
                            <div key={req.id} className="bg-[#0A0C0E] rounded-[12px] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs transition-all">
                                <div className="flex items-center gap-3.5 min-w-0">
                                    <img src={req.logo || raftLogo} alt={req.name} className="w-12 h-12 rounded-[8px] object-cover" />
                                    <div className="flex flex-col min-w-0">
                                        <h4 className="font-bold text-[#F0F1F2] text-sm truncate">{req.name}</h4>
                                        <span className="text-xs font-medium text-[#9A9DA3] mt-0.5">{req.game || "Game"}</span>
                                        <span className="text-[10px] text-[#666A71] mt-0.5 flex items-center gap-1">
                                            <FontAwesomeIcon icon={faClock} className="text-[10px]" />
                                            <span>{req.time}</span>
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-end">
                                    <button
                                        onClick={() => onAcceptRequest(req)}
                                        className="px-3.5 py-1.5 rounded-[6px] bg-[#1688E8] hover:bg-[#1478D0] text-white text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                                    >
                                        <FontAwesomeIcon icon={faCheck} />
                                        <span>{t("profile.accept")}</span>
                                    </button>
                                    <button
                                        onClick={() => onDeclineRequest(req.id)}
                                        className="px-3.5 py-1.5 rounded-[6px] bg-[#13161C] hover:bg-[#181C24] text-[#9A9DA3] hover:text-[#F0F1F2] text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                                    >
                                        <FontAwesomeIcon icon={faXmark} />
                                        <span>{t("profile.decline")}</span>
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-[#0A0C0E] rounded-[12px] p-8 text-center text-[#9A9DA3] text-xs flex flex-col items-center gap-2 shadow-xs">
                            <FontAwesomeIcon icon={faUserCheck} className="text-2xl text-[#666A71]" />
                            <span>{t("profile.noFriendRequests")}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
