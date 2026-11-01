import { createLazyFileRoute } from '@tanstack/react-router';
import { SquadList } from '@/features/squad/components/SquadList';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { useTranslation } from '@/shared/hooks/useTranslate';

const SquadRouteComponent = () => {
    const { t } = useTranslation();
    useDocumentTitle(t('common.squad', { defaultValue: 'Squad' }));
    return <SquadList />;
};

export const Route = createLazyFileRoute('/_layout/squad/')({
    component: SquadRouteComponent,
});
