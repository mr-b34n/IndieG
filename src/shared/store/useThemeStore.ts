import { create } from 'zustand';

export type Theme = 'light' | 'dark';
export type Language = 'en' | 'vi';

interface ThemeState {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
    language: Language;
    setLanguage: (lang: Language) => void;
    toggleLanguage: () => void;
}

const applyThemeToDOM = (theme: Theme) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (theme === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
    } else {
        root.classList.remove('dark');
        root.classList.add('light');
    }
    root.setAttribute('data-theme', theme);
    root.style.colorScheme = theme;
};

const getInitialTheme = (): Theme => {
    if (typeof window === 'undefined') return 'dark';
    const saved = localStorage.getItem('theme') as Theme | null;
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'dark';
};

const getInitialLanguage = (): Language => {
    if (typeof window === 'undefined') return 'vi';
    const saved = localStorage.getItem('language') as Language | null;
    if (saved === 'vi' || saved === 'en') return saved;
    return 'vi';
};

const initialTheme = getInitialTheme();
const initialLanguage = getInitialLanguage();

applyThemeToDOM(initialTheme);

export const useThemeStore = create<ThemeState>((set) => ({
    theme: initialTheme,
    language: initialLanguage,
    toggleTheme: () => set((state) => {
        const nextTheme: Theme = state.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', nextTheme);
        applyThemeToDOM(nextTheme);
        return { theme: nextTheme };
    }),
    setTheme: (theme: Theme) => {
        localStorage.setItem('theme', theme);
        applyThemeToDOM(theme);
        set({ theme });
    },
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
