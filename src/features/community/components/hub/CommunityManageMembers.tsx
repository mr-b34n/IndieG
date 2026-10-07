import { useTranslation } from "@/shared/hooks/useTranslate";
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
    faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import {
    useCommunityMembersQuery,
    usePendingMembersQuery,
    useProfilesListQuery,
    useMuteMemberMutation,
    useUnmuteMemberMutation,
    useBanMemberMutation,
    useUnbanMemberMutation,
    useChangeMemberRoleMutation,
} from "@/shared/api/useQueries";
import { extractMemberList } from "@/shared/api";
import type { CommunityMemberDto } from "@/shared/api/types";

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
    communityId?: string;
    communityName: string;
    isVi: boolean;
    userRole?: "owner" | "admin" | "moderator" | "member";
    onViewProfile?: (userId: string) => void;
}

export const CommunityManageMembers = ({
    communityId,
    communityName,
    isVi,
    userRole = "owner",
    onViewProfile,
}: CommunityManageMembersProps) => {
    const { t } = useTranslation();
    const isOwner = userRole === "owner" || userRole === "admin";
    const isModerator = userRole === "moderator";

    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState<"all" | "members" | "moderators" | "banned" | "muted" | "pending">("all");
    const [activeMenuMemberId, setActiveMenuMemberId] = useState<string | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [ownerProtectedNotice, setOwnerProtectedNotice] = useState(false);
    const [localOverrides, setLocalOverrides] = useState<Record<string, Partial<ManagedMemberItem>>>({});

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

    // Real API Query & Mutations
    const { data: membersQueryData, isLoading: isLoadingMembers } = useCommunityMembersQuery(communityId || "", {
        limit: 100,
    });
    const { data: pendingMembersData } = usePendingMembersQuery(communityId || "");
    const { data: profilesData } = useProfilesListQuery();
    const muteMutation = useMuteMemberMutation();
    const unmuteMutation = useUnmuteMemberMutation();
    const banMutation = useBanMemberMutation();
    const unbanMutation = useUnbanMemberMutation();
    const roleMutation = useChangeMemberRoleMutation();

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

    const apiMembers = useMemo<ManagedMemberItem[]>(() => {
        const list: CommunityMemberDto[] = extractMemberList(membersQueryData);
        const pendingList: CommunityMemberDto[] = extractMemberList(pendingMembersData);

        // Merge list avoiding duplicates
        const existingIds = new Set(list.map((m) => m.userId));
        const combined = [...list];
        for (const pm of pendingList) {
            if (pm.userId && !existingIds.has(pm.userId)) {
                combined.push({ ...pm, status: "pending" as const });
            }
        }

        return combined.map((m, idx) => {
            const roleLower = (m.role || "member").toLowerCase();
            const role: "Owner" | "Moderator" | "Member" =
                roleLower === "owner" ? "Owner" : roleLower === "moderator" ? "Moderator" : "Member";
            const statusLower = (m.status || "active").toLowerCase();
            const status: "Active" | "Muted" | "Banned" | "Pending" =
                statusLower === "muted" ? "Muted" : statusLower === "banned" ? "Banned" : statusLower === "pending" ? "Pending" : "Active";

            const uid = m.userId || String(idx);
            const profile = profilesMap.get(uid);

            const username = m.user?.name || m.user?.displayName || m.user?.username || profile?.name || `Thành viên (${uid.slice(0, 6)})`;
            const handle = m.user?.username ? `@${m.user.username}` : m.user?.name ? `@${m.user.name}` : profile?.username ? `@${profile.username}` : `@member_${uid.slice(0, 6)}`;
            const avatar = m.user?.avatarUrl || m.user?.avatar || profile?.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(m.user?.username || m.user?.name || uid)}`;
            const joinedDate = m.joinedAt ? new Date(m.joinedAt).toLocaleDateString("vi-VN") : (t('hub.communitymanagemembers_43'));
            const activitySummary = m.mutedUntil
                ? (isVi ? `Bị tắt tiếng đến ${new Date(m.mutedUntil).toLocaleTimeString()}` : `Muted until ${new Date(m.mutedUntil).toLocaleTimeString()}`)
                : status === "Banned"
                ? (t('hub.communitymanagemembers_44'))
                : status === "Pending"
                ? (t('hub.communitymanagemembers_45'))
                : (t('hub.communitymanagemembers_46'));

            return {
                id: uid,
                username,
                handle,
                avatar,
                role,
                status,
                joinedDate,
                activitySummary,
                isOnline: false,
            };
        });
    }, [membersQueryData, pendingMembersData, profilesMap, isVi]);

    // Merge API members with local optimistic updates
    const members = useMemo(() => {
        return apiMembers.map((m) => {
            if (localOverrides[m.id]) {
                return { ...m, ...localOverrides[m.id] };
            }
            return m;
        });
    }, [apiMembers, localOverrides]);

    // Action Handlers
    const handleToggleMute = async (id: string, currentStatus: string, name: string) => {
        const isMuted = currentStatus === "Muted";
        const newStatus = isMuted ? "Active" : "Muted";
        setLocalOverrides((prev) => ({
            ...prev,
            [id]: {
                status: newStatus,
                activitySummary: newStatus === "Muted" ? (t('hub.communitymanagemembers_47')) : (t('hub.communitymanagemembers_48')),
            },
        }));
        setActiveMenuMemberId(null);
        if (communityId) {
            try {
                if (isMuted) {
                    await unmuteMutation.mutateAsync({ communityId, memberId: id });
                } else {
                    await muteMutation.mutateAsync({
                        communityId,
                        memberId: id,
                        data: {
                            userId: id,
                            muteMinutes: 1440,
                            reason: "Muted 24h",
                        },
                    });
                }
            } catch {
                // query will re-sync
            }
        }
        showToast(
            isMuted
                ? (isVi ? `Đã bỏ tắt tiếng ${name}.` : `Unmuted ${name}.`)
                : (isVi ? `Đã tắt tiếng ${name} trong 24 giờ.` : `Muted ${name} for 24 hours.`)
        );
    };

    const handleToggleBan = async (id: string, currentStatus: string, name: string) => {
        const isBanned = currentStatus === "Banned";
        const newStatus = isBanned ? "Active" : "Banned";
        setLocalOverrides((prev) => ({
            ...prev,
            [id]: {
                status: newStatus,
                activitySummary: newStatus === "Banned" ? (t('hub.communitymanagemembers_49')) : (t('hub.communitymanagemembers_50')),
            },
        }));
        setActiveMenuMemberId(null);
        if (communityId) {
            try {
                if (isBanned) {
                    await unbanMutation.mutateAsync({ communityId, memberId: id });
                } else {
                    await banMutation.mutateAsync({
                        communityId,
                        memberId: id,
                        data: {
                            userId: id,
                            reason: "Banned by moderation",
                            durationMinutes: 10080,
                        },
                    });
                }
            } catch {
                // query will re-sync
            }
        }
        showToast(
            isBanned
                ? (isVi ? `Đã gỡ cấm ${name} khỏi cộng đồng.` : `Unbanned ${name}.`)
                : (isVi ? `Đã cấm ${name} khỏi cộng đồng này.` : `Banned ${name} from this community.`)
        );
    };

    const handlePromoteToModerator = async (id: string, name: string) => {
        if (!isOwner) return;
        setLocalOverrides((prev) => ({
            ...prev,
            [id]: { role: "Moderator" as const },
        }));
        setActiveMenuMemberId(null);
        if (communityId) {
            try {
                await roleMutation.mutateAsync({ communityId, memberId: id, role: "moderator" });
            } catch {
                // query will re-sync
            }
        }
        showToast(isVi ? `Đã thăng cấp ${name} làm Điều hành viên!` : `Promoted ${name} to Moderator.`);
    };

    const handleRemoveModerator = async (id: string, name: string) => {
        if (!isOwner) return;
        if (!window.confirm(isVi ? `Hạ cấp ${name} xuống thành viên thông thường?` : `Remove ${name} from Moderator role?`)) {
            return;
        }
        setLocalOverrides((prev) => ({
            ...prev,
            [id]: { role: "Member" as const },
        }));
        setActiveMenuMemberId(null);
        if (communityId) {
            try {
                await roleMutation.mutateAsync({ communityId, memberId: id, role: "member" });
            } catch {
                // query will re-sync
            }
        }
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

    // Member view restriction
    if (!isOwner && !isModerator) {
        return (
            <div className="w-full p-8 rounded-[6px] border border-divider-primary/50 bg-surface-inner flex flex-col items-center justify-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-surface-hover flex items-center justify-center text-text-faint text-lg">
                    <FontAwesomeIcon icon={faShieldHalved} />
                </div>
                <h3 className="text-sm font-bold text-text">
                    {t('hub.communitymanagemembers_51')}
                </h3>
                <p className="text-xs text-text-muted max-w-md">
                    {t('hub.communitymanagemembers_52')}
                </p>
            </div>
        );
    }

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
                                {t('hub.communitymanagemembers_53')}
                            </span>
                            <span className="text-[11px] text-amber-200/80 leading-relaxed mt-0.5 block">
                                {t('hub.communitymanagemembers_54')}
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
                        placeholder={t('hub.communitymanagemembers_55')}
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
                    <span>{t('hub.communitymanagemembers_56')}</span>
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
                    <span>{t('hub.communitymanagemembers_57')}</span>
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
                    <span>{t('hub.communitymanagemembers_58')}</span>
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
                    <span>{t('hub.communitymanagemembers_59')}</span>
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
                    <span>{t('hub.communitymanagemembers_60')}</span>
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
                    <span>{t('hub.communitymanagemembers_61')}</span>
                    <span className="font-mono text-[10px] text-text-faint">({counts.pending})</span>
                </button>
            </div>

            {/* MEMBER TABLE / LIST (Restrained, almost borderless, strong information hierarchy) */}
            <div className="w-full overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                    <thead>
                        <tr className="border-b border-divider-primary/50 text-[10px] font-mono text-text-faint uppercase">
                            <th className="pb-2.5 font-bold pl-2">{t('hub.communitymanagemembers_62')}</th>
                            <th className="pb-2.5 font-bold">{t('hub.communitymanagemembers_63')}</th>
                            <th className="pb-2.5 font-bold">{t('hub.communitymanagemembers_64')}</th>
                            <th className="pb-2.5 font-bold hidden md:table-cell">{t('hub.communitymanagemembers_65')}</th>
                            <th className="pb-2.5 font-bold hidden sm:table-cell">{t('hub.communitymanagemembers_66')}</th>
                            <th className="pb-2.5 font-bold text-right pr-2">...</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-divider-primary/30">
                        {filteredMembers.map((member, idx) => {
                            const isMenuOpen = activeMenuMemberId === member.id;

                            return (
                                <tr
                                    key={`${member.id || member.userId}-${idx}`}
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
                                                        <span>{t('hub.communitymanagemembers_67')}</span>
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
                                                            <span>{t('hub.communitymanagemembers_68')}</span>
                                                        </button>
                                                    ) : member.role === "Moderator" ? (
                                                        isOwner ? (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveModerator(member.id, member.username)}
                                                                    className="w-full px-3 py-2 text-text-muted hover:text-rose-400 hover:bg-surface-hover/60 flex items-center gap-2 cursor-pointer transition-colors border-t border-divider-primary/40"
                                                                >
                                                                    <FontAwesomeIcon icon={faShieldHalved} className="text-xs text-text-faint w-4" />
                                                                    <span>{t('hub.communitymanagemembers_69')}</span>
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleToggleMute(member.id, member.status, member.username)}
                                                                    className="w-full px-3 py-2 text-amber-400 hover:bg-surface-hover/60 flex items-center gap-2 cursor-pointer transition-colors"
                                                                >
                                                                    <FontAwesomeIcon icon={member.status === "Muted" ? faVolumeHigh : faVolumeXmark} className="text-xs w-4" />
                                                                    <span>{member.status === "Muted" ? (t('hub.communitymanagemembers_70')) : (t('hub.communitymanagemembers_71'))}</span>
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleToggleBan(member.id, member.status, member.username)}
                                                                    className="w-full px-3 py-2 text-rose-400 hover:bg-surface-hover/60 flex items-center gap-2 cursor-pointer transition-colors"
                                                                >
                                                                    <FontAwesomeIcon icon={member.status === "Banned" ? faUnlock : faBan} className="text-xs w-4" />
                                                                    <span>{member.status === "Banned" ? (t('hub.communitymanagemembers_72')) : (t('hub.communitymanagemembers_73'))}</span>
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <div className="px-3 py-2 text-[11px] text-text-faint italic border-t border-divider-primary/40 flex items-center gap-1.5">
                                                                <FontAwesomeIcon icon={faShieldHalved} className="text-[10px] text-primary" />
                                                                <span>{t('hub.communitymanagemembers_74')}</span>
                                                            </div>
                                                        )
                                                    ) : (
                                                        /* Normal Member */
                                                        <>
                                                            {isOwner && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handlePromoteToModerator(member.id, member.username)}
                                                                    className="w-full px-3 py-2 text-primary hover:bg-surface-hover/60 flex items-center gap-2 cursor-pointer transition-colors border-t border-divider-primary/40 font-semibold"
                                                                >
                                                                    <FontAwesomeIcon icon={faShieldHalved} className="text-xs text-primary w-4" />
                                                                    <span>{t('hub.communitymanagemembers_75')}</span>
                                                                </button>
                                                            )}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleToggleMute(member.id, member.status, member.username)}
                                                                className="w-full px-3 py-2 text-amber-400 hover:bg-surface-hover/60 flex items-center gap-2 cursor-pointer transition-colors"
                                                            >
                                                                <FontAwesomeIcon icon={member.status === "Muted" ? faVolumeHigh : faVolumeXmark} className="text-xs w-4" />
                                                                <span>{member.status === "Muted" ? (t('hub.communitymanagemembers_76')) : (t('hub.communitymanagemembers_77'))}</span>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleToggleBan(member.id, member.status, member.username)}
                                                                className="w-full px-3 py-2 text-rose-400 hover:bg-surface-hover/60 flex items-center gap-2 cursor-pointer transition-colors"
                                                            >
                                                                <FontAwesomeIcon icon={member.status === "Banned" ? faUnlock : faBan} className="text-xs w-4" />
                                                                <span>{member.status === "Banned" ? (t('hub.communitymanagemembers_78')) : (t('hub.communitymanagemembers_79'))}</span>
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

                {isLoadingMembers && (
                    <div className="py-12 flex flex-col items-center justify-center gap-2 text-text-faint">
                        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-lg text-primary" />
                        <span className="text-xs">{t('hub.communitymanagemembers_80')}</span>
                    </div>
                )}

                {!isLoadingMembers && filteredMembers.length === 0 && (
                    <div className="py-12 px-4 text-center flex flex-col items-center justify-center gap-2">
                        <FontAwesomeIcon icon={faUser} className="text-2xl text-text-faint/60" />
                        <p className="text-xs text-text-muted">
                            {t('hub.communitymanagemembers_81')}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
