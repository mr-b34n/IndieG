import { useEffect, useState } from "react";
import { CircleNotch as Loader2 } from "@phosphor-icons/react";
import { useThemeStore } from "@/shared/store/useThemeStore";

/**
 * Displays a subtle, non-blocking status pill when the backend (Render Free tier)
 * takes >3.5s to respond while waking from cold start.
 */
export const BackendWakeBanner = () => {
    const [isWaking, setIsWaking] = useState(false);
    const language = useThemeStore((state) => state.language);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const handleWaking = () => setIsWaking(true);
        const handleReady = () => setIsWaking(false);

        window.addEventListener("ludon:backend-waking", handleWaking);
        window.addEventListener("ludon:backend-ready", handleReady);

        return () => {
            window.removeEventListener("ludon:backend-waking", handleWaking);
            window.removeEventListener("ludon:backend-ready", handleReady);
        };
    }, []);

    if (!isWaking) return null;

    return (
        <div
            role="status"
            aria-live="polite"
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[120] flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-surface border border-border-strong shadow-lg text-xs font-medium text-text animate-slide-up"
        >
            <Loader2 className="w-3.5 h-3.5 text-primary animate-spin shrink-0" />
            <span>
                {language === "en"
                    ? "Waking up server (free tier cold start, ~15–30s)..."
                    : "Máy chủ đang khởi động lại (khoảng 15–30 giây), vui lòng đợi..."}
            </span>
        </div>
    );
};
