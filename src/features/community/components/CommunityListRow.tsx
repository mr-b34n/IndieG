import React, { useState, useMemo } from "react";
import { Lock, Sparkles, Check, Plus, Gamepad2 } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import type { CommunityData } from "../types";
import { formatCompactNumber } from "../constants";
import { useCommunitiesStore } from "../store/useCommunitiesStore";
import { useAuthStore } from "@/features/auth";
import { useTranslation } from "@/shared/hooks/useTranslate";

interface CommunityListRowProps {
    community: CommunityData;
}

export const CommunityListRow: React.FC<CommunityListRowProps> = ({ community }) => {
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

    const logoUrl = community.logo || community.avatarUrl || community.backdrop || community.bannerUrl;
    const [logoError, setLogoError] = useState(false);

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
            className="group w-full flex items-center justify-between gap-3 p-3 rounded-xl bg-surface-inner/60 hover:bg-surface-inner cursor-pointer select-none transition-colors"
        >
            {/* Left: Thumbnail + Details */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Thumbnail */}
                <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-black/40 flex items-center justify-center">
                        {logoUrl && !logoError ? (
                            <img
                                src={logoUrl}
                                alt={community.name}
                                onError={() => setLogoError(true)}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <Gamepad2 className="w-5 h-5 text-text-faint/50" />
                        )}
                    </div>
                </div>

                {/* Info Column */}
                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                        <h3 className="text-sm font-semibold text-white group-hover:text-primary transition-colors truncate">
                            {community.name}
                        </h3>

                        {community.featured && (
                            <span className="font-sans text-[10px] font-bold text-black bg-amber-400 px-2 py-0.5 rounded-md flex items-center gap-0.5 shadow-sm">
                                <Sparkles className="w-2.5 h-2.5 text-black" />
                                HOT
                            </span>
                        )}

                        {community.isLocked && (
                            <span className="font-sans text-[10px] font-bold text-white bg-rose-600 px-2 py-0.5 rounded-md flex items-center gap-0.5 shadow-sm">
                                <Lock className="w-2.5 h-2.5" />
                                LOCKED
                            </span>
                        )}
                    </div>

                    {/* YouTube style vibrant accent hashtags */}
                    {tagsList.length > 0 && (
                        <div className="hidden sm:flex items-center gap-2 flex-wrap pt-0.5">
                            {tagsList.slice(0, 4).map((tag, idx) => (
                                <span
                                    key={`${tag}-${idx}`}
                                    className="text-xs text-sky-400 hover:text-sky-300 font-medium transition-colors"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Stats & Action */}
            <div className="flex items-center gap-3 shrink-0">
                <div className="hidden md:flex flex-col items-end text-xs leading-tight">
                    <span className="text-white font-medium">
                        {formatCompactNumber(memberCount)} <span className="text-white/50 text-[11px]">{t("community.membersCount", { defaultValue: "thành viên" })}</span>
                    </span>
                    <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>{formatCompactNumber(onlineCount)} {t("community.onlineCount", { defaultValue: "online" })}</span>
                    </span>
                </div>

                <div className="shrink-0">
                    {isJoined ? (
                        <button
                            type="button"
                            onClick={handleActionClick}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-white/10 hover:bg-white/15 rounded-full cursor-pointer transition-colors"
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
    );
};
