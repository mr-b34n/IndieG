import { createFileRoute } from '@tanstack/react-router';
import { GamesHubPage } from '@/features/game';

export const Route = createFileRoute('/_layout/game/')({
    component: GamesHubPage,
});
