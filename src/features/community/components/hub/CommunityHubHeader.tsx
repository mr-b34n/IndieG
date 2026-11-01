import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlus,
    faCheck,
    faStar,
    faBullhorn,
    faGamepad,
    faGlobe,
    faBell,
    faBellSlash,
    faEllipsis,
    faChevronDown,
    faRightFromBracket,
    faShareNodes,
    faFlag,
    faLink,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "@/shared/hooks/useTranslate";
import { formatCompactNumber } from "../../constants";

interface CommunityHubHeaderProps {
    name: string;
    description?: string;
    coverUrl: string;
    iconUrl: string;
    membersCount?: number;
    onlineCount?: number;
    isJoined: boolean;
    onToggleJoin: () => void;
    onStartDiscussion?: () => void;
    isVi: boolean;
    isLocked?: boolean;
    announcement?: string;
    featured?: boolean;
    isVerified?: boolean;
    userRole?: "owner" | "admin" | "moderator" | "member";
    gameSlug?: string;
    gameName?: string;
}

export const CommunityHubHeader = ({
    name,
    description,
    coverUrl,
    iconUrl,
    membersCount = 0,
    onlineCount = 1,
    isJoined,
    onToggleJoin,
    onStartDiscussion,
    isLocked,
    announcement,
    featured,
    isVi,
    gameSlug,
    gameName,
}: CommunityHubHeaderProps) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    // Menu States
    const [isJoinedMenuOpen, setIsJoinedMenuOpen] = useState(false);
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
    const [notificationLevel, setNotificationLevel] = useState<"all" | "highlights" | "off">("off");
    const [isFavorite, setIsFavorite] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const joinedMenuRef = useRef<HTMLDivElement>(null);
    const moreMenuRef = useRef<HTMLDivElement>(null);

    // Auto dismiss toast
    useEffect(() => {
        if (!toastMessage) return;
        const timer = setTimeout(() => setToastMessage(null), 2500);
        return () => clearTimeout(timer);
    }, [toastMessage]);

    // Click outside listeners
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (joinedMenuRef.current && !joinedMenuRef.current.contains(e.target as Node)) {
                setIsJoinedMenuOpen(false);
            }
            if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
                setIsMoreMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleCopyLink = () => {
        if (typeof window !== "undefined") {
            navigator.clipboard.writeText(window.location.href);
            setToastMessage(isVi ? "Đã sao chép liên kết cộng đồng!" : "Community link copied to clipboard!");
            setIsJoinedMenuOpen(false);
            setIsMoreMenuOpen(false);
        }
    };

    const handleToggleFavorite = () => {
        setIsFavorite((prev) => !prev);
        setToastMessage(
            !isFavorite
                ? isVi ? "Đã thêm vào mục yêu thích" : "Added to favorites"
                : isVi ? "Đã xóa khỏi mục yêu thích" : "Removed from favorites"
        );
        setIsMoreMenuOpen(false);
    };

    const handleNotificationChange = (level: "all" | "highlights" | "off") => {
        setNotificationLevel(level);
        setToastMessage(
            level === "all"
                ? isVi ? "Bật thông báo tất cả bài đăng" : "All notifications enabled"
                : level === "highlights"
                ? isVi ? "Chỉ nhận thông báo bài viết nổi bật" : "Highlights only"
                : isVi ? "Đã tắt thông báo" : "Notifications muted"
        );
        setIsJoinedMenuOpen(false);
    };

    return (
        <div className="w-full flex flex-col gap-2 select-none relative">
            {/* Toast Feedback Popup */}
            {toastMessage && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-surface-active/95 border border-border shadow-2xl text-xs font-semibold text-text backdrop-blur-md animate-slide-up flex items-center gap-2">
                    <FontAwesomeIcon icon={faCheck} className="text-emerald-400 text-xs" />
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* Optional Announcement Strip */}
            {announcement && (
                <div className="w-full px-3.5 py-2 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-xs font-medium flex items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-2 min-w-0">
                        <FontAwesomeIcon icon={faBullhorn} className="text-rose-400 text-xs shrink-0" />
                        <span className="truncate">{announcement}</span>
                    </div>
                </div>
            )}

            {/* 1. ATMOSPHERIC COVER BANNER (Tumblr & Reddit Hybrid) */}
            <div className="relative w-full h-44 sm:h-52 rounded-2xl overflow-hidden border border-border/60 bg-surface-inner shadow-sm group">
                <img
                    src={coverUrl}
                    alt={name}
                    className="w-full h-full object-cover brightness-[0.88] saturate-[1.1]"
                />
                {/* Multi-layered cinematic gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/40 pointer-events-none" />

                {/* Tumblr-style Top Metadata Pills inside Banner */}
                <div className="absolute top-3 left-3 sm:top-3.5 sm:left-4 z-10 flex items-center gap-2 flex-wrap">
                    {/* Public status pill */}
                    <div className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-white/95 text-[11px] font-semibold flex items-center gap-1.5 shadow-sm">
                        <FontAwesomeIcon icon={faGlobe} className="text-[10px] text-white/80" />
                        <span>{isVi ? "Công khai" : "Public"}</span>
                    </div>
                </div>

                {/* Optional linked Game Page badge in top-right */}
                {gameSlug && (
                    <div className="absolute top-3 right-3 sm:top-3.5 sm:right-4 z-10">
                        <button
                            type="button"
                            onClick={() => navigate({ to: `/game/${gameSlug}` as string })}
                            className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md hover:bg-black/80 border border-white/20 text-white text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                            title={isVi ? `Xem trang game ${gameName || ""}` : `View ${gameName || ""} game`}
                        >
                            <FontAwesomeIcon icon={faGamepad} className="text-[10px] text-primary" />
                            <span className="truncate max-w-[140px]">{gameName || "Game"}</span>
                        </button>
                    </div>
                )}
            </div>

            {/* 2. COMMUNITY IDENTITY & REDDIT/FB ACTION BAR */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3.5 px-2 sm:px-3 pt-0">
                {/* Left: Avatar overlapping banner + Name & Subtitle */}
                <div className="flex items-start gap-3.5 sm:gap-4 min-w-0 flex-1">
                    {/* Overlapping Avatar */}
                    <div className="-mt-8 sm:-mt-10 relative shrink-0">
                        <img
                            src={iconUrl || coverUrl}
                            alt={name}
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover bg-surface border-4 border-bg shadow-xl"
                            onError={(e) => {
                                if (coverUrl && e.currentTarget.src !== coverUrl) {
                                    e.currentTarget.src = coverUrl;
                                }
                            }}
                        />
                    </div>

                    {/* Community Title & Tagline */}
                    <div className="flex flex-col min-w-0 flex-1 pt-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-lg sm:text-xl font-black tracking-tight text-text uppercase leading-tight truncate">
                                {name}
                            </h1>

                            {featured && (
                                <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-mono font-bold text-[9px] tracking-wider uppercase flex items-center gap-1 shrink-0">
                                    <FontAwesomeIcon icon={faStar} className="text-[8px]" />
                                    <span>FEATURED</span>
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Actions Cluster (FB Joined Dropdown + Options) */}
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 self-start sm:self-end flex-wrap pb-1">
                    {/* Joined State with Facebook-style Dropdown Menu */}
                    <div className="relative" ref={joinedMenuRef}>
                        {isJoined ? (
                            <button
                                type="button"
                                onClick={() => setIsJoinedMenuOpen((prev) => !prev)}
                                className="h-9 px-3.5 rounded-full text-xs font-semibold bg-surface-inner hover:bg-surface-hover text-text border border-border/80 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                            >
                                <FontAwesomeIcon icon={faCheck} className="text-xs text-emerald-400" />
                                <span>{isVi ? "Đã tham gia" : "Joined"}</span>
                                <FontAwesomeIcon
                                    icon={faChevronDown}
                                    className={`text-[9px] text-text-muted transition-transform duration-200 ${
                                        isJoinedMenuOpen ? "rotate-180" : ""
                                    }`}
                                />
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={onToggleJoin}
                                className="h-9 px-4 rounded-full text-xs font-bold bg-primary hover:bg-primary/90 text-white border border-primary shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                            >
                                <FontAwesomeIcon icon={faPlus} className="text-xs" />
                                <span>{isVi ? "Tham gia" : "Join"}</span>
                            </button>
                        )}

                        {/* Facebook-style Joined Dropdown Menu */}
                        {isJoined && isJoinedMenuOpen && (
                            <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-surface border border-border/80 shadow-2xl py-1.5 z-50 animate-dropdown text-xs font-medium">
                                <div className="px-3.5 py-1.5 text-[10px] font-mono uppercase tracking-wider text-text-faint border-b border-border/40">
                                    {isVi ? "Tùy chọn thành viên" : "Membership Options"}
                                </div>

                                {/* Manage Notifications */}
                                <div className="px-1 py-1">
                                    <button
                                        type="button"
                                        onClick={() => handleNotificationChange(notificationLevel === "off" ? "all" : "off")}
                                        className="w-full px-3 py-2 rounded-lg text-left hover:bg-surface-hover text-text flex items-center justify-between transition-colors cursor-pointer"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <FontAwesomeIcon
                                                icon={notificationLevel === "off" ? faBellSlash : faBell}
                                                className="text-text-muted text-xs w-4"
                                            />
                                            <span>{isVi ? "Thông báo cộng đồng" : "Community notifications"}</span>
                                        </div>
                                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface-inner text-text-faint">
                                            {notificationLevel === "off" ? (isVi ? "Đang tắt" : "Muted") : (isVi ? "Đang bật" : "Active")}
                                        </span>
                                    </button>

                                    {/* Share Group */}
                                    <button
                                        type="button"
                                        onClick={handleCopyLink}
                                        className="w-full px-3 py-2 rounded-lg text-left hover:bg-surface-hover text-text flex items-center gap-2.5 transition-colors cursor-pointer"
                                    >
                                        <FontAwesomeIcon icon={faShareNodes} className="text-text-muted text-xs w-4" />
                                        <span>{isVi ? "Chia sẻ cộng đồng" : "Share community"}</span>
                                    </button>
                                </div>

                                <div className="border-t border-border/40 my-0.5" />

                                {/* Leave Group */}
                                <div className="px-1 py-1">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsJoinedMenuOpen(false);
                                            onToggleJoin();
                                        }}
                                        className="w-full px-3 py-2 rounded-lg text-left text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 flex items-center gap-2.5 font-semibold transition-colors cursor-pointer"
                                    >
                                        <FontAwesomeIcon icon={faRightFromBracket} className="text-xs w-4" />
                                        <span>{isVi ? "Rời khỏi nhóm" : "Leave group"}</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Reddit/Tumblr More Options Menu ("...") */}
                    <div className="relative" ref={moreMenuRef}>
                        <button
                            type="button"
                            onClick={() => setIsMoreMenuOpen((prev) => !prev)}
                            className="w-9 h-9 rounded-full bg-surface-inner hover:bg-surface-hover border border-border/80 flex items-center justify-center text-text-muted hover:text-text transition-colors cursor-pointer shadow-xs"
                            title={isVi ? "Tùy chọn khác" : "More options"}
                        >
                            <FontAwesomeIcon icon={faEllipsis} className="text-xs" />
                        </button>

                        {isMoreMenuOpen && (
                            <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl bg-surface border border-border/80 shadow-2xl py-1.5 z-50 animate-dropdown text-xs font-medium">
                                <button
                                    type="button"
                                    onClick={handleToggleFavorite}
                                    className="w-full px-3.5 py-2 text-left hover:bg-surface-hover text-text flex items-center gap-2.5 transition-colors cursor-pointer"
                                >
                                    <FontAwesomeIcon
                                        icon={faStar}
                                        className={`text-xs w-4 ${isFavorite ? "text-amber-400" : "text-text-muted"}`}
                                    />
                                    <span>
                                        {isFavorite
                                            ? (isVi ? "Xóa khỏi mục yêu thích" : "Remove from favorites")
                                            : (isVi ? "Thêm vào mục yêu thích" : "Add to favorites")}
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    onClick={handleCopyLink}
                                    className="w-full px-3.5 py-2 text-left hover:bg-surface-hover text-text flex items-center gap-2.5 transition-colors cursor-pointer"
                                >
                                    <FontAwesomeIcon icon={faLink} className="text-text-muted text-xs w-4" />
                                    <span>{isVi ? "Sao chép liên kết" : "Copy link"}</span>
                                </button>

                                {gameSlug && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsMoreMenuOpen(false);
                                            navigate({ to: `/game/${gameSlug}` as string });
                                        }}
                                        className="w-full px-3.5 py-2 text-left hover:bg-surface-hover text-text flex items-center gap-2.5 transition-colors cursor-pointer"
                                    >
                                        <FontAwesomeIcon icon={faGamepad} className="text-text-muted text-xs w-4" />
                                        <span>{isVi ? "Xem trang game" : "View game page"}</span>
                                    </button>
                                )}

                                <div className="border-t border-border/40 my-1" />

                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsMoreMenuOpen(false);
                                        setToastMessage(isVi ? "Cảm ơn bạn đã gửi báo cáo" : "Report submitted");
                                    }}
                                    className="w-full px-3.5 py-2 text-left text-text-faint hover:text-rose-400 hover:bg-rose-500/10 flex items-center gap-2.5 transition-colors cursor-pointer"
                                >
                                    <FontAwesomeIcon icon={faFlag} className="text-xs w-4" />
                                    <span>{isVi ? "Báo cáo cộng đồng" : "Report community"}</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
