import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "@/shared/hooks/useTranslate";
import { useAuthStore } from "@/features/auth";

const SectionTitle = ({ label }: { label: string }) => (
    <div className="pb-1.5 mb-2">
        <span className="text-[10px] font-black uppercase tracking-wider text-text-faint/90">
            {label}
        </span>
    </div>
);

const FRIEND_LIST: { name: string; game: string | null; slug: string | null; logo: string | null; status: string; playtime: string | null }[] = [];

const TRENDING_POSTS: { id: number; postId: number; number: string; title: string; game: string; slug: string; replies: number }[] = [];

const EVENTS: { id: number; date: string; title: string; subtitle?: string; accentColor: string }[] = [];

export const RightBar = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const user = useAuthStore((state) => state.user);
    const mockLogin = useAuthStore((state) => state.mockLogin);
    const isLoggedIn = !!user || mockLogin;

    const onlineFriends = FRIEND_LIST.filter((m) => m.status === "online");

    return (
        <div className="w-full flex flex-col gap-6 py-1 select-none">
            {/* 1. FRIENDS SECTION */}
            {isLoggedIn && (
                <div className="flex flex-col">
                    <SectionTitle label={t('common.onlineLabel', { defaultValue: 'Online' })} />
                    <div className="flex flex-col gap-2.5">
                        {onlineFriends.length > 0 ? (
                            onlineFriends.map((m) => (
                                <div
                                    key={m.name}
                                    onClick={() => navigate({ to: "/profile/$userId", params: { userId: `@${m.name.toLowerCase().replace(/\s+/g, "_")}` } })}
                                    className="flex flex-col gap-0.5 px-1 py-1 rounded hover:bg-surface-hover/50 transition-colors cursor-pointer group"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                                            <p className="text-xs font-bold text-text truncate group-hover:text-primary transition-colors">
                                                {m.name}
                                            </p>
                                        </div>
                                        {m.playtime && (
                                            <span className="text-[10px] font-medium text-text-faint shrink-0">
                                                {m.playtime}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-xs text-text-faint py-2 px-1">
                                {t('common.noOnlineFriends', { defaultValue: 'Không có bạn bè online' })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 2. TRENDING POSTS */}
            <div className="flex flex-col border-t border-divider-primary pt-4">
                <SectionTitle label={t('common.trending', { defaultValue: 'Trending' })} />
                <div className="flex flex-col gap-3">
                    {TRENDING_POSTS.length > 0 ? (
                        TRENDING_POSTS.map((post) => (
                            <div
                                key={post.id}
                                onClick={() => navigate({ to: "/post/$postId", params: { postId: post.postId.toString() } })}
                                className="flex items-start gap-2.5 px-1 py-1 rounded hover:bg-surface-hover/50 transition-colors cursor-pointer group"
                            >
                                <span className="text-xs font-black text-primary/80 pt-0.5 shrink-0 font-mono">
                                    {post.number}
                                </span>

                                <div className="flex flex-col min-w-0 flex-1">
                                    <p className="text-xs font-bold text-text group-hover:text-primary transition-colors leading-snug line-clamp-2">
                                        {post.title}
                                    </p>
                                    <p className="text-[11px] text-text-muted mt-0.5">
                                        <span className="font-semibold text-text-muted hover:underline">{post.game}</span>
                                        <span className="mx-1.5 text-text-faint">·</span>
                                        <span>{post.replies} {t('common.replies', { defaultValue: 'phản hồi' })}</span>
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-xs text-text-faint py-2 px-1">
                            {t('common.noTrendingPosts', { defaultValue: 'Chưa có bài viết xu hướng' })}
                        </div>
                    )}
                </div>
            </div>

            {/* 3. UPCOMING TIMELINE */}
            <div className="flex flex-col border-t border-divider-primary pt-4">
                <SectionTitle label={t('common.upcoming', { defaultValue: 'Upcoming' })} />
                {EVENTS.length > 0 ? (
                    <div className="flex flex-col pl-2 border-l border-divider-primary gap-4 my-1">
                        {EVENTS.map((ev) => (
                            <div key={ev.id} className="relative pl-3 flex flex-col group cursor-pointer">
                                <span className="absolute -left-[13px] top-1 w-2 h-2 rounded-full bg-surface ring-2 ring-primary shrink-0" />
                                <span className="text-[10px] font-bold text-primary tracking-wide">
                                    {ev.date}
                                </span>
                                <p className="text-xs font-bold text-text group-hover:text-primary transition-colors leading-tight mt-0.5">
                                    {ev.title}
                                </p>
                                {ev.subtitle && (
                                    <span className="text-[11px] text-text-muted mt-0.5">
                                        {ev.subtitle}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-xs text-text-faint py-2 px-1">
                        {t('common.noUpcomingEvents', { defaultValue: 'Chưa có sự kiện sắp diễn ra' })}
                    </div>
                )}
            </div>
        </div>
    );
};
