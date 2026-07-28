import { createRouter, RouterProvider } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import './App.css'
import { useEffect } from 'react';
import { useAuthStore } from './features/auth';

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router
    }
}
const App = () => {
    const initializeAuth = useAuthStore((state) => state.initializeAuth);

    useEffect(() => {
        const unsubscribe = initializeAuth();
        return () => unsubscribe();
    }, [initializeAuth]);

    return (
        <RouterProvider router={router} />
    )
}

export default App
