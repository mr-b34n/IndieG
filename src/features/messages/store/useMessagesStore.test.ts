import { describe, it, expect, beforeEach } from "vitest";
import { useMessagesStore } from "./useMessagesStore";

describe("useMessagesStore", () => {
    beforeEach(() => {
        useMessagesStore.getState().reset();
    });

    it("tracks online presence updates and merges queried online users", () => {
        useMessagesStore.getState().mergeOnlineUsers(["u1", "u2", "u3"], ["u1", "u3"]);
        expect(useMessagesStore.getState().onlineUserIds).toEqual({
            u1: true,
            u2: false,
            u3: true,
        });

        useMessagesStore.getState().setUserOnline("u2", true);
        useMessagesStore.getState().setUserOnline("u1", false);
        expect(useMessagesStore.getState().onlineUserIds.u2).toBe(true);
        expect(useMessagesStore.getState().onlineUserIds.u1).toBe(false);
    });

    it("increments unread count only for incoming messages outside active conversation", () => {
        const msg = {
            id: "m1",
            conversationId: "c1",
            senderId: "u2",
            recipientId: "u1",
            content: "Hello",
            createdAt: new Date().toISOString(),
        };

        useMessagesStore.getState().pushIncomingMessage(msg, "u1");
        expect(useMessagesStore.getState().unreadCount).toBe(1);

        // When viewing c1, incoming messages should not bump unread badge
        useMessagesStore.getState().setActiveConversationId("c1");
        useMessagesStore.getState().pushIncomingMessage({ ...msg, id: "m2" }, "u1");
        expect(useMessagesStore.getState().unreadCount).toBe(1);

        // Outgoing messages from self should not bump unread badge
        useMessagesStore.getState().setActiveConversationId(null);
        useMessagesStore.getState().pushIncomingMessage(
            { ...msg, id: "m3", senderId: "u1", recipientId: "u2" },
            "u1"
        );
        expect(useMessagesStore.getState().unreadCount).toBe(1);
    });
});
