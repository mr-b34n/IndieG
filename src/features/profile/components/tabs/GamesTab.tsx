import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar as faStarSolid, faCrown, faGamepad } from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";
import type { LibraryGame } from "../../types";
import { useTranslation, type TranslateFn } from "@/shared/hooks/useTranslate";

interface GamesTabProps {
    games: LibraryGame[];
    t?: TranslateFn;
}

export const GamesTab = ({ games = [], t: propT }: GamesTabProps) => {
    const { t: hookT } = useTranslation();
    const t = propT || hookT;
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
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#F0F1F2]">Game Mastery Library</h3>
                </div>
                <span className="text-xs font-semibold text-[#8A8F98] px-3 py-1 rounded-[6px] bg-[#13161C]">
                    {games.length} Games
                </span>
            </div>

            {safeGames.length === 0 ? (
                <div className="w-full bg-[#0A0C0E] rounded-[14px] p-10 text-center flex flex-col items-center justify-center gap-3 shadow-sm">
                    <div className="w-12 h-12 rounded-full bg-[#13161C] flex items-center justify-center text-[#5F697C] text-xl">
                        <FontAwesomeIcon icon={faGamepad} />
                    </div>
                    <h4 className="text-sm font-bold text-[#F0F1F2]">{t("profile.empty.gamesTitle")}</h4>
                    <p className="text-xs text-[#8D97AA] max-w-sm">{t("profile.empty.gamesDesc")}</p>
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
                                            {featuredGame.hours} Hours · {featuredGame.ratingScore || "Top Tier"}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className="px-2.5 py-1 rounded-[6px] bg-[#181C24] text-[#24C58A] text-xs font-bold">
                                        {featuredGame.keyStat || "68.4% Winrate"}
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
                            return (
                                <button
                                    key={game.name}
                                    type="button"
                                    onClick={() => setSelectedGameName(game.name)}
                                    className={`relative flex items-center justify-between p-3.5 rounded-[10px] text-left transition-all cursor-pointer ${
                                        isSelected
                                            ? "bg-[#192230] shadow-sm ring-1 ring-[#1688E8]/50"
                                            : "bg-[#0A0C0E] hover:bg-[#13161C] text-[#9A9DA3]"
                                    }`}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <img 
                                            src={game.logo} 
                                            alt={game.name} 
                                            className="w-11 h-11 rounded-[6px] object-cover shrink-0" 
                                        />
                                        <div className="flex flex-col min-w-0">
                                            <h4 className="font-bold text-xs sm:text-sm text-[#F0F1F2] truncate">
                                                {game.name}
                                            </h4>
                                            <span className="text-[11px] text-[#8A8F98]">
                                                {game.rank}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold font-mono text-[#F0F1F2] shrink-0 pl-2">
                                        {game.hours}h
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
};

export { GamesTab as LibraryTab };
