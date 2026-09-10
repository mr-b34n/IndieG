import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faStar as faStarSolid,
    faCrown,
    faGamepad,
    faPlus,
    faTrash,
    faSpinner,
    faXmark,
    faClock,
    faMedal,
} from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";
import type { LibraryGame } from "../../types";
import { useTranslation, type TranslateFn } from "@/shared/hooks/useTranslate";

interface GamesTabProps {
    games: LibraryGame[];
    isLoading?: boolean;
    isOwnProfile?: boolean;
    onAddGame?: (game: { name: string; hours?: number; rank?: string; logo?: string }) => Promise<void> | void;
    onDeleteGame?: (id: string | number) => Promise<void> | void;
    isSubmitting?: boolean;
    t?: TranslateFn;
}

const POPULAR_GAME_SUGGESTIONS = [
    {
        name: "Counter-Strike 2",
        logo: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=120&auto=format&fit=crop&q=80",
        rank: "Premier 18,500",
    },
    {
        name: "Valorant",
        logo: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=120&auto=format&fit=crop&q=80",
        rank: "Ascendant 2",
    },
    {
        name: "League of Legends",
        logo: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=120&auto=format&fit=crop&q=80",
        rank: "Master",
    },
    {
        name: "Dota 2",
        logo: "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=120&auto=format&fit=crop&q=80",
        rank: "Ancient 4",
    },
    {
        name: "Black Myth: Wukong",
        logo: "https://images.unsplash.com/photo-1612287233207-6f8e77a41490?w=120&auto=format&fit=crop&q=80",
        rank: "Destined One",
    },
    {
        name: "Cyberpunk 2077",
        logo: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=120&auto=format&fit=crop&q=80",
        rank: "Night City Legend",
    },
];

export const GamesTab = ({
    games = [],
    isLoading = false,
    isOwnProfile = false,
    onAddGame,
    onDeleteGame,
    isSubmitting = false,
    t: propT,
}: GamesTabProps) => {
    const { t: hookT } = useTranslation();
    const t = propT || hookT;
    const safeGames = games || [];

    const [selectedGameName, setSelectedGameName] = useState<string>(
        safeGames.find((g) => g?.isFeatured)?.name || safeGames[0]?.name || ""
    );
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<string | number | null>(null);

    // Add game form states
    const [name, setName] = useState("");
    const [hours, setHours] = useState<number | string>("");
    const [rank, setRank] = useState("");
    const [logo, setLogo] = useState("");

    const featuredGame = safeGames.find((g) => g?.name === selectedGameName) || safeGames[0];
    const otherGames = safeGames;

    const handleSelectSuggestion = (s: typeof POPULAR_GAME_SUGGESTIONS[0]) => {
        setName(s.name);
        setLogo(s.logo);
        setRank(s.rank);
    };

    const handleOpenAddModal = () => {
        setName("");
        setHours("");
        setRank("");
        setLogo("");
        setIsAddModalOpen(true);
    };

    const handleSubmitAddGame = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        if (onAddGame) {
            await onAddGame({
                name: name.trim(),
                hours: hours ? Number(hours) : 0,
                rank: rank.trim() || "Player",
                logo: logo.trim() || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=120&auto=format&fit=crop&q=80",
            });
        }
        setIsAddModalOpen(false);
    };

    const handleDelete = async (e: React.MouseEvent, id?: string | number) => {
        e.stopPropagation();
        if (!id || !onDeleteGame) return;
        setDeletingId(id);
        try {
            await onDeleteGame(id);
        } finally {
            setDeletingId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="w-full bg-[#0A0C0E] rounded-[14px] p-12 text-center flex flex-col items-center justify-center gap-3">
                <FontAwesomeIcon icon={faSpinner} className="animate-spin text-2xl text-[#1688E8]" />
                <p className="text-xs text-[#8D97AA]">Đang tải thư viện game...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-5 w-full animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faCrown} className="text-[#E5A93D] text-sm" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#F0F1F2]">
                        Game Mastery Library
                    </h3>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#8A8F98] px-3 py-1 rounded-[6px] bg-[#13161C]">
                        {safeGames.length} Games
                    </span>
                    {isOwnProfile && onAddGame && (
                        <button
                            type="button"
                            onClick={handleOpenAddModal}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-[6px] bg-[#1688E8] hover:bg-[#1478D0] text-white text-xs font-bold transition-colors cursor-pointer"
                        >
                            <FontAwesomeIcon icon={faPlus} className="text-[10px]" />
                            <span>Thêm game</span>
                        </button>
                    )}
                </div>
            </div>

            {safeGames.length === 0 ? (
                <div className="w-full bg-[#0A0C0E] rounded-[14px] p-10 text-center flex flex-col items-center justify-center gap-3 shadow-sm">
                    <div className="w-12 h-12 rounded-full bg-[#13161C] flex items-center justify-center text-[#5F697C] text-xl">
                        <FontAwesomeIcon icon={faGamepad} />
                    </div>
                    <h4 className="text-sm font-bold text-[#F0F1F2]">{t("profile.empty.gamesTitle")}</h4>
                    <p className="text-xs text-[#8D97AA] max-w-sm">{t("profile.empty.gamesDesc")}</p>
                    {isOwnProfile && onAddGame && (
                        <button
                            type="button"
                            onClick={handleOpenAddModal}
                            className="mt-2 px-4 py-2 rounded-[8px] bg-[#1688E8] hover:bg-[#1478D0] text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                            <FontAwesomeIcon icon={faPlus} />
                            Thêm game vào thư viện
                        </button>
                    )}
                </div>
            ) : (
                <>
                    {/* Featured Hero Game Mastery */}
                    {featuredGame && (
                        <div className="w-full bg-[#0A0C0E] rounded-[14px] p-5 sm:p-6 shadow-sm flex flex-col gap-4">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#13161C] p-4 rounded-[10px]">
                                <div className="flex items-center gap-4">
                                    <img
                                        src={featuredGame.logo || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=120&auto=format&fit=crop&q=80"}
                                        alt={featuredGame.name || "Game"}
                                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-[8px] object-cover shrink-0"
                                    />
                                    <div className="flex flex-col gap-0.5">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-[#F0F1F2] text-base sm:text-lg">{featuredGame.name || "Featured Game"}</h4>
                                            <span className="px-2 py-0.5 rounded-[4px] bg-[#1688E8]/15 text-[#1688E8] text-[10px] font-bold">
                                                FEATURED
                                            </span>
                                        </div>
                                        <span className="text-xs text-[#9A9DA3]">
                                            {featuredGame.hours} Hours · {featuredGame.ratingScore || featuredGame.rank || "Top Tier"}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className="px-2.5 py-1 rounded-[6px] bg-[#181C24] text-[#24C58A] text-xs font-bold">
                                        {featuredGame.keyStat || `${featuredGame.hours}h Winrate 68.4%`}
                                    </span>
                                </div>
                            </div>

                            {/* Skills breakdown */}
                            {featuredGame.skills && featuredGame.skills.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                    {featuredGame.skills.map((s) => (
                                        <div key={s.name} className="flex items-center justify-between p-2.5 rounded-[8px] bg-[#13161C] text-xs">
                                            <span className="font-medium text-[#9A9DA3]">{s.name}</span>
                                            <div className="flex items-center gap-0.5 text-[#E5A93D] text-[11px]">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <FontAwesomeIcon
                                                        key={star}
                                                        icon={star <= s.stars ? faStarSolid : faStarRegular}
                                                        className={star <= s.stars ? "text-[#E5A93D]" : "text-[#666A71]/40"}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Games Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {otherGames.map((game) => {
                            const isSelected = game.name === featuredGame?.name;
                            const isThisDeleting = deletingId === game.id;

                            return (
                                <div
                                    key={game.id || game.name}
                                    onClick={() => setSelectedGameName(game.name)}
                                    className={`group relative flex items-center justify-between p-3.5 rounded-[10px] text-left transition-all cursor-pointer ${
                                        isSelected
                                            ? "bg-[#192230] shadow-sm ring-1 ring-[#1688E8]/50"
                                            : "bg-[#0A0C0E] hover:bg-[#13161C] text-[#9A9DA3]"
                                    }`}
                                >
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <img 
                                            src={game.logo} 
                                            alt={game.name} 
                                            className="w-11 h-11 rounded-[6px] object-cover shrink-0" 
                                        />
                                        <div className="flex flex-col min-w-0">
                                            <h4 className="font-bold text-xs sm:text-sm text-[#F0F1F2] truncate">
                                                {game.name}
                                            </h4>
                                            <span className="text-[11px] text-[#8A8F98] truncate">
                                                {game.rank}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0 pl-2">
                                        <span className="text-xs font-bold font-mono text-[#F0F1F2]">
                                            {game.hours}h
                                        </span>

                                        {isOwnProfile && onDeleteGame && (
                                            <button
                                                type="button"
                                                title="Xóa game khỏi thư viện"
                                                onClick={(e) => handleDelete(e, game.id)}
                                                disabled={isThisDeleting}
                                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-[6px] hover:bg-rose-500/20 text-[#8A8F98] hover:text-rose-400 transition-all cursor-pointer"
                                            >
                                                <FontAwesomeIcon
                                                    icon={isThisDeleting ? faSpinner : faTrash}
                                                    className={`text-xs ${isThisDeleting ? "animate-spin" : ""}`}
                                                />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {/* Modal Thêm Game Vào Thư Viện */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
                    <div className="w-full max-w-md bg-[#0F1318] border border-[#222936] rounded-[16px] p-6 flex flex-col gap-4 shadow-2xl">
                        <div className="flex items-center justify-between pb-2 border-b border-[#1E2533]">
                            <div className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faGamepad} className="text-[#1688E8] text-sm" />
                                <h3 className="font-bold text-sm text-[#F0F1F2]">Thêm Game Vào Thư Viện</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsAddModalOpen(false)}
                                className="text-[#8A8F98] hover:text-[#F0F1F2] p-1 rounded transition-colors cursor-pointer"
                            >
                                <FontAwesomeIcon icon={faXmark} />
                            </button>
                        </div>

                        {/* Gợi ý game phổ biến */}
                        <div className="flex flex-col gap-1.5">
                            <span className="text-[11px] font-semibold text-[#8A8F98]">Gợi ý nhanh:</span>
                            <div className="flex flex-wrap gap-1.5">
                                {POPULAR_GAME_SUGGESTIONS.map((s) => (
                                    <button
                                        key={s.name}
                                        type="button"
                                        onClick={() => handleSelectSuggestion(s)}
                                        className="text-[11px] px-2.5 py-1 rounded-[6px] bg-[#161D27] hover:bg-[#1E2838] text-[#CCD2DC] hover:text-white transition-colors cursor-pointer"
                                    >
                                        {s.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <form onSubmit={handleSubmitAddGame} className="flex flex-col gap-3">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-[#CCD2DC]">
                                    Tên game <span className="text-rose-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Ví dụ: Counter-Strike 2"
                                    className="px-3 py-2 rounded-[8px] bg-[#161D27] border border-[#232D3F] text-xs text-[#F0F1F2] placeholder-[#5A6478] focus:outline-hidden focus:border-[#1688E8]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-semibold text-[#CCD2DC] flex items-center gap-1">
                                        <FontAwesomeIcon icon={faClock} className="text-[10px] text-[#8A8F98]" />
                                        Số giờ chơi
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={hours}
                                        onChange={(e) => setHours(e.target.value)}
                                        placeholder="0"
                                        className="px-3 py-2 rounded-[8px] bg-[#161D27] border border-[#232D3F] text-xs text-[#F0F1F2] placeholder-[#5A6478] focus:outline-hidden focus:border-[#1688E8]"
                                    />
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-semibold text-[#CCD2DC] flex items-center gap-1">
                                        <FontAwesomeIcon icon={faMedal} className="text-[10px] text-[#8A8F98]" />
                                        Rank / Danh hiệu
                                    </label>
                                    <input
                                        type="text"
                                        value={rank}
                                        onChange={(e) => setRank(e.target.value)}
                                        placeholder="Ví dụ: Diamond, Veteran"
                                        className="px-3 py-2 rounded-[8px] bg-[#161D27] border border-[#232D3F] text-xs text-[#F0F1F2] placeholder-[#5A6478] focus:outline-hidden focus:border-[#1688E8]"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-[#CCD2DC]">
                                    Ảnh bìa / Logo URL (Tùy chọn)
                                </label>
                                <input
                                    type="url"
                                    value={logo}
                                    onChange={(e) => setLogo(e.target.value)}
                                    placeholder="https://..."
                                    className="px-3 py-2 rounded-[8px] bg-[#161D27] border border-[#232D3F] text-xs text-[#F0F1F2] placeholder-[#5A6478] focus:outline-hidden focus:border-[#1688E8]"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-[#1E2533]">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-4 py-2 rounded-[8px] bg-[#161D27] hover:bg-[#1E2838] text-[#CCD2DC] text-xs font-semibold transition-colors cursor-pointer"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={!name.trim() || isSubmitting}
                                    className="px-4 py-2 rounded-[8px] bg-[#1688E8] hover:bg-[#1478D0] disabled:opacity-50 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                                >
                                    {isSubmitting && <FontAwesomeIcon icon={faSpinner} className="animate-spin text-xs" />}
                                    Thêm vào thư viện
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export { GamesTab as LibraryTab };

