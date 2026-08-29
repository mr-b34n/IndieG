import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faFire, faStar as faStarSolid, faTrophy, faCrown, faGamepad } from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";
import type { LibraryGame } from "../../types";
import type { TranslateFn } from "@/shared/hooks/useTranslate";

interface GamesTabProps {
    games: LibraryGame[];
    t?: TranslateFn;
}

export const GamesTab = ({ games = [] }: GamesTabProps) => {
    const safeGames = games || [];
    const [selectedGameName, setSelectedGameName] = useState<string>(safeGames.find((g) => g?.isFeatured)?.name || safeGames[0]?.name || "");
    const featuredGame = safeGames.find((g) => g?.name === selectedGameName) || safeGames[0];
    const otherGames = safeGames;

    return (
        <div className="flex flex-col gap-5 w-full animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faCrown} className="text-[#E5A93D] text-sm" />
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#F0F1F2]">Game Mastery Library</h3>
                        <p className="text-xs text-[#9A9DA3]">Tương tác & thành tựu nổi bật trên các tựa game đã chơi</p>
                    </div>
                </div>
                <span className="text-xs font-semibold text-[#F0F1F2] px-3 py-1 rounded-[6px] bg-[#13161C]">
                    {games.length} Games Linked
                </span>
            </div>

            {/* Featured Hero Game Mastery */}
            {featuredGame ? (
                <div className="w-full bg-[#0A0C0E] rounded-[14px] p-5 sm:p-6 shadow-sm relative overflow-hidden flex flex-col gap-5">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#13161C] p-4 rounded-[10px]">
                        <div className="flex items-center gap-4">
                            <img
                                src={featuredGame.logo || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=120&auto=format&fit=crop&q=80"}
                                alt={featuredGame.name || "Game"}
                                className="w-16 h-16 sm:w-20 sm:h-20 rounded-[8px] object-cover shrink-0"
                            />
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-[#F0F1F2] text-lg sm:text-xl">{featuredGame.name || "Featured Game"}</h4>
                                    <span className="px-2 py-0.5 rounded-[4px] bg-[#1688E8]/15 text-[#1688E8] text-[10px] font-bold">
                                        PRIMARY MAIN
                                    </span>
                                </div>
                                <span className="text-xs font-medium text-[#9A9DA3]">
                                    {featuredGame.rank || "Unranked"} • Last played: {featuredGame.lastPlayed || "Recently"}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col items-start sm:items-end">
                            <span className="text-xl sm:text-2xl font-bold text-[#F0F1F2] tracking-tight flex items-center gap-1.5 font-mono">
                                <FontAwesomeIcon icon={faFire} className="text-[#E5A93D] text-base" />
                                {featuredGame.hours || 0}h
                            </span>
                            <span className="text-xs font-medium text-[#9A9DA3]">Rating: Premier {featuredGame.ratingScore || "18,500"}</span>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between text-xs font-medium text-[#F0F1F2]">
                            <span className="text-[#9A9DA3]">Mastery & Achievement Progress</span>
                            <span className="text-[#F0F1F2] font-mono text-xs">{featuredGame.achievements || 0} / {featuredGame.totalAchievements || 100} Unlocked</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#1A1E26] rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[#1688E8] rounded-full transition-all duration-300"
                                style={{ width: `${Math.round(((featuredGame.achievements || 0) / (featuredGame.totalAchievements || 1)) * 100)}%` }}
                            />
                        </div>
                    </div>

                    {/* Skills Rating & Badges */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                        {featuredGame.skills?.map((s) => (
                            <div key={s.name} className="flex items-center justify-between p-3 rounded-[8px] bg-[#13161C]">
                                <span className="font-medium text-[#F0F1F2] text-xs">{s.name} Skill</span>
                                <div className="flex items-center gap-0.5 text-[#E5A93D] text-xs">
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
                        <div className="flex items-center justify-center gap-2 p-3 rounded-[8px] bg-[#181C24] text-[#24C58A] font-semibold text-xs">
                            <FontAwesomeIcon icon={faTrophy} />
                            <span>🏆 Clutch God</span>
                        </div>
                    </div>
                </div>
            ) : null}

            {/* Other Games Grid - Clickable to switch featured */}
            <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#8A8F98]">
                    <FontAwesomeIcon icon={faGamepad} />
                    <span>Select Game to Inspect</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {otherGames.map((game) => {
                        const isSelected = game.name === featuredGame.name;
                        return (
                            <button
                                key={game.name}
                                type="button"
                                onClick={() => setSelectedGameName(game.name)}
                                className={`relative flex flex-col gap-3 p-4 rounded-[10px] text-left transition-all cursor-pointer ${
                                    isSelected
                                        ? "bg-[#192230] shadow-sm"
                                        : "bg-[#0A0C0E] hover:bg-[#13161C] text-[#9A9DA3]"
                                }`}
                            >
                                {isSelected && (
                                    <div className="absolute left-0 top-3 bottom-3 w-[3px] bg-[#1688E8] rounded-r-full" />
                                )}

                                <div className="flex items-center justify-between gap-3 pl-1">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <img 
                                            src={game.logo} 
                                            alt={game.name} 
                                            className="w-12 h-12 rounded-[6px] object-cover shrink-0" 
                                        />
                                        <div className="flex flex-col min-w-0">
                                            <h4 className="font-bold text-sm text-[#F0F1F2] truncate">
                                                {game.name}
                                            </h4>
                                            <span className="inline-block px-2 py-0.5 rounded-[4px] text-[10px] font-semibold w-fit mt-0.5 bg-[#13161C] text-[#9A9DA3]">
                                                {game.rank}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-sm font-bold font-mono text-[#F0F1F2] shrink-0">
                                        {game.hours}h
                                    </span>
                                </div>

                                <div className="flex items-center justify-between text-xs pt-2 bg-[#13161C] p-2 rounded-[6px] text-[#8A8F98]">
                                    <span className="flex items-center gap-1 font-medium text-[#9A9DA3]">
                                        <FontAwesomeIcon icon={faClock} className="text-[10px]" />
                                        {game.lastPlayed}
                                    </span>
                                    <span className="font-medium text-[#E5A93D]">
                                        {game.keyStat}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export { GamesTab as LibraryTab };
