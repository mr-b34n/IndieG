import { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlus,
    faSearch,
    faChevronDown,
    faFilter,
    faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "@/shared/hooks/useTranslate";
import { useAuthStore } from "@/features/auth";
import { useSquadStore } from "../store/useSquadStore";
import { GAME_FILTERS } from "../constants";
import { SquadCard } from "./SquadCard";
import { CreateSquadModal } from "./CreateSquadModal";
import { Pagination } from "@/shared/components/ui/Pagination";

export const SquadList = () => {
    const { t } = useTranslation();
    const user = useAuthStore((state) => state.user);
    const mockLogin = useAuthStore((state) => state.mockLogin);
    const isLoggedIn = !!user || mockLogin;

    const {
        squads,
        activeTab,
        filterGame,
        searchQuery,
        setActiveTab,
        setFilterGame,
        setSearchQuery,
    } = useSquadStore();

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [showMoreGames, setShowMoreGames] = useState(false);
    const [sortOrder, setSortOrder] = useState<"recommended" | "newest" | "active">("recommended");
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 6;

    // Visible 5-6 primary games, rest in "+ more" popover
    const PRIMARY_GAMES = ["all", "Counter Strike 2", "Valorant", "Minecraft", "Grand Theft Auto V", "Raft"];
    const MORE_GAMES = GAME_FILTERS.filter((g) => !PRIMARY_GAMES.includes(g));

    const mySquadsCount = squads.filter((sq) => sq.isMySquad).length;

    const filteredSquads = useMemo(() => {
        let result = squads.filter((squad) => {
            if (activeTab === "my-squads" && !squad.isMySquad) return false;
            if (filterGame !== "all" && squad.game !== filterGame) return false;
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const matchName = squad.name.toLowerCase().includes(q);
                const matchGame = squad.game.toLowerCase().includes(q);
                const matchDesc = squad.description.toLowerCase().includes(q);
                const matchTags = squad.tags.some((t) => t.toLowerCase().includes(q));
                if (!matchName && !matchGame && !matchDesc && !matchTags) return false;
            }
            return true;
        });

        if (sortOrder === "newest") {
            result = [...result].reverse();
        } else if (sortOrder === "active") {
            result = [...result].sort((a, b) => b.currentMembers - a.currentMembers);
        }

        return result;
    }, [squads, activeTab, filterGame, searchQuery, sortOrder]);

    const totalPages = Math.ceil(filteredSquads.length / ITEMS_PER_PAGE);
    const paginatedSquads = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredSquads.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredSquads, currentPage]);

    const handleTabSelect = (tab: "explore" | "my-squads") => {
        setActiveTab(tab);
        setCurrentPage(1);
    };

    const handleGameSelect = (game: string) => {
        setFilterGame(game);
        setShowMoreGames(false);
        setCurrentPage(1);
    };

    return (
        <div className="w-full flex flex-col gap-6 text-text animate-fade-in pb-12 select-none">
            {/* 1. FUNCTIONAL HERO (Clean, Editorial, Not a Marketing Banner) */}
            <div className="w-full bg-surface-inner/60 border border-divider-primary/60 rounded-[4px] p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative overflow-hidden">
                <div className="flex flex-col gap-1.5 max-w-2xl z-10">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary">
                        MY SQUAD
                    </span>
                    <h1 className="text-xl sm:text-2xl font-black text-text uppercase tracking-tight">
                        Find teammates and play together.
                    </h1>
                    <p className="text-xs text-text-muted leading-relaxed">
                        Connect with compatible gamers based on games, playstyle, and availability across your communities.
                    </p>
                </div>

                {isLoggedIn && (
                    <button
                        type="button"
                        onClick={() => setIsCreateOpen(true)}
                        className="px-4 py-2 rounded-[4px] bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer shrink-0"
                    >
                        <FontAwesomeIcon icon={faPlus} className="text-[10px]" />
                        <span>Create Squad</span>
                    </button>
                )}
            </div>

            {/* 2. TEXT TABS (EXPLORE SQUADS 9    MY SQUADS 4, Underline Active State) */}
            <div className="flex items-center gap-6 border-b border-divider-primary/60 pt-1">
                <button
                    type="button"
                    onClick={() => handleTabSelect("explore")}
                    className={`relative pb-2.5 text-xs font-bold transition-colors cursor-pointer tracking-wider uppercase flex items-center gap-2 ${
                        activeTab === "explore" ? "text-primary" : "text-text-muted hover:text-text"
                    }`}
                >
                    <span>EXPLORE SQUADS</span>
                    <span className="font-mono text-[11px] text-text-faint">
                        {squads.length}
                    </span>
                    {activeTab === "explore" && (
                        <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />
                    )}
                </button>

                {isLoggedIn && (
                    <button
                        type="button"
                        onClick={() => handleTabSelect("my-squads")}
                        className={`relative pb-2.5 text-xs font-bold transition-colors cursor-pointer tracking-wider uppercase flex items-center gap-2 ${
                            activeTab === "my-squads" ? "text-primary" : "text-text-muted hover:text-text"
                        }`}
                    >
                        <span>MY SQUADS</span>
                        {mySquadsCount > 0 && (
                            <span className="font-mono text-[11px] text-primary">
                                {mySquadsCount}
                            </span>
                        )}
                        {activeTab === "my-squads" && (
                            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />
                        )}
                    </button>
                )}
            </div>

            {/* 3. CONSOLIDATED FILTER & SEARCH ROW */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
                {/* Games Filter List + Popover */}
                <div className="flex items-center gap-1.5 flex-wrap">
                    {PRIMARY_GAMES.map((game) => {
                        const isSelected = filterGame === game;
                        const label = game === "all" ? "All games" : game;
                        return (
                            <button
                                key={game}
                                type="button"
                                onClick={() => handleGameSelect(game)}
                                className={`px-2.5 py-1 rounded-[4px] text-xs font-semibold transition-colors cursor-pointer ${
                                    isSelected
                                        ? "bg-primary/10 text-primary border border-primary/30 font-bold"
                                        : "bg-surface text-text-muted hover:text-text border border-divider-primary/60 hover:bg-surface-hover"
                                }`}
                            >
                                {label}
                            </button>
                        );
                    })}

                    {/* Popover for remaining games */}
                    {MORE_GAMES.length > 0 && (
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowMoreGames(!showMoreGames)}
                                className={`px-2.5 py-1 rounded-[4px] text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 border ${
                                    MORE_GAMES.includes(filterGame)
                                        ? "bg-primary/10 text-primary border-primary/30 font-bold"
                                        : "bg-surface text-text-muted hover:text-text border-divider-primary/60 hover:bg-surface-hover"
                                }`}
                            >
                                <span>{MORE_GAMES.includes(filterGame) ? filterGame : `+ ${MORE_GAMES.length} more`}</span>
                                <FontAwesomeIcon icon={faChevronDown} className="text-[9px]" />
                            </button>

                            {showMoreGames && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setShowMoreGames(false)}
                                    />
                                    <div className="absolute left-0 top-full mt-1.5 w-48 bg-surface border border-divider-primary rounded-[4px] shadow-2xl z-50 p-1 flex flex-col gap-0.5 max-h-56 overflow-y-auto">
                                        {MORE_GAMES.map((g) => (
                                            <button
                                                key={g}
                                                type="button"
                                                onClick={() => handleGameSelect(g)}
                                                className={`w-full text-left px-2.5 py-1.5 rounded-[3px] text-xs font-medium transition-colors cursor-pointer ${
                                                    filterGame === g
                                                        ? "bg-primary/10 text-primary font-bold"
                                                        : "text-text-muted hover:text-text hover:bg-surface-hover"
                                                }`}
                                            >
                                                {g}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Right: Search & Sorting */}
                <div className="flex items-center gap-3 self-end md:self-auto w-full md:w-auto">
                    {/* Sort Text Tabs */}
                    <div className="hidden sm:flex items-center gap-2 text-xs font-mono">
                        {(["recommended", "newest", "active"] as const).map((s) => (
                            <button
                                key={s}
                                type="button"
                                onClick={() => setSortOrder(s)}
                                className={`capitalize cursor-pointer transition-colors ${
                                    sortOrder === s ? "text-primary font-bold underline" : "text-text-faint hover:text-text"
                                }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>

                    {/* Search Input */}
                    <div className="relative flex-1 md:w-60">
                        <FontAwesomeIcon
                            icon={faSearch}
                            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-faint text-xs"
                        />
                        <input
                            type="text"
                            placeholder={t("squad.searchPlaceholder")}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-8 pl-8 pr-7 bg-surface hover:bg-surface-hover/60 focus:bg-surface border border-divider-primary/60 focus:border-primary rounded-[4px] text-xs font-semibold text-text placeholder:text-text-faint focus:outline-none transition-colors"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery("")}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-text-faint hover:text-text cursor-pointer"
                            >
                                <FontAwesomeIcon icon={faXmark} className="text-xs" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* 4. SQUAD LIST (Structured Rows, One Container per Semantic Level) */}
            {filteredSquads.length > 0 ? (
                <div className="flex flex-col divide-y divide-divider-primary/50 border-t border-divider-primary/60 mt-1">
                    {paginatedSquads.map((squad) => (
                        <SquadCard key={squad.id} squad={squad} />
                    ))}

                    <div className="pt-4">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            totalItems={filteredSquads.length}
                            itemsPerPage={ITEMS_PER_PAGE}
                        />
                    </div>
                </div>
            ) : (
                <div className="w-full py-16 flex flex-col items-center justify-center text-center gap-3 border-t border-divider-primary/60">
                    <div className="w-12 h-12 rounded-[4px] bg-surface-inner text-text-faint flex items-center justify-center text-xl">
                        <FontAwesomeIcon icon={faFilter} />
                    </div>
                    <div className="max-w-md">
                        <h3 className="text-sm font-bold text-text">{t("squad.emptyTitle")}</h3>
                        <p className="text-xs text-text-muted mt-1 leading-relaxed">
                            {t("squad.emptyDesc")}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsCreateOpen(true)}
                        className="mt-2 px-4 py-2 rounded-[4px] bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                        <FontAwesomeIcon icon={faPlus} className="text-[10px]" />
                        <span>{t("squad.createNow")}</span>
                    </button>
                </div>
            )}

            <CreateSquadModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
        </div>
    );
};
