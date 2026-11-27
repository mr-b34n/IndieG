import React, { useMemo } from "react";
import { GameController as Gamepad2 } from "@phosphor-icons/react";
import { useTranslation } from "@/shared/hooks/useTranslate";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { useGameStore } from "../store/useGameStore";
import { INITIAL_GAMES } from "../constants";
import { useGamesQuery } from "@/shared/api/useQueries";
import { mapGameDtoToGameData } from "@/shared/api/types";
import { type GameData } from "../types";
import { GameCard } from "./GameCard";
import { GameGridSkeleton } from "./GameCardSkeleton";

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
            return remoteList.map((item) => mapGameDtoToGameData(item as Record<string, unknown>));
        }

        if (storeGames && storeGames.length > 0) return storeGames;
        return INITIAL_GAMES;
    }, [apiGamesData, storeGames]);

    if (isLoading && allGames.length === 0) {
        return <GameGridSkeleton count={6} />;
    }

    if (allGames.length === 0) {
        // Border-free empty state (no border lines)
        return (
            <div className="w-full bg-surface-inner/40 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3 my-4">
                <Gamepad2 className="w-10 h-10 text-text-faint" />
                <h4 className="text-sm font-bold text-text">{t("game.noGamesFound", { defaultValue: "Chưa có trò chơi nào" })}</h4>
                <p className="text-xs text-text-muted max-w-sm">
                    {t("game.noGamesFoundDesc", { defaultValue: "Hiện tại hệ thống chưa có dữ liệu trò chơi." })}
                </p>
            </div>
        );
    }

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
