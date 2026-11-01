import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "@tanstack/react-router";
import { 
    Home, 
    Gamepad2, 
    Users, 
    ChevronDown, 
    ShieldCheck, 
    Flag, 
    ChevronRight
} from "lucide-react";
import { useTranslation } from "@/shared/hooks/useTranslate";
import { useCommunitiesStore } from "@/features/community/store/useCommunitiesStore";
import { useAuthStore } from "@/features/auth";
import { useGameStore } from "@/features/game/store/useGameStore";
import { type GameData } from "@/features/game/types";
import { useCommunitiesQuery, useReportsQuery, useGamesQuery } from "@/shared/api/useQueries";
import { extractReportList, type GameDto } from "@/shared/api";
import { mapGameDtoToGameData } from "@/shared/api/types";
import { cn } from "@/shared/utils/cn";
import { LegalModal } from "@/shared/components/legal/LegalModal";
import { type LegalDocType } from "@/shared/constants/legal";

export const LeftBar = () => {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { t, lang } = useTranslation();
    const isVi = lang === "vi";

    const user = useAuthStore((state) => state.user);
    const isLoggedIn = Boolean(user);
    const [legalModalOpen, setLegalModalOpen] = useState(false);
    const [activeLegalDoc, setActiveLegalDoc] = useState<LegalDocType>("terms");

    // Collapsible state for Favorite Games within Game tab
    const [isGamesExpanded, setIsGamesExpanded] = useState<boolean>(true);

    // Communities Store
    const communities = useCommunitiesStore((state) => state.communities);
    const joinedCommunityIds = useCommunitiesStore((state) => state.joinedCommunityIds);
    const syncJoinedCommunities = useCommunitiesStore((state) => state.syncJoinedCommunities);

    // Games Store - only display games the user has explicitly pinned or followed
    const quickAccessSlugs = useGameStore((state) => state.quickAccessSlugs);
    const followedSlugs = useGameStore((state) => state.followedSlugs);

    const userGameSlugs = useMemo(() => {
        if (quickAccessSlugs && quickAccessSlugs.length > 0) return quickAccessSlugs;
        if (followedSlugs && followedSlugs.length > 0) return followedSlugs;
        return [];
    }, [quickAccessSlugs, followedSlugs]);

    // Fetch live games from API only if the user actually has shortcuts to resolve
    const { data: rawGamesData } = useGamesQuery(
        userGameSlugs.length > 0 ? { limit: 50 } : undefined
    );

    const serverGames = useMemo<GameData[]>(() => {
        if (!rawGamesData || userGameSlugs.length === 0) return [];
        let items: GameDto[] = [];
        if (Array.isArray(rawGamesData)) {
            items = rawGamesData;
        } else if (rawGamesData && typeof rawGamesData === "object") {
            const obj = rawGamesData as Record<string, unknown>;
            if (Array.isArray(obj.items)) {
                items = obj.items as GameDto[];
            } else if (Array.isArray(obj.data)) {
                items = obj.data as GameDto[];
            }
        }
        if (items.length === 0) return [];
        return items.map((item) => mapGameDtoToGameData(item));
    }, [rawGamesData, userGameSlugs]);

    // Favorite / Pinned games list - strictly based on user's games and live server data (NO random database slicing)
    const displayedGames = useMemo<GameData[]>(() => {
        if (userGameSlugs.length === 0 || serverGames.length === 0) return [];
        return userGameSlugs
            .map((slug) => serverGames.find((g) => g.slug.toLowerCase() === slug.toLowerCase()))
            .filter((g): g is GameData => Boolean(g))
            .slice(0, 4);
    }, [userGameSlugs, serverGames]);

    const hasGames = displayedGames.length > 0;

    // Fetch joined communities for the current authenticated user so LeftBar shortcuts show immediately
    const { data: rawJoinedData } = useCommunitiesQuery(
        { type: "joined", limit: 50 },
        { enabled: isLoggedIn }
    );

    useEffect(() => {
        if (rawJoinedData) {
            syncJoinedCommunities(rawJoinedData);
        }
    }, [rawJoinedData, syncJoinedCommunities]);

    // Active Route flags
    const isHomeActive = pathname === "/";
    const isGameActive = pathname.startsWith("/game");
    const isGameHubActive = pathname === "/game";
    const isCommunityActive = pathname.startsWith("/community") && !pathname.includes("manage-");

    const isAdmin = Boolean(
        user?.role === "admin" ||
        user?.id === "usr_admin" ||
        user?.username === "IndieAdmin" ||
        user?.username === "LudonAdmin" ||
        user?.email === "admin@ludon.com" ||
        user?.email === "admin@indieg.com"
    );

    const { data: reportsData } = useReportsQuery(undefined, { enabled: isAdmin });
    const pendingReportsCount = useMemo(() => {
        if (!isAdmin) return 0;
        return extractReportList(reportsData).filter((r) => r.status === "pending").length;
    }, [isAdmin, reportsData]);

    // Joined communities list
    const joinedCommunities = useMemo(() => {
        if (!isLoggedIn) return [];
        const joinedSet = new Set(joinedCommunityIds.map((id) => String(id).toLowerCase()));
        return communities.filter(
            (c) => c.joined || c.isJoined || joinedSet.has(String(c.id).toLowerCase())
        );
    }, [communities, joinedCommunityIds, isLoggedIn]);



    return (
        <div className="w-full h-full flex flex-col justify-between select-none py-1 min-h-0 text-text">
            {/* SCROLLABLE TOP CONTENT: NAV, SHORTCUTS, ADMIN */}
            <div className="flex-1 overflow-y-auto scrollbar-none min-h-0 flex flex-col gap-0 pr-1">
                
                {/* 1. PRIMARY NAVIGATION */}
                <div className="flex flex-col gap-0.5 px-1 pb-3">
                    {/* HOME TAB */}
                    <button
                        type="button"
                        onClick={() => navigate({ to: "/" })}
                        className={cn(
                            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-150 cursor-pointer select-none",
                            isHomeActive
                                ? "bg-primary/10 text-primary font-bold shadow-xs"
                                : "text-text-muted hover:text-text hover:bg-surface-hover/70"
                        )}
                    >
                        <Home className={cn("w-4 h-4 shrink-0", isHomeActive ? "text-primary" : "text-text-muted")} />
                        <span className="flex-1 text-left">{t("common.home", { defaultValue: "Trang chủ" })}</span>
                    </button>

                    {/* GAME TAB (Shows collapsible games & arrow down ONLY when server data exists) */}
                    {hasGames ? (
                        <div className="flex flex-col">
                            <div
                                className={cn(
                                    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-150 cursor-pointer select-none",
                                    isGameHubActive
                                        ? "bg-primary/10 text-primary font-bold shadow-xs"
                                        : "text-text-muted hover:text-text hover:bg-surface-hover/70"
                                )}
                            >
                                {/* Click on Game Label -> Navigates to /game */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        navigate({ to: "/game" });
                                        if (!isGamesExpanded) setIsGamesExpanded(true);
                                    }}
                                    className="flex items-center gap-3 min-w-0 flex-1 text-left cursor-pointer"
                                >
                                    <Gamepad2 className={cn("w-4 h-4 shrink-0", isGameActive ? "text-primary" : "text-text-muted")} />
                                    <span className="truncate">{t("common.game", { defaultValue: "Trò chơi" })}</span>
                                </button>

                                {/* Arrow to toggle favorite games (No count number) */}
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsGamesExpanded((prev) => !prev);
                                    }}
                                    className="p-1 rounded-md hover:bg-surface-hover text-text-muted hover:text-text transition-colors cursor-pointer shrink-0 ml-1"
                                    title={isGamesExpanded ? "Thu gọn game yêu thích" : "Mở rộng game yêu thích"}
                                >
                                    <ChevronDown
                                        className={cn(
                                            "size-3.5 transition-transform duration-200",
                                            isGamesExpanded ? "rotate-0" : "-rotate-90"
                                        )}
                                    />
                                </button>
                            </div>

                            {/* Collapsible Favorite Games List (Clean, NO stars, NO rating numbers, NO hover scale) */}
                            <div
                                className={cn(
                                    "grid transition-[grid-template-rows,opacity] duration-200 ease-out",
                                    isGamesExpanded
                                        ? "grid-rows-[1fr] opacity-100"
                                        : "grid-rows-[0fr] opacity-0 pointer-events-none"
                                )}
                                aria-hidden={!isGamesExpanded}
                            >
                                <div className="overflow-hidden min-h-0">
                                    <div className="flex flex-col gap-0.5 pl-6 pr-1 pt-1 pb-1">
                                        {displayedGames.map((game) => {
                                            const isThisGameActive = pathname.startsWith(`/game/${game.slug}`);
                                            return (
                                                <button
                                                    key={game.slug}
                                                    type="button"
                                                    onClick={() => navigate({ to: "/game/$gameSlug", params: { gameSlug: game.slug } })}
                                                    className={cn(
                                                        "w-full flex items-center gap-2.5 py-1.5 px-2.5 rounded-lg text-xs transition-colors duration-150 cursor-pointer select-none",
                                                        isThisGameActive
                                                            ? "bg-primary/10 text-primary font-bold shadow-xs"
                                                            : "text-text-muted hover:text-text hover:bg-surface-hover/70 font-medium"
                                                    )}
                                                >
                                                    <img
                                                        src={game.logoUrl || game.bannerUrl}
                                                        alt={game.name}
                                                        className="w-4 h-4 rounded-[4px] object-cover bg-surface-hover shrink-0 border border-border/50"
                                                        onError={(e) => {
                                                            (e.currentTarget as HTMLImageElement).style.display = "none";
                                                        }}
                                                    />
                                                    <span className="truncate flex-1 text-left text-[12px]">
                                                        {game.name}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => navigate({ to: "/game" })}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-150 cursor-pointer select-none",
                                isGameActive
                                    ? "bg-primary/10 text-primary font-bold shadow-xs"
                                    : "text-text-muted hover:text-text hover:bg-surface-hover/70"
                            )}
                        >
                            <Gamepad2 className={cn("w-4 h-4 shrink-0", isGameActive ? "text-primary" : "text-text-muted")} />
                            <span className="flex-1 text-left">{t("common.game", { defaultValue: "Trò chơi" })}</span>
                        </button>
                    )}

                    {/* COMMUNITY TAB */}
                    <button
                        type="button"
                        onClick={() => navigate({ to: "/community" })}
                        className={cn(
                            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-150 cursor-pointer select-none",
                            isCommunityActive
                                ? "bg-primary/10 text-primary font-bold shadow-xs"
                                : "text-text-muted hover:text-text hover:bg-surface-hover/70"
                        )}
                    >
                        <Users className={cn("w-4 h-4 shrink-0", isCommunityActive ? "text-primary" : "text-text-muted")} />
                        <span className="flex-1 text-left">{t("common.community", { defaultValue: "Cộng đồng" })}</span>
                    </button>
                </div>

                {/* 2. YOUR SHORTCUTS (LỐI TẮT CỦA BẠN - NO ICON IN HEADER) */}
                <div className="border-t border-border/80 pt-3 mt-1">
                    <div className="px-3 pb-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-text-faint">
                            {t("common.yourShortcuts", { defaultValue: "Lối tắt của bạn" })}
                        </p>
                    </div>

                    <div className="flex flex-col gap-0.5 px-1 pb-1">
                        {joinedCommunities.length > 0 ? (
                            <>
                                {joinedCommunities.slice(0, 5).map((c, idx) => {
                                    const isThisCommActive = pathname.startsWith(`/community/${c.id}`);
                                    return (
                                        <button
                                            key={`${c.id}-${idx}`}
                                            type="button"
                                            onClick={() => navigate({ to: "/community/$communityId", params: { communityId: String(c.id) } })}
                                            className={cn(
                                                "w-full flex items-center gap-2.5 py-1.5 px-2.5 rounded-lg text-xs transition-colors duration-150 cursor-pointer",
                                                isThisCommActive
                                                    ? "bg-primary/10 text-primary font-bold shadow-xs"
                                                    : "text-text-muted hover:text-text hover:bg-surface-hover/70 font-medium"
                                            )}
                                        >
                                            {c.logo ? (
                                                <img
                                                    src={c.logo}
                                                    alt={c.name}
                                                    className="w-5 h-5 rounded-[5px] object-cover bg-surface-hover shrink-0 border border-border/50"
                                                />
                                            ) : (
                                                <span className="w-5 h-5 rounded-[5px] bg-primary/15 text-primary flex items-center justify-center font-bold text-[10px] shrink-0">
                                                    {c.name.charAt(0).toUpperCase()}
                                                </span>
                                            )}
                                            <span className="truncate flex-1 text-left text-[12px] sm:text-[13px]">{c.name}</span>
                                        </button>
                                    );
                                })}

                                {joinedCommunities.length > 5 && (
                                    <button
                                        type="button"
                                        onClick={() => navigate({ to: "/community" })}
                                        className="w-full text-left px-3 py-1.5 text-[11px] font-bold text-primary hover:underline cursor-pointer transition-colors flex items-center gap-1"
                                    >
                                        <span>{t("common.seeAllCommunities", { defaultValue: "Xem tất cả" })} ({joinedCommunities.length})</span>
                                        <ChevronRight className="w-3 h-3" />
                                    </button>
                                )}
                            </>
                        ) : (
                            <div className="px-3 py-2 text-xs text-text-faint">
                                {t("common.noCommunitiesJoined", { defaultValue: "Chưa tham gia cộng đồng nào" })}
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. ADMIN / MODERATION (Chỉ hiển thị với Admin) */}
                {isAdmin && (
                    <div className="border-t border-border/80 pt-3 mt-2 px-1 flex flex-col gap-0.5">
                        <div className="px-3 pb-1.5">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>{t("common.adminSection", { defaultValue: "Quản trị hệ thống" })}</span>
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                const targetId = pathname.startsWith("/community/") && pathname.split("/")[2]
                                    ? pathname.split("/")[2]
                                    : "cs2-vietnam";
                                navigate({
                                    to: "/community/$communityId",
                                    params: { communityId: targetId },
                                    search: { nav: "manage-reports" },
                                });
                            }}
                            className={cn(
                                "w-full flex items-center justify-between py-2 px-3 rounded-lg text-xs font-semibold transition-colors duration-150 cursor-pointer",
                                pathname.includes("manage-reports")
                                    ? "bg-rose-500/15 text-rose-400 font-bold shadow-xs"
                                    : "text-text-muted hover:text-text hover:bg-surface-hover/70"
                            )}
                            title={t("common.manageReports", { defaultValue: "Xem các báo cáo vi phạm cần xử lý" })}
                        >
                            <div className="flex items-center gap-2.5 min-w-0">
                                <Flag className="w-4 h-4 shrink-0 text-rose-400" />
                                <span className="truncate">{t("common.reports", { defaultValue: "Báo cáo vi phạm" })}</span>
                            </div>
                            {pendingReportsCount > 0 && (
                                <span className="px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-mono font-bold">
                                    {pendingReportsCount}
                                </span>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                const targetId = pathname.startsWith("/community/") && pathname.split("/")[2]
                                    ? pathname.split("/")[2]
                                    : "cs2-vietnam";
                                navigate({
                                    to: "/community/$communityId",
                                    params: { communityId: targetId },
                                    search: { nav: "manage-moderation" },
                                });
                            }}
                            className={cn(
                                "w-full flex items-center gap-2.5 py-2 px-3 rounded-lg text-xs font-semibold transition-colors duration-150 cursor-pointer",
                                pathname.includes("manage-moderation")
                                    ? "bg-primary/15 text-primary font-bold shadow-xs"
                                    : "text-text-muted hover:text-text hover:bg-surface-hover/70"
                            )}
                            title={t("common.moderationCenter", { defaultValue: "Trung tâm kiểm duyệt" })}
                        >
                            <ShieldCheck className="w-4 h-4 shrink-0 text-primary" />
                            <span className="truncate">{t("common.moderationHub", { defaultValue: "Trung tâm kiểm duyệt" })}</span>
                        </button>
                    </div>
                )}
            </div>

            {/* 4. FOOTER: LEGAL & POLICY LINKS */}
            <div className="shrink-0 px-3 pt-2 pb-2 text-[11px] text-text-muted/70 leading-tight select-none border-t border-border/40">
                <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0 leading-tight">
                    <button
                        type="button"
                        onClick={() => {
                            setActiveLegalDoc("privacy");
                            setLegalModalOpen(true);
                        }}
                        className="hover:underline text-text-muted hover:text-text cursor-pointer transition-colors"
                    >
                        {t("common.privacyPolicy", { defaultValue: "Privacy Policy" })}
                    </button>
                    <span className="text-text-faint/60">·</span>
                    <button
                        type="button"
                        onClick={() => {
                            setActiveLegalDoc("terms");
                            setLegalModalOpen(true);
                        }}
                        className="hover:underline text-text-muted hover:text-text cursor-pointer transition-colors"
                    >
                        {t("common.termsOfService", { defaultValue: "Terms of Service" })}
                    </button>
                    <span className="text-text-faint/60">·</span>
                    <button
                        type="button"
                        onClick={() => {
                            setActiveLegalDoc("privacy");
                            setLegalModalOpen(true);
                        }}
                        className="hover:underline text-text-muted hover:text-text cursor-pointer transition-colors"
                    >
                        {t("common.cookiePolicy", { defaultValue: "Cookie Policy" })}
                    </button>
                </div>
                <div className="text-[10px] text-text-faint/60 mt-1 font-mono leading-tight">
                    © {new Date().getFullYear()} Ludon, Inc.
                </div>
            </div>

            {/* Legal Terms & Privacy Modal */}
            <LegalModal
                isOpen={legalModalOpen}
                onClose={() => setLegalModalOpen(false)}
                docType={activeLegalDoc}
            />
        </div>
    );
};
