import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowRight,
    faCircle,
    faShieldHalved,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "@/shared/hooks/useTranslate";
import { formatCompactNumber } from "../../constants";

export interface ContributorItem {
    id: string;
    name: string;
    handle: string;
    avatar: string;
    points: number;
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
    userRole?: "owner" | "admin" | "moderator" | "member";
    pendingCount?: number;
    reportsCount?: number;
    modsCount?: number;
}

export const CommunityHubRightRail = ({
    communityName,
    description,
    officialWebsiteUrl,
    steamStoreUrl,
    membersCount,
    onlineCount,
    contributors,
    nextEvent,
    onNavigateNav,
    isVi,
    userRole = "owner",
    pendingCount = 0,
    reportsCount = 0,
    modsCount = 1,
}: CommunityHubRightRailProps) => {
    const { t } = useTranslation();
    const hasManagePermission = userRole === "owner" || userRole === "admin" || userRole === "moderator";

    return (
        <aside className="w-full flex flex-col gap-6 text-text select-none py-1">
            {/* COMMUNITY STATUS MODULE (Compact, for Admin / Moderator) */}
            {hasManagePermission && (
                <div className="flex flex-col gap-2.5 p-3 rounded-[6px] bg-surface-inner/80 border border-divider-primary/60 text-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-text-faint flex items-center gap-1.5">
                            <FontAwesomeIcon icon={faShieldHalved} className="text-[10px] text-primary" />
                            <span>COMMUNITY STATUS</span>
                        </span>
                        <span className="flex items-center gap-1 text-emerald-400 font-mono text-[11px] font-bold">
                            <FontAwesomeIcon icon={faCircle} className="text-[5px] animate-pulse" />
                            <span>Active · Healthy</span>
                        </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 py-0.5 text-center font-mono">
                        <div
                            onClick={() => onNavigateNav("manage-moderation")}
                            className="p-1.5 rounded bg-surface border border-divider-primary/40 hover:border-divider-primary cursor-pointer transition-colors"
                        >
                            <span className="text-sm font-bold text-amber-400 block">{pendingCount}</span>
                            <span className="text-[9px] text-text-faint uppercase block truncate">Pending</span>
                        </div>
                        <div
                            onClick={() => onNavigateNav("manage-reports")}
                            className="p-1.5 rounded bg-surface border border-divider-primary/40 hover:border-divider-primary cursor-pointer transition-colors"
                        >
                            <span className="text-sm font-bold text-rose-400 block">{reportsCount}</span>
                            <span className="text-[9px] text-text-faint uppercase block truncate">Reports</span>
                        </div>
                        <div
                            onClick={() => onNavigateNav("manage-members")}
                            className="p-1.5 rounded bg-surface border border-divider-primary/40 hover:border-divider-primary cursor-pointer transition-colors"
                        >
                            <span className="text-sm font-bold text-primary block">{modsCount}</span>
                            <span className="text-[9px] text-text-faint uppercase block truncate">Mods</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => onNavigateNav("manage-overview")}
                        className="w-full py-1.5 rounded-[4px] bg-surface-hover hover:bg-surface border border-divider-primary text-xs font-semibold text-text flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                        <span>{isVi ? "Quản lý" : "Manage"}</span>
                        <FontAwesomeIcon icon={faArrowRight} className="text-[9px] text-text-faint" />
                    </button>
                </div>
            )}

            {/* 1. ABOUT MODULE */}
            <div className="flex flex-col gap-2 pb-5 border-b border-divider-primary/40">
                <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-text-faint">
                    ABOUT
                </span>

                <p className="text-xs text-text-muted leading-relaxed line-clamp-3">
                    {description || (isVi ? `Thảo luận, chia sẻ kinh nghiệm và hướng dẫn cho cộng đồng ${communityName}.` : `Discussions, guides and tips for ${communityName}.`)}
                </p>

                {/* Compact Status */}
                <div className="flex items-center gap-2 text-xs font-mono font-medium text-text-muted pt-1">
                    <span className="text-text font-bold">
                        {formatCompactNumber(membersCount)}{" "}
                        <span className="text-text-muted font-sans font-normal text-[11px]">
                            {t('community.membersLabel', { defaultValue: 'members' })}
                        </span>
                    </span>
                    <span className="text-divider-primary font-normal">·</span>
                    <span className="flex items-center gap-1 text-emerald-500 font-bold">
                        <FontAwesomeIcon icon={faCircle} className="text-[5px] animate-pulse" />
                        {formatCompactNumber(onlineCount)}{" "}
                        <span className="text-text-muted font-sans font-normal text-[11px]">
                            {t('community.onlineLabel', { defaultValue: 'online' })}
                        </span>
                    </span>
                </div>

                {/* Optional Links: Website · Steam */}
                {(officialWebsiteUrl || steamStoreUrl) && (
                    <div className="flex items-center gap-2 text-xs font-medium pt-1 text-primary">
                        {officialWebsiteUrl && (
                            <a
                                href={officialWebsiteUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="hover:underline transition-colors"
                            >
                                Website
                            </a>
                        )}
                        {officialWebsiteUrl && steamStoreUrl && (
                            <span className="text-divider-primary font-normal">·</span>
                        )}
                        {steamStoreUrl && (
                            <a
                                href={steamStoreUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="hover:underline transition-colors"
                            >
                                Steam
                            </a>
                        )}
                    </div>
                )}
            </div>

            {/* 2. COMMUNITY DESTINATIONS MODULE */}
            <div className="flex flex-col gap-2.5 pb-5 border-b border-divider-primary/40">
                <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-text-faint">
                    COMMUNITY
                </span>

                {/* Subtle Avatar Stack */}
                {contributors && contributors.length > 0 && (
                    <div className="flex items-center gap-2.5 pt-0.5">
                        <div className="flex -space-x-1.5 overflow-hidden">
                            {contributors.slice(0, 4).map((c) => (
                                <img
                                    key={c.id}
                                    src={c.avatar}
                                    alt={c.name}
                                    className="inline-block h-6 w-6 rounded-full ring-2 ring-surface object-cover"
                                />
                            ))}
                        </div>
                        <span className="text-[11px] font-mono text-text-muted">
                            +{formatCompactNumber(membersCount)} {isVi ? "thành viên" : "members"}
                        </span>
                    </div>
                )}

                <div className="flex flex-col gap-1.5 pt-1 text-xs font-semibold">
                    <button
                        type="button"
                        onClick={() => onNavigateNav("members")}
                        className="flex items-center justify-between text-text-muted hover:text-primary transition-colors cursor-pointer py-0.5 text-left"
                    >
                        <span>{isVi ? "Thành viên" : "Members"}</span>
                        <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
                    </button>

                    <button
                        type="button"
                        onClick={() => onNavigateNav("leaderboard")}
                        className="flex items-center justify-between text-text-muted hover:text-primary transition-colors cursor-pointer py-0.5 text-left"
                    >
                        <span>{isVi ? "Bảng xếp hạng" : "Leaderboard"}</span>
                        <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
                    </button>
                </div>
            </div>

            {/* 3. UP NEXT MODULE (Single Event, only if available) */}
            {nextEvent && (
                <div className="flex flex-col gap-2.5">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-text-faint">
                        UP NEXT
                    </span>

                    <div className="flex items-start gap-3 pt-1">
                        {/* Event Date Block */}
                        <div className="px-2 py-1 rounded-[4px] bg-surface-inner border border-divider-primary/50 text-center font-mono shrink-0">
                            <span className="text-[10px] font-bold text-primary block leading-none uppercase">
                                {nextEvent.dateMonth.split(" ")[0] || "MAR"}
                            </span>
                            <span className="text-sm font-black text-text block leading-tight mt-0.5">
                                {nextEvent.dateMonth.split(" ")[1] || "22"}
                            </span>
                        </div>

                        <div className="flex flex-col min-w-0 flex-1">
                            <h4 className="font-bold text-xs text-text leading-snug truncate">
                                {nextEvent.title}
                            </h4>
                            <button
                                type="button"
                                onClick={() => onNavigateNav("events")}
                                className="text-[11px] font-mono text-primary hover:underline flex items-center gap-1 mt-1 cursor-pointer"
                            >
                                <span>{nextEvent.attendees} {isVi ? "tham gia" : "attending"}</span>
                                <FontAwesomeIcon icon={faArrowRight} className="text-[9px]" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
};
