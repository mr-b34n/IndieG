/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi } from '../locales/vi';
import { en } from '../locales/en';
import { useThemeStore } from '../store/useThemeStore';

const dictionary: Record<string, any> = { vi, en };

/** Shared type for the `t()` translation function returned by useTranslation. */
export type TranslateFn = (path: string, params?: Record<string, any>) => string;

export const useTranslation = () => {
    const language = useThemeStore((state) => state.language);

    const getValueFromDict = (dict: any, keys: string[]): string | null => {
        let current = dict;
        for (const key of keys) {
            if (current && current[key] !== undefined) {
                current = current[key];
            } else if (current && typeof current === 'object') {
                // Case-insensitive key match fallback
                const lowerKey = key.toLowerCase();
                const matchedKey = Object.keys(current).find((k) => k.toLowerCase() === lowerKey);
                if (matchedKey && current[matchedKey] !== undefined) {
                    current = current[matchedKey];
                } else {
                    return null;
                }
            } else {
                return null;
            }
        }
        return typeof current === 'string' ? current : null;
    };

    const t: TranslateFn = (path, params) => {
        const keys = path.split('.');
        const activeDict = dictionary[language] || dictionary.vi;

        let val = getValueFromDict(activeDict, keys);

        // Fallback to Vietnamese if missing in active dict
        if (val === null && language !== 'vi') {
            val = getValueFromDict(dictionary.vi, keys);
        }

        // Fallback to English if still missing
        if (val === null && language !== 'en') {
            val = getValueFromDict(dictionary.en, keys);
        }

        // Final fallback to defaultValue or path
        const fallback = params?.defaultValue ?? path;
        let result = val ?? fallback;

        if (params) {
            Object.entries(params).forEach(([key, paramVal]) => {
                if (key !== 'defaultValue') {
                    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(paramVal));
                }
            });
        }

        return result;
    };

    return { t, language, lang: language };
};
