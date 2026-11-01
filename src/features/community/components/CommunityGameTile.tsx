import React, { useState, useMemo } from "react";
import { Lock, Sparkles, Gamepad2, Check, Plus } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import type { CommunityData } from "../types";
import { formatCompactNumber } from "../constants";
import { useCommunitiesStore } from "../store/useCommunitiesStore";
import { useAuthStore } from "@/features/auth";
import { useTranslation } from "@/shared/hooks/useTranslate";

interface CommunityGameTileProps {
    community: CommunityData;
}

export const CommunityGameTile: React.FC<CommunityGameTileProps> = ({ community }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const toggleJoin = useCommunitiesStore((state) => state.toggleJoin);
    const joinedCommunityIds = useCommunitiesStore((state) => state.joinedCommunityIds);
    const user = useAuthStore((state) => state.user);
    const requireVerifiedEmail = useAuthStore((state) => state.requireVerifiedEmail);

    const isJoined = Boolean(
        community.joined ||
        joinedCommunityIds.some(
            (jid) =>
                String(jid).toLowerCase() === String(community.id).toLowerCase() ||
                (community.slug && String(jid).toLowerCase() === String(community.slug).toLowerCase())
        )
    );

    const artworkUrl = community.backdrop || community.bannerUrl || community.logo || community.avatarUrl;
    const [imageError, setImageError] = useState(false);

    const rawGame = community.gameName || (typeof community.game === "object" ? community.game?.name : undefined);
    const hasDistinctGameContext = Boolean(
        rawGame && !community.name.toLowerCase().includes(rawGame.toLowerCase())
    );

    // Format tags: eliminate "indie", strip existing '#', fallback to category if empty
    const tagsList = useMemo(() => {
        const rawTags: string[] = [];
        if (Array.isArray(community.tags)) {
            community.tags.forEach((t) => {
                if (typeof t === "string") {
                    t.split(",").forEach((sub) => {
                        const trimmed = sub.trim();
                        if (trimmed) rawTags.push(trimmed);
                    });
                }
            });
        }

        const clean = rawTags
            .map((t) => t.replace(/^#+/, "").trim())
            .filter((t) => Boolean(t) && t.toLowerCase() !== "indie");

        if (clean.length === 0 && community.category && community.category.toLowerCase() !== "indie") {
            clean.push(community.category.toLowerCase().replace(/\s+/g, ""));
        }

        return clean;
    }, [community.tags, community.category]);

    const handleCardClick = () => {
        navigate({
            to: "/community/$communityId",
            params: { communityId: String(community.id || community.slug) },
        });
    };

    const handleActionClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isJoined) {
            handleCardClick();
        } else {
            if (!user) {
                navigate({ to: "/auth" });
                return;
            }
            if (!requireVerifiedEmail("tham gia cộng đồng")) return;
            toggleJoin(community.id);
            void queryClient.invalidateQueries({ queryKey: ["communities"] });
        }
    };

    const memberCount = community.members || community.membersCount || 0;
    const onlineCount = community.onlineNow || community.onlineCount || 0;

    return (
        <div
            onClick={handleCardClick}
            className="group relative w-full flex flex-col rounded-2xl bg-surface-inner/60 hover:bg-surface-inner p-2.5 sm:p-3 cursor-pointer select-none transition-colors"
        >
            {/* 1. Artwork Layer (16:9 Aspect Ratio) - Borderless YouTube style window */}
            <div className="relative w-full aspect-[16/9] overflow-hidden rounded-xl bg-black/40">
                {artworkUrl && !imageError ? (
                    <img
                        src={artworkUrl}
                        alt=""
                        loading="lazy"
                        onError={() => setImageError(true)}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-surface-inner text-text-faint/30 select-none">
                        <Gamepad2 className="w-7 h-7 opacity-30 mb-1" />
                        <span className="text-[10px] font-mono font-medium text-text-faint/50 uppercase tracking-widest">
                            {community.category && community.category.toLowerCase() !== "indie" ? community.category : "LUDON"}
                        </span>
                    </div>
                )}

                {/* Subtle dark gradient fading artwork into card body */}
                <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

                {/* Badges Overlay (Top Right): Vibrant solid pills (No border lines) */}
                <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5">
                    {community.isLocked && (
                        <span className="font-sans text-[10px] font-bold text-white bg-rose-600 px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                            <Lock className="w-2.5 h-2.5" />
                            <span>LOCKED</span>
                        </span>
                    )}
                    {community.featured && (
                        <span className="font-sans text-[10px] font-bold text-black bg-amber-400 px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                            <Sparkles className="w-2.5 h-2.5 text-black" />
                            <span>HOT</span>
                        </span>
                    )}
                </div>
            </div>

            {/* 2. Content Body - High-contrast typography & vibrant tags (No borders) */}
            <div className="pt-2.5 px-0.5 flex flex-col justify-between flex-1 gap-2">
                <div className="flex flex-col min-w-0">
                    {hasDistinctGameContext && (
                        <span className="text-xs font-medium text-white/50 truncate pb-0.5">
                            {rawGame}
                        </span>
                    )}

                    <h3
                        className="text-sm sm:text-base font-semibold text-white group-hover:text-primary transition-colors line-clamp-1 leading-snug"
                        title={community.name}
                    >
                        {community.name}
                    </h3>

                    {/* YouTube style vibrant accent hashtags */}
                    {tagsList.length > 0 ? (
                        <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 min-h-[1.25rem] pt-1">
                            {tagsList.slice(0, 4).map((tag, idx) => (
                                <span
                                    key={`${tag}-${idx}`}
                                    className="text-xs text-sky-400 hover:text-sky-300 font-medium transition-colors"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <div className="min-h-[1.25rem]" />
                    )}
                </div>

                {/* 3. Community Metadata & Action Layer - Natural spacing without border-t line */}
                <div className="pt-2 mt-auto flex items-center justify-between gap-2 text-xs">
                    {/* Members & Online Count */}
                    <div className="flex items-center gap-1.5 min-w-0 text-xs text-white/60">
                        <span className="truncate">
                            {formatCompactNumber(memberCount)} {t("community.membersCount", { defaultValue: "thành viên" })}
                        </span>
                        <span className="text-white/30">•</span>
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-medium shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                            <span>
                                {formatCompactNumber(onlineCount)} {t("community.onlineCount", { defaultValue: "online" })}
                            </span>
                        </span>
                    </div>

                    {/* Facebook / YouTube Style Action Button (Zero border) */}
                    <div className="shrink-0">
                        {isJoined ? (
                            <button
                                type="button"
                                onClick={handleActionClick}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-white/10 hover:bg-white/15 rounded-full cursor-pointer transition-colors"
                                title={t("community.joinedBadge", { defaultValue: "Đã tham gia" })}
                            >
                                <Check className="w-3.5 h-3.5" />
                                <span>{t("community.joinedButton", { defaultValue: "Đã tham gia" })}</span>
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleActionClick}
                                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-full cursor-pointer shadow-sm transition-colors"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>{t("community.join", { defaultValue: "Tham gia" })}</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
