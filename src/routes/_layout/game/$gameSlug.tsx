import { createFileRoute, useParams } from '@tanstack/react-router';
import { GameDetail } from '@/features/game/components/GameDetail';

const GamePage = () => {
    const params = useParams({ strict: false });
    const gameSlug = params?.gameSlug || '';

    return <GameDetail slug={gameSlug} />;
};

export const Route = createFileRoute('/_layout/game/$gameSlug')({
    component: GamePage,
});

