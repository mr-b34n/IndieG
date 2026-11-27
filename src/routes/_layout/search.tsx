import { createFileRoute } from '@tanstack/react-router';

const VALID_SEARCH_TABS = new Set(['all', 'games', 'communities', 'posts', 'users'] as const);
type SearchTab = 'all' | 'games' | 'communities' | 'posts' | 'users';

function parseTab(val: unknown): SearchTab {
    return typeof val === 'string' && VALID_SEARCH_TABS.has(val as SearchTab)
        ? (val as SearchTab)
        : 'all';
}

function parsePositiveInt(val: unknown, fallback: number): number {
    const num = typeof val === 'number' ? val : Number(val);
    return Number.isFinite(num) && num >= 1 ? Math.floor(num) : fallback;
}

export const Route = createFileRoute('/_layout/search')({
    validateSearch: (search: Record<string, unknown>) => ({
        q: typeof search.q === 'string' ? search.q : '',
        tab: parseTab(search.tab),
        type: parseTab(search.type),
        page: parsePositiveInt(search.page, 1),
        size: parsePositiveInt(search.size, 10),
    }),
});
