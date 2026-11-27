import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
    UsersThree,
    Plus,
    Microphone,
    Globe,
    Trophy,
    MagnifyingGlass,
    CircleNotch,
    SignIn,
    SignOut,
    Trash,
    X,
    ChatCircleDots,
    Crown,
    LockKey,
    LockKeyOpen,
} from "@phosphor-icons/react";
import { squadsApi } from "@/shared/api";
import type { SquadDto, SquadStatus } from "@/shared/api/types";
import { useAuthStore } from "@/features/auth";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { UserAvatar } from "@/shared/components/ui/UserAvatar";
import { formatTimeAgo } from "@/shared/utils/formatTimeAgo";
import { AppModal } from "@/shared/components/ui/AppModal";

const REGIONS = ["ALL", "SEA", "VN", "ASIA", "NA", "EU"] as const;

export function SquadPage() {
    useDocumentTitle("Tìm đội (Squad / LFG)");
    const navigate = useNavigate();
    const currentUser = useAuthStore((s) => s.user);

    const [viewMode, setViewMode] = useState<"browse" | "mine">("browse");
    const [statusFilter, setStatusFilter] = useState<"" | SquadStatus>("");
    const [regionFilter, setRegionFilter] = useState<string>("ALL");
    const [searchQuery, setSearchQuery] = useState("");
    const [squads, setSquads] = useState<SquadDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionId, setActionId] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Create Squad Modal
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [form, setForm] = useState({
        gameName: "",
        title: "",
        description: "",
        region: "SEA",
        rankRequirement: "",
        micRequired: true,
        maxMembers: 5,
    });
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);

    const loadSquads = useCallback(async () => {
        setLoading(true);
        setErrorMsg(null);
        try {
            if (viewMode === "mine") {
                if (!currentUser) {
                    setSquads([]);
                    return;
                }
                const list = await squadsApi.getMine();
                setSquads(Array.isArray(list) ? list : []);
            } else {
                const res = await squadsApi.getAll({
                    page: 1,
                    limit: 30,
                    status: statusFilter || undefined,
                    region: regionFilter !== "ALL" ? regionFilter : undefined,
                    q: searchQuery.trim() || undefined,
                });
                setSquads(Array.isArray(res?.data) ? res.data : []);
            }
        } catch (err: unknown) {
            setErrorMsg(err instanceof Error ? err.message : "Không thể tải danh sách phòng tìm đội.");
        } finally {
            setLoading(false);
        }
    }, [viewMode, statusFilter, regionFilter, searchQuery, currentUser]);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            void loadSquads();
        }, 150);
        return () => window.clearTimeout(timer);
    }, [loadSquads]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) {
            navigate({ to: "/auth" });
            return;
        }
        setCreateError(null);
        setCreating(true);
        try {
            const created = await squadsApi.create({
                gameName: form.gameName.trim(),
                gameSlug: form.gameName
                    .trim()
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-|-$/g, ""),
                title: form.title.trim(),
                description: form.description.trim() || undefined,
                region: form.region,
                rankRequirement: form.rankRequirement.trim() || undefined,
                micRequired: form.micRequired,
                maxMembers: form.maxMembers,
            });
            setSquads((prev) => [created, ...prev]);
            setShowCreateModal(false);
            setForm({
                gameName: "",
                title: "",
                description: "",
                region: "SEA",
                rankRequirement: "",
                micRequired: true,
                maxMembers: 5,
            });
        } catch (err: unknown) {
            setCreateError(err instanceof Error ? err.message : "Không thể tạo phòng tìm đội.");
        } finally {
            setCreating(false);
        }
    };

    const handleJoin = async (squadId: string) => {
        if (!currentUser) {
            navigate({ to: "/auth" });
            return;
        }
        setActionId(squadId);
        setErrorMsg(null);
        try {
            const updated = await squadsApi.join(squadId);
            setSquads((prev) => prev.map((s) => (s.id === squadId ? updated : s)));
        } catch (err: unknown) {
            setErrorMsg(err instanceof Error ? err.message : "Không thể tham gia phòng.");
        } finally {
            setActionId(null);
        }
    };

    const handleLeave = async (squadId: string) => {
        setActionId(squadId);
        setErrorMsg(null);
        try {
            const res = await squadsApi.leave(squadId);
            if (res.closed) {
                setSquads((prev) => prev.filter((s) => s.id !== squadId));
            } else if (res.squad) {
                setSquads((prev) => prev.map((s) => (s.id === squadId ? res.squad! : s)));
            } else {
                void loadSquads();
            }
        } catch (err: unknown) {
            setErrorMsg(err instanceof Error ? err.message : "Không thể rời phòng.");
        } finally {
            setActionId(null);
        }
    };

    const handleKick = async (squadId: string, targetUserId: string) => {
        setActionId(squadId);
        setErrorMsg(null);
        try {
            const updated = await squadsApi.kickMember(squadId, targetUserId);
            setSquads((prev) => prev.map((s) => (s.id === squadId ? updated : s)));
        } catch (err: unknown) {
            setErrorMsg(err instanceof Error ? err.message : "Không thể mời thành viên ra khỏi phòng.");
        } finally {
            setActionId(null);
        }
    };

    const handleToggleStatus = async (squad: SquadDto) => {
        const nextStatus: SquadStatus = squad.status === "closed" ? "open" : "closed";
        setActionId(squad.id);
        setErrorMsg(null);
        try {
            const updated = await squadsApi.updateStatus(squad.id, nextStatus);
            setSquads((prev) => prev.map((s) => (s.id === squad.id ? updated : s)));
        } catch (err: unknown) {
            setErrorMsg(err instanceof Error ? err.message : "Không thể cập nhật trạng thái phòng.");
        } finally {
            setActionId(null);
        }
    };

    const handleDelete = async (squadId: string) => {
        if (!window.confirm("Bạn có chắc muốn xóa phòng tìm đội này không?")) return;
        setActionId(squadId);
        setErrorMsg(null);
        try {
            await squadsApi.remove(squadId);
            setSquads((prev) => prev.filter((s) => s.id !== squadId));
        } catch (err: unknown) {
            setErrorMsg(err instanceof Error ? err.message : "Không thể xóa phòng.");
        } finally {
            setActionId(null);
        }
    };

    const getStatusStyle = (status: SquadStatus) => {
        if (status === "open") return { label: "Đang tuyển", cls: "bg-emerald-500/15 text-emerald-400" };
        if (status === "full") return { label: "Đã đủ slot", cls: "bg-amber-500/15 text-amber-400" };
        return { label: "Đã đóng", cls: "bg-surface-hover text-text-faint" };
    };

    return (
        <div className="w-full space-y-5 text-text pb-8">
            {/* Header Banner */}
            <div className="p-5 rounded-2xl bg-surface border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                <div className="space-y-1">
                    <h1 className="text-xl font-black text-text flex items-center gap-2">
                        <UsersThree className="size-6 text-primary" />
                        <span>Tìm đội (Squad / LFG)</span>
                    </h1>
                    <p className="text-xs text-text-muted">
                        Tạo phòng chiêu mộ hoặc tham gia nhanh các tổ đội đang thiếu người theo tựa game & khu vực.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => {
                        if (!currentUser) {
                            navigate({ to: "/auth" });
                            return;
                        }
                        setShowCreateModal(true);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-primary/20 cursor-pointer shrink-0 transition-colors"
                >
                    <Plus className="size-4" />
                    <span>Tạo phòng tìm đội</span>
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                        type="button"
                        onClick={() => setViewMode("browse")}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                            viewMode === "browse"
                                ? "bg-primary text-white"
                                : "bg-surface text-text-muted hover:text-text"
                        }`}
                    >
                        Khám phá phòng
                    </button>
                    {currentUser && (
                        <button
                            type="button"
                            onClick={() => setViewMode("mine")}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                                viewMode === "mine"
                                    ? "bg-primary text-white"
                                    : "bg-surface text-text-muted hover:text-text"
                            }`}
                        >
                            Đội của tôi
                        </button>
                    )}

                    {viewMode === "browse" && (
                        <>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as "" | SquadStatus)}
                                className="bg-surface border border-border/70 rounded-xl px-3 py-1.5 text-xs font-semibold text-text focus:outline-none focus:ring-1 focus:ring-primary"
                            >
                                <option value="">Tất cả (Đang mở & Đầy)</option>
                                <option value="open">Chỉ phòng đang tuyển</option>
                                <option value="full">Đã đủ người</option>
                            </select>

                            <select
                                value={regionFilter}
                                onChange={(e) => setRegionFilter(e.target.value)}
                                className="bg-surface border border-border/70 rounded-xl px-3 py-1.5 text-xs font-semibold text-text focus:outline-none focus:ring-1 focus:ring-primary"
                            >
                                {REGIONS.map((r) => (
                                    <option key={r} value={r}>
                                        {r === "ALL" ? "Mọi khu vực" : `Khu vực: ${r}`}
                                    </option>
                                ))}
                            </select>
                        </>
                    )}
                </div>

                {viewMode === "browse" && (
                    <div className="relative sm:w-64">
                        <MagnifyingGlass className="size-3.5 text-text-faint absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Tìm tên game hoặc tiêu đề..."
                            className="w-full bg-surface border border-border/70 rounded-xl pl-8 pr-3 py-1.5 text-xs text-text placeholder:text-text-faint focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>
                )}
            </div>

            {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 text-rose-400 text-xs font-bold">
                    {errorMsg}
                </div>
            )}

            {/* Squads Grid */}
            {loading ? (
                <div className="py-12 text-center text-xs text-text-muted space-y-2">
                    <CircleNotch className="size-6 animate-spin text-primary mx-auto" />
                    <p>Đang tải danh sách phòng tìm đội...</p>
                </div>
            ) : squads.length === 0 ? (
                <div className="p-10 rounded-2xl bg-surface border border-dashed border-border text-center space-y-3">
                    <UsersThree className="size-10 text-text-faint mx-auto" />
                    <p className="text-sm font-bold text-text">Chưa có phòng tìm đội nào</p>
                    <p className="text-xs text-text-muted max-w-md mx-auto">
                        Hãy tạo phòng đầu tiên để chiêu mộ đồng đội chơi game cùng nhau!
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {squads.map((squad) => {
                        const badge = getStatusStyle(squad.status);
                        const fillPercent = Math.min(100, Math.round((squad.memberCount / squad.maxMembers) * 100));
                        const isBusy = actionId === squad.id;

                        return (
                            <div
                                key={squad.id}
                                className="p-4 sm:p-5 rounded-2xl bg-surface border border-border/80 flex flex-col justify-between gap-4 shadow-sm hover:border-primary/40 transition-colors"
                            >
                                <div className="space-y-3">
                                    {/* Top Meta */}
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <span className="inline-block px-2 py-0.5 rounded-md bg-primary/15 text-primary text-[10px] font-extrabold uppercase tracking-wide">
                                                {squad.gameName}
                                            </span>
                                            <h3 className="text-sm font-extrabold text-text mt-1.5 leading-snug">
                                                {squad.title}
                                            </h3>
                                        </div>
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${badge.cls}`}>
                                            {badge.label}
                                        </span>
                                    </div>

                                    {squad.description && (
                                        <p className="text-xs text-text-muted leading-relaxed line-clamp-2">
                                            {squad.description}
                                        </p>
                                    )}

                                    {/* Badges */}
                                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-text-muted">
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-surface-inner">
                                            <Globe className="size-3 text-primary" />
                                            {squad.region}
                                        </span>
                                        {squad.rankRequirement && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-surface-inner">
                                                <Trophy className="size-3 text-amber-400" />
                                                {squad.rankRequirement}
                                            </span>
                                        )}
                                        {squad.micRequired && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                                                <Microphone className="size-3" />
                                                Cần Mic
                                            </span>
                                        )}
                                        <span className="text-[10px] text-text-faint ml-auto">
                                            {formatTimeAgo(squad.createdAt)}
                                        </span>
                                    </div>

                                    {/* Slot Bar */}
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between text-[11px] font-bold">
                                            <span className="text-text-muted">Thành viên</span>
                                            <span className="text-text font-mono">
                                                {squad.memberCount}/{squad.maxMembers}
                                            </span>
                                        </div>
                                        <div className="w-full h-1.5 rounded-full bg-surface-inner overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all ${
                                                    squad.status === "full" ? "bg-amber-400" : "bg-primary"
                                                }`}
                                                style={{ width: `${fillPercent}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Members List */}
                                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                                        {squad.members.map((m) => (
                                            <div
                                                key={m.userId}
                                                className="inline-flex items-center gap-1.5 pl-1 pr-2 py-0.5 rounded-full bg-surface-inner text-[11px]"
                                            >
                                                <UserAvatar
                                                    src={m.avatarUrl}
                                                    name={m.name}
                                                    className="w-5 h-5"
                                                    textClassName="text-[9px]"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        navigate({
                                                            to: "/profile/$userId",
                                                            params: { userId: `@${m.username}` },
                                                        })
                                                    }
                                                    className="font-semibold text-text hover:text-primary cursor-pointer"
                                                >
                                                    {m.name}
                                                </button>
                                                {m.role === "leader" && (
                                                    <Crown className="size-3 text-amber-400" />
                                                )}
                                                {squad.isLeader && m.userId !== currentUser?.id && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleKick(squad.id, m.userId)}
                                                        title="Mời ra khỏi phòng"
                                                        className="text-text-faint hover:text-rose-400 cursor-pointer ml-0.5"
                                                    >
                                                        <X className="size-3" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className="pt-3 border-t border-border/50 flex items-center justify-between gap-2 flex-wrap">
                                    {!squad.isLeader && currentUser && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                navigate({
                                                    to: "/messages",
                                                    search: { userId: squad.leaderId } as Record<string, unknown>,
                                                })
                                            }
                                            className="px-3 py-1.5 rounded-xl bg-surface-inner hover:bg-surface-hover text-xs font-bold text-text-muted hover:text-text flex items-center gap-1.5 cursor-pointer transition-colors"
                                        >
                                            <ChatCircleDots className="size-3.5" />
                                            <span>Nhắn đội trưởng</span>
                                        </button>
                                    )}

                                    <div className="flex items-center gap-2 ml-auto">
                                        {squad.isLeader && (
                                            <>
                                                <button
                                                    type="button"
                                                    disabled={isBusy}
                                                    onClick={() => handleToggleStatus(squad)}
                                                    className="px-3 py-1.5 rounded-xl bg-surface-inner hover:bg-surface-hover text-xs font-bold text-text flex items-center gap-1.5 cursor-pointer"
                                                >
                                                    {squad.status === "closed" ? (
                                                        <>
                                                            <LockKeyOpen className="size-3.5 text-emerald-400" />
                                                            <span>Mở lại</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <LockKey className="size-3.5 text-amber-400" />
                                                            <span>Đóng phòng</span>
                                                        </>
                                                    )}
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={isBusy}
                                                    onClick={() => handleDelete(squad.id)}
                                                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 cursor-pointer"
                                                    title="Xóa phòng"
                                                >
                                                    <Trash className="size-3.5" />
                                                </button>
                                            </>
                                        )}

                                        {squad.isJoined ? (
                                            <button
                                                type="button"
                                                disabled={isBusy}
                                                onClick={() => handleLeave(squad.id)}
                                                className="px-3.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                                            >
                                                {isBusy ? (
                                                    <CircleNotch className="size-3.5 animate-spin" />
                                                ) : (
                                                    <SignOut className="size-3.5" />
                                                )}
                                                <span>Rời đội</span>
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                disabled={isBusy || squad.status !== "open"}
                                                onClick={() => handleJoin(squad.id)}
                                                className="px-4 py-1.5 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-45 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                                            >
                                                {isBusy ? (
                                                    <CircleNotch className="size-3.5 animate-spin" />
                                                ) : (
                                                    <SignIn className="size-3.5" />
                                                )}
                                                <span>Tham gia</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create Squad Modal */}
            <AppModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Tạo phòng tìm đội (Squad / LFG)"
            >
                <form onSubmit={handleCreate} className="space-y-4">
                    {createError && (
                        <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 text-xs font-bold">
                            {createError}
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-text block">Tựa game *</label>
                        <input
                            type="text"
                            required
                            value={form.gameName}
                            onChange={(e) => setForm({ ...form, gameName: e.target.value })}
                            placeholder="VD: Counter-Strike 2, Valorant, Elden Ring..."
                            className="w-full bg-surface-inner rounded-xl px-3.5 py-2 text-xs text-text focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-text block">Tiêu đề phòng *</label>
                        <input
                            type="text"
                            required
                            minLength={4}
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            placeholder="VD: Tìm 2 bạn leo rank Premier tối nay, vui vẻ..."
                            className="w-full bg-surface-inner rounded-xl px-3.5 py-2 text-xs text-text focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-text block">Khu vực</label>
                            <select
                                value={form.region}
                                onChange={(e) => setForm({ ...form, region: e.target.value })}
                                className="w-full bg-surface-inner rounded-xl px-3 py-2 text-xs text-text focus:outline-none focus:ring-1 focus:ring-primary"
                            >
                                {REGIONS.filter((r) => r !== "ALL").map((r) => (
                                    <option key={r} value={r}>
                                        {r}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-text block">Số thành viên tối đa</label>
                            <input
                                type="number"
                                min={2}
                                max={16}
                                value={form.maxMembers}
                                onChange={(e) =>
                                    setForm({ ...form, maxMembers: Math.min(16, Math.max(2, Number(e.target.value) || 2)) })
                                }
                                className="w-full bg-surface-inner rounded-xl px-3.5 py-2 text-xs text-text focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 items-center">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-text block">Yêu cầu Rank (tuỳ chọn)</label>
                            <input
                                type="text"
                                value={form.rankRequirement}
                                onChange={(e) => setForm({ ...form, rankRequirement: e.target.value })}
                                placeholder="VD: Gold+, 15k+, Tự do"
                                className="w-full bg-surface-inner rounded-xl px-3.5 py-2 text-xs text-text focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                        </div>

                        <label className="flex items-center gap-2 pt-5 text-xs font-semibold text-text cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.micRequired}
                                onChange={(e) => setForm({ ...form, micRequired: e.target.checked })}
                                className="rounded accent-primary"
                            />
                            <span>Yêu cầu có Mic / Voice</span>
                        </label>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-text block">Mô tả thêm</label>
                        <textarea
                            rows={3}
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            placeholder="Ghi chú giờ chơi, phong cách chơi, Discord..."
                            className="w-full bg-surface-inner rounded-xl p-3 text-xs text-text focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={() => setShowCreateModal(false)}
                            className="px-4 py-2 rounded-xl bg-surface-inner text-xs font-bold text-text-muted hover:text-text cursor-pointer"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={creating || !form.gameName.trim() || form.title.trim().length < 4}
                            className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                            {creating && <CircleNotch className="size-3.5 animate-spin" />}
                            <span>Tạo phòng ngay</span>
                        </button>
                    </div>
                </form>
            </AppModal>
        </div>
    );
}
