import { createLazyFileRoute } from '@tanstack/react-router';
import { UserProfile } from '@/features/profile';
import { useAuthStore } from '@/features/auth';

function ProfileRoute() {
    const { userId } = Route.useParams();
    const currentUserId = useAuthStore((state) => state.user?.id || 'guest');
    return <UserProfile key={`${currentUserId}_${userId}`} userId={userId} />;
}

export const Route = createLazyFileRoute('/_layout/profile/$userId')({
    component: ProfileRoute,
});
