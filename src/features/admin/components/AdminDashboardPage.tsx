import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import {
    ShieldCheck,
    Flag,
    Bug,
    Users,
    Buildings,
    Megaphone,
    CircleNotch,
    CheckCircle,
    XCircle,
    WarningCircle,
    PauseCircle,
    PlayCircle,
    Archive,
    PaperPlaneRight,
} from "@phosphor-icons/react";
import {
    reportsApi,
    feedbackApi,
    usersApi,
    communitiesApi,
    notificationsApi,
    extractReportList,
    extractCommunityList,
} from "@/shared/api";
import type {
    ReportDto,
    FeedbackDto,
    FeedbackStatus,
    CommunityDto,
} from "@/shared/api/types";
import { useAuthStore } from "@/features/auth";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { formatTimeAgo } from "@/shared/utils/formatTimeAgo";

type AdminTab = "reports" | "feedback" | "users" | "communities" | "announcements";

interface AdminUserRow {
    id: string;
    email: string;
    role: string;
    emailVerifiedAt?: string | null;
    createdAt?: string;
}

export function AdminDashboardPage() {
    useDocumentTitle("Bảng điều khiển Quản trị — Ludon");
    const navigate = useNavigate();
    const searchParams = useSearch({ strict: false }) as { tab?: string };
    const user = useAuthStore((s) => s.user);
    const authLoading = useAuthStore((s) => s.loading);

    const isAdmin = Boolean(
        user?.role === "admin" ||
        user?.email === "admin@ludon.com" ||
        user?.username === "LudonAdmin"
    );

    const initialTab: AdminTab =
        searchParams?.tab === "feedback" ||
        searchParams?.tab === "users" ||
        searchParams?.tab === "communities" ||
        searchParams?.tab === "announcements"
            ? searchParams.tab
            : "reports";

    const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);
    const [globalMsg, setGlobalMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

    // 1. Reports
    const [reports, setReports] = useState<ReportDto[]>([]);
    const [loadingReports, setLoadingReports] = useState(false);
    const [reportFilter, setReportFilter] = useState<string>("pending");
    const [resolvingId, setResolvingId] = useState<string | null>(null);

    // 2. Feedback
    const [feedbacks, setFeedbacks] = useState<FeedbackDto[]>([]);
    const [loadingFeedback, setLoadingFeedback] = useState(false);
    const [feedbackStatusFilter, setFeedbackStatusFilter] = useState<"" | FeedbackStatus>("");
    const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
    const [updatingFbId, setUpdatingFbId] = useState<string | null>(null);

    // 3. Users
    const [users, setUsers] = useState<AdminUserRow[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    // 4. Communities
    const [communities, setCommunities] = useState<CommunityDto[]>([]);
    const [loadingComms, setLoadingComms] = useState(false);
    const [commActionId, setCommActionId] = useState<string | null>(null);

    // 5. System Announcement
    const [annTitle, setAnnTitle] = useState("");
    const [annContent, setAnnContent] = useState("");
    const [annLink, setAnnLink] = useState("");
    const [sendingAnn, setSendingAnn] = useState(false);

    const loadReports = useCallback(async () => {
        setLoadingReports(true);
        try {
            const raw = await reportsApi.getAll(
                reportFilter !== "all" ? { status: reportFilter, limit: 50 } : { limit: 50 }
            );
            setReports(extractReportList(raw));
        } catch (err: unknown) {
            setGlobalMsg({ type: "err", text: err instanceof Error ? err.message : "Không thể tải danh sách báo cáo." });
        } finally {
            setLoadingReports(false);
        }
    }, [reportFilter]);

    const loadFeedbacks = useCallback(async () => {
        setLoadingFeedback(true);
        try {
            const res = await feedbackApi.getAll({
                page: 1,
                limit: 50,
                status: feedbackStatusFilter || undefined,
            });
            setFeedbacks(Array.isArray(res?.data) ? res.data : []);
        } catch (err: unknown) {
            setGlobalMsg({ type: "err", text: err instanceof Error ? err.message : "Không thể tải danh sách phản hồi." });
        } finally {
            setLoadingFeedback(false);
        }
    }, [feedbackStatusFilter]);

    const loadUsers = useCallback(async () => {
        setLoadingUsers(true);
        try {
            const raw = (await usersApi.getAll()) as unknown;
            const list = Array.isArray(raw)
                ? raw
                : raw && typeof raw === "object" && Array.isArray((raw as { data?: unknown[] }).data)
                ? (raw as { data: AdminUserRow[] }).data
                : [];
            setUsers(list as AdminUserRow[]);
        } catch (err: unknown) {
            setGlobalMsg({ type: "err", text: err instanceof Error ? err.message : "Không thể tải danh sách người dùng." });
        } finally {
            setLoadingUsers(false);
        }
    }, []);

    const loadCommunities = useCallback(async () => {
        setLoadingComms(true);
        try {
            const raw = await communitiesApi.getAll({ limit: 50 });
            setCommunities(extractCommunityList(raw));
        } catch (err: unknown) {
            setGlobalMsg({ type: "err", text: err instanceof Error ? err.message : "Không thể tải danh sách cộng đồng." });
        } finally {
            setLoadingComms(false);
        }
    }, []);

    useEffect(() => {
        if (!isAdmin) return;
        setGlobalMsg(null);
        if (activeTab === "reports") void loadReports();
        if (activeTab === "feedback") void loadFeedbacks();
        if (activeTab === "users") void loadUsers();
        if (activeTab === "communities") void loadCommunities();
    }, [isAdmin, activeTab, loadReports, loadFeedbacks, loadUsers, loadCommunities]);

    const handleResolveReport = async (id: string, status: "resolved" | "dismissed") => {
        setResolvingId(id);
        setGlobalMsg(null);
        try {
            await reportsApi.resolve(id, { status });
            setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
            setGlobalMsg({ type: "ok", text: `Đã cập nhật báo cáo thành "${status}".` });
        } catch (err: unknown) {
            setGlobalMsg({ type: "err", text: err instanceof Error ? err.message : "Không thể xử lý báo cáo." });
        } finally {
            setResolvingId(null);
        }
    };

    const handleUpdateFeedback = async (id: string, status: FeedbackStatus) => {
        setUpdatingFbId(id);
        setGlobalMsg(null);
        try {
            const note = adminNotes[id];
            const updated = await feedbackApi.updateStatus(id, {
                status,
                ...(note !== undefined ? { adminNote: note } : {}),
            });
            setFeedbacks((prev) => prev.map((f) => (f.id === id ? updated : f)));
            setGlobalMsg({ type: "ok", text: "Đã cập nhật trạng thái phản hồi." });
        } catch (err: unknown) {
            setGlobalMsg({ type: "err", text: err instanceof Error ? err.message : "Không thể cập nhật phản hồi." });
        } finally {
            setUpdatingFbId(null);
        }
    };

    const handleCommunityAction = async (id: string, action: "suspend" | "archive" | "reactivate") => {
        setCommActionId(id);
        setGlobalMsg(null);
        try {
            if (action === "suspend") await communitiesApi.suspend(id);
            if (action === "archive") await communitiesApi.archive(id);
            if (action === "reactivate") await communitiesApi.reactivate(id);
            setGlobalMsg({ type: "ok", text: `Đã thực hiện thao tác "${action}" cho cộng đồng.` });
            void loadCommunities();
        } catch (err: unknown) {
            setGlobalMsg({ type: "err", text: err instanceof Error ? err.message : "Thao tác cộng đồng thất bại." });
        } finally {
            setCommActionId(null);
        }
    };

    const handleSendAnnouncement = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!annTitle.trim() || !annContent.trim()) return;
        setSendingAnn(true);
        setGlobalMsg(null);
        try {
            const res = await notificationsApi.createSystemAnnouncement({
                title: annTitle.trim(),
                content: annContent.trim(),
                ...(annLink.trim() ? { link: annLink.trim() } : {}),
            });
            setAnnTitle("");
            setAnnContent("");
            setAnnLink("");
            setGlobalMsg({
                type: "ok",
                text: `Đã phát thông báo hệ thống thành công tới ${res?.deliveredCount ?? 0} người dùng!`,
            });
        } catch (err: unknown) {
            setGlobalMsg({ type: "err", text: err instanceof Error ? err.message : "Không thể gửi thông báo hệ thống." });
        } finally {
            setSendingAnn(false);
        }
    };

    if (!authLoading && !isAdmin) {
        return (
            <div className="max-w-lg mx-auto my-12 p-8 rounded-2xl bg-surface border border-border text-center space-y-4">
                <WarningCircle className="size-10 text-rose-400 mx-auto" />
                <h2 className="text-lg font-black text-text">Không có quyền truy cập (403)</h2>
                <p className="text-xs text-text-muted">
                    Trang này chỉ dành cho Quản trị viên hệ thống (ADMIN).
                </p>
                <button
                    type="button"
                    onClick={() => navigate({ to: "/" })}
                    className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold cursor-pointer"
                >
                    Về trang chủ
                </button>
            </div>
        );
    }

    const tabs: Array<{ id: AdminTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
        { id: "reports", label: "Báo cáo vi phạm", icon: Flag },
        { id: "feedback", label: "Phản hồi & Bug", icon: Bug },
        { id: "users", label: "Người dùng", icon: Users },
        { id: "communities", label: "Cộng đồng", icon: Buildings },
        { id: "announcements", label: "Thông báo hệ thống", icon: Megaphone },
    ];

    return (
        <div className="w-full max-w-6xl mx-auto py-4 space-y-6 text-text">
            {/* Header */}
            <div className="p-5 rounded-2xl bg-surface border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                <div>
                    <h1 className="text-xl font-black text-text flex items-center gap-2">
                        <ShieldCheck className="size-6 text-rose-400" />
                        <span>Bảng điều khiển Quản trị (Admin)</span>
                    </h1>
                    <p className="text-xs text-text-muted mt-0.5">
                        Kiểm duyệt báo cáo, xử lý phản hồi người dùng, quản lý cộng đồng và phát thông báo toàn hệ thống.
                    </p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1.5 flex-wrap">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const active = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
                                active
                                    ? "bg-primary text-white shadow-sm"
                                    : "bg-surface text-text-muted hover:text-text hover:bg-surface-hover"
                            }`}
                        >
                            <Icon className="size-4" />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {globalMsg && (
                <div
                    className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
                        globalMsg.type === "ok"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-rose-500/10 text-rose-400"
                    }`}
                >
                    {globalMsg.type === "ok" ? (
                        <CheckCircle className="size-4 shrink-0" />
                    ) : (
                        <WarningCircle className="size-4 shrink-0" />
                    )}
                    <span>{globalMsg.text}</span>
                </div>
            )}

            {/* Tab Content Surface */}
            <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-border/80 shadow-lg min-h-[420px]">
                {/* TAB 1: REPORTS */}
                {activeTab === "reports" && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <h2 className="text-sm font-extrabold uppercase tracking-wider">Danh sách báo cáo ({reports.length})</h2>
                            <select
                                value={reportFilter}
                                onChange={(e) => setReportFilter(e.target.value)}
                                className="bg-surface-inner rounded-xl px-3 py-1.5 text-xs font-semibold text-text"
                            >
                                <option value="pending">Chờ xử lý (Pending)</option>
                                <option value="resolved">Đã xử lý (Resolved)</option>
                                <option value="dismissed">Đã bỏ qua (Dismissed)</option>
                                <option value="all">Tất cả</option>
                            </select>
                        </div>

                        {loadingReports ? (
                            <div className="py-10 text-center text-xs text-text-muted">
                                <CircleNotch className="size-5 animate-spin text-primary mx-auto mb-2" />
                                Đang tải báo cáo...
                            </div>
                        ) : reports.length === 0 ? (
                            <p className="py-10 text-center text-xs text-text-muted">Không có báo cáo nào trong mục này.</p>
                        ) : (
                            <div className="space-y-3">
                                {reports.map((r) => (
                                    <div key={r.id} className="p-4 rounded-xl bg-surface-inner flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="space-y-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="px-2 py-0.5 rounded bg-rose-500/15 text-rose-400 text-[10px] font-extrabold uppercase">
                                                    {r.targetType}
                                                </span>
                                                <span className="text-xs font-bold text-text truncate">
                                                    Target: {r.targetId}
                                                </span>
                                                <span className="px-2 py-0.5 rounded-full bg-surface text-[10px] font-bold text-text-muted">
                                                    {r.status}
                                                </span>
                                            </div>
                                            <p className="text-xs text-text-muted">{r.reason}</p>
                                            {r.createdAt && (
                                                <p className="text-[10px] text-text-faint">{formatTimeAgo(r.createdAt)}</p>
                                            )}
                                        </div>

                                        {r.status === "pending" && (
                                            <div className="flex items-center gap-2 shrink-0">
                                                <button
                                                    type="button"
                                                    disabled={resolvingId === r.id}
                                                    onClick={() => handleResolveReport(r.id, "resolved")}
                                                    className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-bold flex items-center gap-1 cursor-pointer"
                                                >
                                                    <CheckCircle className="size-3.5" />
                                                    <span>Xử lý</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={resolvingId === r.id}
                                                    onClick={() => handleResolveReport(r.id, "dismissed")}
                                                    className="px-3 py-1.5 rounded-lg bg-surface hover:bg-surface-hover text-text-muted text-xs font-bold flex items-center gap-1 cursor-pointer"
                                                >
                                                    <XCircle className="size-3.5" />
                                                    <span>Bỏ qua</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 2: FEEDBACK */}
                {activeTab === "feedback" && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <h2 className="text-sm font-extrabold uppercase tracking-wider">Phản hồi & Báo lỗi ({feedbacks.length})</h2>
                            <select
                                value={feedbackStatusFilter}
                                onChange={(e) => setFeedbackStatusFilter(e.target.value as "" | FeedbackStatus)}
                                className="bg-surface-inner rounded-xl px-3 py-1.5 text-xs font-semibold text-text"
                            >
                                <option value="">Tất cả trạng thái</option>
                                <option value="open">Mới tiếp nhận (Open)</option>
                                <option value="reviewed">Đang xem xét (Reviewed)</option>
                                <option value="resolved">Đã xử lý (Resolved)</option>
                            </select>
                        </div>

                        {loadingFeedback ? (
                            <div className="py-10 text-center text-xs text-text-muted">
                                <CircleNotch className="size-5 animate-spin text-primary mx-auto mb-2" />
                                Đang tải phản hồi...
                            </div>
                        ) : feedbacks.length === 0 ? (
                            <p className="py-10 text-center text-xs text-text-muted">Chưa có phản hồi nào.</p>
                        ) : (
                            <div className="space-y-3">
                                {feedbacks.map((fb) => (
                                    <div key={fb.id} className="p-4 rounded-xl bg-surface-inner space-y-2.5">
                                        <div className="flex items-center justify-between gap-2 flex-wrap">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                                                        fb.type === "bug"
                                                            ? "bg-rose-500/15 text-rose-400"
                                                            : "bg-primary/15 text-primary"
                                                    }`}
                                                >
                                                    {fb.type}
                                                </span>
                                                <span className="text-xs font-bold text-text">{fb.title}</span>
                                            </div>
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface text-text-muted">
                                                {fb.status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-text-muted whitespace-pre-wrap">{fb.description}</p>
                                        <div className="flex flex-col sm:flex-row gap-2 pt-1">
                                            <input
                                                type="text"
                                                value={adminNotes[fb.id] ?? fb.adminNote ?? ""}
                                                onChange={(e) =>
                                                    setAdminNotes((prev) => ({ ...prev, [fb.id]: e.target.value }))
                                                }
                                                placeholder="Ghi chú phản hồi cho người gửi..."
                                                className="flex-1 bg-surface rounded-lg px-3 py-1.5 text-xs text-text focus:outline-none focus:ring-1 focus:ring-primary"
                                            />
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <button
                                                    type="button"
                                                    disabled={updatingFbId === fb.id}
                                                    onClick={() => handleUpdateFeedback(fb.id, "reviewed")}
                                                    className="px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-400 text-xs font-bold cursor-pointer"
                                                >
                                                    Đang xem xét
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={updatingFbId === fb.id}
                                                    onClick={() => handleUpdateFeedback(fb.id, "resolved")}
                                                    className="px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 text-xs font-bold cursor-pointer"
                                                >
                                                    Đã xử lý
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 3: USERS */}
                {activeTab === "users" && (
                    <div className="space-y-4">
                        <h2 className="text-sm font-extrabold uppercase tracking-wider">Danh sách tài khoản ({users.length})</h2>
                        {loadingUsers ? (
                            <div className="py-10 text-center text-xs text-text-muted">
                                <CircleNotch className="size-5 animate-spin text-primary mx-auto mb-2" />
                                Đang tải danh sách tài khoản...
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="border-b border-border/70 text-[11px] uppercase text-text-muted">
                                        <tr>
                                            <th className="py-2.5 pr-4">Email</th>
                                            <th className="py-2.5 pr-4">Vai trò</th>
                                            <th className="py-2.5 pr-4">Xác minh Email</th>
                                            <th className="py-2.5">Ngày tạo</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/40">
                                        {users.map((u) => (
                                            <tr key={u.id} className="hover:bg-surface-inner/60">
                                                <td className="py-2.5 pr-4 font-semibold text-text">{u.email}</td>
                                                <td className="py-2.5 pr-4">
                                                    <span
                                                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                            u.role === "admin"
                                                                ? "bg-rose-500/15 text-rose-400"
                                                                : "bg-surface-inner text-text-muted"
                                                        }`}
                                                    >
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="py-2.5 pr-4">
                                                    {u.emailVerifiedAt ? (
                                                        <span className="text-emerald-400 font-semibold">Đã xác minh</span>
                                                    ) : (
                                                        <span className="text-amber-400 font-semibold">Chưa xác minh</span>
                                                    )}
                                                </td>
                                                <td className="py-2.5 text-text-muted">
                                                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 4: COMMUNITIES */}
                {activeTab === "communities" && (
                    <div className="space-y-4">
                        <h2 className="text-sm font-extrabold uppercase tracking-wider">Quản lý cộng đồng ({communities.length})</h2>
                        {loadingComms ? (
                            <div className="py-10 text-center text-xs text-text-muted">
                                <CircleNotch className="size-5 animate-spin text-primary mx-auto mb-2" />
                                Đang tải cộng đồng...
                            </div>
                        ) : (
                            <div className="space-y-2.5">
                                {communities.map((c) => (
                                    <div key={c.id} className="p-3.5 rounded-xl bg-surface-inner flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-text truncate">{c.name}</p>
                                            <p className="text-[11px] text-text-muted truncate">{c.description || "Không có mô tả"}</p>
                                        </div>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <button
                                                type="button"
                                                disabled={commActionId === c.id}
                                                onClick={() => handleCommunityAction(c.id, "suspend")}
                                                className="px-2.5 py-1.5 rounded-lg bg-amber-500/15 text-amber-400 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                                            >
                                                <PauseCircle className="size-3.5" />
                                                <span>Tạm ngưng</span>
                                            </button>
                                            <button
                                                type="button"
                                                disabled={commActionId === c.id}
                                                onClick={() => handleCommunityAction(c.id, "archive")}
                                                className="px-2.5 py-1.5 rounded-lg bg-surface text-text-muted text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                                            >
                                                <Archive className="size-3.5" />
                                                <span>Lưu trữ</span>
                                            </button>
                                            <button
                                                type="button"
                                                disabled={commActionId === c.id}
                                                onClick={() => handleCommunityAction(c.id, "reactivate")}
                                                className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                                            >
                                                <PlayCircle className="size-3.5" />
                                                <span>Kích hoạt lại</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 5: SYSTEM ANNOUNCEMENTS */}
                {activeTab === "announcements" && (
                    <form onSubmit={handleSendAnnouncement} className="space-y-4 max-w-2xl">
                        <h2 className="text-sm font-extrabold uppercase tracking-wider">Phát thông báo toàn hệ thống</h2>
                        <p className="text-xs text-text-muted">
                            Thông báo sẽ được lưu vào hộp thư thông báo và đẩy realtime qua Socket.IO đến toàn bộ người dùng Ludon.
                        </p>

                        <div className="space-y-1">
                            <label className="text-xs font-bold block">Tiêu đề thông báo *</label>
                            <input
                                type="text"
                                required
                                value={annTitle}
                                onChange={(e) => setAnnTitle(e.target.value)}
                                placeholder="VD: Cập nhật tính năng Tìm đội & Tin nhắn trực tiếp!"
                                className="w-full bg-surface-inner rounded-xl px-4 py-2.5 text-xs text-text focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold block">Nội dung *</label>
                            <textarea
                                rows={4}
                                required
                                value={annContent}
                                onChange={(e) => setAnnContent(e.target.value)}
                                placeholder="Nội dung chi tiết thông báo..."
                                className="w-full bg-surface-inner rounded-xl p-4 text-xs text-text focus:outline-none focus:ring-1 focus:ring-primary resize-y"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold block">Đường dẫn đích (tuỳ chọn)</label>
                            <input
                                type="text"
                                value={annLink}
                                onChange={(e) => setAnnLink(e.target.value)}
                                placeholder="VD: /squad hoặc /messages"
                                className="w-full bg-surface-inner rounded-xl px-4 py-2.5 text-xs text-text focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={sendingAnn || !annTitle.trim() || !annContent.trim()}
                            className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 cursor-pointer"
                        >
                            {sendingAnn ? (
                                <CircleNotch className="size-4 animate-spin" />
                            ) : (
                                <PaperPlaneRight className="size-4" />
                            )}
                            <span>Phát thông báo ngay</span>
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
