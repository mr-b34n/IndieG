import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faLock,
    faCheck,
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

    const isJoined = !!community.joined;

    const handleCardClick = () => {
        navigate({
            to: "/community/$communityId",
            params: { communityId: community.id.toString() }
        });
    };

    const handleActionClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isJoined) {
            handleCardClick();
        } else {
            if (!requireVerifiedEmail("tham gia cộng đồng")) return;
            toggleJoin(community.id);
        }
    };

    return (
        <div
            onClick={handleCardClick}
            className="group relative w-full flex flex-col bg-[#0F1216] hover:bg-[#14181F] border border-[#1F242C] hover:border-[#303744] rounded-lg overflow-hidden cursor-pointer transition-all duration-250 ease-out hover:scale-[1.025] hover:shadow-2xl hover:shadow-black/70 select-none"
        >
            {/* 1. Game Art Canvas with atmospheric gradient expansion & subtle desaturation on hover */}
            <div className="relative w-full h-36 sm:h-40 overflow-hidden bg-[#14171D]">
                {community.backdrop ? (
                    <img
                        src={community.backdrop}
                        alt={`${community.name} artwork`}
                        className="w-full h-full object-cover object-center transition-all duration-250 ease-out group-hover:saturate-[0.7] group-hover:brightness-95 group-hover:contrast-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10">
                        <img src={community.logo} alt={community.name} className="w-12 h-12 rounded-[4px] opacity-40" />
                    </div>
                )}

                {/* Atmospheric gradient: 25% default -> 60% on hover */}
                <div className="absolute inset-x-0 bottom-0 h-[25%] group-hover:h-[60%] bg-gradient-to-t from-[#0F1216] via-[#0F1216]/60 to-transparent pointer-events-none transition-all duration-250 ease-out" />

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
            <div className="p-3.5 sm:p-4 flex flex-col justify-between flex-1 gap-2.5 relative z-10 bg-transparent">
                {/* Identity: Icon + Community Name + Persistent Status Indicator */}
                <div className="flex items-start gap-2.5 min-w-0">
                    <img
                        src={community.logo}
                        alt={community.name}
                        className="w-8 h-8 rounded-[4px] object-cover bg-surface border border-divider-primary/60 shrink-0 mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                            <h3 className="text-sm sm:text-base font-black text-text group-hover:text-white transition-colors duration-150 uppercase tracking-tight truncate leading-tight flex-1">
                                {community.name}
                            </h3>

                            {/* Small persistent status indicator near name */}
                            {isJoined ? (
                                <div
                                    title={t('community.joinedBadge', { defaultValue: 'Đã tham gia' })}
                                    className="w-4 h-4 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center shrink-0 text-emerald-400 transition-all duration-200 group-hover:shadow-[0_0_8px_rgba(16,185,129,0.35)]"
                                >
                                    <FontAwesomeIcon icon={faCheck} className="text-[8px]" />
                                </div>
                            ) : (
                                <div
                                    title={t('community.notJoinedYet', { defaultValue: 'Chưa tham gia' })}
                                    className="w-2 h-2 rounded-full bg-[#383E48] shrink-0 opacity-60"
                                />
                            )}
                        </div>

                        {/* Category */}
                        <p className="font-semibold text-text-faint uppercase text-[11px] tracking-wide mt-0.5 truncate">
                            {community.category}
                        </p>
                    </div>
                </div>

                {/* Metadata: Member count + Online count */}
                <div className="flex items-center justify-between text-xs text-text-muted">
                    <div className="flex items-center gap-1.5 font-medium truncate">
                        <span>{formatCompactNumber(community.members)} {t('community.membersCount', { defaultValue: 'thành viên' })}</span>
                        <span className="text-text-faint">·</span>
                        <span className="text-emerald-400 font-semibold">{formatCompactNumber(community.onlineNow)} {t('community.onlineCount', { defaultValue: 'trực tuyến' })}</span>
                    </div>
                </div>

                {/* 3. Emerging CTA on Hover */}
                <div className="pt-0.5 flex items-center justify-end min-h-[32px]">
                    <button
                        type="button"
                        onClick={handleActionClick}
                        className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider py-1.5 px-3.5 rounded-[4px] cursor-pointer transition-all duration-200 ease-out transform ${
                            isJoined
                                ? "text-[#D6DAE2] hover:text-white bg-[#222730] hover:bg-[#2C3340] border border-[#3A4250]/70 hover:border-[#4E586B]"
                                : "text-white bg-primary hover:bg-primary-hover shadow-xs shadow-primary/30"
                        } opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0`}
                    >
                        <span>{isJoined ? "ACCESS →" : "JOIN →"}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

