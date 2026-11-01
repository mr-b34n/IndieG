import {
    MessageSquare,
    CornerDownRight,
    Heart,
    AtSign,
    Users,
    CheckCheck,
    BellOff,
} from 'lucide-react';
import { useTranslation } from '@/shared/hooks/useTranslate';
import { Switch } from '@/shared/components/ui/switch';
import { Button } from '@/shared/components/ui/button';

interface NotificationSettings {
    comments: boolean;
    replies: boolean;
    likes: boolean;
    mentions: boolean;
    communityActivity: boolean;
}

interface NotificationsSettingsTabProps {
    notifications: NotificationSettings;
    onUpdateNotifications: (notifications: NotificationSettings) => void;
}

export function NotificationsSettingsTab({
    notifications,
    onUpdateNotifications,
}: NotificationsSettingsTabProps) {
    const { t } = useTranslation();

    const directInteractions = [
        {
            key: 'comments' as const,
            icon: MessageSquare,
            iconClass: 'bg-primary/15 text-primary',
            label: t('settings.notifications.comments', { defaultValue: 'Bình luận mới trong bài viết' }),
            desc: t('settings.notifications.commentsDesc', { defaultValue: 'Nhận thông báo khi ai đó bình luận bài viết của bạn' }),
        },
        {
            key: 'replies' as const,
            icon: CornerDownRight,
            iconClass: 'bg-cyan-500/15 text-cyan-400',
            label: t('settings.notifications.replies', { defaultValue: 'Phản hồi bình luận của bạn' }),
            desc: t('settings.notifications.repliesDesc', { defaultValue: 'Nhận thông báo khi ai đó trả lời trực tiếp bình luận của bạn' }),
        },
        {
            key: 'likes' as const,
            icon: Heart,
            iconClass: 'bg-rose-500/15 text-rose-400',
            label: t('settings.notifications.likes', { defaultValue: 'Lượt thích bài viết & bình luận' }),
            desc: t('settings.notifications.likesDesc', { defaultValue: 'Nhận thông báo khi nội dung của bạn nhận lượt thích' }),
        },
        {
            key: 'mentions' as const,
            icon: AtSign,
            iconClass: 'bg-purple-500/15 text-purple-400',
            label: t('settings.notifications.mentions', { defaultValue: 'Thẻ nhắc tên (@Mentions)' }),
            desc: t('settings.notifications.mentionsDesc', { defaultValue: 'Nhận thông báo khi có người nhắc đến tên người dùng của bạn' }),
        },
    ];

    const communityInteractions = [
        {
            key: 'communityActivity' as const,
            icon: Users,
            iconClass: 'bg-amber-500/15 text-amber-400',
            label: t('settings.notifications.communityActivity', { defaultValue: 'Hoạt động từ Cộng đồng' }),
            desc: t('settings.notifications.communityActivityDesc', { defaultValue: 'Nhận thông tin cập nhật từ các hội nhóm và cộng đồng bạn đã tham gia' }),
        },
    ];

    const allEnabled = Object.values(notifications).every(Boolean);

    const handleToggleAll = () => {
        const targetState = !allEnabled;
        onUpdateNotifications({
            comments: targetState,
            replies: targetState,
            likes: targetState,
            mentions: targetState,
            communityActivity: targetState,
        });
    };

    return (
        <div className="space-y-8 animate-tab-enter">
            {/* Direct Interactions Group */}
            <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                        <h3 className="text-xs font-extrabold text-text uppercase tracking-wider">
                            {t('settings.notifications.directSection', { defaultValue: 'Tương tác trực tiếp' })}
                        </h3>
                        <p className="text-xs text-text-muted mt-0.5">
                            {t('settings.notifications.directSectionDesc', { defaultValue: 'Thông báo khi có người tương tác với bài viết, bình luận hoặc nhắc tên bạn' })}
                        </p>
                    </div>

                    <Button
                        variant="secondary"
                        size="xs"
                        onClick={handleToggleAll}
                        className="font-bold bg-surface-inner hover:bg-surface-hover text-text"
                    >
                        {allEnabled ? (
                            <>
                                <BellOff className="size-3.5 text-rose-400" />
                                <span>{t('settings.notifications.disableAll', { defaultValue: 'Tắt tất cả' })}</span>
                            </>
                        ) : (
                            <>
                                <CheckCheck className="size-3.5 text-primary" />
                                <span>{t('settings.notifications.enableAll', { defaultValue: 'Bật tất cả' })}</span>
                            </>
                        )}
                    </Button>
                </div>

                <div className="space-y-2">
                    {directInteractions.map((item) => {
                        const Icon = item.icon;
                        const isChecked = notifications[item.key];

                        return (
                            <div
                                key={item.key}
                                className="p-3.5 rounded-2xl bg-surface-inner/80 hover:bg-surface-hover flex items-center justify-between gap-4 transition-colors shadow-xs"
                            >
                                <div className="flex items-start gap-3.5 min-w-0">
                                    <div className={`size-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-xs ${item.iconClass}`}>
                                        <Icon className="size-4.5" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-xs font-bold text-text">
                                            {item.label}
                                        </div>
                                        <div className="text-[11px] text-text-muted mt-0.5">
                                            {item.desc}
                                        </div>
                                    </div>
                                </div>

                                <Switch
                                    checked={isChecked}
                                    onCheckedChange={(val) =>
                                        onUpdateNotifications({ ...notifications, [item.key]: val })
                                    }
                                    aria-label={item.label}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Community Activity Group */}
            <div className="space-y-3">
                <div>
                    <h3 className="text-xs font-extrabold text-text uppercase tracking-wider">
                        {t('settings.notifications.communitySection', { defaultValue: 'Hoạt động Cộng đồng' })}
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">
                        {t('settings.notifications.communitySectionDesc', { defaultValue: 'Thông báo về các cập nhật và thảo luận từ các cộng đồng đã tham gia' })}
                    </p>
                </div>

                <div className="space-y-2">
                    {communityInteractions.map((item) => {
                        const Icon = item.icon;
                        const isChecked = notifications[item.key];

                        return (
                            <div
                                key={item.key}
                                className="p-3.5 rounded-2xl bg-surface-inner/80 hover:bg-surface-hover flex items-center justify-between gap-4 transition-colors shadow-xs"
                            >
                                <div className="flex items-start gap-3.5 min-w-0">
                                    <div className={`size-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-xs ${item.iconClass}`}>
                                        <Icon className="size-4.5" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-xs font-bold text-text">
                                            {item.label}
                                        </div>
                                        <div className="text-[11px] text-text-muted mt-0.5">
                                            {item.desc}
                                        </div>
                                    </div>
                                </div>

                                <Switch
                                    checked={isChecked}
                                    onCheckedChange={(val) =>
                                        onUpdateNotifications({ ...notifications, [item.key]: val })
                                    }
                                    aria-label={item.label}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
