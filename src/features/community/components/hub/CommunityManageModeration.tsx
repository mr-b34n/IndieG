import { useState } from "react";
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
    communityName: string;
    initialTab?: "requests" | "reports" | "history" | "moderators";
    isVi: boolean;
    onNavigateRules: () => void;
}

export const CommunityManageModeration = ({
    communityName,
    initialTab = "requests",
    isVi,
    onNavigateRules,
}: CommunityManageModerationProps) => {
    const [subTab, setSubTab] = useState<"requests" | "reports" | "moderators" | "history">(initialTab);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3500);
    };

    // 1. Pending Join Requests State
    const [joinRequests, setJoinRequests] = useState<JoinRequestItem[]>([
        {
            id: "req-1",
            username: "Thành Đạt",
            handle: "@thanhdat_gamer",
            avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
            note: isVi ? "Chơi Raft được 120h, muốn tìm team sinh tồn dài ngày." : "120+ hrs in Raft, seeking survival group.",
            playtime: "120h",
            appliedAt: "25m ago",
            status: "pending",
        },
        {
            id: "req-2",
            username: "Linh Đan",
            handle: "@linhdan_sea",
            avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
            note: isVi ? "Muốn học hỏi cách xây bè tự động và trang trí đẹp." : "Interested in automated farm setups and design.",
            playtime: "45h",
            appliedAt: "1h ago",
            status: "pending",
        },
        {
            id: "req-3",
            username: "Hoàng Long",
            handle: "@long_pioneer",
            avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80",
            note: isVi ? "Streamer/Creator muốn đăng tải video hướng dẫn cho newbie." : "Content creator sharing beginner guides.",
            playtime: "310h",
            appliedAt: "3h ago",
            status: "pending",
        },
    ]);

    const handleApproveRequest = (id: string, name: string) => {
        setJoinRequests((prev) =>
            prev.map((r) => (r.id === id ? { ...r, status: "approved" as const } : r))
        );
        showToast(isVi ? `Đã phê duyệt ${name} vào cộng đồng!` : `Approved ${name}'s join request.`);
    };

    const handleRejectRequest = (id: string, name: string) => {
        setJoinRequests((prev) =>
            prev.map((r) => (r.id === id ? { ...r, status: "rejected" as const } : r))
        );
        showToast(isVi ? `Đã từ chối yêu cầu của ${name}.` : `Rejected ${name}'s request.`);
    };

    // 2. Reports State
    const [reports, setReports] = useState<ReportItem[]>([
        {
            id: "rep-1",
            targetType: "post",
            targetTitle: "Tải bản mod cheat bất tử tài nguyên & full blueprint",
            targetExcerpt: "Link download bản crack kèm bypass anti-cheat tại website xyz...",
            authorName: "Gamer_Anonymous",
            authorHandle: "@anon_cheat",
            reporterName: "@haidang_craft",
            reason: isVi ? "Chia sẻ phần mềm gian lận / lừa đảo (Vi phạm quy tắc #03)" : "Cheating / Malware exploit (Rule #03)",
            createdAt: "30m ago",
            status: "pending",
        },
        {
            id: "rep-2",
            targetType: "comment",
            targetTitle: "Bình luận tại bài viết 'Showcase căn cứ bè nổi 3 tầng'",
            targetExcerpt: "Xây xấu như rác thế này mà cũng khoe, nghỉ chơi game đi em ơi...",
            authorName: "ToxicFisher",
            authorHandle: "@toxic_fisher",
            reporterName: "@raft_architect",
            reason: isVi ? "Ngôn từ độc hại, quấy rối (Vi phạm quy tắc #01)" : "Harassment / Toxicity (Rule #01)",
            createdAt: "2h ago",
            status: "pending",
        },
        {
            id: "rep-3",
            targetType: "post",
            targetTitle: "Ending bí mật ở hòn đảo Utopia cuối cùng!",
            targetExcerpt: "Tiết lộ toàn bộ kết thúc câu chuyện mà không đặt tag spoiler...",
            authorName: "FastSpoiler",
            authorHandle: "@fast_spoiler",
            reporterName: "@shark_hunter99",
            reason: isVi ? "Tiết lộ cốt truyện không gắn thẻ Spoiler (Vi phạm quy tắc #04)" : "Unmarked story spoiler (Rule #04)",
            createdAt: "4h ago",
            status: "pending",
        },
    ]);

    const handleResolveReport = (id: string, actionDesc: string) => {
        setReports((prev) =>
            prev.map((rep) => (rep.id === id ? { ...rep, status: "resolved" as const } : rep))
        );
        showToast(isVi ? `Đã giải quyết báo cáo (${actionDesc})` : `Report resolved (${actionDesc})`);
    };

    const handleDismissReport = (id: string) => {
        setReports((prev) =>
            prev.map((rep) => (rep.id === id ? { ...rep, status: "dismissed" as const } : rep))
        );
        showToast(isVi ? "Đã bác bỏ báo cáo hợp lệ." : "Report dismissed.");
    };

    // 3. Moderators Team State
    const [moderators, setModerators] = useState<ModeratorItem[]>([
        {
            id: "mod-1",
            name: "Hải Đăng",
            handle: "@haidang_craft",
            avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
            role: "Owner",
            assignedAt: "12/2024",
            actionsCount: 148,
        },
        {
            id: "mod-2",
            name: "Minh Quân",
            handle: "@shark_hunter99",
            avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80",
            role: "Moderator",
            assignedAt: "01/2025",
            actionsCount: 64,
        },
        {
            id: "mod-3",
            name: "Thùy Trang",
            handle: "@raft_architect",
            avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
            role: "Moderator",
            assignedAt: "02/2025",
            actionsCount: 37,
        },
    ]);

    const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);
    const [promoteCandidateHandle, setPromoteCandidateHandle] = useState("");

    const handleDemoteModerator = (id: string, name: string) => {
        if (!window.confirm(isVi ? `Xác nhận gỡ quyền Điều hành viên của ${name}?` : `Demote ${name} from Moderator?`)) {
            return;
        }
        setModerators((prev) => prev.filter((m) => m.id !== id));
        showToast(isVi ? `Đã gỡ quyền Điều hành viên của ${name}.` : `Removed ${name} from Moderator team.`);
    };

    const handlePromoteCandidate = () => {
        if (!promoteCandidateHandle.trim()) return;
        const newMod: ModeratorItem = {
            id: `mod-${Date.now()}`,
            name: promoteCandidateHandle.replace("@", ""),
            handle: promoteCandidateHandle.startsWith("@") ? promoteCandidateHandle : `@${promoteCandidateHandle}`,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${promoteCandidateHandle}`,
            role: "Moderator",
            assignedAt: "Just now",
            actionsCount: 0,
        };
        setModerators((prev) => [...prev, newMod]);
        setPromoteCandidateHandle("");
        setIsPromoteModalOpen(false);
        showToast(isVi ? `Đã thăng cấp ${newMod.name} làm Điều hành viên!` : `Promoted ${newMod.name} to Moderator.`);
    };

    // 4. Moderation History Log
    const modHistory: ModHistoryItem[] = [
        {
            id: "hist-1",
            actor: "Hải Đăng (Owner)",
            action: isVi ? "Khóa thảo luận" : "Locked discussion",
            target: "'Bug exploit #42'",
            timestamp: "2h ago",
            reason: isVi ? "Chờ nhà phát triển phát hành bản vá" : "Awaiting patch from developer",
        },
        {
            id: "hist-2",
            actor: "Minh Quân (Mod)",
            action: isVi ? "Tắt tiếng 24h" : "Muted for 24h",
            target: "@toxic_fisher",
            timestamp: "3h ago",
            reason: isVi ? "Vi phạm quy tắc ứng xử lịch sự" : "Toxicity in comment thread",
        },
        {
            id: "hist-3",
            actor: "Thùy Trang (Mod)",
            action: isVi ? "Gỡ bài viết" : "Removed post",
            target: "'Free steam wallet keys scam'",
            timestamp: "6h ago",
            reason: isVi ? "Lừa đảo liên kết độc hại" : "Phishing link scam",
        },
        {
            id: "hist-4",
            actor: "Hải Đăng (Owner)",
            action: isVi ? "Phê duyệt 8 yêu cầu gia nhập" : "Approved 8 join requests",
            target: "Batch approval",
            timestamp: "1d ago",
        },
    ];

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
                </div>
            )}

            {/* TAB CONTENT 2: COMMUNITY REPORTS */}
            {subTab === "reports" && (
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between text-xs text-text-muted px-1">
                        <span>{reports.filter((r) => r.status === "pending").length} {isVi ? "báo cáo đang chờ giải quyết" : "reports pending review"}</span>
                        <span className="text-text-faint text-[11px]">{isVi ? "Ngưỡng tự động ẩn: 3 báo cáo" : "Auto-flag threshold: 3 reports"}</span>
                    </div>

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

                        <button
                            type="button"
                            onClick={() => setIsPromoteModalOpen(true)}
                            className="px-3 py-1.5 rounded-[4px] bg-primary hover:bg-primary/90 text-xs font-bold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                            <FontAwesomeIcon icon={faUserPlus} className="text-xs" />
                            <span>{isVi ? "+ Thêm Điều hành viên" : "+ Add Moderator"}</span>
                        </button>
                    </div>

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
                                        <button
                                            type="button"
                                            onClick={() => handleDemoteModerator(mod.id, mod.name)}
                                            className="px-2.5 py-1 rounded bg-surface hover:bg-rose-500/10 hover:border-rose-500/30 border border-divider-primary text-[11px] font-semibold text-rose-400 transition-colors cursor-pointer"
                                        >
                                            {isVi ? "Gỡ quyền" : "Demote"}
                                        </button>
                                    ) : (
                                        <span className="text-[11px] font-mono text-text-faint italic px-2">
                                            {isVi ? "Trưởng cộng đồng" : "Primary Steward"}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Inline Promote Modal */}
                    {isPromoteModalOpen && (
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
                </div>
            )}
        </div>
    );
};
