import { useEffect, useRef } from "react";
import type { Socket } from "socket.io-client";
import { getApiBaseUrl } from "@/shared/api/client";
import { useNotificationStore } from "../store/useNotificationStore";
import {
  mapBackendNotificationToItem,
  type BackendNotificationDto,
} from "../api/notificationMapper";
import { notificationApi } from "../api/notificationApi";
import { messagesApi } from "@/shared/api";
import type { DirectMessageDto } from "@/shared/api/types";
import { useMessagesStore } from "@/features/messages/store/useMessagesStore";

export function useNotificationSocket(userId?: string) {
  const socketRef = useRef<Socket | null>(null);
  const fetchedForUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    const token =
      localStorage.getItem("ludon_access_token") ||
      localStorage.getItem("indieg_access_token") ||
      localStorage.getItem("access_token");

    if (!token || !userId) {
      fetchedForUserIdRef.current = null;
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    // Initial fetch of notifications & unread DM count once per authenticated user session
    if (fetchedForUserIdRef.current !== userId) {
      fetchedForUserIdRef.current = userId;
      void notificationApi.getNotifications(userId);
      void messagesApi
        .getUnreadCount()
        .then((res) => {
          if (typeof res?.count === "number") {
            useMessagesStore.getState().setUnreadCount(res.count);
          }
        })
        .catch(() => {});
    }

    const baseUrl = getApiBaseUrl();
    if (!baseUrl) return;

    let cancelled = false;
    let heartbeatTimer: number | null = null;

    void (async () => {
      try {
        const { io } = await import("socket.io-client");
        if (cancelled) return;

        const socket = io(`${baseUrl}/notifications`, {
          auth: { token },
          extraHeaders: {
            Authorization: `Bearer ${token}`,
          },
          transports: ["websocket", "polling"],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 2000,
        });

        socketRef.current = socket;

        socket.on("connect", () => {
          useMessagesStore.getState().setUserOnline(userId, true);
          socket.emit("presence:heartbeat");
        });

        heartbeatTimer = window.setInterval(() => {
          if (socket.connected) {
            socket.emit("presence:heartbeat");
          }
        }, 45_000);

        socket.on("presence:update", (data: { userId?: string; online?: boolean }) => {
          if (data?.userId && typeof data.online === "boolean") {
            useMessagesStore.getState().setUserOnline(data.userId, data.online);
          }
        });

        socket.on("dm:new", (msg: DirectMessageDto) => {
          if (msg?.id && msg?.conversationId) {
            useMessagesStore.getState().pushIncomingMessage(msg, userId);
          }
        });

        socket.on(
          "dm:read",
          (ev: { conversationId?: string; readerId?: string; readAt?: string }) => {
            if (ev?.conversationId && ev?.readerId && ev?.readAt) {
              useMessagesStore.getState().pushReadEvent({
                conversationId: ev.conversationId,
                readerId: ev.readerId,
                readAt: ev.readAt,
              });
            }
          }
        );

        socket.on("notification:new", (raw: BackendNotificationDto) => {
          if (raw) {
            const item = mapBackendNotificationToItem(raw, userId);
            useNotificationStore.getState().addNotification(item);
          }
        });

        socket.on("notification:read", (data: { id: string }) => {
          if (data?.id) {
            useNotificationStore.getState().markAsRead(data.id);
          }
        });

        socket.on("notification:read_all", () => {
          useNotificationStore.getState().markAllAsRead(userId);
        });
      } catch {
        // Gracefully ignore socket connection errors
      }
    })();

    return () => {
      cancelled = true;
      if (heartbeatTimer !== null) {
        window.clearInterval(heartbeatTimer);
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [userId]);
}
