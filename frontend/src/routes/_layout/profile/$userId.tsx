import { createFileRoute } from '@tanstack/react-router';
import { UserProfile } from '@/features/profile';

export const Route = createFileRoute('/_layout/profile/$userId')({
    component: ProfileRoute,
});

function ProfileRoute() {
    const { userId } = Route.useParams();
    return <UserProfile userId={userId} />;
}
