import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation, faShieldHalved } from "@fortawesome/free-solid-svg-icons";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "@/shared/hooks/useTranslate";

export const UnverifiedBanner: React.FC = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const { t } = useTranslation();

    if (!user || user.isVerified) return null;

    return (
        <div className="w-full bg-amber-950/80 border-b border-amber-500/40 text-amber-200 px-3 sm:px-6 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs backdrop-blur-md z-[80] select-none">
            <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30 shrink-0">
                    <FontAwesomeIcon icon={faTriangleExclamation} />
                    <span>{t('auth.unverifiedBannerBadge', { defaultValue: 'EMAIL CHƯA XÁC THỰC' })}</span>
                </span>
                <span className="text-amber-100/90 leading-tight">
                    {t('auth.unverifiedBannerText', { defaultValue: 'Tài khoản của bạn chưa được xác minh. Vui lòng xác thực email để mở khóa đầy đủ tính năng.' })}
                </span>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                <button
                    type="button"
                    onClick={() => navigate({ to: "/settings", search: { tab: "account" } as Record<string, unknown> })}
                    className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded text-xs transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                    <FontAwesomeIcon icon={faShieldHalved} />
                    <span>{t('auth.verifyNow', { defaultValue: 'Xác thực ngay' })}</span>
                </button>
            </div>
        </div>
    );
};
