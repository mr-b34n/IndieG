import React, { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCheck, faXmark, faCamera, faPen, faAward,
    faUserPlus, faUserCheck, faChevronDown, faUserXmark, faEllipsisV, faBan,
    faImage, faSliders, faArrowLeft, faMessage,
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
    onOpenBadgeSelector: () => void;
    onOpenEditModal?: () => void;
    onAddFriend: () => void;
    onUnfriend: () => void;
    onBlock: () => void;
    onUnblock: () => void;
    location: string;
    joinedDate: string;
    reputationPercent: number;
    t: TranslateFn;
}

const STATUS_OPTIONS: { val: ProfileStatus; label: string; color: string }[] = [
    { val: "online",  label: "Online",  color: "bg-[#20c997] shadow-[#20c997]/50" },
    { val: "in-game", label: "In‑Game", color: "bg-[#1687ff] shadow-[#1687ff]/50" },
    { val: "offline", label: "Offline", color: "bg-[#626a83] shadow-[#626a83]/50" },
];

const statusCfg = (s: ProfileStatus) =>
    STATUS_OPTIONS.find((o) => o.val === s) ?? STATUS_OPTIONS[0];

export const ProfileHero = ({
    coverSrc, avatarUrl, isOwnProfile, identity, onIdentityChange, equippedBadge, forumRankNode,
    isFriend, isBlocked, onSelectCoverFile, onSelectAvatarFile, onSaveIdentity, onOpenBadgeSelector,
    onOpenEditModal, onAddFriend, onUnfriend, onBlock, onUnblock, location, reputationPercent, t,
}: ProfileHeroProps) => {
    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingStatus, setIsEditingStatus] = useState(false);
    const [showFriendMenu, setShowFriendMenu] = useState(false);

    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const mockLogin = useAuthStore((state) => state.mockLogin);
    const isLoggedIn = !!user || mockLogin;

    const handleProtectedAction = (action: () => void) => {
        if (!isLoggedIn) {
            navigate({ to: "/auth" });
            return;
        }
        action();
    };

    const statusMenuRef = useRef<HTMLDivElement>(null);
    const friendMenuRef = useRef<HTMLDivElement>(null);
    useClickOutside(statusMenuRef, () => setIsEditingStatus(false), isEditingStatus);
    useClickOutside(friendMenuRef, () => setShowFriendMenu(false), showFriendMenu);

    const cfg = statusCfg(identity.status);

    const level = identity.level || 42;
    const currentXp = identity.currentXp || 8420;
    const maxXp = identity.maxXp || 10000;
    const xpPercent = Math.min(100, Math.round((currentXp / maxXp) * 100));

    const defaultTitles = identity.titles && identity.titles.length > 0
        ? identity.titles.join(" · ")
        : "FPS Veteran · Survival Architect";

    return (
        <div className="relative w-full rounded-2xl overflow-hidden bg-[#101421] shadow-xl" style={{ isolation: "isolate" }}>

            {/* ── Cover / Banner ─────────────────────────────────── */}
            <div className="relative h-56 sm:h-64 w-full overflow-hidden bg-[#151A29]">
                <img
                    src={coverSrc}
                    alt="Gamer Cover"
                    className="absolute inset-0 w-full h-full object-cover object-center"
                    style={{ filter: "brightness(0.85) contrast(1.1) saturate(1.1)" }}
                />
                
                {/* Section 12: Dual gradient vignette overlay for strong gamer atmosphere & avatar text contrast */}
                <div 
                    className="absolute inset-0" 
                    style={{
                        background: "linear-gradient(180deg, rgba(8,10,17,0.15) 0%, rgba(8,10,17,0.48) 45%, rgba(8,10,17,0.96) 100%), linear-gradient(90deg, rgba(8,10,17,0.85) 0%, transparent 60%)"
                    }}
                />

                {/* Top Back & Upload buttons */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                    <button
                        type="button"
                        onClick={() => window.history.back()}
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-black/60 backdrop-blur-md text-white hover:bg-black/80 hover:scale-105 transition-all shadow-lg cursor-pointer"
                        title={t("common.back")}
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="text-sm" />
                    </button>

                    {isOwnProfile && (
                        <label
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md text-white text-xs font-bold hover:bg-black/80 transition-all cursor-pointer shadow-lg"
                            title={t("profile.uploadCover")}
                        >
                            <FontAwesomeIcon icon={faImage} className="text-[#1687FF] text-xs" />
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
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden ring-4 ring-[#101421] bg-[#101421] shadow-2xl relative">
                                <img src={avatarUrl} alt={identity.name} className="w-full h-full object-cover" />
                            </div>

                            {/* Avatar upload overlay */}
                            {isOwnProfile && (
                                <label className="absolute inset-0 rounded-2xl bg-black/60 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold cursor-pointer gap-1">
                                    <FontAwesomeIcon icon={faCamera} className="text-base" />
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
                                    className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold text-white shadow-md ring-2 ring-[#101421] ${cfg.color} ${isOwnProfile ? "cursor-pointer hover:brightness-110" : "cursor-default"}`}
                                >
                                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                    <span>{cfg.label}</span>
                                    {isOwnProfile && <FontAwesomeIcon icon={faSliders} className="text-[9px] opacity-80 ml-0.5" />}
                                </button>

                                {isEditingStatus && isOwnProfile && (
                                    <div className="absolute bottom-full right-0 mb-2 w-44 bg-[#151A29] rounded-xl p-1.5 shadow-2xl z-30 flex flex-col gap-0.5 animate-fade-in">
                                        {STATUS_OPTIONS.map((s) => (
                                            <button
                                                key={s.val}
                                                type="button"
                                                onClick={() => { onIdentityChange({ status: s.val }); setIsEditingStatus(false); onSaveIdentity(); }}
                                                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-text hover:bg-[#101421] transition-colors text-left"
                                            >
                                                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${s.color}`} />
                                                <span>{s.label}</span>
                                                {identity.status === s.val && <FontAwesomeIcon icon={faCheck} className="ml-auto text-[#1687FF] text-xs" />}
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
                                        className="px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md text-white font-black text-lg w-40 focus:outline-none ring-1 ring-[#1687FF] placeholder:text-white/40"
                                        placeholder="Display name"
                                    />
                                    <input
                                        type="text"
                                        value={identity.username}
                                        onChange={(e) => onIdentityChange({ username: e.target.value })}
                                        className="px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md text-white/80 font-semibold text-sm w-32 focus:outline-none ring-1 ring-[#1687FF] placeholder:text-white/30"
                                        placeholder="@username"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => { setIsEditingName(false); onSaveIdentity(); }}
                                        className="w-8 h-8 rounded-xl bg-[#1687FF] text-white flex items-center justify-center text-xs hover:brightness-110 transition cursor-pointer"
                                    >
                                        <FontAwesomeIcon icon={faCheck} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsEditingName(false)}
                                        className="w-8 h-8 rounded-xl bg-white/20 text-white flex items-center justify-center text-xs hover:bg-white/30 transition cursor-pointer"
                                    >
                                        <FontAwesomeIcon icon={faXmark} />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-md">
                                            {identity.name}
                                        </h1>
                                        {isOwnProfile && (
                                            <button
                                                type="button"
                                                onClick={() => setIsEditingName(true)}
                                                className="w-6 h-6 rounded-lg bg-black/40 text-white/70 hover:text-white hover:bg-black/60 flex items-center justify-center text-[10px] transition cursor-pointer"
                                                title={t("profile.editName")}
                                            >
                                                <FontAwesomeIcon icon={faPen} />
                                            </button>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-xs text-white/70 font-semibold">{identity.username}</span>
                                        <span className="text-white/40">•</span>
                                        <span className="text-xs text-[#22D3EE] font-bold tracking-wide">{defaultTitles}</span>
                                        {location && (
                                            <>
                                                <span className="text-white/40">•</span>
                                                <span className="text-xs text-white/60 font-semibold">📍 {location}</span>
                                            </>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black ${equippedBadge.color}`}>
                                            <FontAwesomeIcon icon={equippedBadge.icon} />
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
                                {onOpenEditModal && (
                                    <button
                                        type="button"
                                        onClick={onOpenEditModal}
                                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1687FF] text-white text-xs font-bold hover:bg-[#3698FF] transition-all shadow-md cursor-pointer"
                                    >
                                        <FontAwesomeIcon icon={faPen} className="text-xs" />
                                        <span>Chỉnh sửa hồ sơ</span>
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={onOpenBadgeSelector}
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-black/60 backdrop-blur-md text-white text-xs font-bold hover:bg-black/80 transition-all cursor-pointer"
                                >
                                    <FontAwesomeIcon icon={faAward} className="text-[#F5B83D]" />
                                    <span>{t("profile.changeBadge")}</span>
                                </button>
                            </>
                        ) : isBlocked ? (
                            <button
                                type="button"
                                onClick={onUnblock}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F45B78]/20 text-[#F45B78] text-xs font-bold hover:bg-[#F45B78]/30 transition-all cursor-pointer"
                            >
                                <FontAwesomeIcon icon={faBan} />
                                <span>{t("profile.unblockSuccess")}</span>
                            </button>
                        ) : (
                            <div className="relative flex items-center gap-2" ref={friendMenuRef}>
                                <button
                                    type="button"
                                    onClick={() => handleProtectedAction(() => {})}
                                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-black/60 backdrop-blur-md text-white text-xs font-bold hover:bg-black/80 transition-all cursor-pointer"
                                >
                                    <FontAwesomeIcon icon={faMessage} className="text-[#22D3EE] text-xs" />
                                    <span>Nhắn tin</span>
                                </button>

                                {isFriend ? (
                                    <button
                                        type="button"
                                        onClick={() => handleProtectedAction(() => setShowFriendMenu((v) => !v))}
                                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#20C997]/20 text-[#20C997] text-xs font-bold hover:bg-[#20C997]/30 transition-all cursor-pointer"
                                    >
                                        <FontAwesomeIcon icon={faUserCheck} />
                                        <span>{t("profile.friendAdded")}</span>
                                        <FontAwesomeIcon icon={faChevronDown} className={`text-[10px] transition-transform ${showFriendMenu ? "rotate-180" : ""}`} />
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => handleProtectedAction(onAddFriend)}
                                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1687FF] text-white text-xs font-bold hover:bg-[#3698FF] transition-all shadow-lg cursor-pointer"
                                    >
                                        <FontAwesomeIcon icon={faUserPlus} />
                                        <span>{t("profile.addFriend")}</span>
                                    </button>
                                )}

                                <button
                                    type="button"
                                    onClick={() => handleProtectedAction(() => setShowFriendMenu((v) => !v))}
                                    className="w-9 h-9 rounded-xl bg-black/60 backdrop-blur-md text-white/80 hover:text-white flex items-center justify-center text-xs transition-all cursor-pointer"
                                >
                                    <FontAwesomeIcon icon={faEllipsisV} />
                                </button>

                                {showFriendMenu && (
                                    <div className="absolute right-0 bottom-full mb-2 w-44 bg-[#151A29] border border-[#2A3550] rounded-xl shadow-2xl p-1.5 z-50 flex flex-col gap-0.5 animate-scale-up">
                                        {isFriend && (
                                            <button
                                                type="button"
                                                onClick={() => { onUnfriend(); setShowFriendMenu(false); }}
                                                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-text hover:bg-[#101421] transition-colors text-left"
                                            >
                                                <FontAwesomeIcon icon={faUserXmark} className="text-[#F5B83D] w-4" />
                                                <span>{t("profile.unfriend")}</span>
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => { onBlock(); setShowFriendMenu(false); }}
                                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-[#F45B78] hover:bg-[#F45B78]/10 transition-colors text-left"
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

            {/* ── Gamer Level, XP & Clean Typography Stats Bar ─────────────────────────────── */}
            <div className="w-full bg-[#101421] px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-5">
                
                {/* Level & XP Progress Bar (Clean Editorial Typography, no extra pill borders) */}
                <div className="flex items-center gap-3.5 min-w-[240px] max-w-sm flex-1">
                    <div className="flex items-baseline gap-1 font-black text-sm text-[#1687FF] shrink-0">
                        <span className="text-[10px] text-text-faint font-bold uppercase tracking-wider">LVL</span>
                        <span className="text-base text-white">{level}</span>
                    </div>

                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                        <div className="flex items-center justify-between text-[11px] font-bold">
                            <span className="text-text-muted text-[10px] uppercase font-black tracking-wider">GAMER XP</span>
                            <span className="text-text-faint font-mono text-[10px]">{currentXp.toLocaleString()} / {maxXp.toLocaleString()} XP</span>
                        </div>
                        <div className="h-2 w-full bg-[#151A29] rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-[#1687FF] to-[#22D3EE] rounded-full transition-all duration-500"
                                style={{ width: `${xpPercent}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Gamer Metrics: Typography only (Section 12 - No Pill Wrappers) */}
                <div className="flex items-center gap-6 sm:gap-10 flex-wrap">
                    <div className="flex flex-col">
                        <span className="font-black text-[#F5B83D] text-base leading-tight">{reputationPercent}%</span>
                        <span className="text-[10px] font-extrabold uppercase text-text-faint tracking-wider">REPUTATION</span>
                    </div>

                    <div className="w-px h-6 bg-[#1A2032] hidden sm:block" />

                    <div className="flex flex-col">
                        <span className="font-black text-white text-base leading-tight">1.2K</span>
                        <span className="text-[10px] font-extrabold uppercase text-text-faint tracking-wider">FOLLOWERS</span>
                    </div>

                    <div className="w-px h-6 bg-[#1A2032] hidden sm:block" />

                    <div className="flex flex-col">
                        <span className="font-black text-white text-base leading-tight">86</span>
                        <span className="text-[10px] font-extrabold uppercase text-text-faint tracking-wider">POSTS</span>
                    </div>

                    <div className="w-px h-6 bg-[#1A2032] hidden sm:block" />

                    <div className="flex flex-col">
                        <span className="font-black text-white text-base leading-tight">14</span>
                        <span className="text-[10px] font-extrabold uppercase text-text-faint tracking-wider">COMMUNITIES</span>
                    </div>
                </div>

            </div>
        </div>
    );
};
