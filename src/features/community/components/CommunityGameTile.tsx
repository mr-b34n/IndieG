import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faLock,
    faGamepad,
    faCheckCircle,
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
    const isVerified = Boolean(
        (community as unknown as { isVerified?: boolean; verified?: boolean }).isVerified ||
        (community as unknown as { isVerified?: boolean; verified?: boolean }).verified
    );

    // Preferred artwork: backdrop or bannerUrl, with fallback
    const artworkUrl = community.backdrop || community.bannerUrl || community.logo || community.avatarUrl;
    const [prevArtworkUrl, setPrevArtworkUrl] = useState(artworkUrl);
    const [imageError, setImageError] = useState(false);

    if (artworkUrl !== prevArtworkUrl) {
        setPrevArtworkUrl(artworkUrl);
        setImageError(false);
    }

    // Distinct game context: only show if gameName does not repeat the community name
    const rawGame = community.gameName || (typeof community.game === "object" ? community.game?.name : undefined);
    const hasDistinctGameContext = Boolean(
        rawGame && !community.name.toLowerCase().includes(rawGame.toLowerCase())
    );

    const handleCardClick = () => {
        navigate({
            to: "/community/$communityId",
            params: { communityId: community.id.toString() },
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
            className="group relative w-full flex flex-col bg-surface overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5 select-none"
        >
            {/* 1. Artwork Layer */}
            <div className="relative w-full aspect-[16/9] overflow-hidden bg-surface-inner">
                {artworkUrl && !imageError ? (
                    <img
                        src={artworkUrl}
                        alt=""
                        loading="lazy"
                        onError={() => setImageError(true)}
                        className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-surface-inner text-text-faint/40 border-b border-border/40 select-none">
                        <FontAwesomeIcon icon={faGamepad} className="text-2xl text-text-faint/30 mb-1" />
                        <span className="text-[11px] font-mono font-medium text-text-faint/50 uppercase tracking-wider">
                            {community.category || "IndieG"}
                        </span>
                    </div>
                )}

                {/* Subtle bottom gradient for soft boundary */}
                <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-surface via-surface/40 to-transparent pointer-events-none" />

                {/* Badges Overlay (Top Right): HOT, Locked */}
                <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5">
                    {community.isLocked && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-black/75 border border-rose-500/30 px-2 py-0.5 backdrop-blur-md flex items-center gap-1">
                            <FontAwesomeIcon icon={faLock} className="text-[8px]" />
                            <span>Locked</span>
                        </span>
                    )}
                    {community.featured && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-black/75 border border-amber-500/30 px-2 py-0.5 backdrop-blur-md">
                            HOT
                        </span>
                    )}
                </div>
            </div>

            {/* Content Container (16–20px padding) */}
            <div className="p-4 sm:p-4.5 flex flex-col justify-between flex-1 gap-3.5">
                {/* 2. Community Identity Layer */}
                <div className="flex flex-col min-w-0">
                    <div className="flex items-start gap-1 min-w-0">
                        <h3
                            className="text-[15px] sm:text-base font-bold text-text group-hover:text-primary transition-colors duration-150 line-clamp-2 leading-snug min-h-[2.6rem] flex-1"
                            title={community.name}
                        >
                            {community.name}
                        </h3>
                        {isVerified && (
                            <span
                                title={t("common.verified", { defaultValue: "Đã xác minh" })}
                                className="inline-flex items-center text-sky-400 shrink-0 mt-0.5 ml-1"
                            >
                                <FontAwesomeIcon icon={faCheckCircle} className="text-xs" />
                            </span>
                        )}
                    </div>

                    {/* Genre & optional distinct game context */}
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-text-muted truncate">
                        <span className="truncate">{community.category}</span>
                        {hasDistinctGameContext && (
                            <>
                                <span className="text-text-faint/60">·</span>
                                <span className="text-text-muted truncate">{rawGame}</span>
                            </>
                        )}
                    </div>
                </div>

                {/* 3. Community Metadata & Action Layer */}
                <div className="pt-3 border-t border-border/40 flex items-center justify-between gap-2 text-xs">
                    {/* Member count + Online count on a single compact row */}
                    <div className="flex items-center gap-1.5 min-w-0 text-text-muted truncate">
                        <span className="truncate">
                            {formatCompactNumber(community.members || community.membersCount || 0)}{" "}
                            {t("community.membersCount", { defaultValue: "thành viên" })}
                        </span>
                        <span className="text-text-faint/60">·</span>
                        <span className="text-emerald-400 font-medium shrink-0 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                            <span>
                                {formatCompactNumber(community.onlineNow || community.onlineCount || 0)}{" "}
                                {t("community.onlineCount", { defaultValue: "trực tuyến" })}
                            </span>
                        </span>
                    </div>

                    {/* Subtle, consistent CTA / Membership status */}
                    <div className="shrink-0">
                        {isJoined ? (
                            <button
                                type="button"
                                onClick={handleActionClick}
                                className="px-2.5 py-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/30 transition-colors cursor-pointer"
                                title={t("community.joinedBadge", { defaultValue: "Đã tham gia" })}
                            >
                                {t("community.joinedButton", { defaultValue: "Đã tham gia" })}
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleActionClick}
                                className="px-2.5 py-1 text-xs font-semibold text-white bg-primary hover:bg-primary-hover transition-colors cursor-pointer shadow-xs"
                            >
                                {t("community.join", { defaultValue: "Tham gia" })}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
