import { useNavigate, useLocation } from "@tanstack/react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faHouse,
    faUsers,
    faCompass,
    faGamepad,
    faGear,
    faRightFromBracket,
    faShieldHalved,
    faFlag,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "@/shared/hooks/useTranslate";
import { useCommunitiesStore } from "@/features/community/store/useCommunitiesStore";
import { useAuthStore } from "@/features/auth";
import { getCurrentAuthor } from "@/features/post";
import { useEffect, useMemo } from "react";
import { useCommunitiesQuery, useReportsQuery } from "@/shared/api/useQueries";
import { extractReportList } from "@/shared/api";

const navItem = `
    w-full flex flex-row items-center gap-3 px-3 py-2
    rounded-lg text-xs sm:text-sm font-medium text-text-muted
    hover:text-text hover:bg-surface-hover
    transition-colors duration-150 cursor-pointer select-none
`;
const navItemActive = `
    w-full flex flex-row items-center gap-2.5 pl-2.5 pr-3 py-2
    rounded-r-lg text-xs sm:text-sm font-bold
    bg-surface-hover text-text border-l-2 border-primary
    cursor-pointer select-none transition-colors duration-150
`;
const sectionLabel = `
    px-3 pt-3 pb-1.5
    text-[10px] font-bold uppercase tracking-wider text-text-faint
`;

export const LeftBar = () => {
    const communities = useCommunitiesStore((state) => state.communities);
    const syncJoinedCommunities = useCommunitiesStore((state) => state.syncJoinedCommunities);
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const {t} = useTranslation();
    const user = useAuthStore((state) => state.user);
    const mockLogin = useAuthStore((state) => state.mockLogin);
    const customAvatar = useAuthStore((state) => state.customAvatar);
    const logout = useAuthStore((state) => state.logout);
    const isLoggedIn = !!user || mockLogin;

    const { data: remoteCommunities } = useCommunitiesQuery();

    useEffect(() => {
        if (remoteCommunities) {
            const list = Array.isArray(remoteCommunities) ? remoteCommunities : (remoteCommunities as { items?: unknown[] }).items || [];
            if (Array.isArray(list) && list.length > 0) {
                syncJoinedCommunities(list as Parameters<typeof syncJoinedCommunities>[0]);
            }
        }
    }, [remoteCommunities, syncJoinedCommunities]);

    const isHomeActive = pathname === "/";
    const isCommunityActive = pathname.startsWith("/community");
    const isExploreActive = pathname.startsWith("/explore");
    const isSquadActive = pathname.startsWith("/squad");
    const isSettingsActive = pathname.startsWith("/settings");

    const displayName = user?.name || user?.username || getCurrentAuthor();
    const avatarUrl =
        user?.avatarUrl ||
        user?.avatar_url ||
        customAvatar ||
        (user?.user_metadata?.avatar_url as string | undefined) ||
        "";

    const isAdmin = Boolean(
        user?.role === "admin" ||
        user?.id === "usr_admin" ||
        user?.username === "IndieAdmin" ||
        user?.email === "admin@indieg.com"
    );

    const { data: reportsData } = useReportsQuery(undefined, { enabled: isAdmin });
    const pendingReportsCount = useMemo(() => {
        if (!isAdmin) return 0;
        return extractReportList(reportsData).filter((r) => r.status === "pending").length;
    }, [isAdmin, reportsData]);

    const joinedCommunities = useMemo(() => {
        return communities.filter((c) => c.joined || c.isJoined);
    }, [communities]);

    const handleLogout = (e: React.MouseEvent) => {
        e.stopPropagation();
        logout();
        navigate({ to: "/auth" });
    };

    return (
        <div className="w-full flex flex-col gap-0 select-none py-1">
            {/* MINI PROFILE ROW / LOGIN REMINDER */}
            {isLoggedIn ? (
                <div
                    onClick={() => navigate({ to: "/profile/$userId", params: { userId: "me" } })}
                    className="flex items-center gap-3 px-3 py-2 mb-2 rounded-xl bg-surface/50 hover:bg-surface-hover/80 border border-border/40 transition-colors cursor-pointer group"
                    title={t('common.viewProfile', { defaultValue: 'Xem trang cá nhân của bạn' })}
                >
                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt="avatar"
                            className="w-8 h-8 rounded-full ring-1 ring-border/80 shrink-0 object-cover"
                            onError={(e) => {
                                (e.currentTarget as HTMLImageElement).style.display = "none";
                            }}
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-surface-hover ring-1 ring-border/80 shrink-0 flex items-center justify-center text-xs font-bold text-primary uppercase select-none">
                            {(displayName || "G").replace(/^@/, "").charAt(0) || "G"}
                        </div>
                    )}
                    <div className="flex flex-col leading-tight min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                            <p className="font-bold text-xs sm:text-sm text-text truncate">{displayName}</p>
                        </div>
                        <p className="text-[11px] text-text-faint">
                            {user ? t('common.viewProfile') : t('common.signedInDemo')}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleLogout}
                        title={t('common.logout', { defaultValue: 'Đăng xuất' })}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-text-faint hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0 opacity-80 group-hover:opacity-100"
                    >
                        <FontAwesomeIcon icon={faRightFromBracket} className="text-xs" />
                    </button>
                </div>
            ) : (
                <div className="flex flex-col gap-2 px-3 py-2 mb-2 pb-3 border-b border-border/40">
                    <p className="text-xs font-semibold text-text-muted">{t('authenticate.notLoginRemindTitle')}</p>
                    <button
                        type="button"
                        onClick={() => navigate({ to: "/auth" })}
                        className="w-full px-3 py-1.5 rounded-md text-xs font-bold
                            bg-primary text-white hover:bg-primary-hover
                            transition-colors duration-150 cursor-pointer text-center"
                    >
                        {t('authenticate.login')}
                    </button>
                </div>
            )}

            {/* SECTION: SOCIAL */}
            <p className={sectionLabel}>{t('common.social', { defaultValue: 'Social' })}</p>
            <div className="flex flex-col gap-0.5 px-1 pb-2">
                <button
                    type="button"
                    onClick={() => navigate({to: "/"})}
                    className={isHomeActive ? navItemActive : navItem}
                >
                    <FontAwesomeIcon icon={faHouse} className={`w-4 shrink-0 ${isHomeActive ? 'text-primary' : 'text-text-muted'}`} />
                    <span>{t('common.home')}</span>
                </button>

                <button
                    type="button"
                    onClick={() => navigate({ to: "/community" })}
                    className={isCommunityActive ? navItemActive : navItem}
                >
                    <FontAwesomeIcon icon={faUsers} className={`w-4 shrink-0 ${isCommunityActive ? 'text-primary' : 'text-text-muted'}`} />
                    <span>{t('common.community')}</span>
                </button>

                <button
                    type="button"
                    onClick={() => navigate({ to: "/explore" })}
                    className={isExploreActive ? navItemActive : navItem}
                >
                    <FontAwesomeIcon icon={faCompass} className={`w-4 shrink-0 ${isExploreActive ? 'text-primary' : 'text-text-muted'}`} />
                    <span>{t('common.explore', { defaultValue: 'Khám phá' })}</span>
                </button>

                <button
                    type="button"
                    onClick={() => navigate({ to: "/squad" })}
                    className={isSquadActive ? navItemActive : navItem}
                >
                    <FontAwesomeIcon icon={faGamepad} className={`w-4 shrink-0 ${isSquadActive ? 'text-primary' : 'text-text-muted'}`} />
                    <span>{t('squad.title', { defaultValue: 'Tổ đội' })}</span>
                </button>
            </div>

            {/* SECTION: YOUR SHORTCUTS (LỐI TẮT CỦA BẠN - FB STYLE) */}
            <div className="border-t border-border pt-3 mt-2">
                <div className="flex items-center justify-between px-3 pb-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-text-faint">
                        {t('common.yourShortcuts', { defaultValue: 'Lối tắt của bạn' })}
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
                                        className={`w-full flex items-center gap-2.5 py-1.5 px-2.5 rounded-lg text-xs transition-colors cursor-pointer group ${
                                            isThisCommActive
                                                ? "bg-surface-hover text-text font-bold border-l-2 border-primary"
                                                : "text-text-muted hover:text-text hover:bg-surface-hover font-medium"
                                        }`}
                                    >
                                        {c.logo ? (
                                            <img
                                                src={c.logo}
                                                alt={c.name}
                                                className="w-5 h-5 rounded-[5px] object-cover bg-surface-hover shrink-0 border border-border/40"
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
                                    className="w-full text-left px-3 py-1.5 text-[11px] font-bold text-primary hover:underline cursor-pointer transition-colors"
                                >
                                    {t('common.seeAllCommunities', { defaultValue: `Xem tất cả` })} ({joinedCommunities.length})
                                </button>
                            )}
                        </>
                    ) : (
                        <div className="px-3 py-2 text-xs text-text-faint">
                            {t('common.noCommunitiesJoined', { defaultValue: 'Chưa tham gia cộng đồng nào' })}
                        </div>
                    )}
                </div>
            </div>

            {/* ADMIN / MODERATION (Only visible for Admins) */}
            {isAdmin && (
                <div className="border-t border-border pt-3 mt-2 px-1 flex flex-col gap-0.5">
                    <div className="flex items-center justify-between px-3 pb-1.5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                            {t('common.adminSection', { defaultValue: 'Quản trị hệ thống' })}
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
                        className={`w-full flex items-center justify-between py-2 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer group ${
                            pathname.includes("manage-reports")
                                ? "bg-rose-500/15 text-rose-400 border-l-2 border-rose-500 font-bold"
                                : "text-text-muted hover:text-text hover:bg-surface-hover"
                        }`}
                        title={t('common.manageReports', { defaultValue: 'Xem các báo cáo vi phạm cần xử lý' })}
                    >
                        <div className="flex items-center gap-2.5 min-w-0">
                            <FontAwesomeIcon icon={faFlag} className="w-4 shrink-0 text-rose-400" />
                            <span className="truncate">{t('common.reports', { defaultValue: 'Báo cáo vi phạm' })}</span>
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
                        className={`w-full flex items-center gap-2.5 py-2 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer group ${
                            pathname.includes("manage-moderation")
                                ? "bg-primary/15 text-primary border-l-2 border-primary font-bold"
                                : "text-text-muted hover:text-text hover:bg-surface-hover"
                        }`}
                        title={t('common.moderationCenter', { defaultValue: 'Trung tâm kiểm duyệt' })}
                    >
                        <FontAwesomeIcon icon={faShieldHalved} className="w-4 shrink-0 text-primary" />
                        <span className="truncate">{t('common.moderationHub', { defaultValue: 'Trung tâm kiểm duyệt' })}</span>
                    </button>
                </div>
            )}

            {/* SYSTEM SETTINGS */}
            <div className="border-t border-border pt-3 mt-2 px-1 flex flex-col gap-0.5">
                <button
                    type="button"
                    onClick={() => navigate({to: "/settings"})}
                    className={`${isSettingsActive ? navItemActive : navItem}`}
                >
                    <FontAwesomeIcon icon={faGear} className={`w-4 shrink-0 ${isSettingsActive ? 'text-primary' : 'text-text-muted'}`} />
                    <span>{t('common.settings')}</span>
                </button>
            </div>
        </div>
    );
};
