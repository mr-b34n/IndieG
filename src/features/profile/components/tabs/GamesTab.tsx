import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AppIcon as FontAwesomeIcon } from "@/shared/components/ui/Icon";
import { GameController as faGamepad, Plus as faPlus, Trash as faTrash, CircleNotch as faSpinner, X as faXmark, Clock as faClock, CaretRight as faChevronRight, Star as faStar } from "@phosphor-icons/react";
import type { LibraryGame } from "../../types";
import { useTranslation, type TranslateFn } from "@/shared/hooks/useTranslate";

interface GamesTabProps {
    games?: LibraryGame[];
    isLoading?: boolean;
    isOwnProfile?: boolean;
    onAddGame?: (game: { name: string; hours?: number; rank?: string; logo?: string }) => Promise<void> | void;
    onDeleteGame?: (id: string | number) => Promise<void> | void;
    isSubmitting?: boolean;
    t?: TranslateFn;
}

export const GamesTab = ({
    games,
    isLoading = false,
    isOwnProfile = false,
    onAddGame,
    onDeleteGame,
    isSubmitting = false,
    t: propT,
}: GamesTabProps) => {
    const { t: hookT } = useTranslation();
    const t = propT || hookT;
    const navigate = useNavigate();

    // Modal state for adding game
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [name, setName] = useState("");
    const [hours, setHours] = useState<number | "">("");
    const [rank, setRank] = useState("");
    const [logo, setLogo] = useState("");
    const [formError, setFormError] = useState("");

    const handleNavigateToGame = (gameName?: string) => {
        if (!gameName) return;
        const slug = gameName
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
        navigate({ to: "/game/$gameSlug", params: { gameSlug: slug } });
    };

    const handleOpenAddModal = () => {
        setName("");
        setHours("");
        setRank("");
        setLogo("");
        setFormError("");
        setIsAddModalOpen(true);
    };

    const handleCloseAddModal = () => {
        setIsAddModalOpen(false);
        setFormError("");
    };

    const handleSubmitAddGame = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedName = name.trim();
        if (!trimmedName) {
            setFormError(t("profile.gameNameRequired", { defaultValue: "Vui lòng nhập tên trò chơi." }));
            return;
        }

        if (onAddGame) {
            try {
                await onAddGame({
                    name: trimmedName,
                    hours: typeof hours === "number" ? hours : Number(hours) || 0,
                    rank: rank.trim() || "Player",
                    logo: logo.trim() || undefined,
                });
                handleCloseAddModal();
            } catch (err: unknown) {
                const message = (err as { message?: string })?.message || "Không thể thêm game.";
                setFormError(message);
            }
        }
    };

    if (isLoading) {
        return (
            <div className="w-full bg-surface border border-border rounded-[14px] p-16 text-center flex flex-col items-center justify-center gap-3 shadow-xs">
                <FontAwesomeIcon icon={faSpinner} className="animate-spin text-2xl text-primary" />
                <p className="text-xs font-medium text-text-muted">{t("common.loading", { defaultValue: "Đang tải thư viện..." })}</p>
            </div>
        );
    }

    const displayGames = games && games.length > 0 ? games : [];

    if (displayGames.length === 0) {
        return (
            <div className="w-full bg-surface border border-border rounded-[14px] p-12 text-center flex flex-col items-center justify-center gap-3 shadow-xs animate-fade-in">
                <div className="w-12 h-12 rounded-full bg-surface-inner flex items-center justify-center text-text-faint text-xl border border-border/50">
                    <FontAwesomeIcon icon={faGamepad} />
                </div>
                <h4 className="text-sm font-bold text-text">
                    {t("profile.empty.gamesTitle", { defaultValue: "Thư viện trống" })}
                </h4>
                <p className="text-xs text-text-muted max-w-sm">
                    {isOwnProfile
                        ? t("profile.empty.gamesDesc", { defaultValue: "Chưa có tựa game nào trong thư viện của bạn." })
                        : t("profile.empty.gamesDescOther", { defaultValue: "Người dùng này chưa thêm game vào thư viện." })}
                </p>
                {isOwnProfile && onAddGame && (
                    <button
                        type="button"
                        onClick={handleOpenAddModal}
                        className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-[8px] bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                        <FontAwesomeIcon icon={faPlus} />
                        <span>{t("profile.addGameBtn", { defaultValue: "Thêm game vào thư viện" })}</span>
                    </button>
                )}

                {/* Add Game Modal */}
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                        <div className="w-full max-w-md bg-surface border border-border rounded-[14px] p-5 shadow-2xl flex flex-col gap-4 text-left animate-fade-in">
                            <div className="flex items-center justify-between pb-2 border-b border-border/60">
                                <h4 className="text-sm font-bold text-text flex items-center gap-2">
                                    <FontAwesomeIcon icon={faGamepad} className="text-primary text-xs" />
                                    <span>{t("profile.addGameTitle", { defaultValue: "Thêm game vào thư viện" })}</span>
                                </h4>
                                <button
                                    type="button"
                                    onClick={handleCloseAddModal}
                                    className="p-1 text-text-muted hover:text-text rounded-md transition-colors cursor-pointer"
                                >
                                    <FontAwesomeIcon icon={faXmark} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmitAddGame} className="flex flex-col gap-3">
                                {formError && (
                                    <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-400 text-xs font-medium border border-rose-500/20">
                                        {formError}
                                    </div>
                                )}

                                <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-semibold text-text-muted">
                                        {t("profile.gameNameLabel", { defaultValue: "Tên trò chơi" })} <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Ví dụ: Counter-Strike 2, Elden Ring..."
                                        className="w-full bg-surface-inner border border-border/60 rounded-[8px] px-3 py-2 text-xs text-text placeholder-text-faint focus:outline-none focus:ring-1 focus:ring-primary"
                                        autoFocus
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[11px] font-semibold text-text-muted">
                                            {t("profile.hoursPlayedLabel", { defaultValue: "Số giờ đã chơi" })}
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={hours}
                                            onChange={(e) => setHours(e.target.value === "" ? "" : Math.max(0, Number(e.target.value)))}
                                            placeholder="0"
                                            className="w-full bg-surface-inner border border-border/60 rounded-[8px] px-3 py-2 text-xs text-text placeholder-text-faint focus:outline-none focus:ring-1 focus:ring-primary"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[11px] font-semibold text-text-muted">
                                            {t("profile.rankLabel", { defaultValue: "Xếp hạng / Trạng thái" })}
                                        </label>
                                        <input
                                            type="text"
                                            value={rank}
                                            onChange={(e) => setRank(e.target.value)}
                                            placeholder="Mastered, Playing..."
                                            className="w-full bg-surface-inner border border-border/60 rounded-[8px] px-3 py-2 text-xs text-text placeholder-text-faint focus:outline-none focus:ring-1 focus:ring-primary"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-semibold text-text-muted">
                                        {t("profile.logoUrlLabel", { defaultValue: "URL ảnh bìa / Logo (Tùy chọn)" })}
                                    </label>
                                    <input
                                        type="url"
                                        value={logo}
                                        onChange={(e) => setLogo(e.target.value)}
                                        placeholder="https://..."
                                        className="w-full bg-surface-inner border border-border/60 rounded-[8px] px-3 py-2 text-xs text-text placeholder-text-faint focus:outline-none focus:ring-1 focus:ring-primary"
                                    />
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60 mt-1">
                                    <button
                                        type="button"
                                        onClick={handleCloseAddModal}
                                        className="px-3.5 py-1.5 rounded-[8px] text-xs font-semibold text-text-muted hover:text-text hover:bg-surface-hover transition-colors cursor-pointer"
                                    >
                                        {t("common.cancel", { defaultValue: "Hủy" })}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !name.trim()}
                                        className="px-4 py-1.5 rounded-[8px] bg-primary hover:bg-primary-hover disabled:opacity-50 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                                    >
                                        {isSubmitting && <FontAwesomeIcon icon={faSpinner} className="animate-spin text-xs" />}
                                        <span>{t("common.save", { defaultValue: "Lưu" })}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    const featuredGame = displayGames.find((g) => g.isFeatured) || displayGames[0];
    const otherGames = displayGames.filter((g) => g.id !== featuredGame.id);
    const masteredCount = displayGames.filter((g) => (g.completion ?? 0) === 100 || (g.rank || "").toLowerCase().includes("master")).length;

    const fGame = {
        ...featuredGame,
        completion: featuredGame.completion ?? 100,
        difficulty: featuredGame.difficulty,
        achievements: featuredGame.achievements,
        banner: featuredGame.banner ?? featuredGame.logo,
        hours: featuredGame.hours ?? 0,
    };

    return (
        <div className="flex flex-col gap-6 w-full animate-fade-in bg-surface border border-border text-text p-4 sm:p-6 rounded-[16px] shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <div className="flex flex-col">
                    <h3 className="text-base sm:text-lg font-black tracking-tight text-text uppercase">
                        LIBRARY
                    </h3>
                    <p className="text-xs text-text-muted font-medium">
                        {t("profile.librarySubtitle", { defaultValue: "Bộ sưu tập trò chơi và thành tích" })}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                        <span className="text-base sm:text-lg font-black text-text leading-none">{masteredCount}</span>
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Mastered</span>
                    </div>
                    <div className="h-6 w-px bg-border/60" />
                    <div className="flex flex-col items-end">
                        <span className="text-base sm:text-lg font-black text-text leading-none">{displayGames.length}</span>
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{t("common.total", { defaultValue: "Tổng cộng" })}</span>
                    </div>
                    {isOwnProfile && onAddGame && (
                        <button
                            type="button"
                            onClick={handleOpenAddModal}
                            className="ml-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors cursor-pointer"
                        >
                            <FontAwesomeIcon icon={faPlus} className="text-[11px]" />
                            <span className="hidden sm:inline">{t("profile.addGameBtn", { defaultValue: "Thêm game" })}</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Featured Hero */}
            <div className="w-full rounded-[14px] overflow-hidden relative shadow-sm group min-h-[280px] sm:min-h-[320px] flex transition-colors border border-border/60 bg-surface-inner">
                <div className="absolute inset-0 z-0">
                    {fGame.banner && (
                        <img 
                            src={fGame.banner} 
                            alt="Banner" 
                            className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-[1.5s] ease-out opacity-25" 
                            onError={(e) => {
                                (e.currentTarget as HTMLImageElement).style.display = "none";
                            }}
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/90 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-90" />
                </div>
                
                <div className="relative z-10 p-5 sm:p-8 flex flex-col md:flex-row items-start md:items-end justify-between gap-6 w-full">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                        <div className="relative shrink-0">
                            <img
                                src={fGame.logo}
                                alt={fGame.name}
                                className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-[12px] object-cover shadow-md border border-border/60 bg-surface"
                                onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).src = "https://api.dicebear.com/7.x/identicon/svg?seed=game";
                                }}
                            />
                            {fGame.completion === 100 && (
                                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-surface rounded-full flex items-center justify-center shadow-md border border-border/60">
                                    <FontAwesomeIcon icon={faStar} className="text-amber-400 text-sm" />
                                </div>
                            )}
                        </div>
                        
                        <div className="flex flex-col gap-2.5">
                            <div className="flex items-center gap-2.5 flex-wrap">
                                <h4 className="font-black text-text text-2xl sm:text-3xl tracking-tight">{fGame.name}</h4>
                                {fGame.rank && (
                                    <span className="px-2 py-0.5 rounded-[6px] bg-primary/10 text-primary text-[10px] font-black tracking-widest uppercase border border-primary/20">
                                        {fGame.rank}
                                    </span>
                                )}
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-text-muted">
                                <div className="flex items-center gap-1.5 bg-surface px-2.5 py-1 rounded-[6px] border border-border/50">
                                    <FontAwesomeIcon icon={faClock} className="text-primary text-[11px]" />
                                    <span className="text-text">{fGame.hours} {t("profile.hoursPlayedLabel", { defaultValue: "Giờ" })}</span>
                                </div>
                                {fGame.difficulty && (
                                    <div className="flex items-center gap-1.5 bg-surface px-2.5 py-1 rounded-[6px] border border-border/50">
                                        <span className="text-text-muted">Độ khó:</span>
                                        <span className="text-rose-400 font-bold">{fGame.difficulty}</span>
                                    </div>
                                )}
                            </div>

                            {fGame.achievements && (
                                <div className="mt-2 flex flex-col gap-1.5 w-full max-w-xs bg-surface p-3 rounded-[10px] border border-border/50">
                                    <div className="flex justify-between text-[11px] font-bold text-text-muted">
                                        <span className="uppercase tracking-wider">Tiến độ thành tựu</span>
                                        <span className="text-amber-400">{typeof fGame.achievements === "object" ? `${fGame.achievements.current} / ${fGame.achievements.total}` : fGame.achievements}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-surface-inner rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary rounded-full"
                                            style={{ width: `${fGame.completion}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-end text-[10px] font-black text-amber-400">
                                        {fGame.completion}%
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="shrink-0 self-start md:self-end flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => handleNavigateToGame(fGame.name)}
                            className="group flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-[8px] bg-primary hover:bg-primary-hover text-white font-bold text-xs transition-colors cursor-pointer shadow-xs active:scale-95"
                        >
                            <span>Game Hub</span>
                            <FontAwesomeIcon icon={faChevronRight} className="text-[10px] group-hover:translate-x-0.5 transition-transform" />
                        </button>
                        {isOwnProfile && onDeleteGame && fGame.id !== undefined && (
                            <button
                                type="button"
                                onClick={() => fGame.id !== undefined && onDeleteGame(fGame.id)}
                                title="Xóa khỏi thư viện"
                                className="p-2 sm:p-2.5 rounded-[8px] bg-surface hover:bg-rose-500/10 text-text-muted hover:text-rose-500 border border-border/60 transition-colors cursor-pointer text-xs"
                            >
                                <FontAwesomeIcon icon={faTrash} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Other Games Collection Grid */}
            {otherGames.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 mt-2">
                    {otherGames.map((game) => (
                        <div
                            key={game.id || game.name}
                            className="group flex flex-col gap-2 cursor-pointer relative"
                        >
                            <div
                                onClick={() => handleNavigateToGame(game.name)}
                                className="relative aspect-[2/3] w-full rounded-[10px] overflow-hidden bg-surface-inner border border-border/60 transition-all duration-200 group-hover:border-primary/50 group-hover:shadow-md"
                            >
                                <img 
                                    src={game.logo || game.banner || game.coverUrl || game.iconUrl} 
                                    alt={game.name} 
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    onError={(e) => {
                                        (e.currentTarget as HTMLImageElement).src = "https://api.dicebear.com/7.x/identicon/svg?seed=" + encodeURIComponent(game.name);
                                    }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity" />
                                
                                {/* Info inside bottom of card */}
                                <div className="absolute bottom-0 left-0 right-0 p-2.5 flex flex-col gap-1">
                                    <h4 className="font-bold text-xs text-white truncate leading-tight">
                                        {game.name}
                                    </h4>
                                    <div className="flex items-center justify-between text-[10px] font-semibold text-text-faint">
                                        <span>{game.hours}h</span>
                                        {game.completion !== undefined && (
                                            <span className={game.completion === 100 ? "text-amber-400" : "text-primary"}>
                                                {game.completion}%
                                            </span>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Mastered star */}
                                {(game.completion === 100 || (game.rank || "").toLowerCase().includes("master")) && (
                                    <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-surface/80 backdrop-blur-xs flex items-center justify-center shadow-xs">
                                        <FontAwesomeIcon icon={faStar} className="text-amber-400 text-[9px]" />
                                    </div>
                                )}
                            </div>

                            {/* Delete button if own profile */}
                            {isOwnProfile && onDeleteGame && game.id !== undefined && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (game.id !== undefined) onDeleteGame(game.id);
                                    }}
                                    title="Xóa game khỏi thư viện"
                                    className="self-end text-text-faint hover:text-rose-500 text-[10px] transition-colors p-1 cursor-pointer"
                                >
                                    <FontAwesomeIcon icon={faTrash} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Add Game Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                    <div className="w-full max-w-md bg-surface border border-border rounded-[14px] p-5 shadow-2xl flex flex-col gap-4 text-left animate-fade-in">
                        <div className="flex items-center justify-between pb-2 border-b border-border/60">
                            <h4 className="text-sm font-bold text-text flex items-center gap-2">
                                <FontAwesomeIcon icon={faGamepad} className="text-primary text-xs" />
                                <span>{t("profile.addGameTitle", { defaultValue: "Thêm game vào thư viện" })}</span>
                            </h4>
                            <button
                                type="button"
                                onClick={handleCloseAddModal}
                                className="p-1 text-text-muted hover:text-text rounded-md transition-colors cursor-pointer"
                            >
                                <FontAwesomeIcon icon={faXmark} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitAddGame} className="flex flex-col gap-3">
                            {formError && (
                                <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-400 text-xs font-medium border border-rose-500/20">
                                    {formError}
                                </div>
                            )}

                            <div className="flex flex-col gap-1">
                                <label className="text-[11px] font-semibold text-text-muted">
                                    {t("profile.gameNameLabel", { defaultValue: "Tên trò chơi" })} <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Ví dụ: Counter-Strike 2, Elden Ring..."
                                    className="w-full bg-surface-inner border border-border/60 rounded-[8px] px-3 py-2 text-xs text-text placeholder-text-faint focus:outline-none focus:ring-1 focus:ring-primary"
                                    autoFocus
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-semibold text-text-muted">
                                        {t("profile.hoursPlayedLabel", { defaultValue: "Số giờ đã chơi" })}
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={hours}
                                        onChange={(e) => setHours(e.target.value === "" ? "" : Math.max(0, Number(e.target.value)))}
                                        placeholder="0"
                                        className="w-full bg-surface-inner border border-border/60 rounded-[8px] px-3 py-2 text-xs text-text placeholder-text-faint focus:outline-none focus:ring-1 focus:ring-primary"
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-semibold text-text-muted">
                                        {t("profile.rankLabel", { defaultValue: "Xếp hạng / Trạng thái" })}
                                    </label>
                                    <input
                                        type="text"
                                        value={rank}
                                        onChange={(e) => setRank(e.target.value)}
                                        placeholder="Mastered, Playing..."
                                        className="w-full bg-surface-inner border border-border/60 rounded-[8px] px-3 py-2 text-xs text-text placeholder-text-faint focus:outline-none focus:ring-1 focus:ring-primary"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-[11px] font-semibold text-text-muted">
                                    {t("profile.logoUrlLabel", { defaultValue: "URL ảnh bìa / Logo (Tùy chọn)" })}
                                </label>
                                <input
                                    type="url"
                                    value={logo}
                                    onChange={(e) => setLogo(e.target.value)}
                                    placeholder="https://..."
                                    className="w-full bg-surface-inner border border-border/60 rounded-[8px] px-3 py-2 text-xs text-text placeholder-text-faint focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60 mt-1">
                                <button
                                    type="button"
                                    onClick={handleCloseAddModal}
                                    className="px-3.5 py-1.5 rounded-[8px] text-xs font-semibold text-text-muted hover:text-text hover:bg-surface-hover transition-colors cursor-pointer"
                                >
                                    {t("common.cancel", { defaultValue: "Hủy" })}
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !name.trim()}
                                    className="px-4 py-1.5 rounded-[8px] bg-primary hover:bg-primary-hover disabled:opacity-50 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                                >
                                    {isSubmitting && <FontAwesomeIcon icon={faSpinner} className="animate-spin text-xs" />}
                                    <span>{t("common.save", { defaultValue: "Lưu" })}</span>
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
