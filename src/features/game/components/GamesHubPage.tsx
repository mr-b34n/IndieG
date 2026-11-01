import React, { useMemo } from "react";
import { useTranslation } from "@/shared/hooks/useTranslate";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { useGameStore } from "../store/useGameStore";
import { INITIAL_GAMES } from "../constants";
import { useGamesQuery } from "@/shared/api/useQueries";
import { mapGameDtoToGameData } from "@/shared/api/types";
import { type GameData } from "../types";
import { GameCard } from "./GameCard";

export const GamesHubPage: React.FC = () => {
    const { t } = useTranslation();

    // Set page document title
    useDocumentTitle(t("game.hubTitle", { defaultValue: "Trò chơi" }));

    const storeGames = useGameStore((state) => state.games);

    // Fetch live games from API
    const { data: apiGamesData } = useGamesQuery({ limit: 50 });

    // Merged games list with rich fallback coverage
    const allGames: GameData[] = useMemo(() => {
        const remoteList = Array.isArray(apiGamesData)
            ? apiGamesData
            : (apiGamesData as { items?: unknown[] })?.items || [];

        if (remoteList.length > 0) {
            const mapped = remoteList.map((item) => mapGameDtoToGameData(item));
            const map = new Map<string, GameData>();
            INITIAL_GAMES.forEach((g) => map.set(g.slug.toLowerCase(), g));
            mapped.forEach((g) => {
                const existing = map.get(g.slug.toLowerCase());
                map.set(g.slug.toLowerCase(), { ...existing, ...g });
            });
            return Array.from(map.values());
        }

        if (storeGames && storeGames.length > 0) return storeGames;
        return INITIAL_GAMES;
    }, [apiGamesData, storeGames]);

    return (
        <div className="w-full pb-16 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {allGames.map((game) => (
                    <GameCard key={game.slug} game={game} />
                ))}
            </div>
        </div>
    );
};
