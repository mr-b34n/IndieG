export const DEACTIVATE_PHRASES = ['TAM NGUNG', 'DEACTIVATE'] as const;
export const DELETE_PHRASES = ['XOA TAI KHOAN', 'DELETE ACCOUNT'] as const;

/**
 * Validates whether the user's input confirmation text matches either
 * the Vietnamese or English confirmation phrase (case-insensitive, trimmed).
 */
export function isDangerConfirmationValid(
    type: 'deactivate' | 'delete' | null,
    inputText: string
): boolean {
    if (!type) return false;
    const normalized = inputText.trim().toUpperCase();
    if (type === 'deactivate') {
        return DEACTIVATE_PHRASES.some((phrase) => phrase === normalized);
    }
    if (type === 'delete') {
        return DELETE_PHRASES.some((phrase) => phrase === normalized);
    }
    return false;
}

/**
 * Returns the primary confirmation placeholder phrase for the current UI language.
 */
export function getExpectedConfirmationPhrase(
    type: 'deactivate' | 'delete' | null,
    language: string
): string {
    const isEn = language === 'en';
    if (type === 'deactivate') {
        return isEn ? 'DEACTIVATE' : 'TAM NGUNG';
    }
    if (type === 'delete') {
        return isEn ? 'DELETE ACCOUNT' : 'XOA TAI KHOAN';
    }
    return '';
}
