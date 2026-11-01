import { createLazyFileRoute } from '@tanstack/react-router';
import { SettingsPage } from '@/features/settings';

export const Route = createLazyFileRoute('/_layout/settings/')({
    component: SettingsPage,
});
