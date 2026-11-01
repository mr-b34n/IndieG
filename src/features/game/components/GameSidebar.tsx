import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faExternalLinkAlt,
    faCheck,
    faCalendarAlt,
    faCode,
    faGamepad,
} from "@fortawesome/free-solid-svg-icons";
import {
    faWindows,
    faApple,
    faLinux,
    faPlaystation,
    faXbox,
} from "@fortawesome/free-brands-svg-icons";
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

const getPlatformIcon = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes("win") || p.includes("pc")) {
        return { icon: faWindows, title: "Windows", colorClass: "text-[#00adef]" };
    }
    if (p.includes("mac") || p.includes("apple") || p.includes("osx")) {
        return { icon: faApple, title: "macOS", colorClass: "text-zinc-200" };
    }
    if (p.includes("linux")) {
        return { icon: faLinux, title: "Linux", colorClass: "text-[#fcc624]" };
    }
    if (p.includes("ps") || p.includes("playstation")) {
        return { icon: faPlaystation, title: "PlayStation", colorClass: "text-[#0070d1]" };
    }
    if (p.includes("xbox")) {
        return { icon: faXbox, title: "Xbox", colorClass: "text-[#107c10]" };
    }
    return null;
};

export const GameSidebar: React.FC<GameSidebarProps> = ({
    game,
    community,
    isCommunityJoined,
    onCommunityAction,
}) => {
    const { lang } = useTranslation();
    const isVietnamese = lang === "vi";
    const navigate = useNavigate();

    const isFree = game.isFree;
    const categoriesList = game.categories || [];

    return (
        <aside className="w-full lg:w-80 shrink-0 flex flex-col gap-6 text-sm">
            {/* 1. LUDON COMMUNITY WIDGET CARD */}
            {community && (
                <div className="p-4 rounded-md bg-surface/40 border border-border/20 flex flex-col gap-3">
                    <span className="text-xs font-bold tracking-wider uppercase text-text-muted">
                        {isVietnamese ? "Cộng đồng trò chơi" : "Game Community"}
                    </span>

                    <div className="flex items-center gap-3">
                        <img
                            src={community.logo || community.avatarUrl || game.logoUrl}
                            alt={community.name}
                            className="w-10 h-10 rounded-md object-cover bg-surface ring-1 ring-border/20 shrink-0"
                        />
                        <div className="flex flex-col min-w-0">
                            <h4
                                onClick={() => navigate({ to: "/community/$communityId", params: { communityId: String(community.id) } })}
                                className="font-bold text-text hover:text-primary transition-colors truncate cursor-pointer text-sm"
                                title={community.name}
                            >
                                {community.name}
                            </h4>
                            <span className="text-xs text-text-muted mt-0.5">
                                {formatCompactNumber(community.members || community.membersCount || 0)}{" "}
                                {isVietnamese ? "thành viên" : "members"}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                        <button
                            type="button"
                            onClick={onCommunityAction}
                            className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 ${
                                isCommunityJoined
                                    ? "bg-surface-hover text-emerald-400 border border-emerald-500/25"
                                    : "bg-primary text-white hover:bg-primary-hover shadow-primary/10"
                            }`}
                        >
                            {isCommunityJoined && <FontAwesomeIcon icon={faCheck} className="text-xs" />}
                            <span>
                                {isCommunityJoined
                                    ? (isVietnamese ? "Đã tham gia" : "Joined")
                                    : (isVietnamese ? "Tham gia cộng đồng" : "Join Community")}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate({ to: "/community/$communityId", params: { communityId: String(community.id) } })}
                            className="px-2.5 py-1.5 rounded-md text-xs font-medium text-text-muted hover:text-text bg-surface hover:bg-surface-hover border border-border/30 transition-all cursor-pointer active:scale-95"
                            title={isVietnamese ? "Mở diễn đàn" : "Open Hub"}
                        >
                            <FontAwesomeIcon icon={faExternalLinkAlt} />
                        </button>
                    </div>
                </div>
            )}

            {/* 2. GAME DETAILS CARD (Simplified title, restrained radius & border, achievements/appid/distribution removed) */}
            <div className="p-4 rounded-md bg-surface/35 border border-border/20 flex flex-col gap-3">
                <h3 className="text-xs font-bold tracking-wider uppercase text-text-muted">
                    {isVietnamese ? "Thông tin game" : "Game Details"}
                </h3>

                <div className="flex flex-col divide-y divide-border/15 text-xs">
                    {/* Developer */}
                    {game.developer && (
                        <div className="py-2 flex justify-between items-baseline gap-3 first:pt-0">
                            <span className="text-text-muted flex items-center gap-2 shrink-0">
                                <FontAwesomeIcon icon={faCode} className="text-[11px] text-text-muted/60" />
                                <span>{isVietnamese ? "Nhà phát triển" : "Developer"}</span>
                            </span>
                            <span className="text-text font-medium text-right break-words">{game.developer}</span>
                        </div>
                    )}

                    {/* Publisher */}
                    {game.publisher && (
                        <div className="py-2 flex justify-between items-baseline gap-3">
                            <span className="text-text-muted flex items-center gap-2 shrink-0">
                                <FontAwesomeIcon icon={faGamepad} className="text-[11px] text-text-muted/60" />
                                <span>{isVietnamese ? "Nhà phát hành" : "Publisher"}</span>
                            </span>
                            <span className="text-text font-medium text-right break-words">{game.publisher}</span>
                        </div>
                    )}

                    {/* Release Date */}
                    {game.releaseDate && (
                        <div className="py-2 flex justify-between items-baseline gap-3">
                            <span className="text-text-muted flex items-center gap-2 shrink-0">
                                <FontAwesomeIcon icon={faCalendarAlt} className="text-[11px] text-text-muted/60" />
                                <span>{isVietnamese ? "Ngày phát hành" : "Release Date"}</span>
                            </span>
                            <div className="flex items-center gap-1.5 text-right">
                                <span className="text-text font-medium">{game.releaseDate}</span>
                                {game.releaseDateComingSoon && (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-500/15 text-blue-400">
                                        {isVietnamese ? "Sắp ra" : "Soon"}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Price */}
                    <div className="py-2 flex justify-between items-baseline gap-3">
                        <span className="text-text-muted">{isVietnamese ? "Giá" : "Price"}</span>
                        <span className="text-text font-medium text-right">
                            {isFree
                                ? (isVietnamese ? "Miễn phí (Free to Play)" : "Free to Play")
                                : (isVietnamese ? "Có phí (Paid)" : "Paid")}
                        </span>
                    </div>

                    {/* Supported Platforms */}
                    {game.platforms && game.platforms.length > 0 && (
                        <div className="py-2 flex justify-between items-center gap-3 last:pb-0">
                            <span className="text-text-muted">{isVietnamese ? "Nền tảng hỗ trợ" : "Platforms"}</span>
                            <div className="flex items-center gap-2">
                                {game.platforms.map((platform) => {
                                    const info = getPlatformIcon(platform);
                                    return info ? (
                                        <span
                                            key={platform}
                                            title={info.title}
                                            className={`text-sm cursor-default ${info.colorClass}`}
                                        >
                                            <FontAwesomeIcon icon={info.icon} />
                                        </span>
                                    ) : (
                                        <span
                                            key={platform}
                                            className="text-xs text-text font-medium"
                                        >
                                            {platform}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 3. FEATURES CARD (Simplified title, restrained radius & border, icon removed) */}
            {categoriesList.length > 0 && (
                <div className="p-4 rounded-md bg-surface/35 border border-border/20 flex flex-col gap-3">
                    <h3 className="text-xs font-bold tracking-wider uppercase text-text-muted">
                        {isVietnamese ? "Tính năng" : "Features"}
                    </h3>

                    <div className="flex flex-wrap gap-1.5">
                        {categoriesList.map((cat) => (
                            <span
                                key={cat.id}
                                className="px-2.5 py-1 rounded text-xs font-medium bg-surface/60 text-text-muted border border-border/20 cursor-default"
                            >
                                {cat.description}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </aside>
    );
};
