import { useTranslation } from "@/shared/hooks/useTranslate";
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
    const { t } = useTranslation();
    const [subTabOverride, setSubTabOverride] = useState<"queue" | "requests" | "moderators" | "history" | null>(null);
    const [prevInitialTab, setPrevInitialTab] = useState(initialTab);

    if (prevInitialTab !== initialTab) {
        setPrevInitialTab(initialTab);
        setSubTabOverride(null);
    }

    const subTab = subTabOverride || initialTab;
    const setSubTab = (tab: "requests" | "reports" | "moderators" | "history") => {
        setSubTabOverride(tab);
    };
    const [reportFilter, setReportFilter] = useState<"all" | "pending" | "resolved" | "dismissed">("all");
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
                note: t('hub.communitymanagemoderation_82'),
                playtime: "—",
                appliedAt: m.joinedAt ? new Date(m.joinedAt).toLocaleDateString("vi-VN") : (t('hub.communitymanagemoderation_83')),
                status: "pending" as const,
            };
        });
    }, [pendingMembersData, profilesMap, isVi]);

    const handleApproveRequest = async (id: string, name: string) => {
        try {
            await approveMutation.mutateAsync({ communityId: communityId || "", memberId: id });
            refetchPending();
            showToast(isVi ? `Đã phê duyệt ${name} vào cộng đồng!` : `Approved ${name}'s join request.`);
        } catch {
            showToast(isVi ? `Lỗi khi phê duyệt ${name}` : `Failed to approve ${name}`);
        }
    };

    const handleRejectRequest = async (id: string, name: string) => {
        try {
            await rejectMutation.mutateAsync({ communityId: communityId || "", memberId: id });
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
                (t('hub.communitymanagemoderation_84'));
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
                reason: r.reason || (t('hub.communitymanagemoderation_85')),
                createdAt: r.createdAt ? new Date(r.createdAt).toLocaleDateString("vi-VN", { hour: '2-digit', minute: '2-digit' }) : (t('hub.communitymanagemoderation_86')),
                status,
            };
        });
    }, [reportsData, profilesMap, isVi]);

    const handleResolveReport = async (id: string, actionDesc: string) => {
        try {
            await deleteReportMutation.mutateAsync(id);
            refetchReports();
            showToast(isVi ? `Đã giải quyết báo cáo (${actionDesc})` : `Report resolved (${actionDesc})`);
        } catch {
            showToast(t('hub.communitymanagemoderation_87'));
        }
    };

    const handleDismissReport = async (id: string) => {
        try {
            await deleteReportMutation.mutateAsync(id);
            refetchReports();
            showToast(t('hub.communitymanagemoderation_88'));
        } catch {
            showToast(t('hub.communitymanagemoderation_89'));
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
            showToast(t('hub.communitymanagemoderation_90'));
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
            showToast(t('hub.communitymanagemoderation_91'));
            return;
        }
        if (!promoteCandidateHandle.trim()) return;
        const newMod: ModeratorItem = {
            id: `mod-${Date.now()}`,
            name: promoteCandidateHandle.replace("@", ""),
            handle: promoteCandidateHandle.startsWith("@") ? promoteCandidateHandle : `@${promoteCandidateHandle}`,
            avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${promoteCandidateHandle}`,
            role: "Moderator",
            assignedAt: t('hub.communitymanagemoderation_92'),
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
                        <span>{t('hub.communitymanagemoderation_93')}</span>
                    </button>
                </div>
            </div>

            {/* Subtabs Bar */}
            <div className="flex items-center gap-4 text-xs font-bold border-b border-divider-primary/40 pb-2">
                <button
                    type="button"
                    onClick={() => setSubTabOverride("queue")}
                    className={`flex items-center gap-2 pb-2 -mb-2 border-b-2 transition-colors cursor-pointer ${
                        subTab === "queue"
                            ? "border-primary text-text"
                            : "border-transparent text-text-muted hover:text-text"
                    }`}
                >
                    <span className="uppercase tracking-wider">Queue</span>
                    {(pendingRequestsCount > 0 || (reports && reports.filter(r => r.status === 'pending').length > 0)) && (
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${subTab === "queue" ? "bg-primary/20 text-primary" : "bg-rose-500/10 text-rose-500"}`}>
                            {pendingRequestsCount + (reports ? reports.filter(r => r.status === 'pending').length : 0)}
                        </span>
                    )}
                </button>

                <button
                    type="button"
                    onClick={() => setSubTabOverride("requests")}
                    className={`flex items-center gap-2 pb-2 -mb-2 border-b-2 transition-colors cursor-pointer ${
                        subTab === "requests"
                            ? "border-primary text-text"
                            : "border-transparent text-text-muted hover:text-text"
                    }`}
                >
                    <span className="uppercase tracking-wider">Join Requests</span>
                    {pendingRequestsCount > 0 && (
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${subTab === "requests" ? "bg-primary/20 text-primary" : "bg-surface-inner text-text-faint"}`}>
                            {pendingRequestsCount}
                        </span>
                    )}
                </button>

                <button
                    type="button"
                    onClick={() => setSubTabOverride("moderators")}
                    className={`flex items-center gap-2 pb-2 -mb-2 border-b-2 transition-colors cursor-pointer ${
                        subTab === "moderators"
                            ? "border-primary text-text"
                            : "border-transparent text-text-muted hover:text-text"
                    }`}
                >
                    <span className="uppercase tracking-wider">Moderator Team</span>
                </button>

                <button
                    type="button"
                    onClick={() => setSubTabOverride("history")}
                    className={`flex items-center gap-2 pb-2 -mb-2 border-b-2 transition-colors cursor-pointer ${
                        subTab === "history"
                            ? "border-primary text-text"
                            : "border-transparent text-text-muted hover:text-text"
                    }`}
                >
                    <span className="uppercase tracking-wider">Audit Log</span>
                </button>
            </div>

            {/* TAB CONTENT 0: QUEUE */}
            {subTab === "queue" && (
                <div className="flex flex-col gap-6 animate-fade-in">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-sm font-bold text-text uppercase tracking-wider">Moderation Queue</h2>
                        <p className="text-xs text-text-muted">
                            {pendingRequestsCount + (reports ? reports.filter(r => r.status === 'pending').length : 0)} items need attention
                        </p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <h3 className="text-xs font-bold text-text-faint uppercase tracking-wider mb-1">Pending Reports</h3>
                        {reports && reports.filter(r => r.status === 'pending').length > 0 ? (
                            reports.filter(r => r.status === 'pending').slice(0, 3).map((report) => (
                                <div key={report.id} className="p-3 bg-surface border border-divider-primary/30 rounded-lg flex flex-col gap-2">
                                    <div className="flex justify-between items-center text-[10px] font-mono text-text-faint">
                                        <span className="uppercase text-amber-500 font-bold">{report.targetType} reported</span>
                                        <span>{report.createdAt}</span>
                                    </div>
                                    <p className="text-xs text-text line-clamp-2">"{report.targetExcerpt}"</p>
                                    <button onClick={() => setSubTabOverride("reports")} className="text-xs font-bold text-primary self-start hover:underline mt-1">Review Report →</button>
                                </div>
                            ))
                        ) : (
                            <p className="text-xs text-text-muted">No pending reports.</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-3 mt-2">
                        <h3 className="text-xs font-bold text-text-faint uppercase tracking-wider mb-1">Join Requests</h3>
                        {pendingRequestsCount > 0 ? (
                            <p className="text-xs text-text-muted">
                                There are {pendingRequestsCount} users waiting to join. <button onClick={() => setSubTabOverride("requests")} className="text-primary font-bold hover:underline">Review Requests →</button>
                            </p>
                        ) : (
                            <p className="text-xs text-text-muted">No pending join requests.</p>
                        )}
                    </div>
                </div>
            )}

            {/* TAB CONTENT 1: JOIN REQUESTS */}
            {subTab === "requests" && (
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between text-xs text-text-muted px-1">
                        <span>{joinRequests.filter((r) => r.status === "pending").length} {t('hub.communitymanagemoderation_98')}</span>
                        <span className="text-text-faint text-[11px]">{t('hub.communitymanagemoderation_99')}</span>
                    </div>

                    {joinRequests.length === 0 ? (
                        <div className="p-8 text-center bg-surface-inner/40 rounded-[6px] border border-divider-primary/40">
                            <p className="text-xs text-text-muted">{t('hub.communitymanagemoderation_100')}</p>
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
                                                    <span>{t('hub.communitymanagemoderation_101')}</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleApproveRequest(req.id, req.username)}
                                                    className="px-3 py-1.5 rounded-[4px] bg-primary hover:bg-primary/90 text-xs font-bold text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                                                >
                                                    <FontAwesomeIcon icon={faCheck} className="text-xs" />
                                                    <span>{t('hub.communitymanagemoderation_102')}</span>
                                                </button>
                                            </>
                                        ) : req.status === "approved" ? (
                                            <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1 px-2 py-1 bg-emerald-500/10 rounded">
                                                <FontAwesomeIcon icon={faCheck} className="text-[10px]" />
                                                <span>{t('hub.communitymanagemoderation_103')}</span>
                                            </span>
                                        ) : (
                                            <span className="text-xs font-mono font-bold text-text-faint flex items-center gap-1 px-2 py-1 bg-surface-hover rounded">
                                                <FontAwesomeIcon icon={faXmark} className="text-[10px]" />
                                                <span>{t('hub.communitymanagemoderation_104')}</span>
                                            </span>
                                        )}
                                    </div>
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
                                {t('hub.communitymanagemoderation_118')}
                            </p>
                        </div>

                        {isOwner && (
                            <button
                                type="button"
                                onClick={() => setIsPromoteModalOpen(true)}
                                className="px-3 py-1.5 rounded-[4px] bg-primary hover:bg-primary/90 text-xs font-bold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                                <FontAwesomeIcon icon={faUserPlus} className="text-xs" />
                                <span>{t('hub.communitymanagemoderation_119')}</span>
                            </button>
                        )}
                    </div>

                    {moderators.length === 0 ? (
                        <div className="p-8 text-center bg-surface-inner/40 rounded-[6px] border border-divider-primary/40">
                            <p className="text-xs text-text-muted">{t('hub.communitymanagemoderation_120')}</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-divider-primary/30 border border-divider-primary/50 bg-surface-inner/40 rounded-[6px] overflow-hidden">
                            {moderators.map((mod, idx) => (
                                <div
                                    key={`${mod.id}-${idx}`}
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
                                                {isVi ? `Bổ nhiệm từ ${mod.assignedAt} ` : `Appointed ${mod.assignedAt} `}
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
                                                    {t('hub.communitymanagemoderation_121')}
                                                </button>
                                            ) : (
                                                <span className="text-[11px] font-mono text-text-faint px-2">
                                                    {t('hub.communitymanagemoderation_122')}
                                                </span>
                                            )
                                        ) : (
                                            <span className="text-[11px] font-mono text-text-faint italic px-2">
                                                {t('hub.communitymanagemoderation_123')}
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
                                {t('hub.communitymanagemoderation_124')}
                            </span>
                            <p className="text-xs text-text-muted">
                                {t('hub.communitymanagemoderation_125')}
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
                                    {t('hub.communitymanagemoderation_126')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsPromoteModalOpen(false)}
                                    className="px-3 h-8 rounded-[4px] bg-surface hover:bg-surface-hover text-xs font-medium text-text-muted cursor-pointer"
                                >
                                    {t('hub.communitymanagemoderation_127')}
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
                        <span>{t('hub.communitymanagemoderation_128')}</span>
                        <span className="text-text-faint text-[11px]">{t('hub.communitymanagemoderation_129')}</span>
                    </div>

                    {modHistory.length === 0 ? (
                        <div className="p-8 text-center bg-surface-inner/40 rounded-[6px] border border-divider-primary/40">
                            <p className="text-xs text-text-muted">{t('hub.communitymanagemoderation_130')}</p>
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
