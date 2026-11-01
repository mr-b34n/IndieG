
import { useDocumentTitle } from './useDocumentTitle';

export const useTheme = (title: string) => {
    useDocumentTitle(title === 'Home' ? null : title);
};