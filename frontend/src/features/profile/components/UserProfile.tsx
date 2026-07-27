import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "@/shared/hooks/useTranslate";
import { useAuthStore } from "@/features/auth";
import { usePostsStore, getCurrentAuthor, Post } from "@/features/post";
import { getUserRankConfig, getRankLabel } from "@/features/post/helpers/userRanks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUserEdit, faCheck, faXmark, faGamepad, faLocationDot,
    faCalendarAlt, faFire, faTrophy, faShieldHalved, faClock,
    faMedal, faCrown, faBolt, faUserPlus, faUserCheck, faBell, faCommentDots,
    faCheckCircle, faUsers, faCamera, faSearchPlus,
    faSearchMinus, faCrop, faTrash, faPlus, faBan
} from "@fortawesome/free-solid-svg-icons";

import cs2Bg from "../../../assets/bgs/cs2_bg.jpg";
import raftLogo from "../../../assets/logos/raft-logo.png";
import rdr2Logo from "../../../assets/logos/rdr2-logo.png";
import cs2Logo from "../../../assets/logos/cs2-logo.webp";

const AvatarCropperModal = ({
    rawImageSrc,
    onClose,
    onSave,
}: {
    rawImageSrc: string;
    onClose: () => void;
    onSave: (croppedDataUrl: string) => void;
}) => {
    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    };

    const handleMouseUp = () => setIsDragging(false);

    const handleTouchStart = (e: React.TouchEvent) => {
        const touch = e.touches[0];
        setIsDragging(true);
        setDragStart({ x: touch.clientX - offset.x, y: touch.clientY - offset.y });
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return;
        const touch = e.touches[0];
        setOffset({ x: touch.clientX - dragStart.x, y: touch.clientY - dragStart.y });
    };

    const handleCrop = () => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            const canvas = document.createElement("canvas");
            const size = 400; // square output
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            const containerSize = 256;
            const scaleRatio = size / containerSize;

            ctx.fillStyle = "#121212";
            ctx.fillRect(0, 0, size, size);

            ctx.save();
            ctx.translate((containerSize / 2 + offset.x) * scaleRatio, (containerSize / 2 + offset.y) * scaleRatio);
            ctx.scale(zoom * scaleRatio, zoom * scaleRatio);

            const baseScale = Math.max(containerSize / img.naturalWidth, containerSize / img.naturalHeight);
            const drawW = img.naturalWidth * baseScale;
            const drawH = img.naturalHeight * baseScale;
            ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
            ctx.restore();

            const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
            onSave(dataUrl);
        };
        img.src = rawImageSrc;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-surface border border-border rounded-3xl p-6 max-w-md w-full flex flex-col items-center gap-5 shadow-2xl">
                <div className="w-full flex items-center justify-between border-b border-border pb-3">
                    <h4 className="font-bold text-text flex items-center gap-2">
                        <FontAwesomeIcon icon={faCrop} className="text-primary" />
                        <span>Cắt ảnh đại diện (Vùng tròn hiển thị)</span>
                    </h4>
                    <button type="button" onClick={onClose} className="text-text-faint hover:text-text cursor-pointer">
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                </div>

                <div
                    className="w-64 h-64 relative overflow-hidden bg-neutral-900 rounded-3xl cursor-move select-none flex items-center justify-center border-2 border-border shadow-inner"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleMouseUp}
                >
                    <img
                        src={rawImageSrc}
                        alt="Crop preview"
                        className="max-w-none pointer-events-none transition-transform duration-75 select-none"
                        style={{
                            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                            maxHeight: "100%",
                            maxWidth: "100%",
                            objectFit: "cover",
                        }}
                    />
                    <div className="absolute inset-0 pointer-events-none rounded-full border-[3px] border-primary/80 shadow-[0_0_0_999px_rgba(0,0,0,0.65)]" />
                </div>

                <div className="w-full flex flex-col gap-2 bg-surface-hover/50 p-3 rounded-2xl border border-border/60">
                    <div className="flex items-center justify-between text-xs font-bold text-text-muted">
                        <span>Phóng to / Thu nhỏ</span>
                        <span>{Math.round(zoom * 100)}%</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button type="button" onClick={() => setZoom(Math.max(1, zoom - 0.1))} className="text-text-faint hover:text-text p-1 cursor-pointer">
                            <FontAwesomeIcon icon={faSearchMinus} />
                        </button>
                        <input
                            type="range"
                            min="1"
                            max="3"
                            step="0.05"
                            value={zoom}
                            onChange={(e) => setZoom(parseFloat(e.target.value))}
                            className="flex-1 accent-primary cursor-pointer"
                        />
                        <button type="button" onClick={() => setZoom(Math.min(3, zoom + 0.1))} className="text-text-faint hover:text-text p-1 cursor-pointer">
                            <FontAwesomeIcon icon={faSearchPlus} />
                        </button>
                    </div>
                    <p className="text-[11px] text-center text-text-faint italic mt-1">
                        * Kéo thả ảnh để di chuyển. Ảnh lưu lại là hình vuông 400x400px.
                    </p>
                </div>

                <div className="w-full flex items-center justify-end gap-3 pt-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-surface-hover hover:bg-border text-text font-bold text-xs transition-colors cursor-pointer">
                        Hủy
                    </button>
                    <button
                        type="button"
                        onClick={handleCrop}
                        className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs transition-colors shadow-md cursor-pointer flex items-center gap-2"
                    >
                        <FontAwesomeIcon icon={faCheck} />
                        <span>Cắt & Lưu ảnh</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

interface UserProfileProps {
    userId: string;
}

export const UserProfile = ({ userId }: UserProfileProps) => {
    const { t, language } = useTranslation();
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const customAvatar = useAuthStore((state) => state.customAvatar);
    const setCustomAvatar = useAuthStore((state) => state.setCustomAvatar);
    const currentAuthor = getCurrentAuthor();

    
    const isOwnProfile = !userId || userId === "demo" || userId === "me" || userId === user?.id || userId === currentAuthor || userId === `@${currentAuthor.toLowerCase().replace(/\s+/g, "_")}`;

    const [activeTab, setActiveTab] = useState<"posts" | "library" | "badges" | "friends">("posts");
    const [isEditing, setIsEditing] = useState(false);
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);

    const friendProfiles: Record<string, { name: string; username: string; bio: string; favGame: string; status: "online" | "in-game" | "offline" }> = {
        ghostrider: { name: "GhostRider", username: "@ghostrider", bio: "Red Dead Redemption 2 enthusiast. Outlaw by day, sheriff by night. Always down for lassoing bounties!", favGame: "Red Dead 2", status: "online" },
        tactical_xeno: { name: "TacticalXeno", username: "@tactical_xeno", bio: "Pro CS2 competitive player & tactical leader. Always online for high rank pushes!", favGame: "CS2 — Rank S", status: "in-game" },
        nightowl: { name: "NightOwl", username: "@nightowl", bio: "Late night gaming only (1 AM - 5 AM). Raft Hardcore survivor & building floating fortresses.", favGame: "Raft", status: "online" },
        maplestrike: { name: "Maplestrike", username: "@maplestrike", bio: "Casual gamer exploring indie titles and RPGs. Currently offline, catch you on the weekend!", favGame: "Stardew Valley", status: "offline" },
    };

    const getInitialProfile = () => {
        if (isOwnProfile) {
            return {
                name: currentAuthor,
                username: `@${currentAuthor.toLowerCase().replace(/\s+/g, "_")}`,
                bio: "FPS Veteran | Raft survival architect | Looking for squad in CS2 Premier & Red Dead Redemption 2. Let's party up!",
                status: "online" as const,
                favGame: "CS2 — Rank S"
            };
        }
        const cleanId = userId?.replace(/^@/, "").toLowerCase() || "";
        return friendProfiles[cleanId] || {
            name: userId?.replace(/^@/, "") || "TacticalXeno",
            username: userId?.startsWith("@") ? userId : `@${userId || "tactical_xeno"}`,
            bio: "Pro competitive player & tactical leader. Always online for high rank pushes!",
            status: "online" as const,
            favGame: "CS2 — Rank S"
        };
    };

    const initial = getInitialProfile();
    const [displayName, setDisplayName] = useState(initial.name);
    const [username, setUsername] = useState(initial.username);
    const [bio, setBio] = useState(initial.bio);
    const [status, setStatus] = useState<"online" | "in-game" | "offline">(initial.status);

    const profileKey = `${userId}-${isOwnProfile}-${currentAuthor}`;
    const [prevProfileKey, setPrevProfileKey] = useState(profileKey);

    if (profileKey !== prevProfileKey) {
        setPrevProfileKey(profileKey);
        setDisplayName(initial.name);
        setUsername(initial.username);
        setBio(initial.bio);
        setStatus(initial.status);
    }

    
    const [friendsList, setFriendsList] = useState([
        { name: "GhostRider", game: "Red Dead 2", logo: rdr2Logo, status: "online", playtime: "2h 14m", isFriend: true },
        { name: "TacticalXeno", game: "CS2 — Rank S", logo: cs2Logo, status: "online", playtime: "45m", isFriend: true },
        { name: "NightOwl", game: "Raft", logo: raftLogo, status: "online", playtime: "1h 03m", isFriend: true },
        { name: "Maplestrike", game: null, logo: null, status: "offline", playtime: null, isFriend: false },
    ]);
    const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({ GhostRider: true, TacticalGamer: true });

    const posts = usePostsStore((state) => state.posts);
    const userPosts = posts.filter((p) => p.author === displayName || p.author === currentAuthor);
    const displayPosts = userPosts.length > 0 ? userPosts : posts.slice(0, 2);

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        setIsEditing(false);
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 3000);
    };

    const toggleFriend = (name: string) => {
        setFriendsList((prev) => {
            const exists = prev.some((f) => f.name === name);
            if (!exists) {
                return [...prev, { name, game: "Game", logo: null, status: "online", playtime: null, isFriend: true }];
            }
            return prev.map((f) => (f.name === name ? { ...f, isFriend: !f.isFriend } : f));
        });
    };

    const isFriend = friendsList.some((f) => f.name === displayName && f.isFriend);
    const isFollowing = !!followingMap[displayName];
    const toggleFollowing = () => setFollowingMap((prev) => ({ ...prev, [displayName]: !prev[displayName] }));

    const avatarUrl =
        isOwnProfile && customAvatar
            ? customAvatar
            : isOwnProfile && user?.user_metadata?.avatar_url
                ? user.user_metadata.avatar_url
                : `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`;

    const forumRank = getUserRankConfig(displayName);

    const libraryGames = [
        { name: "Counter-Strike 2", logo: cs2Logo, hours: 840, lastPlayed: "Jul 26, 2026", achievements: 45, totalAchievements: 50 },
        { name: "Red Dead Redemption 2", logo: rdr2Logo, hours: 260, lastPlayed: "Jul 24, 2026", achievements: 38, totalAchievements: 52 },
        { name: "Raft Hardcore", logo: raftLogo, hours: 140, lastPlayed: "Jul 22, 2026", achievements: 28, totalAchievements: 30 },
    ];

    const badges = [
        { title: t('profile.badges.founderTitle'), desc: t('profile.badges.founderDesc'), icon: faCrown, color: "text-amber-400 bg-amber-400/10 border-amber-400/30" },
        { title: t('profile.badges.leaderTitle'), desc: t('profile.badges.leaderDesc'), icon: faShieldHalved, color: "text-primary bg-primary/10 border-primary/30" },
        { title: t('profile.badges.clutchTitle'), desc: t('profile.badges.clutchDesc'), icon: faTrophy, color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30" },
        { title: t('profile.badges.sharkTitle'), desc: t('profile.badges.sharkDesc'), icon: faMedal, color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/30" },
        { title: t('profile.badges.outlawTitle'), desc: t('profile.badges.outlawDesc'), icon: faFire, color: "text-rose-400 bg-rose-400/10 border-rose-400/30" },
        { title: t('profile.badges.nightOwlTitle'), desc: t('profile.badges.nightOwlDesc'), icon: faClock, color: "text-indigo-400 bg-indigo-400/10 border-indigo-400/30" },
    ];

    return (
        <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 pb-16 animate-fade-in">
            {/* Toast Notification */}
            {showSuccessToast && (
                <div className="fixed top-20 right-6 z-50 bg-success-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-left">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-lg" />
                    <span className="font-semibold text-sm">{t('profile.editSuccess')}</span>
                </div>
            )}

            {/* Header */}
            <div className="relative w-full bg-surface border border-border rounded-2xl overflow-hidden shadow-lg">
                {/* Banner Cover */}
                <div className="relative h-48 sm:h-64 w-full overflow-hidden">
                    <img src={cs2Bg} alt="Cover" className="w-full h-full object-cover object-center brightness-75" />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/30 to-transparent" />
                </div>

                {/* Profile Info */}
                <div className="relative px-4 sm:px-8 pb-6 pt-0 flex flex-col gap-4 z-10">
                    {/* Top */}
                    <div className="flex items-end justify-between w-full -mt-14 sm:-mt-16">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                            <img
                                src={avatarUrl}
                                alt={displayName}
                                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover ring-4 ring-surface bg-surface shadow-xl"
                            />
                            <span
                                className={`absolute bottom-2 right-2 w-5 h-5 rounded-full ring-4 ring-surface flex items-center justify-center ${
                                    status === "online" ? "bg-emerald-500" : status === "in-game" ? "bg-primary" : "bg-neutral-500"
                                }`}
                                title={status === "online" ? t('profile.online') : status === "in-game" ? "Đang chơi game" : t('profile.offline')}
                            >
                                {status === "in-game" && <FontAwesomeIcon icon={faGamepad} className="text-white text-[9px]" />}
                            </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2.5 shrink-0 mb-2">
                            {isOwnProfile ? (
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className="px-4 py-2 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-hover transition-colors flex items-center gap-2 shadow-md cursor-pointer"
                                >
                                    <FontAwesomeIcon icon={faUserEdit} />
                                    <span>{t('profile.editProfile')}</span>
                                </button>
                            ) : (
                                <>
                                    {forumRank.isVerifiedExpert && (
                                        <button
                                            onClick={toggleFollowing}
                                            className={`h-10 px-3.5 sm:px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 shadow-md cursor-pointer ${
                                                isFollowing
                                                    ? "bg-surface-hover border border-border text-text-muted hover:text-text hover:border-text-faint"
                                                    : "bg-amber-500 hover:bg-amber-600 text-white"
                                            }`}
                                            title={isFollowing ? "Đang theo dõi (Nhấn để hủy)" : "Theo dõi tác giả này"}
                                        >
                                            <FontAwesomeIcon icon={isFollowing ? faCheck : faBell} className="text-xs" />
                                            <span>{isFollowing ? "Đang theo dõi" : "Theo dõi"}</span>
                                        </button>
                                    )}
                                    <button
                                        onClick={() => toggleFriend(displayName)}
                                        className={`w-10 h-10 rounded-xl font-bold transition-all flex items-center justify-center shadow-md cursor-pointer ${
                                            isFriend
                                                ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 hover:bg-emerald-500/20"
                                                : "bg-primary text-white hover:bg-primary-hover"
                                        }`}
                                        title={isFriend ? "Bạn bè (Nhấn để hủy kết bạn)" : "Kết bạn / Thêm bạn bè"}
                                    >
                                        <FontAwesomeIcon icon={isFriend ? faUserCheck : faUserPlus} className="text-base" />
                                    </button>
                                    <button
                                        onClick={() => alert("Đã chặn người dùng: " + displayName)}
                                        className="w-10 h-10 rounded-xl bg-surface-hover text-rose-500 border border-border hover:bg-rose-500/10 hover:border-rose-500/30 font-bold transition-all flex items-center justify-center shadow-md cursor-pointer"
                                        title="Chặn người dùng này"
                                    >
                                        <FontAwesomeIcon icon={faBan} className="text-base" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Bottom */}
                    <div className="flex flex-col gap-1 w-full text-center sm:text-left">
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                            <h1 className="text-2xl sm:text-3xl font-black text-text tracking-tight">{displayName}</h1>
                            <span className={`text-xs font-extrabold uppercase px-3 py-1 rounded-full border flex items-center gap-1.5 shadow-2xs ${forumRank.classes}`} title="Danh hiệu kiến thức cộng đồng">
                                <FontAwesomeIcon icon={forumRank.icon} />
                                <span>{getRankLabel(forumRank, language)}</span>
                                {forumRank.isVerifiedExpert && (
                                    <FontAwesomeIcon icon={faCheckCircle} className="text-sky-400 ml-0.5" title="Được Admin/Dev duyệt" />
                                )}
                            </span>
                        </div>
                        <p className="text-sm font-semibold text-text-faint">{username}</p>
                        <p className="text-xs sm:text-sm text-text-muted mt-1 max-w-3xl leading-relaxed">{bio}</p>

                        {/* Meta Info Chips */}
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-5 mt-3 text-xs font-medium text-text-faint">
                            <span className="flex items-center gap-1.5">
                                <FontAwesomeIcon icon={faLocationDot} className="text-primary" />
                                {t('profile.location')}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <FontAwesomeIcon icon={faCalendarAlt} className="text-emerald-500" />
                                {t('profile.joined')}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <FontAwesomeIcon icon={faFire} className="text-amber-500" />
                                {t('profile.reputation')}
                            </span>
                        </div>

                        {/* Connected Accounts */}
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-4">
                            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#171a21] hover:bg-[#1b2838] text-white text-[11px] font-bold rounded-lg border border-border transition-colors">
                                <FontAwesomeIcon icon={faGamepad} className="text-[#66c0f4]" />
                                Steam
                            </button>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#d13639]/10 hover:bg-[#d13639]/20 text-[#d13639] text-[11px] font-bold rounded-lg border border-[#d13639]/20 transition-colors">
                                <FontAwesomeIcon icon={faFire} />
                                Riot Games
                            </button>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#107c10]/10 hover:bg-[#107c10]/20 text-[#107c10] text-[11px] font-bold rounded-lg border border-[#107c10]/20 transition-colors">
                                <FontAwesomeIcon icon={faGamepad} />
                                Xbox Live
                            </button>
                            {isOwnProfile && (
                                <button className="flex items-center justify-center w-7 h-7 bg-surface-hover hover:bg-border text-text-muted hover:text-text rounded-lg transition-colors" title="Kết nối tài khoản khác">
                                    <FontAwesomeIcon icon={faPlus} className="text-[10px]" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 px-4 sm:px-8 py-4 bg-surface-hover/50 border-t border-border text-center">
                    <div className="flex flex-col p-2 rounded-xl bg-surface/60">
                        <span className="text-lg sm:text-xl font-black text-primary">1,240h</span>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-text-faint">{t('profile.stats.playtime')}</span>
                    </div>
                    <div className="flex flex-col p-2 rounded-xl bg-surface/60">
                        <span className="text-lg sm:text-xl font-black text-emerald-500">24</span>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-text-faint">{t('profile.stats.gamesOwned')}</span>
                    </div>
                    <div className="flex flex-col p-2 rounded-xl bg-surface/60">
                        <span className="text-lg sm:text-xl font-black text-amber-500">42</span>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-text-faint">{t('profile.stats.mvpCount')}</span>
                    </div>
                    <div className="flex flex-col p-2 rounded-xl bg-surface/60">
                        <span className="text-lg sm:text-xl font-black text-cyan-500">98%</span>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-text-faint">{t('profile.stats.repScore')}</span>
                    </div>
                </div>
            </div>

            {/* Avatar Cropper Modal */}
            {rawImageSrc && (
                <AvatarCropperModal
                    rawImageSrc={rawImageSrc}
                    onClose={() => setRawImageSrc(null)}
                    onSave={(croppedUrl) => {
                        setCustomAvatar(croppedUrl);
                        setRawImageSrc(null);
                        setShowSuccessToast(true);
                        setTimeout(() => setShowSuccessToast(false), 3000);
                    }}
                />
            )}

            {/* Edit Profile */}
            {isEditing && (
                <form onSubmit={handleSaveProfile} className="w-full bg-surface border border-primary/30 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col gap-4 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                        <h3 className="text-lg font-bold text-text flex items-center gap-2">
                            <FontAwesomeIcon icon={faUserEdit} className="text-primary" />
                            <span>{t('profile.editProfile')}</span>
                        </h3>
                        <button type="button" onClick={() => setIsEditing(false)} className="text-text-faint hover:text-text cursor-pointer">
                            <FontAwesomeIcon icon={faXmark} className="text-lg" />
                        </button>
                    </div>

                    {/* Avatar Upload */}
                    <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-surface-hover/40 border border-border/80">
                        <img src={avatarUrl} alt="Avatar Preview" className="w-20 h-20 rounded-full object-cover ring-2 ring-primary/40 shrink-0 shadow-md" />
                        <div className="flex flex-col gap-1.5 flex-1 text-center sm:text-left">
                            <span className="text-xs font-bold uppercase tracking-wider text-text">Ảnh đại diện tùy chỉnh</span>
                            <p className="text-[11px] text-text-muted leading-relaxed">
                                Tải ảnh lên và căn chỉnh theo khung tròn (ảnh lưu lại có dạng hình vuông tối ưu 400x400px).
                            </p>
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1">
                                <label className="px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs">
                                    <FontAwesomeIcon icon={faCamera} />
                                    <span>Tải ảnh lên...</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onload = (ev) => {
                                                    if (ev.target?.result) {
                                                        setRawImageSrc(ev.target.result as string);
                                                    }
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                </label>
                                {customAvatar && (
                                    <button
                                        type="button"
                                        onClick={() => setCustomAvatar(null)}
                                        className="px-3 py-1.5 rounded-xl bg-surface hover:bg-rose-500/10 text-rose-500 border border-rose-500/30 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                                    >
                                        <FontAwesomeIcon icon={faTrash} />
                                        <span>Xóa ảnh tự đăng</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold uppercase text-text-muted">{t('profile.displayNameLabel')}</label>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className="px-3.5 py-2 rounded-xl bg-surface-hover border border-border text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold uppercase text-text-muted">{t('profile.usernameLabel')}</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="px-3.5 py-2 rounded-xl bg-surface-hover border border-border text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-1.5 sm:col-span-2">
                            <label className="text-xs font-bold uppercase text-text-muted">Bio / About</label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows={2}
                                placeholder={t('profile.bioPlaceholder')}
                                className="px-3.5 py-2 rounded-xl bg-surface-hover border border-border text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5 sm:col-span-2">
                            <label className="text-xs font-bold uppercase text-text-muted">{t('profile.statusLabel')}</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as "online" | "in-game" | "offline")}
                                className="px-3.5 py-2 rounded-xl bg-surface-hover border border-border text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            >
                                <option value="online">🟢 {t('profile.online')}</option>
                                <option value="in-game">🎮 Đang chơi game</option>
                                <option value="offline">⚪ {t('profile.offline')}</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2 rounded-xl bg-surface-hover hover:bg-border text-text font-semibold text-sm transition-colors cursor-pointer"
                        >
                            {t('profile.cancel')}
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-sm transition-colors shadow-md cursor-pointer flex items-center gap-2"
                        >
                            <FontAwesomeIcon icon={faCheck} />
                            <span>{t('profile.saveChanges')}</span>
                        </button>
                    </div>
                </form>
            )}

            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-border overflow-x-auto pb-1 scrollbar-none">
                {[
                    { id: "posts", label: t('profile.tabs.posts'), icon: faCommentDots },
                    { id: "library", label: t('profile.tabs.library'), icon: faGamepad },
                    { id: "badges", label: t('profile.tabs.badges'), icon: faTrophy },
                    { id: "friends", label: t('profile.tabs.friends'), icon: faUsers },
                    ...(isOwnProfile ? [{ id: "blocked", label: "Danh sách chặn", icon: faShieldHalved }] : []),
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as "posts" | "library" | "badges" | "friends" | "blocked")}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer whitespace-nowrap ${
                            activeTab === tab.id
                                ? "bg-primary text-white shadow-md"
                                : "text-text-muted hover:text-text hover:bg-surface-hover"
                        }`}
                    >
                        <FontAwesomeIcon icon={tab.icon} />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Tabs Content */}
            <div className="w-full">
                {/* Posts */}
                {activeTab === "posts" && (
                    <div className="flex flex-col gap-4">
                        {displayPosts.length > 0 ? (
                            displayPosts.map((post) => <Post key={post.id} post={post} />)
                        ) : (
                            <div className="bg-surface border border-border rounded-2xl p-10 text-center flex flex-col items-center justify-center gap-3">
                                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl">
                                    <FontAwesomeIcon icon={faCommentDots} />
                                </div>
                                <h4 className="text-lg font-bold text-text">{t('profile.emptyPosts')}</h4>
                                <p className="text-sm text-text-faint max-w-md">{t('profile.createFirstPost')}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Library */}
                {activeTab === "library" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {libraryGames.map((game) => (
                            <div key={game.name} className="bg-surface border border-border rounded-2xl p-4 flex flex-col justify-between gap-4 hover:border-primary/40 transition-colors shadow-sm">
                                <div className="flex items-center gap-3">
                                    <img src={game.logo} alt={game.name} className="w-14 h-14 rounded-xl object-cover ring-1 ring-border shrink-0" />
                                    <div className="flex flex-col min-w-0">
                                        <h4 className="font-bold text-text text-sm truncate">{game.name}</h4>
                                        <p className="text-xs font-semibold text-primary mt-0.5">{t('profile.library.hoursPlayed', { hours: game.hours })}</p>
                                        <p className="text-[11px] text-text-faint mt-0.5">{t('profile.library.lastPlayed', { date: game.lastPlayed })}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <div className="flex justify-between text-[11px] font-semibold">
                                        <span className="text-text-muted">{t('profile.library.achievements', { completed: game.achievements, total: game.totalAchievements })}</span>
                                        <span className="text-primary">{Math.round((game.achievements / game.totalAchievements) * 100)}%</span>
                                    </div>
                                    <div className="w-full h-2 rounded-full bg-surface-hover overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full" style={{ width: `${(game.achievements / game.totalAchievements) * 100}%` }} />
                                    </div>
                                </div>

                                <button className="w-full py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer">
                                    <FontAwesomeIcon icon={faBolt} />
                                    <span>{t('profile.library.playNow')}</span>
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Badges */}
                {activeTab === "badges" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {badges.map((badge) => (
                            <div key={badge.title} className="bg-surface border border-border rounded-2xl p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
                                <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center text-xl shrink-0 ${badge.color}`}>
                                    <FontAwesomeIcon icon={badge.icon} />
                                </div>
                                <div className="flex flex-col gap-1 min-w-0">
                                    <h4 className="font-bold text-text text-sm">{badge.title}</h4>
                                    <p className="text-xs text-text-muted leading-relaxed">{badge.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Friends */}
                {activeTab === "friends" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {friendsList.map((f) => (
                            <div
                                key={f.name}
                                onClick={() => navigate({ to: "/profile/$userId", params: { userId: `@${f.name.toLowerCase().replace(/\s+/g, "_")}` } })}
                                className="bg-surface border border-border rounded-2xl p-4 flex items-center justify-between gap-3 hover:border-primary/40 transition-colors cursor-pointer"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="relative shrink-0">
                                        <img src={f.logo || raftLogo} alt={f.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-border" />
                                        <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full ring-2 ring-surface ${f.status === "online" ? "bg-emerald-500" : "bg-neutral-500"}`} />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <h4 className="font-bold text-text text-sm truncate">{f.name}</h4>
                                        <p className="text-xs text-primary font-medium truncate">{f.game || t('common.offline')}</p>
                                        {f.playtime && <p className="text-[10px] text-text-faint">{f.playtime}</p>}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleFriend(f.name); }}
                                        className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                                            f.isFriend
                                                ? "bg-surface-hover text-text-muted hover:bg-rose-500/10 hover:text-rose-500"
                                                : "bg-primary text-white hover:bg-primary-hover"
                                        }`}
                                    >
                                        {f.isFriend ? "✓ Friend" : "+ Add"}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Blocked */}
                {isOwnProfile && activeTab === "blocked" && (
                    <div className="flex flex-col gap-4">
                        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded-xl text-sm font-medium flex items-start gap-3">
                            <FontAwesomeIcon icon={faShieldHalved} className="mt-0.5 text-lg" />
                            <div>
                                <h4 className="font-bold mb-1">Danh sách tài khoản bị chặn</h4>
                                <p className="opacity-90 leading-relaxed text-xs">Các tài khoản dưới đây sẽ không thể xem hồ sơ của bạn, bài viết và bình luận của họ cũng sẽ bị ẩn khỏi bảng tin của bạn.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                { name: "ToxicGamer99", username: "@toxic99", reason: "Spam / Ngôn từ đả kích", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ToxicGamer99" },
                                { name: "ScammerBot", username: "@scammer_xyz", reason: "Lừa đảo / Phishing", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ScammerBot" }
                            ].map((blocked) => (
                                <div key={blocked.username} className="bg-surface border border-border rounded-2xl p-4 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <img src={blocked.avatar} alt={blocked.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-border opacity-50 grayscale" />
                                        <div className="flex flex-col min-w-0">
                                            <h4 className="font-bold text-text text-sm truncate line-through opacity-70">{blocked.name}</h4>
                                            <p className="text-xs text-text-muted truncate">{blocked.username}</p>
                                            <p className="text-[10px] text-rose-500 mt-0.5 truncate font-medium border border-rose-500/30 bg-rose-500/10 px-1.5 py-0.5 rounded w-fit">{blocked.reason}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => alert("Đã bỏ chặn người dùng này.")}
                                        className="px-3 py-1.5 rounded-xl bg-surface-hover hover:bg-border text-text font-bold text-xs transition-colors shrink-0 cursor-pointer"
                                    >
                                        Bỏ chặn
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
