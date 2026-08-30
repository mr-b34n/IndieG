import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowRight,
    faCircle,
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
}

export const CommunityHubRightRail = ({
    communityName,
    description,
    officialWebsiteUrl = "https://raft-game.com",
    steamStoreUrl = "https://store.steampowered.com",
    membersCount,
    onlineCount,
    contributors,
    nextEvent,
    onNavigateNav,
    isVi,
}: CommunityHubRightRailProps) => {
    const { t } = useTranslation();

    return (
        <aside className="w-full flex flex-col gap-6 text-text select-none py-1">
            {/* 1. ABOUT MODULE */}
            <div className="flex flex-col gap-2 pb-5 border-b border-divider-primary/40">
                <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-text-faint">
                    ABOUT
                </span>

                <p className="text-xs text-text-muted leading-relaxed line-clamp-3">
                    {description || `Farm layouts, mods & community discussions for ${communityName}.`}
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

                {/* Concise Links: Website · Steam */}
                <div className="flex items-center gap-2 text-xs font-medium pt-1 text-primary">
                    <a
                        href={officialWebsiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline transition-colors"
                    >
                        Website
                    </a>
                    <span className="text-divider-primary font-normal">·</span>
                    <a
                        href={steamStoreUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline transition-colors"
                    >
                        Steam
                    </a>
                </div>
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
