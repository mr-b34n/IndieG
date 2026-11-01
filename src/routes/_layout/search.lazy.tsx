import { createLazyFileRoute } from '@tanstack/react-router';
import { SearchResultsPage } from '@/features/search';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { useTranslation } from '@/shared/hooks/useTranslate';

const SearchRouteComponent = () => {
    const { q } = Route.useSearch();
    const { t } = useTranslation();
    const searchLabel = t('common.search', { defaultValue: 'Tìm kiếm' });
    const title = q && q.trim() ? `"${q.trim()}" - ${searchLabel}` : searchLabel;
    useDocumentTitle(title);

    return <SearchResultsPage />;
};

export const Route = createLazyFileRoute('/_layout/search')({
    component: SearchRouteComponent,
});
