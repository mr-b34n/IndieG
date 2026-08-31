import React, { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCheck, faXmark, faCamera,
    faUserPlus, faUserCheck, faChevronDown, faUserXmark, faEllipsisV, faBan,
    faImage, faSliders, faArrowLeft, faMessage, faShieldHalved,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "@/features/auth";
import { useClickOutside } from "../hooks/useClickOutside";
import type { Badge, ProfileIdentity, ProfileStatus } from "../types";
import type { TranslateFn } from "@/shared/hooks/useTranslate";

interface ProfileHeroProps {
    coverSrc: string;
    avatarUrl: string;
    isOwnProfile: boolean;
    identity: ProfileIdentity;
    onIdentityChange: (next: Partial<ProfileIdentity>) => void;
    equippedBadge: Badge;
    forumRankNode: React.ReactNode;
    isFriend: boolean;
    isBlocked: boolean;
    onSelectCoverFile: (file: File) => void;
    onSelectAvatarFile: (file: File) => void;
    onSaveIdentity: () => void;
    onOpenBadgeSelector?: () => void;
    onOpenEditModal?: () => void;
    isCustomizeMode?: boolean;
    onToggleCustomizeMode?: () => void;
    onAddFriend: () => void;
    onUnfriend: () => void;
    onBlock: () => void;
    onUnblock: () => void;
    location?: string;
    joinedDate?: string;
    reputationPercent?: number;
    followersCount?: number;
    postsCount?: number;
    communitiesCount?: number;
    t: TranslateFn;
}

const STATUS_OPTIONS: { val: ProfileStatus; label: string; dotColor: string }[] = [
    { val: "online",  label: "Online",  dotColor: "bg-[#24C58A]" },
    { val: "in-game", label: "In‑Game", dotColor: "bg-[#1688E8]" },
    { val: "offline", label: "Offline", dotColor: "bg-[#666A71]" },
];

const statusCfg = (s: ProfileStatus) =>
    STATUS_OPTIONS.find((o) => o.val === s) ?? STATUS_OPTIONS[0];

export const ProfileHero = ({
    coverSrc, avatarUrl, isOwnProfile, identity, onIdentityChange, equippedBadge, forumRankNode,
    isFriend, isBlocked, onSelectCoverFile, onSelectAvatarFile, onSaveIdentity,
    isCustomizeMode, onToggleCustomizeMode, onAddFriend, onUnfriend, onBlock, onUnblock, location,
    reputationPercent = 100, followersCount = 0, postsCount = 0, communitiesCount = 0, t,
}: ProfileHeroProps) => {
    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingStatus, setIsEditingStatus] = useState(false);
    const [showFriendMenu, setShowFriendMenu] = useState(false);

    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const mockLogin = useAuthStore((state) => state.mockLogin);
    const isLoggedIn = !!user || mockLogin;

    const requireVerifiedEmail = useAuthStore((state) => state.requireVerifiedEmail);

    const handleProtectedAction = (actionName: string, action: () => void) => {
        if (!isLoggedIn) {
            navigate({ to: "/auth" });
            return;
        }
        if (!requireVerifiedEmail(actionName)) return;
        action();
    };

    const statusMenuRef = useRef<HTMLDivElement>(null);
    const friendMenuRef = useRef<HTMLDivElement>(null);
    useClickOutside(statusMenuRef, () => setIsEditingStatus(false), isEditingStatus);
    useClickOutside(friendMenuRef, () => setShowFriendMenu(false), showFriendMenu);

    const cfg = statusCfg(identity.status);

    const level = identity.level || 1;
    const currentXp = identity.currentXp || 0;
    const maxXp = identity.maxXp || 1000;
    const xpPercent = maxXp > 0 ? Math.min(100, Math.round((currentXp / maxXp) * 100)) : 0;

    const defaultTitles = identity.titles && identity.titles.length > 0
        ? identity.titles.join(" · ")
        : "";

    return (
        <div className="relative w-full rounded-[14px] overflow-hidden bg-[#0A0C0E] shadow-sm" style={{ isolation: "isolate" }}>

            {/* ── Cover / Banner ─────────────────────────────────── */}
            <div className="relative h-52 sm:h-60 w-full overflow-hidden bg-[#121418]">
                <img
                    src={coverSrc}
                    alt="Gamer Cover"
                    className="absolute inset-0 w-full h-full object-cover object-center"
                    style={{ filter: "brightness(0.75) contrast(1.05)" }}
                />
                
                {/* Clean vignette overlay */}
                <div 
                    className="absolute inset-0" 
                    style={{
                        background: "linear-gradient(180deg, rgba(8,9,10,0.15) 0%, rgba(8,9,10,0.55) 50%, rgba(10,12,14,0.98) 100%), linear-gradient(90deg, rgba(8,9,10,0.75) 0%, transparent 65%)"
                    }}
                />

                {/* Top Back & Upload buttons */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                    <button
                        type="button"
                        onClick={() => window.history.back()}
                        className="w-8 h-8 flex items-center justify-center rounded-[8px] bg-black/60 backdrop-blur-md text-[#F0F1F2] hover:bg-black/80 transition-all cursor-pointer"
                        title={t("common.back")}
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
                    </button>

                    {isOwnProfile && (
                        <label
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-black/60 backdrop-blur-md text-[#F0F1F2] text-xs font-semibold hover:bg-black/80 transition-all cursor-pointer"
                            title={t("profile.uploadCover")}
                        >
                            <FontAwesomeIcon icon={faImage} className="text-[#1688E8] text-xs" />
                            <span>{t("profile.uploadCover")}</span>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => { const f = e.target.files?.[0]; if (f) onSelectCoverFile(f); e.target.value = ""; }}
                            />
                        </label>
                    )}
                </div>

                {/* Avatar Overlay & Gamer Identity Text */}
                <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                    <div className="flex items-end gap-4">
                        {/* Avatar Box */}
                        <div className="relative shrink-0 group">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-[#181B22] ring-2 ring-[#0A0C0E] relative shadow-md">
                                <img src={avatarUrl} alt={identity.name} className="w-full h-full object-cover" />
                            </div>

                            {/* Avatar upload overlay */}
                            {isOwnProfile && (
                                <label className="absolute inset-0 rounded-full bg-black/60 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-[#F0F1F2] text-[10px] font-bold cursor-pointer gap-1">
                                    <FontAwesomeIcon icon={faCamera} className="text-sm" />
                                    <span>{t("profile.changeAvatar")}</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => { const f = e.target.files?.[0]; if (f) onSelectAvatarFile(f); e.target.value = ""; }}
                                    />
                                </label>
                            )}

                            {/* Status Indicator Dot / Badge */}
                            <div className="absolute -bottom-1 -right-1 z-20" ref={statusMenuRef}>
                                <button
                                    type="button"
                                    onClick={() => isOwnProfile && setIsEditingStatus((v) => !v)}
                                    className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#14171D] text-[#F0F1F2] shadow-sm ${isOwnProfile ? "cursor-pointer hover:bg-[#1D212A]" : "cursor-default"}`}
                                >
                                    <span className={`w-2 h-2 rounded-full ${cfg.dotColor}`} />
                                    <span>{cfg.label}</span>
                                    {isOwnProfile && <FontAwesomeIcon icon={faSliders} className="text-[9px] text-[#8A8F98] ml-0.5" />}
                                </button>

                                {isEditingStatus && isOwnProfile && (
                                    <div className="absolute bottom-full right-0 mb-2 w-40 bg-[#14171D] rounded-[8px] p-1.5 shadow-2xl z-30 flex flex-col gap-0.5 animate-fade-in">
                                        {STATUS_OPTIONS.map((s) => (
                                             <button
                                                key={s.val}
                                                type="button"
                                                onClick={() => { onIdentityChange({ status: s.val }); setIsEditingStatus(false); onSaveIdentity(); }}
                                                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-[6px] text-xs font-semibold transition-colors text-left cursor-pointer ${
                                                    identity.status === s.val ? "bg-[#1F2430] text-[#F0F1F2]" : "text-[#9A9DA3] hover:bg-[#1A1E28] hover:text-[#F0F1F2]"
                                                }`}
                                            >
                                                <span className={`w-2 h-2 rounded-full shrink-0 ${s.dotColor}`} />
                                                <span>{s.label}</span>
                                                {identity.status === s.val && <FontAwesomeIcon icon={faCheck} className="ml-auto text-[#1688E8] text-xs" />}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Text Identity Block */}
                        <div className="flex flex-col gap-1 pb-1">
                            {isEditingName ? (
                                <div className="flex flex-wrap items-center gap-2">
                                    <input
                                        type="text"
                                        value={identity.name}
                                        onChange={(e) => onIdentityChange({ name: e.target.value })}
                                        className="px-3 py-1.5 rounded-[8px] bg-[#14171D] text-[#F0F1F2] font-bold text-base w-40 focus:outline-none focus:bg-[#1D212A]"
                                        placeholder="Display name"
                                    />
                                    <input
                                        type="text"
                                        value={identity.username}
                                        onChange={(e) => onIdentityChange({ username: e.target.value })}
                                        className="px-3 py-1.5 rounded-[8px] bg-[#14171D] text-[#9A9DA3] font-semibold text-xs w-32 focus:outline-none focus:bg-[#1D212A]"
                                        placeholder="@username"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => { setIsEditingName(false); onSaveIdentity(); }}
                                        className="w-7 h-7 rounded-[6px] bg-[#1688E8] text-white flex items-center justify-center text-xs hover:bg-[#1478D0] transition cursor-pointer"
                                    >
                                        <FontAwesomeIcon icon={faCheck} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsEditingName(false)}
                                        className="w-7 h-7 rounded-[6px] bg-[#1D212A] text-[#9A9DA3] flex items-center justify-center text-xs hover:text-[#F0F1F2] transition cursor-pointer"
                                    >
                                        <FontAwesomeIcon icon={faXmark} />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h1 className="text-xl sm:text-2xl font-bold text-[#F0F1F2] tracking-tight">
                                            {identity.name}
                                        </h1>
                                    </div>

                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-xs text-[#9A9DA3] font-medium">{identity.username}</span>
                                        {defaultTitles && (
                                            <>
                                                <span className="text-[#666A71]">•</span>
                                                <span className="text-xs text-[#9A9DA3] font-medium">{defaultTitles}</span>
                                            </>
                                        )}
                                        {location && (
                                            <>
                                                <span className="text-[#666A71]">•</span>
                                                <span className="text-xs text-[#8A8F98]">📍 {location}</span>
                                            </>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                                        {(user?.role === "admin" || identity.name.toLowerCase().includes("admin") || identity.username.toLowerCase().includes("admin")) && (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[6px] text-xs font-bold bg-[#E05252]/20 text-[#FF6B6B] uppercase tracking-wider">
                                                <FontAwesomeIcon icon={faShieldHalved} />
                                                <span>Admin</span>
                                            </span>
                                        )}
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[6px] text-xs font-semibold bg-[#14171D] text-[#C2C6CF]">
                                            <FontAwesomeIcon icon={equippedBadge.icon} className="text-[#E5A93D]" />
                                            <span>{equippedBadge.badgeText}</span>
                                        </span>
                                        {forumRankNode}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Actions Bar */}
                    <div className="flex items-center gap-2 shrink-0 self-end">
                        {isOwnProfile ? (
                            <>
                                {onToggleCustomizeMode && (
                                    <button
                                        type="button"
                                        onClick={onToggleCustomizeMode}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-[8px] text-xs font-bold transition-all cursor-pointer shadow-xs ${
                                            isCustomizeMode
                                                ? "bg-[#1688E8] text-white ring-2 ring-[#1688E8]/40"
                                                : "bg-[#14171D] hover:bg-[#1D212A] text-[#1688E8]"
                                        }`}
                                        title={isCustomizeMode ? "Thoát chế độ tùy chỉnh" : "Tùy chỉnh giao diện"}
                                    >
                                        <FontAwesomeIcon icon={faSliders} className="text-xs" />
                                        <span>{isCustomizeMode ? "Xong" : "Tùy chỉnh"}</span>
                                    </button>
                                )}
                            </>
                        ) : isBlocked ? (
                            <button
                                type="button"
                                onClick={onUnblock}
                                className="flex items-center gap-1.5 px-3.5 py-2 rounded-[8px] bg-[#E05252]/20 text-[#FF6B6B] text-xs font-bold hover:bg-[#E05252]/30 transition-all cursor-pointer"
                            >
                                <FontAwesomeIcon icon={faBan} />
                                <span>{t("profile.unblockSuccess")}</span>
                            </button>
                        ) : (
                            <div className="relative flex items-center gap-2" ref={friendMenuRef}>
                                <button
                                    type="button"
                                    onClick={() => handleProtectedAction("gửi tin nhắn", () => {})}
                                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-[8px] bg-[#14171D] hover:bg-[#1D212A] text-[#F0F1F2] text-xs font-semibold transition-all cursor-pointer shadow-xs"
                                >
                                    <FontAwesomeIcon icon={faMessage} className="text-[#1688E8] text-xs" />
                                    <span>Nhắn tin</span>
                                </button>

                                {isFriend ? (
                                    <button
                                        type="button"
                                        onClick={() => handleProtectedAction("quản lý bạn bè", () => setShowFriendMenu((v) => !v))}
                                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-[8px] bg-[#24C58A]/20 text-[#2EE09E] text-xs font-bold hover:bg-[#24C58A]/30 transition-all cursor-pointer"
                                    >
                                        <FontAwesomeIcon icon={faUserCheck} />
                                        <span>{t("profile.friendAdded")}</span>
                                        <FontAwesomeIcon icon={faChevronDown} className={`text-[10px] transition-transform ${showFriendMenu ? "rotate-180" : ""}`} />
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => handleProtectedAction("kết bạn", onAddFriend)}
                                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-[8px] bg-[#1688E8] hover:bg-[#1478D0] text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                                    >
                                        <FontAwesomeIcon icon={faUserPlus} />
                                        <span>{t("profile.addFriend")}</span>
                                    </button>
                                )}

                                <button
                                    type="button"
                                    onClick={() => handleProtectedAction("mở tùy chọn", () => setShowFriendMenu((v) => !v))}
                                    className="w-8 h-8 rounded-[8px] bg-[#14171D] hover:bg-[#1D212A] text-[#9A9DA3] hover:text-[#F0F1F2] flex items-center justify-center text-xs transition-all cursor-pointer"
                                >
                                    <FontAwesomeIcon icon={faEllipsisV} />
                                </button>

                                {showFriendMenu && (
                                    <div className="absolute right-0 bottom-full mb-2 w-40 bg-[#14171D] rounded-[8px] p-1.5 shadow-2xl z-50 flex flex-col gap-0.5 animate-scale-up">
                                        {isFriend && (
                                            <button
                                                type="button"
                                                onClick={() => { onUnfriend(); setShowFriendMenu(false); }}
                                                className="flex items-center gap-2 px-3 py-1.5 rounded-[6px] text-xs font-semibold text-[#F0F1F2] hover:bg-[#1D212A] transition-colors text-left cursor-pointer"
                                            >
                                                <FontAwesomeIcon icon={faUserXmark} className="text-[#E5A93D] w-4" />
                                                <span>{t("profile.unfriend")}</span>
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => { onBlock(); setShowFriendMenu(false); }}
                                            className="flex items-center gap-2 px-3 py-1.5 rounded-[6px] text-xs font-semibold text-[#FF6B6B] hover:bg-[#E05252]/15 transition-colors text-left cursor-pointer"
                                        >
                                            <FontAwesomeIcon icon={faBan} className="w-4" />
                                            <span>{t("profile.blockUser")}</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Quiet & Mature Level, XP & Typography Stats Bar ─────────────────────────────── */}
            <div className="w-full bg-[#0E1116] px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
                
                {/* Level & XP Progress */}
                <div className="flex items-center gap-3 min-w-[220px] max-w-xs flex-1">
                    <div className="flex items-baseline gap-1 font-bold text-xs shrink-0">
                        <span className="text-[10px] text-[#8A8F98] uppercase tracking-wider font-semibold">LEVEL</span>
                        <span className="text-sm text-[#F0F1F2] font-extrabold">{level}</span>
                    </div>

                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                        <div className="flex items-center justify-between text-[10px] font-semibold">
                            <span className="text-[#9A9DA3]">XP</span>
                            <span className="text-[#8A8F98] font-mono">{currentXp.toLocaleString()} / {maxXp.toLocaleString()}</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#181C24] rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[#1688E8] rounded-full transition-all duration-300"
                                style={{ width: `${xpPercent}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Gamer Metrics: Typography with generous spacing */}
                <div className="flex items-center gap-5 sm:gap-8 flex-wrap">
                    <div className="flex flex-col">
                        <span className="font-extrabold text-[#F0F1F2] text-sm leading-tight">{reputationPercent}%</span>
                        <span className="text-[10px] font-semibold uppercase text-[#8A8F98] tracking-wider">Reputation</span>
                    </div>

                    <div className="w-1 h-1 rounded-full bg-[#242A36] hidden sm:block" />

                    <div className="flex flex-col">
                        <span className="font-extrabold text-[#F0F1F2] text-sm leading-tight">{followersCount}</span>
                        <span className="text-[10px] font-semibold uppercase text-[#8A8F98] tracking-wider">Followers</span>
                    </div>

                    <div className="w-1 h-1 rounded-full bg-[#242A36] hidden sm:block" />

                    <div className="flex flex-col">
                        <span className="font-extrabold text-[#F0F1F2] text-sm leading-tight">{postsCount}</span>
                        <span className="text-[10px] font-semibold uppercase text-[#8A8F98] tracking-wider">Posts</span>
                    </div>

                    <div className="w-1 h-1 rounded-full bg-[#242A36] hidden sm:block" />

                    <div className="flex flex-col">
                        <span className="font-extrabold text-[#F0F1F2] text-sm leading-tight">{communitiesCount}</span>
                        <span className="text-[10px] font-semibold uppercase text-[#8A8F98] tracking-wider">Communities</span>
                    </div>
                </div>

            </div>
        </div>
    );
};
