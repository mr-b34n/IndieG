import { Outlet, createRootRoute } from '@tanstack/react-router'
import { Fragment } from 'react';
import { useSyncDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { usePageTransitionStore } from '@/shared/store/usePageTransitionStore';
import { ToastContainer } from '@/shared/components/ui/ToastContainer';

export const Route = createRootRoute({
    component: RootComponent,
})

function RootComponent() {
    useSyncDocumentTitle();
    const isTransitioning = usePageTransitionStore((state) => state.isTransitioning);

    return (
        <Fragment>
            <Outlet />
            <ToastContainer />
            {/* Seamless cross-page transition veil */}
            <div
                className={`fixed inset-0 z-[9999] pointer-events-none bg-bg transition-opacity duration-350 ease-out ${
                    isTransitioning ? 'opacity-100' : 'opacity-0'
                }`}
                aria-hidden="true"
            />
        </Fragment>
    )
}
