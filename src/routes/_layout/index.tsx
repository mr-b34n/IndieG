import { createFileRoute } from '@tanstack/react-router'
import { FeedList } from '@/features/feed';

const Home = () => {
	return <FeedList />;
}

export const Route = createFileRoute('/_layout/')(
	{ component: Home }
)