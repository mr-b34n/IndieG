import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faShieldHalved,
    faUsers,
    faFlag,
    faSearch,
    faBan,
    faCheckCircle,
    faTrash,
    faXmark,
    faUserCheck,
    faExclamationTriangle,
    faLock,
    faFilter,
    faClock,
    faRotateRight,
    faListCheck,
    faEye,
    faUser,
    faShieldCat
} from "@fortawesome/free-solid-svg-icons";
import { adminApi, type Report, type AdminUser } from "@/features/report";
import { useAuthStore } from "@/features/auth";

export const Route = createFileRoute("/_layout/admin/")({
    component: AdminPage,
});

function AdminPage() {
    const user = useAuthStore((state) => state.user);
    const mockLogin = useAuthStore((state) => state.mockLogin);
    const currentUserRole = user?.role || (mockLogin ? "admin" : "user");
    const isAdmin = currentUserRole === "admin";

    const [activeTab, setActiveTab] = useState<"reports" | "users">("reports");

    // Filter & Search States
    const [reportStatusFilter, setReportStatusFilter] = useState<"all" | "pending" | "resolved" | "rejected">("pending");
    const [reportTypeFilter, setReportTypeFilter] = useState<"all" | "post" | "comment" | "user">("all");

    const [userSearch, setUserSearch] = useState("");
    const [userStatusFilter, setUserStatusFilter] = useState<"all" | "active" | "banned">("all");

    const [usersList, setUsersList] = useState<AdminUser[]>([]);
    const [usersLoading, setUsersLoading] = useState(false);

    const [reportsList, setReportsList] = useState<Report[]>([]);
    const [reportsLoading, setReportsLoading] = useState(false);

    const [authError, setAuthError] = useState<string | null>(null);
    const [actionMessage, setActionMessage] = useState<string | null>(null);

    // Detail View Modals (View User & View Report)
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);

    // Load initial data function
    const loadData = async () => {
        setReportsLoading(true);
        setUsersLoading(true);
        setAuthError(null);

        const [repRes, userRes] = await Promise.all([
            adminApi.listReports(currentUserRole),
            adminApi.listUsers("", currentUserRole),
        ]);

        if (repRes.success && repRes.data) {
            setReportsList(repRes.data);
        } else if (repRes.error) {
            setAuthError(repRes.error);
        }

        if (userRes.success && userRes.data) {
            setUsersList(userRes.data);
        } else if (userRes.error) {
            setAuthError(userRes.error);
        }

        setReportsLoading(false);
        setUsersLoading(false);
    };

    useEffect(() => {
        let isMounted = true;
        const fetchInitial = async () => {
            setReportsLoading(true);
            setUsersLoading(true);
            setAuthError(null);

            const [repRes, userRes] = await Promise.all([
                adminApi.listReports(currentUserRole),
                adminApi.listUsers("", currentUserRole),
            ]);

            if (!isMounted) return;

            if (repRes.success && repRes.data) {
                setReportsList(repRes.data);
            } else if (repRes.error) {
                setAuthError(repRes.error);
            }

            if (userRes.success && userRes.data) {
                setUsersList(userRes.data);
            } else if (userRes.error) {
                setAuthError(userRes.error);
            }

            setReportsLoading(false);
            setUsersLoading(false);
        };

        void fetchInitial();

        return () => {
            isMounted = false;
        };
    }, [currentUserRole]);

    const showMessage = (msg: string) => {
        setActionMessage(msg);
        setTimeout(() => setActionMessage(null), 3500);
    };

    // User Actions
    const handleBan = async (userId: string) => {
        const res = await adminApi.banUser(userId, currentUserRole);
        if (res.success && res.data) {
            showMessage(`Đã khóa tài khoản (ID: ${userId})`);
            if (selectedUser && selectedUser.id === userId) {
                setSelectedUser({ ...selectedUser, isBanned: true });
            }
            void loadData();
        } else if (res.error) {
            setAuthError(res.error);
        }
    };

    const handleUnban = async (userId: string) => {
        const res = await adminApi.unbanUser(userId, currentUserRole);
        if (res.success && res.data) {
            showMessage(`Đã mở khóa tài khoản (ID: ${userId})`);
            if (selectedUser && selectedUser.id === userId) {
                setSelectedUser({ ...selectedUser, isBanned: false });
            }
            void loadData();
        } else if (res.error) {
            setAuthError(res.error);
        }
    };

    // Report Actions
    const handleResolve = async (reportId: string) => {
        const res = await adminApi.resolveReport(reportId, user?.id || "admin-master", currentUserRole);
        if (res.success) {
            showMessage(`Đã duyệt báo cáo #${reportId}`);
            if (selectedReport && selectedReport.id === reportId) {
                setSelectedReport({ ...selectedReport, status: "resolved" });
            }
            void loadData();
        } else if (res.error) {
            setAuthError(res.error);
        }
    };

    const handleReject = async (reportId: string) => {
        const res = await adminApi.rejectReport(reportId, user?.id || "admin-master", currentUserRole);
        if (res.success) {
            showMessage(`Đã bác bỏ báo cáo #${reportId}`);
            if (selectedReport && selectedReport.id === reportId) {
                setSelectedReport({ ...selectedReport, status: "rejected" });
            }
            void loadData();
        } else if (res.error) {
            setAuthError(res.error);
        }
    };

    const handleDeletePost = async (postId: string) => {
        if (!window.confirm(`Xác nhận xóa bài viết (ID: ${postId})?`)) return;
        const res = await adminApi.deletePost(postId, currentUserRole);
        if (res.success) {
            showMessage(`Đã xóa bài viết ${postId}`);
            setSelectedReport(null);
            void loadData();
        } else if (res.error) {
            setAuthError(res.error);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!window.confirm(`Xác nhận xóa bình luận (ID: ${commentId})?`)) return;
        const res = await adminApi.deleteComment(commentId, currentUserRole);
        if (res.success) {
            showMessage(`Đã xóa bình luận ${commentId}`);
            setSelectedReport(null);
            void loadData();
        } else if (res.error) {
            setAuthError(res.error);
        }
    };

    // Computed Filtered Reports
    const filteredReports = useMemo(() => {
        return reportsList.filter((r) => {
            const matchStatus = reportStatusFilter === "all" || r.status === reportStatusFilter;
            const matchType = reportTypeFilter === "all" || r.targetType === reportTypeFilter;
            return matchStatus && matchType;
        });
    }, [reportsList, reportStatusFilter, reportTypeFilter]);

    // Computed Filtered Users
    const filteredUsers = useMemo(() => {
        return usersList.filter((u) => {
            const q = userSearch.toLowerCase().trim();
            const matchQuery =
                !q ||
                u.name.toLowerCase().includes(q) ||
                u.username.toLowerCase().includes(q) ||
                u.email.toLowerCase().includes(q);
            const matchStatus =
                userStatusFilter === "all" ||
                (userStatusFilter === "banned" && u.isBanned) ||
                (userStatusFilter === "active" && !u.isBanned);
            return matchQuery && matchStatus;
        });
    }, [usersList, userSearch, userStatusFilter]);

    // Statistics
    const pendingCount = useMemo(() => reportsList.filter((r) => r.status === "pending").length, [reportsList]);
    const bannedUsersCount = useMemo(() => usersList.filter((u) => u.isBanned).length, [usersList]);

    // SECURITY PROTECTION CHECK: If user is not admin, display route protection screen
    if (!isAdmin) {
        return (
            <div className="w-full max-w-4xl mx-auto p-6 my-12 border border-rose-500/50 bg-surface text-text font-mono">
                <div className="flex items-center gap-3 border-b border-rose-500/30 pb-4">
                    <FontAwesomeIcon icon={faShieldCat} className="text-3xl text-rose-500" />
                    <div>
                        <h1 className="text-lg font-black uppercase text-rose-500">TRUY CẬP BỊ HẠN CHẾ (403 FORBIDDEN)</h1>
                        <p className="text-xs text-text-muted mt-0.5">Admin Security Protection Gate</p>
                    </div>
                </div>

                <div className="py-6 space-y-4 text-xs">
                    <p className="text-text font-semibold">
                        Trang quản trị chỉ dành riêng cho tài khoản có vai trò <span className="text-primary font-bold">ADMIN</span>.
                    </p>
                    <div className="bg-surface-hover p-4 border border-border space-y-2">
                        <div>Vai trò hiện tại của bạn: <strong className="uppercase text-amber-500">{currentUserRole}</strong></div>
                        <div className="text-text-muted text-[11px]">
                            Mọi thao tác quản trị & API backend sẽ bị chặn từ chối nếu không truyền đúng token phân quyền admin.
                        </div>
                    </div>
                </div>

                <div className="border-t border-border pt-4 flex justify-end">
                    <a
                        href="/"
                        className="px-4 py-2 border border-border bg-surface hover:bg-surface-hover text-xs font-bold transition-colors"
                    >
                        Trở về trang chủ
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 space-y-6 font-sans text-text">
            {/* Header section - Flat, linear, no rounded boxes */}
            <div className="border-b border-border pb-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="inline-block w-2 h-6 bg-primary"></span>
                        <h1 className="text-xl font-bold uppercase tracking-wider text-text flex items-center gap-2">
                            <FontAwesomeIcon icon={faShieldHalved} className="text-primary text-base" />
                            Admin Dashboard & Moderation
                        </h1>
                    </div>
                    <p className="text-xs text-text-muted mt-1 font-mono">
                        Console / Management & Moderation Workspace
                    </p>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                    <button
                        onClick={() => void loadData()}
                        className="px-3 py-1.5 border border-border bg-surface hover:bg-surface-hover transition-colors text-text-muted hover:text-text flex items-center gap-2 cursor-pointer"
                    >
                        <FontAwesomeIcon icon={faRotateRight} className={reportsLoading || usersLoading ? "animate-spin text-primary" : ""} />
                        <span>REFRESH</span>
                    </button>

                    <div className="flex items-center gap-2 px-3 py-1.5 border border-border bg-surface">
                        <FontAwesomeIcon icon={faLock} className="text-emerald-500 text-[11px]" />
                        <span className="text-text-muted">ROLE:</span>
                        <span className="font-extrabold text-primary uppercase">{currentUserRole}</span>
                    </div>
                </div>
            </div>

            {/* Error / Toast Alerts - Flat rectangular banners */}
            {authError && (
                <div className="flex items-center gap-3 bg-rose-500/10 border-l-4 border-rose-500 text-rose-500 p-3 text-xs font-mono">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="shrink-0" />
                    <span>{authError}</span>
                </div>
            )}

            {actionMessage && (
                <div className="flex items-center gap-3 bg-emerald-500/10 border-l-4 border-emerald-500 text-emerald-500 p-3 text-xs font-mono">
                    <FontAwesomeIcon icon={faCheckCircle} className="shrink-0" />
                    <span>{actionMessage}</span>
                </div>
            )}

            {/* Metric Strip - Linear table-like status row without cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 border border-border divide-x divide-y lg:divide-y-0 divide-border bg-surface text-xs font-mono">
                <div className="p-4 flex items-center justify-between">
                    <div>
                        <div className="text-text-muted uppercase text-[11px]">Chờ xử lý</div>
                        <div className="text-2xl font-black text-amber-500 mt-1">{pendingCount}</div>
                    </div>
                    <FontAwesomeIcon icon={faClock} className="text-amber-500/40 text-xl" />
                </div>

                <div className="p-4 flex items-center justify-between">
                    <div>
                        <div className="text-text-muted uppercase text-[11px]">Tổng báo cáo</div>
                        <div className="text-2xl font-black text-text mt-1">{reportsList.length}</div>
                    </div>
                    <FontAwesomeIcon icon={faFlag} className="text-indigo-500/40 text-xl" />
                </div>

                <div className="p-4 flex items-center justify-between">
                    <div>
                        <div className="text-text-muted uppercase text-[11px]">Tổng người dùng</div>
                        <div className="text-2xl font-black text-text mt-1">{usersList.length}</div>
                    </div>
                    <FontAwesomeIcon icon={faUsers} className="text-cyan-500/40 text-xl" />
                </div>

                <div className="p-4 flex items-center justify-between">
                    <div>
                        <div className="text-text-muted uppercase text-[11px]">Đã Banned</div>
                        <div className="text-2xl font-black text-rose-500 mt-1">{bannedUsersCount}</div>
                    </div>
                    <FontAwesomeIcon icon={faBan} className="text-rose-500/40 text-xl" />
                </div>
            </div>

            {/* Navigation Tabs - Sharp Underline Style */}
            <div className="border-b border-border flex items-center gap-6 font-mono text-xs font-bold">
                <button
                    onClick={() => setActiveTab("reports")}
                    className={`pb-3 transition-colors relative cursor-pointer flex items-center gap-2 ${
                        activeTab === "reports"
                            ? "text-primary border-b-2 border-primary font-black"
                            : "text-text-muted hover:text-text"
                    }`}
                >
                    <FontAwesomeIcon icon={faListCheck} />
                    <span>BÁO CÁO VI PHẠM ({reportsList.length})</span>
                    {pendingCount > 0 && (
                        <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 font-mono">
                            {pendingCount} PENDING
                        </span>
                    )}
                </button>

                <button
                    onClick={() => setActiveTab("users")}
                    className={`pb-3 transition-colors relative cursor-pointer flex items-center gap-2 ${
                        activeTab === "users"
                            ? "text-primary border-b-2 border-primary font-black"
                            : "text-text-muted hover:text-text"
                    }`}
                >
                    <FontAwesomeIcon icon={faUsers} />
                    <span>DANH SÁCH NGƯỜI DÙNG ({usersList.length})</span>
                </button>
            </div>

            {/* TAB 1: REPORTS TABLE & FEED */}
            {activeTab === "reports" && (
                <div className="space-y-4">
                    {/* Filter bar - Minimal border box */}
                    <div className="border border-border p-3 bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-text-muted flex items-center gap-1">
                                <FontAwesomeIcon icon={faFilter} className="text-[10px]" /> Trạng thái:
                            </span>
                            {(["pending", "all", "resolved", "rejected"] as const).map((st) => (
                                <button
                                    key={st}
                                    onClick={() => setReportStatusFilter(st)}
                                    className={`px-2.5 py-1 border transition-colors cursor-pointer capitalize ${
                                        reportStatusFilter === st
                                            ? "border-primary bg-primary text-white font-bold"
                                            : "border-border bg-surface-hover text-text-muted hover:text-text"
                                    }`}
                                >
                                    {st === "pending" ? "Chờ duyệt" : st === "resolved" ? "Đã duyệt" : st === "rejected" ? "Từ chối" : "Tất cả"}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-text-muted">Loại:</span>
                            <select
                                value={reportTypeFilter}
                                onChange={(e) => setReportTypeFilter(e.target.value as "all" | "post" | "comment" | "user")}
                                className="bg-surface border border-border text-text px-2 py-1 font-mono focus:outline-none focus:border-primary"
                            >
                                <option value="all">TẤT CẢ LOẠI</option>
                                <option value="post">POST</option>
                                <option value="comment">COMMENT</option>
                                <option value="user">USER</option>
                            </select>
                        </div>
                    </div>

                    {/* Report Rows - Flat Linear Stream with Thin Dividers */}
                    {reportsLoading ? (
                        <div className="py-12 text-center text-text-muted font-mono text-xs">Đang đồng bộ dữ liệu báo cáo...</div>
                    ) : filteredReports.length === 0 ? (
                        <div className="p-8 text-center border border-dashed border-border text-text-muted font-mono text-xs">
                            Không có báo cáo vi phạm nào phù hợp với bộ lọc hiện tại.
                        </div>
                    ) : (
                        <div className="border border-border divide-y divide-border bg-surface">
                            {filteredReports.map((rep) => (
                                <div
                                    key={rep.id}
                                    className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-surface-hover/50 transition-colors"
                                >
                                    <div className="space-y-2 flex-1 min-w-0">
                                        <div className="flex items-center gap-2 text-xs font-mono">
                                            <span className="bg-surface-hover border border-border px-1.5 py-0.5 text-text-muted text-[11px]">
                                                #{rep.id}
                                            </span>

                                            <span
                                                className={`border px-1.5 py-0.5 text-[10px] uppercase font-bold ${
                                                    rep.targetType === "post"
                                                        ? "border-indigo-500/40 text-indigo-500 bg-indigo-500/5"
                                                        : rep.targetType === "comment"
                                                        ? "border-amber-500/40 text-amber-500 bg-amber-500/5"
                                                        : "border-cyan-500/40 text-cyan-500 bg-cyan-500/5"
                                                }`}
                                            >
                                                {rep.targetType}
                                            </span>

                                            <span
                                                className={`border px-1.5 py-0.5 text-[10px] font-bold ${
                                                    rep.status === "pending"
                                                        ? "border-amber-500 text-amber-500 bg-amber-500/10"
                                                        : rep.status === "resolved"
                                                        ? "border-emerald-500 text-emerald-500 bg-emerald-500/10"
                                                        : "border-rose-500 text-rose-500 bg-rose-500/10"
                                                }`}
                                            >
                                                {rep.status === "pending" ? "CHỜ XỬ LÝ" : rep.status === "resolved" ? "ĐÃ DUYỆT" : "TỪ CHỐI"}
                                            </span>
                                        </div>

                                        <div className="text-sm font-semibold text-text">
                                            {rep.reason}
                                            {rep.targetTitle && <span className="text-text-muted font-normal"> — "{rep.targetTitle}"</span>}
                                        </div>

                                        {rep.description && (
                                            <p className="text-xs text-text-muted border-l-2 border-primary/50 pl-3 py-0.5 font-mono italic">
                                                "{rep.description}"
                                            </p>
                                        )}

                                        <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-text-muted">
                                            <span>Target ID: <strong className="text-text">{rep.targetId}</strong></span>
                                            <span>Tác giả: <strong className="text-text">{rep.targetAuthor}</strong></span>
                                            <span>Reporter: <strong className="text-text">{rep.reporterId}</strong></span>
                                        </div>
                                    </div>

                                    {/* Action buttons - Sharp minimal controls */}
                                    <div className="flex items-center gap-2 shrink-0 font-mono text-xs border-t md:border-t-0 border-border pt-3 md:pt-0">
                                        <button
                                            onClick={() => setSelectedReport(rep)}
                                            className="px-2.5 py-1.5 border border-border bg-surface hover:bg-surface-hover text-text transition-colors cursor-pointer flex items-center gap-1.5"
                                            title="Xem chi tiết báo cáo"
                                        >
                                            <FontAwesomeIcon icon={faEye} />
                                            <span>Xem</span>
                                        </button>

                                        {rep.status === "pending" && (
                                            <>
                                                <button
                                                    onClick={() => handleResolve(rep.id)}
                                                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                                                >
                                                    <FontAwesomeIcon icon={faCheckCircle} />
                                                    <span>Duyệt</span>
                                                </button>
                                                <button
                                                    onClick={() => handleReject(rep.id)}
                                                    className="px-3 py-1.5 border border-border bg-surface hover:bg-surface-hover text-text-muted hover:text-text transition-colors cursor-pointer flex items-center gap-1.5"
                                                >
                                                    <FontAwesomeIcon icon={faXmark} />
                                                    <span>Bác bỏ</span>
                                                </button>
                                            </>
                                        )}

                                        {rep.targetType === "post" && (
                                            <button
                                                onClick={() => handleDeletePost(rep.targetId)}
                                                className="px-3 py-1.5 border border-rose-500/50 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                                <span>Xóa Post</span>
                                            </button>
                                        )}

                                        {rep.targetType === "comment" && (
                                            <button
                                                onClick={() => handleDeleteComment(rep.targetId)}
                                                className="px-3 py-1.5 border border-rose-500/50 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                                <span>Xóa Comment</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* TAB 2: USER MANAGEMENT TABLE */}
            {activeTab === "users" && (
                <div className="space-y-4">
                    {/* Search Toolbar */}
                    <div className="border border-border p-3 bg-surface flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs">
                        <div className="relative w-full sm:w-80">
                            <FontAwesomeIcon
                                icon={faSearch}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                            />
                            <input
                                type="text"
                                value={userSearch}
                                onChange={(e) => setUserSearch(e.target.value)}
                                placeholder="Tìm theo tên, username, email..."
                                className="w-full pl-8 pr-3 py-1.5 bg-surface border border-border text-text placeholder:text-text-muted focus:outline-none focus:border-primary"
                            />
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                            <span className="text-text-muted">Lọc trạng thái:</span>
                            {(["all", "active", "banned"] as const).map((st) => (
                                <button
                                    key={st}
                                    onClick={() => setUserStatusFilter(st)}
                                    className={`px-2.5 py-1 border transition-colors cursor-pointer capitalize ${
                                        userStatusFilter === st
                                            ? "border-primary bg-primary text-white font-bold"
                                            : "border-border bg-surface-hover text-text-muted hover:text-text"
                                    }`}
                                >
                                    {st === "all" ? "Tất cả" : st === "active" ? "Active" : "Banned"}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* High-density Flat Table */}
                    {usersLoading ? (
                        <div className="py-12 text-center text-text-muted font-mono text-xs">Đang tải danh sách người dùng...</div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="p-8 text-center border border-dashed border-border text-text-muted font-mono text-xs">
                            Không tìm thấy tài khoản người dùng phù hợp.
                        </div>
                    ) : (
                        <div className="border border-border bg-surface overflow-x-auto">
                            <table className="w-full text-left font-mono text-xs">
                                <thead className="bg-surface-hover text-text-muted border-b border-border uppercase text-[10px] tracking-wider">
                                    <tr>
                                        <th className="p-3">NGƯỜI DÙNG</th>
                                        <th className="p-3">EMAIL</th>
                                        <th className="p-3">VAI TRÒ</th>
                                        <th className="p-3">TRẠNG THÁI</th>
                                        <th className="p-3 text-right">THAO TÁC</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filteredUsers.map((u) => (
                                        <tr key={u.id} className="hover:bg-surface-hover/50 transition-colors">
                                            <td className="p-3">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={u.avatar}
                                                        alt={u.name}
                                                        className="w-7 h-7 object-cover border border-border shrink-0"
                                                    />
                                                    <div className="min-w-0">
                                                        <div className="font-bold text-text truncate">{u.name}</div>
                                                        <div className="text-[11px] text-text-muted truncate">@{u.username}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-3 text-text-muted font-mono text-[11px]">
                                                {u.email}
                                            </td>
                                            <td className="p-3">
                                                <span
                                                    className={`border px-1.5 py-0.5 text-[10px] uppercase font-extrabold ${
                                                        u.role === "admin"
                                                            ? "border-amber-500/50 text-amber-500 bg-amber-500/10"
                                                            : "border-border text-text-muted bg-surface-hover"
                                                    }`}
                                                >
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                <span
                                                    className={`border px-2 py-0.5 text-[10px] font-extrabold ${
                                                        u.isBanned
                                                            ? "border-rose-500 text-rose-500 bg-rose-500/10"
                                                            : "border-emerald-500 text-emerald-500 bg-emerald-500/10"
                                                    }`}
                                                >
                                                    {u.isBanned ? "BANNED" : "ACTIVE"}
                                                </span>
                                            </td>
                                            <td className="p-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => setSelectedUser(u)}
                                                        className="px-2.5 py-1 border border-border bg-surface hover:bg-surface-hover text-text transition-colors cursor-pointer text-xs font-bold inline-flex items-center gap-1"
                                                        title="Xem hồ sơ người dùng"
                                                    >
                                                        <FontAwesomeIcon icon={faEye} />
                                                        <span>Xem</span>
                                                    </button>

                                                    {u.isBanned ? (
                                                        <button
                                                            onClick={() => handleUnban(u.id)}
                                                            className="px-2.5 py-1 border border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-colors cursor-pointer text-xs font-bold inline-flex items-center gap-1"
                                                        >
                                                            <FontAwesomeIcon icon={faUserCheck} />
                                                            <span>UNBAN</span>
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleBan(u.id)}
                                                            className="px-2.5 py-1 border border-rose-500 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer text-xs font-bold inline-flex items-center gap-1"
                                                        >
                                                            <FontAwesomeIcon icon={faBan} />
                                                            <span>BAN</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* MODAL 1: VIEW USER DETAILS */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
                    <div className="bg-surface border border-border w-full max-w-lg p-6 space-y-4 font-mono text-xs text-text shadow-2xl relative">
                        <div className="flex items-center justify-between border-b border-border pb-3">
                            <div className="flex items-center gap-2 font-bold uppercase text-primary">
                                <FontAwesomeIcon icon={faUser} />
                                <span>THÔNG TIN NGƯỜI DÙNG</span>
                            </div>
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="text-text-muted hover:text-text cursor-pointer p-1"
                            >
                                <FontAwesomeIcon icon={faXmark} className="text-base" />
                            </button>
                        </div>

                        <div className="flex items-start gap-4 pt-2">
                            <img
                                src={selectedUser.avatar}
                                alt={selectedUser.name}
                                className="w-16 h-16 object-cover border border-border shrink-0"
                            />
                            <div className="space-y-1">
                                <h3 className="text-base font-extrabold text-text">{selectedUser.name}</h3>
                                <p className="text-text-muted">@{selectedUser.username}</p>
                                <p className="text-text-muted">{selectedUser.email}</p>
                            </div>
                        </div>

                        <div className="border border-border divide-y divide-border bg-surface-hover/50 p-3 space-y-2">
                            <div className="flex justify-between py-1">
                                <span className="text-text-muted">USER ID:</span>
                                <span className="font-bold">{selectedUser.id}</span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="text-text-muted">VAI TRÒ:</span>
                                <span className="font-extrabold uppercase text-primary">{selectedUser.role}</span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="text-text-muted">TRẠNG THÁI:</span>
                                <span className={`font-extrabold ${selectedUser.isBanned ? "text-rose-500" : "text-emerald-500"}`}>
                                    {selectedUser.isBanned ? "ĐÃ BỊ KHÓA (BANNED)" : "ĐANG HOẠT ĐỘNG"}
                                </span>
                            </div>
                            {selectedUser.createdAt && (
                                <div className="flex justify-between py-1">
                                    <span className="text-text-muted">NGÀY TẠO:</span>
                                    <span>{new Date(selectedUser.createdAt).toLocaleDateString("vi-VN")}</span>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-border pt-4 flex items-center justify-between gap-3">
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="px-4 py-2 border border-border bg-surface hover:bg-surface-hover text-text cursor-pointer font-bold"
                            >
                                Đóng
                            </button>

                            {selectedUser.isBanned ? (
                                <button
                                    onClick={() => handleUnban(selectedUser.id)}
                                    className="px-4 py-2 border border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-white font-bold cursor-pointer transition-colors"
                                >
                                    Mở khóa (Unban)
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleBan(selectedUser.id)}
                                    className="px-4 py-2 border border-rose-500 text-rose-500 hover:bg-rose-500 hover:text-white font-bold cursor-pointer transition-colors"
                                >
                                    Khóa tài khoản (Ban)
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 2: VIEW REPORT DETAILS */}
            {selectedReport && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
                    <div className="bg-surface border border-border w-full max-w-xl p-6 space-y-4 font-mono text-xs text-text shadow-2xl relative">
                        <div className="flex items-center justify-between border-b border-border pb-3">
                            <div className="flex items-center gap-2 font-bold uppercase text-primary">
                                <FontAwesomeIcon icon={faFlag} />
                                <span>CHI TIẾT BÁO CÁO VI PHẠM #{selectedReport.id}</span>
                            </div>
                            <button
                                onClick={() => setSelectedReport(null)}
                                className="text-text-muted hover:text-text cursor-pointer p-1"
                            >
                                <FontAwesomeIcon icon={faXmark} className="text-base" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <span className="text-text-muted">Loại đối tượng:</span>
                                <span className="font-extrabold uppercase bg-primary/10 text-primary border border-primary/30 px-2 py-0.5">
                                    {selectedReport.targetType}
                                </span>
                                <span className="text-text-muted ml-auto">Trạng thái:</span>
                                <span className={`font-extrabold border px-2 py-0.5 uppercase ${
                                    selectedReport.status === "pending"
                                        ? "text-amber-500 border-amber-500/40"
                                        : selectedReport.status === "resolved"
                                        ? "text-emerald-500 border-emerald-500/40"
                                        : "text-rose-500 border-rose-500/40"
                                }`}>
                                    {selectedReport.status}
                                </span>
                            </div>

                            <div className="border border-border bg-surface-hover/40 p-3 space-y-2">
                                <div><strong className="text-text-muted">Lý do báo cáo:</strong> <span className="text-text font-bold">{selectedReport.reason}</span></div>
                                {selectedReport.targetTitle && (
                                    <div><strong className="text-text-muted">Tiêu đề đối tượng:</strong> <span className="text-text">{selectedReport.targetTitle}</span></div>
                                )}
                                {selectedReport.description && (
                                    <div className="border-l-2 border-amber-500 pl-3 py-1 bg-surface my-2 italic">
                                        "{selectedReport.description}"
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[11px] text-text-muted border border-border p-2">
                                <div>Target ID: <span className="font-bold text-text">{selectedReport.targetId}</span></div>
                                <div>Tác giả: <span className="font-bold text-text">{selectedReport.targetAuthor || "N/A"}</span></div>
                                <div>Người báo cáo: <span className="font-bold text-text">{selectedReport.reporterId}</span></div>
                                <div>Ngày tạo: <span className="font-bold text-text">{new Date(selectedReport.createdAt).toLocaleDateString("vi-VN")}</span></div>
                            </div>
                        </div>

                        <div className="border-t border-border pt-4 flex flex-wrap items-center justify-between gap-2">
                            <button
                                onClick={() => setSelectedReport(null)}
                                className="px-4 py-2 border border-border bg-surface hover:bg-surface-hover text-text cursor-pointer font-bold"
                            >
                                Đóng
                            </button>

                            <div className="flex items-center gap-2">
                                {selectedReport.status === "pending" && (
                                    <>
                                        <button
                                            onClick={() => handleResolve(selectedReport.id)}
                                            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer transition-colors"
                                        >
                                            Duyệt báo cáo
                                        </button>
                                        <button
                                            onClick={() => handleReject(selectedReport.id)}
                                            className="px-3 py-2 border border-border bg-surface hover:bg-surface-hover text-text-muted hover:text-text font-bold cursor-pointer transition-colors"
                                        >
                                            Bác bỏ
                                        </button>
                                    </>
                                )}

                                {selectedReport.targetType === "post" && (
                                    <button
                                        onClick={() => handleDeletePost(selectedReport.targetId)}
                                        className="px-3 py-2 border border-rose-500 text-rose-500 hover:bg-rose-500 hover:text-white font-bold cursor-pointer transition-colors"
                                    >
                                        Xóa Bài Viết
                                    </button>
                                )}

                                {selectedReport.targetType === "comment" && (
                                    <button
                                        onClick={() => handleDeleteComment(selectedReport.targetId)}
                                        className="px-3 py-2 border border-rose-500 text-rose-500 hover:bg-rose-500 hover:text-white font-bold cursor-pointer transition-colors"
                                    >
                                        Xóa Bình Luận
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
