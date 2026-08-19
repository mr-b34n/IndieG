import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faStar as faStarSolid, faCheck, faCrown, faPen, faUsers, faShareNodes,
} from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";
import type { Badge, LibraryGame, ProfileIdentity, CommunityReputation, RecentActivityItem } from "../../types";
import { GEAR_CATEGORIES } from "../../constants";

interface OverviewTabProps {
    identity: ProfileIdentity;
    games: LibraryGame[];
    badges: Badge[];
    reputations: CommunityReputation[];
    activities: RecentActivityItem[];
    gearData: Record<string, string>;
    isOwnProfile: boolean;
    onGearChange?: (key: string, value: string) => void;
    onSaveGear?: () => void;
}

const PLATFORMS = [
    { label: "Steam", sub: "Verified", bg: "bg-[#151A29]", text: "text-[#66c0f4]", icon: "🎮" },
    { label: "Riot Games", sub: "VN2 Server", bg: "bg-[#151A29]", text: "text-[#F05A7E]", icon: "🔥" },
    { label: "Xbox Live", sub: "Connected", bg: "bg-[#151A29]", text: "text-[#20C997]", icon: "🎯" },
    { label: "Discord", sub: "Linked", bg: "bg-[#151A29]", text: "text-[#9B8AFB]", icon: "🎧" },
];

export const OverviewTab = ({
    identity, games, badges, reputations, activities, gearData, isOwnProfile, onGearChange, onSaveGear,
}: OverviewTabProps) => {
    const [hoveredBadge, setHoveredBadge] = useState<Badge | null>(null);
    const [selectedGameSlug, setSelectedGameSlug] = useState<string>("cs2");
    const [isEditingGear, setIsEditingGear] = useState(false);

    const featuredGame = games.find((g) => g.id === selectedGameSlug || g.isFeatured) || games[0];
    const secondaryGames = games.filter((g) => g.name !== featuredGame.name);
    const filledGear = GEAR_CATEGORIES.filter((cat) => gearData[cat.value]?.trim());

    // Achievement tier color helper
    const getBadgeRarityCfg = (rarity?: string) => {
        switch (rarity?.toLowerCase()) {
            case "legendary": return { color: "text-[#F5B83D]", bg: "bg-[#F5B83D]/10", label: "Legendary" };
            case "epic":      return { color: "text-[#9B8AFB]", bg: "bg-[#9B8AFB]/10", label: "Epic" };
            case "rare":      return { color: "text-[#1687FF]", bg: "bg-[#1687FF]/10", label: "Rare" };
            default:          return { color: "text-[#68708A]", bg: "bg-[#68708A]/10", label: "Common" };
        }
    };

    return (
        <div className="flex flex-col gap-5 w-full animate-fade-in">

            {/* ── ROW 1: PLAYER IDENTITY + GAMING DNA ─────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full">
                
                {/* PLAYER IDENTITY (5 cols) - Level 1 Surface #101421 (NO BORDER) */}
                <div className="lg:col-span-5 bg-[#101421] rounded-2xl p-5 flex flex-col gap-4 shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between border-b border-[#1A2032] pb-3">
                        <div className="flex items-center gap-2">
                            <span className="text-base">🎯</span>
                            <h3 className="text-xs font-black uppercase tracking-wider text-text">Player Identity</h3>
                        </div>
                        <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#20C997]/15 text-[#20C997]">
                            🟢 Online
                        </span>
                    </div>

                    {identity.bio && (
                        <p className="text-xs text-text-muted italic leading-relaxed border-b border-[#1A2032] pb-2.5">
                            "{identity.bio}"
                        </p>
                    )}

                    {/* Level 0 — No Container for Roles / Archetypes */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-xs font-extrabold text-text">
                            <span className="text-[#F5B83D]">🎯</span> FPS Veteran
                        </div>
                        <div className="flex items-center gap-2 text-xs font-extrabold text-text">
                            <span className="text-[#22D3EE]">🏕️</span> Survival Architect
                        </div>
                        <div className="flex items-center gap-2 text-xs font-extrabold text-text">
                            <span className="text-[#9B8AFB]">🧠</span> Tactical Competitor
                        </div>
                    </div>

                    {/* Main Roles */}
                    <div className="flex flex-col gap-1.5 pt-2 border-t border-[#1A2032]">
                        <span className="text-[10px] font-black uppercase text-text-faint tracking-wider">Main Roles</span>
                        <div className="flex flex-wrap items-center gap-1.5">
                            {["Rifler", "Support", "IGL"].map((role) => (
                                <span key={role} className="px-2.5 py-1 rounded-lg bg-[#151A29] text-text font-bold text-xs">
                                    {role}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Playstyle & Preference */}
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#1A2032] text-xs">
                        <div>
                            <span className="text-[10px] font-black uppercase text-text-faint tracking-wider block mb-1">Playstyle</span>
                            <span className="font-semibold text-text-muted">Aggressive · Tactical</span>
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase text-text-faint tracking-wider block mb-1">Usually Plays</span>
                            <span className="font-semibold text-text-muted">FPS · Survival · RPG</span>
                        </div>
                    </div>
                </div>

                {/* GAMING DNA (7 cols) - Level 1 Surface #101421 (NO BORDER) */}
                <div className="lg:col-span-7 bg-[#101421] rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
                    <div className="flex items-center justify-between border-b border-[#1A2032] pb-3">
                        <div className="flex items-center gap-2">
                            <span className="text-base">🧬</span>
                            <h3 className="text-xs font-black uppercase tracking-wider text-text">Gaming DNA</h3>
                        </div>
                        <span className="text-[10px] font-bold text-text-faint">Stats Breakdown</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Genre Mastery - All primary blue/cyan spectrum */}
                        <div className="flex flex-col gap-2.5">
                            <span className="text-[10px] font-black uppercase text-text-faint tracking-wider">Genre Mastery</span>
                            
                            <DnaBar label="FPS" percent={92} hex="#1687FF" />
                            <DnaBar label="SURVIVAL" percent={78} hex="#1995F5" />
                            <DnaBar label="RPG" percent={61} hex="#21A8F2" />
                            <DnaBar label="STRATEGY" percent={42} hex="#22B8D6" />
                        </div>

                        {/* Play Dynamics - Semantic Accents */}
                        <div className="flex flex-col gap-2.5">
                            <span className="text-[10px] font-black uppercase text-text-faint tracking-wider">Play Dynamics</span>

                            <DnaBar label="Competitive" percent={81} hex="#F05A7E" />
                            <DnaBar label="Co-op" percent={76} hex="#20C997" />
                            <DnaBar label="Solo" percent={53} hex="#9B8AFB" />
                            <DnaBar label="Casual" percent={40} hex="#F5B83D" />
                        </div>
                    </div>
                </div>

            </div>

            {/* ── ROW 2: GAME MASTERY (HERO SECTION) ───────────────────────── */}
            <div className="w-full bg-[#101421] rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col gap-5">
                <div className="flex items-center justify-between border-b border-[#1A2032] pb-3">
                    <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faCrown} className="text-[#F5B83D] text-sm" />
                        <h3 className="text-xs font-black uppercase tracking-wider text-text">Game Mastery</h3>
                    </div>
                    <span className="text-xs font-bold text-[#1687FF]">Featured Game</span>
                </div>

                {/* Level 2 — Elevated Hero Game Card #151A29 (NO BORDER) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center bg-[#151A29] rounded-xl p-4 sm:p-5 relative overflow-hidden transition-all shadow-sm">
                    
                    <div className="lg:col-span-4 flex items-center gap-4 relative z-10">
                        <img
                            src={featuredGame.logo}
                            alt={featuredGame.name}
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shadow-xl shrink-0"
                        />
                        <div className="flex flex-col gap-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h4 className="font-black text-text text-base truncate">{featuredGame.name}</h4>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black text-[#1687FF] bg-[#1687FF]/15">
                                    HERO
                                </span>
                            </div>
                            <span className="text-xs font-extrabold text-[#20C997]">
                                {featuredGame.hours} HOURS PLAYED
                            </span>
                            <span className="text-xs font-bold text-[#F5B83D]">
                                Premier {featuredGame.ratingScore || "18,500"}
                            </span>
                        </div>
                    </div>

                    {/* Progress & Skill Ratings */}
                    <div className="lg:col-span-8 flex flex-col gap-3 relative z-10">
                        <div className="flex flex-wrap items-center justify-between text-xs font-bold text-text">
                            <span className="text-text-muted">
                                Mastery Progress ({featuredGame.achievements}/{featuredGame.totalAchievements} Achievements)
                            </span>
                            <span className="text-[#20C997] font-extrabold px-2 py-0.5 rounded-full bg-[#20C997]/10 text-[11px]">
                                {featuredGame.keyStat || "68.4% WINRATE"}
                            </span>
                        </div>

                        {/* Signature Progress Accent Bar */}
                        <div className="h-2 w-full bg-[#101421] rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{ 
                                    width: `${Math.round((featuredGame.achievements / featuredGame.totalAchievements) * 100)}%`,
                                    background: `linear-gradient(90deg, #1687FF, ${featuredGame.accentColor || "#22D3EE"})`
                                }}
                            />
                        </div>

                        {/* Skill Stars */}
                        <div className="flex flex-wrap items-center justify-between gap-4 pt-1 text-xs">
                            <div className="flex flex-wrap items-center gap-4">
                                {featuredGame.skills?.map((s) => (
                                    <div key={s.name} className="flex items-center gap-2">
                                        <span className="font-bold text-text-muted">{s.name}</span>
                                        <div className="flex items-center gap-0.5 text-[#F5B83D] text-xs">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <FontAwesomeIcon
                                                    key={star}
                                                    icon={star <= s.stars ? faStarSolid : faStarRegular}
                                                    className={star <= s.stars ? "text-[#F5B83D]" : "text-text-faint/30"}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center gap-2 ml-auto">
                                <span className="px-2.5 py-1 rounded-lg bg-[#20C997]/10 text-[#20C997] text-[11px] font-black">
                                    🏆 Clutch God
                                </span>
                                <span className="px-2.5 py-1 rounded-lg bg-[#F5B83D]/10 text-[#F5B83D] text-[11px] font-black">
                                    🔥 Premier 18.5k
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Level 2 — Elevated Secondary Game Cards #151A29 (NO BORDER) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {secondaryGames.map((game) => {
                        const isSelected = game.id === featuredGame.id;
                        return (
                            <button
                                key={game.name}
                                type="button"
                                onClick={() => setSelectedGameSlug(game.id || "cs2")}
                                className={`flex items-center gap-3 p-3 rounded-xl bg-[#151A29] transition-all text-left cursor-pointer ${
                                    isSelected ? "ring-1 ring-[#1687FF] shadow-sm" : "hover:bg-[#1A2032] hover:scale-[1.01]"
                                }`}
                            >
                                <img 
                                    src={game.logo} 
                                    alt={game.name} 
                                    className="w-10 h-10 rounded-xl object-cover shrink-0"
                                />
                                <div className="flex flex-col min-w-0 flex-1">
                                    <h5 className="font-bold text-text text-xs truncate">{game.name}</h5>
                                    <span className="text-[11px] font-extrabold text-[#1687FF]">{game.hours}h played</span>
                                    <span className="text-[10px] font-semibold text-text-faint truncate">{game.rank}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── ROW 3: ACHIEVEMENTS + RECENT ACTIVITY ───────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full">
                
                {/* ACHIEVEMENTS COLLECTION (5 cols) - Level 1 Surface #101421 (NO BORDER) */}
                <div className="lg:col-span-5 bg-[#101421] rounded-2xl p-5 flex flex-col gap-4 shadow-sm relative">
                    <div className="flex items-center justify-between border-b border-[#1A2032] pb-3">
                        <div className="flex items-center gap-2">
                            <span className="text-base">🏆</span>
                            <h3 className="text-xs font-black uppercase tracking-wider text-text">Achievements</h3>
                        </div>
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#151A29] text-[#1687FF]">
                            14 Unlocked
                        </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        {badges.map((b) => {
                            const rarityCfg = getBadgeRarityCfg(b.rarity);
                            return (
                                <div
                                    key={b.id}
                                    onMouseEnter={() => setHoveredBadge(b)}
                                    onMouseLeave={() => setHoveredBadge(null)}
                                    className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all cursor-pointer text-center gap-1.5 ${
                                        b.unlocked !== false
                                            ? "bg-[#151A29] hover:scale-105"
                                            : "bg-[#151A29]/40 opacity-40 grayscale"
                                    }`}
                                >
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base ${b.color}`}>
                                        <FontAwesomeIcon icon={b.icon} />
                                    </div>
                                    <span className="text-[10px] font-bold text-text leading-tight truncate w-full">
                                        {b.title}
                                    </span>
                                    <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full ${rarityCfg.bg} ${rarityCfg.color}`}>
                                        {rarityCfg.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Badge Detail Hover Box */}
                    {hoveredBadge ? (
                        <div className="p-3 rounded-xl bg-[#151A29] text-xs flex flex-col gap-1 animate-fade-in shadow-md">
                            <div className="flex items-center justify-between font-bold text-text">
                                <span className="text-[#1687FF]">{hoveredBadge.title}</span>
                                <span className="text-[10px] text-text-faint">{hoveredBadge.earnedDate || "Earned 2026"}</span>
                            </div>
                            <p className="text-[11px] text-text-muted leading-snug">{hoveredBadge.desc}</p>
                        </div>
                    ) : (
                        <span className="text-[10px] text-text-faint italic text-center pt-1">
                            Hover over any badge to inspect unlock criteria & rarity tier.
                        </span>
                    )}
                </div>

                {/* RECENT ACTIVITY (7 cols) - Level 1 Surface #101421 (NO BORDER) */}
                <div className="lg:col-span-7 bg-[#101421] rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
                    <div className="flex items-center justify-between border-b border-[#1A2032] pb-3">
                        <div className="flex items-center gap-2">
                            <span className="text-base">⚡</span>
                            <h3 className="text-xs font-black uppercase tracking-wider text-text">Recent Activity on IndieG</h3>
                        </div>
                        <span className="text-[10px] font-bold text-text-faint">Live Feed</span>
                    </div>

                    <div className="flex flex-col gap-3">
                        {activities.map((act) => (
                            <div key={act.id} className="flex items-start gap-3 p-3 rounded-xl bg-[#151A29] hover:bg-[#1A2032] transition-all">
                                <span className="text-lg leading-none shrink-0 mt-0.5">{act.icon || "🎮"}</span>
                                <div className="flex flex-col min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <h5 className="font-bold text-text text-xs leading-snug">{act.title}</h5>
                                        <span className="text-[10px] font-medium text-text-faint shrink-0">{act.timeAgo}</span>
                                    </div>
                                    {act.subtitle && (
                                        <p className="text-[11px] text-text-muted leading-normal mt-0.5">{act.subtitle}</p>
                                    )}
                                    {act.upvotes !== undefined && (
                                        <span className="text-[10px] font-extrabold text-[#20C997] mt-1">
                                            ▲ {act.upvotes} Upvotes received
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* ── ROW 4: COMMUNITIES REPUTATION + CONNECTED ACCOUNTS & GEAR ─ */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full">
                
                {/* COMMUNITIES REPUTATION (6 cols) - Level 1 Surface #101421 (NO BORDER) */}
                <div className="lg:col-span-6 bg-[#101421] rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
                    <div className="flex items-center justify-between border-b border-[#1A2032] pb-3">
                        <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faUsers} className="text-[#22D3EE] text-sm" />
                            <h3 className="text-xs font-black uppercase tracking-wider text-text">Community Reputation</h3>
                        </div>
                        <span className="text-[10px] font-bold text-text-faint">4 Joined</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {reputations.map((rep) => (
                            <div
                                key={rep.id}
                                className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#151A29] text-center gap-1.5 shadow-xs hover:scale-105 transition-all"
                            >
                                <span className="text-2xl">{rep.icon}</span>
                                <span className="text-xs font-black tracking-tight text-text truncate w-full">{rep.name}</span>
                                <span className="px-2 py-0.5 rounded-full bg-[#101421] text-[#20C997] text-[10px] font-black">
                                    {rep.tier}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CONNECTED ACCOUNTS & SETUP GEAR (6 cols) - Level 1 Surface #101421 (NO BORDER) */}
                <div className="lg:col-span-6 bg-[#101421] rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
                    <div className="flex items-center justify-between border-b border-[#1A2032] pb-3">
                        <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faShareNodes} className="text-[#1687FF] text-sm" />
                            <h3 className="text-xs font-black uppercase tracking-wider text-text">Accounts & Battlestation</h3>
                        </div>
                        {isOwnProfile && onSaveGear && (
                            <button
                                type="button"
                                onClick={() => setIsEditingGear((v) => !v)}
                                className="text-xs font-bold text-[#1687FF] hover:underline flex items-center gap-1 cursor-pointer"
                            >
                                <FontAwesomeIcon icon={faPen} className="text-[10px]" />
                                <span>{isEditingGear ? "Xong" : "Sửa Setup"}</span>
                            </button>
                        )}
                    </div>

                    {/* Connected Accounts Badges */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {PLATFORMS.map((p) => (
                            <div key={p.label} className={`flex items-center gap-2 p-2.5 rounded-xl ${p.bg} ${p.text}`}>
                                <span className="text-sm leading-none">{p.icon}</span>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-[11px] font-black truncate">{p.label}</span>
                                    <span className="text-[9px] font-semibold opacity-70 truncate">{p.sub}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Quick Gear Summary */}
                    {isEditingGear ? (
                        <div className="flex flex-col gap-2 pt-2 animate-fade-in">
                            {GEAR_CATEGORIES.slice(0, 4).map((cat) => (
                                <div key={cat.value} className="flex flex-col gap-1">
                                    <label className="text-[10px] font-extrabold text-text-faint">{cat.label}</label>
                                    <input
                                        type="text"
                                        value={gearData[cat.value] || ""}
                                        onChange={(e) => onGearChange?.(cat.value, e.target.value)}
                                        className="px-3 py-1.5 rounded-xl bg-[#151A29] text-text text-xs focus:outline-none ring-1 ring-[#1687FF]"
                                    />
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => { setIsEditingGear(false); onSaveGear?.(); }}
                                className="mt-2 py-1.5 rounded-xl bg-[#1687FF] hover:bg-[#3698FF] text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                            >
                                <FontAwesomeIcon icon={faCheck} />
                                <span>Lưu cấu hình</span>
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-2 pt-1">
                            {filledGear.slice(0, 4).map((cat) => (
                                <div key={cat.value} className="flex items-center gap-2 p-2 rounded-xl bg-[#151A29] text-xs">
                                    <FontAwesomeIcon icon={cat.icon} className={`${cat.color} shrink-0 text-xs`} />
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-[9px] font-extrabold uppercase text-text-faint">{cat.value}</span>
                                        <span className="text-[11px] font-bold text-text truncate">{gearData[cat.value]}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>

        </div>
    );
};

const DnaBar = ({ label, percent, hex }: { label: string; percent: number; hex: string }) => (
    <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-text-muted">{label}</span>
            <span className="text-text font-black">{percent}%</span>
        </div>
        <div className="h-2 w-full bg-[#151A29] rounded-full overflow-hidden">
            <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${percent}%`, backgroundColor: hex }}
            />
        </div>
    </div>
);
