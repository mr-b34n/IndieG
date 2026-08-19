import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faGlobe,
    faGamepad,
    faCircle,
    faMessage,
    faArrowRight,
} from "@fortawesome/free-solid-svg-icons";

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
    tags?: string[];
    onlineCount: number;
    contributors: ContributorItem[];
    events: UpcomingEventTimelineItem[];
    onOpenChat: () => void;
    isVi: boolean;
}

export const CommunityHubRightRail = ({
    communityName,
    description,
    officialWebsiteUrl = "https://raft-game.com",
    steamStoreUrl = "https://store.steampowered.com",
    tags = ["Survival", "Crafting", "Multiplayer", "Open World"],
    onlineCount,
    contributors,
    events,
    onOpenChat,
    isVi,
}: CommunityHubRightRailProps) => {
    const [contribTab, setContribTab] = useState<"week" | "month" | "all">("week");

    return (
        <div className="w-full flex flex-col gap-6 text-text select-none py-1">
            {/* 1. ABOUT SECTION (Text Section + Divider, No Outer Box) */}
            <div className="flex flex-col gap-2.5 pb-5 border-b border-divider-primary/60">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-text-faint">
                    {isVi ? `VỀ ${communityName.toUpperCase()}` : `ABOUT ${communityName.toUpperCase()}`}
                </span>

                <p className="text-xs text-text-muted leading-relaxed">
                    {description}
                </p>

                {/* External Links */}
                <div className="flex flex-col gap-1.5 pt-1 text-xs font-semibold">
                    <a
                        href={officialWebsiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-primary hover:underline transition-colors"
                    >
                        <FontAwesomeIcon icon={faGlobe} className="text-xs shrink-0" />
                        <span>Official Website</span>
                    </a>
                    <a
                        href={steamStoreUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-primary hover:underline transition-colors"
                    >
                        <FontAwesomeIcon icon={faGamepad} className="text-xs shrink-0" />
                        <span>Steam Store Page</span>
                    </a>
                </div>

                {/* Tags */}
                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                        {tags.map((tag) => (
                            <span
                                key={tag}
                                className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-[3px] bg-surface-hover/70 text-text-muted border border-divider-primary/50"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* 2. TOP CONTRIBUTORS (Text Tabs WEEK MONTH ALL + Leaderboard List, No Outer Box) */}
            <div className="flex flex-col gap-3 pb-5 border-b border-divider-primary/60">
                <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-text-faint">
                        TOP CONTRIBUTORS
                    </span>
                </div>

                {/* Text Tabs: WEEK MONTH ALL */}
                <div className="flex items-center gap-4 border-b border-divider-primary/40 pb-1.5 text-xs font-bold tracking-wider uppercase">
                    {(["week", "month", "all"] as const).map((tab) => {
                        const isActive = contribTab === tab;
                        return (
                            <button
                                key={tab}
                                type="button"
                                onClick={() => setContribTab(tab)}
                                className={`relative pb-1 cursor-pointer transition-colors ${
                                    isActive ? "text-primary" : "text-text-muted hover:text-text"
                                }`}
                            >
                                <span>{tab}</span>
                                {isActive && (
                                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Leaderboard Entries */}
                <div className="flex flex-col gap-2">
                    {contributors.slice(0, 5).map((c, idx) => (
                        <div key={c.id} className="flex items-center justify-between text-xs py-0.5">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <span className={`w-4 text-center font-mono font-bold text-[11px] ${
                                    idx === 0 ? "text-amber-500 font-black" : idx === 1 ? "text-slate-400 font-bold" : idx === 2 ? "text-amber-700 font-bold" : "text-text-faint"
                                }`}>
                                    {String(idx + 1).padStart(2, "0")}
                                </span>
                                <img
                                    src={c.avatar}
                                    alt={c.name}
                                    className="w-6 h-6 rounded-full object-cover border border-divider-primary/80 shrink-0"
                                />
                                <span className="font-semibold text-text truncate">{c.handle}</span>
                            </div>

                            <span className="font-mono text-[11px] font-bold text-text-muted shrink-0">
                                {c.points} pts
                            </span>
                        </div>
                    ))}
                </div>

                <a
                    href="#leaderboard"
                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-1.5 pt-1"
                >
                    <span>{isVi ? "Xem bảng xếp hạng" : "View leaderboard"}</span>
                    <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
                </a>
            </div>

            {/* 3. MEMBERS ONLINE (Social Module, Clean Minimal Structure) */}
            <div className="flex flex-col gap-3 pb-5 border-b border-divider-primary/60">
                <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-text-faint">
                        MEMBERS ONLINE
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-500">
                        <FontAwesomeIcon icon={faCircle} className="text-[6px] animate-pulse" />
                        <span>{onlineCount}</span>
                    </span>
                </div>

                {/* Avatar Cluster */}
                <div className="flex items-center gap-2.5">
                    <div className="flex -space-x-2 overflow-hidden">
                        {contributors.slice(0, 4).map((c) => (
                            <img
                                key={c.id}
                                src={c.avatar}
                                alt={c.name}
                                className="inline-block h-7 w-7 rounded-full ring-2 ring-surface object-cover"
                            />
                        ))}
                    </div>
                    <span className="text-xs font-mono text-text-muted">
                        +{Math.max(0, onlineCount - 4)} online
                    </span>
                </div>

                <p className="text-[11px] text-text-muted leading-tight">
                    {isVi ? "Thảo luận trực tiếp đang diễn ra sôi nổi." : "Active discussions happening now."}
                </p>

                {/* Chat CTA Button */}
                <button
                    type="button"
                    onClick={onOpenChat}
                    className="w-full py-2 rounded-[4px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                    <FontAwesomeIcon icon={faMessage} className="text-[11px]" />
                    <span>{isVi ? "Tham gia Chat cộng đồng →" : "Join community chat →"}</span>
                </button>
            </div>

            {/* 4. UPCOMING EVENTS (Timeline Format, Editorial List) */}
            {events.length > 0 && (
                <div className="flex flex-col gap-3">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-text-faint">
                        UPCOMING EVENTS
                    </span>

                    <div className="flex flex-col gap-3">
                        {events.map((ev) => (
                            <div key={ev.id} className="flex gap-3 text-xs items-start">
                                <div className="px-2 py-1.5 rounded-[4px] bg-surface-inner border border-divider-primary/60 text-center font-mono shrink-0">
                                    <span className="text-[10px] font-bold text-primary block leading-tight uppercase">
                                        {ev.dateMonth.split(" ")[0]}
                                    </span>
                                    <span className="text-xs font-black text-text block leading-tight">
                                        {ev.dateMonth.split(" ")[1] || "20"}
                                    </span>
                                </div>

                                <div className="flex flex-col min-w-0 flex-1">
                                    <h4 className="font-bold text-xs text-text hover:text-primary transition-colors line-clamp-1 leading-snug">
                                        {ev.title}
                                    </h4>
                                    <div className="text-[11px] text-text-muted font-mono mt-0.5">
                                        {ev.time} · {ev.attendees} attending
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <a
                        href="#events"
                        className="text-xs font-semibold text-primary hover:underline flex items-center gap-1.5 pt-1"
                    >
                        <span>{isVi ? "Xem tất cả sự kiện" : "View all events"}</span>
                        <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
                    </a>
                </div>
            )}
        </div>
    );
};
