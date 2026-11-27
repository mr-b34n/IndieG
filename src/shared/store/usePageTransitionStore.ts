import { create } from 'zustand';

interface PageTransitionState {
    isTransitioning: boolean;
    startTransition: (onMidpoint?: () => void) => void;
}

/**
 * Global smooth page transition store.
 * Coordinates graceful cross-page veil transitions (e.g. Auth -> Home).
 */
export const usePageTransitionStore = create<PageTransitionState>((set) => ({
    isTransitioning: false,
    startTransition: (onMidpoint) => {
        set({ isTransitioning: true });
        // Allow the veil to smoothly fade in (350ms) before executing the route transition
        setTimeout(() => {
            if (onMidpoint) {
                onMidpoint();
            }
            // Allow 80ms for the destination route to mount behind the veil, then fade out
            setTimeout(() => {
                set({ isTransitioning: false });
            }, 80);
        }, 350);
    },
}));
