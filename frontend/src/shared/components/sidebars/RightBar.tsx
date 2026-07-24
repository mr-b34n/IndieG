import { faArrowTrendUp, faGamepad, faCalendarDay, faUsers, faBolt } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useNavigate } from "@tanstack/react-router"

import raftLogo    from "../../../assets/logos/raft-logo.png";
import rdr2Logo    from "../../../assets/logos/rdr2-logo.png";
import cs2Logo     from "../../../assets/logos/cs2-logo.webp";
import avatarGame  from "../../../assets/logos/raft-logo.png";

const Panel = ({ children }: { children: React.ReactNode }) => (
    <div className="
        w-full flex flex-col overflow-hidden
        bg-surface/90 backdrop-blur-md
        border border-border
        rounded-2xl
    ">
        {children}
    </div>
);

const SectionTitle = ({ icon, label, extra }: { icon: typeof faArrowTrendUp; label: string; extra?: React.ReactNode }) => (
    <div className="flex items-center gap-2 px-4 pt-3.5 pb-2">
        <FontAwesomeIcon icon={icon} className="text-[13px] text-text-muted" />
        <span className="text-xs font-bold uppercase tracking-widest text-text-muted flex-1">{label}</span>
        {extra}
    </div>
);

const SQUAD_MEMBERS = [
    { name: "GhostRider",    game: "Red Dead 2",    logo: rdr2Logo, status: "online",  playtime: "2h 14m" },
    { name: "TacticalXeno",  game: "CS2 — Rank S",  logo: cs2Logo,  status: "online",  playtime: "45m"    },
    { name: "NightOwl",      game: "Raft",           logo: raftLogo, status: "online",  playtime: "1h 03m" },
    { name: "Maplestrike",   game: null,             logo: null,     status: "offline", playtime: null     },
];

const TRENDING_POSTS = [
    {
        id: 1,
        postId: 5,
        title: "Patch 1.6 just dropped – what are your thoughts?",
        game: "CS2",
        gameLogo: cs2Logo,
        replies: 142,
        heat: "🔥 Hot",
    },
    {
        id: 2,
        postId: 6,
        title: "Best farming spot after the loot cave nerf?",
        game: "Raft",
        gameLogo: raftLogo,
        replies: 87,
        heat: "⚡ Rising",
    },
    {
        id: 3,
        postId: 3,
        title: "Legendary run – Red Harlow tribute build",
        game: "RDR 2",
        gameLogo: rdr2Logo,
        replies: 61,
        heat: "⭐ Popular",
    },
];

const EVENTS = [
    { id: 1, label: "CS2 Major — Quarterfinals", date: "Jul 20", color: "bg-rose-500" },
    { id: 2, label: "IndieG Community Game Night", date: "Jul 22", color: "bg-primary" },
    { id: 3, label: "Raft Summer Fest Update", date: "Jul 25", color: "bg-emerald-500" },
];

export const RightBar = () => {
    const navigate = useNavigate();
    const onlineCount = SQUAD_MEMBERS.filter((m) => m.status === "online").length;

    return (
        <div className="w-full flex flex-col gap-3">
            <Panel>
                <SectionTitle
                    icon={faGamepad}
                    label="Squad"
                    extra={
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            {onlineCount} online
                        </span>
                    }
                />
                <div className="flex flex-col pb-2 px-2 gap-0.5">
                    {SQUAD_MEMBERS.map((m) => {
                        const online = m.status === "online";
                        return (
                            <div
                                key={m.name}
                                className="flex items-center gap-3 px-2 py-1.5 rounded-xl hover:bg-surface-hover transition-colors cursor-pointer group"
                            >
                                <div className="relative shrink-0">
                                    <img
                                        src={avatarGame}
                                        alt={m.name}
                                        className={`w-8 h-8 rounded-full object-cover ring-1 ${online ? "ring-emerald-500/40" : "ring-border opacity-40"}`}
                                    />
                                    <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-surface ${online ? "bg-emerald-500" : "bg-neutral-400"}`} />
                                </div>

                                <div className="flex flex-col min-w-0 flex-1">
                                    <p className={`text-sm font-semibold truncate ${online ? "text-text" : "text-text-faint"}`}>
                                        {m.name}
                                    </p>
                                    {online && m.game ? (
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            {m.logo && <img src={m.logo} alt="" className="w-3 h-3 rounded object-cover opacity-80" />}
                                            <p className="text-[11px] text-text-faint truncate">{m.game}</p>
                                        </div>
                                    ) : (
                                        <p className="text-[11px] text-text-faint">Offline</p>
                                    )}
                                </div>

                                {online && m.playtime && (
                                    <span className="text-[10px] text-text-faint shrink-0 group-hover:text-text-muted transition-colors">
                                        {m.playtime}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </Panel>

            <Panel>
                <SectionTitle icon={faArrowTrendUp} label="Trending" />
                <div className="flex flex-col pb-2 px-2 gap-0.5">
                    {TRENDING_POSTS.map((post, i) => (
                        <div
                            key={post.id}
                            onClick={() => navigate({ to: "/post/$postId", params: { postId: post.postId.toString() } })}
                            className="flex items-start gap-3 px-2 py-2 rounded-xl hover:bg-surface-hover transition-colors cursor-pointer group"
                        >
                            <p className={`text-xs font-black w-4 text-center pt-0.5 shrink-0 ${i === 0 ? "text-rose-500" : i === 1 ? "text-amber-500" : "text-text-faint"}`}>
                                {i + 1}
                            </p>

                            <img src={post.gameLogo} alt={post.game} className="w-8 h-8 rounded-lg object-cover shrink-0 ring-1 ring-border" />

                            <div className="flex flex-col gap-1 min-w-0 flex-1">
                                <p className="text-sm font-medium text-text leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                                    {post.title}
                                </p>
                                <div className="flex items-center gap-2 text-[11px] text-text-faint">
                                    <span className="font-semibold text-text-muted">{post.game}</span>
                                    <span>·</span>
                                    <FontAwesomeIcon icon={faUsers} className="text-[10px]" />
                                    <span>{post.replies} replies</span>
                                    <span className="ml-auto shrink-0">{post.heat}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Panel>

            <Panel>
                <SectionTitle icon={faCalendarDay} label="Upcoming" />
                <div className="flex flex-col pb-3 px-4 gap-2.5">
                    {EVENTS.map((ev) => (
                        <div key={ev.id} className="flex items-center gap-3 cursor-pointer group">
                            <div className={`w-1 h-8 rounded-full shrink-0 ${ev.color}`} />
                            <div className="flex flex-col min-w-0 flex-1">
                                <p className="text-sm font-medium text-text group-hover:text-primary transition-colors leading-tight truncate">
                                    {ev.label}
                                </p>
                                <p className="text-[11px] text-text-faint">{ev.date}</p>
                            </div>
                            <FontAwesomeIcon icon={faBolt} className="text-[11px] text-text-faint group-hover:text-primary transition-colors shrink-0" />
                        </div>
                    ))}
                </div>
            </Panel>
        </div>
    )
}
