import { createLazyFileRoute } from '@tanstack/react-router';
import { GamesHubPage } from '@/features/game';

export const Route = createLazyFileRoute('/_layout/game/')({
    component: GamesHubPage,
});
