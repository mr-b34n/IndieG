import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowRight,
    faCircle,
    faArrowUpRightFromSquare,
    faGamepad,
    faStar,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "@/shared/hooks/useTranslate";
import { formatCompactNumber } from "../../constants";

export interface ContributorItem {
    id: string;
    name: string;
    handle: string;
    avatar: string;
    points: number;
    role?: "admin" | "moderator" | "member";
}

export interface UpcomingEventTimelineItem {
    id: string;
    title: string;
    dateMonth: string;
    time: string;
    attendees: number;
}

interface CommunityHubRightRailProps {
    communityName: string;
    description: string;
    officialWebsiteUrl?: string;
    steamStoreUrl?: string;
    membersCount: number;
    onlineCount: number;
    contributors: ContributorItem[];
    nextEvent?: UpcomingEventTimelineItem;
    onNavigateNav: (navId: string) => void;
    isVi: boolean;
    isManageView?: boolean;
    userRole?: "owner" | "admin" | "moderator" | "member";
    pendingCount?: number;
    reportsCount?: number;
    modsCount?: number;
    gameSlug?: string;
    gameName?: string;
    gameData?: {
        name: string;
        slug: string;
        logoUrl?: string;
        bannerUrl?: string;
        developer?: string;
        rating?: number;
        price?: string;
        activePlayers?: number;
    };
}

export const CommunityHubRightRail = ({
    communityName,
    description,
    membersCount,
    onlineCount,
    contributors,
    onNavigateNav,
    isVi,
    isManageView,
    userRole,
    pendingCount,
    reportsCount,
    modsCount,
    gameSlug,
    gameName,
    gameData,
}: CommunityHubRightRailProps) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const isAdminOrMod = userRole === "owner" || userRole === "admin" || userRole === "moderator";

    if (isManageView && isAdminOrMod) {
        return (
            <div className="flex flex-col gap-5 text-text animate-fade-in font-sans">
                {/* 1. COMMUNITY STATUS */}
                <div className="flex flex-col gap-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-text">
                        {isVi ? "Trạng thái cộng đồng" : "Community Status"}
                    </h3>
                    <div className="bg-surface-inner/40 rounded-[6px] border border-divider-primary/40 p-3 flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-text-muted">{isVi ? "Thành viên" : "Members"}</span>
                            <span className="text-sm font-bold text-text">{formatCompactNumber(membersCount)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-text-muted">{isVi ? "Đang online" : "Online now"}</span>
                            <span className="text-sm font-bold text-green-500">{formatCompactNumber(onlineCount)}</span>
                        </div>
                    </div>
                </div>

                {/* 2. MODERATION SUMMARY */}
                <div className="flex flex-col gap-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-text">
                        {isVi ? "Tình trạng kiểm duyệt" : "Moderation"}
                    </h3>
                    <div className="bg-surface-inner/40 rounded-[6px] border border-divider-primary/40 p-3 flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-text-muted">{isVi ? "Báo cáo chờ" : "Pending reports"}</span>
                            <span className={`text-sm font-bold ${(reportsCount || 0) > 0 ? "text-rose-500" : "text-text"}`}>{reportsCount || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-text-muted">{isVi ? "Yêu cầu tham gia" : "Pending requests"}</span>
                            <span className={`text-sm font-bold ${(pendingCount || 0) > 0 ? "text-amber-500" : "text-text"}`}>{pendingCount || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-text-muted">{isVi ? "Điều hành viên" : "Moderators"}</span>
                            <span className="text-sm font-bold text-text">{modsCount || 0}</span>
                        </div>
                    </div>
                </div>

                {/* 3. QUICK LINKS */}
                <div className="flex flex-col gap-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-text">
                        {isVi ? "Liên kết nhanh" : "Quick Links"}
                    </h3>
                    <div className="flex flex-col gap-1">
                        <button
                            type="button"
                            onClick={() => onNavigateNav("manage-rules")}
                            className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-text-muted hover:text-text hover:bg-surface-hover/60 rounded-[4px] transition-colors cursor-pointer"
                        >
                            <span>{isVi ? "Quy tắc cộng đồng" : "Community Rules"}</span>
                            <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
                        </button>
                        {(userRole === "owner" || userRole === "admin") && (
                            <button
                                type="button"
                                onClick={() => onNavigateNav("manage-settings")}
                                className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-text-muted hover:text-text hover:bg-surface-hover/60 rounded-[4px] transition-colors cursor-pointer"
                            >
                                <span>{isVi ? "Cài đặt cộng đồng" : "Community Settings"}</span>
                                <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => onNavigateNav("manage-moderation")}
                            className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-text-muted hover:text-text hover:bg-surface-hover/60 rounded-[4px] transition-colors cursor-pointer"
                        >
                            <span>{isVi ? "Lịch sử kiểm duyệt" : "Audit Log"}</span>
                            <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }


    const defaultRules = [
        { num: "01", text: t('hub.communityhubrightrail_36') },
        { num: "02", text: t('hub.communityhubrightrail_37') },
        { num: "03", text: t('hub.communityhubrightrail_38') },
    ];

    const communityLinks = [
        { label: "Discord Server", href: "https://discord.gg/indieg", tag: "Chat & Voice" },
        { label: "Steam Community", href: "https://steamcommunity.com", tag: "Group" },
        { label: "Facebook Group", href: "https://facebook.com", tag: "Community" },
    ];

    return (
        <aside className="w-full flex flex-col gap-5 text-text select-none py-1">
            {/* 0. INDIEG GAME HUB WIDGET (Direct Link to IndieG Game Page) */}
            {gameSlug && (
                <div className="flex flex-col gap-2 pb-4 border-b border-border/40">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-brand-400 flex items-center gap-1.5">
                        <FontAwesomeIcon icon={faGamepad} className="text-[10px]" />
                        <span>INDIEG GAME HUB</span>
                    </span>

                    <div
                        onClick={() => navigate({ to: `/game/${gameSlug}` as string })}
                        className="p-3 rounded-[6px] bg-surface-inner/80 hover:bg-surface-hover/90 border border-brand-500/30 hover:border-brand-500/50 transition-all cursor-pointer group flex flex-col gap-2.5 shadow-xs"
                    >
                        <div className="flex items-center gap-2.5 min-w-0">
                            {gameData?.logoUrl ? (
                                <img
                                    src={gameData.logoUrl}
                                    alt={gameData.name || gameName || "Game"}
                                    className="w-10 h-10 rounded-[6px] object-cover bg-surface border border-border shrink-0 shadow-xs"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-[6px] bg-brand-500/20 text-brand-400 flex items-center justify-center shrink-0">
                                    <FontAwesomeIcon icon={faGamepad} className="text-lg" />
                                </div>
                            )}
                            <div className="flex flex-col min-w-0 flex-1 leading-tight">
                                <h4 className="text-xs font-bold text-text group-hover:text-brand-400 transition-colors truncate">
                                    {gameData?.name || gameName || communityName}
                                </h4>
                                <span className="text-[10px] text-text-muted truncate mt-0.5">
                                    {gameData?.developer || "IndieG Store"}
                                </span>
                                {gameData?.rating && (
                                    <div className="flex items-center gap-1 text-[10px] font-mono text-amber-400 mt-1">
                                        <FontAwesomeIcon icon={faStar} className="text-[8px]" />
                                        <span>{gameData.rating}</span>
                                        {gameData.activePlayers && (
                                            <>
                                                <span className="text-text-faint">•</span>
                                                <span className="text-emerald-400 font-sans">
                                                    {formatCompactNumber(gameData.activePlayers)} {isVi ? "đang chơi" : "players"}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-1.5 border-t border-border/30 text-xs font-bold text-brand-400 group-hover:underline">
                            <span className="text-[11px]">{isVi ? "Xem trang game trên IndieG" : "View on IndieG"}</span>
                            <FontAwesomeIcon icon={faArrowRight} className="text-[9px] group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </div>
            )}

            {/* 1. ABOUT SECTION */}
            <div className="flex flex-col gap-2 pb-4 border-b border-border/40">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-faint">
                    ABOUT
                </span>

                <p className="text-xs text-text-muted leading-relaxed line-clamp-3">
                    {description || (isVi ? `Không gian sinh hoạt, trao đổi kinh nghiệm và mẹo chiến thuật cho game thủ ${communityName}.` : `Official gaming space and discussion forum for ${communityName}.`)}
                </p>

                <div className="flex items-center gap-2 text-xs font-mono font-medium text-text-muted pt-1">
                    <span className="text-text font-bold">
                        {formatCompactNumber(membersCount)}{" "}
                        <span className="text-text-muted font-sans font-normal text-[11px]">
                            {t('community.membersLabel', { defaultValue: 'members' })}
                        </span>
                    </span>
                    <span className="text-text-faint font-normal">•</span>
                    <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                        <FontAwesomeIcon icon={faCircle} className="text-[5px] animate-pulse" />
                        {formatCompactNumber(onlineCount)}{" "}
                        <span className="text-text-muted font-sans font-normal text-[11px]">
                            {t('community.onlineLabel', { defaultValue: 'online' })}
                        </span>
                    </span>
                </div>
            </div>

            {/* 2. RULES SECTION */}
            <div className="flex flex-col gap-2 pb-4 border-b border-border/40">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-faint">
                        RULES
                    </span>
                    <button
                        type="button"
                        onClick={() => onNavigateNav("rules")}
                        className="text-[11px] font-mono font-bold text-primary hover:underline cursor-pointer flex items-center gap-1"
                    >
                        <span>{t('hub.communityhubrightrail_39')}</span>
                        <FontAwesomeIcon icon={faArrowRight} className="text-[9px]" />
                    </button>
                </div>

                <div className="flex flex-col gap-2 pt-0.5">
                    {defaultRules.map((rule) => (
                        <div key={rule.num} className="flex items-start gap-2.5 text-xs">
                            <span className="text-[10px] font-mono font-black text-text-faint shrink-0 pt-0.5">
                                {rule.num}
                            </span>
                            <span className="text-text-muted leading-snug line-clamp-2">
                                {rule.text}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* 3. COMMUNITY LINKS */}
            <div className="flex flex-col gap-2 pb-4 border-b border-border/40">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-faint">
                    COMMUNITY LINKS
                </span>

                <div className="flex flex-col gap-1.5 pt-0.5">
                    {/* Direct link to IndieG Game Page inside Community Links */}
                    {gameSlug && (
                        <button
                            type="button"
                            onClick={() => navigate({ to: `/game/${gameSlug}` as string })}
                            className="w-full flex items-center justify-between p-2 rounded-[6px] bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/30 transition-colors group cursor-pointer text-left"
                        >
                            <span className="text-xs font-semibold text-brand-400 group-hover:text-brand-300 transition-colors flex items-center gap-1.5">
                                <FontAwesomeIcon icon={faGamepad} className="text-[11px]" />
                                <span>{isVi ? "Trang Game trên IndieG" : "IndieG Game Page"}</span>
                            </span>
                            <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-mono text-brand-400/80 font-bold">
                                    IndieG Hub
                                </span>
                                <FontAwesomeIcon icon={faArrowRight} className="text-[9px] text-brand-400" />
                            </div>
                        </button>
                    )}

                    {communityLinks.map((link) => (
                        <a
                            key={link.label}
                            href={link.href}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-between p-2 rounded-[6px] bg-surface-inner/60 hover:bg-surface-hover/80 border border-border/40 transition-colors group cursor-pointer"
                        >
                            <span className="text-xs font-semibold text-text group-hover:text-primary transition-colors">
                                {link.label}
                            </span>
                            <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-mono text-text-faint">
                                    {link.tag}
                                </span>
                                <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-[9px] text-text-faint group-hover:text-primary" />
                            </div>
                        </a>
                    ))}
                </div>
            </div>

            {/* 4. TOP CONTRIBUTORS */}
            {contributors && contributors.length > 0 && (
                <div className="flex flex-col gap-2 pb-2">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-faint">
                            TOP CONTRIBUTORS
                        </span>
                        <button
                            type="button"
                            onClick={() => onNavigateNav("members")}
                            className="text-[11px] font-mono font-bold text-primary hover:underline cursor-pointer flex items-center gap-1"
                        >
                            <span>{t('hub.communityhubrightrail_40')}</span>
                            <FontAwesomeIcon icon={faArrowRight} className="text-[9px]" />
                        </button>
                    </div>

                    <div className="flex flex-col gap-1.5 pt-0.5">
                        {contributors.slice(0, 4).map((c) => (
                            <div
                                key={c.id}
                                className="flex items-center gap-2.5 p-1.5 rounded-[6px] hover:bg-surface-hover/60 transition-colors cursor-pointer group"
                                onClick={() => onNavigateNav("members")}
                            >
                                <img
                                    src={c.avatar}
                                    alt={c.name}
                                    className="w-7 h-7 rounded-full object-cover ring-1 ring-border shrink-0"
                                    onError={(e) => {
                                        (e.currentTarget as HTMLImageElement).style.display = "none";
                                    }}
                                />
                                <div className="flex flex-col min-w-0 flex-1 leading-tight">
                                    <p className="text-xs font-bold text-text truncate group-hover:text-primary transition-colors">
                                        {c.name}
                                    </p>
                                    <p className="text-[10px] font-mono text-text-faint truncate">
                                        {c.handle}
                                    </p>
                                </div>
                                <span className="text-[10px] font-mono text-emerald-400 font-bold shrink-0">
                                    {c.points} pts
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </aside>
    );
};
