import { Outlet, createRootRoute, useLocation, useNavigate } from '@tanstack/react-router'
import { Fragment, useEffect } from 'react';

export const Route = createRootRoute({
    component: RootComponent,
})

function RootComponent() {
    const navigate = useNavigate();
    const {pathname} = useLocation();

    useEffect(() => {
        if (pathname !== '/') {
            navigate({to: '/', replace: true})
        }
    }, [])
    return (
        <Fragment>
            <Outlet />
        </Fragment>
    )
}
