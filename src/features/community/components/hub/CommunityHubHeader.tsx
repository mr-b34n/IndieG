import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlus,
    faCheck,
    faCircle,
    faLock,
    faStar,
    faShieldHalved,
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
    isAdmin?: boolean;
    onOpenAdminController?: () => void;
    isLocked?: boolean;
    announcement?: string;
    featured?: boolean;
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
    isAdmin,
    onOpenAdminController,
    isLocked,
    announcement,
    featured,
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
                    {isAdmin && onOpenAdminController && (
                        <button
                            type="button"
                            onClick={onOpenAdminController}
                            className="text-[11px] font-bold text-rose-300 hover:text-white underline shrink-0 cursor-pointer"
                        >
                            {isVi ? "Sửa" : "Edit"}
                        </button>
                    )}
                </div>
            )}

            {/* 1. Atmospheric Cover Image (Restrained height, calm editorial mood) */}
            <div className="relative w-full h-36 sm:h-44 bg-surface-inner rounded-[6px] overflow-hidden border border-divider-primary/50">
                <img
                    src={coverUrl}
                    alt={name}
                    className="w-full h-full object-cover brightness-[0.9] saturate-[1.1]"
                />
            </div>

            {/* 2. Compact Identity Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                {/* Left: Community Avatar & Metadata */}
                <div className="flex items-center gap-3.5 min-w-0">
                    <img
                        src={iconUrl}
                        alt={name}
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-[6px] object-cover bg-surface border border-divider-primary shrink-0 shadow-sm"
                    />

                    <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-text uppercase leading-none truncate">
                                {name}
                            </h1>

                            {featured && (
                                <span className="px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold text-[10px] uppercase flex items-center gap-1">
                                    <FontAwesomeIcon icon={faStar} className="text-[8px]" />
                                    <span>{t('community.badgeFeatured', { defaultValue: 'Featured' })}</span>
                                </span>
                            )}

                            {isLocked && (
                                <span className="px-1.5 py-0.5 rounded bg-rose-500/15 border border-rose-500/30 text-rose-400 font-bold text-[10px] uppercase flex items-center gap-1">
                                    <FontAwesomeIcon icon={faLock} className="text-[8px]" />
                                    <span>{isVi ? "Khóa" : "Locked"}</span>
                                </span>
                            )}
                        </div>

                        {description && (
                            <p className="text-xs text-text-muted leading-relaxed line-clamp-1 mt-0.5 max-w-xl">
                                {description}
                            </p>
                        )}

                        {/* Status line: Members + Online + Subtle Membership state */}
                        <div className="flex items-center gap-2.5 text-xs font-mono font-medium text-text-muted mt-1">
                            <span className="text-text font-bold">
                                {formatCompactNumber(membersCount)}{" "}
                                <span className="text-text-muted font-sans font-normal text-[11px]">
                                    {t('community.membersLabel', { defaultValue: 'members' })}
                                </span>
                            </span>
                            <span className="text-divider-primary font-normal">·</span>
                            <span className="flex items-center gap-1.5 text-emerald-500 font-bold">
                                <FontAwesomeIcon icon={faCircle} className="text-[5px] animate-pulse" />
                                {formatCompactNumber(onlineCount)}{" "}
                                <span className="text-text-muted font-sans font-normal text-[11px]">
                                    {t('community.onlineLabel', { defaultValue: 'online' })}
                                </span>
                            </span>

                            {/* Subtle Membership Indicator */}
                            <span className="text-divider-primary font-normal">·</span>
                            <button
                                type="button"
                                onClick={onToggleJoin}
                                className={`text-[11px] font-sans font-medium transition-colors cursor-pointer hover:underline flex items-center gap-1 ${
                                    isJoined ? "text-emerald-400" : "text-primary font-semibold"
                                }`}
                            >
                                {isJoined ? (
                                    <>
                                        <FontAwesomeIcon icon={faCheck} className="text-[9px]" />
                                        <span>{isVi ? "Đã tham gia" : "Joined"}</span>
                                    </>
                                ) : (
                                    <span>{isVi ? "+ Tham gia" : "+ Join"}</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right: Primary Action CTA (+ Create) & Admin if applicable */}
                <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
                    {isAdmin && (
                        <button
                            type="button"
                            onClick={onOpenAdminController}
                            title="Admin Settings"
                            className="p-2 rounded-[6px] bg-surface-inner hover:bg-surface-hover text-text-muted hover:text-text border border-divider-primary transition-colors cursor-pointer text-xs"
                        >
                            <FontAwesomeIcon icon={faShieldHalved} />
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={onStartDiscussion}
                        disabled={isLocked && !isAdmin}
                        className={`px-4 py-2 rounded-[6px] text-xs font-bold transition-all flex items-center gap-2 shadow-sm ${
                            isLocked && !isAdmin
                                ? "bg-surface-inner text-text-faint cursor-not-allowed border border-divider-primary"
                                : "bg-primary hover:bg-primary/90 text-white cursor-pointer hover:shadow-md active:scale-[0.98]"
                        }`}
                    >
                        <FontAwesomeIcon icon={faPlus} className="text-xs" />
                        <span>{isVi ? "Tạo bài viết" : "Create"}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
