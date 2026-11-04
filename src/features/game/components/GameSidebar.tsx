import React from "react";
import {
    Check,
    ExternalLink,
    Users,
    CheckCircle2,
    Layers,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "@/shared/hooks/useTranslate";
import { type GameData } from "../types";
import { type CommunityData } from "@/features/community/types";
import { formatCompactNumber } from "@/features/community/constants";

interface GameSidebarProps {
    game: GameData;
    community?: CommunityData | null;
    isCommunityJoined: boolean;
    onCommunityAction: () => void;
}

export const GameSidebar: React.FC<GameSidebarProps> = ({
    game,
    community,
    isCommunityJoined,
    onCommunityAction,
}) => {
    const { lang } = useTranslation();
    const isVietnamese = lang === "vi";
    const navigate = useNavigate();

    const categoriesList = game.categories || [];

    return (
        <aside className="w-full lg:w-80 shrink-0 flex flex-col gap-5 text-sm self-start">
            {/* 1. COMMUNITY WIDGET CARD */}
            {community && (
                <div className="p-4 rounded-xl bg-surface/40 border border-border/30 flex flex-col gap-3.5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold tracking-wider uppercase text-text-muted flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-primary" />
                            <span>{isVietnamese ? "Cộng đồng trò chơi" : "Game Hub"}</span>
                        </span>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[11px] text-emerald-400 font-medium">
                                {isVietnamese ? "Đang hoạt động" : "Active"}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <img
                            src={community.logo || community.avatarUrl || game.logoUrl}
                            alt={community.name}
                            className="w-11 h-11 rounded-lg object-cover bg-surface ring-1 ring-border/30 shrink-0"
                        />
                        <div className="flex flex-col min-w-0 flex-1">
                            <h4
                                onClick={() => navigate({ to: "/community/$communityId", params: { communityId: String(community.id) } })}
                                className="font-bold text-text hover:text-primary transition-colors truncate cursor-pointer text-sm"
                                title={community.name}
                            >
                                {community.name}
                            </h4>
                            <span className="text-xs text-text-muted mt-0.5">
                                {formatCompactNumber(community.members || community.membersCount || 0)}{" "}
                                {isVietnamese ? "thành viên tham gia" : "members"}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 pt-0.5">
                        <button
                            type="button"
                            onClick={onCommunityAction}
                            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 ${
                                isCommunityJoined
                                    ? "bg-surface-hover text-emerald-400 border border-emerald-500/25"
                                    : "bg-primary text-white hover:bg-primary-hover shadow-primary/10"
                            }`}
                        >
                            {isCommunityJoined ? (
                                <Check className="w-3.5 h-3.5" />
                            ) : (
                                <Users className="w-3.5 h-3.5" />
                            )}
                            <span>
                                {isCommunityJoined
                                    ? (isVietnamese ? "Đã tham gia" : "Joined")
                                    : (isVietnamese ? "Tham gia cộng đồng" : "Join Hub")}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate({ to: "/community/$communityId", params: { communityId: String(community.id) } })}
                            className="p-2 rounded-lg text-xs font-medium text-text-muted hover:text-text bg-surface hover:bg-surface-hover border border-border/30 transition-all cursor-pointer active:scale-95"
                            title={isVietnamese ? "Mở diễn đàn" : "Open Hub"}
                        >
                            <ExternalLink className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* 2. INCLUDES / FEATURES CARD (Replaces the old Game Details position) */}
            {categoriesList.length > 0 && (
                <div className="p-4 rounded-xl bg-surface/40 border border-border/30 flex flex-col gap-3.5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold tracking-wider uppercase text-text-muted flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-primary" />
                            <span>{isVietnamese ? "Bao gồm (Includes)" : "Includes"}</span>
                        </span>
                        <span className="text-xs font-mono text-text-muted">
                            {categoriesList.length}
                        </span>
                    </div>

                    <div className="flex flex-col divide-y divide-border/20 text-xs">
                        {categoriesList.map((cat) => (
                            <div
                                key={cat.id}
                                className="py-2.5 flex items-center gap-2.5 first:pt-0 last:pb-0 text-text-muted hover:text-text transition-colors"
                            >
                                <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                                <span className="font-medium">{cat.description}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </aside>
    );
};
