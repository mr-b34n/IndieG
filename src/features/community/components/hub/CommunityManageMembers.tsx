import { useState, useMemo, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faSearch,
    faEllipsisVertical,
    faUserCheck,
    faVolumeXmark,
    faVolumeHigh,
    faBan,
    faUnlock,
    faCrown,
    faShieldHalved,
    faUser,
    faTriangleExclamation,
    faCircleCheck,
    faXmark,
} from "@fortawesome/free-solid-svg-icons";

export interface ManagedMemberItem {
    id: string;
    username: string;
    handle: string;
    avatar: string;
    role: "Owner" | "Moderator" | "Member";
    status: "Active" | "Muted" | "Banned" | "Pending";
    joinedDate: string;
    activitySummary: string;
    isOnline?: boolean;
}

interface CommunityManageMembersProps {
    communityName: string;
    isVi: boolean;
    onViewProfile?: (userId: string) => void;
}

export const CommunityManageMembers = ({
    communityName,
    isVi,
    onViewProfile,
}: CommunityManageMembersProps) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState<"all" | "members" | "moderators" | "banned" | "muted" | "pending">("all");
    const [activeMenuMemberId, setActiveMenuMemberId] = useState<string | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [ownerProtectedNotice, setOwnerProtectedNotice] = useState(false);

    const menuRef = useRef<HTMLDivElement>(null);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3500);
    };

    // Close menu on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setActiveMenuMemberId(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Initial Member Directory data
    const [members, setMembers] = useState<ManagedMemberItem[]>([
        {
            id: "u-1",
            username: "Hải Đăng",
            handle: "@haidang_craft",
            avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
            role: "Owner",
            status: "Active",
            joinedDate: "12/2024",
            activitySummary: "42 posts · 15m ago",
            isOnline: true,
        },
        {
            id: "u-2",
            username: "Minh Quân",
            handle: "@shark_hunter99",
            avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80",
            role: "Moderator",
            status: "Active",
            joinedDate: "01/2025",
            activitySummary: "28 posts · 1h ago",
            isOnline: true,
        },
        {
            id: "u-3",
            username: "Thùy Trang",
            handle: "@raft_architect",
            avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
            role: "Moderator",
            status: "Active",
            joinedDate: "02/2025",
            activitySummary: "19 posts · 3h ago",
            isOnline: false,
        },
        {
            id: "u-4",
            username: "Bảo Nam",
            handle: "@baonam_survivor",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
            role: "Member",
            status: "Active",
            joinedDate: "02/2025",
            activitySummary: "8 posts · 1d ago",
            isOnline: true,
        },
        {
            id: "u-5",
            username: "ToxicFisher",
            handle: "@toxic_fisher",
            avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
            role: "Member",
            status: "Muted",
            joinedDate: "02/2025",
            activitySummary: "2 posts · Muted 24h",
            isOnline: false,
        },
        {
            id: "u-6",
            username: "Gamer_Anonymous",
            handle: "@anon_cheat",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
            role: "Member",
            status: "Banned",
            joinedDate: "03/2025",
            activitySummary: "1 post · Banned",
            isOnline: false,
        },
        {
            id: "u-7",
            username: "Thành Đạt",
            handle: "@thanhdat_gamer",
            avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80",
            role: "Member",
            status: "Pending",
            joinedDate: "Chờ duyệt",
            activitySummary: "Applied 25m ago",
            isOnline: false,
        },
        {
            id: "u-8",
            username: "Hoàng Long",
            handle: "@long_pioneer",
            avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80",
            role: "Member",
            status: "Pending",
            joinedDate: "Chờ duyệt",
            activitySummary: "Applied 3h ago",
            isOnline: false,
        },
    ]);

    // Action Handlers
    const handleToggleMute = (id: string, currentStatus: string, name: string) => {
        setMembers((prev) =>
            prev.map((m) => {
                if (m.id === id) {
                    const newStatus = currentStatus === "Muted" ? "Active" : "Muted";
                    return {
                        ...m,
                        status: newStatus,
                        activitySummary: newStatus === "Muted" ? "Muted by admin" : "Active now",
                    };
                }
                return m;
            })
        );
        setActiveMenuMemberId(null);
        showToast(
            currentStatus === "Muted"
                ? (isVi ? `Đã bỏ tắt tiếng ${name}.` : `Unmuted ${name}.`)
                : (isVi ? `Đã tắt tiếng ${name} trong 24 giờ.` : `Muted ${name} for 24 hours.`)
        );
    };

    const handleToggleBan = (id: string, currentStatus: string, name: string) => {
        setMembers((prev) =>
            prev.map((m) => {
                if (m.id === id) {
                    const newStatus = currentStatus === "Banned" ? "Active" : "Banned";
                    return {
                        ...m,
                        status: newStatus,
                        activitySummary: newStatus === "Banned" ? "Banned by admin" : "Active now",
                    };
                }
                return m;
            })
        );
        setActiveMenuMemberId(null);
        showToast(
            currentStatus === "Banned"
                ? (isVi ? `Đã gỡ cấm ${name} khỏi cộng đồng.` : `Unbanned ${name}.`)
                : (isVi ? `Đã cấm ${name} khỏi cộng đồng này.` : `Banned ${name} from this community.`)
        );
    };

    const handlePromoteToModerator = (id: string, name: string) => {
        setMembers((prev) =>
            prev.map((m) => (m.id === id ? { ...m, role: "Moderator" as const } : m))
        );
        setActiveMenuMemberId(null);
        showToast(isVi ? `Đã thăng cấp ${name} làm Điều hành viên!` : `Promoted ${name} to Moderator.`);
    };

    const handleRemoveModerator = (id: string, name: string) => {
        if (!window.confirm(isVi ? `Hạ cấp ${name} xuống thành viên thông thường?` : `Remove ${name} from Moderator role?`)) {
            return;
        }
        setMembers((prev) =>
            prev.map((m) => (m.id === id ? { ...m, role: "Member" as const } : m))
        );
        setActiveMenuMemberId(null);
        showToast(isVi ? `Đã chuyển ${name} về Thành viên.` : `Demoted ${name} to Member.`);
    };

    // Filter and Search
    const filteredMembers = useMemo(() => {
        return members.filter((m) => {
            if (filter === "members" && m.role !== "Member") return false;
            if (filter === "moderators" && (m.role !== "Moderator" && m.role !== "Owner")) return false;
            if (filter === "banned" && m.status !== "Banned") return false;
            if (filter === "muted" && m.status !== "Muted") return false;
            if (filter === "pending" && m.status !== "Pending") return false;

            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                return m.username.toLowerCase().includes(q) || m.handle.toLowerCase().includes(q);
            }
            return true;
        });
    }, [members, filter, searchQuery]);

    const counts = useMemo(() => {
        return {
            all: members.length,
            members: members.filter((m) => m.role === "Member").length,
            moderators: members.filter((m) => m.role === "Moderator" || m.role === "Owner").length,
            banned: members.filter((m) => m.status === "Banned").length,
            muted: members.filter((m) => m.status === "Muted").length,
            pending: members.filter((m) => m.status === "Pending").length,
        };
    }, [members]);

    return (
        <div className="w-full flex flex-col gap-5 animate-fade-in text-text select-none">
            {/* Toast Feedback */}
            {toastMessage && (
                <div className="p-3 bg-primary/10 border border-primary/40 rounded-[6px] text-xs font-semibold text-primary flex items-center justify-between shadow-sm">
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

            {/* Owner Protected Safety Notice */}
            {ownerProtectedNotice && (
                <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-[6px] text-xs text-amber-300 flex items-start justify-between gap-3 animate-fade-in">
                    <div className="flex items-start gap-2.5">
                        <FontAwesomeIcon icon={faTriangleExclamation} className="text-amber-400 mt-0.5 text-xs shrink-0" />
                        <div>
                            <span className="font-bold block">
                                {isVi ? "Bảo vệ tài khoản Trưởng cộng đồng (Owner)" : "Community Owner Protected"}
                            </span>
                            <span className="text-[11px] text-amber-200/80 leading-relaxed mt-0.5 block">
                                {isVi
                                    ? "Bạn không thể tự gỡ quyền hoặc cấm tài khoản của chính mình. Để chuyển giao quyền quản trị cao nhất, vui lòng sử dụng mục Chuyển quyền sở hữu trong 'Vùng nguy hiểm' tại Cài đặt cộng đồng."
                                    : "You cannot remove or ban yourself. To transfer full stewardship, use the Transfer Ownership workflow in the Danger Zone under Community Settings."}
                            </span>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setOwnerProtectedNotice(false)}
                        className="text-amber-400 hover:text-amber-200 cursor-pointer text-xs"
                    >
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                </div>
            )}

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-divider-primary/40">
                <div>
                    <h2 className="text-base sm:text-lg font-mono font-bold tracking-wider text-text uppercase">
                        MEMBERS
                    </h2>
                    <p className="text-xs text-text-muted mt-0.5">
                        {isVi
                            ? `Quản lý thành viên, điều hành viên và danh sách hạn chế trong ${communityName}.`
                            : `Manage members, moderators, and restriction lists for ${communityName}.`}
                    </p>
                </div>

                {/* Search members... */}
                <div className="relative w-full sm:w-64">
                    <FontAwesomeIcon
                        icon={faSearch}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-faint text-xs"
                    />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={isVi ? "Tìm kiếm thành viên..." : "Search members..."}
                        className="w-full h-8 pl-8 pr-3 bg-surface-inner border border-divider-primary rounded-[4px] text-xs text-text placeholder:text-text-faint focus:outline-none focus:border-primary transition-colors"
                    />
                </div>
            </div>

            {/* FILTERS BAR: All, Members, Moderators, Banned, Muted, Pending */}
            <div className="flex items-center gap-1 border-b border-divider-primary/40 pb-2 overflow-x-auto">
                <button
                    type="button"
                    onClick={() => setFilter("all")}
                    className={`px-2.5 py-1 rounded-[4px] text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                        filter === "all"
                            ? "bg-surface text-text font-bold"
                            : "text-text-muted hover:text-text hover:bg-surface-hover/50"
                    }`}
                >
                    <span>{isVi ? "Tất cả" : "All"}</span>
                    <span className="font-mono text-[10px] text-text-faint">({counts.all})</span>
                </button>

                <button
                    type="button"
                    onClick={() => setFilter("members")}
                    className={`px-2.5 py-1 rounded-[4px] text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                        filter === "members"
                            ? "bg-surface text-text font-bold"
                            : "text-text-muted hover:text-text hover:bg-surface-hover/50"
                    }`}
                >
                    <span>{isVi ? "Thành viên" : "Members"}</span>
                    <span className="font-mono text-[10px] text-text-faint">({counts.members})</span>
                </button>

                <button
                    type="button"
                    onClick={() => setFilter("moderators")}
                    className={`px-2.5 py-1 rounded-[4px] text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                        filter === "moderators"
                            ? "bg-surface text-text font-bold"
                            : "text-text-muted hover:text-text hover:bg-surface-hover/50"
                    }`}
                >
                    <FontAwesomeIcon icon={faShieldHalved} className="text-[10px] text-primary" />
                    <span>{isVi ? "Điều hành viên" : "Moderators"}</span>
                    <span className="font-mono text-[10px] text-text-faint">({counts.moderators})</span>
                </button>

                <button
                    type="button"
                    onClick={() => setFilter("muted")}
                    className={`px-2.5 py-1 rounded-[4px] text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                        filter === "muted"
                            ? "bg-surface text-text font-bold"
                            : "text-text-muted hover:text-text hover:bg-surface-hover/50"
                    }`}
                >
                    <FontAwesomeIcon icon={faVolumeXmark} className="text-[10px] text-amber-400" />
                    <span>{isVi ? "Bị tắt tiếng" : "Muted"}</span>
                    <span className="font-mono text-[10px] text-text-faint">({counts.muted})</span>
                </button>

                <button
                    type="button"
                    onClick={() => setFilter("banned")}
                    className={`px-2.5 py-1 rounded-[4px] text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                        filter === "banned"
                            ? "bg-surface text-text font-bold"
                            : "text-text-muted hover:text-text hover:bg-surface-hover/50"
                    }`}
                >
                    <FontAwesomeIcon icon={faBan} className="text-[10px] text-rose-400" />
                    <span>{isVi ? "Bị cấm" : "Banned"}</span>
                    <span className="font-mono text-[10px] text-text-faint">({counts.banned})</span>
                </button>

                <button
                    type="button"
                    onClick={() => setFilter("pending")}
                    className={`px-2.5 py-1 rounded-[4px] text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                        filter === "pending"
                            ? "bg-surface text-text font-bold"
                            : "text-text-muted hover:text-text hover:bg-surface-hover/50"
                    }`}
                >
                    <FontAwesomeIcon icon={faUserCheck} className="text-[10px] text-amber-400" />
                    <span>{isVi ? "Chờ duyệt" : "Pending"}</span>
                    <span className="font-mono text-[10px] text-text-faint">({counts.pending})</span>
                </button>
            </div>

            {/* MEMBER TABLE / LIST (Restrained, almost borderless, strong information hierarchy) */}
            <div className="w-full overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                    <thead>
                        <tr className="border-b border-divider-primary/50 text-[10px] font-mono text-text-faint uppercase">
                            <th className="pb-2.5 font-bold pl-2">{isVi ? "THÀNH VIÊN" : "MEMBER"}</th>
                            <th className="pb-2.5 font-bold">{isVi ? "VAI TRÒ" : "ROLE"}</th>
                            <th className="pb-2.5 font-bold">{isVi ? "TRẠNG THÁI" : "STATUS"}</th>
                            <th className="pb-2.5 font-bold hidden md:table-cell">{isVi ? "THAM GIA" : "JOINED"}</th>
                            <th className="pb-2.5 font-bold hidden sm:table-cell">{isVi ? "HOẠT ĐỘNG" : "ACTIVITY"}</th>
                            <th className="pb-2.5 font-bold text-right pr-2">...</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-divider-primary/30">
                        {filteredMembers.map((member) => {
                            const isMenuOpen = activeMenuMemberId === member.id;

                            return (
                                <tr
                                    key={member.id}
                                    className="hover:bg-surface-hover/40 transition-colors group"
                                >
                                    {/* Avatar & Username */}
                                    <td className="py-3 pl-2 pr-4 min-w-[180px]">
                                        <div className="flex items-center gap-2.5">
                                            <div className="relative shrink-0">
                                                <img
                                                    src={member.avatar}
                                                    alt={member.username}
                                                    className="w-8 h-8 rounded-[4px] object-cover bg-surface"
                                                />
                                                {member.isOnline && (
                                                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-surface" />
                                                )}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="font-bold text-text truncate group-hover:text-primary transition-colors">
                                                    {member.username}
                                                </span>
                                                <span className="text-[11px] font-mono text-text-faint truncate">
                                                    {member.handle}
                                                </span>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Role */}
                                    <td className="py-3 pr-4 whitespace-nowrap">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase inline-flex items-center gap-1 ${
                                            member.role === "Owner"
                                                ? "bg-amber-500/15 border border-amber-500/30 text-amber-400"
                                                : member.role === "Moderator"
                                                ? "bg-primary/15 border border-primary/30 text-primary"
                                                : "bg-surface-inner text-text-muted"
                                        }`}>
                                            {member.role === "Owner" && <FontAwesomeIcon icon={faCrown} className="text-[8px]" />}
                                            {member.role === "Moderator" && <FontAwesomeIcon icon={faShieldHalved} className="text-[8px]" />}
                                            <span>{member.role}</span>
                                        </span>
                                    </td>

                                    {/* Status */}
                                    <td className="py-3 pr-4 whitespace-nowrap">
                                        <span className={`text-[11px] font-mono font-semibold flex items-center gap-1.5 ${
                                            member.status === "Active"
                                                ? "text-emerald-400"
                                                : member.status === "Muted"
                                                ? "text-amber-400"
                                                : member.status === "Banned"
                                                ? "text-rose-400"
                                                : "text-text-faint"
                                        }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${
                                                member.status === "Active"
                                                    ? "bg-emerald-500"
                                                    : member.status === "Muted"
                                                    ? "bg-amber-500"
                                                    : member.status === "Banned"
                                                    ? "bg-rose-500"
                                                    : "bg-text-faint"
                                            }`} />
                                            <span>{member.status}</span>
                                        </span>
                                    </td>

                                    {/* Joined */}
                                    <td className="py-3 pr-4 font-mono text-text-faint text-[11px] whitespace-nowrap hidden md:table-cell">
                                        {member.joinedDate}
                                    </td>

                                    {/* Activity */}
                                    <td className="py-3 pr-4 text-text-muted text-[11px] whitespace-nowrap hidden sm:table-cell">
                                        {member.activitySummary}
                                    </td>

                                    {/* Contextual Action Menu (...) */}
                                    <td className="py-3 pr-2 text-right relative">
                                        <div className="relative inline-block">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setActiveMenuMemberId(isMenuOpen ? null : member.id)
                                                }
                                                className="w-7 h-7 rounded hover:bg-surface border border-transparent hover:border-divider-primary text-text-faint hover:text-text transition-colors cursor-pointer inline-flex items-center justify-center"
                                            >
                                                <FontAwesomeIcon icon={faEllipsisVertical} className="text-xs" />
                                            </button>

                                            {/* DROPDOWN MENU */}
                                            {isMenuOpen && (
                                                <div
                                                    ref={menuRef}
                                                    className="absolute right-0 top-full mt-1 w-48 bg-surface border border-divider-primary rounded-[6px] shadow-2xl py-1 z-50 animate-fade-in text-left text-xs font-medium"
                                                >
                                                    {/* View Profile */}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setActiveMenuMemberId(null);
                                                            if (onViewProfile) onViewProfile(member.id);
                                                        }}
                                                        className="w-full px-3 py-2 text-text-muted hover:text-text hover:bg-surface-hover/60 flex items-center gap-2 cursor-pointer transition-colors"
                                                    >
                                                        <FontAwesomeIcon icon={faUser} className="text-xs text-text-faint w-4" />
                                                        <span>{isVi ? "Xem hồ sơ" : "View profile"}</span>
                                                    </button>

                                                    {/* ROLE SPECIFIC ACTIONS */}
                                                    {member.role === "Owner" ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setActiveMenuMemberId(null);
                                                                setOwnerProtectedNotice(true);
                                                            }}
                                                            className="w-full px-3 py-2 text-amber-400 hover:bg-surface-hover/60 flex items-center gap-2 cursor-pointer transition-colors border-t border-divider-primary/40 font-bold"
                                                        >
                                                            <FontAwesomeIcon icon={faCrown} className="text-xs text-amber-400 w-4" />
                                                            <span>{isVi ? "Trưởng cộng đồng" : "Owner"}</span>
                                                        </button>
                                                    ) : member.role === "Moderator" ? (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveModerator(member.id, member.username)}
                                                                className="w-full px-3 py-2 text-text-muted hover:text-rose-400 hover:bg-surface-hover/60 flex items-center gap-2 cursor-pointer transition-colors border-t border-divider-primary/40"
                                                            >
                                                                <FontAwesomeIcon icon={faShieldHalved} className="text-xs text-text-faint w-4" />
                                                                <span>{isVi ? "Gỡ quyền Điều hành" : "Remove Moderator"}</span>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleToggleMute(member.id, member.status, member.username)}
                                                                className="w-full px-3 py-2 text-amber-400 hover:bg-surface-hover/60 flex items-center gap-2 cursor-pointer transition-colors"
                                                            >
                                                                <FontAwesomeIcon icon={member.status === "Muted" ? faVolumeHigh : faVolumeXmark} className="text-xs w-4" />
                                                                <span>{member.status === "Muted" ? (isVi ? "Bỏ tắt tiếng" : "Unmute") : (isVi ? "Tắt tiếng 24h" : "Mute")}</span>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleToggleBan(member.id, member.status, member.username)}
                                                                className="w-full px-3 py-2 text-rose-400 hover:bg-surface-hover/60 flex items-center gap-2 cursor-pointer transition-colors"
                                                            >
                                                                <FontAwesomeIcon icon={member.status === "Banned" ? faUnlock : faBan} className="text-xs w-4" />
                                                                <span>{member.status === "Banned" ? (isVi ? "Gỡ lệnh cấm" : "Unban") : (isVi ? "Cấm thành viên" : "Ban")}</span>
                                                            </button>
                                                        </>
                                                    ) : (
                                                        /* Normal Member */
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => handlePromoteToModerator(member.id, member.username)}
                                                                className="w-full px-3 py-2 text-primary hover:bg-surface-hover/60 flex items-center gap-2 cursor-pointer transition-colors border-t border-divider-primary/40 font-semibold"
                                                            >
                                                                <FontAwesomeIcon icon={faShieldHalved} className="text-xs text-primary w-4" />
                                                                <span>{isVi ? "Thăng cấp Điều hành viên" : "Promote to Moderator"}</span>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleToggleMute(member.id, member.status, member.username)}
                                                                className="w-full px-3 py-2 text-amber-400 hover:bg-surface-hover/60 flex items-center gap-2 cursor-pointer transition-colors"
                                                            >
                                                                <FontAwesomeIcon icon={member.status === "Muted" ? faVolumeHigh : faVolumeXmark} className="text-xs w-4" />
                                                                <span>{member.status === "Muted" ? (isVi ? "Bỏ tắt tiếng" : "Unmute") : (isVi ? "Tắt tiếng" : "Mute")}</span>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleToggleBan(member.id, member.status, member.username)}
                                                                className="w-full px-3 py-2 text-rose-400 hover:bg-surface-hover/60 flex items-center gap-2 cursor-pointer transition-colors"
                                                            >
                                                                <FontAwesomeIcon icon={member.status === "Banned" ? faUnlock : faBan} className="text-xs w-4" />
                                                                <span>{member.status === "Banned" ? (isVi ? "Gỡ lệnh cấm" : "Unban") : (isVi ? "Cấm khỏi cộng đồng" : "Ban")}</span>
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
