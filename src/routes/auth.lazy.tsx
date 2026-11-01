import { createLazyFileRoute } from '@tanstack/react-router';
import { AuthPage } from '@/features/auth/components/AuthPage';

export const Route = createLazyFileRoute('/auth')({
    component: AuthPage,
});
