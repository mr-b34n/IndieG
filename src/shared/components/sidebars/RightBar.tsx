import { useMemo, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ChatCircleDots } from "@phosphor-icons/react";
import { useTranslation } from "@/shared/hooks/useTranslate";
import { useTrendingPostsQuery, useFriendsQuery } from "@/shared/api/useQueries";
import { messagesApi } from "@/shared/api";
import { useAuthStore } from "@/features/auth";
import { useMessagesStore } from "@/features/messages/store/useMessagesStore";
import { UserAvatar } from "@/shared/components/ui/UserAvatar";
import type { PostDto } from "@/shared/api/types";

const SectionTitle = ({ label }: { label: string }) => (
    <div className="pb-1.5 mb-2">
        <span className="text-[10px] font-black uppercase tracking-wider text-text-faint/90">
            {label}
        </span>
    </div>
);

interface FriendOnlineItem {
    id?: string;
    username?: string;
    name: string;
    game: string;
    detail: string;
    avatar: string;
    status: "online" | "in-game" | "offline";
    playtime?: string;
}

export interface TrendingPostItem {
    id: string | number;
    postId: string;
    number: string;
    title: string;
    game: string;
    replies: number | string;
}

export interface UpcomingEventItem {
    id: string | number;
    date: string;
    title: string;
    subtitle?: string;
}

export interface RightBarProps {
    friends?: FriendOnlineItem[];
    trending?: TrendingPostItem[];
    events?: UpcomingEventItem[];
    isLoadingFriends?: boolean;
    isLoadingTrending?: boolean;
    isLoadingEvents?: boolean;
    errorFriends?: boolean | string | null;
    errorTrending?: boolean | string | null;
    errorEvents?: boolean | string | null;
    onRetryFriends?: () => void;
    onRetryTrending?: () => void;
    onRetryEvents?: () => void;
}

const FRIEND_LIST: FriendOnlineItem[] = [];
const EVENTS: UpcomingEventItem[] = [];

const MinimalLoadingState = () => (
    <div className="flex flex-col gap-1.5 py-1 animate-pulse">
        <div className="h-3 w-4/5 rounded bg-surface-hover/80" />
        <div className="h-2.5 w-1/2 rounded bg-surface-hover/60" />
    </div>
);

const MinimalErrorState = ({
    message,
    onRetry,
}: {
    message?: string;
    onRetry?: () => void;
}) => {
    const { t } = useTranslation();
    return (
        <div className="flex items-center justify-between py-1 text-xs text-text-muted">
            <span className="text-text-muted/90">
                {message || t('common.failedToLoad', { defaultValue: 'Unable to load.' })}
            </span>
            {onRetry && (
                <button
                    type="button"
                    onClick={onRetry}
                    className="text-[11px] font-medium text-text-muted hover:text-primary transition-colors cursor-pointer underline underline-offset-2"
                >
                    {t('common.retry', { defaultValue: 'Retry' })}
                </button>
            )}
        </div>
    );
};

export const RightBar = ({
    friends = FRIEND_LIST,
    trending: customTrending,
    events = EVENTS,
    isLoadingFriends = false,
    isLoadingTrending: customIsLoadingTrending,
    isLoadingEvents = false,
    errorFriends = null,
    errorTrending: customErrorTrending = null,
    errorEvents = null,
    onRetryFriends,
    onRetryTrending: customOnRetryTrending,
    onRetryEvents,
}: RightBarProps) => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    // Auto-query trending posts if not explicitly provided via props
    const isAutoQuery = customTrending === undefined;
    const {
        data: queryTrendingData,
        isLoading: isAutoLoading,
        isError: isAutoError,
        refetch: refetchTrending,
    } = useTrendingPostsQuery(
        { limit: 5 },
        { enabled: isAutoQuery },
    );

    const currentUser = useAuthStore((s) => s.user);
    const isAutoFriends = friends === FRIEND_LIST;
    const {
        data: queryFriendsData,
        isLoading: isAutoFriendsLoading,
        isError: isAutoFriendsError,
        refetch: refetchFriends,
    } = useFriendsQuery(isAutoFriends && Boolean(currentUser));

    const onlineUserIds = useMessagesStore((s) => s.onlineUserIds);
    const mergeOnlineUsers = useMessagesStore((s) => s.mergeOnlineUsers);

    const friendProfileIds = useMemo(() => {
        if (!queryFriendsData || !Array.isArray(queryFriendsData)) return [];
        return queryFriendsData
            .map((f) => {
                const profile = f.friend || f.user || (f.requesterId === currentUser?.id ? f.addressee : f.requester);
                return profile?.id || "";
            })
            .filter(Boolean);
    }, [queryFriendsData, currentUser]);

    // Fetch real Redis presence for friends
    useEffect(() => {
        if (!currentUser || friendProfileIds.length === 0) return;
        let cancelled = false;
        const fetchPresence = () => {
            messagesApi
                .getPresence(friendProfileIds)
                .then((res) => {
                    if (!cancelled && Array.isArray(res?.onlineUserIds)) {
                        mergeOnlineUsers(friendProfileIds, res.onlineUserIds);
                    }
                })
                .catch(() => {});
        };
        fetchPresence();
        const interval = window.setInterval(fetchPresence, 60_000);
        return () => {
            cancelled = true;
            window.clearInterval(interval);
        };
    }, [currentUser, friendProfileIds, mergeOnlineUsers]);

    const autoFriendsList: FriendOnlineItem[] = useMemo(() => {
        if (!queryFriendsData || !Array.isArray(queryFriendsData)) return [];
        const items = queryFriendsData.map((f) => {
            const profile = f.friend || f.user || (f.requesterId === currentUser?.id ? f.addressee : f.requester);
            const id = profile?.id;
            const username = profile?.username;
            const name = profile?.name || profile?.username || "Gamer";
            const avatar = profile?.avatarUrl || profile?.avatar || "";
            const isOnline = id ? Boolean(onlineUserIds[id]) : false;
            const status: "online" | "in-game" | "offline" = isOnline
                ? (profile?.status === "in-game" ? "in-game" : "online")
                : "offline";
            return {
                id,
                username,
                name,
                game: status === "in-game" ? "Đang chơi" : status === "online" ? "Trực tuyến" : "Ngoại tuyến",
                detail: `@${username || name}`,
                avatar,
                status,
            };
        });
        // Sort online friends to the top
        return items.sort((a, b) => Number(b.status !== "offline") - Number(a.status !== "offline"));
    }, [queryFriendsData, currentUser, onlineUserIds]);

    const finalFriends = isAutoFriends ? autoFriendsList : friends;
    const finalIsLoadingFriends = isAutoFriends ? (Boolean(currentUser) && isAutoFriendsLoading) : isLoadingFriends;
    const finalErrorFriends = isAutoFriends ? (isAutoFriendsError ? t('common.failedToLoad', { defaultValue: 'Unable to load.' }) : null) : errorFriends;
    const finalOnRetryFriends = isAutoFriends ? (() => { void refetchFriends(); }) : onRetryFriends;

    const autoTrendingList: TrendingPostItem[] = useMemo(() => {
        if (!queryTrendingData) return [];
        let items: PostDto[] = [];
        if (Array.isArray(queryTrendingData)) {
            items = queryTrendingData;
        } else if (typeof queryTrendingData === "object") {
            const obj = queryTrendingData as Record<string, unknown>;
            if (Array.isArray(obj.data)) items = obj.data as PostDto[];
            else if (Array.isArray(obj.items)) items = obj.items as PostDto[];
        }
        if (items.length === 0) return [];
        return items.map((post, idx) => ({
            id: post.id,
            postId: String(post.id),
            number: String(idx + 1).padStart(2, "0"),
            title: post.title || (post.content ? post.content.slice(0, 70) + (post.content.length > 70 ? "..." : "") : "Untitled"),
            game: post.gameTag || post.community?.name || "General",
            replies: post.commentsCount ?? 0,
        }));
    }, [queryTrendingData]);

    const finalTrending = customTrending ?? autoTrendingList;
    const finalIsLoadingTrending = customIsLoadingTrending ?? (isAutoQuery ? isAutoLoading : false);
    const finalErrorTrending = customErrorTrending ?? (isAutoQuery && isAutoError ? true : null);
    const finalOnRetryTrending = customOnRetryTrending ?? (() => { void refetchTrending(); });

    const displayFriends = finalFriends.slice(0, 4);
    const displayTrending = finalTrending.slice(0, 3);
    const displayEvents = events.slice(0, 3);

    return (
        <div className="w-full flex flex-col gap-4 py-1 select-none text-text">
            {/* 1. FRIENDS ONLINE SECTION */}
            <div className="flex flex-col">
                <SectionTitle label={t('common.onlineLabel', { defaultValue: 'Friends Online' })} />

                {finalIsLoadingFriends ? (
                    <MinimalLoadingState />
                ) : finalErrorFriends ? (
                    <MinimalErrorState
                        message={typeof finalErrorFriends === 'string' ? finalErrorFriends : undefined}
                        onRetry={finalOnRetryFriends}
                    />
                ) : displayFriends.length === 0 ? (
                    <p className="text-xs text-text-muted leading-relaxed py-0.5">
                        {t('common.noOnlineFriends', { defaultValue: 'No friends online right now.' })}
                    </p>
                ) : (
                    <div className="flex flex-col gap-1">
                        {displayFriends.map((m) => (
                            <div
                                key={m.id || m.name}
                                onClick={() => navigate({ to: "/profile/$userId", params: { userId: `@${m.username || m.name}` } })}
                                className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-surface-hover/70 transition-colors cursor-pointer group"
                                title={t('common.viewProfileOf', { name: m.name, defaultValue: `Xem trang cá nhân của ${m.name}` })}
                            >
                                <div className="relative shrink-0">
                                    <UserAvatar
                                        src={m.avatar}
                                        name={m.name}
                                        className="w-7 h-7 ring-1 ring-border/80"
                                        textClassName="text-[11px]"
                                    />
                                    <span
                                        className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-surface shrink-0 ${
                                            m.status === "offline"
                                                ? "bg-text-faint/40"
                                                : m.status === "in-game"
                                                ? "bg-sky-400"
                                                : "bg-emerald-500"
                                        }`}
                                    />
                                </div>

                                <div className="flex flex-col min-w-0 flex-1 leading-tight">
                                    <p className="text-xs font-bold text-text truncate group-hover:text-primary transition-colors">
                                        {m.name}
                                    </p>
                                    <p className="text-[11px] text-text-muted truncate mt-0.5">
                                        <span className={m.status !== "offline" ? "font-semibold text-emerald-400" : "font-medium text-text-faint"}>
                                            {m.game}
                                        </span>
                                        {m.detail && <span className="text-text-faint ml-1">· {m.detail}</span>}
                                    </p>
                                </div>

                                {m.id && currentUser && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate({ to: "/messages", search: { userId: m.id } as Record<string, unknown> });
                                        }}
                                        title={`Nhắn tin cho ${m.name}`}
                                        className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-full flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary/10 transition-all cursor-pointer shrink-0"
                                    >
                                        <ChatCircleDots className="size-3.5" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 2. TRENDING POSTS */}
            <div className="flex flex-col border-t border-divider-primary/60 pt-3.5">
                <SectionTitle label={t('common.trending', { defaultValue: 'Trending' })} />

                {finalIsLoadingTrending ? (
                    <MinimalLoadingState />
                ) : finalErrorTrending ? (
                    <MinimalErrorState
                        message={typeof finalErrorTrending === 'string' ? finalErrorTrending : undefined}
                        onRetry={finalOnRetryTrending}
                    />
                ) : displayTrending.length === 0 ? (
                    <div className="flex flex-col gap-1 py-0.5">
                        <p className="text-xs text-text-muted leading-relaxed">
                            {t('common.noTrendingPosts', { defaultValue: 'Nothing trending at the moment.' })}
                        </p>
                        <div>
                            <button
                                type="button"
                                onClick={() => navigate({ to: '/community' })}
                                className="text-[11px] font-medium text-text-muted hover:text-primary transition-colors cursor-pointer inline-flex items-center gap-1 group underline underline-offset-2 decoration-border/80 hover:decoration-primary"
                            >
                                <span>{t('common.exploreCommunities', { defaultValue: 'Explore communities' })}</span>
                                <span className="group-hover:translate-x-0.5 transition-transform text-[10px]">→</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-1.5">
                        {displayTrending.map((post) => (
                            <div
                                key={post.id}
                                onClick={() => navigate({ to: "/post/$postId", params: { postId: post.postId } })}
                                className="flex items-start gap-2.5 px-2 py-1.5 rounded-lg hover:bg-surface-hover/70 transition-colors cursor-pointer group"
                            >
                                <span className="text-xs font-black text-primary/80 pt-0.5 shrink-0 font-mono">
                                    {post.number}
                                </span>

                                <div className="flex flex-col min-w-0 flex-1">
                                    <p className="text-xs font-bold text-text group-hover:text-primary transition-colors leading-snug line-clamp-2">
                                        {post.title}
                                    </p>
                                    <p className="text-[11px] text-text-muted mt-1 flex items-center gap-1.5">
                                        <span className="font-semibold text-text-muted group-hover:underline truncate max-w-[120px]">
                                            {post.game}
                                        </span>
                                        <span className="text-text-faint">·</span>
                                        <span className="text-text-faint shrink-0">
                                            {post.replies} {t('common.replies', { defaultValue: 'phản hồi' })}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 3. UPCOMING TIMELINE */}
            <div className="flex flex-col border-t border-divider-primary/60 pt-3.5">
                <SectionTitle label={t('common.upcoming', { defaultValue: 'Upcoming' })} />

                {isLoadingEvents ? (
                    <MinimalLoadingState />
                ) : errorEvents ? (
                    <MinimalErrorState
                        message={typeof errorEvents === 'string' ? errorEvents : undefined}
                        onRetry={onRetryEvents}
                    />
                ) : displayEvents.length === 0 ? (
                    <p className="text-xs text-text-muted leading-relaxed py-0.5">
                        {t('common.noUpcomingReleases', { defaultValue: 'No upcoming releases to show.' })}
                    </p>
                ) : (
                    <div className="flex flex-col pl-2 border-l-2 border-border/60 gap-3.5 my-1 ml-1.5">
                        {displayEvents.map((ev) => (
                            <div
                                key={ev.id}
                                className="relative pl-3 flex flex-col group cursor-pointer hover:opacity-90 transition-opacity"
                            >
                                <span className="absolute -left-[18px] top-1 w-2.5 h-2.5 rounded-full bg-surface ring-2 ring-primary shrink-0" />
                                <span className="text-[10px] font-black text-primary tracking-wider uppercase font-mono">
                                    {ev.date}
                                </span>
                                <p className="text-xs font-bold text-text group-hover:text-primary transition-colors leading-tight mt-0.5">
                                    {ev.title}
                                </p>
                                {ev.subtitle && (
                                    <span className="text-[11px] text-text-muted mt-0.5 leading-snug">
                                        {ev.subtitle}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
