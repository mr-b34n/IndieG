export type NotificationType = "like" | "comment" | "follow" | "mention" | "system";

export interface NotificationItem {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    avatarUrl?: string;
    timestamp: string; // e.g. "5 phút trước", "1 giờ trước"
    isRead: boolean;
    link?: string;
}

export interface NotificationState {
    notifications: NotificationItem[];
    addNotification: (notification: Omit<NotificationItem, "id" | "isRead">) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    deleteNotification: (id: string) => void;
    clearAll: () => void;
}

