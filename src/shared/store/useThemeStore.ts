import { create } from 'zustand';

export type Theme = 'light' | 'dark';
export type ThemeMode = 'light' | 'dark' | 'auto';
export type Language = 'en' | 'vi';

interface ThemeState {
    theme: Theme;
    mode: ThemeMode;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
    setThemeMode: (mode: ThemeMode) => void;
    language: Language;
    setLanguage: (lang: Language) => void;
    toggleLanguage: () => void;
}

const getSystemTheme = (): Theme => {
    if (typeof window === 'undefined') return 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const resolveTheme = (mode: ThemeMode): Theme => {
    if (mode === 'auto') return getSystemTheme();
    return mode;
};

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

const getInitialMode = (): ThemeMode => {
    if (typeof window === 'undefined') return 'auto';
    const savedMode = localStorage.getItem('theme_mode') as ThemeMode | null;
    if (savedMode === 'light' || savedMode === 'dark' || savedMode === 'auto') return savedMode;
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
    return 'auto';
};

const getInitialLanguage = (): Language => {
    if (typeof window === 'undefined') return 'vi';
    const saved = localStorage.getItem('language') as Language | null;
    if (saved === 'vi' || saved === 'en') return saved;
    return 'vi';
};

const initialMode = getInitialMode();
const initialTheme = resolveTheme(initialMode);
const initialLanguage = getInitialLanguage();

applyThemeToDOM(initialTheme);

export const useThemeStore = create<ThemeState>((set) => ({
    theme: initialTheme,
    mode: initialMode,
    language: initialLanguage,

    toggleTheme: () => set((state) => {
        const nextTheme: Theme = state.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme_mode', nextTheme);
        localStorage.setItem('theme', nextTheme);
        applyThemeToDOM(nextTheme);
        return { mode: nextTheme, theme: nextTheme };
    }),

    setTheme: (theme: Theme) => {
        localStorage.setItem('theme_mode', theme);
        localStorage.setItem('theme', theme);
        applyThemeToDOM(theme);
        set({ mode: theme, theme });
    },

    setThemeMode: (mode: ThemeMode) => {
        localStorage.setItem('theme_mode', mode);
        const resolved = resolveTheme(mode);
        localStorage.setItem('theme', resolved);
        applyThemeToDOM(resolved);
        set({ mode, theme: resolved });
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

// Listen for device system appearance changes when in 'auto' mode
if (typeof window !== 'undefined' && window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
        const currentMode = useThemeStore.getState().mode;
        if (currentMode === 'auto') {
            const systemTheme: Theme = e.matches ? 'dark' : 'light';
            applyThemeToDOM(systemTheme);
            useThemeStore.setState({ theme: systemTheme });
        }
    };

    if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleSystemThemeChange);
    } else if ('addListener' in mediaQuery) {
        // Fallback for older browsers
        (mediaQuery as any).addListener(handleSystemThemeChange);
    }
}
