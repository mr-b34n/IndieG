
import { useTranslation } from "@/shared/hooks/useTranslate";
import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faFlag,
    faXmark,
    faMicrophoneSlash,
    faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import { useReportsQuery, useProfilesListQuery } from "@/shared/api/useQueries";
import { extractReportList } from "@/shared/api";

interface ReportItem {
    id: string;
    targetType: "post" | "comment" | "user";
    targetTitle: string;
    targetExcerpt: string;
    authorName: string;
    authorHandle: string;
    reporterName: string;
    reason: string;
    createdAt: string;
    status: "pending" | "resolved" | "dismissed";
}

interface CommunityManageReportsProps {
    communityId?: string;
    communityName: string;
    isVi: boolean;
    onNavigateRules: () => void;
    userRole?: "owner" | "admin" | "moderator" | "member";
}

export const CommunityManageReports = ({
    communityId,
    communityName,
    isVi,
    onNavigateRules,
    userRole = "owner",
}: CommunityManageReportsProps) => {
    const { t } = useTranslation();
    const [reportFilter, setReportFilter] = useState<"all" | "pending" | "resolved" | "dismissed">("all");

    const { data: reportsData } = useReportsQuery();

    const { data: profilesData } = useProfilesListQuery({ limit: 100 });
    const profilesMap = useMemo(() => {
        const map = new Map<string, { name: string; username: string; avatar: string }>();
        if (!profilesData) return map;
        const rawProfiles = Array.isArray(profilesData) ? profilesData : (profilesData as any)?.data || (profilesData as any)?.items || [];
        for (const p of rawProfiles) {
            const uid = String(p.id || p.userId || "");
            if (uid) {
                map.set(uid, {
                    name: String(p.displayName || p.name || p.username || ""),
                    username: String(p.username || p.name || ""),
                    avatar: String(p.avatarUrl || p.avatar || ""),
                });
            }
        }
        return map;
    }, [profilesData]);

    const reports: ReportItem[] = useMemo(() => {
        const items = extractReportList(reportsData);
        const filteredByCommunity = communityId
            ? items.filter((r: any) => !r.communityId || r.communityId === communityId)
            : items;
        return filteredByCommunity.map((r: any) => {
            const reporterProfile = r.reporterId ? profilesMap.get(r.reporterId) : undefined;
            const reporterName = r.reporter?.name || r.reporter?.username || reporterProfile?.name || reporterProfile?.username || (r.reporterId ? `User (${r.reporterId.slice(0, 6)})` : (isVi ? "Người báo cáo" : "Reporter"));
            const reporterHandle = r.reporter?.username ? `@${r.reporter.username}` : reporterProfile?.username ? `@${reporterProfile.username}` : (r.reporterId ? `@user_${r.reporterId.slice(0, 6)}` : "@reporter");

            const targetType = (r.targetType || (r.postId ? "post" : r.commentId ? "comment" : "user")) as "post" | "comment" | "user";
            const targetTitle =
                r.post?.title ||
                (targetType === "user"
                    ? (isVi ? `Báo cáo người dùng: ${r.targetId || "Tài khoản"}` : `Reported User: ${r.targetId || "Account"}`)
                    : r.postId
                    ? `Post #${r.postId.slice(0, 8)}`
                    : `Comment #${(r.commentId || r.id).slice(0, 8)}`);
            const targetExcerpt =
                r.post?.content?.slice(0, 120) ||
                r.comment?.content?.slice(0, 120) ||
                r.reason ||
                (isVi ? "Nội dung bị ẩn hoặc không thể tải được." : "Content is hidden or unavailable.");
            const status = (
                r.status === "resolved" ? "resolved" : r.status === "dismissed" ? "dismissed" : "pending"
            ) as "pending" | "resolved" | "dismissed";

            return {
                id: r.id,
                targetType,
                targetTitle,
                targetExcerpt,
                authorName: reporterName,
                authorHandle: reporterHandle,
                reporterName: reporterHandle,
                reason: r.reason || (isVi ? "Lý do báo cáo không xác định" : "Unspecified report reason"),
                createdAt: r.createdAt ? new Date(r.createdAt).toLocaleDateString(isVi ? "vi-VN" : "en-US", { hour: '2-digit', minute: '2-digit' }) : (isVi ? "Mới đây" : "Recently"),
                status,
            };
        });
    }, [reportsData, profilesMap, isVi, communityId]);

    return (
        <div className="w-full flex flex-col gap-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col gap-1">
                <h1 className="text-xl font-extrabold text-text tracking-wide uppercase">
                    {t('hub.communitymanagemoderation_105', { defaultValue: 'Báo cáo cộng đồng' })}
                </h1>
                <p className="text-sm text-text-muted">
                    {t('hub.communitymanagemoderation_106', { defaultValue: 'Quản lý các nội dung và thành viên bị báo cáo' })}
                </p>
            </div>

            <div className="flex flex-col gap-4">
                {/* Filter Tabs */}
                <div className="flex flex-wrap items-center gap-4 text-xs font-bold border-b border-divider-primary/40 pb-2">
                    {(["all", "pending", "resolved", "dismissed"] as const).map((mode) => {
                        const count = mode === "all" ? reports.length : reports.filter((r) => r.status === mode).length;
                        const label =
                            mode === "all" ? (isVi ? "Tất cả" : "All")
                            : mode === "pending" ? (isVi ? "Đang chờ" : "Pending")
                            : mode === "resolved" ? (isVi ? "Đã xử lý" : "Resolved")
                            : (isVi ? "Đã từ chối" : "Dismissed");
                        const isActive = reportFilter === mode;
                        return (
                            <button
                                key={mode}
                                type="button"
                                onClick={() => setReportFilter(mode)}
                                className={`flex items-center gap-2 pb-2 -mb-2 border-b-2 transition-colors cursor-pointer ${
                                    isActive
                                        ? "border-primary text-text"
                                        : "border-transparent text-text-muted hover:text-text"
                                }`}
                            >
                                <span className="uppercase tracking-wider">{label}</span>
                                <span className={`px-1.5 py-0.5 rounded text-[10px] ${isActive ? "bg-primary/20 text-primary" : "bg-surface-inner text-text-faint"}`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Report List */}
                <div className="flex flex-col gap-3">
                    {reports.filter((r) => reportFilter === "all" || r.status === reportFilter).length === 0 ? (
                        <div className="p-8 text-center bg-surface-inner/40 rounded-[6px] border border-divider-primary/40">
                            <p className="text-sm text-text-muted">{isVi ? "Không có báo cáo nào" : "No reports found"}</p>
                        </div>
                    ) : (
                        reports
                            .filter((r) => reportFilter === "all" || r.status === reportFilter)
                            .map((report) => (
                                <div key={report.id} className="flex flex-col gap-3 pb-4 border-b border-divider-primary/30 last:border-0">
                                    <div className="flex items-center justify-between text-[11px] font-mono text-text-faint">
                                        <div className="flex items-center gap-2 uppercase tracking-widest">
                                            <span className="font-bold text-text-muted">{report.targetType}</span>
                                        </div>
                                        <span>{report.createdAt}</span>
                                    </div>
                                    
                                    <div className="flex flex-col gap-1.5">
                                        <h3 className="text-sm font-bold text-text">{report.targetTitle}</h3>
                                        <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                                            "{report.targetExcerpt}"
                                        </p>
                                    </div>
                                    
                                    <div className="flex items-center gap-4 text-xs font-mono text-text-muted mt-1">
                                        <div className="flex items-center gap-1.5">
                                            <span>Author:</span>
                                            <span className="text-text font-bold">{report.authorHandle}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span>Reported by:</span>
                                            <span className="text-primary font-bold">{report.reporterName}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start gap-2 mt-1">
                                        <FontAwesomeIcon icon={faFlag} className="text-[10px] text-amber-500 mt-0.5" />
                                        <span className="text-xs font-semibold text-amber-500/90">{report.reason}</span>
                                    </div>

                                    {report.status === "pending" && (
                                        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-divider-primary/20">
                                            <button className="text-xs font-bold text-text-muted hover:text-text transition-colors cursor-pointer flex items-center gap-1.5">
                                                <FontAwesomeIcon icon={faXmark} /> Dismiss
                                            </button>
                                            <button className="text-xs font-bold text-amber-500 hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-1.5 ml-2">
                                                <FontAwesomeIcon icon={faMicrophoneSlash} /> Mute Author
                                            </button>
                                            <button className="text-xs font-bold text-rose-500 hover:text-rose-400 transition-colors cursor-pointer flex items-center gap-1.5 ml-auto">
                                                <FontAwesomeIcon icon={faTrashCan} /> Remove Content
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
                    )}
                </div>
            </div>
        </div>
    );
};
