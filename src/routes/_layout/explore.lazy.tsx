import { createLazyFileRoute } from '@tanstack/react-router';
import { ExplorePage } from '@/features/explore/components/ExplorePage';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { useTranslation } from '@/shared/hooks/useTranslate';

const ExploreRouteComponent = () => {
    const { t } = useTranslation();
    useDocumentTitle(t('common.explore', { defaultValue: 'Khám phá' }));
    return <ExplorePage />;
};

export const Route = createLazyFileRoute('/_layout/explore')({
    component: ExploreRouteComponent,
});
