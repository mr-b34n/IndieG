import { create } from 'zustand';

type Theme = 'light' | 'dark';
type Language = 'en' | 'vi';

interface ThemeState {
    theme: Theme;
    toggleTheme: () => void;
    language: Language;
    setLanguage: (lang: Language) => void;
    toggleLanguage: () => void;
}

const getInitialTheme = (): Theme => {
    if (typeof window === 'undefined') return 'light';

    const saved = localStorage.getItem('theme') as Theme | null;
    if (saved === 'light' || saved === 'dark') return saved;

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const initialTheme = getInitialTheme();

if (initialTheme === 'dark') {
    document.documentElement.classList.add('dark');
} else {
    document.documentElement.classList.remove('dark');
}

export const useThemeStore = create<ThemeState>((set) => ({
    theme: initialTheme,
    language: 'en',
    toggleTheme: () => set((state) => {
        const nextTheme: Theme = state.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', nextTheme);

        if (nextTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        return { theme: nextTheme };
    }),
    setLanguage: (language) => set({language}),
    toggleLanguage: () => {
        set((state) => ({
            language: state.language === 'en' ? 'vi' : 'en'
        }))
    }
}));