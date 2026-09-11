import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faStar as faStarSolid, faCrown, faUsers, faEye, faEyeSlash, faDesktop, faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";
import type { LibraryGame, ProfileIdentity, CommunityReputation, RecentActivityItem } from "../../types";
import { GEAR_CATEGORIES } from "../../constants";
import type { TranslateFn } from "@/shared/hooks/useTranslate";
import { BioEditor, BioRenderer, isBioEmpty, parseBio } from "../../bio";

interface OverviewTabProps {
    identity: ProfileIdentity;
    games: LibraryGame[];
    reputations: CommunityReputation[];
    activities: RecentActivityItem[];
    gearData: Record<string, string>;
    isOwnProfile: boolean;
    isCustomizeMode?: boolean;
    hiddenSections?: Record<string, boolean>;
    onToggleHideSection?: (sectionId: string) => void;
    onCloseCustomizeMode?: () => void;
    onGearChange?: (key: string, value: string) => void;
    onSaveGear?: () => void;
    onIdentityChange?: (next: Partial<ProfileIdentity>) => void;
    onSaveIdentity?: () => void;
    onOpenBadgeSelector?: () => void;
    t?: TranslateFn;
}

const DEFAULT_FEATURED_GAMES: LibraryGame[] = [
    {
        id: "elden-ring",
        name: "Elden Ring",
        logo: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=240&auto=format&fit=crop&q=80",
        hours: 287,
        lastPlayed: "Hôm qua",
        achievements: 38,
        totalAchievements: 42,
        keyStat: "90% COMPLETE",
        rank: "Soulslike · RPG",
        ratingScore: "NG+3",
        isFeatured: true,
        skills: [
            { name: "Parry & Dodge", stars: 5 },
            { name: "Boss Mastery", stars: 5 },
        ]
    },
    {
        id: "cs2",
        name: "Counter-Strike 2",
        logo: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=240&auto=format&fit=crop&q=80",
        hours: 1420,
        lastPlayed: "2 giờ trước",
        achievements: 25,
        totalAchievements: 25,
        keyStat: "68.4% WINRATE",
        rank: "Premier 18,500",
        ratingScore: "18,500",
        isFeatured: false,
        skills: [
            { name: "Aim Precision", stars: 5 },
            { name: "Game Sense", stars: 4 },
        ]
    }
];

export const OverviewTab = ({
    identity,
    games = [],
    reputations = [],
    activities = [],
    gearData = {},
    isOwnProfile,
    isCustomizeMode = false,
    hiddenSections = {},
    onToggleHideSection,
    onGearChange,
    onIdentityChange,
}: OverviewTabProps) => {
    // Fallback to default featured games if user has not populated library games
    const activeGamesList = (games && games.length > 0) ? games : DEFAULT_FEATURED_GAMES;
    
    const [selectedGameSlug, setSelectedGameSlug] = useState<string>(activeGamesList[0]?.id ? String(activeGamesList[0].id) : "elden-ring");

    const featuredGame = activeGamesList.find((g) => String(g?.id) === selectedGameSlug || g?.isFeatured) || activeGamesList[0];
    const filledGear = GEAR_CATEGORIES.filter((cat) => gearData[cat.value]?.trim());

    const isSectionHidden = (sectionId: string) => !!hiddenSections[sectionId];
    const isSectionVisible = (sectionId: string) => isCustomizeMode || !isSectionHidden(sectionId);

    const cardCustomStyle = (sectionId: string) =>
        isCustomizeMode && isSectionHidden(sectionId)
            ? "opacity-50 ring-1 ring-dashed ring-rose-500/50 bg-rose-950/10"
            : "";

    const renderToggleBtn = (sectionId: string) => {
        if (!isCustomizeMode || !onToggleHideSection) return null;
        const hidden = isSectionHidden(sectionId);
        return (
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    onToggleHideSection(sectionId);
                }}
                className={`w-7 h-7 rounded-[6px] flex items-center justify-center cursor-pointer transition-all ${
                    hidden
                        ? "bg-rose-500/20 text-rose-400 hover:bg-rose-500/30"
                        : "bg-[#1688E8]/20 text-[#1688E8] hover:bg-[#1688E8]/30"
                }`}
                title={hidden ? "Đã ẩn (Click để hiện)" : "Đang hiện (Click để ẩn)"}
            >
                <FontAwesomeIcon icon={hidden ? faEyeSlash : faEye} className="text-xs" />
            </button>
        );
    };

    // Visibility flags
    const showPlayerIdentity = isSectionVisible("playerIdentity");
    const showGameMastery = isSectionVisible("gameMastery");
    const showRecentActivity = isSectionVisible("recentActivity");
    const showCommunityReputation = isSectionVisible("communityReputation");
    const showConnectedAccounts = isSectionVisible("connectedAccounts");

    const parsedBioDoc = parseBio(identity.bio);
    const isBioBlank = isBioEmpty(parsedBioDoc);

    return (
        <div className="flex flex-col gap-6 w-full animate-fade-in">

            {/* ── SECTION 1: PLAYER IDENTITY (Strongest Anchor, Natural Composition) ── */}
            {showPlayerIdentity && (
                <div className={`w-full bg-[#0A0C0E] rounded-[14px] p-5 sm:p-6 shadow-xs relative overflow-visible z-10 transition-all ${cardCustomStyle("playerIdentity")}`}>
                    <div className="flex items-center justify-between pb-2 border-b border-[#181C24]/60 mb-3">
                        <div className="flex items-center gap-2">
                            <span className="text-sm">🎯</span>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-[#8A8F98]">Player Identity</h3>
                        </div>
                        <div className="flex items-center gap-2">
                            {renderToggleBtn("playerIdentity")}
                        </div>
                    </div>

                    {/* Inline Bio Editing vs Natural Character Sheet Composition */}
                    {isCustomizeMode ? (
                        <div className="pt-1">
                            <BioEditor
                                value={identity.bio}
                                onChange={(serialized) => onIdentityChange?.({ bio: serialized })}
                            />
                        </div>
                    ) : (
                        <div className="py-2 px-1">
                            {isBioBlank ? (
                                <div className="py-4 px-3 flex flex-col items-center justify-center text-center gap-1.5">
                                    <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#1688E8]">
                                        {identity.name || "Gamer"}
                                    </span>
                                    <p className="text-xs text-[#8A8F98] italic">
                                        Chưa thiết lập mô tả tiểu sử character.
                                    </p>
                                    {isOwnProfile && (
                                        <p className="text-[11px] text-[#666A71]">
                                            Bấm "Chỉnh sửa hồ sơ" để viết mô tả tiểu sử cho nhân vật.
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <BioRenderer bio={identity.bio} />
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* ── SECTION 2: GAME MASTERY (Visual Cards with Game Artwork) ────────── */}
            {showGameMastery && (
                <div className={`w-full bg-[#0A0C0E] rounded-[14px] p-5 sm:p-6 shadow-xs flex flex-col gap-4 transition-all ${cardCustomStyle("gameMastery")}`}>
                    <div className="flex items-center justify-between pb-2 border-b border-[#181C24]/60">
                        <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faCrown} className="text-[#E5A93D] text-xs" />
                            <h3 className="text-xs font-bold uppercase tracking-wider text-[#F0F1F2]">Game Mastery</h3>
                        </div>
                        <div className="flex items-center gap-2">
                            {renderToggleBtn("gameMastery")}
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#1688E8] bg-[#1688E8]/10 px-2 py-0.5 rounded-[4px]">
                                Featured Game
                            </span>
                        </div>
                    </div>

                    {/* Featured Game Card */}
                    {featuredGame ? (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center bg-[#13161C] rounded-[12px] p-4 sm:p-5 border border-[#1A1F2A]/60 relative overflow-hidden transition-all">
                            
                            {/* Artwork & Title Column */}
                            <div className="lg:col-span-5 flex items-center gap-4 relative z-10">
                                <img
                                    src={featuredGame.logo || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=240&auto=format&fit=crop&q=80"}
                                    alt={featuredGame.name || "Game"}
                                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-[10px] object-cover shrink-0 shadow-md border border-[#222834]/60"
                                />
                                <div className="flex flex-col gap-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h4 className="font-extrabold text-[#F0F1F2] text-base sm:text-lg truncate leading-tight">
                                            {featuredGame.name || "Featured Game"}
                                        </h4>
                                        <span className="px-2 py-0.5 rounded-[4px] text-[10px] font-bold text-[#1688E8] bg-[#1688E8]/15 border border-[#1688E8]/30">
                                            PRIMARY
                                        </span>
                                    </div>
                                    <span className="text-xs font-bold text-[#F0F1F2]">
                                        {featuredGame.hours || 0} Hours Played
                                    </span>
                                    <span className="text-xs font-medium text-[#8A8F98]">
                                        {featuredGame.rank || "Competitive"} · {featuredGame.ratingScore || "Top Tier"}
                                    </span>
                                </div>
                            </div>

                            {/* Stats & Progress Column */}
                            <div className="lg:col-span-7 flex flex-col gap-3 relative z-10">
                                <div className="flex flex-wrap items-center justify-between text-xs font-semibold text-[#F0F1F2] gap-2">
                                    <span className="text-[#8A8F98] text-[11px]">
                                        Achievement Progress ({featuredGame.achievements || 0}/{featuredGame.totalAchievements || 100})
                                    </span>
                                    <span className="text-[#24C58A] font-bold px-2 py-0.5 rounded-[4px] bg-[#24C58A]/15 text-[10px] tracking-wide">
                                        {featuredGame.keyStat || "MASTERED"}
                                    </span>
                                </div>

                                {/* Progress Accent Bar */}
                                <div className="h-1.5 w-full bg-[#1A1E26] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-[#1688E8] rounded-full transition-all duration-300"
                                        style={{ 
                                            width: `${Math.round(((featuredGame.achievements || 0) / Math.max(1, (featuredGame.totalAchievements || 1))) * 100)}%`
                                        }}
                                    />
                                </div>

                                {/* Skill Stars */}
                                {featuredGame.skills && featuredGame.skills.length > 0 && (
                                    <div className="flex flex-wrap items-center gap-4 pt-1 text-xs">
                                        {featuredGame.skills.map((s) => (
                                            <div key={s.name} className="flex items-center gap-1.5">
                                                <span className="font-medium text-[#8A8F98] text-[11px]">{s.name}</span>
                                                <div className="flex items-center gap-0.5 text-[#E5A93D] text-[10px]">
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
                                )}
                            </div>
                        </div>
                    ) : (
                        /* Intentional Compact Empty State */
                        <div className="p-4 rounded-[10px] border border-dashed border-[#222834] bg-[#13161C] text-center flex flex-col items-center justify-center gap-1">
                            <span className="text-xs font-bold text-[#1688E8] uppercase tracking-wider flex items-center gap-1">
                                <FontAwesomeIcon icon={faPlus} className="text-[10px]" /> FEATURE A GAME
                            </span>
                            <span className="text-xs text-[#8A8F98]">Showcase your current game and statistics</span>
                        </div>
                    )}

                    {/* Secondary Game Selector Tiles */}
                    {activeGamesList.length > 1 && (
                        <div className="flex flex-col gap-2 pt-1">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                                {activeGamesList.map((game) => {
                                    const isSelected = String(game.id) === selectedGameSlug || game.name === featuredGame?.name;
                                    return (
                                        <button
                                            key={game.name}
                                            type="button"
                                            onClick={() => setSelectedGameSlug(String(game.id))}
                                            className={`relative flex items-center gap-3 p-2.5 rounded-[8px] text-left transition-all cursor-pointer ${
                                                isSelected
                                                    ? "bg-[#192230] border border-[#1688E8]/50 shadow-xs"
                                                    : "bg-[#13161C] hover:bg-[#1B1F28] border border-transparent"
                                            }`}
                                        >
                                            <img 
                                                src={game.logo || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=120&auto=format&fit=crop&q=80"} 
                                                alt={game.name || "Game"} 
                                                className="w-10 h-10 rounded-[6px] object-cover shrink-0" 
                                            />
                                            <div className="flex flex-col min-w-0 flex-1">
                                                <h5 className="font-bold text-xs text-[#F0F1F2] truncate">
                                                    {game.name}
                                                </h5>
                                                <span className="text-[10px] text-[#8A8F98]">
                                                    {game.hours}h played
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── SECTION 3: RECENT ACTIVITY (Medium Weight Feed) ────────────────── */}
            {showRecentActivity && (
                <div className={`w-full bg-[#0A0C0E] rounded-[14px] p-5 sm:p-6 shadow-xs flex flex-col gap-3 transition-all ${cardCustomStyle("recentActivity")}`}>
                    <div className="flex items-center justify-between pb-2 border-b border-[#181C24]/60">
                        <div className="flex items-center gap-2">
                            <span className="text-sm">⚡</span>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-[#F0F1F2]">Recent Activity</h3>
                        </div>
                        <div className="flex items-center gap-2">
                            {renderToggleBtn("recentActivity")}
                            <span className="text-[10px] font-medium text-[#8A8F98]">Live Feed</span>
                        </div>
                    </div>

                    {activities.length === 0 ? (
                        <div className="py-3 px-4 rounded-[8px] bg-[#13161C] text-[#8A8F98] text-xs text-center border border-[#1A1F2A]/40">
                            <span>Chưa có hoạt động gần đây.</span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                            {activities.map((act) => (
                                <div key={act.id} className="flex items-start gap-3 p-2.5 rounded-[8px] bg-[#13161C] hover:bg-[#1B1F28] transition-all border border-[#1A1F2A]/40">
                                    <span className="text-sm shrink-0 mt-0.5">{act.icon || "🎮"}</span>
                                    <div className="flex flex-col min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <h5 className="font-bold text-[#F0F1F2] text-xs leading-snug">{act.title}</h5>
                                            <span className="text-[10px] text-[#8A8F98] shrink-0">{act.timeAgo}</span>
                                        </div>
                                        {act.subtitle && (
                                            <p className="text-[11px] text-[#8A8F98] leading-normal mt-0.5">{act.subtitle}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── SECTION 4: COMMUNITY REPUTATION + BATTLESTATION LOADOUT (Split Grid) ─ */}
            {(showCommunityReputation || showConnectedAccounts) && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
                    
                    {/* COMMUNITY REPUTATION */}
                    {showCommunityReputation && (
                        <div className={`${showConnectedAccounts ? "lg:col-span-6" : "lg:col-span-12"} bg-[#0A0C0E] rounded-[14px] p-5 sm:p-6 shadow-xs flex flex-col gap-4 transition-all ${cardCustomStyle("communityReputation")}`}>
                            <div className="flex items-center justify-between pb-2 border-b border-[#181C24]/60">
                                <div className="flex items-center gap-2">
                                    <FontAwesomeIcon icon={faUsers} className="text-[#1688E8] text-xs" />
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#F0F1F2]">Community Reputation</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    {renderToggleBtn("communityReputation")}
                                    <span className="text-[10px] font-medium text-[#8A8F98]">{reputations.length} Joined</span>
                                </div>
                            </div>

                            {reputations.length === 0 ? (
                                <div className="py-4 px-4 rounded-[8px] bg-[#13161C] text-[#8A8F98] text-xs text-center border border-[#1A1F2A]/40">
                                    <span>Chưa tham gia cộng đồng nào.</span>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-2">
                                    {reputations.map((rep) => (
                                        <div
                                            key={rep.id}
                                            className="flex items-center gap-2.5 p-2.5 rounded-[8px] bg-[#13161C] border border-[#1A1F2A]/40 hover:bg-[#1B1F28] transition-all"
                                        >
                                            <span className="text-xl shrink-0">{rep.icon}</span>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-xs font-bold text-[#F0F1F2] truncate">{rep.name}</span>
                                                <span className="text-[10px] font-bold text-[#24C58A]">{rep.tier}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* BATTLESTATION LOADOUT */}
                    {showConnectedAccounts && (
                        <div className={`${showCommunityReputation ? "lg:col-span-6" : "lg:col-span-12"} bg-[#0A0C0E] rounded-[14px] p-5 sm:p-6 shadow-xs flex flex-col gap-4 transition-all ${cardCustomStyle("connectedAccounts")}`}>
                            <div className="flex items-center justify-between pb-2 border-b border-[#181C24]/60">
                                <div className="flex items-center gap-2">
                                    <FontAwesomeIcon icon={faDesktop} className="text-[#1688E8] text-xs" />
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#F0F1F2]">Battlestation Loadout</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    {renderToggleBtn("connectedAccounts")}
                                </div>
                            </div>

                            {/* Public View: Gaming Hardware Loadout vs Edit Mode: Form */}
                            {isCustomizeMode ? (
                                <div className="flex flex-col gap-3 p-3 bg-[#13161C] rounded-[10px] max-h-[300px] overflow-y-auto">
                                    <span className="text-[10px] font-mono font-bold text-[#1688E8] uppercase tracking-wider">
                                        Cập nhật thông tin thiết bị góc máy
                                    </span>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        {GEAR_CATEGORIES.map((cat) => (
                                            <div key={cat.value} className="flex flex-col gap-1">
                                                <label className="text-[10px] font-semibold text-[#8A8F98] flex items-center gap-1">
                                                    <FontAwesomeIcon icon={cat.icon} className={`${cat.color} text-[10px]`} />
                                                    <span>{cat.label}</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={gearData[cat.value] || ""}
                                                    onChange={(e) => onGearChange?.(cat.value, e.target.value)}
                                                    placeholder={`Nhập ${cat.value}...`}
                                                    className="w-full bg-[#0D0F14] border border-[#222834] rounded-[6px] px-2.5 py-1.5 text-xs text-[#F0F1F2] focus:outline-none focus:border-[#1688E8] transition-colors"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {filledGear.length === 0 ? (
                                        <div className="py-5 px-4 rounded-[10px] border border-dashed border-[#222834] bg-[#13161C] text-center flex flex-col items-center justify-center gap-1">
                                            <span className="text-xs font-bold text-[#1688E8] uppercase tracking-wider font-mono">
                                                + BATTLESTATION LOADOUT
                                            </span>
                                            <span className="text-xs text-[#8A8F98]">Chưa cập nhật thông tin thiết bị góc máy.</span>
                                        </div>
                                    ) : (
                                        /* Public Gaming Loadout Presentation */
                                        <div className="flex flex-col divide-y divide-[#181C24]/50">
                                            {filledGear.map((cat) => (
                                                <div key={cat.value} className="py-2 flex items-center justify-between text-xs gap-3">
                                                    <div className="flex items-center gap-2 w-28 shrink-0">
                                                        <FontAwesomeIcon icon={cat.icon} className={`${cat.color} text-xs w-4`} />
                                                        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#8A8F98]">
                                                            {cat.value}
                                                        </span>
                                                    </div>
                                                    <span className="font-bold text-[#F0F1F2] truncate text-right">
                                                        {gearData[cat.value]}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                </div>
            )}

        </div>
    );
};
