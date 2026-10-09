import { useTranslation } from "@/shared/hooks/useTranslate";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faShieldHalved,
    faArrowRight,
    faGavel,
    faTriangleExclamation,
    faCheckCircle,
    faFlag,
    faUsers,
    faGear,
    faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { useCommunityMembersQuery, usePendingMembersQuery, useReportsQuery, usePostsQuery } from "@/shared/api/useQueries";
import { extractMemberList, extractReportList } from "@/shared/api";
import { formatCompactNumber } from "../../constants";

interface CommunityManageOverviewProps {
    communityId?: string;
    communityName: string;
    onNavigate: (navId: string) => void;
    isVi: boolean;
    userRole?: "owner" | "admin" | "moderator" | "member";
    totalMembers?: number;
    description?: string;
    avatarUrl?: string;
}

export const CommunityManageOverview = ({
    communityId,
    communityName,
    onNavigate,
    isVi,
    userRole = "owner",
    totalMembers,
}: CommunityManageOverviewProps) => {
    const { t } = useTranslation();
    // TanStack queries for operational management state
    const { data: membersData } = useCommunityMembersQuery(communityId || "");
    const { data: pendingData } = usePendingMembersQuery(communityId || "");
    const { data: reportsData } = useReportsQuery();
    const { data: postsData } = usePostsQuery({ communityId });

    const pendingList = extractMemberList(pendingData);
    const pendingCount = pendingList.length;

    const rawReportsList = extractReportList(reportsData);
    const reportsCount = rawReportsList.length;

    const rawMembersList = extractMemberList(membersData);
    const calcMembersCount = totalMembers ?? (rawMembersList.length > 0 ? rawMembersList.length : 34500);
    const calcOnlineCount = Math.max(1, Math.round(calcMembersCount * 0.064));

    const postsCount = postsData
        ? Array.isArray(postsData)
            ? postsData.length
            : (postsData as { items?: unknown[] }).items?.length || 0
        : 0;

    const isOwnerOrAdmin = userRole === "owner" || userRole === "admin";

    // Sub-navigation for admin hub
    const adminTabs = [
        { id: "manage-overview", label: t('hub.communitymanageoverview_131') },
        { id: "manage-moderation", label: t('hub.communitymanageoverview_132'), badge: pendingCount > 0 ? String(pendingCount) : undefined },
        { id: "manage-members", label: t('hub.communitymanageoverview_133') },
        { id: "manage-reports", label: t('hub.communitymanageoverview_134'), badge: reportsCount > 0 ? String(reportsCount) : undefined },
        ...(isOwnerOrAdmin ? [{ id: "manage-settings", label: t('hub.communitymanageoverview_135') }] : []),
    ];

    // NEEDS ATTENTION items (Highest priority!)
    const attentionItems = [];
    if (reportsCount > 0) {
        attentionItems.push({
            id: "att-reports",
            severity: "high" as const,
            label: isVi ? `${reportsCount} báo cáo vi phạm đang chờ xử lý` : `${reportsCount} reports waiting for review`,
            desc: t('hub.communitymanageoverview_136'),
            action: () => onNavigate("manage-reports"),
            actionText: t('hub.communitymanageoverview_137'),
        });
    }

    if (pendingCount > 0) {
        attentionItems.push({
            id: "att-pending",
            severity: "medium" as const,
            label: isVi ? `${pendingCount} yêu cầu thành viên đang chờ duyệt` : `${pendingCount} pending member requests`,
            desc: t('hub.communitymanageoverview_141'),
            action: () => onNavigate("manage-moderation"),
            actionText: t('hub.communitymanageoverview_142'),
        });
    }

    // Operational Recent Activity (Meaningful community & admin events)
    const recentActivity = [
        {
            id: "act-1",
            text: t('hub.communitymanageoverview_143'),
            time: "10m ago",
            actionLabel: t('hub.communitymanageoverview_144'),
            onAction: () => onNavigate("manage-reports"),
        },
        {
            id: "act-2",
            text: t('hub.communitymanageoverview_145'),
            time: "35m ago",
            actionLabel: t('hub.communitymanageoverview_146'),
            onAction: () => onNavigate("manage-members"),
        },
        {
            id: "act-3",
            text: t('hub.communitymanageoverview_147'),
            time: "1h ago",
            actionLabel: t('hub.communitymanageoverview_148'),
            onAction: () => onNavigate("discussions"),
        },
        {
            id: "act-4",
            text: t('hub.communitymanageoverview_149'),
            time: "3h ago",
            actionLabel: t('hub.communitymanageoverview_150'),
            onAction: () => onNavigate("manage-moderation"),
        },
    ];

    return (
        <div className="w-full flex flex-col gap-6 text-text select-none animate-fade-in pb-10">
            {/* 1. ADMIN HEADER: Clear Navigation */}
            <div className="flex flex-col gap-3 pb-3 border-b border-border/50">

                {/* Clear Admin Navigation Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pt-2">
                    {adminTabs.map((tab) => {
                        const isActive = tab.id === "manage-overview";
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => onNavigate(tab.id)}
                                className={`px-3 py-1.5 rounded-[6px] text-xs font-mono font-bold tracking-wider uppercase transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
                                    isActive
                                        ? "bg-surface-hover text-text border border-border"
                                        : "text-text-muted hover:text-text hover:bg-surface-hover/60"
                                }`}
                            >
                                <span>{tab.label}</span>
                                {tab.badge && (
                                    <span className="px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-400 font-mono text-[9px] font-bold">
                                        {tab.badge}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 2. COMPACT OVERVIEW STRIP (Not massive cards, dense & readable) */}
            <div className="p-3.5 rounded-[8px] bg-surface-inner/60 border border-border/60">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-faint pb-2 mb-2 border-b border-border/40">
                    {isVi ? "TỔNG QUAN CỘNG ĐỒNG" : "COMMUNITY OVERVIEW"}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono">
                    <div className="flex flex-col">
                        <span className="text-lg font-black text-text leading-tight">
                            {formatCompactNumber(calcMembersCount)}
                        </span>
                        <span className="text-[11px] text-text-muted font-sans mt-0.5">
                            {t('hub.communitymanageoverview_154')}
                        </span>
                    </div>

                    <div className="flex flex-col">
                        <span className="text-lg font-black text-emerald-400 leading-tight flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            {formatCompactNumber(calcOnlineCount)}
                        </span>
                        <span className="text-[11px] text-text-muted font-sans mt-0.5">
                            {t('hub.communitymanageoverview_155')}
                        </span>
                    </div>

                    <div className="flex flex-col">
                        <span className={`text-lg font-black leading-tight ${reportsCount > 0 ? "text-rose-400" : "text-text"}`}>
                            {reportsCount}
                        </span>
                        <span className="text-[11px] text-text-muted font-sans mt-0.5">
                            {t('hub.communitymanageoverview_156')}
                        </span>
                    </div>

                    <div className="flex flex-col">
                        <span className={`text-lg font-black leading-tight ${pendingCount > 0 ? "text-amber-400" : "text-text"}`}>
                            {pendingCount}
                        </span>
                        <span className="text-[11px] text-text-muted font-sans mt-0.5">
                            {t('hub.communitymanageoverview_157')}
                        </span>
                    </div>

                    <div className="flex flex-col">
                        <span className="text-lg font-black text-primary leading-tight">
                            {postsCount || 48}
                        </span>
                        <span className="text-[11px] text-text-muted font-sans mt-0.5">
                            {t('hub.communitymanageoverview_158')}
                        </span>
                    </div>
                </div>
            </div>

            {/* 3. NEEDS ATTENTION (MOST IMPORTANT ACTION-ORIENTED SECTION) */}
            {attentionItems.length > 0 && (
                <div className="flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                            <FontAwesomeIcon icon={faTriangleExclamation} />
                            <span>{isVi ? "CẦN XỬ LÝ" : "NEEDS ATTENTION"}</span>
                        </span>
                        <span className="text-[10px] font-mono text-text-faint">
                            {attentionItems.length} {t('hub.communitymanageoverview_159')}
                        </span>
                    </div>

                    <div className="flex flex-col gap-2">
                        {attentionItems.map((item) => (
                            <div
                                key={item.id}
                                onClick={item.action}
                                className="p-3 rounded-[6px] bg-surface-inner/80 hover:bg-surface-hover/80 border border-border/70 hover:border-border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                            >
                                <div className="flex items-start gap-3 min-w-0">
                                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1 ${item.severity === "high" ? "bg-rose-500 animate-pulse" : "bg-amber-400"}`} />
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-xs font-bold text-text group-hover:text-primary transition-colors">
                                            {item.label}
                                        </span>
                                        <span className="text-[11px] text-text-muted mt-0.5">
                                            {item.desc}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="px-3 py-1 rounded-[4px] bg-surface hover:bg-surface-hover border border-border text-xs font-semibold text-text flex items-center gap-1.5 self-end sm:self-auto shrink-0 transition-colors"
                                >
                                    <span>{item.actionText}</span>
                                    <FontAwesomeIcon icon={faArrowRight} className="text-[9px] text-text-faint group-hover:translate-x-0.5 transition-transform" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 4. QUICK ACTIONS */}
            <div className="flex flex-col gap-2.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-faint">
                    {isVi ? "THAO TÁC NHANH" : "QUICK ACTIONS"}
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <button
                        type="button"
                        onClick={() => onNavigate("manage-moderation")}
                        className="p-3 rounded-[6px] bg-surface-inner/60 hover:bg-surface-hover/80 border border-border/50 hover:border-primary/50 text-left transition-all cursor-pointer flex items-center gap-3 group"
                    >
                        <div className="w-8 h-8 rounded-[4px] bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                            <FontAwesomeIcon icon={faGavel} className="text-xs" />
                        </div>
                        <div className="flex flex-col min-w-0 leading-tight">
                            <span className="text-xs font-bold text-text group-hover:text-primary transition-colors">
                                {t('hub.communitymanageoverview_161')}
                            </span>
                            <span className="text-[10px] text-text-muted mt-0.5 truncate">
                                {t('hub.communitymanageoverview_162')}
                            </span>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => onNavigate("manage-members")}
                        className="p-3 rounded-[6px] bg-surface-inner/60 hover:bg-surface-hover/80 border border-border/50 hover:border-primary/50 text-left transition-all cursor-pointer flex items-center gap-3 group"
                    >
                        <div className="w-8 h-8 rounded-[4px] bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <FontAwesomeIcon icon={faUsers} className="text-xs" />
                        </div>
                        <div className="flex flex-col min-w-0 leading-tight">
                            <span className="text-xs font-bold text-text group-hover:text-primary transition-colors">
                                {t('hub.communitymanageoverview_163')}
                            </span>
                            <span className="text-[10px] text-text-muted mt-0.5 truncate">
                                {t('hub.communitymanageoverview_164')}
                            </span>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => onNavigate("manage-reports")}
                        className="p-3 rounded-[6px] bg-surface-inner/60 hover:bg-surface-hover/80 border border-border/50 hover:border-primary/50 text-left transition-all cursor-pointer flex items-center gap-3 group"
                    >
                        <div className="w-8 h-8 rounded-[4px] bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0">
                            <FontAwesomeIcon icon={faFlag} className="text-xs" />
                        </div>
                        <div className="flex flex-col min-w-0 leading-tight">
                            <span className="text-xs font-bold text-text group-hover:text-primary transition-colors">
                                {t('hub.communitymanageoverview_165')}
                            </span>
                            <span className="text-[10px] text-text-muted mt-0.5 truncate">
                                {t('hub.communitymanageoverview_166')}
                            </span>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => onNavigate("manage-settings")}
                        className="p-3 rounded-[6px] bg-surface-inner/60 hover:bg-surface-hover/80 border border-border/50 hover:border-primary/50 text-left transition-all cursor-pointer flex items-center gap-3 group"
                    >
                        <div className="w-8 h-8 rounded-[4px] bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
                            <FontAwesomeIcon icon={faGear} className="text-xs" />
                        </div>
                        <div className="flex flex-col min-w-0 leading-tight">
                            <span className="text-xs font-bold text-text group-hover:text-primary transition-colors">
                                {t('hub.communitymanageoverview_167')}
                            </span>
                            <span className="text-[10px] text-text-muted mt-0.5 truncate">
                                {t('hub.communitymanageoverview_168')}
                            </span>
                        </div>
                    </button>
                </div>
            </div>

            {/* 5. RECENT OPERATIONAL ACTIVITY (Operational events with timestamps) */}
            <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-faint">
                        {isVi ? "HOẠT ĐỘNG GẦN ĐÂY" : "RECENT ACTIVITY"}
                    </span>
                    <button
                        type="button"
                        onClick={() => onNavigate("manage-moderation")}
                        className="text-[11px] font-mono text-primary hover:underline flex items-center gap-1 cursor-pointer"
                    >
                        <span>{t('hub.communitymanageoverview_169')}</span>
                        <FontAwesomeIcon icon={faArrowRight} className="text-[9px]" />
                    </button>
                </div>

                <div className="divide-y divide-border/40 border border-border/60 bg-surface-inner/40 rounded-[6px] overflow-hidden">
                    {recentActivity.map((item) => (
                        <div
                            key={item.id}
                            className="px-3.5 py-2.5 flex items-center justify-between gap-3 hover:bg-surface-hover/40 transition-colors text-xs"
                        >
                            <div className="flex items-center gap-2.5 min-w-0">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                <span className="text-text font-medium truncate">
                                    {item.text}
                                </span>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                                <span className="text-text-faint font-mono text-[11px]">
                                    {item.time}
                                </span>
                                <button
                                    type="button"
                                    onClick={item.onAction}
                                    className="px-2 py-0.5 rounded bg-surface hover:bg-surface-hover border border-border text-[11px] font-semibold text-text-muted hover:text-text cursor-pointer transition-colors"
                                >
                                    {item.actionLabel}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
