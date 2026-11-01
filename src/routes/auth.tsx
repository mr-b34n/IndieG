import { createFileRoute, redirect } from '@tanstack/react-router';
import { useAuthStore } from '@/features/auth';

export const Route = createFileRoute('/auth')({
    beforeLoad: () => {
        const { user } = useAuthStore.getState();
        if (user) {
            throw redirect({
                to: '/',
                replace: true
            });
        }
    },
});
