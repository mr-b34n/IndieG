/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useState } from 'react';
import { vi } from '../locales/vi';
import { useThemeStore } from '../store/useThemeStore';

const loadedDictionaries: Record<string, Record<string, any>> = { vi };
let enLoadPromise: Promise<Record<string, any>> | null = null;

function loadEnglishDictionary(): Promise<Record<string, any>> {
    if (loadedDictionaries.en) return Promise.resolve(loadedDictionaries.en);
    if (!enLoadPromise) {
        enLoadPromise = import('../locales/en').then((mod) => {
            loadedDictionaries.en = mod.en;
            return mod.en;
        });
    }
    return enLoadPromise;
}

function getValueFromDict(dict: Record<string, any> | undefined, keys: string[]): string | null {
    let current: any = dict;
    for (const key of keys) {
        if (current && current[key] !== undefined) {
            current = current[key];
        } else if (current && typeof current === 'object') {
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
}

/** Shared type for the `t()` translation function returned by useTranslation. */
export type TranslateFn = (path: string, params?: Record<string, any>) => string;

export const useTranslation = () => {
    const language = useThemeStore((state) => state.language);
    const [, setEnReady] = useState(() => Boolean(loadedDictionaries.en));

    useEffect(() => {
        if (language === 'en' && !loadedDictionaries.en) {
            let active = true;
            void loadEnglishDictionary().then(() => {
                if (active) setEnReady(true);
            });
            return () => {
                active = false;
            };
        }
    }, [language]);

    const activeDict = language === 'en' && loadedDictionaries.en
        ? loadedDictionaries.en
        : loadedDictionaries.vi;

    const t: TranslateFn = useCallback((path, params) => {
        const keys = path.split('.');
        let val = getValueFromDict(activeDict, keys);

        if (val === null && activeDict !== loadedDictionaries.vi) {
            val = getValueFromDict(loadedDictionaries.vi, keys);
        }

        const fallback = params?.defaultValue ?? path;
        let result = val ?? fallback;

        if (params) {
            for (const [key, paramVal] of Object.entries(params)) {
                if (key !== 'defaultValue') {
                    result = result.replaceAll(`{${key}}`, String(paramVal));
                }
            }
        }

        return result;
    }, [activeDict]);

    return { t, language, lang: language };
};
