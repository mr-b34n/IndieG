import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faUsers, faLayerGroup, faImage, faPlus, faTag, faShieldHalved } from "@fortawesome/free-solid-svg-icons";
import { useCommunitiesStore } from "../store/useCommunitiesStore";
import type { CommunityData } from "../types";
import { getCurrentAuthor } from "@/features/post";
import { useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "@/features/auth";

const CATEGORY_OPTIONS = ["FPS", "RPG", "MOBA", "Survival", "Open World", "Strategy", "Sports", "MMORPG", "Casual", "Fighting"];

const DEFAULT_LOGOS = [
    "https://api.dicebear.com/7.x/identicon/svg?seed=GamingHub1&backgroundColor=6366f1",
    "https://api.dicebear.com/7.x/identicon/svg?seed=ValorantSEA&backgroundColor=ff4655",
    "https://api.dicebear.com/7.x/identicon/svg?seed=AnimeGamer&backgroundColor=ec4899",
    "https://api.dicebear.com/7.x/identicon/svg?seed=Dota2Community&backgroundColor=3b82f6",
    "https://api.dicebear.com/7.x/identicon/svg?seed=CyberClub&backgroundColor=10b981",
];

const DEFAULT_BACKDROPS = [
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200&auto=format&fit=crop",
];

interface CreateCommunityModalProps {
    onClose: () => void;
}

export const CreateCommunityModal: React.FC<CreateCommunityModalProps> = ({ onClose }) => {
    const navigate = useNavigate();
    const addCommunity = useCommunitiesStore((state) => state.addCommunity);
    const createCommunity = useCommunitiesStore((state) => state.createCommunity);
    const user = useAuthStore((state) => state.user);

    const [name, setName] = useState("");
    const [category, setCategory] = useState("FPS");
    const [description, setDescription] = useState("");
    const [tagsInput, setTagsInput] = useState("");
    const [logo, setLogo] = useState(DEFAULT_LOGOS[0]);
    const [backdrop, setBackdrop] = useState(DEFAULT_BACKDROPS[0]);
    const [rulesInput, setRulesInput] = useState(
        "1. Tôn trọng tất cả các thành viên trong cộng đồng.\n2. Không đả kích, toxic hoặc xúc phạm cá nhân.\n3. Không đăng bài quảng cáo rác (spam)."
    );

    const canCreate = user?.role === 'admin';
    
    React.useEffect(() => {
        if (!canCreate) {
            onClose();
        }
    }, [canCreate, onClose]);

    if (!canCreate) {
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        const authorUsername = getCurrentAuthor();
        const { user, customAvatar } = useAuthStore.getState();
        const displayName = user?.user_metadata?.full_name || user?.username || authorUsername;
        const avatar = customAvatar || user?.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${authorUsername}`;

        const tags = tagsInput
            .split(",")
            .map((t) => t.trim().toLowerCase())
            .filter(Boolean);
        const rules = rulesInput
            .split("\n")
            .map((r) => r.trim())
            .filter(Boolean);

        let createdCommunity: CommunityData | null = null;
        if (createCommunity) {
            createdCommunity = await createCommunity({
                name: name.trim(),
                logo,
                backdrop,
                category,
                description: description.trim() || `Cộng đồng ${name.trim()} - Nơi kết nối các game thủ yêu thích ${category}.`,
                tags: tags.length > 0 ? tags : [name.trim().toLowerCase(), category.toLowerCase()],
            });
        }

        if (!createdCommunity) {
            const newId = `comm_${Date.now()}`;
            createdCommunity = {
                id: newId,
                name: name.trim(),
                logo,
                backdrop,
                category,
                description: description.trim() || `Cộng đồng ${name.trim()} - Nơi kết nối các game thủ yêu thích ${category}.`,
                members: 1,
                onlineNow: 1,
                tags: tags.length > 0 ? tags : [name.trim().toLowerCase(), category.toLowerCase()],
                joined: true,
                featured: false,
                owner: authorUsername,
                admins: [authorUsername],
                rules: rules.length > 0 ? rules : ["Tôn trọng mọi người trong cộng đồng", "Không đả kích hay gây tranh cãi toxic"],
                memberList: [
                    {
                        username: authorUsername,
                        displayName,
                        avatar,
                        role: "owner",
                        joinedAt: "Vừa xong",
                    },
                ],
            };
            addCommunity(createdCommunity);
        }

        onClose();
        navigate({ to: "/community/$communityId", params: { communityId: String(createdCommunity.id) } });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
            <div className="relative w-full max-w-xl bg-surface border border-divider-primary rounded-[6px] shadow-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-divider-primary">
                    <h3 className="text-sm font-black text-text uppercase tracking-wider flex items-center gap-2">
                        <FontAwesomeIcon icon={faUsers} className="text-primary text-xs" />
                        <span>Tạo Cộng Đồng Mới</span>
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-7 h-7 rounded-[4px] bg-surface-hover text-text-muted hover:text-text flex items-center justify-center transition-colors cursor-pointer border border-divider-primary"
                    >
                        <FontAwesomeIcon icon={faXmark} className="text-xs" />
                    </button>
                </div>

                {/* Body form */}
                <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
                    {/* Community Name */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-text-muted flex items-center gap-1.5">
                            <FontAwesomeIcon icon={faUsers} className="text-primary text-[10px]" />
                            <span>Tên cộng đồng</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="VD: Valorant Vietnam Esports"
                            className="h-9 px-3 rounded-[4px] border border-divider-primary bg-bg text-xs text-text font-semibold focus:outline-none focus:border-primary transition-colors"
                            required
                        />
                    </div>

                    {/* Category */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-text-muted flex items-center gap-1.5">
                            <FontAwesomeIcon icon={faLayerGroup} className="text-primary text-[10px]" />
                            <span>Thể loại Game</span>
                        </label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="h-9 px-3 rounded-[4px] border border-divider-primary bg-bg text-xs text-text font-semibold focus:outline-none focus:border-primary cursor-pointer transition-colors"
                        >
                            {CATEGORY_OPTIONS.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-text-muted">Mô tả ngắn</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            placeholder="Giới thiệu mục tiêu, phong cách chơi hoặc chủ đề thảo luận chính của cộng đồng..."
                            className="p-2.5 rounded-[4px] border border-divider-primary bg-bg text-xs text-text font-medium focus:outline-none focus:border-primary resize-none transition-colors"
                        />
                    </div>

                    {/* Logo preset selector */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-text-muted flex items-center gap-1.5">
                            <FontAwesomeIcon icon={faImage} className="text-primary text-[10px]" />
                            <span>Biểu tượng (Logo)</span>
                        </label>
                        <div className="flex items-center gap-2 overflow-x-auto pb-1">
                            {DEFAULT_LOGOS.map((url, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setLogo(url)}
                                    className={`w-10 h-10 rounded-[4px] border overflow-hidden transition-all shrink-0 cursor-pointer ${
                                        logo === url ? "border-primary ring-2 ring-primary/30 scale-105" : "border-divider-primary opacity-70 hover:opacity-100"
                                    }`}
                                >
                                    <img src={url} alt={`Preset ${idx}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Backdrop preset selector */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-text-muted flex items-center gap-1.5">
                            <FontAwesomeIcon icon={faImage} className="text-amber-500 text-[10px]" />
                            <span>Ảnh bìa (Backdrop)</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {DEFAULT_BACKDROPS.map((url, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setBackdrop(url)}
                                    className={`h-14 rounded-[4px] border overflow-hidden transition-all shrink-0 cursor-pointer relative ${
                                        backdrop === url ? "border-primary ring-2 ring-primary/30" : "border-divider-primary opacity-70 hover:opacity-100"
                                    }`}
                                >
                                    <img src={url} alt={`Backdrop ${idx}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-text-muted flex items-center gap-1.5">
                            <FontAwesomeIcon icon={faTag} className="text-primary text-[10px]" />
                            <span>Thẻ tìm kiếm (Tags, phân cách bằng dấu phẩy)</span>
                        </label>
                        <input
                            type="text"
                            value={tagsInput}
                            onChange={(e) => setTagsInput(e.target.value)}
                            placeholder="fps, esports, gaming, recruitment"
                            className="h-9 px-3 rounded-[4px] border border-divider-primary bg-bg text-xs text-text font-semibold focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>

                    {/* Rules */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-text-muted flex items-center gap-1.5">
                            <FontAwesomeIcon icon={faShieldHalved} className="text-emerald-500 text-[10px]" />
                            <span>Nội quy cộng đồng (mỗi dòng 1 quy tắc)</span>
                        </label>
                        <textarea
                            value={rulesInput}
                            onChange={(e) => setRulesInput(e.target.value)}
                            rows={3}
                            className="p-2.5 rounded-[4px] border border-divider-primary bg-bg text-xs text-text font-medium focus:outline-none focus:border-primary resize-none transition-colors leading-relaxed"
                        />
                    </div>

                    {/* Submit button */}
                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-divider-primary">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-3.5 py-1.5 rounded-[4px] bg-surface-hover text-text-muted text-xs font-bold hover:text-text transition-colors cursor-pointer border border-divider-primary"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-1.5 rounded-[4px] bg-primary hover:bg-primary/90 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                        >
                            <FontAwesomeIcon icon={faPlus} className="text-[10px]" />
                            <span>Tạo cộng đồng</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
