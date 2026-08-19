import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faFire, faStar as faStarSolid, faTrophy, faCrown } from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";
import type { LibraryGame } from "../../types";
import type { TranslateFn } from "@/shared/hooks/useTranslate";

interface GamesTabProps {
    games: LibraryGame[];
    t?: TranslateFn;
}

export const GamesTab = ({ games }: GamesTabProps) => {
    const featuredGame = games.find((g) => g.isFeatured) || games[0];
    const otherGames = games.filter((g) => g.name !== featuredGame.name);

    return (
        <div className="flex flex-col gap-5 w-full animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#1A2032] pb-3">
                <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faCrown} className="text-[#F5B83D] text-lg" />
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-text">Game Mastery Library</h3>
                        <p className="text-xs text-text-faint font-semibold">Tương tác & thành tựu nổi bật trên các tựa game đã chơi</p>
                    </div>
                </div>
                <span className="text-xs font-black text-[#1687FF] px-3 py-1 rounded-full bg-[#151A29]">
                    {games.length} Games Linked
                </span>
            </div>

            {/* Featured Hero Game Mastery - Level 1 Surface #101421 (NO BORDER) */}
            <div className="w-full bg-[#101421] rounded-2xl p-6 shadow-sm relative overflow-hidden flex flex-col gap-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1A2032] pb-4 bg-[#151A29] p-4 rounded-xl">
                    <div className="flex items-center gap-4">
                        <img
                            src={featuredGame.logo}
                            alt={featuredGame.name}
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shadow-lg shrink-0"
                        />
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <h4 className="font-black text-text text-xl">{featuredGame.name}</h4>
                                <span className="px-2.5 py-0.5 rounded-full bg-[#20C997]/15 text-[#20C997] text-xs font-black">
                                    PRIMARY MAIN
                                </span>
                            </div>
                            <span className="text-xs font-bold text-text-faint">
                                {featuredGame.rank} • Last played: {featuredGame.lastPlayed}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col items-start sm:items-end">
                        <span className="text-2xl font-black text-[#20C997] tracking-tight flex items-center gap-1.5">
                            <FontAwesomeIcon icon={faFire} className="text-lg" />
                            {featuredGame.hours} HOURS
                        </span>
                        <span className="text-xs font-bold text-[#F5B83D]">Rating: Premier {featuredGame.ratingScore || "18,500"}</span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs font-bold text-text">
                        <span className="text-text-muted">Mastery & Achievement Progress</span>
                        <span className="text-[#F5B83D] font-extrabold">{featuredGame.achievements} / {featuredGame.totalAchievements} Unlocked</span>
                    </div>
                    <div className="h-2 w-full bg-[#151A29] rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-[#1687FF] via-[#22D3EE] to-[#20C997] rounded-full transition-all duration-500"
                            style={{ width: `${Math.round((featuredGame.achievements / featuredGame.totalAchievements) * 100)}%` }}
                        />
                    </div>
                </div>

                {/* Skills Rating & Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                    {featuredGame.skills?.map((s) => (
                        <div key={s.name} className="flex items-center justify-between p-3 rounded-xl bg-[#151A29]">
                            <span className="font-bold text-text text-xs">{s.name} Skill</span>
                            <div className="flex items-center gap-0.5 text-[#F5B83D] text-xs">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <FontAwesomeIcon
                                        key={star}
                                        icon={star <= s.stars ? faStarSolid : faStarRegular}
                                        className={star <= s.stars ? "text-[#F5B83D]" : "text-text-faint/30"}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                    <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#20C997]/10 text-[#20C997] font-extrabold text-xs">
                        <FontAwesomeIcon icon={faTrophy} />
                        <span>🏆 Clutch God</span>
                    </div>
                </div>
            </div>

            {/* Other Games Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {otherGames.map((game) => (
                    <div
                        key={game.name}
                        className="flex flex-col gap-3 p-4 rounded-2xl bg-[#101421] hover:bg-[#151A29] transition-all shadow-sm"
                    >
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                                <img 
                                    src={game.logo} 
                                    alt={game.name} 
                                    className="w-12 h-12 rounded-xl object-cover shrink-0" 
                                />
                                <div className="flex flex-col min-w-0">
                                    <h4 className="font-black text-text text-sm truncate">{game.name}</h4>
                                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black w-fit mt-0.5 ${game.tagColor}`}>
                                        {game.rank}
                                    </span>
                                </div>
                            </div>
                            <span className="text-sm font-black text-[#1687FF] shrink-0">{game.hours}h</span>
                        </div>

                        <div className="flex items-center justify-between text-xs text-text-faint border-t border-[#1A2032] pt-2.5">
                            <span className="flex items-center gap-1 font-semibold">
                                <FontAwesomeIcon icon={faClock} className="text-[10px]" />
                                {game.lastPlayed}
                            </span>
                            <span className="font-bold text-[#F5B83D]">
                                {game.keyStat}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export { GamesTab as LibraryTab };
