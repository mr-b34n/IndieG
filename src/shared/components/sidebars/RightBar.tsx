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

const FRIEND_LIST: FriendOnlineItem[] = [
    {
        name: "ShadowHunter",
        game: "Counter-Strike 2",
        detail: "Premier · 22,450 Elo",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=ShadowHunter",
        status: "in-game",
        playtime: "Mirage 12-11",
    },
    {
        name: "EldenLord_VN",
        game: "ELDEN RING",
        detail: "Shadow of the Erdtree",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=EldenLord",
        status: "in-game",
        playtime: "Belurat Gaol",
    },
    {
        name: "MonkeyKing_88",
        game: "Black Myth: Wukong",
        detail: "Chương 6 · Hoa Quả Sơn",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=MonkeyKing",
        status: "in-game",
        playtime: "NG+ 100%",
    },
    {
        name: "CyberSamurai",
        game: "Cyberpunk 2077",
        detail: "Dogtown · Phantom Liberty",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=CyberSamurai",
        status: "in-game",
        playtime: "Sandevistan 2.13",
    },
];

const TRENDING_POSTS = [
    {
        id: 1,
        postId: "post-1",
        number: "01",
        title: "Pha Clutch 1v4 nghẹt thở tại Mirage Premier rank 20k Elo!",
        game: "Counter-Strike 2",
        slug: "cs2-vietnam",
        replies: 24,
    },
    {
        id: 2,
        postId: "post-2",
        number: "02",
        title: "Tại sao cơ chế Stagger và Poise trong Elden Ring lại cuốn hút?",
        game: "Elden Ring",
        slug: "elden-ring-vietnam",
        replies: 58,
    },
    {
        id: 3,
        postId: "post-4",
        number: "03",
        title: "Sau 180 giờ chinh phục: 100% Platinum Trophy Black Myth: Wukong!",
        game: "Black Myth: Wukong",
        slug: "black-myth-wukong-vn",
        replies: 42,
    },
];

const EVENTS = [
    {
        id: 1,
        date: "15 THG 10",
        title: "Giải đấu CS2 IndieG Premier Cup #4",
        subtitle: "Đăng ký squad 5v5 · Tổng giải thưởng 15.000.000đ",
        accentColor: "text-primary",
    },
    {
        id: 2,
        date: "28 THG 10",
        title: "Monster Hunter Wilds Open Beta Weekend",
        subtitle: "Thử nghiệm săn quái toàn cầu trên Steam & PS5",
        accentColor: "text-amber-400",
    },
    {
        id: 3,
        date: "05 THG 11",
        title: "Đêm hội Community: Wukong Speedrun Challenge",
        subtitle: "Livestream tranh tài diệt boss ẩn cùng dàn creator IndieG",
        accentColor: "text-emerald-400",
    },
];

export const RightBar = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const displayFriends = FRIEND_LIST.slice(0, 4);
    const displayTrending = TRENDING_POSTS.slice(0, 3);
    const displayEvents = EVENTS.slice(0, 3);

    return (
        <div className="w-full flex flex-col gap-5 py-1 select-none text-text">
            {/* 1. FRIENDS ONLINE SECTION */}
            <div className="flex flex-col">
                <div className="flex items-center justify-between pb-1.5 mb-2">
                    <SectionTitle label={t('common.onlineLabel', { defaultValue: 'Bạn bè trực tuyến' })} />
                </div>

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
            </div>

            {/* 2. TRENDING POSTS */}
            <div className="flex flex-col border-t border-border/40 pt-4">
                <SectionTitle label={t('common.trending', { defaultValue: 'Thịnh hành' })} />
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
            </div>

            {/* 3. UPCOMING TIMELINE */}
            <div className="flex flex-col border-t border-border/40 pt-4">
                <SectionTitle label={t('common.upcoming', { defaultValue: 'Sự kiện sắp diễn ra' })} />
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
            </div>
        </div>
    );
};
