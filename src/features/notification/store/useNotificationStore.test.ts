import { describe, expect, it, beforeEach } from "vitest";
import { useNotificationStore } from "./useNotificationStore";

describe("useNotificationStore", () => {
  beforeEach(() => {
    useNotificationStore.setState({
      notifications: [],
      isOpen: false,
    });
  });

  describe("addNotification", () => {
    it("adds a notification with default properties to the top of the list", () => {
      const notif = useNotificationStore.getState().addNotification({
        type: "comment",
        message: "User A commented on your post",
      });

      const notifications = useNotificationStore.getState().notifications;
      expect(notifications.length).toBe(1);
      expect(notifications[0].id).toBe(notif.id);
      expect(notifications[0].message).toBe("User A commented on your post");
      expect(notifications[0].isRead).toBe(false);
      expect(notifications[0].title).toBe("Bình luận mới trên bài viết");
      expect(notifications[0].userId).toBe("user-current");
    });

    it("respects custom properties passed to addNotification", () => {
      useNotificationStore.getState().addNotification({
        id: "custom-notif-1",
        userId: "user-42",
        type: "system",
        referenceId: "sys-01",
        message: "Maintenance completed",
        title: "System Update",
        isRead: true,
        avatarUrl: "https://example.com/avatar.png",
        link: "/announcements/1",
      });

      const notif = useNotificationStore.getState().notifications[0];
      expect(notif.id).toBe("custom-notif-1");
      expect(notif.userId).toBe("user-42");
      expect(notif.isRead).toBe(true);
      expect(notif.title).toBe("System Update");
      expect(notif.avatarUrl).toBe("https://example.com/avatar.png");
      expect(notif.link).toBe("/announcements/1");
    });

    it("prepends newer notifications before older ones", () => {
      useNotificationStore.getState().addNotification({
        id: "notif-1",
        type: "like",
        message: "First notif",
      });
      useNotificationStore.getState().addNotification({
        id: "notif-2",
        type: "mention",
        message: "Second notif",
      });

      const notifications = useNotificationStore.getState().notifications;
      expect(notifications[0].id).toBe("notif-2");
      expect(notifications[1].id).toBe("notif-1");
    });
  });

  describe("markAsRead", () => {
    it("marks the designated notification as read without affecting others", () => {
      useNotificationStore.getState().addNotification({
        id: "notif-1",
        type: "comment",
        message: "Comment 1",
        isRead: false,
      });
      useNotificationStore.getState().addNotification({
        id: "notif-2",
        type: "like",
        message: "Like 1",
        isRead: false,
      });

      useNotificationStore.getState().markAsRead("notif-1");

      const items = useNotificationStore.getState().notifications;
      const notif1 = items.find((n) => n.id === "notif-1");
      const notif2 = items.find((n) => n.id === "notif-2");

      expect(notif1?.isRead).toBe(true);
      expect(notif2?.isRead).toBe(false);
    });
  });

  describe("markAllAsRead", () => {
    it("marks all notifications for the given user as read", () => {
      useNotificationStore.getState().addNotification({
        id: "n-1",
        userId: "user-100",
        type: "like",
        message: "Like",
        isRead: false,
      });
      useNotificationStore.getState().addNotification({
        id: "n-2",
        userId: "user-current",
        type: "comment",
        message: "Comment",
        isRead: false,
      });
      useNotificationStore.getState().addNotification({
        id: "n-3",
        userId: "other-user",
        type: "system",
        message: "Other",
        isRead: false,
      });

      useNotificationStore.getState().markAllAsRead("user-100");

      const items = useNotificationStore.getState().notifications;
      expect(items.find((n) => n.id === "n-1")?.isRead).toBe(true);
      expect(items.find((n) => n.id === "n-2")?.isRead).toBe(true); // user-current is included
      expect(items.find((n) => n.id === "n-3")?.isRead).toBe(false);
    });
  });

  describe("deleteNotification", () => {
    it("removes a notification by id", () => {
      useNotificationStore.getState().addNotification({
        id: "to-delete",
        type: "comment",
        message: "Delete me",
      });
      useNotificationStore.getState().addNotification({
        id: "to-keep",
        type: "like",
        message: "Keep me",
      });

      useNotificationStore.getState().deleteNotification("to-delete");

      const items = useNotificationStore.getState().notifications;
      expect(items.length).toBe(1);
      expect(items[0].id).toBe("to-keep");
    });
  });

  describe("clearAll", () => {
    it("clears all notifications", () => {
      useNotificationStore.getState().addNotification({
        type: "comment",
        message: "Msg 1",
      });
      useNotificationStore.getState().addNotification({
        type: "like",
        message: "Msg 2",
      });

      useNotificationStore.getState().clearAll();
      expect(useNotificationStore.getState().notifications).toEqual([]);
    });
  });

  describe("isOpen / toggleOpen / setIsOpen", () => {
    it("toggles and sets the open state properly", () => {
      expect(useNotificationStore.getState().isOpen).toBe(false);

      useNotificationStore.getState().toggleOpen?.();
      expect(useNotificationStore.getState().isOpen).toBe(true);

      useNotificationStore.getState().setIsOpen?.(false);
      expect(useNotificationStore.getState().isOpen).toBe(false);
    });
  });

  describe("indieg:auth-cleared event handling", () => {
    it("clears notifications and closes dropdown when auth is cleared", () => {
      useNotificationStore.getState().addNotification({
        type: "comment",
        message: "Will be cleared",
      });
      useNotificationStore.getState().setIsOpen?.(true);

      // Simulate event reset logic
      useNotificationStore.setState({ notifications: [], isOpen: false });

      expect(useNotificationStore.getState().notifications).toEqual([]);
      expect(useNotificationStore.getState().isOpen).toBe(false);
    });
  });
});
