import { Outlet, createRootRoute } from '@tanstack/react-router'
import { Fragment } from 'react';
import { useSyncDocumentTitle } from '@/shared/hooks/useDocumentTitle';

export const Route = createRootRoute({
    component: RootComponent,
})

function RootComponent() {
    useSyncDocumentTitle();

    return (
        <Fragment>
            <Outlet />
        </Fragment>
    )
}
