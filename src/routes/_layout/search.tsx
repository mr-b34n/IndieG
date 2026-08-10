import { createFileRoute } from '@tanstack/react-router';
import { SearchResultsPage } from '@/features/search';
import { z } from 'zod';

const searchSchema = z.object({
    q: z.string().optional().catch(''),
    tab: z.enum(['all', 'games', 'communities', 'posts', 'squads']).optional().catch('all'),
});

export const Route = createFileRoute('/_layout/search')({
    validateSearch: searchSchema,
    component: SearchResultsPage,
});
