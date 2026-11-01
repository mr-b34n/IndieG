import { createFileRoute } from '@tanstack/react-router';

export interface CommunityDetailSearch {
    nav?: string;
}

export const Route = createFileRoute('/_layout/community/$communityId')({
    validateSearch: (search: Record<string, unknown>): CommunityDetailSearch => ({
        nav: typeof search.nav === 'string' ? search.nav : undefined,
    }),
});

