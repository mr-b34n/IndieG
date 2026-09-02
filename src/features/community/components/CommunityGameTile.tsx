import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCheck,
    faShieldHalved,
    faLock,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "@tanstack/react-router";
import type { CommunityData } from "../types";
import { formatCompactNumber } from "../constants";
import { useCommunitiesStore } from "../store/useCommunitiesStore";
import { useAuthStore } from "@/features/auth";
import { useTranslation } from "@/shared/hooks/useTranslate";
import { AdminCommunityControllerModal } from "./AdminCommunityControllerModal";

interface CommunityGameTileProps {
    community: CommunityData;
}

export const CommunityGameTile = ({ community }: CommunityGameTileProps) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const toggleJoin = useCommunitiesStore((state) => state.toggleJoin);
    const requireVerifiedEmail = useAuthStore((state) => state.requireVerifiedEmail);
    const user = useAuthStore((state) => state.user);
    const isAdmin = user?.role === "admin";

    const [showAdminController, setShowAdminController] = useState(false);

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

    const handleAdminClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowAdminController(true);
    };

    return (
        <>
            <div
                onClick={handleCardClick}
                className="group w-full flex flex-col bg-surface hover:bg-surface-hover/40 border border-divider-primary/50 hover:border-divider-primary rounded-[4px] overflow-hidden cursor-pointer transition-all duration-200 relative"
            >
                {/* 1. Game Art Canvas */}
                <div className="relative w-full h-36 sm:h-40 overflow-hidden bg-surface-hover">
                    {community.backdrop ? (
                        <img
                            src={community.backdrop}
                            alt={`${community.name} artwork`}
                            className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-500 ease-out"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10">
                            <img src={community.logo} alt={community.name} className="w-12 h-12 rounded-[4px] opacity-40" />
                        </div>
                    )}

                    {/* Subtle dark gradient at bottom for contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                    {/* Admin Controller Badge on Top-Left */}
                    {isAdmin && (
                        <button
                            type="button"
                            onClick={handleAdminClick}
                            className="absolute top-2.5 left-2.5 z-20 px-2 py-1 rounded bg-rose-500/90 hover:bg-rose-500 text-white font-black text-[10px] uppercase flex items-center gap-1 shadow-md backdrop-blur-xs transition-all cursor-pointer"
                            title="Mở Bảng Báo Tường Admin Controller"
                        >
                            <FontAwesomeIcon icon={faShieldHalved} className="text-[9px]" />
                            <span>ADMIN</span>
                        </button>
                    )}

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

                    {/* Hover Quick Cue */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                        <span className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5 bg-black/75 px-3 py-1 rounded-[4px] border border-white/20">
                            <span>{t('community.exploreCommunity', { defaultValue: 'Khám phá cộng đồng' })}</span>
                        </span>
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
                            {formatCompactNumber(community.members)} {t('community.membersCount', { defaultValue: 'members' })} · <span className="text-emerald-500 font-semibold">{formatCompactNumber(community.onlineNow)} {t('community.onlineCount', { defaultValue: 'online' })}</span>
                        </p>
                    </div>

                    {/* Action & Status Row */}
                    <div className="flex items-center justify-between pt-1 text-xs">
                        {community.joined ? (
                            <>
                                <div
                                    className="flex items-center gap-1.5 text-xs font-bold text-emerald-500 uppercase tracking-wider py-0.5 px-1 -ml-1 select-none"
                                >
                                    <FontAwesomeIcon icon={faCheck} className="text-[10px]" />
                                    <span>{t('community.joinedBtn', { defaultValue: 'Đã tham gia' })}</span>
                                </div>

                                <span className="text-xs font-bold text-text-muted group-hover:text-primary transition-colors">
                                    {t('community.exploreCommunity', { defaultValue: 'Khám phá cộng đồng' })}
                                </span>
                            </>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={handleJoinClick}
                                    className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-wider py-0.5 px-1 -ml-1 rounded hover:bg-primary/10 cursor-pointer"
                                >
                                    <span>{t('community.joinBtn', { defaultValue: 'Tham gia' })}</span>
                                </button>

                                <span className="text-xs font-medium text-text-muted group-hover:text-primary transition-colors">
                                    {t('community.exploreCommunity', { defaultValue: 'Khám phá cộng đồng' })}
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Admin Controller Modal */}
            {showAdminController && (
                <AdminCommunityControllerModal
                    community={community}
                    onClose={() => setShowAdminController(false)}
                />
            )}
        </>
    );
};
