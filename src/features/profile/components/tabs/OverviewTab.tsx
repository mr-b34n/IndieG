import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faStar as faStarSolid, faCrown, faUsers, faEye, faEyeSlash, faDesktop, faPlus, faUser, faBolt, faGamepad, faSpinner,
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
    const navigate = useNavigate();
    const { t: fallbackT } = useTranslation();
    const tr = t || fallbackT;

    const displayCommunityList = (communities && communities.length > 0)
        ? communities.map((c) => {
              const rawBackdrop = c.backdrop || (c as unknown as { bannerUrl?: string; banner?: string }).bannerUrl || (c as unknown as { bannerUrl?: string; banner?: string }).banner;
              const backdrop = rawBackdrop || c.logo;
              return {
                  id: c.id,
                  name: c.name,
                  backdrop,
              };
          })
        : reputations.map((rep) => ({
              id: rep.id,
              name: rep.name,
              backdrop: (rep as unknown as { backdrop?: string; banner?: string }).backdrop || (rep as unknown as { backdrop?: string; banner?: string }).banner || (typeof rep.icon === 'string' && rep.icon.startsWith('http') ? rep.icon : undefined),
          }));

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
                className={`w-7 h-7 flex items-center justify-center cursor-pointer transition-all ${
                    hidden
                        ? "text-rose-400 hover:text-rose-300"
                        : "text-text-muted hover:text-primary"
                }`}
                title={hidden ? tr("profile.toggleHidden", { defaultValue: "Đã ẩn (Click để hiện)" }) : tr("profile.toggleVisible", { defaultValue: "Đang hiện (Click để ẩn)" })}
            >
                <FontAwesomeIcon icon={hidden ? faEyeSlash : faEye} className="text-xs" />
            </button>
        );
    };

    // Visibility flags
    const showPlayerIdentity = isSectionVisible("playerIdentity");
    const showGameMastery = false; // Tạm thời ẩn do chưa liên kết Steam/nhà cung cấp dữ liệu game
    const showRecentActivity = isSectionVisible("recentActivity");
    const showCommunityReputation = isSectionVisible("communityReputation");
    const showConnectedAccounts = isSectionVisible("connectedAccounts");

    const parsedBioDoc = parseBio(identity.bio);
    const isBioBlank = isBioEmpty(parsedBioDoc);

    return (
        <div className="flex flex-col gap-6 w-full animate-fade-in">

            {/* ── ROW 1: PLAYER IDENTITY (LEFT) & RECENT ACTIVITY (RIGHT) ── */}
            {(showPlayerIdentity || (showRecentActivity && (activities.length > 0 || isOwnProfile))) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full items-stretch">
                    {/* Left: Player Identity */}
                    {showPlayerIdentity && (
                        <div className={`w-full h-full bg-surface rounded-[14px] p-5 sm:p-6 relative overflow-visible z-10 transition-all flex flex-col ${cardCustomStyle("playerIdentity")} ${!showRecentActivity || (activities.length === 0 && !isOwnProfile) ? "lg:col-span-2" : ""}`}>
                            <div className="flex items-center justify-between pb-2 mb-3">
                                <div className="flex items-center gap-2">
                                    <FontAwesomeIcon icon={faUser} className="text-primary text-xs" />
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-text">Player Identity</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    {renderToggleBtn("playerIdentity")}
                                </div>
                            </div>

                            {/* Inline Bio Editing vs Natural Character Sheet Composition */}
                            {isCustomizeMode ? (
                                <div className="pt-1 flex-1">
                                    <BioEditor
                                        value={identity.bio}
                                        onChange={(serialized) => onIdentityChange?.({ bio: serialized })}
                                    />
                                </div>
                            ) : (
                                <div className="py-2 px-1 flex-1">
                                    {isBioBlank ? (
                                        <div className="py-4 px-3 flex flex-col items-center justify-center text-center gap-1.5 h-full">
                                            <span className="text-xs font-mono font-bold uppercase tracking-widest text-primary">
                                                {identity.name || "Gamer"}
                                            </span>
                                            <p className="text-xs text-text-muted italic">
                                                {tr("profile.empty.bioDetail", { defaultValue: "Chưa thiết lập mô tả tiểu sử character." })}
                                            </p>
                                            {isOwnProfile && (
                                                <p className="text-[11px] text-text-faint">
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

                    {/* Right: Recent Activity */}
                    {showRecentActivity && (activities.length > 0 || isOwnProfile) && (
                        <div className={`w-full h-full bg-surface rounded-[14px] p-5 sm:p-6 flex flex-col gap-3 transition-all ${cardCustomStyle("recentActivity")} ${!showPlayerIdentity ? "lg:col-span-2" : ""}`}>
                            <div className="flex items-center justify-between pb-2">
                                <div className="flex items-center gap-2">
                                    <FontAwesomeIcon icon={faBolt} className="text-primary text-xs" />
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-text">Recent Activity</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    {renderToggleBtn("recentActivity")}
                                    <span className="text-[10px] font-medium text-text-muted">Live Feed</span>
                                </div>
                            </div>

                            {activities.length === 0 ? (
                                <div className="py-6 px-4 rounded-[8px] bg-surface-inner flex flex-col items-center justify-center gap-2 text-center flex-1">
                                    <span className="text-text-muted text-xs">No recent activity.</span>
                                    {isOwnProfile && (
                                        <span className="text-[11px] text-text-faint">
                                            Hoạt động bài viết và tương tác của bạn sẽ xuất hiện tại đây.
                                        </span>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2.5 flex-1">
                                    {activities.map((act) => (
                                        <div key={act.id} className="flex items-start gap-3 p-2.5 rounded-[8px] bg-surface-inner hover:bg-surface-hover transition-all">
                                            <span className="text-sm shrink-0 mt-0.5">{act.icon || "🎮"}</span>
                                            <div className="flex flex-col min-w-0 flex-1">
                                                <div className="flex items-center justify-between gap-2">
                                                    <h5 className="font-bold text-text text-xs leading-snug">{act.title}</h5>
                                                    <span className="text-[10px] text-text-muted shrink-0">{act.timeAgo}</span>
                                                </div>
                                                {act.subtitle && (
                                                    <p className="text-[11px] text-text-muted leading-normal mt-0.5">{act.subtitle}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* ── SECTION 2: COMMUNITIES & BATTLESTATION SETUP ── */}
            {(showCommunityReputation || (showConnectedAccounts && (filledGear.length > 0 || isCustomizeMode || isOwnProfile))) && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
                    {/* Community Reputation Card */}
                    {showCommunityReputation && (
                        <div className={(showConnectedAccounts && (filledGear.length > 0 || isCustomizeMode || isOwnProfile)) ? "lg:col-span-7" : "lg:col-span-12"}>
                            <div className={`w-full h-full bg-surface rounded-[14px] p-5 sm:p-6 flex flex-col gap-4 transition-all ${cardCustomStyle("communityReputation")}`}>
                                <div className="flex items-center justify-between pb-2">
                                    <div className="flex items-center gap-2">
                                        <FontAwesomeIcon icon={faUsers} className="text-primary text-xs" />
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-text">Community Reputation</h3>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {renderToggleBtn("communityReputation")}
                                        <span className="text-[10px] font-medium text-text-muted">{displayCommunityList.length} Joined</span>
                                    </div>
                                </div>

                                {isLoadingCommunities ? (
                                    <div className="py-8 px-4 rounded-[8px] bg-surface-inner text-text-muted text-xs text-center flex items-center justify-center gap-2 flex-1">
                                        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-primary" />
                                        <span>{tr("common.loading", { defaultValue: "Đang tải dữ liệu..." })}</span>
                                    </div>
                                ) : displayCommunityList.length === 0 ? (
                                    <div className="py-8 px-4 rounded-[8px] bg-surface-inner text-text-muted text-xs text-center flex items-center justify-center flex-1">
                                        <span>{tr("profile.empty.communitiesText", { defaultValue: "Chưa tham gia cộng đồng nào." })}</span>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 flex-1">
                                        {displayCommunityList.map((rep) => (
                                            <div
                                                key={rep.id}
                                                onClick={() => navigate({ to: "/community/$communityId", params: { communityId: String(rep.id) } })}
                                                className="group relative h-20 sm:h-22 w-full rounded-[10px] overflow-hidden hover:opacity-90 transition-all duration-200 cursor-pointer flex flex-col justify-end p-3.5 select-none"
                                            >
                                                {/* Header Background */}
                                                {rep.backdrop ? (
                                                    <img
                                                        src={rep.backdrop}
                                                        alt={rep.name}
                                                        className="absolute inset-0 w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="absolute inset-0 bg-surface-inner flex items-center justify-center">
                                                        <FontAwesomeIcon icon={faGamepad} className="text-xl text-text-faint/30" />
                                                    </div>
                                                )}

                                                {/* Gradient Overlay for text readability */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/15 group-hover:from-black/95 transition-colors pointer-events-none" />

                                                {/* Community Name inside Header */}
                                                <div className="relative z-10 flex items-center gap-2 min-w-0">
                                                    <span 
                                                        className="text-xs sm:text-[13px] font-bold text-white truncate drop-shadow-sm group-hover:text-primary transition-colors"
                                                        title={rep.name}
                                                    >
                                                        {rep.name}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Battlestation Loadout Card */}
                    {showConnectedAccounts && (filledGear.length > 0 || isCustomizeMode || isOwnProfile) && (
                        <div className={showCommunityReputation ? "lg:col-span-5" : "lg:col-span-12"}>
                            <div className={`w-full h-full bg-surface rounded-[14px] p-5 sm:p-6 flex flex-col gap-4 transition-all ${cardCustomStyle("connectedAccounts")}`}>
                                <div className="flex items-center justify-between pb-2">
                                    <div className="flex items-center gap-2">
                                        <FontAwesomeIcon icon={faDesktop} className="text-primary text-xs" />
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-text">Battlestation Loadout</h3>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {renderToggleBtn("connectedAccounts")}
                                    </div>
                                </div>

                                {/* Public View: Gaming Hardware Loadout vs Edit Mode: Form */}
                                {isCustomizeMode ? (
                                    <div className="flex flex-col gap-3 p-3 bg-surface-inner rounded-[10px]">
                                        <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-wider">
                                            {tr("profile.battlestationUpdate", { defaultValue: "Cập nhật thông tin thiết bị góc máy" })}
                                        </span>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                            {GEAR_CATEGORIES.map((cat) => (
                                                <div key={cat.value} className="flex flex-col gap-1">
                                                    <label className="text-[10px] font-semibold text-text-muted flex items-center gap-1">
                                                        <FontAwesomeIcon icon={cat.icon} className={`${cat.color} text-[10px]`} />
                                                        <span>{cat.label}</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={gearData[cat.value] || ""}
                                                        onChange={(e) => onGearChange?.(cat.value, e.target.value)}
                                                        placeholder={tr("profile.battlestationPlaceholder", { item: cat.value, defaultValue: `Nhập ${cat.value}...` })}
                                                        className="w-full bg-surface rounded-[6px] px-2.5 py-1.5 text-xs text-text focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {filledGear.length === 0 ? (
                                            <div className="py-8 px-4 rounded-[8px] bg-surface-inner text-text-muted text-xs text-center flex items-center justify-center flex-1">
                                                <span>{tr("profile.battlestationEmpty", { defaultValue: "Chưa có thông tin thiết bị." })}</span>
                                            </div>
                                        ) : (
                                            /* Public Gaming Loadout Presentation */
                                            <div className="flex flex-col">
                                                {filledGear.map((cat) => (
                                                    <div key={cat.value} className="py-2.5 flex items-center justify-between text-xs gap-3">
                                                        <div className="flex items-center gap-2 w-28 shrink-0">
                                                            <FontAwesomeIcon icon={cat.icon} className={`${cat.color} text-xs w-4`} />
                                                            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-text-muted">
                                                                {cat.value}
                                                            </span>
                                                        </div>
                                                        <span className="font-bold text-text truncate text-right">
                                                            {gearData[cat.value]}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
