import { useEffect } from 'react';
import { useLocation } from '@tanstack/react-router';
import { useTitleStore } from '@/shared/store/useTitleStore';
import { useNotificationStore } from '@/features/notification/store/useNotificationStore';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useTranslation } from './useTranslate';

export const APP_NAME = 'Ludon';
export const DEFAULT_FAVICON = '/favicon.svg?v=3';

/**
 * Hook to set a custom page title for the current view.
 * When the component unmounts, the custom title is automatically cleared.
 *
 * Example:
 *   useDocumentTitle("Counter-Strike 2 Vietnam");
 */
export const useDocumentTitle = (
    title?: string | null
) => {
    const setCustomTitle = useTitleStore((state) => state.setCustomTitle);
    const clearCustomTitle = useTitleStore((state) => state.clearCustomTitle);

    useEffect(() => {
        if (title !== undefined && title !== null && title.trim() !== '') {
            setCustomTitle(title.trim());
        } else {
            clearCustomTitle();
        }

        return () => {
            clearCustomTitle();
        };
    }, [title, setCustomTitle, clearCustomTitle]);
};

/**
 * Root sync hook that updates document.title reactively:
 * - On Home ('/'): displays "Ludon" (or "(N) Ludon" when unread notifications exist).
 * - On other pages: displays "[Page Title] | Ludon" (like Facebook).
 * - Prefixes unread notification count badge "(N) " if logged in and unread count > 0.
 */
export const useSyncDocumentTitle = () => {
    const { pathname, search } = useLocation();
    const { t, language } = useTranslation();
    const isLoggedIn = useAuthStore((state) => Boolean(state.user));
    const unreadCount = useNotificationStore((state) =>
        isLoggedIn
            ? state.notifications.reduce((count, n) => (!n.isRead ? count + 1 : count), 0)
            : 0
    );
    const customTitle = useTitleStore((state) => state.customTitle);

    useEffect(() => {
        // 1. Determine base title
        const isHome = pathname === '/' || pathname === '';
        let pageSectionTitle = customTitle;

        if (!pageSectionTitle) {
            if (pathname.startsWith('/search')) {
                const query = typeof search === 'object' && search !== null && 'q' in search
                    ? String((search as Record<string, unknown>).q || '').trim()
                    : '';
                const searchLabel = t('common.search', { defaultValue: 'Tìm kiếm' });
                pageSectionTitle = query ? `"${query}" - ${searchLabel}` : searchLabel;
            } else if (pathname.startsWith('/community')) {
                pageSectionTitle = t('common.community', { defaultValue: 'Cộng đồng' });
            } else if (pathname.startsWith('/game')) {
                pageSectionTitle = t('common.game', { defaultValue: 'Trò chơi' });
            } else if (pathname.startsWith('/post')) {
                pageSectionTitle = t('post.post', { defaultValue: 'Bài viết' });
            } else if (pathname.startsWith('/profile')) {
                pageSectionTitle = t('common.viewProfile', { defaultValue: 'Trang cá nhân' });
            } else if (pathname.startsWith('/settings')) {
                pageSectionTitle = t('common.settings', { defaultValue: 'Cài đặt' });
            } else if (pathname.startsWith('/auth')) {
                pageSectionTitle = t('authenticate.login', { defaultValue: 'Đăng nhập' });
            } else if (pathname.startsWith('/verify-email')) {
                pageSectionTitle = t('auth.verifyEmailTitle', { defaultValue: 'Xác minh email' });
            }
        }

        // 2. Format tab title Facebook-style:
        // - Home: "Ludon"
        // - Other: "[Section] | Ludon"
        let baseTitle: string;
        if (isHome) {
            baseTitle = customTitle ? `${customTitle} | ${APP_NAME}` : APP_NAME;
        } else if (pageSectionTitle) {
            baseTitle = `${pageSectionTitle} | ${APP_NAME}`;
        } else {
            baseTitle = APP_NAME;
        }

        // 3. Unread notification count prefix (Facebook convention: "(3) Title")
        const unreadBadge = unreadCount > 0 ? `(${unreadCount}) ` : '';
        const finalTitle = `${unreadBadge}${baseTitle}`;

        if (document.title !== finalTitle) {
            document.title = finalTitle;
        }

        // 4. Ensure tab icon displays the official logo
        const iconLinks = Array.from(document.querySelectorAll<HTMLLinkElement>("link[rel*='icon']"));
        let hasDefaultIcon = false;

        iconLinks.forEach((link) => {
            const href = link.getAttribute('href') || link.href;
            if (href === DEFAULT_FAVICON || href.includes('favicon')) {
                hasDefaultIcon = true;
            } else if (href.startsWith('data:image/svg+xml')) {
                link.remove();
            }
        });

        if (!hasDefaultIcon) {
            const defaultLink = document.createElement('link');
            defaultLink.rel = 'icon';
            defaultLink.type = 'image/svg+xml';
            defaultLink.href = DEFAULT_FAVICON;
            document.head.appendChild(defaultLink);
        }
    }, [pathname, search, customTitle, unreadCount, t, language]);
};
