import { create } from "zustand";
import { type NotificationState } from "../types";
import { INITIAL_NOTIFICATIONS } from "../constants";

export * from "../types";

export const useNotificationStore = create<NotificationState>((set) => ({
    notifications: INITIAL_NOTIFICATIONS,

    addNotification: (notification) =>
        set((state) => ({
            notifications: [
                {
                    ...notification,
                    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                    isRead: false,
                },
                ...state.notifications,
            ],
        })),

    markAsRead: (id) =>
        set((state) => ({
            notifications: state.notifications.map((n) =>
                n.id === id ? { ...n, isRead: true } : n
            ),
        })),

    markAllAsRead: () =>
        set((state) => ({
            notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        })),

    deleteNotification: (id) =>
        set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
        })),

    clearAll: () => set({ notifications: [] }),
}));
