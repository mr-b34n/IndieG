import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlus,
    faCheck,
    faCircle,
    faStar,
    faCheckCircle,
    faBullhorn,
} from "@fortawesome/free-solid-svg-icons";
import { formatCompactNumber } from "../../constants";
import { useTranslation } from "@/shared/hooks/useTranslate";

interface CommunityHubHeaderProps {
    name: string;
    description: string;
    coverUrl: string;
    iconUrl: string;
    membersCount: number;
    onlineCount: number;
    isJoined: boolean;
    onToggleJoin: () => void;
    onStartDiscussion: () => void;
    isVi: boolean;
    isLocked?: boolean;
    announcement?: string;
    featured?: boolean;
    isVerified?: boolean;
    userRole?: "owner" | "admin" | "moderator" | "member";
}

export const CommunityHubHeader = ({
    name,
    description,
    coverUrl,
    iconUrl,
    membersCount,
    onlineCount,
    isJoined,
    onToggleJoin,
    onStartDiscussion,
    isLocked,
    announcement,
    featured,
    isVerified = true,
    isVi,
}: CommunityHubHeaderProps) => {
    const { t } = useTranslation();

    return (
        <div className="w-full flex flex-col gap-3 select-none">
            {/* Optional Announcement Strip (Clean & Compact) */}
            {announcement && (
                <div className="w-full px-3.5 py-2 rounded-[6px] bg-rose-950/40 border border-rose-500/30 text-rose-200 text-xs font-medium flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                        <FontAwesomeIcon icon={faBullhorn} className="text-rose-400 text-xs shrink-0" />
                        <span className="truncate">{announcement}</span>
                    </div>
                </div>
            )}

            {/* 1. Shorter Atmospheric Cover Banner (~160–180px, does NOT dominate) */}
            <div className="relative w-full h-40 sm:h-44 bg-surface-inner rounded-[8px] overflow-hidden border border-border/50">
                <img
                    src={coverUrl}
                    alt={name}
                    className="w-full h-full object-cover brightness-[0.85] saturate-[1.1]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* 2. Community Header Identity & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 px-1 pt-1">
                {/* Left: Community Avatar & Metadata */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <img
                        src={iconUrl}
                        alt={name}
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-[8px] object-cover bg-surface border-2 border-border shrink-0 shadow-md"
                    />

                    <div className="flex flex-col min-w-0 flex-1">
                        {/* Title & Meaningful Badges Only */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-text uppercase leading-tight truncate">
                                {name}
                            </h1>

                            {isVerified && (
                                <span className="px-1.5 py-0.5 rounded-[4px] bg-sky-500/10 border border-sky-500/20 text-sky-400 font-mono font-bold text-[9px] tracking-wider uppercase flex items-center gap-1">
                                    <FontAwesomeIcon icon={faCheckCircle} className="text-[9px]" />
                                    <span>VERIFIED</span>
                                </span>
                            )}

                            {featured && (
                                <span className="px-1.5 py-0.5 rounded-[4px] bg-amber-500/15 border border-amber-500/30 text-amber-400 font-mono font-bold text-[9px] tracking-wider uppercase flex items-center gap-1">
                                    <FontAwesomeIcon icon={faStar} className="text-[8px]" />
                                    <span>FEATURED</span>
                                </span>
                            )}
                        </div>

                        {/* Description */}
                        {description && (
                            <p className="text-xs sm:text-[13px] text-text-muted leading-relaxed line-clamp-2 mt-1 max-w-2xl">
                                {description}
                            </p>
                        )}

                        {/* Member Counts & Online Status */}
                        <div className="flex items-center gap-2.5 text-xs font-mono font-medium text-text-muted mt-2">
                            <span className="text-text font-bold">
                                {formatCompactNumber(membersCount)}{" "}
                                <span className="text-text-muted font-sans font-normal text-[11px]">
                                    {t('community.membersLabel', { defaultValue: 'members' })}
                                </span>
                            </span>
                            <span className="text-text-faint font-normal">•</span>
                            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                                <FontAwesomeIcon icon={faCircle} className="text-[5px] animate-pulse" />
                                {formatCompactNumber(onlineCount)}{" "}
                                <span className="text-text-muted font-sans font-normal text-[11px]">
                                    {t('community.onlineLabel', { defaultValue: 'online' })}
                                </span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right: Actions [Joined / Join] [+ Create] [Manage] */}
                <div className="flex items-center gap-2 shrink-0 self-start sm:self-center flex-wrap">
                    {/* Joined State / Action Button */}
                    <button
                        type="button"
                        onClick={onToggleJoin}
                        className={`px-3.5 py-1.5 rounded-[6px] text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
                            isJoined
                                ? "bg-surface-inner hover:bg-surface-hover text-text-muted hover:text-text border-border"
                                : "bg-primary hover:bg-primary/90 text-white border-primary shadow-xs"
                        }`}
                    >
                        {isJoined ? (
                            <>
                                <FontAwesomeIcon icon={faCheck} className="text-[10px] text-emerald-400" />
                                <span>{t('hub.communityhubheader_25')}</span>
                            </>
                        ) : (
                            <span>{t('hub.communityhubheader_26')}</span>
                        )}
                    </button>

                    {/* Primary Create Button */}
                    <button
                        type="button"
                        onClick={onStartDiscussion}
                        disabled={isLocked}
                        className={`px-3.5 py-1.5 rounded-[6px] text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs ${
                            isLocked
                                ? "bg-surface-inner text-text-faint cursor-not-allowed border border-border"
                                : "bg-primary hover:bg-primary/90 text-white cursor-pointer active:scale-[0.98]"
                        }`}
                    >
                        <FontAwesomeIcon icon={faPlus} className="text-[10px]" />
                        <span>{t('hub.communityhubheader_27')}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

