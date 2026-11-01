// src/routes/_layout.tsx
import { createFileRoute, Outlet, useLocation } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import { Header } from '@/shared/components/header/Header'
import { LeftBar } from '@/shared/components/sidebars/LeftBar'
import { RightBar } from '@/shared/components/sidebars/RightBar'
import { useSidebarStore } from '@/shared/store/useSidebarStore'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { useTranslation } from '@/shared/hooks/useTranslate'
import { CreatePostModal } from '@/features/feed/components/CreatePostBox';
import { useGlobalShortcuts } from '@/shared/hooks/useGlobalShortcuts';
import { ShortcutsCheatsheetModal } from '@/shared/components/shortcuts/ShortcutsCheatsheetModal';
import { GoToIndicator } from '@/shared/components/shortcuts/GoToIndicator';
import { useRegisterOverlay } from '@/shared/utils/overlayManager';
import { useAuthStore, VerifyNoticeModal } from '@/features/auth';
import { useCommunitiesStore } from '@/features/community';
import { useCommunitiesQuery } from '@/shared/api/useQueries';

const scrollPositions = new Map<string, number>()

export const Route = createFileRoute('/_layout')({
    component: MainLayout,
})

function MainLayout() {
    const { t } = useTranslation()
    // 1. Lấy thông tin route hiện tại
    const { pathname } = useLocation()
    
    // 2. Ref trỏ đến container chứa thanh cuộn
    const scrollContainerRef = useRef<HTMLDivElement>(null)

    const user = useAuthStore((state) => state.user)
    const isLoggedIn = Boolean(user)
    const syncJoinedCommunities = useCommunitiesStore((state) => state.syncJoinedCommunities)

    // Synchronize joined communities globally whenever user is logged in
    const { data: rawJoinedData } = useCommunitiesQuery(
        { type: "joined", limit: 50 },
        { enabled: isLoggedIn }
    )

    useEffect(() => {
        if (rawJoinedData) {
            syncJoinedCommunities(rawJoinedData)
        }
    }, [rawJoinedData, syncJoinedCommunities])

    const isLeftOpen = useSidebarStore((state) => state.isLeftOpen)
    const isRightOpen = useSidebarStore((state) => state.isRightOpen)
    const closeLeft = useSidebarStore((state) => state.closeLeft)
    const closeRight = useSidebarStore((state) => state.closeRight)

    const hideSidebars = 
        pathname.startsWith('/settings') || 
        pathname.startsWith('/profile') || 
        (pathname.startsWith('/game') && pathname !== '/game') ||
        (pathname.startsWith('/community') && pathname !== '/community')

    const pathnameRef = useRef(pathname)
    const prevPathnameRef = useRef(pathname)
    const isTransitioningRef = useRef(false)
    const isPopStateRef = useRef(false)

    // Detect popstate (browser back/forward button or history.back)
    useEffect(() => {
        const handlePopState = () => {
            isPopStateRef.current = true;
        };
        window.addEventListener('popstate', handlePopState);
        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);

    // Track active scrolling on the container
    useEffect(() => {
        pathnameRef.current = pathname;
        const container = scrollContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            if (!isTransitioningRef.current && pathnameRef.current === pathname) {
                scrollPositions.set(pathname, container.scrollTop);
                sessionStorage.setItem('scroll_pos_' + pathname, String(container.scrollTop));
            }
        };

        container.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            container.removeEventListener('scroll', handleScroll);
        };
    }, [pathname, hideSidebars]);

    // Handle route transitions
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) {
            closeLeft();
            closeRight();
            return;
        }

        // Save scroll of previous route before handling new route
        if (prevPathnameRef.current && prevPathnameRef.current !== pathname) {
            if (container.scrollTop > 0) {
                scrollPositions.set(prevPathnameRef.current, container.scrollTop);
                sessionStorage.setItem('scroll_pos_' + prevPathnameRef.current, String(container.scrollTop));
            }
        }
        prevPathnameRef.current = pathname;

        isTransitioningRef.current = true;

        const isPop = isPopStateRef.current;
        isPopStateRef.current = false; // Reset pop state flag

        // If navigated via PUSH (normal click) or to a post detail page, ALWAYS scroll to top!
        const isPostDetail = pathname.startsWith('/post/');
        const memorySavedScroll = scrollPositions.get(pathname);
        const sessionSavedScroll = Number(sessionStorage.getItem('scroll_pos_' + pathname) || 0);
        const savedScroll = memorySavedScroll && memorySavedScroll > 0 ? memorySavedScroll : sessionSavedScroll;
        const returningPostId = sessionStorage.getItem('returning_from_post_id');

        if (isPop && !isPostDetail && (savedScroll > 0 || returningPostId)) {
            let attempts = 0;
            const tryRestore = () => {
                const c = scrollContainerRef.current;
                if (!c) return;

                if (savedScroll > 0) {
                    c.scrollTop = savedScroll;
                }

                if (returningPostId && c.scrollTop < savedScroll) {
                    const postEl = document.getElementById(`post-article-${returningPostId}`);
                    if (postEl) {
                        postEl.scrollIntoView({ block: 'center' });
                    }
                }

                const reached = savedScroll > 0 ? c.scrollTop >= savedScroll - 2 : true;
                if (!reached && attempts < 35) {
                    attempts++;
                    requestAnimationFrame(tryRestore);
                } else {
                    isTransitioningRef.current = false;
                    if (returningPostId) {
                        sessionStorage.removeItem('returning_from_post_id');
                    }
                }
            };
            requestAnimationFrame(tryRestore);
        } else {
            // New navigation or post detail: reset to top immediately
            container.scrollTop = 0;
            window.scrollTo(0, 0);
            requestAnimationFrame(() => {
                if (scrollContainerRef.current) {
                    scrollContainerRef.current.scrollTop = 0;
                }
                setTimeout(() => {
                    isTransitioningRef.current = false;
                }, 50);
            });
        }

        closeLeft();
        closeRight();
    }, [pathname, hideSidebars, closeLeft, closeRight]);

    useGlobalShortcuts();

    useRegisterOverlay({
        id: "mobile-left-sidebar",
        isOpen: !hideSidebars && isLeftOpen,
        onClose: closeLeft,
        priority: 80,
    });

    useRegisterOverlay({
        id: "mobile-right-sidebar",
        isOpen: !hideSidebars && isRightOpen,
        onClose: closeRight,
        priority: 80,
    });

    return (
        <div className="flex flex-col relative w-full h-screen overflow-hidden bg-bg text-text">
            <Header />
            <CreatePostModal />
            <ShortcutsCheatsheetModal />
            <GoToIndicator />
            <VerifyNoticeModal />

            {/* Mobile Left Sidebar */}
            {!hideSidebars && isLeftOpen && (
                <div className="fixed inset-0 z-[150] lg:hidden flex">
                    <div 
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" 
                        onClick={closeLeft}
                    />
                    <aside className="relative w-72 max-w-[85vw] h-full bg-surface border-r border-border p-4 flex flex-col z-10 shadow-2xl animate-slide-right">
                        <div className="shrink-0 flex items-center justify-between pb-3 mb-3 border-b border-border">
                            <p className="font-extrabold text-primary text-lg">{t('common.navigation', { defaultValue: 'Navigation' })}</p>
                            <button onClick={closeLeft} className="w-8 h-8 rounded-full bg-surface-hover flex items-center justify-center text-text-muted hover:text-text cursor-pointer">
                                <FontAwesomeIcon icon={faXmark} />
                            </button>
                        </div>
                        <div className="flex-1 min-h-0 flex flex-col">
                            <LeftBar />
                        </div>
                    </aside>
                </div>
            )}

            {/* Mobile Right Sidebar */}
            {!hideSidebars && isRightOpen && (
                <div className="fixed inset-0 z-[150] xl:hidden flex justify-end">
                    <div 
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" 
                        onClick={closeRight}
                    />
                    <aside className="relative w-72 max-w-[85vw] h-full bg-surface border-l border-border p-4 overflow-y-auto z-10 shadow-2xl animate-slide-left">
                        <div className="flex items-center justify-between pb-3 mb-3 border-b border-border">
                            <p className="font-extrabold text-primary text-lg">{t('common.trending', { defaultValue: 'Xu hướng' })}</p>
                            <button onClick={closeRight} className="w-8 h-8 rounded-full bg-surface-hover flex items-center justify-center text-text-muted hover:text-text cursor-pointer">
                                <FontAwesomeIcon icon={faXmark} />
                            </button>
                        </div>
                        <RightBar />
                    </aside>
                </div>
            )}

            
            {hideSidebars ? (
                /* Full-width scroll container when sidebars are hidden: scrollbar sits at the outermost right edge */
                <div 
                    ref={scrollContainerRef} 
                    data-scroll-container
                    className="flex-1 min-h-0 w-full h-full overflow-y-scroll [scrollbar-gutter:stable] overflow-x-hidden"
                >
                    <div className="w-full max-w-[1280px] mx-auto px-3 sm:px-4 md:px-6 py-3 pb-12">
                        <main key={pathname} className="w-full animate-fade-in">
                            <Outlet />
                        </main>
                    </div>
                </div>
            ) : (
                /* Multi-column layout with fixed sidebars & independent middle scroll area */
                <div className="flex-1 min-h-0 w-full overflow-hidden flex flex-row justify-center">
                    <div className="w-full max-w-[1536px] h-full flex flex-row items-start gap-4 xl:gap-6 px-3 sm:px-4 md:px-6">
                        
                        {/* Left Sidebar - Docked on Pad landscape (lg) & Desktop (xl) */}
                        <aside className="hidden lg:flex shrink-0 w-60 xl:w-[280px] h-full py-3 flex-col overflow-y-auto scrollbar-none">
                            <LeftBar />
                        </aside>

                        {/* Main Content - Independent Scroll Area */}
                        <div 
                            ref={scrollContainerRef} 
                            data-scroll-container
                            className="flex-1 min-w-0 h-full overflow-y-scroll [scrollbar-gutter:stable] overflow-x-hidden py-3 pb-12"
                        >
                            <main key={pathname} className="w-full animate-fade-in">
                                <Outlet />
                            </main>
                        </div>

                        {/* Right Sidebar - Docked only on Desktop (xl) */}
                        <aside className="hidden xl:block shrink-0 w-64 xl:w-[280px] h-full py-3 overflow-y-auto scrollbar-none">
                            <RightBar />
                        </aside>

                    </div>
                </div>
            )}
        </div>
    )
}