
import { type ValidationRule, type PasswordValidationResult } from "../types";
import { STRENGTH_LEVELS } from "../constants";

export * from "../types";
export * from "../constants";

export interface PasswordCheckResult {
    hasMinLength: boolean;
    hasUpperLower: boolean;
    hasSpecialChar: boolean;
    isOverMax: boolean;
    isValid: boolean;
}

export function checkPasswordRequirements(password: string = ""): PasswordCheckResult {
    const hasMinLength = password.length >= 8;
    const hasUpperLower = /[A-Z]/.test(password) && /[a-z]/.test(password);
    const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
    const isOverMax = password.length > 72;

    return {
        hasMinLength,
        hasUpperLower,
        hasSpecialChar,
        isOverMax,
        isValid: hasMinLength && hasUpperLower && hasSpecialChar && !isOverMax,
    };
}

export const validatePassword = async (password: string): Promise<PasswordValidationResult> => {
    const check = checkPasswordRequirements(password);

    const rules = [
        { id: 'length', label: 'At least 8 characters', isMet: check.hasMinLength },
        { id: 'casing', label: 'Contains uppercase and lowercase letters', isMet: check.hasUpperLower },
        { id: 'special', label: 'Contains a special character (!@#...)', isMet: check.hasSpecialChar },
    ];

    if (check.isOverMax) {
        rules.push({
            id: 'maxLength',
            label: 'Maximum 72 characters',
            isMet: false,
        });
    }

    const requirements: ValidationRule[] = rules.map((rule) => ({
        id: rule.id,
        label: rule.label,
        isMet: rule.isMet,
    }));

    let score = 0;
    if (check.hasMinLength) score += 1;
    if (check.hasUpperLower) score += 1;
    if (check.hasSpecialChar) score += 1;
    if (!check.isOverMax && check.isValid) score += 1;
    const normalizedScore = score <= 1 ? 1 : score;

    return {
        requirements,
        isEmpty: password.length < 1,
        score,
        isAllValid: check.isValid,
        strengthConfig: STRENGTH_LEVELS[normalizedScore as keyof typeof STRENGTH_LEVELS] || STRENGTH_LEVELS[1],
    };
};
