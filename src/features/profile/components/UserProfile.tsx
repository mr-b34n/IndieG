import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "@/shared/hooks/useTranslate";
import { useAuthStore } from "@/features/auth";
import { usePostsStore, getCurrentAuthor, Post } from "@/features/post";
import { getUserRankConfig, getRankLabel } from "@/features/post/helpers/userRanks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCheck, faXmark, faGamepad, faLocationDot,
    faCalendarAlt, faFire, faTrophy, faShieldHalved, faClock,
    faMedal, faCrown, faUserPlus, faUserCheck, faCommentDots,
    faCheckCircle, faUsers, faCamera, faSearchPlus,
    faCrop, faBan,
    faDesktop, faHeadphones, faMicrochip,
    faPaperPlane, faHeart,
    faSliders, faComments, faImage, faPen,
    faAward, faCircleDot, faArrowLeft,
    faSearch, faChevronDown, faUserXmark, faEllipsisV,
    faComputerMouse, faKeyboard, faMicrophone, faLayerGroup, faVolumeHigh, faTv
} from "@fortawesome/free-solid-svg-icons";

import {
    CS2_BG as cs2Bg,
    RAFT_LOGO as raftLogo,
    RDR2_LOGO as rdr2Logo,
    CS2_LOGO as cs2Logo
} from "@/shared/constants/images";

const AvatarCropperModal = ({
    rawImageSrc,
    onClose,
    onSave,
}: {
    rawImageSrc: string;
    onClose: () => void;
    onSave: (croppedDataUrl: string) => void;
}) => {
    const CONTAINER_SIZE = 256;
    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0, baseWidth: 256, baseHeight: 256 });
    const imgRef = React.useRef<HTMLImageElement | null>(null);

    const clampOffset = (newX: number, newY: number, currentZoom: number) => {
        const currentW = imgDimensions.baseWidth * currentZoom;
        const currentH = imgDimensions.baseHeight * currentZoom;
        const overflowX = Math.max(0, (currentW - CONTAINER_SIZE) / 2);
        const overflowY = Math.max(0, (currentH - CONTAINER_SIZE) / 2);
        return {
            x: Math.max(-overflowX, Math.min(overflowX, newX)),
            y: Math.max(-overflowY, Math.min(overflowY, newY)),
        };
    };

    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const img = e.currentTarget;
        imgRef.current = img;
        const naturalW = img.naturalWidth || img.width;
        const naturalH = img.naturalHeight || img.height;
        // Scale so shortest edge equals CONTAINER_SIZE (256px)
        const scale = CONTAINER_SIZE / Math.min(naturalW, naturalH);
        const baseW = naturalW * scale;
        const baseH = naturalH * scale;
        setImgDimensions({ width: naturalW, height: naturalH, baseWidth: baseW, baseHeight: baseH });
        setOffset({ x: 0, y: 0 });
        setZoom(1);
    };

    const handleZoomChange = (newZoom: number) => {
        setZoom(newZoom);
        setOffset(prev => clampOffset(prev.x, prev.y, newZoom));
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
        setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;
        setOffset(clampOffset(newX, newY, zoom));
    };

    const handleMouseUp = () => setIsDragging(false);

    const handleTouchStart = (e: React.TouchEvent) => {
        const touch = e.touches[0];
        if (touch) {
            setIsDragging(true);
            setDragStart({ x: touch.clientX - offset.x, y: touch.clientY - offset.y });
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return;
        const touch = e.touches[0];
        if (touch) {
            const newX = touch.clientX - dragStart.x;
            const newY = touch.clientY - dragStart.y;
            setOffset(clampOffset(newX, newY, zoom));
        }
    };

    const handleCrop = () => {
        if (!imgRef.current) return;
        const img = imgRef.current;
        const CANVAS_SIZE = 400;
        const ratio = CANVAS_SIZE / CONTAINER_SIZE;

        const canvas = document.createElement("canvas");
        canvas.width = CANVAS_SIZE;
        canvas.height = CANVAS_SIZE;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.fillStyle = "#1e232d";
        ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        ctx.save();
        ctx.translate(CANVAS_SIZE / 2, CANVAS_SIZE / 2);
        ctx.translate(offset.x * ratio, offset.y * ratio);

        const drawW = imgDimensions.baseWidth * zoom * ratio;
        const drawH = imgDimensions.baseHeight * zoom * ratio;
        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();

        const croppedDataUrl = canvas.toDataURL("image/jpeg", 0.92);
        onSave(croppedDataUrl);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-surface rounded-3xl p-6 max-w-md w-full flex flex-col items-center gap-4 shadow-2xl">
                <div className="w-full flex items-center justify-between border-b border-border/40 pb-3">
                    <h4 className="font-bold text-text flex items-center gap-2">
                        <FontAwesomeIcon icon={faCrop} className="text-primary" />
                        <span>Căn chỉnh ảnh đại diện</span>
                    </h4>
                    <button type="button" onClick={onClose} className="text-text-faint hover:text-text p-1 cursor-pointer">
                        <FontAwesomeIcon icon={faXmark} className="text-lg" />
                    </button>
                </div>

                <div
                    className="relative w-64 h-64 rounded-2xl overflow-hidden bg-black border-2 border-primary/60 cursor-move flex items-center justify-center shadow-inner select-none touch-none"
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
                        alt="Crop target"
                        onLoad={handleImageLoad}
                        className="max-w-none pointer-events-none select-none absolute"
                        style={{
                            width: `${imgDimensions.baseWidth * zoom}px`,
                            height: `${imgDimensions.baseHeight * zoom}px`,
                            left: `50%`,
                            top: `50%`,
                            transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px)`,
                        }}
                    />
                    <div className="absolute inset-0 pointer-events-none border border-white/20 rounded-2xl ring-12 ring-black/40" />
                </div>

                <div className="w-full flex flex-col gap-2 pt-2">
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-text-muted shrink-0">Thu phóng:</span>
                        <input
                            type="range"
                            min="1"
                            max="3"
                            step="0.05"
                            value={zoom}
                            onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                            className="flex-1 accent-primary cursor-pointer"
                        />
                        <button type="button" onClick={() => handleZoomChange(Math.min(3, zoom + 0.1))} className="text-text-faint hover:text-text p-1 cursor-pointer">
                            <FontAwesomeIcon icon={faSearchPlus} />
                        </button>
                    </div>
                    <p className="text-[11px] text-center text-text-faint italic mt-1">
                        * Kéo thả ảnh để di chuyển. Ảnh lưu lại là hình vuông 400x400px chuẩn khớp với vùng xem.
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

    // Tabs without subtitles or emojis, icons from fontawesome
    const [activeTab, setActiveTab] = useState<"library" | "posts" | "guestbook" | "friends">("library");
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);

    // Custom Cover image upload state (removed preset dropdown selector)
    const [customBg, setCustomBg] = useState<string>(cs2Bg);

    // Local in-place editing states ("mỗi phần hiện thông tin đều sẽ có 1 btn để user chỉnh sửa theo ý mình")
    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [isEditingGear, setIsEditingGear] = useState(false);
    const [isEditingStatus, setIsEditingStatus] = useState(false);

    // Equipped Badge State
    const [showBadgeSelector, setShowBadgeSelector] = useState(false);
    const badges = [
        { id: "founder", title: t('profile.badges.founderTitle') || "Người Tiên Phong", desc: t('profile.badges.founderDesc') || "Thành viên gia nhập từ những ngày đầu tiên.", icon: faCrown, color: "text-amber-400 bg-amber-400/10 border-amber-400/30", badgeText: "★ FOUNDER" },
        { id: "leader", title: t('profile.badges.leaderTitle') || "Chỉ Huy Chiến Thuật", desc: t('profile.badges.leaderDesc') || "Dẫn dắt tổ đội chiến thắng hơn 100 trận đấu.", icon: faShieldHalved, color: "text-primary bg-primary/10 border-primary/30", badgeText: "🛡️ TACTICAL LEADER" },
        { id: "clutch", title: t('profile.badges.clutchTitle') || "Clutch God", desc: t('profile.badges.clutchDesc') || "Tỷ lệ thắng trong các tình huống 1vX đạt trên 40%.", icon: faTrophy, color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30", badgeText: "🏆 CLUTCH GOD" },
        { id: "outlaw", title: t('profile.badges.outlawTitle') || "Legendary Outlaw", desc: t('profile.badges.outlawDesc') || "Hoàn thành 100% cốt truyện & săn thưởng trong RDR2.", icon: faFire, color: "text-rose-400 bg-rose-400/10 border-rose-400/30", badgeText: "🔥 OUTLAW" },
        { id: "nightowl", title: t('profile.badges.nightOwlTitle') || "Cú Đêm Thực Thụ", desc: t('profile.badges.nightOwlDesc') || "Thường xuyên hoạt động vào khung giờ từ 0h đến 5h sáng.", icon: faClock, color: "text-indigo-400 bg-indigo-400/10 border-indigo-400/30", badgeText: "🦉 NIGHT OWL" },
        { id: "shark", title: t('profile.badges.sharkTitle') || "Sát Thủ Cá Mập", desc: t('profile.badges.sharkDesc') || "Hạ gục hơn 50 cá mập trong chế độ Raft Hardcore.", icon: faMedal, color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/30", badgeText: "🦈 SHARK HUNTER" },
    ];
    const [selectedBadgeId, setSelectedBadgeId] = useState<string>("clutch");
    const equippedBadge = badges.find(b => b.id === selectedBadgeId) || badges[0];

    const GEAR_CATEGORIES = [
        { value: "CPU", label: "CPU (Vi xử lý)", icon: faMicrochip, color: "text-sky-400" },
        { value: "GPU", label: "GPU (Card đồ họa)", icon: faTv, color: "text-emerald-400" },
        { value: "Monitor", label: "Monitor (Màn hình)", icon: faDesktop, color: "text-amber-400" },
        { value: "Mouse", label: "Mouse (Chuột gaming)", icon: faComputerMouse, color: "text-rose-400" },
        { value: "Keyboard", label: "Keyboard (Bàn phím)", icon: faKeyboard, color: "text-purple-400" },
        { value: "Headphones", label: "Headphones (Tai nghe)", icon: faHeadphones, color: "text-cyan-400" },
        { value: "Microphone", label: "Microphone (Mic thu âm)", icon: faMicrophone, color: "text-teal-300" },
        { value: "Mousepad", label: "Mousepad (Lót chuột)", icon: faLayerGroup, color: "text-indigo-400" },
        { value: "Audio / DAC", label: "Audio / Soundcard", icon: faVolumeHigh, color: "text-pink-400" },
        { value: "Controller / Other", label: "Controller / Thiết bị khác", icon: faGamepad, color: "text-amber-300" },
    ];

    // Gaming Gear & Setup integrated cleanly into sidebar
    const [gearData, setGearData] = useState<Record<string, string>>({
        "CPU": "Intel Core i9-14900K @ 5.8GHz",
        "GPU": "NVIDIA GeForce RTX 4090 24GB GDDR6X",
        "Monitor": "ROG Swift 360Hz OLED 27\" (1440p 0.03ms)",
        "Mouse": "Logitech G Pro X Superlight 2 (800 DPI)",
        "Keyboard": "Wooting 60HE+ Custom",
        "Headphones": "HyperX Cloud III Wireless",
        "Microphone": "Shure SM7B + GoXLR Mini",
        "Mousepad": "Artisan Zero FX Soft XL",
        "Audio / DAC": "",
        "Controller / Other": ""
    });

    const [guestbookComments, setGuestbookComments] = useState([
        { id: "c1", author: "GhostRider", avatar: rdr2Logo, date: "2 giờ trước", content: "GG WP hôm qua leo rank khét quá bác ơi! Tối nay 8h tiếp tục chiến CS2 nhé 🚀🔥", likes: 5, isLiked: false },
        { id: "c2", author: "NightOwl", avatar: raftLogo, date: "Hôm qua", content: "Xây xong cái lâu đài trên biển trong Raft chưa bro? Nhớ chừa phòng cho tôi đấy 🏝️⛵", likes: 3, isLiked: true },
        { id: "c3", author: "TacticalXeno", avatar: cs2Logo, date: "3 ngày trước", content: "Uy tín 10 điểm! Game thủ nhẫn nại, call team chuẩn chỉ không toxic 👍💯", likes: 12, isLiked: true },
    ]);
    const [newCommentText, setNewCommentText] = useState("");

    const handleAddGuestbook = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCommentText.trim()) return;
        setGuestbookComments(prev => [
            { id: `c-${Date.now()}`, author: currentAuthor, avatar: avatarUrl, date: "Vừa xong", content: newCommentText, likes: 0, isLiked: false },
            ...prev
        ]);
        setNewCommentText("");
    };

    const toggleLikeComment = (id: string) => {
        setGuestbookComments(prev => prev.map(c => {
            if (c.id === id) {
                return { ...c, isLiked: !c.isLiked, likes: c.isLiked ? c.likes - 1 : c.likes + 1 };
            }
            return c;
        }));
    };

    // Removed specific game rank tags like "CS2 — Rank S" as requested
    const friendProfiles: Record<string, { name: string; username: string; bio: string; status: "online" | "in-game" | "offline" }> = {
        ghostrider: { name: "GhostRider", username: "@ghostrider", bio: "Red Dead Redemption 2 enthusiast. Outlaw by day, sheriff by night. Always down for lassoing bounties!", status: "online" },
        tactical_xeno: { name: "TacticalXeno", username: "@tactical_xeno", bio: "Pro CS2 competitive player & tactical leader. Always online for high rank pushes!", status: "in-game" },
        nightowl: { name: "NightOwl", username: "@nightowl", bio: "Late night gaming only (1 AM - 5 AM). Raft Hardcore survivor & building floating fortresses.", status: "online" },
        maplestrike: { name: "Maplestrike", username: "@maplestrike", bio: "Casual gamer exploring indie titles and RPGs. Currently offline, catch you on the weekend!", status: "offline" },
    };

    const getInitialProfile = () => {
        if (isOwnProfile) {
            return {
                name: currentAuthor,
                username: `@${currentAuthor.toLowerCase().replace(/\s+/g, "_")}`,
                bio: "FPS Veteran | Raft survival architect | Looking for squad in CS2 Premier & Red Dead Redemption 2. Let's party up!",
                status: "online" as const,
            };
        }
        const cleanId = userId?.replace(/^@/, "").toLowerCase() || "";
        return friendProfiles[cleanId] || {
            name: userId?.replace(/^@/, "") || "TacticalXeno",
            username: userId?.startsWith("@") ? userId : `@${userId || "tactical_xeno"}`,
            bio: "Pro competitive player & tactical leader. Always online for high rank pushes!",
            status: "online" as const,
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
        { name: "GhostRider", game: "Red Dead 2", logo: rdr2Logo, status: "online", isFriend: true },
        { name: "TacticalXeno", game: "Counter-Strike 2", logo: cs2Logo, status: "online", isFriend: true },
        { name: "NightOwl", game: "Raft", logo: raftLogo, status: "online", isFriend: true },
        { name: "Maplestrike", game: null, logo: null, status: "offline", isFriend: true },
    ]);

    const [friendRequestsList, setFriendRequestsList] = useState([
        { id: "r1", name: "S1mple_Olex", game: "Counter-Strike 2", logo: cs2Logo, time: "10 phút trước" },
        { id: "r2", name: "Arthur_Morgan_99", game: "Red Dead Redemption 2", logo: rdr2Logo, time: "2 giờ trước" },
    ]);
    const [friendSearch, setFriendSearch] = useState("");
    const [friendSubTab, setFriendSubTab] = useState<"list" | "requests">("list");
    const [showFriendMenu, setShowFriendMenu] = useState(false);
    const [activeCardMenu, setActiveCardMenu] = useState<string | null>(null);
    const [isBlocked, setIsBlocked] = useState(false);

    React.useEffect(() => {
        const handleOutsideClick = () => {
            setShowFriendMenu(false);
            setActiveCardMenu(null);
        };
        window.addEventListener("click", handleOutsideClick);
        return () => window.removeEventListener("click", handleOutsideClick);
    }, []);

    const handleAcceptRequest = (req: { id: string; name: string; game: string | null; logo: string | null }) => {
        setFriendsList((prev) => [{ name: req.name, game: req.game || "Online", logo: req.logo, status: "online", isFriend: true }, ...prev]);
        setFriendRequestsList((prev) => prev.filter((r) => r.id !== req.id));
        triggerToast();
    };

    const handleDeclineRequest = (id: string) => {
        setFriendRequestsList((prev) => prev.filter((r) => r.id !== id));
        triggerToast();
    };

    const posts = usePostsStore((state) => state.posts);
    const userPosts = posts.filter((p) => p.author === displayName || p.author === currentAuthor);
    const displayPosts = userPosts.length > 0 ? userPosts : posts.slice(0, 2);

    const toggleFriend = (name: string) => {
        setFriendsList((prev) => {
            const exists = prev.some((f) => f.name === name && f.isFriend);
            if (!exists) {
                const inList = prev.some((f) => f.name === name);
                if (inList) {
                    return prev.map((f) => (f.name === name ? { ...f, isFriend: true } : f));
                }
                return [{ name, game: "Online", logo: null, status: "online", isFriend: true }, ...prev];
            }
            return prev.filter((f) => f.name !== name);
        });
    };

    const isFriend = friendsList.some((f) => f.name === displayName && f.isFriend);

    const avatarUrl =
        isOwnProfile && customAvatar
            ? customAvatar
            : isOwnProfile && user?.user_metadata?.avatar_url
                ? user.user_metadata.avatar_url
                : `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`;

    const forumRank = getUserRankConfig(displayName);

    // Games library: label changed from Win Rate to Key Stat / Progress
    const [libraryGames] = useState([
        { 
            name: "Counter-Strike 2", 
            logo: cs2Logo, 
            hours: 840, 
            lastPlayed: "Jul 26, 2026", 
            achievements: 45, 
            totalAchievements: 50,
            keyStat: "68.4% Winrate",
            rank: "Premier 18,500 ★",
            mvpCount: "42 MVP",
            kdRatio: "1.34 K/D",
            tagColor: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
        },
        { 
            name: "Red Dead Redemption 2", 
            logo: rdr2Logo, 
            hours: 260, 
            lastPlayed: "Jul 24, 2026", 
            achievements: 38, 
            totalAchievements: 52,
            keyStat: "100% Story Done",
            rank: "Legendary Outlaw",
            mvpCount: "$12,500 Gold",
            kdRatio: "Honor: Max",
            tagColor: "text-amber-400 bg-amber-400/10 border-amber-400/20"
        },
        { 
            name: "Raft Hardcore", 
            logo: raftLogo, 
            hours: 140, 
            lastPlayed: "Jul 22, 2026", 
            achievements: 28, 
            totalAchievements: 30,
            keyStat: "Day 150 Survived",
            rank: "Master Architect",
            mvpCount: "Boss Defeated",
            kdRatio: "0 Deaths",
            tagColor: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20"
        },
        { 
            name: "Valorant", 
            logo: cs2Logo, 
            hours: 195, 
            lastPlayed: "Jul 20, 2026", 
            achievements: 18, 
            totalAchievements: 25,
            keyStat: "54.2% Winrate",
            rank: "Ascendant 2",
            mvpCount: "19 MVP",
            kdRatio: "1.18 K/D",
            tagColor: "text-rose-400 bg-rose-400/10 border-rose-400/20"
        }
    ]);

    const triggerToast = () => {
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 3000);
    };

    return (
        <div className="w-full mx-auto flex flex-col gap-6 pb-20 animate-fade-in">
            {/* Toast Notification */}
            {showSuccessToast && (
                <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-2xl border border-emerald-400/30 flex items-center gap-3 animate-slide-left">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-lg" />
                    <span className="font-semibold text-sm">{t('profile.editSuccess') || "Cập nhật hồ sơ thành công!"}</span>
                </div>
            )}

            {/* Badge Selector Modal */}
            {showBadgeSelector && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-surface rounded-3xl p-6 max-w-2xl w-full flex flex-col gap-5 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-border/40 pb-3">
                            <div>
                                <h4 className="text-lg font-bold text-text flex items-center gap-2">
                                    <FontAwesomeIcon icon={faAward} className="text-amber-400" />
                                    <span>{t('profile.equippedBadgeTitle') || "Tùy Chọn Trang Bị Huy Hiệu"}</span>
                                </h4>
                                <p className="text-xs text-text-muted mt-0.5">{t('profile.selectBadgeDesc') || "Chọn 1 huy hiệu tự hào nhất để hiển thị nổi bật ngay cạnh tên của bạn."}</p>
                            </div>
                            <button onClick={() => setShowBadgeSelector(false)} className="text-text-faint hover:text-text cursor-pointer p-1">
                                <FontAwesomeIcon icon={faXmark} className="text-lg" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[60vh] overflow-y-auto p-2.5">
                            {badges.map((b) => {
                                const isSelected = b.id === selectedBadgeId;
                                return (
                                    <div
                                        key={b.id}
                                        onClick={() => {
                                            setSelectedBadgeId(b.id);
                                            setShowBadgeSelector(false);
                                            triggerToast();
                                        }}
                                        className={`p-4 rounded-2xl transition-all cursor-pointer flex items-start gap-3.5 relative border ${
                                            isSelected
                                                ? "bg-primary/15 shadow-md border-primary ring-2 ring-primary/40"
                                                : "bg-surface-hover/60 hover:bg-surface-hover border-border/20"
                                        }`}
                                    >
                                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg shrink-0 ${b.color}`}>
                                            <FontAwesomeIcon icon={b.icon} />
                                        </div>
                                        <div className="flex flex-col gap-1 min-w-0 pr-6">
                                            <span className="text-[11px] font-extrabold uppercase tracking-wider text-primary">{b.badgeText}</span>
                                            <h5 className="font-bold text-text text-sm">{b.title}</h5>
                                            <p className="text-xs text-text-muted leading-relaxed line-clamp-2">{b.desc}</p>
                                        </div>
                                        {isSelected && (
                                            <span className="absolute top-3 right-3 text-primary text-base" title="Đang trang bị">
                                                <FontAwesomeIcon icon={faCheckCircle} />
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-border/40">
                            <span className="text-xs text-text-faint">{t('profile.allBadgesUnlocked') || "✓ Bạn đã sở hữu tất cả 6 huy hiệu chiến tích."}</span>
                            <button
                                onClick={() => setShowBadgeSelector(false)}
                                className="px-5 py-2 rounded-xl bg-surface-hover hover:bg-border text-text font-bold text-xs transition-colors cursor-pointer"
                            >
                                {t('profile.close') || "Đóng"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Back Navigation Button */}
            <div className="w-full flex items-center justify-between">
                <button
                    onClick={() => window.history.back()}
                    className="px-4 py-2 rounded-2xl bg-surface hover:bg-surface-hover text-text font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer border border-border/40 hover:border-primary/50"
                >
                    <FontAwesomeIcon icon={faArrowLeft} className="text-primary" />
                    <span>{t('common.back') || "Quay lại"}</span>
                </button>
            </div>

            {/* HERO SECTION: Cinematic Cover + Overlay Identity Header */}
            <div className="relative w-full bg-surface rounded-3xl shadow-xl">
                {/* Banner Cover Image */}
                <div className="relative h-60 sm:h-72 md:h-80 w-full overflow-hidden group">
                    <img src={customBg} alt="Cover" className="w-full h-full object-cover object-center brightness-[0.7] transition-all duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />

                    {/* Custom Cover Upload Button */}
                    {isOwnProfile && (
                        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                            <label
                                className="px-3.5 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md text-white font-bold text-xs border border-white/20 hover:border-white/40 transition-all flex items-center gap-2 shadow-lg cursor-pointer"
                                title={t('profile.uploadCover') || "Tải ảnh bìa"}
                            >
                                <FontAwesomeIcon icon={faImage} className="text-primary" />
                                <span>{t('profile.uploadCover') || "Tải ảnh bìa"}</span>
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
                                                    setCustomBg(ev.target.result as string);
                                                    triggerToast();
                                                }
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                            </label>
                        </div>
                    )}
                </div>

                {/* Main Profile Bar Overlay */}
                <div className="relative px-5 sm:px-8 pb-6 -mt-20 sm:-mt-24 z-10 flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
                    <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
                        {/* Avatar with Glow & Activity Status without animation */}
                        <div className="relative shrink-0 group">
                            <img
                                src={avatarUrl}
                                alt={displayName}
                                className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl object-cover ring-4 ring-surface bg-surface shadow-2xl"
                            />
                            {/* Avatar change hover button */}
                            {isOwnProfile && (
                                <label className="absolute inset-0 bg-black/60 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-bold cursor-pointer">
                                    <FontAwesomeIcon icon={faCamera} className="text-xl mb-1" />
                                    <span>{t('profile.changeAvatar') || "Đổi ảnh"}</span>
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
                            )}

                            {/* Status indicator without animation, with quick status change option */}
                            <div className="absolute -bottom-1 -right-1">
                                <button
                                    type="button"
                                    onClick={() => isOwnProfile && setIsEditingStatus(!isEditingStatus)}
                                    className={`px-2.5 py-0.5 rounded-full ring-4 ring-surface flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-white shadow-md ${
                                        status === "online" ? "bg-emerald-500" : status === "in-game" ? "bg-primary" : "bg-neutral-500"
                                    } ${isOwnProfile ? "cursor-pointer hover:scale-105" : "cursor-default"}`}
                                    title={isOwnProfile ? `${t('profile.editStatus') || "Đổi trạng thái"}` : status}
                                >
                                    {/* Removed animate-pulse as requested */}
                                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                                    <span>{status === "in-game" ? "In-game" : status === "online" ? "Online" : "Offline"}</span>
                                    {isOwnProfile && <FontAwesomeIcon icon={faSliders} className="text-[9px] opacity-80" />}
                                </button>

                                {/* Quick Activity Status Dropdown */}
                                {isEditingStatus && isOwnProfile && (
                                    <div className="absolute bottom-full right-0 mb-2 w-44 bg-surface rounded-2xl p-2 shadow-2xl flex flex-col gap-1 z-30 animate-fade-in border border-border/60">
                                        <span className="text-[10px] font-bold text-text-faint px-2 py-1 border-b border-border/30">{t('profile.quickStatusTitle') || "Trạng thái hoạt động"}</span>
                                        {[
                                            { val: "online", label: `🟢 ${t('profile.statusOnline') || "Online"}` },
                                            { val: "in-game", label: `🎮 ${t('profile.statusInGame') || "In-game"}` },
                                            { val: "offline", label: `⚪ ${t('profile.statusOffline') || "Offline"}` },
                                        ].map(s => (
                                            <button
                                                key={s.val}
                                                onClick={() => {
                                                    setStatus(s.val as "online" | "in-game" | "offline");
                                                    setIsEditingStatus(false);
                                                    triggerToast();
                                                }}
                                                className="text-left px-2.5 py-1.5 rounded-xl text-xs font-bold text-text hover:bg-surface-hover transition-colors flex items-center justify-between"
                                            >
                                                <span>{s.label}</span>
                                                {status === s.val && <FontAwesomeIcon icon={faCheck} className="text-primary text-xs" />}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Names & Equipped Title Badge (Removed game rank tag from @name) */}
                        <div className="flex flex-col gap-1.5 pb-1">
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                                {isEditingName ? (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                            className="px-3 py-1 rounded-xl bg-surface-hover text-text font-black text-xl w-44 focus:outline-none ring-2 ring-primary"
                                            placeholder="Display Name"
                                        />
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="px-3 py-1 rounded-xl bg-surface-hover text-text-muted font-bold text-sm w-36 focus:outline-none ring-2 ring-primary"
                                            placeholder="@username"
                                        />
                                        <button onClick={() => { setIsEditingName(false); triggerToast(); }} className="p-1.5 rounded-lg bg-primary text-white text-xs hover:bg-primary-hover">
                                            <FontAwesomeIcon icon={faCheck} />
                                        </button>
                                        <button onClick={() => setIsEditingName(false)} className="p-1.5 rounded-lg bg-surface-hover text-text-faint hover:text-text text-xs">
                                            <FontAwesomeIcon icon={faXmark} />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <h1 className="text-2xl sm:text-3xl font-black text-text tracking-tight flex items-center gap-2">
                                            <span>{displayName}</span>
                                            {isOwnProfile && (
                                                <button onClick={() => setIsEditingName(true)} className="text-text-faint hover:text-primary text-sm p-1 transition-colors" title={t('profile.editName') || "Sửa tên"}>
                                                    <FontAwesomeIcon icon={faPen} />
                                                </button>
                                            )}
                                        </h1>
                                        
                                        {/* Equipped Badge (Static display here so only 1 button changes badge in action bar!) */}
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 shadow-xs ${equippedBadge.color}`}
                                            title={equippedBadge.title}
                                        >
                                            <FontAwesomeIcon icon={equippedBadge.icon} />
                                            <span>{equippedBadge.badgeText}</span>
                                        </span>

                                        {/* Forum Knowledge Rank */}
                                        <span className={`text-xs font-extrabold uppercase px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs ${forumRank.classes}`} title="Danh hiệu kiến thức diễn đàn">
                                            <FontAwesomeIcon icon={forumRank.icon} />
                                            <span>{getRankLabel(forumRank, language)}</span>
                                            {forumRank.isVerifiedExpert && (
                                                <FontAwesomeIcon icon={faCheckCircle} className="text-sky-400 ml-0.5" title="Được Admin/Dev duyệt" />
                                            )}
                                        </span>
                                    </>
                                )}
                            </div>
                            
                            {/* Username without the removed tag next to it */}
                            <p className="text-sm font-bold text-text-faint flex items-center justify-center sm:justify-start gap-3">
                                <span>{username}</span>
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons: Reduced badge change button to exactly 1, removed message & invite squad! */}
                    <div className="flex flex-wrap items-center justify-center gap-2.5 shrink-0 w-full md:w-auto">
                        {isOwnProfile ? (
                            <button
                                onClick={() => setShowBadgeSelector(true)}
                                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shadow-lg shadow-primary/25 cursor-pointer"
                            >
                                <FontAwesomeIcon icon={faAward} className="text-amber-300" />
                                <span>{t('profile.changeBadge') || "Đổi Huy Hiệu"}</span>
                            </button>
                        ) : (
                            <>
                                {isBlocked ? (
                                    <button
                                        onClick={() => { setIsBlocked(false); triggerToast(); }}
                                        className="h-10 px-4 rounded-xl font-bold text-xs sm:text-sm bg-rose-500/15 text-rose-500 hover:bg-rose-500/25 transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                                    >
                                        <FontAwesomeIcon icon={faBan} />
                                        <span>{t('profile.unblockSuccess') || "Đã chặn (Bấm để bỏ chặn)"}</span>
                                    </button>
                                ) : (
                                    <div className="relative flex items-center">
                                        {isFriend ? (
                                            <div className="flex items-center rounded-xl bg-emerald-500/15 text-emerald-500 shadow-md">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowFriendMenu(!showFriendMenu);
                                                    }}
                                                    className="h-10 px-4 font-bold text-xs sm:text-sm transition-all flex items-center gap-2 hover:bg-emerald-500/20 rounded-xl cursor-pointer"
                                                >
                                                    <FontAwesomeIcon icon={faUserCheck} />
                                                    <span>{t('profile.friendAdded') || "Bạn bè"}</span>
                                                    <FontAwesomeIcon icon={faChevronDown} className={`text-xs transition-transform ${showFriendMenu ? "rotate-180" : ""}`} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    onClick={() => toggleFriend(displayName)}
                                                    className="h-10 px-4 rounded-xl font-bold text-xs sm:text-sm bg-primary text-white hover:bg-primary-hover transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                                                >
                                                    <FontAwesomeIcon icon={faUserPlus} />
                                                    <span>{t('profile.addFriend') || "Kết bạn"}</span>
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowFriendMenu(!showFriendMenu);
                                                    }}
                                                    className="h-10 w-10 rounded-xl bg-surface-hover text-text-muted hover:text-text font-bold transition-all flex items-center justify-center shadow-md cursor-pointer"
                                                    title="Tùy chọn"
                                                >
                                                    <FontAwesomeIcon icon={faEllipsisV} />
                                                </button>
                                            </div>
                                        )}

                                        {showFriendMenu && (
                                            <div className="absolute right-0 top-full mt-2 w-48 bg-surface rounded-2xl shadow-xl border border-border/40 p-1.5 z-50 flex flex-col gap-1 animate-scale-up">
                                                {isFriend && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleFriend(displayName);
                                                            setShowFriendMenu(false);
                                                            triggerToast();
                                                        }}
                                                        className="w-full px-3 py-2.5 rounded-xl text-left text-xs font-bold text-text hover:bg-surface-hover transition-colors flex items-center gap-2.5 cursor-pointer"
                                                    >
                                                        <FontAwesomeIcon icon={faUserXmark} className="text-amber-500 w-4 text-center" />
                                                        <span>{t('profile.unfriend') || "Hủy kết bạn"}</span>
                                                    </button>
                                                )}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setIsBlocked(true);
                                                        setShowFriendMenu(false);
                                                        triggerToast();
                                                    }}
                                                    className="w-full px-3 py-2.5 rounded-xl text-left text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-colors flex items-center gap-2.5 cursor-pointer"
                                                >
                                                    <FontAwesomeIcon icon={faBan} className="w-4 text-center" />
                                                    <span>{t('profile.blockUser') || "Chặn người dùng"}</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
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
                        triggerToast();
                    }}
                />
            )}

            {/* ASYMMETRIC GAMER DASHBOARD GRID (Left Sidebar + Right Content Stage) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start">
                
                {/* LEFT SIDEBAR (4 Cols): Identity, Bio, Connected Accounts & Setup */}
                <div className="lg:col-span-4 flex flex-col gap-6 w-full">
                    
                    {/* Bio & Community Meta Box with local edit button */}
                    <div className="bg-surface rounded-3xl p-5 sm:p-6 flex flex-col gap-4 shadow-sm">
                        <div className="flex items-center justify-between border-b border-border/40 pb-3">
                            <div className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faCircleDot} className="text-primary text-sm" />
                                <h3 className="font-extrabold text-text text-base">{t('profile.bioTitle') || "Thông Tin & Kết Nối"}</h3>
                            </div>
                            {isOwnProfile && (
                                <button
                                    onClick={() => setIsEditingBio(!isEditingBio)}
                                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                                >
                                    <FontAwesomeIcon icon={faPen} />
                                    <span>{t('comment.edit') || "Sửa"}</span>
                                </button>
                            )}
                        </div>
                        
                        {isEditingBio ? (
                            <div className="flex flex-col gap-2">
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    rows={3}
                                    className="w-full p-3 rounded-xl bg-surface-hover text-text text-sm focus:outline-none ring-2 ring-primary/50 resize-none"
                                />
                                <div className="flex items-center justify-end gap-2 pt-1">
                                    <button onClick={() => setIsEditingBio(false)} className="px-3 py-1.5 rounded-xl bg-surface-hover text-text text-xs font-bold">
                                        {t('profile.cancelEdit') || "Hủy"}
                                    </button>
                                    <button onClick={() => { setIsEditingBio(false); triggerToast(); }} className="px-4 py-1.5 rounded-xl bg-primary text-white text-xs font-bold">
                                        {t('profile.saveEdit') || "Lưu"}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-text-muted leading-relaxed font-medium">{bio}</p>
                        )}
                        
                        <div className="flex flex-col gap-2.5 pt-1 text-xs font-semibold text-text-faint">
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <FontAwesomeIcon icon={faLocationDot} className="text-primary w-4 text-center" />
                                    <span>{t('profile.locationLabel') || "Khu vực / Máy chủ:"}</span>
                                </span>
                                <strong className="text-text">Vietnam / SEA</strong>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <FontAwesomeIcon icon={faCalendarAlt} className="text-emerald-500 w-4 text-center" />
                                    <span>{t('profile.joinedLabel') || "Ngày gia nhập:"}</span>
                                </span>
                                <strong className="text-text">Tháng 6, 2026</strong>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <FontAwesomeIcon icon={faFire} className="text-amber-500 w-4 text-center" />
                                    <span>{t('profile.reputationLabel') || "Độ uy tín (Rep Score):"}</span>
                                </span>
                                <strong className="text-amber-400 font-extrabold">98% ★★★★★</strong>
                            </div>
                        </div>

                        {/* Connected Gaming Accounts */}
                        <div className="pt-2 border-t border-border/40 flex flex-col gap-2">
                            <span className="text-[11px] font-extrabold uppercase tracking-wider text-text-faint">{t('profile.connectedAccounts') || "Tài khoản kết nối"}</span>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="flex items-center gap-2 px-3 py-2 bg-[#171a21] text-white text-xs font-bold rounded-xl shadow-xs">
                                    <FontAwesomeIcon icon={faGamepad} className="text-[#66c0f4] text-sm" />
                                    <span className="truncate">Steam Id: verified</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-2 bg-[#d13639]/15 text-[#d13639] text-xs font-bold rounded-xl shadow-xs">
                                    <FontAwesomeIcon icon={faFire} className="text-sm" />
                                    <span className="truncate">Riot ID #VN2</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-2 bg-[#107c10]/15 text-[#107c10] text-xs font-bold rounded-xl shadow-xs">
                                    <FontAwesomeIcon icon={faGamepad} className="text-sm" />
                                    <span className="truncate">Xbox Live</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-2 bg-purple-500/15 text-purple-400 text-xs font-bold rounded-xl shadow-xs">
                                    <FontAwesomeIcon icon={faHeadphones} className="text-sm" />
                                    <span className="truncate">Discord Linked</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SETUP & GAMING GEAR with local in-place editing */}
                    <div className="bg-surface rounded-3xl p-5 sm:p-6 flex flex-col gap-4 shadow-sm">
                        <div className="flex items-center justify-between border-b border-border/40 pb-3">
                            <div className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faDesktop} className="text-primary text-sm" />
                                <h3 className="font-extrabold text-text text-base">{t('profile.gearSectionTitle') || "Góc Setup & Gaming Gear"}</h3>
                            </div>
                            {isOwnProfile && (
                                <button
                                    onClick={() => setIsEditingGear(!isEditingGear)}
                                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                                >
                                    <FontAwesomeIcon icon={faPen} />
                                    <span>{t('comment.edit') || "Sửa"}</span>
                                </button>
                            )}
                        </div>

                        {isEditingGear ? (
                            <div className="flex flex-col gap-3 py-1 animate-fade-in">
                                {GEAR_CATEGORIES.map((cat) => (
                                    <div key={cat.value} className="flex flex-col gap-1">
                                        <label className="text-[11px] font-extrabold text-text flex items-center gap-1.5">
                                            <FontAwesomeIcon icon={cat.icon} className={cat.color} />
                                            <span>{cat.label}</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={gearData[cat.value] || ""}
                                            onChange={(e) => setGearData(prev => ({ ...prev, [cat.value]: e.target.value }))}
                                            placeholder={`Nhập thông tin ${cat.value}... (để trống nếu không dùng)`}
                                            className="px-3 py-2 rounded-xl bg-surface-hover text-text text-xs font-semibold focus:outline-none ring-1 ring-border focus:ring-primary transition-all"
                                        />
                                    </div>
                                ))}
                                <div className="flex items-center justify-end gap-2 pt-2">
                                    <button
                                        onClick={() => {
                                            setIsEditingGear(false);
                                            triggerToast();
                                        }}
                                        className="px-4 py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold cursor-pointer transition-all shadow-sm"
                                    >
                                        {t('profile.saveEdit') || "Lưu"}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {GEAR_CATEGORIES.filter(cat => gearData[cat.value]?.trim()).map((cat) => (
                                    <div key={cat.value} className="flex items-start justify-between gap-3 p-2.5 rounded-2xl bg-surface-hover/50 hover:bg-surface-hover transition-colors group">
                                        <div className="flex items-start gap-3 min-w-0">
                                            <div className={`w-9 h-9 rounded-xl bg-surface flex items-center justify-center text-base shrink-0 mt-0.5 ${cat.color}`}>
                                                <FontAwesomeIcon icon={cat.icon} />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-text-faint">{cat.value}</span>
                                                <span className="font-bold text-text text-xs mt-0.5 leading-snug">{gearData[cat.value]}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>

                {/* RIGHT MAIN CONTENT STAGE (8 Cols): Streamlined Tabs */}
                <div className="lg:col-span-8 flex flex-col w-full">
                    
                    {/* Connected Folder Tab Bar with Inverted Rounded Fillets */}
                    <div className="flex items-end gap-1 overflow-x-auto scrollbar-none pt-2 px-3 border-b border-border/40 relative select-none">
                        {[
                            { id: "library", label: t('profile.tabs.library') || "Tủ game & thành tích", icon: faGamepad },
                            { id: "posts", label: t('profile.tabs.posts') || "Bài viết", icon: faComments },
                            { id: "friends", label: t('profile.friendsWidgetTitle') || "Bạn Bè", icon: faUsers, count: friendsList.length },
                            { id: "guestbook", label: t('profile.guestbookTitle') || "Sổ lưu bút", icon: faCommentDots },
                        ].map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as "library" | "posts" | "guestbook" | "friends")}
                                    className={`group relative flex items-center justify-center gap-2.5 py-3.5 px-5 font-extrabold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap min-w-[130px] ${
                                        isActive
                                            ? "bg-surface text-primary rounded-t-2xl border-t border-x border-border/40 pb-4 -mb-[1px] z-10 shadow-sm"
                                            : "bg-surface-hover/40 text-text-muted hover:text-text hover:bg-surface-hover/80 rounded-t-2xl border-t border-x border-transparent pb-3 mb-0.5"
                                    }`}
                                >
                                    {/* Left Inverted Rounded Fillet (Tròn khuyết phần tiếp xúc bên trái) */}
                                    {isActive && (
                                        <svg className="absolute bottom-[1px] -left-3.5 w-3.5 h-3.5 text-surface pointer-events-none z-20" viewBox="0 0 14 14">
                                            <path d="M 14 0 L 14 14 L 0 14 A 14 14 0 0 0 14 0 Z" className="fill-current" />
                                            <path d="M 0 14 A 14 14 0 0 0 14 0" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-border/40" />
                                        </svg>
                                    )}

                                    <FontAwesomeIcon icon={tab.icon} className={`text-base transition-transform group-hover:scale-110 ${isActive ? "text-primary" : "text-text-faint group-hover:text-text"}`} />
                                    <span>{tab.label}</span>
                                    {tab.count !== undefined && (
                                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${isActive ? "bg-primary/15 text-primary" : "bg-surface text-text-faint"}`}>
                                            {tab.count}
                                        </span>
                                    )}

                                    {/* Right Inverted Rounded Fillet (Tròn khuyết phần tiếp xúc bên phải) */}
                                    {isActive && (
                                        <svg className="absolute bottom-[1px] -right-3.5 w-3.5 h-3.5 text-surface pointer-events-none z-20" viewBox="0 0 14 14">
                                            <path d="M 0 0 L 0 14 L 14 14 A 14 14 0 0 1 0 0 Z" className="fill-current" />
                                            <path d="M 14 14 A 14 14 0 0 1 0 0" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-border/40" />
                                        </svg>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Connected Content Panel below Tab Bar: Rounded bottom corners & no cut-off side border */}
                    <div className="bg-surface rounded-b-3xl p-5 sm:p-6 transition-all duration-300 min-h-[480px] relative z-0 shadow-sm">

                        {/* TAB 1: GAME LIBRARY & PER-GAME STATS */}
                        {activeTab === "library" && (
                            <div className="flex flex-col gap-4 animate-fade-in">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {libraryGames.map((game) => (
                                        <div key={game.name} className="bg-surface-hover/30 border border-border/20 rounded-3xl p-5 flex flex-col justify-between gap-5 transition-all shadow-sm group hover:border-primary/30">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-center gap-3.5 min-w-0">
                                                    <img src={game.logo} alt={game.name} className="w-14 h-14 rounded-2xl object-cover shrink-0 group-hover:scale-105 transition-transform" />
                                                    <div className="flex flex-col min-w-0">
                                                        <h4 className="font-extrabold text-text text-base truncate group-hover:text-primary transition-colors">{game.name}</h4>
                                                        <span className="text-xs font-bold text-primary mt-0.5">{game.hours} {t('profile.hoursPlayedLabel') || "giờ chơi"}</span>
                                                        <span className="text-[11px] text-text-faint mt-0.5">{t('profile.lastPlayedLabel') || "Lần cuối:"} {game.lastPlayed}</span>
                                                    </div>
                                                </div>
                                                <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold shrink-0 ${game.tagColor}`}>
                                                    {game.rank}
                                                </span>
                                            </div>

                                            {/* Stats Grid: changed Win rate to Key Stat / Progress ("vì nó chứa nhiều loại infor quá") */}
                                            <div className="grid grid-cols-3 gap-2 bg-surface rounded-2xl p-3 text-center border border-border/20">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-text-faint">{t('profile.keyStatLabel') || "Chỉ số / Tiến độ"}</span>
                                                    <span className="text-sm font-black text-emerald-500 mt-0.5">{game.keyStat}</span>
                                                </div>
                                                <div className="flex flex-col border-x border-border/30 px-1">
                                                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-text-faint">{t('profile.mvpLabel') || "Hiệu Suất / MVP"}</span>
                                                    <span className="text-sm font-black text-amber-400 mt-0.5">{game.mvpCount}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-text-faint">{t('profile.kdLabel') || "Chỉ Số K/D / Skill"}</span>
                                                    <span className="text-sm font-black text-sky-400 mt-0.5">{game.kdRatio}</span>
                                                </div>
                                            </div>

                                            {/* Achievements Bar */}
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex justify-between text-xs font-bold">
                                                    <span className="text-text-muted flex items-center gap-1.5">
                                                        <FontAwesomeIcon icon={faTrophy} className="text-amber-400 text-xs" />
                                                        <span>{t('profile.achievementsLabel') || "Thành tựu:"}</span>
                                                    </span>
                                                    <span className="text-primary font-black">{game.achievements} / {game.totalAchievements} ({Math.round((game.achievements / game.totalAchievements) * 100)}%)</span>
                                                </div>
                                                <div className="w-full h-2 rounded-full bg-surface overflow-hidden border border-border/20">
                                                    <div className="h-full bg-gradient-to-r from-primary via-cyan-400 to-emerald-400 rounded-full transition-all duration-500" style={{ width: `${(game.achievements / game.totalAchievements) * 100}%` }} />
                                                </div>
                                            </div>

                                            {/* Removed launch game button ("bỏ cái btn launch game đi, tôi chưa tích hợp với web.") */}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* TAB 2: POSTS & FEED */}
                        {activeTab === "posts" && (
                            <div className="flex flex-col gap-4 animate-fade-in">
                                {displayPosts.length > 0 ? (
                                    displayPosts.map((post) => <Post key={post.id} post={post} />)
                                ) : (
                                    <div className="bg-surface-hover/20 border border-border/20 rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-3 shadow-sm">
                                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl">
                                            <FontAwesomeIcon icon={faCommentDots} />
                                        </div>
                                        <h4 className="text-lg font-bold text-text">{t('profile.emptyPosts') || "Chưa có bài viết hoặc thảo luận nào"}</h4>
                                        <p className="text-sm text-text-faint max-w-md">{t('profile.createFirstPost') || "Hãy đăng bài chia sẻ kinh nghiệm leo rank, hướng dẫn chiến thuật hoặc tìm tổ đội ngay nhé!"}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB 3: FRIENDS LIST & REQUESTS */}
                        {activeTab === "friends" && (
                            <div className="flex flex-col gap-5 animate-fade-in">
                                {/* Friends Sub-Navigation & Search Header */}
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface-hover/30 p-3 rounded-2xl border border-border/20">
                                    <div className="flex items-center gap-2 bg-surface p-1 rounded-xl border border-border/20">
                                        <button
                                            onClick={() => setFriendSubTab("list")}
                                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                                                friendSubTab === "list" ? "bg-primary text-white shadow-sm" : "text-text-muted hover:text-text"
                                            }`}
                                        >
                                            <FontAwesomeIcon icon={faUsers} />
                                            <span>{t('profile.friendsWidgetTitle') || "Bạn Bè"} ({friendsList.length})</span>
                                        </button>
                                        <button
                                            onClick={() => setFriendSubTab("requests")}
                                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 relative ${
                                                friendSubTab === "requests" ? "bg-primary text-white shadow-sm" : "text-text-muted hover:text-text"
                                            }`}
                                        >
                                            <FontAwesomeIcon icon={faUserPlus} />
                                            <span>{t('profile.friendRequests') || "Yêu cầu kết bạn"}</span>
                                            {friendRequestsList.length > 0 && (
                                                <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
                                                    {friendRequestsList.length}
                                                </span>
                                            )}
                                        </button>
                                    </div>

                                    {/* Friend Search Input */}
                                    {friendSubTab === "list" && (
                                        <div className="relative flex-1 sm:max-w-xs">
                                            <FontAwesomeIcon icon={faSearch} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-faint text-xs pointer-events-none" />
                                            <input
                                                type="text"
                                                value={friendSearch}
                                                onChange={(e) => setFriendSearch(e.target.value)}
                                                placeholder={t('profile.searchFriends') || "Tìm kiếm bạn bè theo tên hoặc ID..."}
                                                className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface text-text text-xs font-semibold focus:outline-none border border-border/30 focus:border-primary transition-all"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Friends Sub-tab Content: List */}
                                {friendSubTab === "list" && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                                        {friendsList.filter(f => f.isFriend && f.name.toLowerCase().includes(friendSearch.toLowerCase())).length > 0 ? (
                                            friendsList
                                                .filter(f => f.isFriend && f.name.toLowerCase().includes(friendSearch.toLowerCase()))
                                                .map((f) => (
                                                    <div key={f.name} className="bg-surface-hover/30 border border-border/20 rounded-3xl p-5 flex items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all group hover:border-primary/30 relative">
                                                        <div 
                                                            onClick={() => navigate({ to: "/profile/$userId", params: { userId: `@${f.name.toLowerCase().replace(/\s+/g, "_")}` } })}
                                                            className="flex items-center gap-3.5 min-w-0 cursor-pointer flex-1"
                                                        >
                                                            <div className="relative shrink-0">
                                                                <img src={f.logo || raftLogo} alt={f.name} className="w-14 h-14 rounded-2xl object-cover group-hover:scale-105 transition-transform shadow-xs" />
                                                                <span className={`absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full ring-2 ring-surface ${f.status === "online" ? "bg-emerald-500" : f.status === "in-game" ? "bg-amber-400" : "bg-neutral-500"}`} />
                                                            </div>
                                                            <div className="flex flex-col min-w-0">
                                                                <h4 className="font-extrabold text-text text-base truncate group-hover:text-primary transition-colors">{f.name}</h4>
                                                                <span className="text-xs font-semibold text-primary truncate mt-0.5">{f.game || (f.status === "online" ? (t('profile.statusOnline') || "Trực tuyến") : (t('profile.statusOffline') || "Ngoại tuyến"))}</span>
                                                                <span className="text-[11px] text-text-faint mt-0.5">ID: @{f.name.toLowerCase()}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 shrink-0 relative">
                                                            {f.isFriend ? (
                                                                <>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setActiveCardMenu(activeCardMenu === f.name ? null : f.name);
                                                                        }}
                                                                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25 border border-emerald-500/20 shadow-xs"
                                                                    >
                                                                        <FontAwesomeIcon icon={faUserCheck} />
                                                                        <span>{t('profile.friendAdded') || "Bạn bè"}</span>
                                                                        <FontAwesomeIcon icon={faChevronDown} className={`text-[10px] transition-transform ml-0.5 ${activeCardMenu === f.name ? "rotate-180" : ""}`} />
                                                                    </button>
                                                                    {activeCardMenu === f.name && (
                                                                        <div className="absolute right-0 top-full mt-1.5 w-44 bg-surface rounded-2xl shadow-xl border border-border/40 p-1.5 z-50 flex flex-col gap-1 animate-scale-up">
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    toggleFriend(f.name);
                                                                                    setActiveCardMenu(null);
                                                                                    triggerToast();
                                                                                }}
                                                                                className="w-full px-3 py-2 rounded-xl text-left text-xs font-bold text-text hover:bg-surface-hover transition-colors flex items-center gap-2.5 cursor-pointer"
                                                                            >
                                                                                <FontAwesomeIcon icon={faUserXmark} className="text-amber-500 w-3.5 text-center" />
                                                                                <span>{t('profile.unfriend') || "Hủy kết bạn"}</span>
                                                                            </button>
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    toggleFriend(f.name);
                                                                                    setIsBlocked(true);
                                                                                    setActiveCardMenu(null);
                                                                                    triggerToast();
                                                                                }}
                                                                                className="w-full px-3 py-2 rounded-xl text-left text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-colors flex items-center gap-2.5 cursor-pointer"
                                                                            >
                                                                                <FontAwesomeIcon icon={faBan} className="w-3.5 text-center" />
                                                                                <span>{t('profile.blockUser') || "Chặn người dùng"}</span>
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </>
                                                            ) : (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        toggleFriend(f.name);
                                                                        triggerToast();
                                                                    }}
                                                                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 bg-primary text-white hover:bg-primary-hover shadow-sm"
                                                                >
                                                                    <FontAwesomeIcon icon={faUserPlus} />
                                                                    <span>{t('profile.addFriend') || "Kết bạn"}</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                        ) : (
                                            <div className="col-span-full bg-surface-hover/20 border border-border/20 rounded-3xl p-10 text-center text-text-faint text-sm flex flex-col items-center gap-3">
                                                <FontAwesomeIcon icon={faUsers} className="text-3xl text-text-faint/50" />
                                                <span>{t('profile.noFriendsFound') || "Không tìm thấy bạn bè nào phù hợp"}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Friends Sub-tab Content: Requests */}
                                {friendSubTab === "requests" && (
                                    <div className="flex flex-col gap-3.5 animate-fade-in">
                                        {friendRequestsList.length > 0 ? (
                                            friendRequestsList.map((req) => (
                                                <div key={req.id} className="bg-surface-hover/30 border border-border/20 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm hover:border-primary/30 transition-all">
                                                    <div className="flex items-center gap-3.5 min-w-0">
                                                        <img src={req.logo || raftLogo} alt={req.name} className="w-14 h-14 rounded-2xl object-cover shrink-0 shadow-xs" />
                                                        <div className="flex flex-col min-w-0">
                                                            <h4 className="font-extrabold text-text text-base truncate">{req.name}</h4>
                                                            <span className="text-xs font-semibold text-primary mt-0.5">{req.game || "Game"}</span>
                                                            <span className="text-[11px] text-text-faint mt-0.5 flex items-center gap-1">
                                                                <FontAwesomeIcon icon={faClock} className="text-[10px]" />
                                                                <span>{req.time}</span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-end">
                                                        <button
                                                            onClick={() => handleAcceptRequest(req)}
                                                            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                                                        >
                                                            <FontAwesomeIcon icon={faCheck} />
                                                            <span>{t('profile.accept') || "Chấp nhận"}</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeclineRequest(req.id)}
                                                            className="px-4 py-2 rounded-xl bg-surface hover:bg-surface-hover text-text-muted hover:text-text text-xs font-bold transition-all border border-border/30 flex items-center gap-1.5 cursor-pointer"
                                                        >
                                                            <FontAwesomeIcon icon={faXmark} />
                                                            <span>{t('profile.decline') || "Từ chối"}</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="bg-surface-hover/20 border border-border/20 rounded-3xl p-10 text-center text-text-faint text-sm flex flex-col items-center gap-3">
                                                <FontAwesomeIcon icon={faUserCheck} className="text-3xl text-text-faint/50" />
                                                <span>{t('profile.noFriendRequests') || "Không có yêu cầu kết bạn nào"}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB 4: GUESTBOOK WALL */}
                        {activeTab === "guestbook" && (
                            <div className="flex flex-col gap-5 animate-fade-in">
                                {/* Write Comment Box */}
                                <form onSubmit={handleAddGuestbook} className="bg-surface-hover/30 border border-border/20 rounded-3xl p-5 shadow-sm flex flex-col gap-3">
                                    <div className="flex items-center gap-2 text-sm font-bold text-text">
                                        <FontAwesomeIcon icon={faPen} className="text-primary" />
                                        <span>{t('profile.guestbookFormTitle', { name: displayName }) || `Gửi lời nhắn / Lưu bút lên tường của ${displayName}`}</span>
                                    </div>
                                    <textarea
                                        value={newCommentText}
                                        onChange={(e) => setNewCommentText(e.target.value)}
                                        rows={3}
                                        placeholder={t('profile.guestbookPlaceholder') || "Viết lời chào, chúc leo rank may mắn hay nhắn tin rủ chơi game..."}
                                        className="w-full px-4 py-3 rounded-xl bg-surface text-text text-sm focus:outline-none ring-1 ring-border/30 focus:ring-primary resize-none border border-border/20"
                                    />
                                    <div className="flex items-center justify-between pt-1">
                                        <span className="text-xs text-text-faint">{t('profile.guestbookHint') || "💡 Mẹo: Có thể gửi lời nhắn công khai hoặc chúc mừng thành tựu mới nhất!"}</span>
                                        <button
                                            type="submit"
                                            disabled={!newCommentText.trim()}
                                            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-bold text-sm transition-colors shadow-md cursor-pointer flex items-center gap-2"
                                        >
                                            <FontAwesomeIcon icon={faPaperPlane} />
                                            <span>{t('profile.postComment') || "Đăng lên tường"}</span>
                                        </button>
                                    </div>
                                </form>

                                {/* Comments List */}
                                <div className="flex flex-col gap-3.5">
                                    {guestbookComments.length > 0 ? (
                                        guestbookComments.map((c) => (
                                            <div key={c.id} className="bg-surface-hover/30 border border-border/20 rounded-3xl p-5 flex items-start gap-4 hover:border-primary/30 transition-all shadow-xs">
                                                <img src={c.avatar} alt={c.author} className="w-12 h-12 rounded-full object-cover shrink-0 mt-0.5 shadow-xs" />
                                                <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <h5 className="font-extrabold text-text text-sm">{c.author}</h5>
                                                            <span className="text-xs text-text-faint">• {c.date}</span>
                                                        </div>
                                                        <button
                                                            onClick={() => toggleLikeComment(c.id)}
                                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                                                c.isLiked
                                                                    ? "bg-rose-500/15 text-rose-500"
                                                                    : "bg-surface text-text-muted hover:text-text border border-border/20"
                                                            }`}
                                                        >
                                                            <FontAwesomeIcon icon={faHeart} className={c.isLiked ? "animate-bounce" : ""} />
                                                            <span>{c.likes > 0 ? c.likes : t('profile.likeBtn') || "Thích"}</span>
                                                        </button>
                                                    </div>
                                                    <p className="text-sm text-text-muted leading-relaxed font-medium">{c.content}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="bg-surface-hover/20 border border-border/20 rounded-3xl p-8 text-center text-text-faint text-sm">
                                            {t('profile.noComments') || "Chưa có lời nhắn nào. Hãy là người đầu tiên chúc GG!"}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                    </div>
                </div>

            </div>
        </div>
    );
};
