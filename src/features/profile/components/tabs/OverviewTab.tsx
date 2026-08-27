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
    { label: "Steam", sub: "Verified", bg: "bg-[#13161C]", text: "text-[#1688E8]", icon: "🎮" },
    { label: "Riot Games", sub: "VN2 Server", bg: "bg-[#13161C]", text: "text-[#E05252]", icon: "🔥" },
    { label: "Xbox Live", sub: "Connected", bg: "bg-[#13161C]", text: "text-[#24C58A]", icon: "🎯" },
    { label: "Discord", sub: "Linked", bg: "bg-[#13161C]", text: "text-[#9A9DA3]", icon: "🎧" },
];

export const OverviewTab = ({
    identity, games, badges, reputations, activities, gearData, isOwnProfile, onGearChange, onSaveGear,
}: OverviewTabProps) => {
    const [hoveredBadge, setHoveredBadge] = useState<Badge | null>(null);
    const [selectedGameSlug, setSelectedGameSlug] = useState<string>("cs2");
    const [isEditingGear, setIsEditingGear] = useState(false);

    const featuredGame = games.find((g) => g.id === selectedGameSlug || g.isFeatured) || games[0];
    const secondaryGames = games;
    const filledGear = GEAR_CATEGORIES.filter((cat) => gearData[cat.value]?.trim());

    // Achievement tier rarity helper
    const getBadgeRarityCfg = (rarity?: string) => {
        switch (rarity?.toLowerCase()) {
            case "legendary": return { color: "text-[#E5A93D]", bg: "bg-[#E5A93D]/15", label: "Legendary" };
            case "epic":      return { color: "text-[#F0F1F2]", bg: "bg-[#252C3A]", label: "Epic" };
            case "rare":      return { color: "text-[#1688E8]", bg: "bg-[#1688E8]/15", label: "Rare" };
            default:          return { color: "text-[#9A9DA3]", bg: "bg-[#13161C]", label: "Common" };
        }
    };

    return (
        <div className="flex flex-col gap-5 w-full animate-fade-in">

            {/* ── ROW 1: PLAYER IDENTITY + GAMING DNA ─────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full">
                
                {/* PLAYER IDENTITY (5 cols) */}
                <div className="lg:col-span-5 bg-[#0A0C0E] rounded-[14px] p-5 flex flex-col gap-4 shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between pb-1.5">
                        <div className="flex items-center gap-2">
                            <span className="text-sm">🎯</span>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-[#F0F1F2]">Player Identity</h3>
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-[4px] bg-[#24C58A]/15 text-[#24C58A] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#24C58A]" />
                            <span>Online</span>
                        </span>
                    </div>

                    {identity.bio && (
                        <div className="bg-[#13161C] p-3 rounded-[8px]">
                            <p className="text-xs text-[#9A9DA3] italic leading-relaxed">
                                "{identity.bio}"
                            </p>
                        </div>
                    )}

                    {/* Roles / Archetypes */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#F0F1F2]">
                            <span className="text-[#E5A93D]">🎯</span> FPS Veteran
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-[#F0F1F2]">
                            <span className="text-[#1688E8]">🏕️</span> Survival Architect
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-[#F0F1F2]">
                            <span className="text-[#9A9DA3]">🧠</span> Tactical Competitor
                        </div>
                    </div>

                    {/* Main Roles */}
                    <div className="flex flex-col gap-1.5 pt-1">
                        <span className="text-[10px] font-semibold uppercase text-[#8A8F98] tracking-wider">Main Roles</span>
                        <div className="flex flex-wrap items-center gap-1.5">
                            {["Rifler", "Support", "IGL"].map((role) => (
                                <span key={role} className="px-2.5 py-1 rounded-[6px] bg-[#13161C] text-[#F0F1F2] font-semibold text-xs">
                                    {role}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Playstyle & Preference */}
                    <div className="grid grid-cols-2 gap-3 pt-2 bg-[#13161C] p-3 rounded-[8px] text-xs">
                        <div>
                            <span className="text-[10px] font-semibold uppercase text-[#8A8F98] tracking-wider block mb-0.5">Playstyle</span>
                            <span className="font-medium text-[#F0F1F2]">Aggressive · Tactical</span>
                        </div>
                        <div>
                            <span className="text-[10px] font-semibold uppercase text-[#8A8F98] tracking-wider block mb-0.5">Usually Plays</span>
                            <span className="font-medium text-[#F0F1F2]">FPS · Survival · RPG</span>
                        </div>
                    </div>
                </div>

                {/* GAMING DNA (7 cols) - Mature Monochrome Progress Bars */}
                <div className="lg:col-span-7 bg-[#0A0C0E] rounded-[14px] p-5 flex flex-col gap-4 shadow-sm">
                    <div className="flex items-center justify-between pb-1.5">
                        <div className="flex items-center gap-2">
                            <span className="text-sm">🧬</span>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-[#F0F1F2]">Gaming DNA</h3>
                        </div>
                        <span className="text-[10px] font-medium text-[#8A8F98]">Stats Breakdown</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Genre Mastery */}
                        <div className="flex flex-col gap-3 bg-[#13161C] p-4 rounded-[10px]">
                            <span className="text-[10px] font-semibold uppercase text-[#8A8F98] tracking-wider">Genre Mastery</span>
                            
                            <DnaBar label="FPS" percent={92} fillHex="#1688E8" isPrimary />
                            <DnaBar label="SURVIVAL" percent={78} fillHex="#B8BCC2" />
                            <DnaBar label="RPG" percent={61} fillHex="#9A9DA3" />
                            <DnaBar label="STRATEGY" percent={42} fillHex="#666A71" />
                        </div>

                        {/* Play Dynamics */}
                        <div className="flex flex-col gap-3 bg-[#13161C] p-4 rounded-[10px]">
                            <span className="text-[10px] font-semibold uppercase text-[#8A8F98] tracking-wider">Play Dynamics</span>

                            <DnaBar label="Competitive" percent={81} fillHex="#1688E8" isPrimary />
                            <DnaBar label="Co-op" percent={76} fillHex="#B8BCC2" />
                            <DnaBar label="Solo" percent={53} fillHex="#9A9DA3" />
                            <DnaBar label="Casual" percent={40} fillHex="#666A71" />
                        </div>
                    </div>
                </div>

            </div>

            {/* ── ROW 2: GAME MASTERY (HERO SECTION) ───────────────────────── */}
            <div className="w-full bg-[#0A0C0E] rounded-[14px] p-5 sm:p-6 shadow-sm flex flex-col gap-5">
                <div className="flex items-center justify-between pb-1">
                    <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faCrown} className="text-[#E5A93D] text-xs" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#F0F1F2]">Game Mastery</h3>
                    </div>
                    <span className="text-xs font-medium text-[#1688E8]">Featured Game</span>
                </div>

                {/* Featured Hero Game Container */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center bg-[#13161C] rounded-[10px] p-4 sm:p-5 relative overflow-hidden transition-all">
                    
                    <div className="lg:col-span-4 flex items-center gap-4 relative z-10">
                        <img
                            src={featuredGame.logo}
                            alt={featuredGame.name}
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-[8px] object-cover shrink-0"
                        />
                        <div className="flex flex-col gap-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h4 className="font-bold text-[#F0F1F2] text-base truncate">{featuredGame.name}</h4>
                                <span className="px-2 py-0.5 rounded-[4px] text-[10px] font-bold text-[#1688E8] bg-[#1688E8]/15">
                                    PRIMARY
                                </span>
                            </div>
                            <span className="text-xs font-bold text-[#F0F1F2]">
                                {featuredGame.hours} Hours Played
                            </span>
                            <span className="text-xs font-medium text-[#9A9DA3]">
                                Premier {featuredGame.ratingScore || "18,500"}
                            </span>
                        </div>
                    </div>

                    {/* Progress & Skill Ratings */}
                    <div className="lg:col-span-8 flex flex-col gap-3 relative z-10">
                        <div className="flex flex-wrap items-center justify-between text-xs font-semibold text-[#F0F1F2]">
                            <span className="text-[#9A9DA3]">
                                Mastery Progress ({featuredGame.achievements}/{featuredGame.totalAchievements} Achievements)
                            </span>
                            <span className="text-[#24C58A] font-bold px-2 py-0.5 rounded-[4px] bg-[#24C58A]/15 text-[11px]">
                                {featuredGame.keyStat || "68.4% WINRATE"}
                            </span>
                        </div>

                        {/* Progress Accent Bar */}
                        <div className="h-1.5 w-full bg-[#1A1E26] rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[#1688E8] rounded-full transition-all duration-300"
                                style={{ 
                                    width: `${Math.round((featuredGame.achievements / featuredGame.totalAchievements) * 100)}%`
                                }}
                            />
                        </div>

                        {/* Skill Stars */}
                        <div className="flex flex-wrap items-center justify-between gap-4 pt-1 text-xs">
                            <div className="flex flex-wrap items-center gap-4">
                                {featuredGame.skills?.map((s) => (
                                    <div key={s.name} className="flex items-center gap-1.5">
                                        <span className="font-medium text-[#9A9DA3]">{s.name}</span>
                                        <div className="flex items-center gap-0.5 text-[#E5A93D] text-xs">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <FontAwesomeIcon
                                                    key={star}
                                                    icon={star <= s.stars ? faStarSolid : faStarRegular}
                                                    className={star <= s.stars ? "text-[#E5A93D]" : "text-[#666A71]/40"}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center gap-2 ml-auto">
                                <span className="px-2.5 py-1 rounded-[6px] bg-[#181C24] text-[#F0F1F2] text-[11px] font-semibold">
                                    🏆 Clutch God
                                </span>
                                <span className="px-2.5 py-1 rounded-[6px] bg-[#181C24] text-[#F0F1F2] text-[11px] font-semibold">
                                    🔥 Premier 18.5k
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Secondary Game Cards - Monochrome + Background Contrast */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {secondaryGames.map((game) => {
                        const isSelected = (game.id === selectedGameSlug) || (game.name === featuredGame.name);
                        return (
                            <button
                                key={game.name}
                                type="button"
                                onClick={() => setSelectedGameSlug(game.id || "cs2")}
                                className={`relative flex items-center gap-3 p-3 rounded-[10px] text-left transition-all cursor-pointer ${
                                    isSelected
                                        ? "bg-[#192230] shadow-sm"
                                        : "bg-[#13161C] hover:bg-[#1B1F28]"
                                }`}
                            >
                                {/* Subtle 3px Left Indicator when selected */}
                                {isSelected && (
                                    <div className="absolute left-0 top-2 bottom-2 w-[3px] bg-[#1688E8] rounded-r-full" />
                                )}

                                <img 
                                    src={game.logo} 
                                    alt={game.name} 
                                    className="w-11 h-11 rounded-[6px] object-cover shrink-0"
                                />
                                <div className="flex flex-col min-w-0 flex-1 pl-1">
                                    <h5 className="font-bold text-xs text-[#F0F1F2] truncate">
                                        {game.name}
                                    </h5>
                                    <span className="text-[11px] font-semibold text-[#9A9DA3]">
                                        {game.hours}h played
                                    </span>
                                    <span className="text-[10px] text-[#8A8F98] truncate">
                                        {game.rank}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── ROW 3: ACHIEVEMENTS + RECENT ACTIVITY ───────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full">
                
                {/* ACHIEVEMENTS COLLECTION (5 cols) */}
                <div className="lg:col-span-5 bg-[#0A0C0E] rounded-[14px] p-5 flex flex-col gap-4 shadow-sm relative">
                    <div className="flex items-center justify-between pb-1">
                        <div className="flex items-center gap-2">
                            <span className="text-sm">🏆</span>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-[#F0F1F2]">Achievements</h3>
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-[4px] bg-[#13161C] text-[#9A9DA3]">
                            14 Unlocked
                        </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5">
                        {badges.map((b) => {
                            const rarityCfg = getBadgeRarityCfg(b.rarity);
                            return (
                                <div
                                    key={b.id}
                                    onMouseEnter={() => setHoveredBadge(b)}
                                    onMouseLeave={() => setHoveredBadge(null)}
                                    className={`flex flex-col items-center justify-center p-3 rounded-[8px] transition-all cursor-pointer text-center gap-1.5 ${
                                        b.unlocked !== false
                                            ? "bg-[#13161C] hover:bg-[#1B1F28]"
                                            : "bg-[#0E1014] opacity-35 grayscale"
                                    }`}
                                >
                                    <div className="w-8 h-8 rounded-[6px] bg-[#181C24] flex items-center justify-center text-sm text-[#E5A93D]">
                                        <FontAwesomeIcon icon={b.icon} />
                                    </div>
                                    <span className="text-[10px] font-bold text-[#F0F1F2] leading-tight truncate w-full">
                                        {b.title}
                                    </span>
                                    <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-[4px] ${rarityCfg.bg} ${rarityCfg.color}`}>
                                        {rarityCfg.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Badge Detail Hover Box */}
                    {hoveredBadge ? (
                        <div className="p-3 rounded-[8px] bg-[#13161C] text-xs flex flex-col gap-1 animate-fade-in shadow-md">
                            <div className="flex items-center justify-between font-bold text-[#F0F1F2]">
                                <span className="text-[#1688E8]">{hoveredBadge.title}</span>
                                <span className="text-[10px] text-[#8A8F98]">{hoveredBadge.earnedDate || "Earned 2026"}</span>
                            </div>
                            <p className="text-[11px] text-[#9A9DA3] leading-snug">{hoveredBadge.desc}</p>
                        </div>
                    ) : (
                        <span className="text-[10px] text-[#8A8F98] italic text-center pt-0.5">
                            Hover over any badge to inspect criteria.
                        </span>
                    )}
                </div>

                {/* RECENT ACTIVITY (7 cols) */}
                <div className="lg:col-span-7 bg-[#0A0C0E] rounded-[14px] p-5 flex flex-col gap-4 shadow-sm">
                    <div className="flex items-center justify-between pb-1">
                        <div className="flex items-center gap-2">
                            <span className="text-sm">⚡</span>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-[#F0F1F2]">Recent Activity</h3>
                        </div>
                        <span className="text-[10px] font-medium text-[#8A8F98]">Live Feed</span>
                    </div>

                    <div className="flex flex-col gap-2.5">
                        {activities.map((act) => (
                            <div key={act.id} className="flex items-start gap-3 p-3 rounded-[8px] bg-[#13161C] hover:bg-[#1B1F28] transition-all">
                                <span className="text-base leading-none shrink-0 mt-0.5">{act.icon || "🎮"}</span>
                                <div className="flex flex-col min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <h5 className="font-semibold text-[#F0F1F2] text-xs leading-snug">{act.title}</h5>
                                        <span className="text-[10px] text-[#8A8F98] shrink-0">{act.timeAgo}</span>
                                    </div>
                                    {act.subtitle && (
                                        <p className="text-[11px] text-[#9A9DA3] leading-normal mt-0.5">{act.subtitle}</p>
                                    )}
                                    {act.upvotes !== undefined && (
                                        <span className="text-[10px] font-bold text-[#24C58A] mt-1">
                                            ▲ +{act.upvotes} Upvotes
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
                
                {/* COMMUNITIES REPUTATION (6 cols) */}
                <div className="lg:col-span-6 bg-[#0A0C0E] rounded-[14px] p-5 flex flex-col gap-4 shadow-sm">
                    <div className="flex items-center justify-between pb-1">
                        <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faUsers} className="text-[#1688E8] text-xs" />
                            <h3 className="text-xs font-bold uppercase tracking-wider text-[#F0F1F2]">Community Reputation</h3>
                        </div>
                        <span className="text-[10px] font-medium text-[#8A8F98]">4 Joined</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {reputations.map((rep) => (
                            <div
                                key={rep.id}
                                className="flex flex-col items-center justify-center p-3 rounded-[8px] bg-[#13161C] text-center gap-1.5 hover:bg-[#1B1F28] transition-all"
                            >
                                <span className="text-2xl">{rep.icon}</span>
                                <span className="text-xs font-bold text-[#F0F1F2] truncate w-full">{rep.name}</span>
                                <span className="px-2 py-0.5 rounded-[4px] bg-[#24C58A]/15 text-[#24C58A] text-[10px] font-bold">
                                    {rep.tier}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CONNECTED ACCOUNTS & SETUP GEAR (6 cols) */}
                <div className="lg:col-span-6 bg-[#0A0C0E] rounded-[14px] p-5 flex flex-col gap-4 shadow-sm">
                    <div className="flex items-center justify-between pb-1">
                        <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faShareNodes} className="text-[#1688E8] text-xs" />
                            <h3 className="text-xs font-bold uppercase tracking-wider text-[#F0F1F2]">Accounts & Battlestation</h3>
                        </div>
                        {isOwnProfile && onSaveGear && (
                            <button
                                type="button"
                                onClick={() => setIsEditingGear((v) => !v)}
                                className="text-xs font-semibold text-[#1688E8] hover:underline flex items-center gap-1 cursor-pointer"
                            >
                                <FontAwesomeIcon icon={faPen} className="text-[10px]" />
                                <span>{isEditingGear ? "Xong" : "Sửa Setup"}</span>
                            </button>
                        )}
                    </div>

                    {/* Connected Accounts Badges */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {PLATFORMS.map((p) => (
                            <div key={p.label} className={`flex items-center gap-2 p-2.5 rounded-[8px] ${p.bg} ${p.text}`}>
                                <span className="text-sm leading-none">{p.icon}</span>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-[11px] font-bold text-[#F0F1F2] truncate">{p.label}</span>
                                    <span className="text-[9px] font-medium opacity-70 truncate">{p.sub}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Quick Gear Summary */}
                    {isEditingGear ? (
                        <div className="flex flex-col gap-2 pt-1 animate-fade-in">
                            {GEAR_CATEGORIES.slice(0, 4).map((cat) => (
                                <div key={cat.value} className="flex flex-col gap-1">
                                    <label className="text-[10px] font-semibold text-[#8A8F98]">{cat.label}</label>
                                    <input
                                        type="text"
                                        value={gearData[cat.value] || ""}
                                        onChange={(e) => onGearChange?.(cat.value, e.target.value)}
                                        className="px-3 py-1.5 rounded-[6px] bg-[#13161C] text-[#F0F1F2] text-xs focus:outline-none focus:bg-[#1B1F28]"
                                    />
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => { setIsEditingGear(false); onSaveGear?.(); }}
                                className="mt-1 py-1.5 rounded-[6px] bg-[#1688E8] hover:bg-[#1478D0] text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                            >
                                <FontAwesomeIcon icon={faCheck} />
                                <span>Lưu cấu hình</span>
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-2 pt-1">
                            {filledGear.slice(0, 4).map((cat) => (
                                <div key={cat.value} className="flex items-center gap-2 p-2 rounded-[6px] bg-[#13161C] text-xs">
                                    <FontAwesomeIcon icon={cat.icon} className={`${cat.color} shrink-0 text-xs`} />
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-[9px] font-semibold uppercase text-[#8A8F98]">{cat.value}</span>
                                        <span className="text-[11px] font-medium text-[#F0F1F2] truncate">{gearData[cat.value]}</span>
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

const DnaBar = ({ label, percent, fillHex, isPrimary = false }: { label: string; percent: number; fillHex: string; isPrimary?: boolean }) => (
    <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between text-xs">
            <span className={`font-semibold ${isPrimary ? "text-[#F0F1F2]" : "text-[#9A9DA3]"}`}>{label}</span>
            <span className={`font-mono text-xs ${isPrimary ? "text-[#1688E8] font-bold" : "text-[#9A9DA3]"}`}>{percent}%</span>
        </div>
        <div className="h-1.5 w-full bg-[#1A1E26] rounded-full overflow-hidden">
            <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${percent}%`, backgroundColor: fillHex }}
            />
        </div>
    </div>
);
