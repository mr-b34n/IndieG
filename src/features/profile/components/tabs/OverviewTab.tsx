import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faStar as faStarSolid, faCrown, faUsers, faEye, faEyeSlash, faDesktop,
} from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";
import type { LibraryGame, ProfileIdentity, CommunityReputation, RecentActivityItem } from "../../types";
import { GEAR_CATEGORIES } from "../../constants";
import { useTranslation, type TranslateFn } from "@/shared/hooks/useTranslate";

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

export const OverviewTab = ({
    identity,
    games = [],
    reputations = [],
    activities = [],
    gearData = {},
    isCustomizeMode = false,
    hiddenSections = {},
    onToggleHideSection,
    onGearChange,
    onIdentityChange,
}: OverviewTabProps) => {
    const { t } = useTranslation();
    const safeGames = games || [];
    const [selectedGameSlug, setSelectedGameSlug] = useState<string>("cs2");

    const featuredGame = safeGames.find((g) => g?.id === selectedGameSlug || g?.isFeatured) || safeGames[0];
    const secondaryGames = safeGames;
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
    const showGamingDna = isSectionVisible("gamingDna");
    const showGameMastery = isSectionVisible("gameMastery");
    const showRecentActivity = isSectionVisible("recentActivity");
    const showCommunityReputation = isSectionVisible("communityReputation");
    const showConnectedAccounts = isSectionVisible("connectedAccounts");

    return (
        <div className="flex flex-col gap-5 w-full animate-fade-in">

            {/* ── ROW 1: PLAYER IDENTITY + GAMING DNA ─────────────────────── */}
            {(showPlayerIdentity || showGamingDna) && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full">
                    
                    {/* PLAYER IDENTITY */}
                    {showPlayerIdentity && (
                        <div className={`${showGamingDna ? "lg:col-span-5" : "lg:col-span-12"} bg-[#0A0C0E] rounded-[14px] p-5 flex flex-col gap-4 shadow-sm relative overflow-hidden transition-all ${cardCustomStyle("playerIdentity")}`}>
                            <div className="flex items-center justify-between pb-1.5 border-b border-[#181C24]/60">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm">🎯</span>
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#F0F1F2]">Player Identity</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    {renderToggleBtn("playerIdentity")}
                                </div>
                            </div>

                            {/* Inline Bio & Archetypes Editing */}
                            {isCustomizeMode ? (
                                <div className="flex flex-col gap-3 p-3 bg-[#13161C] rounded-[8px] animate-fade-in">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-bold text-[#8A8F98]">Tiểu sử (Bio):</label>
                                        <textarea
                                            value={identity.bio || ""}
                                            onChange={(e) => onIdentityChange?.({ bio: e.target.value })}
                                            rows={3}
                                            placeholder="Nhập tiểu sử ngắn của bạn..."
                                            className="w-full bg-[#0D0F14] border border-[#222834] rounded-[6px] p-2 text-xs text-[#F0F1F2] focus:outline-none focus:border-[#1688E8] transition-colors"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-bold text-[#8A8F98]">Phong cách chơi (phân cách bằng dấu phẩy):</label>
                                        <input
                                            type="text"
                                            value={(identity.titles || []).join(", ")}
                                            onChange={(e) => {
                                                const titles = e.target.value.split(",").map((t) => t.trim()).filter(Boolean);
                                                onIdentityChange?.({ titles });
                                            }}
                                            placeholder="Sniper God, Entry Fragger, IGL Main..."
                                            className="w-full bg-[#0D0F14] border border-[#222834] rounded-[6px] p-2 text-xs text-[#F0F1F2] focus:outline-none focus:border-[#1688E8] transition-colors"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {identity.bio ? (
                                        <div className="bg-[#13161C] p-3 rounded-[8px]">
                                            <p className="text-xs text-[#9A9DA3] italic leading-relaxed">
                                                "{identity.bio}"
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="bg-[#13161C] p-3 rounded-[8px] text-center">
                                            <p className="text-xs text-[#666A71] italic">{t("profile.empty.bio")}</p>
                                        </div>
                                    )}

                                    {/* Roles / Archetypes */}
                                    {identity.titles && identity.titles.length > 0 ? (
                                        <div className="flex flex-col gap-2">
                                            {identity.titles.map((title, i) => (
                                                <div key={i} className="flex items-center gap-2 text-xs font-bold text-[#F0F1F2]">
                                                    <span className="text-[#E5A93D]">🎯</span> {title}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="bg-[#13161C] p-3 rounded-[8px] text-center">
                                            <p className="text-xs text-[#666A71] italic">{t("profile.empty.playstyle")}</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* GAMING DNA */}
                    {showGamingDna && (
                        <div className={`${showPlayerIdentity ? "lg:col-span-7" : "lg:col-span-12"} bg-[#0A0C0E] rounded-[14px] p-5 flex flex-col gap-4 shadow-sm transition-all ${cardCustomStyle("gamingDna")}`}>
                            <div className="flex items-center justify-between pb-1.5 border-b border-[#181C24]/60">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm">🧬</span>
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#F0F1F2]">Gaming DNA</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    {renderToggleBtn("gamingDna")}
                                    <span className="text-[10px] font-medium text-[#8A8F98]">Stats Breakdown</span>
                                </div>
                            </div>

                            {games.length === 0 ? (
                                <div className="bg-[#13161C] p-6 rounded-[10px] text-center flex flex-col items-center justify-center min-h-[140px]">
                                    <p className="text-xs text-[#8A8F98] italic">Chưa có dữ liệu thống kê Gaming DNA từ máy chủ.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* Genre Mastery */}
                                    <div className="flex flex-col gap-3 bg-[#13161C] p-4 rounded-[10px]">
                                        <span className="text-[10px] font-semibold uppercase text-[#8A8F98] tracking-wider">Genre Mastery</span>
                                        
                                        <DnaBar label="FPS" percent={games.some((g) => g.tags?.includes("FPS") || g.name.includes("CS")) ? 85 : 0} fillHex="#1688E8" isPrimary />
                                        <DnaBar label="SURVIVAL" percent={games.some((g) => g.tags?.includes("Survival")) ? 70 : 0} fillHex="#B8BCC2" />
                                        <DnaBar label="RPG" percent={games.some((g) => g.tags?.includes("RPG")) ? 60 : 0} fillHex="#9A9DA3" />
                                        <DnaBar label="STRATEGY" percent={games.some((g) => g.tags?.includes("Strategy")) ? 40 : 0} fillHex="#666A71" />
                                    </div>

                                    {/* Play Dynamics */}
                                    <div className="flex flex-col gap-3 bg-[#13161C] p-4 rounded-[10px]">
                                        <span className="text-[10px] font-semibold uppercase text-[#8A8F98] tracking-wider">Play Dynamics</span>

                                        <DnaBar label="Competitive" percent={75} fillHex="#1688E8" isPrimary />
                                        <DnaBar label="Co-op" percent={60} fillHex="#B8BCC2" />
                                        <DnaBar label="Solo" percent={50} fillHex="#9A9DA3" />
                                        <DnaBar label="Casual" percent={30} fillHex="#666A71" />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            )}

            {/* ── ROW 2: GAME MASTERY ───────────────────────── */}
            {showGameMastery && (
                <div className={`w-full bg-[#0A0C0E] rounded-[14px] p-5 sm:p-6 shadow-sm flex flex-col gap-5 transition-all ${cardCustomStyle("gameMastery")}`}>
                    <div className="flex items-center justify-between pb-1 border-b border-[#181C24]/60">
                        <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faCrown} className="text-[#E5A93D] text-xs" />
                            <h3 className="text-xs font-bold uppercase tracking-wider text-[#F0F1F2]">Game Mastery</h3>
                        </div>
                        <div className="flex items-center gap-2">
                            {renderToggleBtn("gameMastery")}
                            <span className="text-xs font-medium text-[#1688E8]">Featured Game</span>
                        </div>
                    </div>

                    {/* Featured Hero Game Container */}
                    {featuredGame ? (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center bg-[#13161C] rounded-[10px] p-4 sm:p-5 relative overflow-hidden transition-all">
                            
                            <div className="lg:col-span-4 flex items-center gap-4 relative z-10">
                                <img
                                    src={featuredGame.logo || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=120&auto=format&fit=crop&q=80"}
                                    alt={featuredGame.name || "Game"}
                                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-[8px] object-cover shrink-0"
                                />
                                <div className="flex flex-col gap-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-[#F0F1F2] text-base truncate">{featuredGame.name || "Featured Game"}</h4>
                                        <span className="px-2 py-0.5 rounded-[4px] text-[10px] font-bold text-[#1688E8] bg-[#1688E8]/15">
                                            PRIMARY
                                        </span>
                                    </div>
                                    <span className="text-xs font-bold text-[#F0F1F2]">
                                        {featuredGame.hours || 0} Hours Played
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
                                        Mastery Progress ({featuredGame.achievements || 0}/{featuredGame.totalAchievements || 100} Achievements)
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
                                            width: `${Math.round(((featuredGame.achievements || 0) / (featuredGame.totalAchievements || 1)) * 100)}%`
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
                    ) : (
                        <div className="p-4 rounded-[10px] bg-[#13161C] text-[#9A9DA3] text-xs">
                            Chưa chọn game nổi bật nào.
                        </div>
                    )}

                    {/* Secondary Game Cards */}
                    {secondaryGames.length > 0 && (
                        <div className="flex flex-col gap-2">
                            {isCustomizeMode && (
                                <span className="text-[10px] font-bold text-[#1688E8] italic">
                                    💡 Click vào một tựa game bên dưới để đổi làm Game Nổi Bật hiển thị trên hồ sơ.
                                </span>
                            )}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                {secondaryGames.map((game) => {
                                    const isSelected = (game.id === selectedGameSlug) || (game.name === featuredGame?.name);
                                    return (
                                        <button
                                            key={game.name}
                                            type="button"
                                            onClick={() => setSelectedGameSlug(String(game.id || "cs2"))}
                                            className={`relative flex items-center gap-3 p-3 rounded-[10px] text-left transition-all cursor-pointer ${
                                                isSelected
                                                    ? "bg-[#192230] shadow-sm ring-1 ring-[#1688E8]/50"
                                                    : "bg-[#13161C] hover:bg-[#1B1F28]"
                                            }`}
                                        >
                                            {isSelected && (
                                                <div className="absolute left-0 top-2 bottom-2 w-[3px] bg-[#1688E8] rounded-r-full" />
                                            )}

                                            <img 
                                                src={game.logo || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=120&auto=format&fit=crop&q=80"} 
                                                alt={game.name || "Game"} 
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
                    )}
                </div>
            )}

            {/* ── ROW 3: RECENT ACTIVITY ───────────────────── */}
            {showRecentActivity && (
                <div className={`w-full bg-[#0A0C0E] rounded-[14px] p-5 flex flex-col gap-4 shadow-sm transition-all ${cardCustomStyle("recentActivity")}`}>
                    <div className="flex items-center justify-between pb-1 border-b border-[#181C24]/60">
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
                        <div className="p-6 rounded-[8px] bg-[#13161C] text-[#8A8F98] text-xs text-center flex flex-col items-center gap-1.5">
                            <span>{t("profile.empty.activityText")}</span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                    )}
                </div>
            )}

            {/* ── ROW 4: COMMUNITIES REPUTATION + BATTLESTATION SETUP ─ */}
            {(showCommunityReputation || showConnectedAccounts) && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full">
                    
                    {/* COMMUNITIES REPUTATION */}
                    {showCommunityReputation && (
                        <div className={`${showConnectedAccounts ? "lg:col-span-6" : "lg:col-span-12"} bg-[#0A0C0E] rounded-[14px] p-5 flex flex-col gap-4 shadow-sm transition-all ${cardCustomStyle("communityReputation")}`}>
                            <div className="flex items-center justify-between pb-1 border-b border-[#181C24]/60">
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
                                <div className="p-6 rounded-[8px] bg-[#13161C] text-[#8A8F98] text-xs text-center flex flex-col items-center gap-1.5">
                                    <span>{t("profile.empty.communitiesText")}</span>
                                </div>
                            ) : (
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
                            )}
                        </div>
                    )}

                    {/* BATTLESTATION SETUP */}
                    {showConnectedAccounts && (
                        <div className={`${showCommunityReputation ? "lg:col-span-6" : "lg:col-span-12"} bg-[#0A0C0E] rounded-[14px] p-5 flex flex-col gap-4 shadow-sm transition-all ${cardCustomStyle("connectedAccounts")}`}>
                            <div className="flex items-center justify-between pb-1 border-b border-[#181C24]/60">
                                <div className="flex items-center gap-2">
                                    <FontAwesomeIcon icon={faDesktop} className="text-[#1688E8] text-xs" />
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#F0F1F2]">Battlestation Setup</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    {renderToggleBtn("connectedAccounts")}
                                </div>
                            </div>

                            {/* Inline Edit Mode for Setup */}
                            {isCustomizeMode ? (
                                <div className="flex flex-col gap-3 p-3 bg-[#13161C] rounded-[10px] animate-fade-in max-h-[300px] overflow-y-auto">
                                    <span className="text-[10px] font-extrabold text-[#1688E8] uppercase tracking-wider">
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
                                                    placeholder={`Tên ${cat.value}...`}
                                                    className="w-full bg-[#0D0F14] border border-[#222834] rounded-[6px] px-2.5 py-1.5 text-xs text-[#F0F1F2] focus:outline-none focus:border-[#1688E8] transition-colors"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {filledGear.length === 0 ? (
                                        <div className="p-4 rounded-[8px] bg-[#13161C] text-[#8A8F98] text-xs text-center italic flex flex-col items-center gap-2">
                                            <span>Chưa cập nhật thông tin thiết bị góc máy.</span>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                            {filledGear.map((cat) => (
                                                <div key={cat.value} className="flex items-center gap-2.5 p-2.5 rounded-[8px] bg-[#13161C] hover:bg-[#1B1F28] transition-all">
                                                    <div className="w-8 h-8 rounded-[6px] bg-[#181C24] flex items-center justify-center shrink-0">
                                                        <FontAwesomeIcon icon={cat.icon} className={`${cat.color} text-xs`} />
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-[9px] font-semibold uppercase text-[#8A8F98]">{cat.value}</span>
                                                        <span className="text-xs font-bold text-[#F0F1F2] truncate">{gearData[cat.value]}</span>
                                                    </div>
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
