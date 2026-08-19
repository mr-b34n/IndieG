import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCopy,
    faCheck,
    faLock,
    faCircle,
    faTrash,
    faXmark,
    faMicrophone,
    faArrowRight,
    faCrown,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "@/features/auth";
import { useTranslation } from "@/shared/hooks/useTranslate";
import { formatTimeAgo } from "@/shared/utils/formatTimeAgo";
import { useSquadStore } from "../store/useSquadStore";
import { type Squad } from "../types";
import { getUserRankConfig } from "@/features/post/helpers/userRanks";
import { getCurrentAuthor } from "@/features/post/helpers/getCurrentAuthor";

interface SquadCardProps {
    squad: Squad;
}

export const SquadCard = ({ squad }: SquadCardProps) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const mockLogin = useAuthStore((state) => state.mockLogin);
    const isLoggedIn = !!user || mockLogin;

    const joinSquad = useSquadStore((state) => state.joinSquad);
    const leaveSquad = useSquadStore((state) => state.leaveSquad);
    const kickMember = useSquadStore((state) => state.kickMember);
    const deleteSquad = useSquadStore((state) => state.deleteSquad);
    const toggleSquadStatus = useSquadStore((state) => state.toggleSquadStatus);

    const [copied, setCopied] = useState(false);
    const [confirmLeave, setConfirmLeave] = useState(false);

    const currentAuthor = getCurrentAuthor();
    const isLeader = squad.members.some((m) => m.username === currentAuthor && m.role === "Leader");
    const isFull = squad.currentMembers >= squad.maxMembers;
    const progressPercent = Math.min(100, Math.round((squad.currentMembers / squad.maxMembers) * 100));

    const handleCopyRoom = () => {
        if (!squad.roomCode) return;
        navigator.clipboard.writeText(squad.roomCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Find Leader Name for "by @leader"
    const leaderMember = squad.members.find((m) => m.role === "Leader") || squad.members[0];
    const leaderHandle = leaderMember ? `@${leaderMember.username.toLowerCase().replace(/\s+/g, "")}` : "@squadleader";

    return (
        <div
            className={`group w-full py-4.5 px-3 sm:px-4 rounded-[4px] border-b border-divider-primary/60 transition-colors select-none flex flex-col gap-3.5 ${
                squad.isMySquad ? "bg-surface/40 hover:bg-surface/70" : "hover:bg-surface-hover/40"
            }`}
        >
            {/* 1. TOP METADATA & STATUS SIGNAL */}
            <div className="flex items-center justify-between gap-3 text-xs">
                {/* Left: Game & Created Time */}
                <div className="flex items-center gap-2 min-w-0">
                    {squad.gameLogo ? (
                        <img
                            src={squad.gameLogo}
                            alt={squad.game}
                            className="w-5 h-5 rounded-[3px] object-cover border border-divider-primary shrink-0"
                        />
                    ) : (
                        <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    )}
                    <span className="font-bold text-xs uppercase tracking-wider text-primary">
                        {squad.game}
                    </span>
                    <span className="text-divider-primary">·</span>
                    <span className="text-[11px] font-mono text-text-faint">
                        {formatTimeAgo(squad.createdAt, t)}
                    </span>
                </div>

                {/* Right: System Signal */}
                <div className="shrink-0 flex items-center gap-2">
                    {squad.isMySquad && (
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-[3px] bg-primary/10 text-primary border border-primary/20">
                            {isLeader ? "👑 LEADER" : "✓ YOUR SQUAD"}
                        </span>
                    )}

                    {squad.status === "recruiting" && !isFull ? (
                        <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-500">
                            <FontAwesomeIcon icon={faCircle} className="text-[6px] animate-pulse" />
                            <span>RECRUITING</span>
                        </span>
                    ) : isFull ? (
                        <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-rose-500">
                            <FontAwesomeIcon icon={faCircle} className="text-[6px]" />
                            <span>FULL</span>
                        </span>
                    ) : (
                        <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-indigo-400">
                            <FontAwesomeIcon icon={faCircle} className="text-[6px]" />
                            <span>IN GAME</span>
                        </span>
                    )}
                </div>
            </div>

            {/* 2. TITLE & CREATOR */}
            <div className="flex flex-col gap-0.5">
                <h3 className="text-base sm:text-lg font-bold text-text group-hover:text-primary transition-colors leading-snug">
                    {squad.name}
                </h3>
                <span className="text-xs text-text-faint font-mono">
                    by <span className="font-medium text-text-muted">{leaderHandle}</span>
                </span>
            </div>

            {/* 3. DESCRIPTION */}
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed max-w-3xl">
                {squad.description}
            </p>

            {/* 4. TAGS (Clean Typographic Dots, Voice Signal) */}
            <div className="flex items-center gap-3 text-xs text-text-faint flex-wrap">
                <span className="flex items-center gap-1.5 text-text-muted font-medium">
                    <FontAwesomeIcon icon={faMicrophone} className="text-emerald-500 text-[10px]" />
                    <span>{squad.voice}</span>
                </span>

                {squad.tags.slice(0, 4).map((tag) => (
                    <span key={tag} className="flex items-center gap-2">
                        <span className="text-divider-primary">·</span>
                        <span className="text-text-muted font-medium">{tag}</span>
                    </span>
                ))}
            </div>

            {/* 5. MEMBERS & PROGRESS (INLINE, NO NESTED BOX) */}
            <div className="flex flex-col gap-2 pt-1">
                {/* Header info */}
                <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-text-faint">
                        MEMBERS
                    </span>
                    <span className="font-bold text-text">
                        {squad.currentMembers} <span className="text-text-faint font-normal">/</span> {squad.maxMembers}
                        <span className="text-text-muted text-[11px] ml-1.5">({progressPercent}%)</span>
                    </span>
                </div>

                {/* Minimalist Progress Line */}
                <div className="w-full bg-surface-hover rounded-full h-1 overflow-hidden">
                    <div
                        className={`h-full transition-all duration-300 ${
                            isFull ? "bg-rose-500" : squad.isMySquad ? "bg-primary" : "bg-emerald-500"
                        }`}
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>

                {/* Member Avatars & Usernames Row */}
                <div className="flex items-center gap-3 overflow-x-auto py-1 scrollbar-none">
                    {squad.members.map((m) => {
                        const rankConf = getUserRankConfig(m.username);
                        const isSelf = m.username === currentAuthor;

                        return (
                            <div
                                key={m.id}
                                className="flex items-center gap-1.5 text-xs shrink-0 pr-1 group/m"
                                title={`${m.username} (${m.status})`}
                            >
                                <div className="relative">
                                    <img
                                        src={m.avatar}
                                        alt={m.username}
                                        className="w-5 h-5 rounded-full object-cover border border-divider-primary"
                                    />
                                    {m.status === "in-game" ? (
                                        <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-purple-500 ring-1 ring-surface" />
                                    ) : m.status === "online" ? (
                                        <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-1 ring-surface" />
                                    ) : null}
                                </div>

                                <span className={`font-semibold truncate max-w-[90px] ${isSelf ? "text-primary font-bold" : rankConf.textColor}`}>
                                    {isSelf ? "You" : m.username}
                                </span>

                                {m.role === "Leader" && (
                                    <FontAwesomeIcon icon={faCrown} className="text-amber-400 text-[9px]" title="Leader" />
                                )}

                                {isLeader && !isSelf && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (window.confirm(t("squad.confirmKick", { name: m.username }))) {
                                                kickMember(squad.id, m.username);
                                            }
                                        }}
                                        className="opacity-0 group-hover/m:opacity-100 text-text-faint hover:text-rose-500 p-0.5 cursor-pointer transition-opacity"
                                        title={t("squad.kickUser", { name: m.username })}
                                    >
                                        <FontAwesomeIcon icon={faXmark} className="text-[10px]" />
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 6. FOOTER ACTIONS ROW */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-divider-primary/40">
                {/* Left: Room ID & Discord (or Locked info) */}
                <div className="flex items-center gap-3 text-xs font-mono">
                    {squad.isMySquad ? (
                        <>
                            {squad.roomCode ? (
                                <button
                                    type="button"
                                    onClick={handleCopyRoom}
                                    className="flex items-center gap-1.5 text-text-muted hover:text-text cursor-pointer transition-colors"
                                    title={t("squad.copyRoomId")}
                                >
                                    <span className="text-text-faint">ID:</span>
                                    <span className="text-primary font-bold">{squad.roomCode}</span>
                                    <FontAwesomeIcon
                                        icon={copied ? faCheck : faCopy}
                                        className={`text-[10px] ${copied ? "text-emerald-500" : "text-text-faint"}`}
                                    />
                                </button>
                            ) : null}

                            {squad.discordUrl && (
                                <a
                                    href={squad.discordUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-indigo-400 hover:underline font-semibold"
                                >
                                    Discord ↗
                                </a>
                            )}
                        </>
                    ) : (
                        <div className="flex items-center gap-1.5 text-text-faint text-xs font-sans">
                            <FontAwesomeIcon icon={faLock} className="text-[10px]" />
                            <span>{t("squad.joinToView")}</span>
                        </div>
                    )}
                </div>

                {/* Right: Actions */}
                <div className="flex items-center justify-end gap-3 text-xs shrink-0">
                    {isLeader ? (
                        <>
                            <button
                                type="button"
                                onClick={() => toggleSquadStatus(squad.id)}
                                className="text-text-muted hover:text-text font-semibold cursor-pointer transition-colors"
                            >
                                {squad.status === "recruiting" ? t("squad.lock") : t("squad.open")}
                            </button>
                            <span className="text-divider-primary">·</span>
                            <button
                                type="button"
                                onClick={() => {
                                    if (window.confirm(t("squad.confirmDisband", { name: squad.name }))) {
                                        deleteSquad(squad.id);
                                    }
                                }}
                                className="text-rose-400/80 hover:text-rose-500 font-semibold cursor-pointer transition-colors flex items-center gap-1"
                            >
                                <FontAwesomeIcon icon={faTrash} className="text-[10px]" />
                                <span>{t("squad.disband")}</span>
                            </button>
                        </>
                    ) : squad.isMySquad ? (
                        confirmLeave ? (
                            <div className="flex items-center gap-2 animate-fade-in">
                                <span className="text-[11px] text-text-faint">Sure?</span>
                                <button
                                    type="button"
                                    onClick={() => leaveSquad(squad.id)}
                                    className="text-rose-500 font-bold hover:underline cursor-pointer"
                                >
                                    Yes, leave
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setConfirmLeave(false)}
                                    className="text-text-muted hover:text-text cursor-pointer"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setConfirmLeave(true)}
                                className="text-rose-400/70 hover:text-rose-500 text-xs font-medium cursor-pointer transition-colors"
                            >
                                {t("squad.leave")}
                            </button>
                        )
                    ) : isFull ? (
                        <span className="text-xs text-text-faint font-semibold">
                            {t("squad.squadFull")}
                        </span>
                    ) : (
                        <button
                            type="button"
                            onClick={() => {
                                if (!isLoggedIn) {
                                    navigate({ to: "/auth" });
                                    return;
                                }
                                joinSquad(squad.id);
                            }}
                            className="px-4 py-1.5 rounded-[4px] bg-primary hover:bg-primary/90 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                            <span>{t("squad.join")}</span>
                            <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
