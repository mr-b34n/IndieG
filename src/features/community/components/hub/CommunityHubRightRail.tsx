import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowRight,
    faCircle,
    faArrowUpRightFromSquare,
} from "@fortawesome/free-solid-svg-icons";
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
    userRole?: "owner" | "admin" | "moderator" | "member";
    pendingCount?: number;
    reportsCount?: number;
    modsCount?: number;
}

export const CommunityHubRightRail = ({
    communityName,
    description,
    membersCount,
    onlineCount,
    contributors,
    onNavigateNav,
    isVi,
}: CommunityHubRightRailProps) => {
    const { t } = useTranslation();

    const defaultRules = [
        { num: "01", text: isVi ? "Không spam hoặc quảng cáo thương mại trái phép" : "No spam or unauthorized advertising" },
        { num: "02", text: isVi ? "Tôn trọng các thành viên, nghiêm cấm toxic / phân biệt" : "Be respectful, zero toxicity or harassment" },
        { num: "03", text: isVi ? "Đăng bài đúng chủ đề, không chia sẻ hack / cheat" : "Stay on-topic, strictly no cheats or piracy" },
    ];

    const communityLinks = [
        { label: "Discord Server", href: "https://discord.gg/indieg", tag: "Chat & Voice" },
        { label: "Steam Community", href: "https://steamcommunity.com", tag: "Group" },
        { label: "Facebook Group", href: "https://facebook.com", tag: "Community" },
    ];

    return (
        <aside className="w-full flex flex-col gap-5 text-text select-none py-1">
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
                        <span>{isVi ? "Xem tất cả" : "View all"}</span>
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
                            <span>{isVi ? "Xem thêm" : "See all"}</span>
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
