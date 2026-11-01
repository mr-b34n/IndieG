import { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowRight,
    faCircle,
    faArrowUpRightFromSquare,
    faGamepad,
    faStar,
    faChevronDown,
    faChevronUp,
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
    rules?: Array<{ num?: string; title?: string; text?: string; description?: string } | string>;
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
    rules,
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


    const [isRulesExpanded, setIsRulesExpanded] = useState(false);
    const [expandedRuleNums, setExpandedRuleNums] = useState<Set<string>>(new Set());

    const toggleRuleDetail = (num: string) => {
        setExpandedRuleNums((prev) => {
            const next = new Set(prev);
            if (next.has(num)) {
                next.delete(num);
            } else {
                next.add(num);
            }
            return next;
        });
    };

    const fallbackRules = [
        { num: "01", title: isVi ? "Tôn trọng và lịch sự" : "Respect & Civility", text: isVi ? "Không xúc phạm, quấy rối, phân biệt đối xử hoặc sử dụng ngôn từ kích động thù địch." : "Treat everyone with respect. No harassment, hate speech, or toxic behavior." },
        { num: "02", title: isVi ? "Đăng bài đúng chủ đề & danh mục" : "Post in Relevant Categories", text: isVi ? "Chọn đúng loại bài viết (Thảo luận, Hướng dẫn, Media...) và tránh spam lặp lại." : "Use appropriate categories and post types. Avoid repetitive spam." },
        { num: "03", title: isVi ? "Không chia sẻ hack, cheat & mã độc" : "No Hacks, Cheats or Malware", text: isVi ? "Nghiêm cấm chia sẻ phần mềm gian lận, hack tool, cracked game kèm mã độc hại." : "Do not share cheats, piracy links, malware, or game exploits." },
        { num: "04", title: isVi ? "Cảnh báo Spoiler & nội dung nhạy cảm" : "Spoiler & Content Warnings", text: isVi ? "Sử dụng tag Spoiler cho cốt truyện mới và tuân thủ quy định độ tuổi của cộng đồng." : "Mark spoilers properly and follow community content guidelines." },
        { num: "05", title: isVi ? "Không quảng cáo & bán hàng trái phép" : "No Unauthorized Ads", text: isVi ? "Không spam quảng cáo thương mại, link tiếp thị liên kết hoặc mua bán trái phép." : "No commercial advertising, affiliate links, or unauthorized trading." },
        { num: "06", title: isVi ? "Tuân thủ hướng dẫn của Quản trị viên" : "Follow Moderator Decisions", text: isVi ? "Tôn trọng các quyết định điều hành và hướng dẫn từ đội ngũ quản trị viên." : "Respect decisions and moderation guidelines from community staff." },
        { num: "07", title: isVi ? "Bảo vệ thông tin cá nhân" : "Protect Privacy", text: isVi ? "Không chia sẻ thông tin cá nhân (doxxing), số điện thoại, tài khoản của người khác." : "Do not share personal private info, phone numbers, or dox other members." },
    ];

    const formattedRules = useMemo(() => {
        if (rules && rules.length > 0) {
            return rules.map((r, idx) => {
                const num = String(idx + 1).padStart(2, "0");
                if (typeof r === "string") {
                    return { num, text: r, title: undefined };
                }
                return {
                    num: r.num || num,
                    title: r.title,
                    text: r.text || r.description || "",
                };
            });
        }
        return fallbackRules;
    }, [rules, isVi]);

    const displayedRules = isRulesExpanded || formattedRules.length <= 5
        ? formattedRules
        : formattedRules.slice(0, 5);

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

            {/* 2. RULES SECTION (Full display with >5 rules expand/collapse toggle) */}
            <div className="flex flex-col gap-2 pb-4 border-b border-border/40">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-faint">
                        RULES
                    </span>
                    <span className="text-[10px] font-mono text-text-faint font-semibold">
                        {formattedRules.length} {isVi ? "quy tắc" : "rules"}
                    </span>
                </div>

                <div className="flex flex-col gap-2 pt-0.5">
                    {displayedRules.map((rule) => {
                        const hasDetail = !!rule.text && (rule.title ? rule.text !== rule.title : true);
                        const isDetailOpen = expandedRuleNums.has(rule.num);

                        return (
                            <div key={rule.num} className="flex flex-col gap-1 text-xs">
                                <div
                                    className={`flex items-start justify-between gap-2 p-1 -mx-1 rounded transition-colors ${
                                        hasDetail ? "cursor-pointer hover:bg-surface-hover/50" : ""
                                    }`}
                                    onClick={hasDetail ? () => toggleRuleDetail(rule.num) : undefined}
                                >
                                    <div className="flex items-start gap-2 min-w-0">
                                        <span className="text-[10px] font-mono font-black text-primary/80 shrink-0 pt-0.5">
                                            {rule.num}
                                        </span>
                                        <span className="font-semibold text-text text-[11px] leading-tight">
                                            {rule.title || rule.text}
                                        </span>
                                    </div>
                                    {hasDetail && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleRuleDetail(rule.num);
                                            }}
                                            className="w-4 h-4 flex items-center justify-center text-text-faint hover:text-primary transition-colors cursor-pointer shrink-0 mt-0.5"
                                            title={isDetailOpen ? (isVi ? "Thu gọn chi tiết" : "Collapse detail") : (isVi ? "Xem chi tiết" : "Expand detail")}
                                        >
                                            <FontAwesomeIcon icon={isDetailOpen ? faChevronUp : faChevronDown} className="text-[9px]" />
                                        </button>
                                    )}
                                </div>

                                {hasDetail && isDetailOpen && (
                                    <div className="pl-5 pr-1 text-text-muted text-[11px] leading-snug animate-fade-in pb-1">
                                        {rule.text}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {formattedRules.length > 5 && (
                    <button
                        type="button"
                        onClick={() => setIsRulesExpanded(!isRulesExpanded)}
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 mt-1 rounded bg-surface-inner/60 hover:bg-surface-hover/80 border border-border/50 text-[11px] font-semibold text-text-muted hover:text-text transition-colors cursor-pointer"
                    >
                        <span>
                            {isRulesExpanded
                                ? (isVi ? "Thu gọn" : "Show less")
                                : (isVi ? "Xem thêm" : "View more")}
                        </span>
                        <FontAwesomeIcon icon={isRulesExpanded ? faChevronUp : faChevronDown} className="text-[9px]" />
                    </button>
                )}
            </div>

            {/* 4. TOP CONTRIBUTORS (Tạm thời ẩn do tính năng chưa phát triển) */}
            {/*
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
            */}
        </aside>
    );
};
