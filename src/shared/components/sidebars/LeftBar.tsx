import {
    faUsers, faHouse,
    faGear, faShieldHalved,
    faCompass, faPlus,
    faRightFromBracket
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useNavigate, useLocation } from "@tanstack/react-router"

import { useAuthStore } from "@/features/auth";
import { getCurrentAuthor } from "@/features/post";
import { useCommunitiesStore } from "@/features/community";
import { useTranslation } from "@/shared/hooks/useTranslate";

const navItem = `
    w-full flex flex-row items-center gap-3 px-3 py-2
    rounded-lg text-xs sm:text-sm font-medium text-[#8B9097]
    hover:text-[#E8E9EA] hover:bg-[#14171A]
    transition-colors duration-150 cursor-pointer select-none
`;
const navItemActive = `
    w-full flex flex-row items-center gap-2.5 pl-2.5 pr-3 py-2
    rounded-r-lg text-xs sm:text-sm font-bold
    bg-[#14171A] text-[#E8E9EA] border-l-2 border-[#1688E8]
    cursor-pointer select-none transition-colors duration-150
`;
const sectionLabel = `
    px-3 pt-3 pb-1.5
    text-[10px] font-bold uppercase tracking-wider text-[#5F646B]
`;

export const LeftBar = () => {
    const communities = useCommunitiesStore((state) => state.communities);
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const {t} = useTranslation();
    const user = useAuthStore((state) => state.user);
    const mockLogin = useAuthStore((state) => state.mockLogin);
    const customAvatar = useAuthStore((state) => state.customAvatar);
    const logout = useAuthStore((state) => state.logout);
    const isLoggedIn = !!user || mockLogin;
    const isAdmin = user?.role === "admin";

    const isHomeActive = pathname === "/" || pathname.startsWith("/post");
    const isExploreActive = pathname.startsWith("/explore");
    const isCommunityActive = pathname.startsWith("/community");
    const isSettingsActive = pathname.startsWith("/settings");
    const isAdminActive = pathname.startsWith("/admin");

    const displayName = user?.name || user?.username || getCurrentAuthor();
    const avatarUrl =
        user?.avatarUrl ||
        user?.avatar_url ||
        customAvatar ||
        (user?.user_metadata?.avatar_url as string | undefined) ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.username || displayName || "Felix")}`;

    const handleProfileClick = () => {
        navigate({ to: "/profile/$userId", params: { userId: "me" } });
    };

    const handleLogout = (e: React.MouseEvent) => {
        e.stopPropagation();
        logout();
        navigate({ to: "/auth" });
    };

    const joinedCommunities = communities.filter((c) => c.joined);

    return (
        <div className="w-full flex flex-col gap-1 py-1 text-text select-none">
            {/* User Profile Mini Snippet */}
            {isLoggedIn ? (
                <div
                    onClick={handleProfileClick}
                    className="flex flex-row items-center gap-3 px-3 py-2.5 mb-1
                        rounded-md cursor-pointer hover:bg-surface-hover/70 transition-colors group"
                >
                    <img
                        src={avatarUrl}
                        alt="avatar"
                        className="w-8 h-8 rounded-full ring-1 ring-border/80 shrink-0 object-cover"
                    />
                    <div className="flex flex-col leading-tight min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                            <p className="font-bold text-xs sm:text-sm text-text truncate">{displayName}</p>
                            {isAdmin && (
                                <span className="px-1.5 py-0.2 rounded bg-rose-500 text-white font-black text-[9px] uppercase tracking-wider shrink-0 flex items-center gap-1 shadow-xs border border-rose-400/50">
                                    <FontAwesomeIcon icon={faShieldHalved} className="text-[8px]" />
                                    <span>ADMIN</span>
                                </span>
                            )}
                        </div>
                        <p className="text-[11px] text-text-faint">
                            {isAdmin ? t('common.systemAdmin', { defaultValue: "Quản trị viên hệ thống" }) : user ? t('common.viewProfile') : t('common.signedInDemo')}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleLogout}
                        title={t('common.logout', { defaultValue: 'Đăng xuất' })}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-text-faint hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0 opacity-80 group-hover:opacity-100"
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
                    <FontAwesomeIcon icon={faHouse} className={`w-4 shrink-0 ${isHomeActive ? 'text-[#1688E8]' : 'text-[#8B9097]'}`} />
                    <span>{t('common.home')}</span>
                </button>

                <button
                    type="button"
                    onClick={() => navigate({to: "/explore"})}
                    className={isExploreActive ? navItemActive : navItem}
                >
                    <FontAwesomeIcon icon={faCompass} className={`w-4 shrink-0 ${isExploreActive ? 'text-[#1688E8]' : 'text-[#8B9097]'}`} />
                    <span>{t('common.explore', { defaultValue: 'Explore' })}</span>
                </button>

                <button
                    type="button"
                    onClick={() => navigate({ to: "/community" })}
                    className={isCommunityActive ? navItemActive : navItem}
                >
                    <FontAwesomeIcon icon={faUsers} className={`w-4 shrink-0 ${isCommunityActive ? 'text-[#1688E8]' : 'text-[#8B9097]'}`} />
                    <span>{t('common.community')}</span>
                </button>
            </div>

            {/* SECTION: YOUR SHORTCUTS (LỐI TẮT CỦA BẠN - FB STYLE) */}
            <div className="border-t border-[#1C1F22] pt-3 mt-2">
                <div className="flex items-center justify-between px-3 pb-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#5F646B]">
                        {t('common.yourShortcuts', { defaultValue: 'Lối tắt của bạn' })}
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate({ to: "/community" })}
                        className="text-[10px] font-bold text-[#1688E8] hover:underline cursor-pointer flex items-center gap-1"
                        title={t('common.explore', { defaultValue: 'Khám phá' })}
                    >
                        <FontAwesomeIcon icon={faPlus} className="text-[9px]" />
                        <span>{t('common.explore', { defaultValue: 'Khám phá' })}</span>
                    </button>
                </div>

                <div className="flex flex-col gap-0.5 px-1 pb-1">
                    {joinedCommunities.length > 0 ? (
                        <>
                            {joinedCommunities.slice(0, 5).map((c) => {
                                const isThisCommActive = pathname.startsWith(`/community/${c.id}`);
                                return (
                                    <button
                                        key={c.id}
                                        type="button"
                                        onClick={() => navigate({ to: "/community/$communityId", params: { communityId: String(c.id) } })}
                                        className={`w-full flex items-center gap-2.5 py-1.5 px-2.5 rounded-lg text-xs transition-colors cursor-pointer group ${
                                            isThisCommActive
                                                ? "bg-[#14171A] text-[#E8E9EA] font-bold border-l-2 border-[#1688E8]"
                                                : "text-[#8B9097] hover:text-[#E8E9EA] hover:bg-[#14171A] font-medium"
                                        }`}
                                    >
                                        {c.logo ? (
                                            <img
                                                src={c.logo}
                                                alt={c.name}
                                                className="w-5 h-5 rounded-[5px] object-cover bg-[#1C1F26] shrink-0 border border-[#2B303C]/40"
                                            />
                                        ) : (
                                            <span className="w-5 h-5 rounded-[5px] bg-[#1688E8]/15 text-[#1688E8] flex items-center justify-center font-bold text-[10px] shrink-0">
                                                {c.name.charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                        <span className="truncate flex-1 text-left">{c.name}</span>
                                    </button>
                                );
                            })}

                            {joinedCommunities.length > 5 && (
                                <button
                                    type="button"
                                    onClick={() => navigate({ to: "/community" })}
                                    className="w-full text-left px-3 py-1.5 text-[11px] font-bold text-[#1688E8] hover:underline cursor-pointer transition-colors"
                                >
                                    {t('common.seeAllCommunities', { defaultValue: `Xem tất cả (${joinedCommunities.length})` })}
                                </button>
                            )}
                        </>
                    ) : (
                        <div className="px-3 py-2 text-xs text-[#5F646B]">
                            {t('community.noCommunitiesJoined', { defaultValue: 'Chưa tham gia cộng đồng nào' })}
                        </div>
                    )}
                </div>
            </div>

            {/* SYSTEM SETTINGS */}
            <div className="border-t border-[#1C1F22] pt-3 mt-2 px-1 flex flex-col gap-0.5">
                {isAdmin && (
                    <button
                        type="button"
                        onClick={() => navigate({ to: "/admin" })}
                        className={`${isAdminActive ? navItemActive : navItem}`}
                    >
                        <FontAwesomeIcon icon={faShieldHalved} className="w-4 shrink-0 text-amber-500" />
                        <span>{t('common.adminUi', { defaultValue: 'Quản trị hệ thống' })}</span>
                    </button>
                )}

                <button
                    type="button"
                    onClick={() => navigate({to: "/settings"})}
                    className={`${isSettingsActive ? navItemActive : navItem}`}
                >
                    <FontAwesomeIcon icon={faGear} className={`w-4 shrink-0 ${isSettingsActive ? 'text-[#1688E8]' : 'text-[#8B9097]'}`} />
                    <span>{t('common.settings')}</span>
                </button>
            </div>
        </div>
    )
}
