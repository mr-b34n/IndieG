import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faLock,
    faPlus,
    faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "@tanstack/react-router";
import type { CommunityData } from "../types";
import { formatCompactNumber } from "../constants";
import { useCommunitiesStore } from "../store/useCommunitiesStore";
import { useAuthStore } from "@/features/auth";
import { useTranslation } from "@/shared/hooks/useTranslate";

interface CommunityGameTileProps {
    community: CommunityData;
}

export const CommunityGameTile = ({ community }: CommunityGameTileProps) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const toggleJoin = useCommunitiesStore((state) => state.toggleJoin);
    const requireVerifiedEmail = useAuthStore((state) => state.requireVerifiedEmail);

    const handleCardClick = () => {
        navigate({
            to: "/community/$communityId",
            params: { communityId: community.id.toString() }
        });
    };

    const handleJoinClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!requireVerifiedEmail("tham gia cộng đồng")) return;
        toggleJoin(community.id);
    };

    return (
        <div
            onClick={handleCardClick}
            className="group w-full flex flex-col bg-[#14171A] hover:bg-[#20252C] border border-[#23272E]/90 hover:border-[#383F4C] rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ease-out hover:scale-[1.02] hover:shadow-xl hover:shadow-black/60 relative"
        >
            {/* 1. Game Art Canvas */}
            <div className="relative w-full h-36 sm:h-40 overflow-hidden bg-[#181B20]">
                {community.backdrop ? (
                    <img
                        src={community.backdrop}
                        alt={`${community.name} artwork`}
                        className="w-full h-full object-cover object-center"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10">
                        <img src={community.logo} alt={community.name} className="w-12 h-12 rounded-[4px] opacity-40" />
                    </div>
                )}

                {/* Subtle dark gradient at bottom for contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#14171A] group-hover:from-[#20252C] via-transparent to-transparent pointer-events-none transition-colors duration-200" />

                {/* Top Overlay: HOT or LOCKED */}
                <div className="absolute top-2.5 right-3 z-10 flex items-center gap-1.5">
                    {community.isLocked && (
                        <span className="text-[10px] font-black uppercase text-rose-400 bg-rose-950/80 px-1.5 py-0.5 rounded border border-rose-500/40 flex items-center gap-1">
                            <FontAwesomeIcon icon={faLock} className="text-[8px]" />
                            <span>LOCKED</span>
                        </span>
                    )}
                    {community.featured && (
                        <span className="text-[11px] font-black tracking-widest uppercase text-amber-400 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                            HOT
                        </span>
                    )}
                </div>
            </div>

            {/* 2. Content Area */}
            <div className="p-3.5 sm:p-4 flex flex-col gap-3">
                {/* Identity: Icon + Game Title */}
                <div className="flex items-center gap-2.5">
                    <img
                        src={community.logo}
                        alt={community.name}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-[4px] object-cover bg-surface border border-divider-primary/60 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-base font-black text-text group-hover:text-primary transition-colors duration-150 uppercase tracking-tight truncate leading-tight">
                            {community.name}
                        </h3>
                    </div>
                </div>

                {/* Metadata & Social Signals */}
                <div className="flex flex-col gap-0.5 text-xs text-text-muted">
                    <p className="font-semibold text-text-faint uppercase text-[11px] tracking-wide">
                        {community.category}
                    </p>
                    <p className="font-medium">
                        {formatCompactNumber(community.members)} {t('community.membersCount', { defaultValue: 'thành viên' })} · <span className="text-emerald-500 font-semibold">{formatCompactNumber(community.onlineNow)} {t('community.onlineCount', { defaultValue: 'trực tuyến' })}</span>
                    </p>
                </div>

                {/* Action & Status Row */}
                <div className="flex items-center justify-between pt-1 text-xs">
                    {community.joined ? (
                        <>
                            <span className="text-[11px] font-bold text-emerald-400/90 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                <span>{t('community.joinedBadge', { defaultValue: 'Đã tham gia' })}</span>
                            </span>

                            <button
                                type="button"
                                onClick={handleCardClick}
                                className="flex items-center gap-1.5 text-xs font-bold text-[#D0D4DC] hover:text-white bg-[#262B33] hover:bg-[#323944] border border-[#3E4552]/60 hover:border-[#525B6C] transition-all uppercase tracking-wider py-1.5 px-3 rounded-[4px] cursor-pointer"
                            >
                                <span>{t('community.accessBtn', { defaultValue: 'Truy cập' })}</span>
                                <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
                            </button>
                        </>
                    ) : (
                        <>
                            <span className="text-[11px] text-text-faint font-medium">
                                {t('community.notJoinedYet', { defaultValue: 'Chưa tham gia' })}
                            </span>

                            <button
                                type="button"
                                onClick={handleJoinClick}
                                className="flex items-center gap-1.5 text-xs font-bold text-white bg-primary hover:bg-primary-hover transition-colors uppercase tracking-wider py-1.5 px-3 rounded-[4px] cursor-pointer shadow-xs shadow-primary/30"
                            >
                                <FontAwesomeIcon icon={faPlus} className="text-[10px]" />
                                <span>{t('community.joinBtn', { defaultValue: 'Tham gia' })}</span>
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
