import React, { useEffect, useRef, useState } from "react";
import {
    Camera,
    Check,
    X,
    UserPlus,
    UserCheck,
    UserX,
    MoreHorizontal,
    ChevronDown,
    Ban,
    MessageSquare,
    Clock,
    Loader2,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    MapPin,
    Calendar,
    Pen,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "@/features/auth";
import { useClickOutside } from "../hooks/useClickOutside";
import { useUsernameAvailability } from "../hooks/useUsernameAvailability";
import type { Badge, ProfileIdentity, ProfileStatus } from "../types";
import type { TranslateFn } from "@/shared/hooks/useTranslate";

interface ProfileHeroProps {
    coverSrc: string;
    avatarUrl: string;
    isOwnProfile: boolean;
    identity: ProfileIdentity;
    originalUsername?: string;
    onIdentityChange: (next: Partial<ProfileIdentity>) => void;
    equippedBadge?: Badge;
    forumRankNode: React.ReactNode;
    isFriend: boolean;
    isBlocked: boolean;
    isPendingOutgoing?: boolean;
    isPendingIncoming?: boolean;
    onCancelRequest?: () => void;
    onAcceptRequest?: () => void;
    isFriendActionLoading?: boolean;
    onSelectCoverFile: (file: File) => void;
    onSelectAvatarFile: (file: File) => void;
    onSaveIdentity?: () => void;
    onOpenBadgeSelector?: () => void;
    onOpenEditModal?: () => void;
    isCustomizeMode?: boolean;
    onToggleCustomizeMode?: () => void;
    isEditMode?: boolean;
    onStartEditMode?: () => void;
    onSaveEdit?: () => void;
    onDiscardEdit?: () => void;
    onAddFriend: () => void;
    onUnfriend: () => void;
    onBlock: () => void;
    onUnblock: () => void;
    location?: string;
    joinedDate?: string;
    reputationPercent?: number;
    followersCount?: number;
    followingCount?: number;
    postsCount?: number;
    communitiesCount?: number;
    t: TranslateFn;
}

const STATUS_OPTIONS: { val: ProfileStatus; label: string; dotColor: string }[] = [
    { val: "online", label: "Online", dotColor: "bg-emerald-500" },
    { val: "in-game", label: "In‑Game", dotColor: "bg-primary" },
    { val: "offline", label: "Offline", dotColor: "bg-text-faint" },
];

const statusCfg = (s: ProfileStatus) =>
    STATUS_OPTIONS.find((o) => o.val === s) ?? STATUS_OPTIONS[0];

export const ProfileHero = ({
    coverSrc,
    avatarUrl,
    isOwnProfile,
    identity,
    originalUsername,
    onIdentityChange,
    forumRankNode,
    isFriend,
    isBlocked,
    isPendingOutgoing = false,
    isPendingIncoming = false,
    onCancelRequest,
    onAcceptRequest,
    isFriendActionLoading = false,
    onSelectCoverFile,
    onSelectAvatarFile,
    onSaveIdentity,
    isCustomizeMode,
    onToggleCustomizeMode,
    isEditMode = false,
    onStartEditMode,
    onSaveEdit,
    onDiscardEdit,
    onAddFriend,
    onUnfriend,
    onBlock,
    onUnblock,
    location,
    joinedDate,
    followersCount = 0,
    followingCount = 0,
    t,
}: ProfileHeroProps) => {
    const isEditing = isEditMode || isCustomizeMode;

    const usernameCheck = useUsernameAvailability({
        username: identity.username || "",
        currentUsername: originalUsername,
        enabled: isEditing,
    });

    const [showFriendMenu, setShowFriendMenu] = useState(false);
    const [isEditingStatus, setIsEditingStatus] = useState(false);
    const [coverRatio, setCoverRatio] = useState<number>(4.5);
    const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
    const [coverLoadFailed, setCoverLoadFailed] = useState(false);

    useEffect(() => {
        setAvatarLoadFailed(false);
    }, [avatarUrl]);

    useEffect(() => {
        setCoverLoadFailed(false);
    }, [coverSrc]);

    useEffect(() => {
        if (!coverSrc) return;
        const img = new Image();
        img.src = coverSrc;
        img.onload = () => {
            if (img.naturalWidth && img.naturalHeight > 0) {
                setCoverRatio(img.naturalWidth / img.naturalHeight);
            }
        };
    }, [coverSrc]);

    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const isLoggedIn = !!user;

    const requireVerifiedEmail = useAuthStore((state) => state.requireVerifiedEmail);

    const handleProtectedAction = (actionName: string, action: () => void) => {
        if (!isLoggedIn) {
            navigate({ to: "/auth" });
            return;
        }
        if (!requireVerifiedEmail(actionName)) return;
        action();
    };

    const friendMenuRef = useRef<HTMLDivElement>(null);
    useClickOutside(friendMenuRef, () => setShowFriendMenu(false), showFriendMenu);

    const statusMenuRef = useRef<HTMLDivElement>(null);
    useClickOutside(statusMenuRef, () => setIsEditingStatus(false), isEditingStatus);

    const cfg = statusCfg(identity.status);

    const level = identity.level || 1;
    const currentXp = identity.currentXp || 0;
    const maxXp = identity.maxXp || 1000;
    const xpPercent = maxXp > 0 ? Math.min(100, Math.round((currentXp / maxXp) * 100)) : 0;

    return (
        <div className="relative w-full rounded-2xl overflow-hidden bg-surface border border-border shadow-xs transition-colors" style={{ isolation: "isolate" }}>

            {/* ── 1. Full Cover Banner (Adaptive ratio) ── */}
            <div
                className="relative w-full overflow-hidden bg-surface-inner min-h-[220px] sm:min-h-[260px] md:min-h-[300px] flex flex-col justify-end"
                style={{ aspectRatio: coverRatio }}
            >
                {coverSrc && !coverLoadFailed ? (
                    <img
                        src={coverSrc}
                        alt="Gamer Cover"
                        onLoad={(e) => {
                            const { naturalWidth, naturalHeight } = e.currentTarget;
                            if (naturalWidth && naturalHeight > 0) {
                                setCoverRatio(naturalWidth / naturalHeight);
                            }
                        }}
                        onError={() => setCoverLoadFailed(true)}
                        className="absolute inset-0 w-full h-full object-cover object-center"
                    />
                ) : (
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-surface-inner via-surface-hover to-surface-inner" />
                )}

                {/* ── Gamer Identity & Actions directly inside the cover banner ── */}
                <div className="relative z-20 px-4 sm:px-6 pb-4 sm:pb-5 pt-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    
                    {/* Left: Avatar + Identity Info */}
                    <div className="flex items-end gap-3.5 sm:gap-4 min-w-0 flex-1">
                        {/* Avatar Box with Initial Letter Fallback */}
                        <div className="relative shrink-0 group">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-26 md:h-26 rounded-full overflow-hidden bg-surface ring-4 ring-black/40 shadow-2xl flex items-center justify-center">
                                {avatarUrl && !avatarLoadFailed ? (
                                    <img
                                        src={avatarUrl}
                                        alt={identity.name}
                                        className="w-full h-full object-cover"
                                        onError={() => setAvatarLoadFailed(true)}
                                    />
                                ) : (
                                    <span className="text-2xl sm:text-3xl font-extrabold text-primary select-none uppercase">
                                        {(identity.name || identity.username || "G").replace(/^@/, "").charAt(0) || "G"}
                                    </span>
                                )}
                            </div>

                            {/* Avatar upload overlay (Owner Only) */}
                            {isOwnProfile && (
                                <label
                                    className="absolute inset-0 rounded-full bg-black/65 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer select-none"
                                    title={t("profile.changeAvatar", { defaultValue: "Đổi ảnh đại diện" })}
                                >
                                    <Camera className="size-5 mb-0.5" />
                                    <span className="text-[10px] font-bold">Đổi ảnh</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => { const f = e.target.files?.[0]; if (f) onSelectAvatarFile(f); e.target.value = ""; }}
                                    />
                                </label>
                            )}

                            {/* Point 2: Classic green status dot (circular dot, no pill text) */}
                            <div className="absolute bottom-0.5 right-0.5 sm:bottom-1 sm:right-1 z-30" ref={statusMenuRef}>
                                <button
                                    type="button"
                                    onClick={() => isOwnProfile && setIsEditingStatus((v) => !v)}
                                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full ring-2 ring-black/80 ${cfg.dotColor} shadow-md flex items-center justify-center ${
                                        isOwnProfile ? "cursor-pointer hover:scale-110 transition-transform" : "cursor-default"
                                    }`}
                                    title={isOwnProfile ? `${cfg.label} (Click để đổi trạng thái)` : cfg.label}
                                />

                                {isEditingStatus && isOwnProfile && (
                                    <div className="absolute bottom-full left-0 mb-2 w-36 bg-surface border border-border rounded-xl p-1.5 z-50 flex flex-col gap-0.5 shadow-xl animate-dropdown">
                                        {STATUS_OPTIONS.map((s) => (
                                            <button
                                                key={s.val}
                                                type="button"
                                                onClick={() => {
                                                    onIdentityChange({ status: s.val });
                                                    setIsEditingStatus(false);
                                                    onSaveIdentity?.();
                                                }}
                                                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors text-left cursor-pointer ${
                                                    identity.status === s.val
                                                        ? "bg-surface-inner text-primary font-bold"
                                                        : "text-text hover:bg-surface-hover"
                                                }`}
                                            >
                                                <span className={`w-2 h-2 rounded-full shrink-0 ${s.dotColor}`} />
                                                <span className="flex-1">{s.label}</span>
                                                {identity.status === s.val && <Check className="size-3 text-primary ml-auto" />}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Text Identity Block with tight fade matching displayname/username size */}
                        <div className="relative w-fit max-w-full flex flex-col gap-1 pb-0.5 min-w-0">
                            {/* Diffused fade tightly bounded to displayname/username bounds */}
                            <div 
                                className="absolute -inset-x-3 -inset-y-1.5 rounded-xl bg-black/55 blur-md pointer-events-none -z-10" 
                                aria-hidden="true" 
                            />

                            {isEditing ? (
                                <div className="flex flex-col gap-2 max-w-lg">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <input
                                            type="text"
                                            value={identity.name}
                                            onChange={(e) => onIdentityChange({ name: e.target.value })}
                                            className="h-9 px-3 rounded-xl bg-black/60 backdrop-blur-md border border-white/25 text-white font-bold text-sm sm:text-base w-48 sm:w-60 focus:outline-none focus:border-primary transition-colors"
                                            placeholder={t("profile.displayNameLabel", { defaultValue: "Tên hiển thị" })}
                                        />
                                        <div className="relative flex items-center">
                                            <input
                                                type="text"
                                                value={identity.username}
                                                onChange={(e) => onIdentityChange({ username: e.target.value })}
                                                onBlur={() => {
                                                    if (identity.username) {
                                                        const trimmed = identity.username.trim();
                                                        const clean = trimmed.replace(/^@+/, "");
                                                        if (clean) {
                                                            onIdentityChange({ username: `@${clean}` });
                                                        }
                                                    }
                                                }}
                                                className={`h-9 px-3 pr-8 rounded-xl bg-black/60 backdrop-blur-md border text-xs sm:text-sm text-zinc-200 font-mono font-medium w-36 sm:w-48 focus:outline-none transition-colors ${
                                                    usernameCheck.status === "taken"
                                                        ? "border-rose-500/80 focus:border-rose-500"
                                                        : usernameCheck.status === "available"
                                                        ? "border-emerald-500/80 focus:border-emerald-500"
                                                        : usernameCheck.status === "invalid"
                                                        ? "border-amber-500/80 focus:border-amber-500"
                                                        : "border-white/25 focus:border-primary"
                                                }`}
                                                placeholder="@username"
                                            />
                                            <div
                                                className="absolute right-2.5 flex items-center justify-center pointer-events-auto"
                                                title={usernameCheck.message}
                                            >
                                                {usernameCheck.status === "checking" && (
                                                    <Loader2 className="size-3.5 animate-spin text-primary" />
                                                )}
                                                {usernameCheck.status === "current" && (
                                                    <Check className="size-3.5 text-emerald-400" />
                                                )}
                                                {usernameCheck.status === "available" && (
                                                    <CheckCircle2 className="size-3.5 text-emerald-400" />
                                                )}
                                                {usernameCheck.status === "taken" && (
                                                    <XCircle className="size-3.5 text-rose-400" />
                                                )}
                                                {usernameCheck.status === "invalid" && (
                                                    <AlertTriangle className="size-3.5 text-amber-400" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {usernameCheck.status !== "idle" && usernameCheck.status !== "current" && usernameCheck.message && (
                                        <div className={`text-[11px] font-medium flex items-center gap-1.5 px-0.5 ${
                                            usernameCheck.status === "taken"
                                                ? "text-rose-400"
                                                : usernameCheck.status === "available"
                                                ? "text-emerald-400"
                                                : usernameCheck.status === "invalid"
                                                ? "text-amber-400"
                                                : "text-zinc-300"
                                        }`}>
                                            <span>{usernameCheck.message}</span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight drop-shadow-md truncate">
                                            {identity.name}
                                        </h1>
                                        {identity.isBanned && (
                                            <span className="px-2 py-0.5 rounded-md bg-rose-500/25 border border-rose-500/40 text-rose-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
                                                <Ban className="size-3" />
                                                <span>Banned</span>
                                            </span>
                                        )}
                                        {identity.archived && !identity.isBanned && (
                                            <span className="px-2 py-0.5 rounded-md bg-amber-500/25 border border-amber-500/40 text-amber-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
                                                <Clock className="size-3" />
                                                <span>Archived</span>
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 flex-wrap text-xs text-zinc-300 drop-shadow-sm">
                                        {/* Point 5: Neutral gray username with suitable tone */}
                                        <span className="font-mono font-medium text-zinc-300 tracking-tight">{identity.username}</span>

                                        {location && (
                                            <>
                                                <span className="text-zinc-400">•</span>
                                                <span className="flex items-center gap-1 text-zinc-300">
                                                    <MapPin className="size-3 text-zinc-400" />
                                                    <span>{location}</span>
                                                </span>
                                            </>
                                        )}

                                        {joinedDate && (
                                            <>
                                                <span className="text-zinc-400">•</span>
                                                <span className="flex items-center gap-1 text-zinc-300">
                                                    <Calendar className="size-3 text-zinc-400" />
                                                    <span>{joinedDate}</span>
                                                </span>
                                            </>
                                        )}
                                    </div>

                                    {forumRankNode && (
                                        <div className="flex flex-wrap items-center gap-2 mt-1">
                                            {forumRankNode}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Right: Actions Cluster (Point 1: Removed 'Edit profile' button) */}
                    <div className="flex items-center gap-2 shrink-0 self-stretch sm:self-end justify-end flex-wrap relative z-20">
                        {isOwnProfile ? (
                            <>
                                {isEditing ? (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (onDiscardEdit) onDiscardEdit();
                                                else if (onToggleCustomizeMode) onToggleCustomizeMode();
                                            }}
                                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-black/60 hover:bg-black/80 text-zinc-200 border border-white/20 text-xs font-semibold backdrop-blur-md transition-all cursor-pointer shadow-md active:scale-95"
                                            title={t("profile.cancel", { defaultValue: "Hủy" })}
                                        >
                                            <X className="size-3.5" />
                                            <span>{t("profile.cancel", { defaultValue: "Hủy" })}</span>
                                        </button>
                                        <button
                                            type="button"
                                            disabled={usernameCheck.isTaken || !usernameCheck.isValid || usernameCheck.isChecking}
                                            onClick={() => {
                                                if (usernameCheck.isTaken || !usernameCheck.isValid || usernameCheck.isChecking) return;
                                                if (onSaveEdit) onSaveEdit();
                                                else if (onToggleCustomizeMode) onToggleCustomizeMode();
                                            }}
                                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold transition-all cursor-pointer shadow-md active:scale-95"
                                            title={usernameCheck.isTaken ? usernameCheck.message : t("profile.saveChanges", { defaultValue: "Lưu thay đổi" })}
                                        >
                                            {usernameCheck.isChecking ? (
                                                <Loader2 className="size-3.5 animate-spin" />
                                            ) : (
                                                <Check className="size-3.5" />
                                            )}
                                            <span>{t("profile.saveChanges", { defaultValue: "Lưu thay đổi" })}</span>
                                        </button>
                                    </>
                                ) : (
                                    /* Point 1: Only "Edit cover photo" here, no 'edit profile' button */
                                    <label
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs font-semibold border border-white/20 transition-all cursor-pointer shadow-md select-none active:scale-95"
                                        title={t("profile.editCoverPhoto", { defaultValue: "Chỉnh sửa ảnh bìa" })}
                                    >
                                        <Camera className="size-3.5 text-white/90" />
                                        <span className="hidden sm:inline">{t("profile.editCoverPhoto", { defaultValue: "Edit cover photo" })}</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => { const f = e.target.files?.[0]; if (f) onSelectCoverFile(f); e.target.value = ""; }}
                                        />
                                    </label>
                                )}
                            </>
                        ) : isBlocked ? (
                            <button
                                type="button"
                                onClick={onUnblock}
                                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/25 text-rose-300 hover:bg-rose-500/35 border border-rose-500/40 text-xs font-bold backdrop-blur-md transition-all cursor-pointer shadow-md"
                            >
                                <Ban className="size-3.5" />
                                <span>{t("profile.unblockSuccess", { defaultValue: "Bỏ chặn" })}</span>
                            </button>
                        ) : (
                            <div className="relative flex items-center gap-2" ref={friendMenuRef}>
                                <button
                                    type="button"
                                    onClick={() => handleProtectedAction(t("profile.message", { defaultValue: "gửi tin nhắn" }), () => {})}
                                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 text-xs font-semibold transition-all cursor-pointer shadow-md active:scale-95"
                                >
                                    <MessageSquare className="size-3.5 text-primary" />
                                    <span>{t("profile.message", { defaultValue: "Nhắn tin" })}</span>
                                </button>

                                {isFriendActionLoading ? (
                                    <button
                                        type="button"
                                        disabled
                                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-black/60 text-zinc-400 backdrop-blur-md border border-white/10 text-xs font-semibold"
                                    >
                                        <Loader2 className="size-3.5 animate-spin" />
                                        <span>{t("common.loading", { defaultValue: "Đang xử lý..." })}</span>
                                    </button>
                                ) : isFriend ? (
                                    <button
                                        type="button"
                                        onClick={() => handleProtectedAction(t("profile.friendsWidgetTitle", { defaultValue: "quản lý bạn bè" }), () => setShowFriendMenu((v) => !v))}
                                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/25 text-emerald-300 hover:bg-emerald-500/35 backdrop-blur-md border border-emerald-500/40 text-xs font-bold transition-all cursor-pointer shadow-md active:scale-95"
                                    >
                                        <UserCheck className="size-3.5" />
                                        <span>{t("profile.friendAdded", { defaultValue: "Bạn bè" })}</span>
                                        <ChevronDown className={`size-3 transition-transform ${showFriendMenu ? "rotate-180" : ""}`} />
                                    </button>
                                ) : isPendingIncoming ? (
                                    <button
                                        type="button"
                                        onClick={() => handleProtectedAction(t("profile.accept", { defaultValue: "chấp nhận kết bạn" }), () => onAcceptRequest?.())}
                                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md active:scale-95"
                                    >
                                        <UserCheck className="size-3.5" />
                                        <span>{t("profile.accept", { defaultValue: "Chấp nhận" })}</span>
                                    </button>
                                ) : isPendingOutgoing ? (
                                    <button
                                        type="button"
                                        onClick={() => handleProtectedAction(t("profile.cancelFriendRequest", { defaultValue: "hủy lời mời" }), () => onCancelRequest?.())}
                                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/25 hover:bg-amber-500/35 text-amber-300 backdrop-blur-md border border-amber-500/40 text-xs font-bold transition-all cursor-pointer shadow-md active:scale-95"
                                        title={t("profile.cancelFriendRequest", { defaultValue: "Nhấn để hủy lời mời" })}
                                    >
                                        <Clock className="size-3.5" />
                                        <span>{t("profile.friendRequestSent", { defaultValue: "Đã gửi lời mời" })}</span>
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => handleProtectedAction(t("profile.addFriend", { defaultValue: "kết bạn" }), onAddFriend)}
                                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all cursor-pointer shadow-md active:scale-95"
                                    >
                                        <UserPlus className="size-3.5" />
                                        <span>{t("profile.addFriend", { defaultValue: "Kết bạn" })}</span>
                                    </button>
                                )}

                                <button
                                    type="button"
                                    onClick={() => handleProtectedAction(t("common.settings", { defaultValue: "mở tùy chọn" }), () => setShowFriendMenu((v) => !v))}
                                    className="w-8 h-8 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 flex items-center justify-center text-xs transition-all cursor-pointer shadow-md active:scale-95"
                                    title="Tùy chọn khác"
                                >
                                    <MoreHorizontal className="size-4" />
                                </button>

                                {showFriendMenu && (
                                    <div className="absolute right-0 bottom-full mb-1.5 w-44 bg-surface rounded-xl p-1.5 shadow-2xl z-50 flex flex-col gap-0.5 border border-border animate-dropdown origin-bottom-right">
                                        {isFriend && (
                                            <button
                                                type="button"
                                                onClick={() => { onUnfriend(); setShowFriendMenu(false); }}
                                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-text hover:bg-surface-hover transition-colors text-left cursor-pointer"
                                            >
                                                <UserX className="size-3.5 text-amber-500" />
                                                <span>{t("profile.unfriend", { defaultValue: "Hủy kết bạn" })}</span>
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => { onBlock(); setShowFriendMenu(false); }}
                                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors text-left cursor-pointer"
                                        >
                                            <Ban className="size-3.5" />
                                            <span>{t("profile.blockUser", { defaultValue: "Chặn người dùng" })}</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Banned or Archived Status Alert Banner */}
            {identity.isBanned && (
                <div className="w-full bg-rose-500/10 border-t border-b border-rose-500/20 px-4 sm:px-6 py-2.5 flex items-center gap-2.5 text-xs text-rose-400">
                    <Ban className="size-4 text-rose-500 shrink-0" />
                    <div className="min-w-0 flex-1">
                        <span className="font-bold text-rose-500">{t("profile.bannedAccountTitle", { defaultValue: "Tài khoản này đã bị khóa: " })}</span>
                        <span className="text-text-muted">{identity.banReason || t("profile.defaultBanReason", { defaultValue: "Vi phạm điều khoản dịch vụ và chính sách an toàn của cộng đồng." })}</span>
                    </div>
                </div>
            )}
            {identity.archived && !identity.isBanned && (
                <div className="w-full bg-amber-500/10 border-t border-b border-amber-500/20 px-4 sm:px-6 py-2.5 flex items-center gap-2.5 text-xs text-amber-500">
                    <Clock className="size-4 text-amber-500 shrink-0" />
                    <div className="min-w-0 flex-1">
                        <span className="font-bold text-amber-500">{t("profile.archivedProfileTitle", { defaultValue: "Hồ sơ đã lưu trữ (Archived): " })}</span>
                        <span className="text-text-muted">{t("profile.archivedProfileDesc", { defaultValue: "Tài khoản này đang ở trạng thái lưu trữ theo yêu cầu hoặc do ngừng hoạt động dài hạn." })}</span>
                    </div>
                </div>
            )}

            {/* ── 3. Quiet & Mature Level, XP & Typography Stats Bar (Cohesive in both Light and Dark mode) ── */}
            <div className="w-full bg-surface-inner border-t border-border px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
                
                {/* Compact Level + XP Pill */}
                <div 
                    className="flex items-center gap-3 px-3 py-1.5 bg-surface border border-border rounded-full shadow-xs"
                    title={`${currentXp.toLocaleString()} / ${maxXp.toLocaleString()} XP`}
                >
                    <div className="flex items-baseline gap-1 font-bold shrink-0">
                        <span className="text-[10px] text-text-muted uppercase font-semibold">LVL</span>
                        <span className="text-sm text-primary font-extrabold">{level}</span>
                    </div>

                    <div className="w-24 sm:w-28 h-1.5 bg-surface-hover rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary rounded-full transition-all duration-300"
                            style={{ width: `${xpPercent}%` }}
                        />
                    </div>
                </div>

                {/* Gamer Metrics: Typography with generous spacing */}
                <div className="flex items-center gap-5 sm:gap-8 flex-wrap">
                    <div className="flex flex-col">
                        <span className="font-extrabold text-text text-sm leading-tight">{followersCount}</span>
                        <span className="text-[10px] font-semibold uppercase text-text-muted tracking-wider">{t("profile.followers", { defaultValue: "Followers" })}</span>
                    </div>

                    <div className="w-1 h-1 rounded-full bg-text-muted/30 hidden sm:block" />

                    <div className="flex flex-col">
                        <span className="font-extrabold text-text text-sm leading-tight">{followingCount}</span>
                        <span className="text-[10px] font-semibold uppercase text-text-muted tracking-wider">{t("profile.following", { defaultValue: "Following" })}</span>
                    </div>
                </div>

            </div>
        </div>
    );
};
