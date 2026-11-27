import { createLazyFileRoute } from '@tanstack/react-router';
import { CommunityList } from '@/features/community';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { useTranslation } from '@/shared/hooks/useTranslate';

const Community = () => {
    const { t } = useTranslation();
    useDocumentTitle(t('common.community', { defaultValue: 'Cộng đồng' }));

    return <CommunityList />;
};

export const Route = createLazyFileRoute('/_layout/community/')({
    component: Community,
});
