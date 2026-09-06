import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUsers,
    faUserCheck,
    faUserClock,
    faFlag,
    faPenToSquare,
    faShieldHalved,
    faArrowRight,
    faCircle,
    faGavel,
    faSliders,
    faCircleInfo,
} from "@fortawesome/free-solid-svg-icons";

interface CommunityManageOverviewProps {
    communityName: string;
    onNavigate: (navId: string) => void;
    isVi: boolean;
}

export const CommunityManageOverview = ({
    communityName,
    onNavigate,
    isVi,
}: CommunityManageOverviewProps) => {
    // Operational stats matching prompt requirements
    const stats = [
        {
            id: "members",
            label: isVi ? "THÀNH VIÊN" : "MEMBERS",
            value: "1,284",
            subtext: isVi ? "+18 tuần này" : "+18 this week",
            icon: faUsers,
            color: "text-text",
            onClick: () => onNavigate("manage-members"),
        },
        {
            id: "active",
            label: isVi ? "HOẠT ĐỘNG TUẦN NÀY" : "ACTIVE THIS WEEK",
            value: "382",
            subtext: isVi ? "30% tổng thành viên" : "30% of total",
            icon: faUserCheck,
            color: "text-emerald-400",
            onClick: () => onNavigate("manage-members"),
        },
        {
            id: "pending",
            label: isVi ? "YÊU CẦU CHỜ DUYỆT" : "PENDING REQUESTS",
            value: "12",
            subtext: isVi ? "Cần xử lý" : "Needs review",
            icon: faUserClock,
            color: "text-amber-400",
            badge: "12",
            onClick: () => onNavigate("manage-moderation"),
        },
        {
            id: "reports",
            label: isVi ? "BÁO CÁO VI PHẠM" : "REPORTS",
            value: "7",
            subtext: isVi ? "Cần điều tra" : "Action required",
            icon: faFlag,
            color: "text-rose-400",
            badge: "7",
            onClick: () => onNavigate("manage-reports"),
        },
        {
            id: "posts",
            label: isVi ? "BÀI VIẾT TUẦN NÀY" : "POSTS THIS WEEK",
            value: "164",
            subtext: isVi ? "+12% so với tuần trước" : "+12% vs last week",
            icon: faPenToSquare,
            color: "text-primary",
            onClick: () => onNavigate("discussions"),
        },
    ];

    // Community health items (compact progress indicators)
    const healthMetrics = [
        {
            label: isVi ? "Mức độ hoạt động" : "Activity",
            value: "92%",
            status: isVi ? "Rất cao" : "High",
            statusColor: "text-emerald-400",
            bars: 10,
            filled: 9,
            barColor: "bg-emerald-500",
        },
        {
            label: isVi ? "Tăng trưởng thành viên" : "Member growth",
            value: "+14%",
            status: isVi ? "Ổn định" : "Consistent",
            statusColor: "text-primary",
            bars: 10,
            filled: 7,
            barColor: "bg-primary",
        },
        {
            label: isVi ? "Tỉ lệ xử lý báo cáo" : "Reports resolution",
            value: "98%",
            status: isVi ? "Tốt (7 đang chờ)" : "7 pending",
            statusColor: "text-amber-400",
            bars: 10,
            filled: 3,
            barColor: "bg-amber-500",
        },
    ];

    // Compact recent operational activity
    const recentActivity = [
        {
            id: "act-1",
            text: isVi ? "3 báo cáo vi phạm mới cần xử lý" : "3 new reports flagged for review",
            time: "15m",
            type: "report",
            actionLabel: isVi ? "Xem báo cáo" : "Review",
            onAction: () => onNavigate("manage-reports"),
        },
        {
            id: "act-2",
            text: isVi ? "8 yêu cầu tham gia cộng đồng đang chờ duyệt" : "8 join requests waiting approval",
            time: "42m",
            type: "request",
            actionLabel: isVi ? "Duyệt" : "Approve",
            onAction: () => onNavigate("manage-moderation"),
        },
        {
            id: "act-3",
            text: isVi ? "2 hành động kiểm duyệt: khóa thảo luận 'Bug exploit #42'" : "2 moderation actions: locked discussion 'Bug exploit #42'",
            time: "2h",
            type: "moderation",
            actionLabel: isVi ? "Nhật ký" : "Logs",
            onAction: () => onNavigate("manage-moderation"),
        },
        {
            id: "act-4",
            text: isVi ? "1 thành viên được thăng cấp làm Điều hành viên: @shark_hunter99" : "1 member promoted to Moderator: @shark_hunter99",
            time: "5h",
            type: "promote",
            actionLabel: isVi ? "Đội ngũ" : "Team",
            onAction: () => onNavigate("manage-members"),
        },
        {
            id: "act-5",
            text: isVi ? "1 quy tắc cộng đồng được cập nhật: Quy tắc #03 (Cảnh báo Spoiler)" : "1 rule updated: Rule #03 (Spoiler Guidelines)",
            time: "1d",
            type: "rule",
            actionLabel: isVi ? "Quy tắc" : "Rules",
            onAction: () => onNavigate("manage-rules"),
        },
    ];

    return (
        <div className="w-full flex flex-col gap-6 animate-fade-in text-text select-none">
            {/* 1. HEADER & BOUNDARY CLARIFICATION */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-divider-primary/40">
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-base sm:text-lg font-mono font-bold tracking-wider text-text uppercase">
                            COMMUNITY OVERVIEW
                        </h2>
                        <span className="px-2 py-0.5 rounded-[4px] bg-primary/10 border border-primary/30 text-primary text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <FontAwesomeIcon icon={faShieldHalved} className="text-[9px]" />
                            <span>{isVi ? "Quản lý cộng đồng" : "Community Steward"}</span>
                        </span>
                    </div>
                    <p className="text-xs text-text-muted mt-0.5">
                        {isVi
                            ? `Bảng tổng quan vận hành cộng đồng ${communityName}. Quản trị toàn hệ thống tại admin.abc.com.`
                            : `Operational overview for ${communityName}. Platform administration is handled at admin.abc.com.`}
                    </p>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        type="button"
                        onClick={() => onNavigate("manage-moderation")}
                        className="px-3 py-1.5 rounded-[4px] bg-surface-inner hover:bg-surface-hover border border-divider-primary text-xs font-semibold text-text flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                        <FontAwesomeIcon icon={faGavel} className="text-[11px] text-text-faint" />
                        <span>{isVi ? "Kiểm duyệt" : "Moderation"}</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => onNavigate("manage-settings")}
                        className="px-3 py-1.5 rounded-[4px] bg-surface-inner hover:bg-surface-hover border border-divider-primary text-xs font-semibold text-text flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                        <FontAwesomeIcon icon={faSliders} className="text-[11px] text-text-faint" />
                        <span>{isVi ? "Cài đặt" : "Settings"}</span>
                    </button>
                </div>
            </div>

            {/* 2. OPERATIONAL INFORMATION STATS (Compact, restrained, no huge SaaS cards) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                {stats.map((stat) => (
                    <div
                        key={stat.id}
                        onClick={stat.onClick}
                        className="p-3 bg-surface-inner/80 hover:bg-surface-hover/70 border border-divider-primary/50 hover:border-divider-primary rounded-[6px] transition-all cursor-pointer flex flex-col justify-between gap-2 group"
                    >
                        <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-mono font-bold tracking-wider text-text-faint uppercase truncate">
                                {stat.label}
                            </span>
                            {stat.badge && (
                                <span className="w-4 h-4 rounded-full bg-rose-500/20 text-rose-400 font-mono text-[9px] font-bold flex items-center justify-center">
                                    {stat.badge}
                                </span>
                            )}
                        </div>

                        <div>
                            <span className={`text-xl sm:text-2xl font-mono font-black tracking-tight ${stat.color} block leading-none`}>
                                {stat.value}
                            </span>
                            <span className="text-[11px] text-text-muted mt-1 block truncate">
                                {stat.subtext}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* 3. COMMUNITY HEALTH (Small visual indicators, no giant charts) */}
            <div className="p-4 bg-surface-inner/60 border border-divider-primary/50 rounded-[6px] flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-text">
                            COMMUNITY HEALTH
                        </span>
                        <span className="flex items-center gap-1 text-emerald-500 text-xs font-mono font-semibold">
                            <FontAwesomeIcon icon={faCircle} className="text-[5px] animate-pulse" />
                            <span>{isVi ? "Hoạt động tốt" : "Healthy & Active"}</span>
                        </span>
                    </div>
                    <span className="text-[11px] font-mono text-text-faint">
                        {isVi ? "Cập nhật 5m trước" : "Updated 5m ago"}
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                    {healthMetrics.map((metric, idx) => (
                        <div key={idx} className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-text-muted font-medium">{metric.label}</span>
                                <div className="flex items-center gap-1.5 font-mono text-xs">
                                    <span className="font-bold text-text">{metric.value}</span>
                                    <span className={`text-[11px] ${metric.statusColor}`}>
                                        ({metric.status})
                                    </span>
                                </div>
                            </div>

                            {/* Segmented Visual Indicator (prompt: Activity ██████████) */}
                            <div className="flex items-center gap-1 h-2 w-full">
                                {Array.from({ length: metric.bars }).map((_, barIdx) => (
                                    <div
                                        key={barIdx}
                                        className={`flex-1 h-full rounded-[1px] transition-colors ${
                                            barIdx < metric.filled
                                                ? metric.barColor
                                                : "bg-surface-hover/80"
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 4. RECENT ACTIVITY (Compact operational items) */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-text">
                        RECENT ACTIVITY
                    </span>
                    <button
                        type="button"
                        onClick={() => onNavigate("manage-moderation")}
                        className="text-xs font-mono text-primary hover:underline flex items-center gap-1 cursor-pointer"
                    >
                        <span>{isVi ? "Xem toàn bộ nhật ký" : "View moderation log"}</span>
                        <FontAwesomeIcon icon={faArrowRight} className="text-[9px]" />
                    </button>
                </div>

                <div className="divide-y divide-divider-primary/30 border border-divider-primary/50 bg-surface-inner/40 rounded-[6px] overflow-hidden">
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
                                    className="px-2 py-0.5 rounded bg-surface hover:bg-surface-hover border border-divider-primary text-[11px] font-semibold text-text-muted hover:text-text cursor-pointer transition-colors"
                                >
                                    {item.actionLabel}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 5. QUICK STEWARDSHIP GUIDELINES FOOTNOTE */}
            <div className="px-3.5 py-2.5 rounded-[6px] bg-surface-inner/30 border border-divider-primary/30 flex items-start gap-2.5 text-xs text-text-faint">
                <FontAwesomeIcon icon={faCircleInfo} className="text-primary mt-0.5 text-xs shrink-0" />
                <p className="leading-relaxed">
                    {isVi
                        ? "Với tư cách Quản trị viên cộng đồng, bạn định hình văn hóa, thiết lập quy tắc và duy trì an toàn thảo luận cho tựa game này. Các can thiệp cấp hệ thống và danh sách người dùng toàn nền tảng thuộc phạm vi admin.abc.com."
                        : "As Community Admin, you guide the rules, culture, and content safety of this game space. Platform-wide user management and infrastructure controls belong to admin.abc.com."}
                </p>
            </div>
        </div>
    );
};
