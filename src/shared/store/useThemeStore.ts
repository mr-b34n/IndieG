import { create } from 'zustand';

export type Theme = 'light' | 'dark';
export type Language = 'en' | 'vi';

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

const getInitialLanguage = (): Language => {
    if (typeof window === 'undefined') return 'vi';
    const saved = localStorage.getItem('language') as Language | null;
    if (saved === 'vi' || saved === 'en') return saved;
    return 'vi';
};

const initialTheme = getInitialTheme();
const initialLanguage = getInitialLanguage();

if (typeof document !== 'undefined') {
    if (initialTheme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
}

export const useThemeStore = create<ThemeState>((set) => ({
    theme: initialTheme,
    language: initialLanguage,
    toggleTheme: () => set((state) => {
        const nextTheme: Theme = state.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', nextTheme);

        if (typeof document !== 'undefined') {
            if (nextTheme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }

        return { theme: nextTheme };
    }),
    setLanguage: (language) => {
        localStorage.setItem('language', language);
        set({ language });
    },
    toggleLanguage: () => {
        set((state) => {
            const nextLang: Language = state.language === 'en' ? 'vi' : 'en';
            localStorage.setItem('language', nextLang);
            return { language: nextLang };
        });
    },
}));
