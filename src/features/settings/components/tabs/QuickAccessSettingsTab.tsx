import { useState, useMemo } from 'react';
import {
    CheckCircle2,
    ArrowLeft,
    ArrowRight,
    Trash2,
    Plus,
    Search,
    Pin,
} from 'lucide-react';
import { useGameStore } from '@/features/game';
import { useGamesQuery } from '@/shared/api/useQueries';
import { mapGameDtoToGameData } from '@/shared/api/types';
import { type GameData } from '@/features/game/types';
import { useTranslation } from '@/shared/hooks/useTranslate';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/utils/cn';

interface QuickAccessSettingsTabProps {
    tempSelectedSlugs: string[];
    saveQuickAccessSuccess: boolean;
    onSaveQuickAccess: () => void;
    onMoveGame: (slug: string, direction: "up" | "down") => void;
    onToggleSelectSlug: (slug: string) => void;
    onRemoveSlug: (slug: string) => void;
}

const MAX_SLOTS = 4;

export function QuickAccessSettingsTab({
    tempSelectedSlugs,
    saveQuickAccessSuccess,
    onSaveQuickAccess,
    onMoveGame,
    onToggleSelectSlug,
    onRemoveSlug,
}: QuickAccessSettingsTabProps) {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');

    const storeGames = useGameStore((state) => state.games);
    const { data: apiGamesData } = useGamesQuery({ limit: 50 });

    const allGames: GameData[] = useMemo(() => {
        const remoteList = Array.isArray(apiGamesData)
            ? apiGamesData
            : (apiGamesData as { items?: unknown[] })?.items || [];
        if (remoteList.length > 0) {
            return remoteList.map((g) => mapGameDtoToGameData(g));
        }
        if (storeGames && storeGames.length > 0) return storeGames;
        return [];
    }, [apiGamesData, storeGames]);

    const filteredGames = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return allGames;
        return allGames.filter(
            (g) =>
                g.name.toLowerCase().includes(query) ||
                g.slug.toLowerCase().includes(query) ||
                g.tag?.toLowerCase().includes(query)
        );
    }, [allGames, searchQuery]);

    const slots = Array.from({ length: MAX_SLOTS }, (_, index) => {
        const slug = tempSelectedSlugs[index];
        const game = slug ? allGames.find((g) => g.slug === slug) : null;
        return { index, slug, game };
    });

    const isFull = tempSelectedSlugs.length >= MAX_SLOTS;

    return (
        <div className="space-y-8 animate-tab-enter">
            {/* Success Banner */}
            {saveQuickAccessSuccess && (
                <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-2xl text-xs font-bold flex items-center gap-2.5 animate-fade-in shadow-xs">
                    <CheckCircle2 className="size-4.5 shrink-0" />
                    <span>{t('settings.quickAccess.saveSuccess', { defaultValue: 'Đã cập nhật lối tắt thành công!' })}</span>
                </div>
            )}

            {/* 4 Pinned Slots Visual Bar */}
            <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Pin className="size-4 text-primary" />
                        <h3 className="text-xs font-extrabold text-text uppercase tracking-wider">
                            {t('settings.quickAccess.pinnedList', { defaultValue: 'Vị trí ghim lối tắt' })}
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-primary/20 text-primary">
                            {tempSelectedSlugs.length} / {MAX_SLOTS}
                        </span>
                    </div>

                    <Button
                        size="sm"
                        onClick={onSaveQuickAccess}
                        className="bg-primary hover:bg-primary-hover text-white font-bold shadow-md shadow-primary/25"
                    >
                        {t('common.saveChanges', { defaultValue: 'Lưu thay đổi' })}
                    </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    {slots.map(({ index, slug, game }) => {
                        if (game && slug) {
                            return (
                                <div
                                    key={slug}
                                    className="p-3.5 rounded-2xl bg-surface-inner flex flex-col justify-between gap-3 shadow-sm hover:shadow-md transition-shadow relative select-none"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="size-6 rounded-lg bg-primary text-white font-black text-xs flex items-center justify-center shadow-xs">
                                            #{index + 1}
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                type="button"
                                                disabled={index === 0}
                                                onClick={() => onMoveGame(slug, "up")}
                                                title={t('settings.quickAccess.moveLeft', { defaultValue: 'Di chuyển sang trái' })}
                                                className="size-7 rounded-lg bg-surface hover:bg-surface-hover disabled:opacity-20 cursor-pointer flex items-center justify-center text-text-muted hover:text-text transition-colors shadow-xs"
                                            >
                                                <ArrowLeft className="size-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                disabled={index === tempSelectedSlugs.length - 1}
                                                onClick={() => onMoveGame(slug, "down")}
                                                title={t('settings.quickAccess.moveRight', { defaultValue: 'Di chuyển sang phải' })}
                                                className="size-7 rounded-lg bg-surface hover:bg-surface-hover disabled:opacity-20 cursor-pointer flex items-center justify-center text-text-muted hover:text-text transition-colors shadow-xs"
                                            >
                                                <ArrowRight className="size-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => onRemoveSlug(slug)}
                                                title={t('settings.quickAccess.removeShortcut', { defaultValue: 'Gỡ khỏi lối tắt' })}
                                                className="size-7 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white transition-colors cursor-pointer flex items-center justify-center shadow-xs"
                                            >
                                                <Trash2 className="size-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 min-w-0 pt-1">
                                        <img
                                            src={game.logoUrl || game.bannerUrl}
                                            alt={game.name}
                                            className="size-11 rounded-xl object-cover shrink-0 shadow-xs"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <div className="text-xs font-bold text-text truncate">
                                                {game.name}
                                            </div>
                                            <div className="text-[11px] text-text-muted truncate mt-0.5">
                                                {game.tag || game.developer || 'Game'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div
                                key={`empty-${index}`}
                                className="p-3.5 rounded-2xl bg-surface-inner/40 flex flex-col items-center justify-center text-center gap-1.5 min-h-[110px] text-text-muted select-none"
                            >
                                <span className="text-xs font-bold text-text-faint">
                                    {t('settings.quickAccess.slotNumber', { slot: index + 1, defaultValue: `Vị trí #${index + 1}` })}
                                </span>
                                <span className="text-[11px] text-text-faint/70">
                                    {isFull
                                        ? t('settings.quickAccess.fullSlot', { defaultValue: 'Đã hết chỗ' })
                                        : t('settings.quickAccess.chooseGameBelow', { defaultValue: 'Chọn game bên dưới' })}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Game Selection & Search Area */}
            <div className="space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h3 className="text-xs font-extrabold text-text uppercase tracking-wider">
                            {t('settings.quickAccess.gameLibraryTitle', { defaultValue: 'Kho Game của bạn' })}
                        </h3>
                        <p className="text-xs text-text-muted mt-0.5">
                            {t('settings.quickAccess.gameLibraryDesc', { defaultValue: 'Tìm kiếm và chọn game để thêm hoặc gỡ khỏi thanh ghim.' })}
                        </p>
                    </div>

                    <div className="relative w-full sm:w-64">
                        <Search className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t('settings.quickAccess.searchPlaceholder', { defaultValue: 'Tìm kiếm game...' })}
                            className="w-full bg-surface-inner rounded-xl pl-9 pr-3.5 py-2 text-xs text-text placeholder:text-text-faint focus:outline-none focus:ring-1 focus:ring-primary shadow-xs transition-colors"
                        />
                    </div>
                </div>

                {filteredGames.length === 0 ? (
                    <div className="p-10 text-center rounded-2xl bg-surface-inner/40 text-text-muted text-xs">
                        {t('settings.quickAccess.noGamesFound', {
                            query: searchQuery,
                            defaultValue: `Không tìm thấy tựa game nào phù hợp với từ khóa "${searchQuery}".`,
                        })}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                        {filteredGames.map((game) => {
                            const isPinned = tempSelectedSlugs.includes(game.slug);

                            return (
                                <div
                                    key={game.id || game.slug}
                                    className={cn(
                                        "p-3 rounded-2xl transition-all duration-150 flex items-center justify-between gap-3",
                                        isPinned
                                            ? "bg-primary/[0.08] ring-1 ring-primary/30"
                                            : "bg-surface-inner/80 hover:bg-surface-hover shadow-xs"
                                    )}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <img
                                            src={game.logoUrl || game.bannerUrl}
                                            alt={game.name}
                                            className="size-10 rounded-xl object-cover shrink-0 shadow-xs"
                                        />
                                        <div className="min-w-0">
                                            <div className="text-xs font-bold text-text truncate">
                                                {game.name}
                                            </div>
                                            <div className="text-[11px] text-text-muted truncate mt-0.5">
                                                {game.tag || game.developer || 'Game'}
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        size="xs"
                                        variant={isPinned ? "default" : "secondary"}
                                        disabled={!isPinned && isFull}
                                        onClick={() => onToggleSelectSlug(game.slug)}
                                        className={cn(
                                            "shrink-0 font-bold",
                                            isPinned
                                                ? "bg-primary text-white shadow-xs"
                                                : "bg-surface hover:bg-surface-hover text-text"
                                        )}
                                    >
                                        {isPinned ? (
                                            <>
                                                <CheckCircle2 className="size-3" />
                                                <span>{t('settings.quickAccess.pinned', { defaultValue: 'Đã ghim' })}</span>
                                            </>
                                        ) : (
                                            <>
                                                <Plus className="size-3" />
                                                <span>
                                                    {isFull
                                                        ? t('settings.quickAccess.full', { defaultValue: 'Đầy' })
                                                        : t('settings.quickAccess.pin', { defaultValue: 'Ghim' })}
                                                </span>
                                            </>
                                        )}
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
