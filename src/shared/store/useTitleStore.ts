import { create } from 'zustand';

interface TitleState {
    customTitle: string | null;
    setCustomTitle: (title: string | null) => void;
    clearCustomTitle: () => void;
}

export const useTitleStore = create<TitleState>((set) => ({
    customTitle: null,
    setCustomTitle: (title) => set({ customTitle: title }),
    clearCustomTitle: () => set({ customTitle: null }),
}));
