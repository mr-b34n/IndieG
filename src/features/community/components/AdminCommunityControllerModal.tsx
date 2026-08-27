import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faShieldHalved,
    faCheck,
    faBullhorn,
    faLock,
    faLockOpen,
    faUsers,
    faTrash,
    faStar,
    faCircleCheck,
    faTriangleExclamation,
    faImage,
    faSliders,
    faEye,
    faBan,
    faCheckCircle,
    faPen,
} from "@fortawesome/free-solid-svg-icons";
import { useCommunitiesStore } from "../store/useCommunitiesStore";
import type { CommunityData, CommunityMember } from "../types";
import { useNavigate } from "@tanstack/react-router";
import { AppModal } from "@/shared/components/ui/AppModal";

interface AdminCommunityControllerModalProps {
    community: CommunityData;
    onClose: () => void;
}

const CATEGORY_OPTIONS = [
    "FPS",
    "RPG",
    "MOBA",
    "Survival",
    "Open World",
    "Strategy",
    "Sports",
    "MMORPG",
    "Casual",
    "Fighting",
];

export const AdminCommunityControllerModal: React.FC<AdminCommunityControllerModalProps> = ({
    community,
    onClose,
}) => {
    const navigate = useNavigate();
    const updateCommunity = useCommunitiesStore((state) => state.updateCommunity);
    const deleteCommunity = useCommunitiesStore((state) => state.deleteCommunity);

    const [activeTab, setActiveTab] = useState<"general" | "rules" | "moderation" | "members" | "danger">("general");

    // Form states
    const [name, setName] = useState(community.name);
    const [category, setCategory] = useState(community.category);
    const [description, setDescription] = useState(community.description);
    const [logo, setLogo] = useState(community.logo);
    const [backdrop, setBackdrop] = useState(community.backdrop);
    const [tagsInput, setTagsInput] = useState(community.tags.join(", "));

    // Announcement & Rules
    const [announcement, setAnnouncement] = useState(community.announcement || "");
    const [rulesInput, setRulesInput] = useState(
        community.rules?.join("\n") || "1. Tôn trọng thành viên trong cộng đồng.\n2. Không toxic, không ngôn từ kích động."
    );

    // Governance
    const [isLocked, setIsLocked] = useState(!!community.isLocked);
    const [autoApprovePosts, setAutoApprovePosts] = useState(community.autoApprovePosts !== false);
    const [featured, setFeatured] = useState(!!community.featured);
    const [isNsfw, setIsNsfw] = useState(!!community.isNsfw);

    // Members list state
    const [members, setMembers] = useState<CommunityMember[]>(() => {
        if (community.memberList && community.memberList.length > 0) {
            return community.memberList;
        }
        return [
            {
                username: "admin_pro",
                displayName: "Admin System (Quản trị)",
                avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
                role: "owner",
                joinedAt: "01/01/2025",
            },
            {
                username: "gamer_binh_thuong",
                displayName: "Gamer Binh Thuong",
                avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250",
                role: "admin",
                joinedAt: "10/02/2025",
            },
            {
                username: "tactical_player",
                displayName: "Tactical Gamer",
                avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250",
                role: "mod",
                joinedAt: "15/03/2025",
            },
            {
                username: "newbie_2026",
                displayName: "Newbie Player",
                avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=newbie",
                role: "member",
                joinedAt: "10/08/2026",
            },
        ];
    });

    // Delete confirmation
    const [confirmDeleteText, setConfirmDeleteText] = useState("");
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleSaveGeneral = () => {
        const tags = tagsInput
            .split(",")
            .map((t) => t.trim().toLowerCase())
            .filter(Boolean);

        updateCommunity(community.id, {
            name: name.trim() || community.name,
            category,
            description: description.trim(),
            logo,
            backdrop,
            tags,
        });

        showToast("Đã lưu tổng quan cộng đồng thành công!");
    };

    const handleSaveRules = () => {
        const rules = rulesInput
            .split("\n")
            .map((r) => r.trim())
            .filter(Boolean);

        updateCommunity(community.id, {
            announcement: announcement.trim(),
            rules,
        });

        showToast("Đã cập nhật thông báo & nội quy!");
    };

    const handleToggleGovernance = (key: "isLocked" | "autoApprovePosts" | "featured" | "isNsfw") => {
        let newLocked = isLocked;
        let newAutoApprove = autoApprovePosts;
        let newFeatured = featured;
        let newNsfw = isNsfw;

        if (key === "isLocked") {
            newLocked = !isLocked;
            setIsLocked(newLocked);
        } else if (key === "autoApprovePosts") {
            newAutoApprove = !autoApprovePosts;
            setAutoApprovePosts(newAutoApprove);
        } else if (key === "featured") {
            newFeatured = !featured;
            setFeatured(newFeatured);
        } else if (key === "isNsfw") {
            newNsfw = !isNsfw;
            setIsNsfw(newNsfw);
        }

        updateCommunity(community.id, {
            isLocked: newLocked,
            autoApprovePosts: newAutoApprove,
            featured: newFeatured,
            isNsfw: newNsfw,
        });

        showToast("Đã cập nhật cài đặt kiểm duyệt!");
    };

    const handleRoleChange = (targetUsername: string, newRole: "owner" | "admin" | "mod" | "member") => {
        const updated = members.map((m) => (m.username === targetUsername ? { ...m, role: newRole } : m));
        setMembers(updated);
        updateCommunity(community.id, { memberList: updated });
        showToast(`Đã đổi vai trò @${targetUsername} -> ${newRole.toUpperCase()}`);
    };

    const handleKickMember = (targetUsername: string) => {
        const updated = members.filter((m) => m.username !== targetUsername);
        setMembers(updated);
        updateCommunity(community.id, { memberList: updated, members: Math.max(0, community.members - 1) });
        showToast(`Đã đuổi thành viên @${targetUsername}`);
    };

    const handleDeleteCommunity = () => {
        if (confirmDeleteText.trim() !== community.name) return;
        deleteCommunity(community.id);
        onClose();
        navigate({ to: "/community" });
    };

    const handlePrimarySave = () => {
        if (activeTab === "general") handleSaveGeneral();
        else if (activeTab === "rules") handleSaveRules();
    };

    const footerButtons = (
        <div className="flex items-center gap-2.5">
            <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-[12px] bg-[#121827] hover:bg-[#1A2130] border border-[#20283A] text-[#8B93A7] hover:text-[#F1F3F7] font-bold text-xs transition-colors cursor-pointer"
            >
                Hủy
            </button>
            {(activeTab === "general" || activeTab === "rules") && (
                <button
                    type="button"
                    onClick={handlePrimarySave}
                    className="px-5 py-2 rounded-[12px] bg-[#FF2D63] hover:bg-[#ff1a53] text-white font-black text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-md shadow-pink-500/20 flex items-center gap-1.5"
                >
                    <FontAwesomeIcon icon={faCheck} />
                    <span>Lưu Thay Đổi</span>
                </button>
            )}
        </div>
    );

    return (
        <AppModal
            isOpen={true}
            onClose={onClose}
            title="COMMUNITY CONTROL"
            subtitle={`${community.name} · Administration`}
            icon={faShieldHalved}
            variant="admin"
            maxWidth="3xl"
            footer={footerButtons}
        >
            <div className="space-y-4">
                {/* Toast Notification */}
                {toastMessage && (
                    <div className="p-3 rounded-[14px] bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fade-in shadow-xs">
                        <FontAwesomeIcon icon={faCircleCheck} className="text-sm shrink-0" />
                        <span>{toastMessage}</span>
                    </div>
                )}

                {/* Navigation Tabs (Shortened & Standardized) */}
                <div className="flex items-center gap-1 border-b border-[#20283A] overflow-x-auto no-scrollbar -mx-6 px-6">
                    <button
                        type="button"
                        onClick={() => setActiveTab("general")}
                        className={`px-3.5 py-2.5 text-xs font-black transition-all cursor-pointer flex items-center gap-2 shrink-0 border-b-2 ${
                            activeTab === "general"
                                ? "border-[#FF2D63] text-[#F1F3F7]"
                                : "border-transparent text-[#8B93A7] hover:text-[#F1F3F7]"
                        }`}
                    >
                        <FontAwesomeIcon icon={faPen} className={activeTab === "general" ? "text-[#FF2D63]" : "text-[#60697C]"} />
                        <span>Tổng quan</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("rules")}
                        className={`px-3.5 py-2.5 text-xs font-black transition-all cursor-pointer flex items-center gap-2 shrink-0 border-b-2 ${
                            activeTab === "rules"
                                ? "border-[#FF2D63] text-[#F1F3F7]"
                                : "border-transparent text-[#8B93A7] hover:text-[#F1F3F7]"
                        }`}
                    >
                        <FontAwesomeIcon icon={faBullhorn} className={activeTab === "rules" ? "text-[#FF2D63]" : "text-[#60697C]"} />
                        <span>Nội quy</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("moderation")}
                        className={`px-3.5 py-2.5 text-xs font-black transition-all cursor-pointer flex items-center gap-2 shrink-0 border-b-2 ${
                            activeTab === "moderation"
                                ? "border-[#FF2D63] text-[#F1F3F7]"
                                : "border-transparent text-[#8B93A7] hover:text-[#F1F3F7]"
                        }`}
                    >
                        <FontAwesomeIcon icon={faSliders} className={activeTab === "moderation" ? "text-[#FF2D63]" : "text-[#60697C]"} />
                        <span>Kiểm duyệt</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("members")}
                        className={`px-3.5 py-2.5 text-xs font-black transition-all cursor-pointer flex items-center gap-2 shrink-0 border-b-2 ${
                            activeTab === "members"
                                ? "border-[#FF2D63] text-[#F1F3F7]"
                                : "border-transparent text-[#8B93A7] hover:text-[#F1F3F7]"
                        }`}
                    >
                        <FontAwesomeIcon icon={faUsers} className={activeTab === "members" ? "text-[#FF2D63]" : "text-[#60697C]"} />
                        <span>Thành viên ({members.length})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("danger")}
                        className={`px-3.5 py-2.5 text-xs font-black transition-all cursor-pointer flex items-center gap-2 shrink-0 border-b-2 ml-auto ${
                            activeTab === "danger"
                                ? "border-rose-500 text-rose-400"
                                : "border-transparent text-rose-400/70 hover:text-rose-400"
                        }`}
                    >
                        <FontAwesomeIcon icon={faTriangleExclamation} />
                        <span>Danger Zone</span>
                    </button>
                </div>

                {/* Tab Contents */}
                <div className="pt-2">
                    {/* 1. TỔNG QUAN (GENERAL & BRANDING) */}
                    {activeTab === "general" && (
                        <div className="space-y-5">
                            {/* Section: Community Profile */}
                            <div className="space-y-3">
                                <h4 className="text-[11px] font-extrabold text-[#8B93A7] uppercase tracking-wider">
                                    COMMUNITY PROFILE
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-bold text-[#8B93A7]">Tên cộng đồng</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="h-10 px-3.5 rounded-[14px] border border-[#20283A] bg-[#05070D] text-xs font-bold text-[#F1F3F7] focus:border-[#FF2D63] outline-none transition-colors"
                                            required
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-bold text-[#8B93A7]">Thể loại Game</label>
                                        <select
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            className="h-10 px-3.5 rounded-[14px] border border-[#20283A] bg-[#05070D] text-xs font-bold text-[#F1F3F7] focus:border-[#FF2D63] cursor-pointer outline-none transition-colors"
                                        >
                                            {CATEGORY_OPTIONS.map((cat) => (
                                                <option key={cat} value={cat} className="bg-[#0D111D] text-[#F1F3F7]">
                                                    {cat}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-bold text-[#8B93A7]">Mô tả cộng đồng</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={3}
                                        className="p-3 rounded-[14px] border border-[#20283A] bg-[#05070D] text-xs text-[#F1F3F7] font-medium focus:border-[#FF2D63] resize-none outline-none transition-colors leading-relaxed"
                                    />
                                </div>
                            </div>

                            {/* Section: Branding */}
                            <div className="space-y-3 pt-2 border-t border-[#1A2130]">
                                <h4 className="text-[11px] font-extrabold text-[#8B93A7] uppercase tracking-wider">
                                    BRANDING & ASSETS
                                </h4>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-bold text-[#8B93A7] flex items-center gap-1.5">
                                            <FontAwesomeIcon icon={faImage} className="text-[#60697C]" />
                                            <span>Logo / Icon URL</span>
                                        </label>
                                        <input
                                            type="url"
                                            value={logo}
                                            onChange={(e) => setLogo(e.target.value)}
                                            className="h-10 px-3.5 rounded-[14px] border border-[#20283A] bg-[#05070D] text-xs font-mono text-[#F1F3F7] focus:border-[#FF2D63] outline-none transition-colors"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-bold text-[#8B93A7] flex items-center gap-1.5">
                                            <FontAwesomeIcon icon={faImage} className="text-[#60697C]" />
                                            <span>Banner / Cover URL</span>
                                        </label>
                                        <input
                                            type="url"
                                            value={backdrop}
                                            onChange={(e) => setBackdrop(e.target.value)}
                                            className="h-10 px-3.5 rounded-[14px] border border-[#20283A] bg-[#05070D] text-xs font-mono text-[#F1F3F7] focus:border-[#FF2D63] outline-none transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-bold text-[#8B93A7]">Thẻ phân loại (Tags, cách nhau bằng dấu phẩy)</label>
                                    <input
                                        type="text"
                                        value={tagsInput}
                                        onChange={(e) => setTagsInput(e.target.value)}
                                        className="h-10 px-3.5 rounded-[14px] border border-[#20283A] bg-[#05070D] text-xs font-bold text-[#F1F3F7] focus:border-[#FF2D63] outline-none transition-colors"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 2. NỘI QUY & THÔNG BÁO */}
                    {activeTab === "rules" && (
                        <div className="space-y-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-extrabold text-[#F1F3F7] flex items-center gap-1.5">
                                    <FontAwesomeIcon icon={faBullhorn} className="text-[#FF2D63]" />
                                    <span>Thông Báo Khẩn (Banner Ghim Đầu Trang)</span>
                                </label>
                                <p className="text-[11px] text-[#8B93A7]">Thông báo đính kèm trên cùng trang cộng đồng cho mọi thành viên.</p>
                                <textarea
                                    value={announcement}
                                    onChange={(e) => setAnnouncement(e.target.value)}
                                    placeholder="Ví dụ: 📢 Lịch bảo trì máy chủ giải đấu lúc 20:00 tối nay..."
                                    rows={3}
                                    className="p-3.5 rounded-[14px] border border-[rgba(255,45,99,0.35)] bg-[rgba(255,45,99,0.08)] text-xs text-[#F1F3F7] font-medium focus:border-[#FF2D63] resize-none outline-none transition-colors leading-relaxed"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5 pt-2 border-t border-[#1A2130]">
                                <label className="text-xs font-extrabold text-[#8B93A7] flex items-center gap-1.5">
                                    <FontAwesomeIcon icon={faShieldHalved} className="text-emerald-400" />
                                    <span>Nội Quy Cộng Đồng (Mỗi dòng 1 quy tắc)</span>
                                </label>
                                <textarea
                                    value={rulesInput}
                                    onChange={(e) => setRulesInput(e.target.value)}
                                    rows={5}
                                    className="p-3.5 rounded-[14px] border border-[#20283A] bg-[#05070D] text-xs text-[#F1F3F7] font-medium focus:border-[#FF2D63] resize-none outline-none transition-colors leading-relaxed"
                                />
                            </div>
                        </div>
                    )}

                    {/* 3. KIỂM DUYỆT (GOVERNANCE & MODERATION) */}
                    {activeTab === "moderation" && (
                        <div className="space-y-3">
                            <h4 className="text-[11px] font-extrabold text-[#8B93A7] uppercase tracking-wider mb-2">
                                MODERATION & GOVERNANCE
                            </h4>

                            {/* Auto Approve */}
                            <div className="p-3.5 rounded-[16px] bg-[#121827] border border-[#1A2130] flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-9 h-9 rounded-[12px] flex items-center justify-center font-bold text-sm ${
                                        autoApprovePosts ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"
                                    }`}>
                                        <FontAwesomeIcon icon={autoApprovePosts ? faCheckCircle : faTriangleExclamation} />
                                    </div>
                                    <div>
                                        <p className="font-extrabold text-xs text-[#F1F3F7]">Tự Động Duyệt Bài Viết Mới</p>
                                        <p className="text-[11px] text-[#8B93A7]">
                                            {autoApprovePosts
                                                ? "Đang Bật: Bài đăng mới xuất hiện ngay lập tức."
                                                : "Đang Tắt: Bài đăng mới cần Admin/Mod duyệt thủ công."}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => handleToggleGovernance("autoApprovePosts")}
                                    className={`px-3 py-1.5 rounded-[12px] font-extrabold text-xs transition-all cursor-pointer ${
                                        autoApprovePosts
                                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25"
                                            : "bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25"
                                    }`}
                                >
                                    {autoApprovePosts ? "ĐANG BẬT" : "CẦN DUYỆT"}
                                </button>
                            </div>

                            {/* Lock Community */}
                            <div className="p-3.5 rounded-[16px] bg-[#121827] border border-[#1A2130] flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-9 h-9 rounded-[12px] flex items-center justify-center font-bold text-sm ${
                                        isLocked ? "bg-rose-500/15 text-rose-400" : "bg-emerald-500/15 text-emerald-400"
                                    }`}>
                                        <FontAwesomeIcon icon={isLocked ? faLock : faLockOpen} />
                                    </div>
                                    <div>
                                        <p className="font-extrabold text-xs text-[#F1F3F7]">Khóa / Đóng Băng Cộng Đồng</p>
                                        <p className="text-[11px] text-[#8B93A7]">
                                            {isLocked
                                                ? "Đang Khóa: Thành viên bị chặn đăng bài thảo luận mới."
                                                : "Đang Mở: Thành viên đăng thảo luận bình thường."}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => handleToggleGovernance("isLocked")}
                                    className={`px-3 py-1.5 rounded-[12px] font-extrabold text-xs transition-all cursor-pointer ${
                                        isLocked
                                            ? "bg-rose-500 text-white hover:bg-rose-600"
                                            : "bg-[#05070D] border border-[#20283A] text-[#8B93A7] hover:text-[#F1F3F7]"
                                    }`}
                                >
                                    {isLocked ? "MỞ KHÓA" : "KHÓA NGAY"}
                                </button>
                            </div>

                            {/* Featured Hub */}
                            <div className="p-3.5 rounded-[16px] bg-[#121827] border border-[#1A2130] flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-9 h-9 rounded-[12px] flex items-center justify-center font-bold text-sm ${
                                        featured ? "bg-amber-500/15 text-amber-400" : "bg-[#05070D] text-[#60697C]"
                                    }`}>
                                        <FontAwesomeIcon icon={faStar} />
                                    </div>
                                    <div>
                                        <p className="font-extrabold text-xs text-[#F1F3F7]">Cộng Đồng Tiêu Điểm (Featured Hub)</p>
                                        <p className="text-[11px] text-[#8B93A7]">Ưu tiên ghim xuất hiện trên trang danh mục khám phá.</p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => handleToggleGovernance("featured")}
                                    className={`px-3 py-1.5 rounded-[12px] font-extrabold text-xs transition-all cursor-pointer ${
                                        featured
                                            ? "bg-amber-500 text-black hover:bg-amber-400"
                                            : "bg-[#05070D] border border-[#20283A] text-[#8B93A7] hover:text-[#F1F3F7]"
                                    }`}
                                >
                                    {featured ? "ĐÃ NỔI BẬT" : "GHIM HOT"}
                                </button>
                            </div>

                            {/* NSFW Filter */}
                            <div className="p-3.5 rounded-[16px] bg-[#121827] border border-[#1A2130] flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-9 h-9 rounded-[12px] flex items-center justify-center font-bold text-sm ${
                                        isNsfw ? "bg-rose-500/15 text-rose-400" : "bg-[#05070D] text-[#60697C]"
                                    }`}>
                                        <FontAwesomeIcon icon={faEye} />
                                    </div>
                                    <div>
                                        <p className="font-extrabold text-xs text-[#F1F3F7]">Giới Hạn Nội Dung 18+ (NSFW Filter)</p>
                                        <p className="text-[11px] text-[#8B93A7]">Yêu cầu xác nhận độ tuổi trước khi truy cập.</p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => handleToggleGovernance("isNsfw")}
                                    className={`px-3 py-1.5 rounded-[12px] font-extrabold text-xs transition-all cursor-pointer ${
                                        isNsfw
                                            ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                                            : "bg-[#05070D] border border-[#20283A] text-[#8B93A7] hover:text-[#F1F3F7]"
                                    }`}
                                >
                                    {isNsfw ? "NSFW 18+" : "CHUẨN HÓA"}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* 4. THÀNH VIÊN */}
                    {activeTab === "members" && (
                        <div className="space-y-3">
                            <h4 className="text-[11px] font-extrabold text-[#8B93A7] uppercase tracking-wider mb-2">
                                MEMBERSHIP ROLES & MODERATION
                            </h4>

                            <div className="space-y-2">
                                {members.map((m) => (
                                    <div
                                        key={m.username}
                                        className="p-3 rounded-[14px] bg-[#121827] border border-[#1A2130] flex items-center justify-between gap-3 flex-wrap"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <img
                                                src={m.avatar}
                                                alt={m.displayName}
                                                className="w-9 h-9 rounded-full object-cover ring-1 ring-[#20283A] shrink-0"
                                            />
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-extrabold text-xs text-[#F1F3F7] truncate">{m.displayName}</p>
                                                    <span
                                                        className={`px-2 py-0.2 rounded-full text-[9px] font-black uppercase ${
                                                            m.role === "owner"
                                                                ? "bg-[#FFB020] text-black"
                                                                : m.role === "admin"
                                                                ? "bg-[#FF2D63] text-white"
                                                                : m.role === "mod"
                                                                ? "bg-emerald-500 text-white"
                                                                : "bg-[#20283A] text-[#8B93A7]"
                                                        }`}
                                                    >
                                                        {m.role}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-[#60697C] font-mono">@{m.username} · {m.joinedAt}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 ml-auto">
                                            {m.role !== "owner" && (
                                                <select
                                                    value={m.role}
                                                    onChange={(e) => handleRoleChange(m.username, e.target.value as "admin" | "mod" | "member")}
                                                    className="h-8 px-2.5 rounded-[10px] border border-[#20283A] bg-[#05070D] text-xs font-bold text-[#F1F3F7] cursor-pointer outline-none focus:border-[#FF2D63]"
                                                >
                                                    <option value="admin" className="bg-[#0D111D]">Quản Trị (Admin)</option>
                                                    <option value="mod" className="bg-[#0D111D]">Moderator</option>
                                                    <option value="member" className="bg-[#0D111D]">Thành Viên</option>
                                                </select>
                                            )}

                                            {m.role !== "owner" && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleKickMember(m.username)}
                                                    title="Đuổi khỏi cộng đồng"
                                                    className="w-8 h-8 rounded-[10px] bg-rose-500/15 text-rose-400 hover:bg-rose-500 hover:text-white transition-all cursor-pointer flex items-center justify-center shrink-0"
                                                >
                                                    <FontAwesomeIcon icon={faBan} className="text-xs" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 5. DANGER ZONE */}
                    {activeTab === "danger" && (
                        <div className="p-4 rounded-[16px] bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.35)] space-y-3">
                            <div className="flex items-center gap-2 text-rose-400 font-extrabold text-sm uppercase tracking-wide">
                                <FontAwesomeIcon icon={faTriangleExclamation} />
                                <span>Giải Thể / Xóa Cộng Đồng Vĩnh Viễn</span>
                            </div>

                            <p className="text-xs text-[#8B93A7] leading-relaxed">
                                Hành động này sẽ xóa toàn bộ bài viết, thảo luận, danh sách thành viên của cộng đồng{" "}
                                <strong className="text-rose-400">{community.name}</strong>. Hành động không thể hoàn tác!
                            </p>

                            <div className="flex flex-col gap-1.5 pt-1">
                                <label className="text-[11px] font-bold text-[#8B93A7]">
                                    Nhập chính xác <strong className="text-rose-400 select-all">{community.name}</strong> để xác nhận:
                                </label>
                                <input
                                    type="text"
                                    value={confirmDeleteText}
                                    onChange={(e) => setConfirmDeleteText(e.target.value)}
                                    placeholder={community.name}
                                    className="h-10 px-3.5 rounded-[12px] border border-rose-500/40 bg-[#05070D] text-xs font-mono font-bold text-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-500"
                                />
                            </div>

                            <button
                                type="button"
                                disabled={confirmDeleteText.trim() !== community.name}
                                onClick={handleDeleteCommunity}
                                className={`w-full mt-1 py-2.5 px-4 rounded-[12px] font-black text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                                    confirmDeleteText.trim() === community.name
                                        ? "bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/20"
                                        : "bg-[#121827] text-[#60697C] cursor-not-allowed border border-[#20283A]"
                                }`}
                            >
                                <FontAwesomeIcon icon={faTrash} />
                                <span>XÁC NHẬN XÓA VĨNH VIỄN</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </AppModal>
    );
};
