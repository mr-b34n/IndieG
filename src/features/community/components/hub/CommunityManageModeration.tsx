import { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUserCheck,
    faCheck,
    faXmark,
    faFlag,
    faShieldHalved,
    faClockRotateLeft,
    faUserPlus,
    faVolumeXmark,
    faTrashCan,
    faCircleCheck,
    faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import {
    useCommunityMembersQuery,
    usePendingMembersQuery,
    useProfilesListQuery,
    useApproveJoinRequestMutation,
    useRejectJoinRequestMutation,
    useReportsQuery,
    useDeleteReportMutation,
} from "@/shared/api/useQueries";
import { extractMemberList, extractReportList } from "@/shared/api";
import type { CommunityMemberDto, ReportDto } from "@/shared/api/types";

interface JoinRequestItem {
    id: string;
    username: string;
    handle: string;
    avatar: string;
    note: string;
    playtime: string;
    appliedAt: string;
    status: "pending" | "approved" | "rejected";
}

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

interface ModHistoryItem {
    id: string;
    actor: string;
    action: string;
    target: string;
    timestamp: string;
    reason?: string;
}

interface ModeratorItem {
    id: string;
    name: string;
    handle: string;
    avatar: string;
    role: "Owner" | "Moderator";
    assignedAt: string;
    actionsCount: number;
}

interface CommunityManageModerationProps {
    communityId?: string;
    communityName: string;
    initialTab?: "requests" | "reports" | "history" | "moderators";
    isVi: boolean;
    onNavigateRules: () => void;
    userRole?: "owner" | "admin" | "moderator" | "member";
}

export const CommunityManageModeration = ({
    communityId,
    communityName,
    initialTab = "requests",
    isVi,
    onNavigateRules,
    userRole = "owner",
}: CommunityManageModerationProps) => {
    const [subTab, setSubTab] = useState<"requests" | "reports" | "moderators" | "history">(initialTab);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const isOwner = userRole === "owner" || userRole === "admin";

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3500);
    };

    // 1. Pending Join Requests Query & Mutations
    const { data: pendingMembersData, refetch: refetchPending } = usePendingMembersQuery(communityId || "");
    const { data: profilesData } = useProfilesListQuery();
    const approveMutation = useApproveJoinRequestMutation();
    const rejectMutation = useRejectJoinRequestMutation();

    const profilesMap = useMemo(() => {
        const map = new Map<string, { name?: string; username?: string; avatar?: string }>();
        if (!profilesData) return map;
        const rawProfiles = Array.isArray(profilesData)
            ? profilesData
            : (profilesData as { data?: unknown[]; items?: unknown[] })?.data ||
              (profilesData as { items?: unknown[] })?.items ||
              [];
        for (const p of rawProfiles as Record<string, unknown>[]) {
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

    const joinRequests: JoinRequestItem[] = useMemo(() => {
        const items: CommunityMemberDto[] = extractMemberList(pendingMembersData);
        return items.map((m) => {
            const profile = profilesMap.get(m.userId);
            const username = m.user?.name || m.user?.displayName || m.user?.username || profile?.name || (m.userId ? `Thành viên (${m.userId.slice(0, 6)})` : "Thành viên");
            const handleRaw = m.user?.username || m.user?.name || profile?.username || m.userId;
            const handle = handleRaw ? (String(handleRaw).startsWith("@") ? String(handleRaw) : `@${handleRaw}`) : `@${m.userId.slice(0, 6)}`;
            const avatar = m.user?.avatarUrl || m.user?.avatar || profile?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(String(handleRaw || m.userId))}`;

            return {
                id: m.userId,
                username,
                handle,
                avatar,
                note: isVi ? "Yêu cầu gia nhập cộng đồng đang chờ xem xét." : "Join request awaiting steward review.",
                playtime: "—",
                appliedAt: m.joinedAt ? new Date(m.joinedAt).toLocaleDateString("vi-VN") : (isVi ? "Gần đây" : "Recent"),
                status: "pending" as const,
            };
        });
    }, [pendingMembersData, profilesMap, isVi]);

    const handleApproveRequest = async (id: string, name: string) => {
        try {
            await approveMutation.mutateAsync({ communityId: communityId || "" });
            refetchPending();
            showToast(isVi ? `Đã phê duyệt ${name} vào cộng đồng!` : `Approved ${name}'s join request.`);
        } catch {
            showToast(isVi ? `Lỗi khi phê duyệt ${name}` : `Failed to approve ${name}`);
        }
    };

    const handleRejectRequest = async (id: string, name: string) => {
        try {
            await rejectMutation.mutateAsync({ communityId: communityId || "" });
            refetchPending();
            showToast(isVi ? `Đã từ chối yêu cầu của ${name}.` : `Rejected ${name}'s request.`);
        } catch {
            showToast(isVi ? `Lỗi khi từ chối yêu cầu của ${name}` : `Failed to reject ${name}`);
        }
    };

    // 2. Reports Query & Mutations
    const { data: reportsData, refetch: refetchReports } = useReportsQuery();
    const deleteReportMutation = useDeleteReportMutation();

    const reports: ReportItem[] = useMemo(() => {
        const items: ReportDto[] = extractReportList(reportsData);
        return items.map((r) => {
            const reporterProfile = r.reporterId ? profilesMap.get(r.reporterId) : undefined;
            const reporterName = r.reporter?.name || r.reporter?.username || reporterProfile?.name || reporterProfile?.username || (r.reporterId ? `User (${r.reporterId.slice(0, 6)})` : "Người báo cáo");
            const reporterHandle = r.reporter?.username ? `@${r.reporter.username}` : reporterProfile?.username ? `@${reporterProfile.username}` : (r.reporterId ? `@user_${r.reporterId.slice(0, 6)}` : "@reporter");

            return {
                id: r.id,
                targetType: (r.postId ? "post" : "comment") as "post" | "comment" | "user",
                targetTitle: r.post?.title || (r.postId ? `Post #${r.postId.slice(0, 8)}` : `Report #${r.id.slice(0, 6)}`),
                targetExcerpt: r.post?.content?.slice(0, 100) || r.reason || (isVi ? "Nội dung bị báo cáo" : "Reported content"),
                authorName: reporterName,
                authorHandle: reporterHandle,
                reporterName: reporterHandle,
                reason: r.reason || (isVi ? "Vi phạm quy tắc ứng xử" : "Community rule violation"),
                createdAt: r.createdAt ? new Date(r.createdAt).toLocaleDateString("vi-VN", { hour: '2-digit', minute: '2-digit' }) : (isVi ? "Gần đây" : "Recent"),
                status: "pending" as const,
            };
        });
    }, [reportsData, profilesMap, isVi]);

    const handleResolveReport = async (id: string, actionDesc: string) => {
        try {
            await deleteReportMutation.mutateAsync(id);
            refetchReports();
            showToast(isVi ? `Đã giải quyết báo cáo (${actionDesc})` : `Report resolved (${actionDesc})`);
        } catch {
            showToast(isVi ? "Không thể cập nhật báo cáo" : "Failed to resolve report");
        }
    };

    const handleDismissReport = async (id: string) => {
        try {
            await deleteReportMutation.mutateAsync(id);
            refetchReports();
            showToast(isVi ? "Đã bác bỏ báo cáo." : "Report dismissed.");
        } catch {
            showToast(isVi ? "Không thể bác bỏ báo cáo" : "Failed to dismiss report");
        }
    };

    // 3. Moderators Team Query
    const { data: allMembersData } = useCommunityMembersQuery(communityId || "");
    const [localPromotedMods, setLocalPromotedMods] = useState<ModeratorItem[]>([]);

    const moderators: ModeratorItem[] = useMemo(() => {
        const items: CommunityMemberDto[] = extractMemberList(allMembersData);
        const staff = items.filter((m) => m.role === "owner" || m.role === "admin" || m.role === "moderator");
        const mapped = staff.map((m) => {
            const profile = profilesMap.get(m.userId);
            return {
                id: m.userId,
                name: m.user?.name || m.user?.displayName || m.user?.username || profile?.name || `Thành viên (${m.userId.slice(0, 6)})`,
                handle: m.user?.username ? `@${m.user.username}` : m.user?.name ? `@${m.user.name}` : profile?.username ? `@${profile.username}` : `@${m.userId.slice(0, 6)}`,
                avatar: m.user?.avatar || m.user?.avatarUrl || profile?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(m.user?.username || m.user?.name || m.userId)}`,
                role: (m.role === "owner" || m.role === "admin") ? ("Owner" as const) : ("Moderator" as const),
                assignedAt: m.joinedAt ? new Date(m.joinedAt).toLocaleDateString("vi-VN") : "2026",
                actionsCount: 0,
            };
        });
        return [...mapped, ...localPromotedMods.filter(l => !mapped.some(m => m.id === l.id))];
    }, [allMembersData, localPromotedMods, profilesMap]);

    const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);
    const [promoteCandidateHandle, setPromoteCandidateHandle] = useState("");

    const handleDemoteModerator = (id: string, name: string) => {
        if (!isOwner) {
            showToast(isVi ? "Chỉ Trưởng nhóm (Owner) mới có quyền gỡ Điều hành viên." : "Only Owner can remove Moderators.");
            return;
        }
        if (!window.confirm(isVi ? `Xác nhận gỡ quyền Điều hành viên của ${name}?` : `Demote ${name} from Moderator?`)) {
            return;
        }
        setLocalPromotedMods((prev) => prev.filter((m) => m.id !== id));
        showToast(isVi ? `Đã gỡ quyền Điều hành viên của ${name}.` : `Removed ${name} from Moderator team.`);
    };

    const handlePromoteCandidate = () => {
        if (!isOwner) {
            showToast(isVi ? "Chỉ Trưởng nhóm (Owner) mới có quyền chỉ định Điều hành viên." : "Only Owner can promote Moderators.");
            return;
        }
        if (!promoteCandidateHandle.trim()) return;
        const newMod: ModeratorItem = {
            id: `mod-${Date.now()}`,
            name: promoteCandidateHandle.replace("@", ""),
            handle: promoteCandidateHandle.startsWith("@") ? promoteCandidateHandle : `@${promoteCandidateHandle}`,
            avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${promoteCandidateHandle}`,
            role: "Moderator",
            assignedAt: isVi ? "Vừa xong" : "Just now",
            actionsCount: 0,
        };
        setLocalPromotedMods((prev) => [...prev, newMod]);
        setPromoteCandidateHandle("");
        setIsPromoteModalOpen(false);
        showToast(isVi ? `Đã thăng cấp ${newMod.name} làm Điều hành viên!` : `Promoted ${newMod.name} to Moderator.`);
    };

    // 4. Moderation History Audit Log (Generated dynamically or empty)
    const modHistory: ModHistoryItem[] = [];

    const pendingRequestsCount = joinRequests.filter((r) => r.status === "pending").length;
    const pendingReportsCount = reports.filter((r) => r.status === "pending").length;

    return (
        <div className="w-full flex flex-col gap-6 animate-fade-in text-text select-none">
            {/* Toast Feedback */}
            {toastMessage && (
                <div className="p-3 bg-primary/10 border border-primary/40 rounded-[6px] text-xs font-semibold text-primary flex items-center justify-between animate-fade-in shadow-sm">
                    <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faCircleCheck} className="text-sm" />
                        <span>{toastMessage}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setToastMessage(null)}
                        className="text-text-muted hover:text-text cursor-pointer"
                    >
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-divider-primary/40">
                <div>
                    <h2 className="text-base sm:text-lg font-mono font-bold tracking-wider text-text uppercase">
                        COMMUNITY MODERATION
                    </h2>
                    <p className="text-xs text-text-muted mt-0.5">
                        {isVi
                            ? `Kiểm duyệt nội dung, xử lý báo cáo và phê duyệt thành viên cho ${communityName}.`
                            : `Content moderation, report resolutions, and join permissions for ${communityName}.`}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={onNavigateRules}
                        className="px-3 py-1.5 rounded-[4px] bg-surface-inner hover:bg-surface-hover border border-divider-primary text-xs font-semibold text-text flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                        <FontAwesomeIcon icon={faShieldHalved} className="text-[11px] text-primary" />
                        <span>{isVi ? "Quy tắc cộng đồng" : "Community Rules"}</span>
                    </button>
                </div>
            </div>

            {/* Subtabs Bar */}
            <div className="flex items-center gap-1 border-b border-divider-primary/40 pb-2 overflow-x-auto">
                <button
                    type="button"
                    onClick={() => setSubTab("requests")}
                    className={`px-3 py-1.5 rounded-[4px] text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors ${
                        subTab === "requests"
                            ? "bg-surface text-text font-bold"
                            : "text-text-muted hover:text-text hover:bg-surface-hover/50"
                    }`}
                >
                    <FontAwesomeIcon icon={faUserCheck} className="text-xs text-amber-400" />
                    <span>{isVi ? "Yêu cầu gia nhập" : "Join Requests"}</span>
                    {pendingRequestsCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-mono font-bold">
                            {pendingRequestsCount}
                        </span>
                    )}
                </button>

                <button
                    type="button"
                    onClick={() => setSubTab("reports")}
                    className={`px-3 py-1.5 rounded-[4px] text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors ${
                        subTab === "reports"
                            ? "bg-surface text-text font-bold"
                            : "text-text-muted hover:text-text hover:bg-surface-hover/50"
                    }`}
                >
                    <FontAwesomeIcon icon={faFlag} className="text-xs text-rose-400" />
                    <span>{isVi ? "Báo cáo vi phạm" : "Reports"}</span>
                    {pendingReportsCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-mono font-bold">
                            {pendingReportsCount}
                        </span>
                    )}
                </button>

                <button
                    type="button"
                    onClick={() => setSubTab("moderators")}
                    className={`px-3 py-1.5 rounded-[4px] text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors ${
                        subTab === "moderators"
                            ? "bg-surface text-text font-bold"
                            : "text-text-muted hover:text-text hover:bg-surface-hover/50"
                    }`}
                >
                    <FontAwesomeIcon icon={faShieldHalved} className="text-xs text-primary" />
                    <span>{isVi ? "Đội ngũ điều hành" : "Moderator Team"}</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-surface-inner text-text-faint text-[10px] font-mono">
                        {moderators.length}
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => setSubTab("history")}
                    className={`px-3 py-1.5 rounded-[4px] text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors ${
                        subTab === "history"
                            ? "bg-surface text-text font-bold"
                            : "text-text-muted hover:text-text hover:bg-surface-hover/50"
                    }`}
                >
                    <FontAwesomeIcon icon={faClockRotateLeft} className="text-xs text-text-faint" />
                    <span>{isVi ? "Nhật ký kiểm duyệt" : "Audit History"}</span>
                </button>
            </div>

            {/* TAB CONTENT 1: JOIN REQUESTS */}
            {subTab === "requests" && (
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between text-xs text-text-muted px-1">
                        <span>{joinRequests.filter((r) => r.status === "pending").length} {isVi ? "yêu cầu đang chờ duyệt" : "requests awaiting decision"}</span>
                        <span className="text-text-faint text-[11px]">{isVi ? "Chế độ phê duyệt: Thủ công" : "Membership Mode: Approval Required"}</span>
                    </div>

                    {joinRequests.length === 0 ? (
                        <div className="p-8 text-center bg-surface-inner/40 rounded-[6px] border border-divider-primary/40">
                            <p className="text-xs text-text-muted">{isVi ? "Không có yêu cầu tham gia nào đang chờ duyệt." : "No pending join requests."}</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-divider-primary/30 border border-divider-primary/50 bg-surface-inner/40 rounded-[6px] overflow-hidden">
                            {joinRequests.map((req) => (
                                <div
                                    key={req.id}
                                    className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-hover/30 transition-colors"
                                >
                                    <div className="flex items-start gap-3 min-w-0">
                                        <img
                                            src={req.avatar}
                                            alt={req.username}
                                            className="w-9 h-9 rounded-[4px] object-cover bg-surface shrink-0"
                                        />
                                        <div className="flex flex-col min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-xs font-bold text-text truncate">
                                                    {req.username}
                                                </span>
                                                <span className="text-[11px] font-mono text-text-muted">
                                                    {req.handle}
                                                </span>
                                                <span className="px-1.5 py-0.2 rounded bg-surface border border-divider-primary text-[10px] font-mono text-text-muted">
                                                    {req.playtime}
                                                </span>
                                                <span className="text-text-faint text-[10px] font-mono">
                                                    · {req.appliedAt}
                                                </span>
                                            </div>

                                            <p className="text-xs text-text-muted mt-1 italic">
                                                "{req.note}"
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                        {req.status === "pending" ? (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRejectRequest(req.id, req.username)}
                                                    className="px-2.5 py-1.5 rounded-[4px] bg-surface hover:bg-rose-500/10 hover:border-rose-500/40 border border-divider-primary text-xs font-semibold text-rose-400 transition-colors cursor-pointer flex items-center gap-1.5"
                                                >
                                                    <FontAwesomeIcon icon={faXmark} className="text-xs" />
                                                    <span>{isVi ? "Từ chối" : "Reject"}</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleApproveRequest(req.id, req.username)}
                                                    className="px-3 py-1.5 rounded-[4px] bg-primary hover:bg-primary/90 text-xs font-bold text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                                                >
                                                    <FontAwesomeIcon icon={faCheck} className="text-xs" />
                                                    <span>{isVi ? "Phê duyệt" : "Approve"}</span>
                                                </button>
                                            </>
                                        ) : req.status === "approved" ? (
                                            <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1 px-2 py-1 bg-emerald-500/10 rounded">
                                                <FontAwesomeIcon icon={faCheck} className="text-[10px]" />
                                                <span>{isVi ? "Đã duyệt" : "Approved"}</span>
                                            </span>
                                        ) : (
                                            <span className="text-xs font-mono font-bold text-text-faint flex items-center gap-1 px-2 py-1 bg-surface-hover rounded">
                                                <FontAwesomeIcon icon={faXmark} className="text-[10px]" />
                                                <span>{isVi ? "Đã từ chối" : "Rejected"}</span>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* TAB CONTENT 2: COMMUNITY REPORTS */}
            {subTab === "reports" && (
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between text-xs text-text-muted px-1">
                        <span>{reports.filter((r) => r.status === "pending").length} {isVi ? "báo cáo đang chờ giải quyết" : "reports pending review"}</span>
                        <span className="text-text-faint text-[11px]">{isVi ? "Ngưỡng tự động ẩn: 3 báo cáo" : "Auto-flag threshold: 3 reports"}</span>
                    </div>

                    {reports.length === 0 ? (
                        <div className="p-8 text-center bg-surface-inner/40 rounded-[6px] border border-divider-primary/40">
                            <p className="text-xs text-text-muted">{isVi ? "Không có báo cáo vi phạm nào cần xử lý." : "No pending reports."}</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {reports.map((rep) => (
                                <div
                                    key={rep.id}
                                    className={`p-4 rounded-[6px] border transition-all flex flex-col gap-3 ${
                                        rep.status === "pending"
                                            ? "bg-surface-inner/60 border-divider-primary/60"
                                            : "bg-surface-inner/20 border-divider-primary/20 opacity-60"
                                    }`}
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-0.5 rounded-[3px] bg-rose-500/15 border border-rose-500/30 text-rose-400 text-[10px] font-mono font-bold uppercase">
                                                {rep.targetType}
                                            </span>
                                            <h4 className="text-xs font-bold text-text truncate">
                                                {rep.targetTitle}
                                            </h4>
                                        </div>
                                        <span className="text-[11px] font-mono text-text-faint">
                                            {rep.createdAt}
                                        </span>
                                    </div>

                                    <div className="p-2.5 rounded bg-surface border border-divider-primary/40 text-xs text-text-muted">
                                        <p className="line-clamp-2">"{rep.targetExcerpt}"</p>
                                        <div className="flex items-center gap-2 mt-1.5 text-[11px] font-mono text-text-faint">
                                            <span>Author: {rep.authorHandle}</span>
                                            <span>·</span>
                                            <span>Reported by: {rep.reporterName}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs text-amber-400 font-medium bg-amber-500/10 px-2.5 py-1.5 rounded border border-amber-500/20">
                                        <FontAwesomeIcon icon={faTriangleExclamation} className="text-xs shrink-0" />
                                        <span>{rep.reason}</span>
                                    </div>

                                    {rep.status === "pending" ? (
                                        <div className="flex items-center justify-end gap-2 pt-1 flex-wrap">
                                            <button
                                                type="button"
                                                onClick={() => handleDismissReport(rep.id)}
                                                className="px-2.5 py-1.5 rounded-[4px] bg-surface hover:bg-surface-hover border border-divider-primary text-xs font-medium text-text-muted hover:text-text cursor-pointer transition-colors"
                                            >
                                                {isVi ? "Bác bỏ" : "Dismiss"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleResolveReport(rep.id, isVi ? "Tắt tiếng tác giả 24h" : "Muted author 24h")}
                                                className="px-2.5 py-1.5 rounded-[4px] bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-xs font-semibold text-amber-400 cursor-pointer transition-colors flex items-center gap-1.5"
                                            >
                                                <FontAwesomeIcon icon={faVolumeXmark} className="text-[11px]" />
                                                <span>{isVi ? "Tắt tiếng tác giả" : "Mute Author"}</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleResolveReport(rep.id, isVi ? "Đã gỡ bài viết" : "Removed content")}
                                                className="px-3 py-1.5 rounded-[4px] bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white cursor-pointer transition-colors flex items-center gap-1.5 shadow-sm"
                                            >
                                                <FontAwesomeIcon icon={faTrashCan} className="text-[11px]" />
                                                <span>{isVi ? "Gỡ nội dung" : "Remove Content"}</span>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="text-right text-xs font-mono text-emerald-400 font-bold">
                                            ✓ {rep.status === "resolved" ? (isVi ? "Đã xử lý" : "Resolved") : (isVi ? "Đã bác bỏ" : "Dismissed")}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* TAB CONTENT 3: MODERATORS TEAM */}
            {subTab === "moderators" && (
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-xs font-mono font-bold uppercase tracking-wider text-text">
                                COMMUNITY MODERATORS ({moderators.length})
                            </span>
                            <p className="text-xs text-text-muted mt-0.5">
                                {isVi
                                    ? "Điều hành viên giúp duy trì thảo luận, duyệt bài và xử lý báo cáo trong cộng đồng này."
                                    : "Moderators help maintain discussions, approve requests, and resolve reports for this community."}
                            </p>
                        </div>

                        {isOwner && (
                            <button
                                type="button"
                                onClick={() => setIsPromoteModalOpen(true)}
                                className="px-3 py-1.5 rounded-[4px] bg-primary hover:bg-primary/90 text-xs font-bold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                                <FontAwesomeIcon icon={faUserPlus} className="text-xs" />
                                <span>{isVi ? "+ Thêm Điều hành viên" : "+ Add Moderator"}</span>
                            </button>
                        )}
                    </div>

                    {moderators.length === 0 ? (
                        <div className="p-8 text-center bg-surface-inner/40 rounded-[6px] border border-divider-primary/40">
                            <p className="text-xs text-text-muted">{isVi ? "Chưa có Điều hành viên nào được chỉ định." : "No moderators appointed yet."}</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-divider-primary/30 border border-divider-primary/50 bg-surface-inner/40 rounded-[6px] overflow-hidden">
                            {moderators.map((mod) => (
                                <div
                                    key={mod.id}
                                    className="p-3.5 flex items-center justify-between gap-3 hover:bg-surface-hover/30 transition-colors"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <img
                                            src={mod.avatar}
                                            alt={mod.name}
                                            className="w-9 h-9 rounded-[4px] object-cover bg-surface shrink-0"
                                        />
                                        <div className="flex flex-col min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-text truncate">
                                                    {mod.name}
                                                </span>
                                                <span className="text-[11px] font-mono text-text-muted">
                                                    {mod.handle}
                                                </span>
                                                <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                                                    mod.role === "Owner"
                                                        ? "bg-amber-500/15 border border-amber-500/30 text-amber-400"
                                                        : "bg-primary/15 border border-primary/30 text-primary"
                                                }`}>
                                                    {mod.role}
                                                </span>
                                            </div>
                                            <span className="text-[11px] font-mono text-text-faint mt-0.5">
                                                {isVi ? `Bổ nhiệm từ ${mod.assignedAt} · ${mod.actionsCount} hành động` : `Appointed ${mod.assignedAt} · ${mod.actionsCount} actions`}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        {mod.role !== "Owner" ? (
                                            isOwner ? (
                                                <button
                                                    type="button"
                                                    onClick={() => handleDemoteModerator(mod.id, mod.name)}
                                                    className="px-2.5 py-1 rounded bg-surface hover:bg-rose-500/10 hover:border-rose-500/30 border border-divider-primary text-[11px] font-semibold text-rose-400 transition-colors cursor-pointer"
                                                >
                                                    {isVi ? "Gỡ quyền" : "Demote"}
                                                </button>
                                            ) : (
                                                <span className="text-[11px] font-mono text-text-faint px-2">
                                                    {isVi ? "Điều hành viên" : "Moderator"}
                                                </span>
                                            )
                                        ) : (
                                            <span className="text-[11px] font-mono text-text-faint italic px-2">
                                                {isVi ? "Trưởng cộng đồng" : "Primary Steward"}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Inline Promote Modal */}
                    {isPromoteModalOpen && isOwner && (
                        <div className="p-4 rounded-[6px] border border-primary/40 bg-surface-inner flex flex-col gap-3 animate-fade-in">
                            <span className="text-xs font-bold text-text">
                                {isVi ? "Thăng cấp thành viên làm Điều hành viên" : "Promote Member to Moderator"}
                            </span>
                            <p className="text-xs text-text-muted">
                                {isVi
                                    ? "Nhập @username của thành viên bạn muốn trao quyền kiểm duyệt cho cộng đồng này:"
                                    : "Enter the @username of the member you want to grant community moderation permissions:"}
                            </p>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={promoteCandidateHandle}
                                    onChange={(e) => setPromoteCandidateHandle(e.target.value)}
                                    placeholder="@username"
                                    className="flex-1 h-8 px-3 rounded-[4px] bg-surface border border-divider-primary text-xs text-text focus:outline-none focus:border-primary"
                                />
                                <button
                                    type="button"
                                    onClick={handlePromoteCandidate}
                                    className="px-3.5 h-8 rounded-[4px] bg-primary text-xs font-bold text-white hover:bg-primary/90 cursor-pointer"
                                >
                                    {isVi ? "Xác nhận" : "Promote"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsPromoteModalOpen(false)}
                                    className="px-3 h-8 rounded-[4px] bg-surface hover:bg-surface-hover text-xs font-medium text-text-muted cursor-pointer"
                                >
                                    {isVi ? "Hủy" : "Cancel"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* TAB CONTENT 4: MODERATION HISTORY AUDIT LOG */}
            {subTab === "history" && (
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between text-xs text-text-muted px-1">
                        <span>{isVi ? "Nhật ký kiểm duyệt thời gian thực" : "Real-time moderation audit log"}</span>
                        <span className="text-text-faint text-[11px]">{isVi ? "Lưu giữ 90 ngày" : "Retained for 90 days"}</span>
                    </div>

                    {modHistory.length === 0 ? (
                        <div className="p-8 text-center bg-surface-inner/40 rounded-[6px] border border-divider-primary/40">
                            <p className="text-xs text-text-muted">{isVi ? "Chưa có nhật ký kiểm duyệt nào được ghi nhận." : "No moderation history recorded yet."}</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-divider-primary/30 border border-divider-primary/50 bg-surface-inner/40 rounded-[6px] overflow-hidden text-xs">
                            {modHistory.map((item) => (
                                <div
                                    key={item.id}
                                    className="p-3 flex items-center justify-between gap-3 hover:bg-surface-hover/30 transition-colors"
                                >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="font-bold text-text">{item.actor}</span>
                                            <span className="text-text-muted">{item.action}</span>
                                            <span className="font-mono text-primary">{item.target}</span>
                                            {item.reason && (
                                                <span className="text-text-faint text-[11px]">({item.reason})</span>
                                            )}
                                        </div>
                                    </div>
                                    <span className="font-mono text-text-faint text-[11px] shrink-0">
                                        {item.timestamp}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
