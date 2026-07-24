
export interface ValidationRule {
    id: string;
    label: string;
    isMet: boolean;
}

export interface PasswordStrengthConfig {
    label: string;
    color: string;
    bg: string;
}

export interface PasswordValidationResult {
    requirements: ValidationRule[];
    score: number;
    isAllValid: boolean;
    strengthConfig: PasswordStrengthConfig;
    isEmpty: boolean
}

export const STRENGTH_LEVELS: Record<number, PasswordStrengthConfig> = {
    1: { label: "Weak", color: "text-red-600", bg: "bg-red-600" },
    2: { label: "Fair", color: "text-amber-500", bg: "bg-amber-500" },
    3: { label: "Good", color: "text-yellow-400", bg: "bg-yellow-400" },
    4: { label: "Strong", color: "text-emerald-500", bg: "bg-emerald-500" },
};

export const validatePassword = async (password: string): Promise<PasswordValidationResult> => {

    const {default: zxcvbn} = await import('zxcvbn');

    const rules = [
        { id: 'length', label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
        { id: 'uppercase', label: 'Contains uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
        { id: 'lowercase', label: 'Contains lowercase letter', test: (p: string) => /[a-z]/.test(p) },
        { id: 'number', label: 'Contains a number', test: (p: string) => /\d/.test(p) },
        { id: 'special', label: 'Contains a special character', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
    ];

    const requirements: ValidationRule[] = rules.map((rule) => ({
        id: rule.id,
        label: rule.label,
        isMet: rule.test(password),
    }));

    const zxcvbnResult = zxcvbn(password);

    const normalizedScore = zxcvbnResult.score <= 1 ? 1 : zxcvbnResult.score;

    return {
        requirements,
        isEmpty: password.length < 1,
        score: zxcvbnResult.score,
        isAllValid: requirements.every((r) => r.isMet),
        strengthConfig: STRENGTH_LEVELS[normalizedScore as keyof typeof STRENGTH_LEVELS]
    };
};
