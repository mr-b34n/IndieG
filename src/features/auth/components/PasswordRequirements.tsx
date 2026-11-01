import React from "react";
import { Check, AlertCircle, Circle } from "lucide-react";
import { useTranslation } from "@/shared/hooks/useTranslate";
import { checkPasswordRequirements, type PasswordCheckResult } from "../helpers/passwordValidator";

export interface PasswordRequirementsProps {
    password?: string;
    checkResult?: PasswordCheckResult;
    className?: string;
}

export const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({
    password = "",
    checkResult,
    className = "",
}) => {
    const { t } = useTranslation();
    const res = checkResult ?? checkPasswordRequirements(password);

    return (
        <div className={`space-y-1.5 pt-1.5 text-[11px] select-none ${className}`}>
            {/* 1. At least 8 characters */}
            <div
                className={`flex items-center gap-2 transition-colors duration-150 ${
                    res.hasMinLength ? "text-emerald-500 font-medium" : "text-text-faint"
                }`}
            >
                {res.hasMinLength ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" strokeWidth={2.5} />
                ) : (
                    <Circle className="w-2 h-2 text-text-faint/50 shrink-0 mx-0.5 fill-current" />
                )}
                <span>
                    {t('auth.pwdRuleLength', { defaultValue: 'Ít nhất 8 ký tự' })}
                </span>
            </div>

            {/* 2. At least 1 uppercase & 1 lowercase letter */}
            <div
                className={`flex items-center gap-2 transition-colors duration-150 ${
                    res.hasUpperLower ? "text-emerald-500 font-medium" : "text-text-faint"
                }`}
            >
                {res.hasUpperLower ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" strokeWidth={2.5} />
                ) : (
                    <Circle className="w-2 h-2 text-text-faint/50 shrink-0 mx-0.5 fill-current" />
                )}
                <span>
                    {t('auth.pwdRuleCasing', { defaultValue: 'Ít nhất 1 chữ hoa và 1 chữ thường' })}
                </span>
            </div>

            {/* 3. At least 1 special character */}
            <div
                className={`flex items-center gap-2 transition-colors duration-150 ${
                    res.hasSpecialChar ? "text-emerald-500 font-medium" : "text-text-faint"
                }`}
            >
                {res.hasSpecialChar ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" strokeWidth={2.5} />
                ) : (
                    <Circle className="w-2 h-2 text-text-faint/50 shrink-0 mx-0.5 fill-current" />
                )}
                <span>
                    {t('auth.pwdRuleSpecial', { defaultValue: 'Ít nhất 1 ký tự đặc biệt (!@#...)' })}
                </span>
            </div>

            {/* 4. Max 72 characters - ONLY VISIBLE WHEN > 72 */}
            {res.isOverMax && (
                <div className="flex items-center gap-2 text-rose-500 font-semibold animate-fade-in pt-0.5">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" strokeWidth={2} />
                    <span>
                        {t('auth.pwdRuleMaxLength', {
                            defaultValue: 'Mật khẩu không được vượt quá 72 ký tự (hiện tại: {{count}})',
                            count: password.length,
                        })}
                    </span>
                </div>
            )}
        </div>
    );
};
