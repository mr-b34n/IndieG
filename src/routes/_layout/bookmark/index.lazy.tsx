import { createLazyFileRoute } from '@tanstack/react-router';
import { BookmarkList } from '@/features/bookmark';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { useTranslation } from '@/shared/hooks/useTranslate';

const Bookmark = () => {
	const { t } = useTranslation();
	useDocumentTitle(t('common.bookmark', { defaultValue: 'Đã lưu' }));

	return <BookmarkList showHeader />;
};

export const Route = createLazyFileRoute('/_layout/bookmark/')({
	component: Bookmark,
});
