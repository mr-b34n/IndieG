import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faStar as faStarSolid, faCrown, faUsers, faEye, faEyeSlash, faDesktop, faPlus, faGamepad, faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";
import type { LibraryGame, ProfileIdentity, CommunityReputation, RecentActivityItem } from "../../types";
import type { CommunityDto } from "@/shared/api/types";
import { GEAR_CATEGORIES } from "../../constants";
import { useTranslation, type TranslateFn } from "@/shared/hooks/useTranslate";
import { DEFAULT_GAME_LOGO } from "@/shared/constants/images";
import { BioEditor, BioRenderer, isBioEmpty, parseBio } from "../../bio";

interface OverviewTabProps {
    identity: ProfileIdentity;
    games: LibraryGame[];
    isLoadingGames?: boolean;
    reputations: CommunityReputation[];
    communities?: CommunityDto[];
    isLoadingCommunities?: boolean;
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
    onNavigateToGames?: () => void;
    t?: TranslateFn;
}

export const OverviewTab = ({
    identity,
    games = [],
    isLoadingGames = false,
    reputations = [],
    communities = [],
    isLoadingCommunities = false,
    activities = [],
    gearData = {},
    isOwnProfile,
    isCustomizeMode = false,
    hiddenSections = {},
    onToggleHideSection,
    onGearChange,
    onIdentityChange,
    onNavigateToGames,
    t,
}: OverviewTabProps) => {
    const { t: fallbackT } = useTranslation();
    const tr = t || fallbackT;

    const displayCommunityList = (communities && communities.length > 0)
        ? communities.map((c) => ({
              id: c.id,
              name: c.name,
              icon: c.logo ? <img src={c.logo} alt={c.name} className="w-5 h-5 rounded-full object-cover border border-[#1A1F2A]" /> : "🎮",
              tier: c.category || "Member",
          }))
        : reputations.map((rep) => ({
              id: rep.id,
              name: rep.name,
              icon: rep.icon,
              tier: rep.tier,
          }));

    // Real library games from backend API
    const activeGamesList = games || [];
    
    const [selectedGameSlug, setSelectedGameSlug] = useState<string>(activeGamesList[0]?.id ? String(activeGamesList[0].id) : "");

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
                title={hidden ? tr("profile.toggleHidden", { defaultValue: "Đã ẩn (Click để hiện)" }) : tr("profile.toggleVisible", { defaultValue: "Đang hiện (Click để ẩn)" })}
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
                                        {tr("profile.empty.bioDetail", { defaultValue: "Chưa thiết lập mô tả tiểu sử character." })}
                                    </p>
                                    {isOwnProfile && (
                                        <p className="text-[11px] text-[#666A71]">
                                            {tr("profile.empty.bioEditPrompt", { defaultValue: "Bấm \"Chỉnh sửa hồ sơ\" để viết mô tả tiểu sử cho nhân vật." })}
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
                            <h3 className="text-xs font-bold uppercase tracking-wider text-[#F0F1F2]">
                                {tr("profile.gameMastery.title", { defaultValue: "Game Mastery" })}
                            </h3>
                        </div>
                        <div className="flex items-center gap-2">
                            {renderToggleBtn("gameMastery")}
                        </div>
                    </div>

                    {isLoadingGames ? (
                        <div className="py-8 px-4 rounded-[12px] bg-[#13161C] border border-[#1A1F2A]/60 flex flex-col items-center justify-center gap-2 text-[#8A8F98]">
                            <FontAwesomeIcon icon={faSpinner} className="animate-spin text-[#1688E8] text-base" />
                            <span className="text-xs font-medium">
                                {tr("profile.gameMastery.loading", { defaultValue: "Đang tải dữ liệu Game Mastery từ hệ thống..." })}
                            </span>
                        </div>
                    ) : (
                        (() => {
                            const playedGames = activeGamesList.filter(g => (g.hours || 0) > 0);
                            
                            if (playedGames.length === 0) {
                                return (
                                    <div className="py-7 px-5 rounded-[12px] bg-[#13161C] border border-[#1A1F2A]/80 text-center flex flex-col items-center justify-center gap-2.5">

                                        <div className="flex flex-col gap-1">
                                            <h4 className="text-xs font-bold text-[#F0F1F2] uppercase tracking-wider">
                                                {tr("profile.gameMastery.emptyTitle", { defaultValue: "Chưa có dữ liệu Game Mastery" })}
                                            </h4>
                                            <p className="text-xs text-[#8A8F98] max-w-md leading-relaxed">
                                                {isOwnProfile
                                                    ? tr("profile.gameMastery.emptyDescOwn", { defaultValue: "Chưa nhận được phản hồi dữ liệu game. Bạn có thể thêm các tựa game và chỉ số vào thư viện." })
                                                    : tr("profile.gameMastery.emptyDescOther", { defaultValue: "Người dùng này chưa cập nhật dữ liệu game trong thư viện Game Mastery." })}
                                            </p>
                                        </div>
                                        {isOwnProfile && onNavigateToGames && (
                                            <button
                                                type="button"
                                                onClick={onNavigateToGames}
                                                className="mt-1 px-3.5 py-1.5 rounded-[6px] bg-[#1688E8] hover:bg-[#1478D0] text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                                            >
                                                <FontAwesomeIcon icon={faPlus} className="text-[10px]" />
                                                <span>{tr("profile.gameMastery.addGameBtn", { defaultValue: "Thêm game vào thư viện" })}</span>
                                            </button>
                                        )}
                                    </div>
                                );
                            }

                            const primaryGame = playedGames.find((g) => String(g?.id) === selectedGameSlug || g?.isFeatured) || playedGames[0];
                            const gridGames = playedGames.slice(0, 6);

                            return (
                                <>
                                    {/* Primary Game Horizontal Banner */}
                                    {primaryGame && (
                                        <div className="relative w-full h-24 sm:h-28 rounded-[10px] overflow-hidden group flex items-center border border-[#1A1F2A]/80">
                                            {/* Blurred Backdrop */}
                                            <div className="absolute inset-0 z-0">
                                                <img 
                                                    src={primaryGame.coverUrl || primaryGame.logo || DEFAULT_GAME_LOGO} 
                                                    alt="backdrop" 
                                                    className="w-full h-full object-cover blur-sm scale-110 opacity-30" 
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-r from-[#0A0C0E] via-[#0A0C0E]/90 to-transparent" />
                                            </div>

                                            {/* Content */}
                                            <div className="relative z-10 flex items-center justify-between w-full p-4">
                                                <div className="flex items-center gap-4">
                                                    <img 
                                                        src={primaryGame.logo || DEFAULT_GAME_LOGO} 
                                                        alt={primaryGame.name} 
                                                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-[8px] object-cover shadow-lg border border-[#222834]/80"
                                                    />
                                                    <div className="flex flex-col gap-1">
                                                        <h4 className="font-extrabold text-[#F0F1F2] text-base sm:text-lg">
                                                            {primaryGame.name}
                                                        </h4>
                                                        <span className="text-xs font-semibold text-[#8A8F98]">
                                                            {primaryGame.hours} Hours Played
                                                        </span>
                                                        <div className="flex items-center gap-2 mt-1" title="Achievement Progress">
                                                            <div className="h-1.5 w-24 bg-[#1A1E26] rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-[#1688E8] rounded-full"
                                                                    style={{ width: `${Math.round(((primaryGame.achievements || 0) / Math.max(1, (primaryGame.totalAchievements || 1))) * 100)}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-[10px] text-[#8A8F98] font-mono">
                                                                {Math.round(((primaryGame.achievements || 0) / Math.max(1, (primaryGame.totalAchievements || 1))) * 100)}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="hidden sm:flex flex-col items-end gap-2">
                                                    <span className="px-2.5 py-1 rounded-[6px] text-[10px] font-bold text-[#1688E8] bg-[#1688E8]/10 border border-[#1688E8]/20 flex items-center gap-1.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-[#1688E8] animate-pulse" />
                                                        NOW PLAYING
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Game Grid */}
                                    {gridGames.length > 0 && (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mt-2">
                                            {gridGames.map(game => {
                                                const achievementPct = Math.round(((game.achievements || 0) / Math.max(1, (game.totalAchievements || 1))) * 100);
                                                return (
                                                    <div 
                                                        key={game.id || game.name} 
                                                        className="group relative flex flex-col bg-[#13161C] rounded-[8px] overflow-hidden border border-[#1A1F2A]/60 hover:border-[#1688E8]/50 transition-all cursor-pointer"
                                                        title={`${game.name} - Rank: ${game.rank || 'Unranked'} - ${achievementPct}% Achievements`}
                                                        onClick={() => setSelectedGameSlug(String(game.id))}
                                                    >
                                                        <div className="w-full aspect-[2/3] overflow-hidden bg-[#0A0C0E]">
                                                            <img 
                                                                src={game.coverUrl || game.logo || DEFAULT_GAME_LOGO} 
                                                                alt={game.name} 
                                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                            />
                                                        </div>
                                                        <div className="p-2 flex flex-col gap-0.5">
                                                            <span className="text-[11px] font-bold text-[#F0F1F2] truncate">{game.name}</span>
                                                            <span className="text-[10px] text-[#8A8F98]">{game.hours}h played</span>
                                                        </div>
                                                        {/* Thin achievement progress bar at bottom */}
                                                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1A1E26]">
                                                            <div 
                                                                className="h-full bg-[#1688E8]" 
                                                                style={{ width: `${achievementPct}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                    
                                    {activeGamesList.length > 6 && (
                                        <button
                                            type="button"
                                            onClick={onNavigateToGames}
                                            className="mt-2 text-xs font-semibold text-[#8A8F98] hover:text-[#F0F1F2] flex items-center justify-center gap-1.5 transition-colors"
                                        >
                                            View all in Library →
                                        </button>
                                    )}
                                </>
                            );
                        })()
                    )}
                </div>
            )}

            {/* ── SECTION 3: RECENT ACTIVITY (Medium Weight Feed) ────────────────── */}
            {showRecentActivity && (activities.length > 0 || isOwnProfile) && (
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
                        <div className="py-4 px-4 rounded-[8px] bg-[#13161C] flex flex-col items-center gap-2 border border-[#1A1F2A]/40 text-center">
                            <span className="text-[#8A8F98] text-xs">No recent activity.</span>
                            {isOwnProfile && (
                                <button type="button" className="text-[11px] font-bold text-[#1688E8] hover:text-[#1478D0]">
                                    Link your Steam account to see your activity
                                </button>
                            )}
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
            {(showCommunityReputation || (showConnectedAccounts && (filledGear.length > 0 || isCustomizeMode || isOwnProfile))) && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
                    
                    {/* COMMUNITY REPUTATION */}
                    {showCommunityReputation && (
                        <div className={`${(showConnectedAccounts && (filledGear.length > 0 || isCustomizeMode || isOwnProfile)) ? "lg:col-span-6" : "lg:col-span-12"} bg-[#0A0C0E] rounded-[14px] p-5 sm:p-6 shadow-xs flex flex-col gap-4 transition-all ${cardCustomStyle("communityReputation")}`}>
                            <div className="flex items-center justify-between pb-2 border-b border-[#181C24]/60">
                                <div className="flex items-center gap-2">
                                    <FontAwesomeIcon icon={faUsers} className="text-[#1688E8] text-xs" />
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#F0F1F2]">Community Reputation</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    {renderToggleBtn("communityReputation")}
                                    <span className="text-[10px] font-medium text-[#8A8F98]">{displayCommunityList.length} Joined</span>
                                </div>
                            </div>

                            {isLoadingCommunities ? (
                                <div className="py-4 px-4 rounded-[8px] bg-[#13161C] text-[#8A8F98] text-xs text-center border border-[#1A1F2A]/40 flex items-center justify-center gap-2">
                                    <FontAwesomeIcon icon={faSpinner} className="animate-spin text-[#1688E8]" />
                                    <span>{tr("common.loading", { defaultValue: "Đang tải dữ liệu..." })}</span>
                                </div>
                            ) : displayCommunityList.length === 0 ? (
                                <div className="py-4 px-4 rounded-[8px] bg-[#13161C] text-[#8A8F98] text-xs text-center border border-[#1A1F2A]/40">
                                    <span>{tr("profile.empty.communitiesText", { defaultValue: "Chưa tham gia cộng đồng nào." })}</span>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-2">
                                    {displayCommunityList.map((rep) => (
                                        <div
                                            key={rep.id}
                                            className="flex items-center gap-3 p-2.5 rounded-[8px] bg-[#13161C] border border-[#1A1F2A]/40 hover:bg-[#1B1F28] transition-all"
                                        >
                                            <div className="w-10 h-10 shrink-0 flex items-center justify-center bg-[#1A1F2A] rounded-[8px] overflow-hidden border border-[#222834]">
                                                {typeof rep.icon === 'string' && rep.icon.startsWith('http') ? (
                                                    <img src={rep.icon} alt={rep.name} className="w-full h-full object-cover" />
                                                ) : typeof rep.icon === 'object' && rep.icon !== null ? (
                                                    rep.icon
                                                ) : (
                                                    <span className="text-lg">{rep.icon || "🎮"}</span>
                                                )}
                                            </div>
                                            <div className="flex flex-col min-w-0 flex-1">
                                                <span className="text-xs font-bold text-[#F0F1F2] truncate">{rep.name}</span>
                                                <span className="text-[10px] font-bold text-[#F0F1F2] bg-[#1A1F2A] border border-[#222834] px-1.5 py-0.5 rounded-[4px] w-fit truncate mt-1">
                                                    {rep.tier}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* BATTLESTATION LOADOUT */}
                    {showConnectedAccounts && (filledGear.length > 0 || isCustomizeMode || isOwnProfile) && (
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
                                        <button
                                            type="button"
                                            onClick={() => isOwnProfile && onToggleHideSection && onToggleHideSection("connectedAccounts")}
                                            className="w-full py-5 px-4 rounded-[10px] border border-dashed border-[#222834] bg-[#13161C] hover:bg-[#1A1E28] transition-all text-center flex flex-col items-center justify-center gap-1 cursor-pointer"
                                        >
                                            <span className="text-xs font-bold text-[#1688E8] uppercase tracking-wider font-mono">
                                                + Add your first gear
                                            </span>
                                        </button>
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
