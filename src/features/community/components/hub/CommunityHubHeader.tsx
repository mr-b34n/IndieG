import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlus,
    faCheck,
    faCircle,
    faPen,
    faShieldHalved,
    faLock,
    faStar,
    faTriangleExclamation,
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
    accentHex?: string;
    isAdmin?: boolean;
    onOpenAdminController?: () => void;
    isLocked?: boolean;
    autoApprovePosts?: boolean;
    announcement?: string;
    featured?: boolean;
    isNsfw?: boolean;
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
    autoApprovePosts,
    announcement,
    featured,
    isNsfw,
}: CommunityHubHeaderProps) => {
    const { t } = useTranslation();

    return (
        <div className="w-full flex flex-col gap-4 select-none">
            {/* Announcement Banner if exists */}
            {announcement && (
                <div className="w-full p-3.5 rounded-xl bg-gradient-to-r from-rose-950/60 via-rose-900/40 to-surface border border-rose-500/40 text-rose-200 text-xs font-semibold flex items-center justify-between gap-3 shadow-md animate-fade-in">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-rose-500 text-white flex items-center justify-center font-black shrink-0 shadow-xs">
                            <FontAwesomeIcon icon={faBullhorn} className="text-xs" />
                        </div>
                        <div className="min-w-0">
                            <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 block">{t('community.adminAnnouncementTitle', { defaultValue: 'THÔNG BÁO TỪ QUẢN TRỊ VIÊN' })}</span>
                            <p className="text-xs text-rose-100 font-bold truncate leading-tight">{announcement}</p>
                        </div>
                    </div>
                    {isAdmin && onOpenAdminController && (
                        <button
                            type="button"
                            onClick={onOpenAdminController}
                            className="px-2.5 py-1 rounded-lg bg-rose-500 hover:bg-rose-400 text-white text-[11px] font-extrabold shrink-0 cursor-pointer shadow-xs"
                        >
                            {t('community.editAnnouncement', { defaultValue: 'Sửa Thông Báo' })}
                        </button>
                    )}
                </div>
            )}

            {/* 1. Cover Artwork Banner (Editorial Finish, minimal overlay) */}
            <div className="relative w-full h-44 sm:h-52 bg-surface-inner rounded-[4px] overflow-hidden border border-divider-primary/60">
                <img
                    src={coverUrl}
                    alt={name}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* 2. Identity Row (Icon + Name + Description + Stats + Actions) */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-1">
                {/* Left: Icon & Info */}
                <div className="flex items-start gap-4">
                    <img
                        src={iconUrl}
                        alt={name}
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-[4px] object-cover bg-surface border border-divider-primary shrink-0 shadow-xs"
                    />

                    <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-text uppercase">
                                {name}
                            </h1>

                            {featured && (
                                <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-400 font-black text-[10px] uppercase flex items-center gap-1">
                                    <FontAwesomeIcon icon={faStar} className="text-[9px]" />
                                    <span>{t('community.badgeFeatured', { defaultValue: 'FEATURED' })}</span>
                                </span>
                            )}

                            {isLocked && (
                                <span className="px-2 py-0.5 rounded bg-rose-500/20 border border-rose-500/40 text-rose-400 font-black text-[10px] uppercase flex items-center gap-1">
                                    <FontAwesomeIcon icon={faLock} className="text-[9px]" />
                                    <span>{t('community.badgeLocked', { defaultValue: 'ĐÃ KHÓA ĐĂNG BÀI' })}</span>
                                </span>
                            )}

                            {autoApprovePosts === false && (
                                <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-400 font-black text-[10px] uppercase flex items-center gap-1">
                                    <FontAwesomeIcon icon={faTriangleExclamation} className="text-[9px]" />
                                    <span>{t('community.badgeReviewNeeded', { defaultValue: 'CẦN DUYỆT BÀI' })}</span>
                                </span>
                            )}

                            {isNsfw && (
                                <span className="px-2 py-0.5 rounded bg-purple-500/20 border border-purple-500/40 text-purple-400 font-black text-[10px] uppercase">
                                    18+ NSFW
                                </span>
                            )}
                        </div>

                        <p className="text-xs text-text-muted leading-relaxed max-w-xl">
                            {description || t('community.defaultHubDesc', { name, defaultValue: `Official community hub for ${name} discussions, guides & showcases.` })}
                        </p>

                        <div className="flex items-center gap-3 text-xs font-mono font-bold tracking-wide pt-1">
                            <span className="text-text">
                                {formatCompactNumber(membersCount).toUpperCase()}{" "}
                                <span className="text-text-muted font-sans font-medium text-[11px]">{t('community.membersLabel', { defaultValue: 'thành viên' })}</span>
                            </span>
                            <span className="text-divider-primary font-normal">·</span>
                            <span className="flex items-center gap-1.5 text-emerald-500">
                                <FontAwesomeIcon icon={faCircle} className="text-[6px] animate-pulse" />
                                {formatCompactNumber(onlineCount).toUpperCase()}{" "}
                                <span className="text-text-muted font-sans font-medium text-[11px]">{t('community.onlineLabel', { defaultValue: 'trực tuyến' })}</span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-start sm:self-center shrink-0 flex-wrap">
                    {/* ADMIN CONTROLLER BUTTON */}
                    {isAdmin && (
                        <button
                            type="button"
                            onClick={onOpenAdminController}
                            className="px-3.5 py-1.5 rounded-[4px] bg-rose-500 hover:bg-rose-600 text-white text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-rose-500/20 border border-rose-400/50"
                        >
                            <FontAwesomeIcon icon={faShieldHalved} className="text-xs animate-pulse" />
                            <span>{t('community.adminControllerBtn', { defaultValue: 'ADMIN CONTROLLER' })}</span>
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={onToggleJoin}
                        className={`px-3 py-1.5 rounded-[4px] text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                            isJoined
                                ? "bg-surface-hover text-emerald-500 border border-emerald-500/30 hover:bg-surface-hover/80"
                                : "bg-primary hover:bg-primary/90 text-white shadow-xs"
                        }`}
                    >
                        {isJoined ? (
                            <>
                                <FontAwesomeIcon icon={faCheck} className="text-[10px]" />
                                <span>{t('community.joinedBtn', { defaultValue: 'ĐÃ THAM GIA' })}</span>
                            </>
                        ) : (
                            <>
                                <FontAwesomeIcon icon={faPlus} className="text-[10px]" />
                                <span>{t('community.joinBtn', { defaultValue: 'THAM GIA →' })}</span>
                            </>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={onStartDiscussion}
                        disabled={isLocked && !isAdmin}
                        className={`px-3.5 py-1.5 rounded-[4px] text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs ${
                            isLocked && !isAdmin
                                ? "bg-surface-hover text-text-faint cursor-not-allowed border border-border"
                                : "bg-primary hover:bg-primary/90 text-white cursor-pointer"
                        }`}
                    >
                        <FontAwesomeIcon icon={isLocked ? faLock : faPen} className="text-[10px]" />
                        <span>{isLocked ? t('community.communityLocked', { defaultValue: 'Cộng Đồng Đang Khóa' }) : t('community.postBtn', { defaultValue: 'Đăng bài' })}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
