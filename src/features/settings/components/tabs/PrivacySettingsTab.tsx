import {
    Globe,
    Users,
    Lock,
    Eye,
    CheckCircle2,
    UserX,
    UserCheck,
} from 'lucide-react';
import { useTranslation } from '@/shared/hooks/useTranslate';
import { Switch } from '@/shared/components/ui/switch';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/utils/cn';
import type { BlockedUser } from '../../types';

interface PrivacySettings {
    profileVisibility: "public" | "friends" | "private";
    onlineStatus: boolean;
    gameLibraryVisibility: "public" | "friends" | "private";
}

interface PrivacySettingsTabProps {
    privacy: PrivacySettings;
    onUpdatePrivacy: (privacy: PrivacySettings) => void;
    blockedUsers: BlockedUser[];
    onUnblockUser: (userId: string) => void;
}

export function PrivacySettingsTab({
    privacy,
    onUpdatePrivacy,
    blockedUsers,
    onUnblockUser,
}: PrivacySettingsTabProps) {
    const { t } = useTranslation();

    const visibilityOptions = [
        {
            id: 'public' as const,
            title: t('settings.privacy.optionPublic', { defaultValue: 'Công khai' }),
            desc: t('settings.privacy.optionPublicDesc', { defaultValue: 'Mọi thành viên trên Ludon đều có thể xem trang hồ sơ của bạn.' }),
            icon: Globe,
            iconClass: 'bg-primary/15 text-primary',
        },
        {
            id: 'friends' as const,
            title: t('settings.privacy.optionFriends', { defaultValue: 'Chỉ bạn bè' }),
            desc: t('settings.privacy.optionFriendsDesc', { defaultValue: 'Chỉ những thành viên trong danh sách bạn bè mới có thể xem chi tiết.' }),
            icon: Users,
            iconClass: 'bg-purple-500/15 text-purple-400',
        },
        {
            id: 'private' as const,
            title: t('settings.privacy.optionPrivate', { defaultValue: 'Riêng tư' }),
            desc: t('settings.privacy.optionPrivateDesc', { defaultValue: 'Ẩn hoàn toàn thông tin hồ sơ của bạn khỏi mọi người dùng khác.' }),
            icon: Lock,
            iconClass: 'bg-amber-500/15 text-amber-400',
        },
    ];

    return (
        <div className="space-y-8 animate-tab-enter">
            {/* Profile Visibility Cards */}
            <div className="space-y-3.5">
                <div>
                    <h3 className="text-xs font-extrabold text-text uppercase tracking-wider">
                        {t('settings.privacy.profileVisibility', { defaultValue: 'Quyền xem Hồ sơ cá nhân' })}
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">
                        {t('settings.privacy.profileVisibilityDesc', { defaultValue: 'Ai có quyền truy cập trang thông tin cá nhân của bạn' })}
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    {visibilityOptions.map((opt) => {
                        const isSelected = privacy.profileVisibility === opt.id;
                        const Icon = opt.icon;

                        return (
                            <button
                                key={opt.id}
                                type="button"
                                onClick={() =>
                                    onUpdatePrivacy({
                                        ...privacy,
                                        profileVisibility: opt.id,
                                    })
                                }
                                className={cn(
                                    "p-4 rounded-2xl text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3.5 relative select-none group",
                                    isSelected
                                        ? "bg-surface-inner ring-2 ring-primary text-text shadow-lg shadow-primary/10"
                                        : "bg-surface-inner/80 hover:bg-surface-hover text-text-muted hover:text-text shadow-sm"
                                )}
                            >
                                <div className="flex items-center justify-between">
                                    <div className={cn("size-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs", opt.iconClass)}>
                                        <Icon className="size-4.5" />
                                    </div>
                                    {isSelected && (
                                        <CheckCircle2 className="size-5 text-primary shrink-0" />
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <div className={cn("text-xs font-bold", isSelected ? "text-text" : "text-text-muted group-hover:text-text")}>
                                        {opt.title}
                                    </div>
                                    <p className="text-[11px] text-text-muted leading-relaxed">
                                        {opt.desc}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Online Status Toggle */}
            <div className="p-4 sm:p-5 rounded-2xl bg-surface-inner shadow-sm flex items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5 min-w-0">
                    <div className="size-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                        <Eye className="size-4.5" />
                    </div>
                    <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="text-xs font-bold text-text">
                                {t('settings.privacy.onlineStatus', { defaultValue: 'Cho phép hiển thị trạng thái hoạt động' })}
                            </span>
                            <span
                                className={cn(
                                    "px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1.5",
                                    privacy.onlineStatus
                                        ? "bg-emerald-500/15 text-emerald-400"
                                        : "bg-surface text-text-muted"
                                )}
                            >
                                <span
                                    className={cn(
                                        "size-1.5 rounded-full",
                                        privacy.onlineStatus ? "bg-emerald-400 animate-pulse" : "bg-text-faint"
                                    )}
                                />
                                <span>
                                    {privacy.onlineStatus
                                        ? t('settings.privacy.statusEnabled', { defaultValue: 'Đang bật' })
                                        : t('settings.privacy.statusDisabled', { defaultValue: 'Đã tắt' })}
                                </span>
                            </span>
                        </div>
                        <p className="text-[11px] text-text-muted leading-relaxed">
                            {t('settings.privacy.onlineStatusDesc', { defaultValue: 'Cho phép người dùng khác nhìn thấy bạn đang hoạt động trên hệ thống' })}
                        </p>
                    </div>
                </div>

                <Switch
                    checked={privacy.onlineStatus}
                    onCheckedChange={(checked) =>
                        onUpdatePrivacy({ ...privacy, onlineStatus: checked })
                    }
                    aria-label={t('settings.privacy.onlineStatus', { defaultValue: 'Cho phép hiển thị trạng thái hoạt động' })}
                />
            </div>

            {/* Blocked Users Section - Seamlessly integrated at the footer of Privacy */}
            <div className="p-5 sm:p-6 rounded-2xl bg-surface-inner space-y-4 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                        <UserX className="size-4 text-primary" />
                        <span className="text-xs font-extrabold uppercase tracking-wider text-text">
                            {t('settings.blocked.title', { defaultValue: 'Danh sách người dùng đã chặn' })}
                        </span>
                        {blockedUsers.length > 0 && (
                            <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-surface text-text-muted">
                                {blockedUsers.length}
                            </span>
                        )}
                    </div>
                </div>

                {blockedUsers.length === 0 ? (
                    <div className="p-5 text-center rounded-xl bg-surface/40 text-xs text-text-muted">
                        {t('settings.blocked.empty', { defaultValue: 'Bạn chưa chặn bất kỳ người dùng nào.' })}
                    </div>
                ) : (
                    <div className="space-y-2.5">
                        {blockedUsers.map((user) => (
                            <div
                                key={user.id}
                                className="p-3.5 rounded-xl bg-surface hover:bg-surface-hover flex items-center justify-between gap-3 shadow-xs transition-colors"
                            >
                                <div className="flex items-center gap-3.5 min-w-0">
                                    <img
                                        src={user.avatar}
                                        alt={user.name}
                                        className="size-10 rounded-full object-cover shrink-0 shadow-xs"
                                    />
                                    <div className="min-w-0">
                                        <div className="font-bold text-xs text-text truncate">
                                            {user.name} <span className="text-text-muted font-normal">(@{user.username})</span>
                                        </div>
                                        {user.reason && (
                                            <div className="text-[11px] text-text-muted truncate mt-0.5">
                                                {user.reason}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <Button
                                    variant="secondary"
                                    size="xs"
                                    onClick={() => onUnblockUser(user.id)}
                                    className="bg-surface-inner hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 font-bold transition-colors"
                                >
                                    <UserCheck className="size-3.5" />
                                    <span>{t('settings.blocked.unblock', { defaultValue: 'Bỏ chặn' })}</span>
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
