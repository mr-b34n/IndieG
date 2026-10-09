import { createFileRoute } from '@tanstack/react-router';
import { GameDetail } from '@/features/game/components/GameDetail';

const GameIndexPage = () => {
    return <GameDetail slug="counter-strike-2" />;
};

export const Route = createFileRoute('/_layout/game/')({
    component: GameIndexPage,
});
