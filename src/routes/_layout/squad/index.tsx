import { createFileRoute } from '@tanstack/react-router';
import { SquadList } from '@/features/squad/components/SquadList';

export const Route = createFileRoute('/_layout/squad/')({
    component: SquadList,
});
