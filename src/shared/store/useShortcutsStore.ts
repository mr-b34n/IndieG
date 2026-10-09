import { create } from "zustand";

interface ShortcutsState {
    isCheatsheetOpen: boolean;
    openCheatsheet: () => void;
    closeCheatsheet: () => void;
    toggleCheatsheet: () => void;

    activeSequence: string | null;
    setActiveSequence: (seq: string | null) => void;
}

export const useShortcutsStore = create<ShortcutsState>((set) => ({
    isCheatsheetOpen: false,
    openCheatsheet: () => set({ isCheatsheetOpen: true }),
    closeCheatsheet: () => set({ isCheatsheetOpen: false }),
    toggleCheatsheet: () => set((state) => ({ isCheatsheetOpen: !state.isCheatsheetOpen })),

    activeSequence: null,
    setActiveSequence: (seq) => set({ activeSequence: seq }),
}));
