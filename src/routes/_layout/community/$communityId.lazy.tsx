import { createLazyFileRoute } from '@tanstack/react-router';
import { CommunityDetailPage } from '@/features/community/components/hub/CommunityDetailPage';

export const Route = createLazyFileRoute('/_layout/community/$communityId')({
    component: CommunityDetailPage,
});
