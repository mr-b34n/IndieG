import { createRouter, RouterProvider } from '@tanstack/react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { IconContext } from '@phosphor-icons/react'
import { queryClient } from './shared/lib/queryClient'
import { routeTree } from './routeTree.gen'
import './App.css'
import { useEffect } from 'react';
import { useAuthStore } from './features/auth';

const router = createRouter({ routeTree });
const ICON_CONTEXT_VALUE = { weight: 'fill' as const };

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router
    }
}

const App = () => {
    const initializeAuth = useAuthStore((state) => state.initializeAuth);

    useEffect(() => {
        initializeAuth();
    }, [initializeAuth]);

    return (
        <IconContext.Provider value={ICON_CONTEXT_VALUE}>
            <QueryClientProvider client={queryClient}>
                <RouterProvider router={router} />
            </QueryClientProvider>
        </IconContext.Provider>
    )
}

export default App
