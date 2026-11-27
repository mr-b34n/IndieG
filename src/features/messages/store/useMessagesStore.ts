import { create } from "zustand";
import type { DirectMessageDto } from "@/shared/api/types";

interface DmReadEvent {
    conversationId: string;
    readerId: string;
    readAt: string;
}

interface MessagesStoreState {
    onlineUserIds: Record<string, boolean>;
    unreadCount: number;
    activeConversationId: string | null;
    lastIncomingMessage: DirectMessageDto | null;
    lastReadEvent: DmReadEvent | null;
    setUserOnline: (userId: string, online: boolean) => void;
    mergeOnlineUsers: (queriedIds: string[], onlineIds: string[]) => void;
    setUnreadCount: (count: number) => void;
    incrementUnread: () => void;
    decrementUnread: (by?: number) => void;
    setActiveConversationId: (id: string | null) => void;
    pushIncomingMessage: (msg: DirectMessageDto, currentUserId?: string) => void;
    pushReadEvent: (ev: DmReadEvent) => void;
    reset: () => void;
}

export const useMessagesStore = create<MessagesStoreState>((set, get) => ({
    onlineUserIds: {},
    unreadCount: 0,
    activeConversationId: null,
    lastIncomingMessage: null,
    lastReadEvent: null,

    setUserOnline: (userId, online) => {
        if (!userId) return;
        set((state) => ({
            onlineUserIds: {
                ...state.onlineUserIds,
                [userId]: online,
            },
        }));
    },

    mergeOnlineUsers: (queriedIds, onlineIds) => {
        const onlineSet = new Set(onlineIds);
        set((state) => {
            const next = { ...state.onlineUserIds };
            for (const id of queriedIds) {
                if (id) next[id] = onlineSet.has(id);
            }
            for (const id of onlineIds) {
                if (id) next[id] = true;
            }
            return { onlineUserIds: next };
        });
    },

    setUnreadCount: (count) => set({ unreadCount: Math.max(0, count) }),

    incrementUnread: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),

    decrementUnread: (by = 1) =>
        set((state) => ({ unreadCount: Math.max(0, state.unreadCount - by) })),

    setActiveConversationId: (id) => set({ activeConversationId: id }),

    pushIncomingMessage: (msg, currentUserId) => {
        const isIncoming = currentUserId ? msg.senderId !== currentUserId : true;
        const isViewingConv = get().activeConversationId === msg.conversationId;
        set((state) => ({
            lastIncomingMessage: msg,
            unreadCount:
                isIncoming && !isViewingConv ? state.unreadCount + 1 : state.unreadCount,
        }));
    },

    pushReadEvent: (ev) => set({ lastReadEvent: ev }),

    reset: () =>
        set({
            onlineUserIds: {},
            unreadCount: 0,
            activeConversationId: null,
            lastIncomingMessage: null,
            lastReadEvent: null,
        }),
}));
