import type { User } from "@supabase/supabase-js";

export interface AuthState {
    user: User | null;
    loading: boolean;
    mockLogin: boolean;
    customAvatar: string | null;
    setCustomAvatar: (avatar: string | null) => void;
    initializeAuth: () => () => void;
    toggleMockLogin: () => void;
}

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
    isEmpty: boolean;
}
