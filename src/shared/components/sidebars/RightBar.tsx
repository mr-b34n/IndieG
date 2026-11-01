import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "@/shared/hooks/useTranslate";

const SectionTitle = ({ label }: { label: string }) => (
    <div className="pb-1.5 mb-2">
        <span className="text-[10px] font-black uppercase tracking-wider text-text-faint/90">
            {label}
        </span>
    </div>
);

interface FriendOnlineItem {
    name: string;
    game: string;
    detail: string;
    avatar: string;
    status: "online" | "in-game";
    playtime?: string;
}

export interface RightBarProps {
    friends?: FriendOnlineItem[];
    trending?: any[];
    events?: any[];
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
const TRENDING_POSTS: any[] = [];
const EVENTS: any[] = [];

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
    trending = TRENDING_POSTS,
    events = EVENTS,
    isLoadingFriends = false,
    isLoadingTrending = false,
    isLoadingEvents = false,
    errorFriends = null,
    errorTrending = null,
    errorEvents = null,
    onRetryFriends,
    onRetryTrending,
    onRetryEvents,
}: RightBarProps) => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const displayFriends = friends.slice(0, 4);
    const displayTrending = trending.slice(0, 3);
    const displayEvents = events.slice(0, 3);

    return (
        <div className="w-full flex flex-col gap-4 py-1 select-none text-text">
            {/* 1. FRIENDS ONLINE SECTION */}
            <div className="flex flex-col">
                <SectionTitle label={t('common.onlineLabel', { defaultValue: 'Friends Online' })} />

                {isLoadingFriends ? (
                    <MinimalLoadingState />
                ) : errorFriends ? (
                    <MinimalErrorState
                        message={typeof errorFriends === 'string' ? errorFriends : undefined}
                        onRetry={onRetryFriends}
                    />
                ) : displayFriends.length === 0 ? (
                    <p className="text-xs text-text-muted leading-relaxed py-0.5">
                        {t('common.noOnlineFriends', { defaultValue: 'No friends online right now.' })}
                    </p>
                ) : (
                    <div className="flex flex-col gap-1">
                        {displayFriends.map((m) => (
                            <div
                                key={m.name}
                                onClick={() => navigate({ to: "/profile/$userId", params: { userId: `@${m.name}` } })}
                                className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-surface-hover/70 transition-colors cursor-pointer group"
                                title={t('common.viewProfileOf', { name: m.name, defaultValue: `Xem trang cá nhân của ${m.name}` })}
                            >
                                <div className="relative shrink-0">
                                    <img
                                        src={m.avatar}
                                        alt={m.name}
                                        className="w-7 h-7 rounded-full object-cover ring-1 ring-border/80"
                                        onError={(e) => {
                                            (e.currentTarget as HTMLImageElement).style.display = "none";
                                        }}
                                    />
                                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-surface shrink-0" />
                                </div>

                                <div className="flex flex-col min-w-0 flex-1 leading-tight">
                                    <p className="text-xs font-bold text-text truncate group-hover:text-primary transition-colors">
                                        {m.name}
                                    </p>
                                    <p className="text-[11px] text-text-muted truncate mt-0.5">
                                        <span className="font-medium text-text-muted">{m.game}</span>
                                        {m.detail && <span className="text-text-faint ml-1">· {m.detail}</span>}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 2. TRENDING POSTS */}
            <div className="flex flex-col border-t border-divider-primary/60 pt-3.5">
                <SectionTitle label={t('common.trending', { defaultValue: 'Trending' })} />

                {isLoadingTrending ? (
                    <MinimalLoadingState />
                ) : errorTrending ? (
                    <MinimalErrorState
                        message={typeof errorTrending === 'string' ? errorTrending : undefined}
                        onRetry={onRetryTrending}
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
