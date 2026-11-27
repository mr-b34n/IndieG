import { describe, expect, it, vi, beforeEach } from "vitest";
import { notificationApi } from "./notificationApi";
import { useNotificationStore } from "../store/useNotificationStore";
import * as client from "@/shared/api/client";

vi.mock("@/shared/api/client", () => ({
  apiRequest: vi.fn(),
  getApiBaseUrl: vi.fn(() => "http://localhost:3636"),
}));

describe("notificationApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useNotificationStore.setState({
      notifications: [],
      isOpen: false,
    });
  });

  describe("getNotifications", () => {
    it("fetches notifications from API and populates the store", async () => {
      const mockBackendItems = [
        {
          id: "notif-1",
          type: "POST_COMMENT",
          entityType: "post",
          entityId: "post-1",
          isRead: false,
          createdAt: "2026-11-07T10:00:00Z",
          actor: { id: "a1", username: "user1", name: "User One" },
          data: { postId: "post-1", snippet: "Hello world" },
        },
      ];

      vi.mocked(client.apiRequest).mockResolvedValueOnce({
        items: mockBackendItems,
        nextCursor: null,
        hasMore: false,
      });

      const result = await notificationApi.getNotifications("user-current");

      expect(client.apiRequest).toHaveBeenCalledWith("/notifications", {
        method: "GET",
      });
      expect(result.length).toBe(1);
      expect(result[0].id).toBe("notif-1");
      expect(useNotificationStore.getState().notifications.length).toBe(1);
    });

    it("falls back to local store if API call throws an error", async () => {
      useNotificationStore.getState().addNotification({
        id: "offline-notif",
        type: "system",
        message: "Offline message",
      });

      vi.mocked(client.apiRequest).mockRejectedValueOnce(new Error("Network Error"));

      const result = await notificationApi.getNotifications("user-current");

      expect(result.length).toBe(1);
      expect(result[0].id).toBe("offline-notif");
    });
  });

  describe("getUnreadCount", () => {
    it("returns backend unread count if available", async () => {
      vi.mocked(client.apiRequest).mockResolvedValueOnce({ count: 5 });

      const count = await notificationApi.getUnreadCount();
      expect(count).toBe(5);
    });

    it("falls back to counting unread items in the local store on API error", async () => {
      useNotificationStore.getState().addNotification({
        type: "comment",
        message: "Unread 1",
        isRead: false,
      });
      useNotificationStore.getState().addNotification({
        type: "comment",
        message: "Read 1",
        isRead: true,
      });

      vi.mocked(client.apiRequest).mockRejectedValueOnce(new Error("Network fail"));

      const count = await notificationApi.getUnreadCount();
      expect(count).toBe(1);
    });
  });

  describe("markAsRead", () => {
    it("marks as read in the store and sends PATCH request", async () => {
      useNotificationStore.getState().addNotification({
        id: "n-to-read",
        type: "comment",
        message: "Test message",
        isRead: false,
      });

      vi.mocked(client.apiRequest).mockResolvedValueOnce({ success: true });

      await notificationApi.markAsRead("n-to-read");

      expect(useNotificationStore.getState().notifications[0].isRead).toBe(true);
      expect(client.apiRequest).toHaveBeenCalledWith("/notifications/n-to-read/read", {
        method: "PATCH",
      });
    });
  });

  describe("markAllAsRead", () => {
    it("marks all as read in the store and sends PATCH request", async () => {
      useNotificationStore.getState().addNotification({
        id: "n-1",
        type: "comment",
        message: "Msg 1",
        isRead: false,
      });
      useNotificationStore.getState().addNotification({
        id: "n-2",
        type: "like",
        message: "Msg 2",
        isRead: false,
      });

      vi.mocked(client.apiRequest).mockResolvedValueOnce({ success: true });

      await notificationApi.markAllAsRead("user-current");

      expect(useNotificationStore.getState().notifications.every((n) => n.isRead)).toBe(true);
      expect(client.apiRequest).toHaveBeenCalledWith("/notifications/read-all", {
        method: "PATCH",
      });
    });
  });

  describe("deleteNotification", () => {
    it("deletes notification in store and calls DELETE endpoint", async () => {
      useNotificationStore.getState().addNotification({
        id: "del-1",
        type: "comment",
        message: "Delete test",
      });

      vi.mocked(client.apiRequest).mockResolvedValueOnce({ success: true });

      await notificationApi.deleteNotification("del-1");

      expect(useNotificationStore.getState().notifications).toEqual([]);
      expect(client.apiRequest).toHaveBeenCalledWith("/notifications/del-1", {
        method: "DELETE",
      });
    });
  });

  describe("clearReadNotifications", () => {
    it("calls DELETE /notifications/read", async () => {
      vi.mocked(client.apiRequest).mockResolvedValueOnce({ success: true });

      await notificationApi.clearReadNotifications();

      expect(client.apiRequest).toHaveBeenCalledWith("/notifications/read", {
        method: "DELETE",
      });
    });
  });
});
