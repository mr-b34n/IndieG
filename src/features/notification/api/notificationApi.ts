import { type NotificationEntity } from "../types";
import { useNotificationStore } from "../store/useNotificationStore";
import { apiRequest } from "@/shared/api/client";
import {
  mapBackendNotificationToItem,
  type BackendNotificationDto,
} from "./notificationMapper";

export interface CreateNotificationParams {
  userId?: string;
  type: "comment" | "reply" | "like" | "community" | "mention" | "system";
  referenceId: string;
  message: string;
  title?: string;
  avatarUrl?: string;
  link?: string;
}

interface NotificationListApiResponse {
  items: BackendNotificationDto[];
  nextCursor: string | null;
  hasMore: boolean;
}

/**
 * Service & Repository API layer for Notifications.
 * Handles fetching, creating, and marking read status.
 */
export const notificationApi = {
  /**
   * Get all notifications for a specific user
   */
  async getNotifications(
    userId: string = "user-current",
  ): Promise<NotificationEntity[]> {
    try {
      const response = await apiRequest<
        NotificationListApiResponse | BackendNotificationDto[]
      >("/notifications", {
        method: "GET",
      });

      let items: BackendNotificationDto[] = [];
      if (Array.isArray(response)) {
        items = response;
      } else if (response && Array.isArray(response.items)) {
        items = response.items;
      }

      if (items.length > 0) {
        const mapped = items.map((item) =>
          mapBackendNotificationToItem(item, userId),
        );
        useNotificationStore.getState().setNotifications(mapped);
        return mapped;
      }
    } catch {
      // Fallback to client-side Zustand store if server API not reachable
    }
    return useNotificationStore.getState().listNotifications(userId);
  },

  /**
   * Get unread count from backend
   */
  async getUnreadCount(): Promise<number> {
    try {
      const res = await apiRequest<{ count: number }>(
        "/notifications/unread-count",
        {
          method: "GET",
        },
      );
      if (res && typeof res.count === "number") {
        return res.count;
      }
    } catch {
      // Handled in store
    }
    return useNotificationStore
      .getState()
      .notifications.filter((n) => !n.isRead).length;
  },

  /**
   * Create a new notification (client store fallback)
   */
  async createNotification(
    params: CreateNotificationParams,
  ): Promise<NotificationEntity> {
    const payload = {
      userId: params.userId || "user-current",
      type: params.type,
      referenceId: params.referenceId,
      message: params.message,
      title: params.title,
      avatarUrl: params.avatarUrl,
      link: params.link,
    };

    return useNotificationStore.getState().addNotification(payload);
  },

  /**
   * Mark a single notification as read
   */
  async markAsRead(id: string): Promise<void> {
    useNotificationStore.getState().markAsRead(id);
    try {
      await apiRequest(`/notifications/${encodeURIComponent(id)}/read`, {
        method: "PATCH",
      });
    } catch {
      // Handled in store
    }
  },

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string = "user-current"): Promise<void> {
    useNotificationStore.getState().markAllAsRead(userId);
    try {
      await apiRequest(`/notifications/read-all`, {
        method: "PATCH",
      });
    } catch {
      // Handled in store
    }
  },

  /**
   * Delete a notification
   */
  async deleteNotification(id: string): Promise<void> {
    useNotificationStore.getState().deleteNotification(id);
    try {
      await apiRequest(`/notifications/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
    } catch {
      // Handled in store
    }
  },

  /**
   * Clear all read notifications
   */
  async clearReadNotifications(): Promise<void> {
    try {
      await apiRequest(`/notifications/read`, {
        method: "DELETE",
      });
    } catch {
      // Handled in store
    }
  },
};
