import { createFileRoute } from '@tanstack/react-router';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { useTranslation } from '@/shared/hooks/useTranslate';

const Developer = () => {
    const { t } = useTranslation();
    useDocumentTitle(t('common.developerPortal', { defaultValue: 'Cổng nhà phát triển' }));
    return <div className="p-8 text-text-muted">Developer</div>;
};

export const Route = createFileRoute('/_authenticated/developer/')({
    component: Developer,
});

