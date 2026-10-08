import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faGamepad,
    faPlus,
    faTrash,
    faSpinner,
    faXmark,
    faClock,
    faMedal,
    faSortDown,
    faChevronRight,
    faStar,
} from "@fortawesome/free-solid-svg-icons";
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

const DEFAULT_GAMES: any[] = [
    {
        id: "1",
        name: "Elden Ring",
        logo: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1245620/capsule_616x353.jpg",
        banner: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1245620/library_hero.jpg",
        completion: 100,
        achievements: { current: 42, total: 42 },
        difficulty: "Very Hard",
        isFeatured: true,
        hours: 342,
    },
    {
        id: "2",
        name: "Sekiro: Shadows Die Twice",
        logo: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/814380/capsule_616x353.jpg",
        banner: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/814380/library_hero.jpg",
        completion: 100,
        hours: 120,
    },
    {
        id: "3",
        name: "Dark Souls III",
        logo: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/374320/capsule_616x353.jpg",
        banner: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/374320/library_hero.jpg",
        completion: 100,
        hours: 155,
    },
    {
        id: "4",
        name: "Ghost of Tsushima",
        logo: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2215430/capsule_616x353.jpg",
        banner: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2215430/library_hero.jpg",
        completion: 100,
        hours: 80,
    },
    {
        id: "5",
        name: "Cyberpunk 2077",
        logo: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1091500/capsule_616x353.jpg",
        banner: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1091500/library_hero.jpg",
        completion: 95,
        hours: 140,
    },
    {
        id: "6",
        name: "Hades",
        logo: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1145360/capsule_616x353.jpg",
        banner: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1145360/library_hero.jpg",
        completion: 90,
        hours: 95,
    },
    {
        id: "7",
        name: "Hollow Knight",
        logo: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/367520/capsule_616x353.jpg",
        banner: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/367520/library_hero.jpg",
        completion: 85,
        hours: 60,
    },
    {
        id: "8",
        name: "Returnal",
        logo: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1649240/capsule_616x353.jpg",
        banner: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1649240/library_hero.jpg",
        completion: 80,
        hours: 45,
    }
];

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
    const displayGames = games && games.length > 0 ? games : DEFAULT_GAMES;

    const featuredGame = displayGames.find((g) => g.isFeatured) || displayGames[0];
    const otherGames = displayGames.filter(g => g.id !== featuredGame.id);
    
    const fGame = {
        ...featuredGame,
        completion: featuredGame.completion ?? 100,
        difficulty: featuredGame.difficulty ?? "Very Hard",
        achievements: featuredGame.achievements ?? { current: 42, total: 42 },
        banner: featuredGame.banner ?? featuredGame.logo,
        hours: featuredGame.hours ?? 100,
    };

    if (isLoading) {
        return (
            <div className="w-full bg-[#090b0f] rounded-[16px] p-16 text-center flex flex-col items-center justify-center gap-4">
                <FontAwesomeIcon icon={faSpinner} className="animate-spin text-3xl text-[#0066FF]" />
                <p className="text-sm font-medium text-[#8B949E]">Loading Library...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 w-full animate-fade-in bg-[#090b0f] text-[#E6EED6] font-sans p-2 sm:p-6 rounded-[16px] shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between pb-2">
                <div className="flex flex-col">
                    <h3 className="text-xl font-black tracking-tight text-white uppercase">
                        LIBRARY
                    </h3>
                    <p className="text-xs text-[#8B949E] font-medium">Showcasing top achievements</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                        <span className="text-xl font-black text-white leading-none">12</span>
                        <span className="text-[10px] font-bold text-[#FFC107] uppercase tracking-wider">Mastered</span>
                    </div>
                    <div className="h-8 w-px bg-[#1e2329]" />
                    <button className="flex items-center gap-2 text-sm font-semibold text-[#8B949E] hover:text-white px-4 py-2 rounded-[8px] bg-[#161b22] hover:bg-[#1e2329] cursor-pointer transition-all duration-200">
                        Sort by: Completion % <FontAwesomeIcon icon={faSortDown} className="-mt-1" />
                    </button>
                </div>
            </div>

            {/* Featured Hero */}
            <div className="w-full rounded-[20px] overflow-hidden relative shadow-[0_10px_30px_rgba(0,0,0,0.5)] group min-h-[340px] flex transition-colors duration-300">
                <div className="absolute inset-0 z-0">
                    <img 
                        src={fGame.banner} 
                        alt="Banner" 
                        className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-[1.5s] ease-out opacity-40 mix-blend-screen" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#090b0f] via-[#090b0f]/90 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#090b0f] via-transparent to-transparent opacity-90" />
                </div>
                
                <div className="relative z-10 p-8 flex flex-col md:flex-row items-start md:items-end justify-between gap-8 w-full">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
                        <div className="relative shrink-0">
                            <img
                                src={fGame.logo}
                                alt={fGame.name}
                                className="w-32 h-32 md:w-44 md:h-44 rounded-[16px] object-cover shadow-[0_10px_25px_rgba(0,0,0,0.8)] border border-white/5"
                            />
                            <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-[#090b0f] rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                                <FontAwesomeIcon icon={faStar} className="text-[#FFC107] text-xl drop-shadow-[0_0_8px_rgba(255,193,7,0.8)]" />
                            </div>
                        </div>
                        
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                                <h4 className="font-black text-white text-3xl md:text-4xl tracking-tight drop-shadow-md">{fGame.name}</h4>
                                <span className="px-2.5 py-1 rounded-[6px] bg-[#FFC107]/10 text-[#FFC107] text-[10px] font-black tracking-widest uppercase shadow-[0_0_15px_rgba(255,193,7,0.15)] backdrop-blur-md">
                                    MASTERED
                                </span>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-[#8B949E]">
                                <div className="flex items-center gap-2 bg-[#161b22]/80 backdrop-blur-md px-3 py-1.5 rounded-[8px]">
                                    <FontAwesomeIcon icon={faClock} className="text-[#0066FF]" />
                                    <span className="text-white">{fGame.hours} Hours</span>
                                </div>
                                <div className="flex items-center gap-2 bg-[#161b22]/80 backdrop-blur-md px-3 py-1.5 rounded-[8px]">
                                    <span className="text-[#8B949E]">Difficulty:</span>
                                    <span className="text-[#ef4444] drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]">{fGame.difficulty}</span>
                                </div>
                            </div>

                            <div className="mt-4 flex flex-col gap-2 w-full max-w-sm bg-[#161b22]/80 backdrop-blur-md p-4 rounded-[12px]">
                                <div className="flex justify-between text-xs font-bold text-[#8B949E]">
                                    <span className="uppercase tracking-wider">Achievements Progress</span>
                                    <span className="text-[#FFC107]">{fGame.achievements.current} / {fGame.achievements.total}</span>
                                </div>
                                <div className="h-2 w-full bg-[#090b0f] rounded-full overflow-hidden inset-shadow-sm">
                                    <div className="h-full bg-gradient-to-r from-[#FFC107] to-[#FF9800] rounded-full shadow-[0_0_10px_rgba(255,193,7,0.6)] relative">
                                        <div className="absolute inset-0 bg-white/20" />
                                    </div>
                                </div>
                                <div className="flex justify-end text-[10px] font-black text-[#FFC107] mt-0.5">
                                    {fGame.completion}% COMPLETED
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="shrink-0 self-start md:self-end">
                        <button className="group flex items-center gap-2 px-6 py-3 rounded-[10px] bg-white text-black hover:bg-[#e0e0e0] font-bold transition-all duration-300 shadow-[0_5px_15px_rgba(255,255,255,0.15)] cursor-pointer active:scale-95">
                            <span>View All Trophies</span>
                            <FontAwesomeIcon icon={faChevronRight} className="text-xs group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Game Collection Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 mt-4">
                {otherGames.map((game) => (
                    <div
                        key={game.id}
                        className="group flex flex-col gap-3 cursor-pointer relative"
                    >
                        <div className="relative aspect-[2/3] w-full rounded-[14px] overflow-hidden bg-[#161b22] transition-all duration-300 group-hover:shadow-[0_8px_25px_rgba(0,0,0,0.6)] group-hover:-translate-y-1">
                            <img 
                                src={game.logo || game.banner || game.coverUrl || game.iconUrl} 
                                alt={game.name} 
                                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                onError={(e) => {
                                    const fallback = game.banner || game.coverUrl;
                                    if (fallback && e.currentTarget.src !== fallback) {
                                        e.currentTarget.src = fallback;
                                    }
                                }}
                            />
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
                            
                            {/* Hover Action */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white scale-75 group-hover:scale-100 transition-transform duration-300 ease-out">
                                    <FontAwesomeIcon icon={faPlus} className="text-lg" />
                                </div>
                            </div>

                            {/* Info at bottom of card */}
                            <div className="absolute bottom-0 left-0 right-0 p-3 flex flex-col gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                <h4 className="font-bold text-sm text-white truncate drop-shadow-md leading-tight">
                                    {game.name}
                                </h4>
                                <div className="flex items-center justify-between text-[11px] font-semibold text-[#8B949E]">
                                    <span>{game.hours}h</span>
                                    <span className={game.completion === 100 ? "text-[#FFC107]" : "text-[#0066FF]"}>
                                        {game.completion}%
                                    </span>
                                </div>
                                <div className="h-1 w-full bg-black/50 rounded-full overflow-hidden mt-0.5">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-1000 ease-out w-0 group-hover:w-full ${
                                            game.completion === 100 
                                            ? 'bg-gradient-to-r from-[#FFC107] to-[#FF9800] shadow-[0_0_5px_rgba(255,193,7,0.5)]' 
                                            : 'bg-gradient-to-r from-[#0066FF] to-[#00A3FF]'
                                        }`}
                                        style={{ width: `${game.completion}%` }}
                                    />
                                </div>
                            </div>
                            
                            {/* Top Badge for Mastered */}
                            {game.completion === 100 && (
                                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#090b0f]/80 backdrop-blur-sm flex items-center justify-center shadow-lg">
                                    <FontAwesomeIcon icon={faStar} className="text-[#FFC107] text-[10px]" />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export { GamesTab as LibraryTab };
