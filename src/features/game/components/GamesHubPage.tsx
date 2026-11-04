import React, { useMemo } from "react";
import { useTranslation } from "@/shared/hooks/useTranslate";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { useGameStore } from "../store/useGameStore";
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
    const { data: apiGamesData, isLoading } = useGamesQuery({ limit: 50 });

    const allGames: GameData[] = useMemo(() => {
        const remoteList = Array.isArray(apiGamesData)
            ? apiGamesData
            : (apiGamesData as { items?: unknown[] })?.items || [];

        if (remoteList.length > 0) {
            return remoteList.map((item) => mapGameDtoToGameData(item));
        }

        if (storeGames && storeGames.length > 0) return storeGames;
        return [];
    }, [apiGamesData, storeGames]);

    return (
        <div className="w-full pb-16 animate-fade-in">
            {allGames.length === 0 && !isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <p className="text-sm font-medium text-text">
                        {t("game.noGamesFound", { defaultValue: "Chưa có trò chơi nào" })}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                    {allGames.map((game) => (
                        <GameCard key={game.slug} game={game} />
                    ))}
                </div>
            )}
        </div>
    );
};
