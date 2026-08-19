import { useNavigate, useLocation } from "@tanstack/react-router";
import {
    RAFT_LOGO as raftLogo,
    RDR2_LOGO as rdr2Logo,
    CS2_LOGO as cs2Logo,
} from "@/shared/constants/images";
import { useTranslation } from "@/shared/hooks/useTranslate";
import { useAuthStore } from "@/features/auth";

const SectionTitle = ({ label }: { label: string }) => (
    <div className="pb-1.5 mb-2">
        <span className="text-[10px] font-black uppercase tracking-wider text-text-faint/90">
            {label}
        </span>
    </div>
);

const FRIEND_LIST = [
    { name: "GhostRider",    game: "Red Dead Redemption 2", slug: "red-dead-redemption-2", logo: rdr2Logo, status: "online",  playtime: "2h 14m" },
    { name: "TacticalXeno",  game: "CS2 — Rank S",          slug: "counter-strike-2",      logo: cs2Logo,  status: "online",  playtime: "45m"    },
    { name: "NightOwl",      game: "Raft",                   slug: "raft",                  logo: raftLogo, status: "online",  playtime: "1h 03m" },
    { name: "Maplestrike",   game: null,                     slug: null,                    logo: null,     status: "offline", playtime: null     },
];

const TRENDING_POSTS = [
    {
        id: 1,
        postId: 5,
        number: "01",
        title: "Patch 1.6 just dropped – what are your thoughts?",
        game: "CS2",
        slug: "counter-strike-2",
        replies: 142,
    },
    {
        id: 2,
        postId: 6,
        number: "02",
        title: "Best farming spot after the loot cave nerf?",
        game: "Raft",
        slug: "raft",
        replies: 87,
    },
    {
        id: 3,
        postId: 3,
        number: "03",
        title: "Legendary run – Red Harlow tribute build",
        game: "RDR 2",
        slug: "red-dead-redemption-2",
        replies: 61,
    },
];

const SQUAD_ACTIVITIES = [
    { id: "sa-1", user: "GhostRider", action: "joined", target: "CS2 Premier Tryhard", time: "5m ago", game: "CS2" },
    { id: "sa-2", user: "TacticalXeno", action: "is recruiting for", target: "Raft Hardcore Survival", time: "15m ago", game: "Raft" },
    { id: "sa-3", user: "NightOwl", action: "formed a new squad", target: "CS2 Rank S Rush", time: "45m ago", game: "CS2" },
    { id: "sa-4", user: "Maplestrike", action: "joined", target: "Valorant Ascendant", time: "1h ago", game: "Valorant" },
];

const EVENTS = [
    { id: 1, date: "Jul 20", title: "CS2 Major", subtitle: "Quarterfinals", accentColor: "border-primary" },
    { id: 2, date: "Jul 22", title: "IndieG Community Game Night", subtitle: "Community Event", accentColor: "border-emerald-500" },
    { id: 3, date: "Jul 25", title: "Raft Summer Fest Update", subtitle: "New Content Patch", accentColor: "border-cyan-500" },
];

export const RightBar = () => {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { t } = useTranslation();
    const user = useAuthStore((state) => state.user);
    const mockLogin = useAuthStore((state) => state.mockLogin);
    const isLoggedIn = !!user || mockLogin;

    const isSquadPage = pathname.startsWith("/squad");
    const onlineFriends = FRIEND_LIST.filter((m) => m.status === "online");

    return (
        <div className="w-full flex flex-col gap-6 py-1 select-none">
            {/* 1. FRIENDS SECTION */}
            {isLoggedIn && (
                <div className="flex flex-col">
                    <SectionTitle label={t("squad.friendsTitle")} />
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

                                    {m.game && (
                                        <p className="text-[11px] text-text-muted pl-4 truncate">
                                            {m.game}
                                        </p>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="text-xs text-text-faint py-2 px-1">
                                {t("squad.noFriendsOnline")}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 2. SQUAD ACTIVITY (On /squad page) vs TRENDING (On other pages) */}
            {isSquadPage ? (
                <div className="flex flex-col border-t border-divider-primary pt-4">
                    <SectionTitle label="Squad Activity" />
                    <div className="flex flex-col gap-3">
                        {SQUAD_ACTIVITIES.map((act) => (
                            <div
                                key={act.id}
                                className="flex flex-col gap-0.5 px-1 py-1 text-xs"
                            >
                                <div className="leading-snug">
                                    <span className="font-bold text-text hover:text-primary cursor-pointer">
                                        @{act.user}
                                    </span>{" "}
                                    <span className="text-text-muted">{act.action}</span>{" "}
                                    <span className="font-semibold text-primary">{act.target}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] font-mono text-text-faint mt-0.5">
                                    <span className="text-text-muted">{act.game}</span>
                                    <span>·</span>
                                    <span>{act.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col border-t border-divider-primary pt-4">
                    <SectionTitle label="Trending" />
                    <div className="flex flex-col gap-3">
                        {TRENDING_POSTS.map((post) => (
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
                                        <span>{post.replies} replies</span>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 3. UPCOMING TIMELINE */}
            <div className="flex flex-col border-t border-divider-primary pt-4">
                <SectionTitle label="Upcoming" />
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
            </div>
        </div>
    );
};
