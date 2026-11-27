import React, { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import {
    PaperPlaneRight,
    MagnifyingGlass,
    ChatCircleDots,
    Checks,
    Check,
    CircleNotch,
    ArrowLeft,
    UserPlus,
} from "@phosphor-icons/react";
import { messagesApi, profilesApi } from "@/shared/api";
import type { ConversationDto, DirectMessageDto, UserProfileDto } from "@/shared/api/types";
import { useAuthStore } from "@/features/auth";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { UserAvatar } from "@/shared/components/ui/UserAvatar";
import { formatTimeAgo } from "@/shared/utils/formatTimeAgo";
import { useMessagesStore } from "../store/useMessagesStore";

export function MessagesPage() {
    useDocumentTitle("Tin nhắn");
    const navigate = useNavigate();
    const searchParams = useSearch({ strict: false }) as { userId?: string };
    const currentUser = useAuthStore((s) => s.user);
    const authLoading = useAuthStore((s) => s.loading);

    const onlineUserIds = useMessagesStore((s) => s.onlineUserIds);
    const lastIncomingMessage = useMessagesStore((s) => s.lastIncomingMessage);
    const lastReadEvent = useMessagesStore((s) => s.lastReadEvent);
    const setActiveConversationId = useMessagesStore((s) => s.setActiveConversationId);
    const mergeOnlineUsers = useMessagesStore((s) => s.mergeOnlineUsers);
    const decrementUnread = useMessagesStore((s) => s.decrementUnread);

    const [conversations, setConversations] = useState<ConversationDto[]>([]);
    const [loadingConvs, setLoadingConvs] = useState(true);
    const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
    const [messages, setMessages] = useState<DirectMessageDto[]>([]);
    const [loadingMsgs, setLoadingMsgs] = useState(false);
    const [draft, setDraft] = useState("");
    const [sending, setSending] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Search users to start a new DM
    const [userQuery, setUserQuery] = useState("");
    const [searchResults, setSearchResults] = useState<UserProfileDto[]>([]);
    const [searchingUsers, setSearchingUsers] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const handledTargetUserRef = useRef<string | null>(null);

    // Sync active conversation into store for unread suppression
    useEffect(() => {
        setActiveConversationId(selectedConvId);
        return () => setActiveConversationId(null);
    }, [selectedConvId, setActiveConversationId]);

    // Load conversation list
    useEffect(() => {
        if (!currentUser) return;
        let cancelled = false;
        setLoadingConvs(true);
        messagesApi
            .getConversations()
            .then((list) => {
                if (cancelled) return;
                const safeList = Array.isArray(list) ? list : [];
                setConversations(safeList);
                const peerIds = safeList.map((c) => c.peer.id);
                const onlinePeers = safeList.filter((c) => c.isOnline).map((c) => c.peer.id);
                if (peerIds.length > 0) {
                    mergeOnlineUsers(peerIds, onlinePeers);
                }
            })
            .catch(() => {
                if (!cancelled) setConversations([]);
            })
            .finally(() => {
                if (!cancelled) setLoadingConvs(false);
            });
        return () => {
            cancelled = true;
        };
    }, [currentUser, mergeOnlineUsers]);

    // Open conversation automatically when ?userId=<uuid> is passed
    useEffect(() => {
        const targetId = searchParams?.userId?.trim();
        if (!currentUser || !targetId || targetId === currentUser.id) return;
        if (handledTargetUserRef.current === targetId) return;
        handledTargetUserRef.current = targetId;

        setErrorMsg(null);
        messagesApi
            .getOrCreateConversation(targetId)
            .then((conv) => {
                setConversations((prev) => {
                    const exists = prev.some((c) => c.id === conv.id);
                    return exists ? prev : [conv, ...prev];
                });
                setSelectedConvId(conv.id);
            })
            .catch((err: unknown) => {
                const msg = err instanceof Error ? err.message : "Không thể mở cuộc hội thoại này.";
                setErrorMsg(msg);
            });
    }, [currentUser, searchParams?.userId]);

    // Load messages when selecting a conversation
    useEffect(() => {
        if (!selectedConvId || !currentUser) {
            setMessages([]);
            return;
        }
        let cancelled = false;
        setLoadingMsgs(true);
        setErrorMsg(null);

        messagesApi
            .getMessages(selectedConvId, { page: 1, limit: 50 })
            .then((res) => {
                if (cancelled) return;
                setMessages(Array.isArray(res?.data) ? res.data : []);
                // Mark as read
                const targetConv = conversations.find((c) => c.id === selectedConvId);
                if (targetConv && targetConv.unreadCount > 0) {
                    decrementUnread(targetConv.unreadCount);
                    setConversations((prev) =>
                        prev.map((c) => (c.id === selectedConvId ? { ...c, unreadCount: 0 } : c))
                    );
                }
                void messagesApi.markAsRead(selectedConvId).catch(() => {});
            })
            .catch((err: unknown) => {
                if (!cancelled) {
                    setErrorMsg(err instanceof Error ? err.message : "Không thể tải tin nhắn.");
                }
            })
            .finally(() => {
                if (!cancelled) setLoadingMsgs(false);
            });

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedConvId, currentUser]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.length, selectedConvId]);

    // Handle realtime incoming Socket.IO DM
    useEffect(() => {
        if (!lastIncomingMessage || !currentUser) return;
        const msg = lastIncomingMessage;

        if (msg.conversationId === selectedConvId) {
            setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
            if (msg.senderId !== currentUser.id) {
                void messagesApi.markAsRead(msg.conversationId).catch(() => {});
            }
        }

        setConversations((prev) => {
            const idx = prev.findIndex((c) => c.id === msg.conversationId);
            if (idx === -1) {
                // Reload conversations to include brand-new peer thread
                void messagesApi.getConversations().then((list) => {
                    if (Array.isArray(list)) setConversations(list);
                });
                return prev;
            }
            const target = prev[idx];
            const isUnread = msg.senderId !== currentUser.id && msg.conversationId !== selectedConvId;
            const updated: ConversationDto = {
                ...target,
                lastMessage: msg,
                lastMessageAt: msg.createdAt,
                unreadCount: isUnread ? target.unreadCount + 1 : target.unreadCount,
            };
            const others = prev.filter((c) => c.id !== msg.conversationId);
            return [updated, ...others];
        });
    }, [lastIncomingMessage, selectedConvId, currentUser]);

    // Handle realtime read receipts
    useEffect(() => {
        if (!lastReadEvent || lastReadEvent.conversationId !== selectedConvId) return;
        setMessages((prev) =>
            prev.map((m) =>
                m.recipientId === lastReadEvent.readerId && !m.readAt
                    ? { ...m, readAt: lastReadEvent.readAt }
                    : m
            )
        );
    }, [lastReadEvent, selectedConvId]);

    // Debounced user search for starting new conversations
    useEffect(() => {
        const trimmed = userQuery.trim();
        if (!trimmed || trimmed.length < 2) {
            setSearchResults([]);
            setSearchingUsers(false);
            return;
        }
        let cancelled = false;
        setSearchingUsers(true);
        const timer = window.setTimeout(async () => {
            try {
                const list = await profilesApi.search(trimmed, 1, 6);
                if (!cancelled) {
                    setSearchResults(
                        (Array.isArray(list) ? list : []).filter((p) => p.id !== currentUser?.id)
                    );
                }
            } catch {
                if (!cancelled) setSearchResults([]);
            } finally {
                if (!cancelled) setSearchingUsers(false);
            }
        }, 250);
        return () => {
            cancelled = true;
            window.clearTimeout(timer);
        };
    }, [userQuery, currentUser?.id]);

    const selectedConv = useMemo(
        () => conversations.find((c) => c.id === selectedConvId) || null,
        [conversations, selectedConvId]
    );

    const handleStartChatWithUser = async (targetUser: UserProfileDto) => {
        setErrorMsg(null);
        setUserQuery("");
        setSearchResults([]);
        try {
            const conv = await messagesApi.getOrCreateConversation(targetUser.id);
            setConversations((prev) => {
                const exists = prev.some((c) => c.id === conv.id);
                return exists ? prev : [conv, ...prev];
            });
            setSelectedConvId(conv.id);
        } catch (err: unknown) {
            setErrorMsg(err instanceof Error ? err.message : "Không thể bắt đầu cuộc hội thoại.");
        }
    };

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!selectedConvId || !draft.trim() || sending) return;
        const content = draft.trim();
        setDraft("");
        setSending(true);
        setErrorMsg(null);

        try {
            const saved = await messagesApi.sendMessage(selectedConvId, content);
            setMessages((prev) => (prev.some((m) => m.id === saved.id) ? prev : [...prev, saved]));
            setConversations((prev) => {
                const target = prev.find((c) => c.id === selectedConvId);
                if (!target) return prev;
                const updated: ConversationDto = {
                    ...target,
                    lastMessage: saved,
                    lastMessageAt: saved.createdAt,
                };
                return [updated, ...prev.filter((c) => c.id !== selectedConvId)];
            });
        } catch (err: unknown) {
            setDraft(content);
            setErrorMsg(err instanceof Error ? err.message : "Gửi tin nhắn thất bại.");
        } finally {
            setSending(false);
        }
    };

    if (!authLoading && !currentUser) {
        return (
            <div className="max-w-lg mx-auto my-12 p-8 rounded-2xl bg-surface border border-border text-center space-y-4">
                <ChatCircleDots className="size-10 text-primary mx-auto" />
                <h2 className="text-lg font-extrabold text-text">Đăng nhập để sử dụng Tin nhắn</h2>
                <p className="text-xs text-text-muted">
                    Trò chuyện trực tiếp 1-1 với bạn bè và đồng đội trên Ludon theo thời gian thực.
                </p>
                <button
                    type="button"
                    onClick={() => navigate({ to: "/auth" })}
                    className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold cursor-pointer"
                >
                    Đăng nhập ngay
                </button>
            </div>
        );
    }

    const isPeerOnline = (peerId: string, fallback: boolean) =>
        peerId in onlineUserIds ? onlineUserIds[peerId] : fallback;

    return (
        <div className="w-full h-[calc(100vh-5.5rem)] flex rounded-2xl bg-surface border border-border/80 overflow-hidden shadow-xl">
            {/* LEFT: CONVERSATIONS SIDEBAR */}
            <aside
                className={`${
                    selectedConvId ? "hidden md:flex" : "flex"
                } w-full md:w-80 lg:w-88 shrink-0 flex-col border-r border-border/80 bg-surface`}
            >
                <div className="p-4 border-b border-border/70 space-y-3">
                    <div className="flex items-center justify-between">
                        <h1 className="text-base font-black text-text flex items-center gap-2">
                            <ChatCircleDots className="size-5 text-primary" />
                            <span>Tin nhắn</span>
                        </h1>
                        <span className="text-[11px] font-bold text-text-muted">
                            {conversations.length} hội thoại
                        </span>
                    </div>

                    {/* Search people to start DM */}
                    <div className="relative">
                        <MagnifyingGlass className="size-3.5 text-text-faint absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={userQuery}
                            onChange={(e) => setUserQuery(e.target.value)}
                            placeholder="Tìm tên hoặc @username để nhắn..."
                            className="w-full bg-surface-inner rounded-xl pl-8 pr-3 py-2 text-xs text-text placeholder:text-text-faint focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        {searchingUsers && (
                            <CircleNotch className="size-3.5 animate-spin text-primary absolute right-3 top-1/2 -translate-y-1/2" />
                        )}
                    </div>

                    {searchResults.length > 0 && (
                        <div className="rounded-xl bg-surface-inner border border-border/70 divide-y divide-border/40 overflow-hidden">
                            {searchResults.map((u) => (
                                <button
                                    key={u.id}
                                    type="button"
                                    onClick={() => handleStartChatWithUser(u)}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-surface-hover text-left transition-colors cursor-pointer"
                                >
                                    <UserAvatar
                                        src={u.avatarUrl}
                                        name={u.name || u.username}
                                        className="w-7 h-7 shrink-0"
                                        textClassName="text-[11px]"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-bold text-text truncate">
                                            {u.name || u.username}
                                        </p>
                                        <p className="text-[10px] text-primary truncate">@{u.username}</p>
                                    </div>
                                    <UserPlus className="size-3.5 text-text-muted shrink-0" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Conversation List */}
                <div className="flex-1 overflow-y-auto divide-y divide-border/30">
                    {loadingConvs ? (
                        <div className="p-6 text-center text-xs text-text-muted">
                            <CircleNotch className="size-5 animate-spin text-primary mx-auto mb-2" />
                            Đang tải hội thoại...
                        </div>
                    ) : conversations.length === 0 ? (
                        <div className="p-8 text-center space-y-2">
                            <ChatCircleDots className="size-8 text-text-faint mx-auto" />
                            <p className="text-xs font-bold text-text-muted">Chưa có tin nhắn nào</p>
                            <p className="text-[11px] text-text-faint">
                                Tìm tên người chơi ở ô phía trên để bắt đầu trò chuyện 1-1.
                            </p>
                        </div>
                    ) : (
                        conversations.map((conv) => {
                            const online = isPeerOnline(conv.peer.id, conv.isOnline);
                            const isSelected = conv.id === selectedConvId;
                            return (
                                <button
                                    key={conv.id}
                                    type="button"
                                    onClick={() => setSelectedConvId(conv.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors cursor-pointer ${
                                        isSelected
                                            ? "bg-primary/10 border-l-2 border-primary"
                                            : "hover:bg-surface-hover/60"
                                    }`}
                                >
                                    <div className="relative shrink-0">
                                        <UserAvatar
                                            src={conv.peer.avatarUrl}
                                            name={conv.peer.name}
                                            className="w-10 h-10"
                                            textClassName="text-xs"
                                        />
                                        <span
                                            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-surface ${
                                                online ? "bg-emerald-500" : "bg-text-faint/40"
                                            }`}
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-xs font-bold text-text truncate">
                                                {conv.peer.name}
                                            </span>
                                            {conv.lastMessage && (
                                                <span className="text-[10px] text-text-faint shrink-0">
                                                    {formatTimeAgo(conv.lastMessage.createdAt)}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between gap-2 mt-0.5">
                                            <p className="text-[11px] text-text-muted truncate">
                                                {conv.lastMessage
                                                    ? `${
                                                          conv.lastMessage.senderId === currentUser?.id
                                                              ? "Bạn: "
                                                              : ""
                                                      }${conv.lastMessage.content}`
                                                    : `@${conv.peer.username}`}
                                            </p>
                                            {conv.unreadCount > 0 && (
                                                <span className="px-1.5 py-0.5 rounded-full bg-primary text-white text-[10px] font-black shrink-0">
                                                    {conv.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            </aside>

            {/* RIGHT: ACTIVE CHAT THREAD */}
            <section
                className={`${
                    selectedConvId ? "flex" : "hidden md:flex"
                } flex-1 flex-col min-w-0 bg-bg/40`}
            >
                {selectedConv ? (
                    <>
                        {/* Thread Header */}
                        <div className="px-4 py-3 border-b border-border/80 bg-surface flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                                <button
                                    type="button"
                                    onClick={() => setSelectedConvId(null)}
                                    className="md:hidden w-8 h-8 rounded-lg hover:bg-surface-hover flex items-center justify-center text-text-muted cursor-pointer"
                                >
                                    <ArrowLeft className="size-4" />
                                </button>
                                <div
                                    onClick={() =>
                                        navigate({
                                            to: "/profile/$userId",
                                            params: { userId: `@${selectedConv.peer.username}` },
                                        })
                                    }
                                    className="flex items-center gap-2.5 cursor-pointer min-w-0 group"
                                >
                                    <div className="relative shrink-0">
                                        <UserAvatar
                                            src={selectedConv.peer.avatarUrl}
                                            name={selectedConv.peer.name}
                                            className="w-9 h-9"
                                            textClassName="text-xs"
                                        />
                                        <span
                                            className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-surface ${
                                                isPeerOnline(selectedConv.peer.id, selectedConv.isOnline)
                                                    ? "bg-emerald-500"
                                                    : "bg-text-faint/40"
                                            }`}
                                        />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-text truncate group-hover:text-primary transition-colors">
                                            {selectedConv.peer.name}
                                        </p>
                                        <p className="text-[11px] text-text-muted flex items-center gap-1.5">
                                            <span>@{selectedConv.peer.username}</span>
                                            <span>·</span>
                                            <span
                                                className={
                                                    isPeerOnline(selectedConv.peer.id, selectedConv.isOnline)
                                                        ? "text-emerald-400 font-semibold"
                                                        : "text-text-faint"
                                                }
                                            >
                                                {isPeerOnline(selectedConv.peer.id, selectedConv.isOnline)
                                                    ? "Đang trực tuyến"
                                                    : "Ngoại tuyến"}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {errorMsg && (
                            <div className="mx-4 mt-3 px-3.5 py-2 rounded-xl bg-rose-500/10 text-rose-400 text-xs font-semibold">
                                {errorMsg}
                            </div>
                        )}

                        {/* Messages Scroll Area */}
                        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2.5">
                            {loadingMsgs ? (
                                <div className="h-full flex items-center justify-center text-xs text-text-muted gap-2">
                                    <CircleNotch className="size-4 animate-spin text-primary" />
                                    <span>Đang tải tin nhắn...</span>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center text-xs text-text-muted space-y-1">
                                    <p className="font-bold text-text">Hãy gửi lời chào đầu tiên!</p>
                                    <p className="text-text-faint">
                                        Bắt đầu cuộc trò chuyện với {selectedConv.peer.name}.
                                    </p>
                                </div>
                            ) : (
                                messages.map((msg) => {
                                    const isMine = msg.senderId === currentUser?.id;
                                    return (
                                        <div
                                            key={msg.id}
                                            className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                                        >
                                            <div
                                                className={`max-w-[78%] sm:max-w-[68%] px-3.5 py-2 rounded-2xl text-xs sm:text-sm leading-relaxed break-words whitespace-pre-wrap shadow-xs ${
                                                    isMine
                                                        ? "bg-primary text-white rounded-br-md"
                                                        : "bg-surface border border-border/60 text-text rounded-bl-md"
                                                }`}
                                            >
                                                <p>{msg.content}</p>
                                                <div
                                                    className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
                                                        isMine ? "text-white/75" : "text-text-faint"
                                                    }`}
                                                >
                                                    <span>
                                                        {new Date(msg.createdAt).toLocaleTimeString([], {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                    </span>
                                                    {isMine &&
                                                        (msg.readAt ? (
                                                            <Checks className="size-3" />
                                                        ) : (
                                                            <Check className="size-3" />
                                                        ))}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Composer */}
                        <form
                            onSubmit={handleSend}
                            className="p-3 border-t border-border/80 bg-surface flex items-center gap-2"
                        >
                            <input
                                type="text"
                                value={draft}
                                onChange={(e) => setDraft(e.target.value)}
                                maxLength={2000}
                                placeholder={`Nhắn tin cho ${selectedConv.peer.name}...`}
                                className="flex-1 bg-surface-inner rounded-xl px-4 py-2.5 text-xs sm:text-sm text-text placeholder:text-text-faint focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                            <button
                                type="submit"
                                disabled={!draft.trim() || sending}
                                className="h-10 px-4 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                            >
                                {sending ? (
                                    <CircleNotch className="size-4 animate-spin" />
                                ) : (
                                    <PaperPlaneRight className="size-4" />
                                )}
                                <span className="hidden sm:inline">Gửi</span>
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-3">
                        {errorMsg && (
                            <div className="px-4 py-2 rounded-xl bg-rose-500/10 text-rose-400 text-xs font-semibold">
                                {errorMsg}
                            </div>
                        )}
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                            <ChatCircleDots className="size-7" />
                        </div>
                        <h2 className="text-base font-extrabold text-text">Tin nhắn trực tiếp</h2>
                        <p className="text-xs text-text-muted max-w-xs leading-relaxed">
                            Chọn một cuộc hội thoại bên trái hoặc tìm kiếm người chơi để bắt đầu nhắn tin realtime.
                        </p>
                    </div>
                )}
            </section>
        </div>
    );
}
