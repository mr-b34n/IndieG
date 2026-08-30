import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faSearch,
    faTrophy,
    faUsers,
    faCrown,
    faShieldHalved,
} from "@fortawesome/free-solid-svg-icons";
import type { ContributorItem } from "./CommunityHubRightRail";

interface MemberItem {
    id: string;
    name: string;
    handle: string;
    avatar: string;
    role: "Admin" | "Moderator" | "VIP" | "Member";
    points: number;
    joinedDate: string;
    isOnline?: boolean;
}

interface CommunityHubMembersProps {
    communityName: string;
    contributors: ContributorItem[];
    isVi: boolean;
}

export const CommunityHubMembers = ({
    contributors,
    isVi,
}: CommunityHubMembersProps) => {
    const [subTab, setSubTab] = useState<"all" | "staff" | "leaderboard">("all");

    const [searchQuery, setSearchQuery] = useState("");

    // Enhanced sample members list based on contributors
    const sampleMembers: MemberItem[] = [
        {
            id: "m-1",
            name: "Hải Đăng (Admin)",
            handle: "@haidang_craft",
            avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
            role: "Admin",
            points: 2450,
            joinedDate: "12/2024",
            isOnline: true,
        },
        {
            id: "m-2",
            name: "Minh Quân",
            handle: "@shark_hunter99",
            avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80",
            role: "Moderator",
            points: 1820,
            joinedDate: "01/2025",
            isOnline: true,
        },
        {
            id: "m-3",
            name: "Thùy Trang",
            handle: "@raft_architect",
            avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
            role: "VIP",
            points: 1240,
            joinedDate: "02/2025",
            isOnline: false,
        },
        {
            id: "m-4",
            name: "Tuấn Kiệt",
            handle: "@tuan_kiet_dota",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
            role: "Member",
            points: 980,
            joinedDate: "02/2025",
            isOnline: true,
        },
        {
            id: "m-5",
            name: "Hoàng Long",
            handle: "@long_survival",
            avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80",
            role: "Member",
            points: 750,
            joinedDate: "03/2025",
            isOnline: false,
        },
    ];

    const filteredMembers = sampleMembers.filter((m) => {
        const matchesSearch =
            m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.handle.toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchesSearch) return false;
        if (subTab === "staff") return m.role === "Admin" || m.role === "Moderator";
        return true;
    });

    const getRoleBadge = (role: MemberItem["role"]) => {
        switch (role) {
            case "Admin":
                return (
                    <span className="px-2 py-0.5 rounded bg-rose-500/15 border border-rose-500/30 text-rose-400 text-[10px] font-mono font-bold uppercase flex items-center gap-1">
                        <FontAwesomeIcon icon={faCrown} className="text-[9px]" />
                        <span>Admin</span>
                    </span>
                );
            case "Moderator":
                return (
                    <span className="px-2 py-0.5 rounded bg-blue-500/15 border border-blue-500/30 text-blue-400 text-[10px] font-mono font-bold uppercase flex items-center gap-1">
                        <FontAwesomeIcon icon={faShieldHalved} className="text-[9px]" />
                        <span>Mod</span>
                    </span>
                );
            case "VIP":
                return (
                    <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-bold uppercase">
                        VIP
                    </span>
                );
            default:
                return (
                    <span className="px-2 py-0.5 rounded bg-surface-inner border border-divider-primary/50 text-text-muted text-[10px] font-mono font-semibold">
                        Member
                    </span>
                );
        }
    };

    return (
        <div className="w-full flex flex-col gap-5 select-none">
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-divider-primary/60 pb-3">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setSubTab("all")}
                        className={`px-3 py-1.5 rounded-[4px] text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            subTab === "all"
                                ? "bg-primary text-white"
                                : "text-text-muted hover:text-text bg-surface border border-divider-primary/60"
                        }`}
                    >
                        <FontAwesomeIcon icon={faUsers} className="text-xs" />
                        <span>{isVi ? "Tất cả thành viên" : "All Members"}</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setSubTab("staff")}
                        className={`px-3 py-1.5 rounded-[4px] text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            subTab === "staff"
                                ? "bg-primary text-white"
                                : "text-text-muted hover:text-text bg-surface border border-divider-primary/60"
                        }`}
                    >
                        <FontAwesomeIcon icon={faShieldHalved} className="text-xs" />
                        <span>{isVi ? "Ban quản trị" : "Staff & Mods"}</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setSubTab("leaderboard")}
                        className={`px-3 py-1.5 rounded-[4px] text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            subTab === "leaderboard"
                                ? "bg-primary text-white"
                                : "text-text-muted hover:text-text bg-surface border border-divider-primary/60"
                        }`}
                    >
                        <FontAwesomeIcon icon={faTrophy} className="text-xs text-amber-400" />
                        <span>{isVi ? "Bảng xếp hạng" : "Leaderboard"}</span>
                    </button>
                </div>

                {/* Search Bar */}
                <div className="relative min-w-[200px]">
                    <FontAwesomeIcon
                        icon={faSearch}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-faint text-xs"
                    />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={isVi ? "Tìm thành viên..." : "Search members..."}
                        className="w-full pl-7 pr-3 py-1.5 bg-surface-inner border border-divider-primary/70 rounded-[4px] text-xs text-text placeholder:text-text-faint focus:outline-none focus:border-primary"
                    />
                </div>
            </div>

            {/* View Render */}
            {subTab === "leaderboard" ? (
                <div className="flex flex-col gap-3">
                    <div className="p-4 rounded-[4px] bg-gradient-to-r from-amber-500/10 via-surface to-surface border border-amber-500/30 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-base">
                                <FontAwesomeIcon icon={faTrophy} />
                            </div>
                            <div>
                                <h3 className="font-extrabold text-sm text-text">{isVi ? "Bảng Vinh Danh Đóng Góp" : "Top Community Contributors"}</h3>
                                <p className="text-xs text-text-muted">{isVi ? "Điểm thưởng từ việc viết guide, trả lời câu hỏi và tương tác." : "Ranked by helpful replies, guides written and community impact."}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col divide-y divide-divider-primary/40">
                        {contributors.map((c, idx) => (
                            <div key={c.id} className="py-3 px-2 flex items-center justify-between hover:bg-surface-hover/30 rounded-[4px] transition-colors">
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className={`w-6 text-center font-mono font-black text-sm ${
                                        idx === 0 ? "text-amber-400" : idx === 1 ? "text-slate-300" : idx === 2 ? "text-amber-600" : "text-text-faint"
                                    }`}>
                                        #{idx + 1}
                                    </span>
                                    <img
                                        src={c.avatar}
                                        alt={c.name}
                                        className="w-9 h-9 rounded-full object-cover border border-divider-primary shrink-0"
                                    />
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-bold text-xs text-text truncate">{c.name}</span>
                                        <span className="text-[11px] font-mono text-text-muted">{c.handle}</span>
                                    </div>
                                </div>

                                <span className="font-mono text-xs font-bold text-primary">
                                    {c.points} pts
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredMembers.map((member) => (
                        <div
                            key={member.id}
                            className="p-3 rounded-[4px] bg-surface/70 border border-divider-primary/60 hover:border-divider-primary transition-all flex items-center justify-between gap-3"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="relative">
                                    <img
                                        src={member.avatar}
                                        alt={member.name}
                                        className="w-10 h-10 rounded-full object-cover border border-divider-primary shrink-0"
                                    />
                                    {member.isOnline && (
                                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-surface" />
                                    )}
                                </div>

                                <div className="flex flex-col min-w-0">
                                    <div className="flex items-center gap-1.5 truncate">
                                        <span className="font-bold text-xs text-text truncate">{member.name}</span>
                                    </div>
                                    <span className="text-[11px] font-mono text-text-muted truncate">{member.handle}</span>
                                    <span className="text-[10px] font-mono text-text-faint pt-0.5">
                                        {isVi ? "Gia nhập:" : "Joined:"} {member.joinedDate}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-1 shrink-0">
                                {getRoleBadge(member.role)}
                                <span className="text-[11px] font-mono font-bold text-text-muted">
                                    {member.points} pts
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
