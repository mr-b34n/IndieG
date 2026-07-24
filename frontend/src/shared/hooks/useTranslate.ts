// src/shared/hooks/useTranslation.ts

import { vi } from '../locales/vi';
import { en } from '../locales/en';
import { useThemeStore } from '../store/useThemeStore';

const dictionary = { vi, en };

export const useTranslation = () => {
    const language = useThemeStore((state) => state.language);

    // Hàm t("common.home") sẽ lấy chuỗi tương ứng
    const t = (path: string): string => {
        const keys = path.split('.');
        let current: any = dictionary[language] || dictionary.vi;

        for (const key of keys) {
            if (current && current[key] !== undefined) {
                current = current[key];
            } else {
                return path; // Nếu không tìm thấy key thì trả lại path gốc
            }
        }

        return current as string;
    };

    return { t, language };
};