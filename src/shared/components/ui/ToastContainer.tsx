import React from "react";
import { useToastStore, type ToastItem } from "@/shared/store/useToastStore";
import { CheckCircle as CheckCircle2, WarningCircle as AlertCircle, Warning as AlertTriangle, Info, X } from "@phosphor-icons/react";
import { cn } from "@/shared/utils/cn";

const getToastIcon = (type: ToastItem["type"]) => {
    switch (type) {
        case "success":
            return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
        case "error":
            return <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />;
        case "warning":
            return <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
        case "info":
        default:
            return <Info className="w-5 h-5 text-primary shrink-0" />;
    }
};

const getToastBorderColor = (type: ToastItem["type"]) => {
    switch (type) {
        case "success":
            return "border-emerald-500/30 bg-surface shadow-emerald-500/5";
        case "error":
            return "border-red-500/40 bg-surface shadow-red-500/5";
        case "warning":
            return "border-amber-500/30 bg-surface shadow-amber-500/5";
        case "info":
        default:
            return "border-primary/30 bg-surface shadow-primary/5";
    }
};

export const ToastContainer: React.FC = () => {
    const toasts = useToastStore((state) => state.toasts);
    const removeToast = useToastStore((state) => state.removeToast);

    if (toasts.length === 0) return null;

    return (
        <aside
            aria-label="Thông báo hệ thống"
            className="fixed bottom-5 right-5 z-[10000] flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0"
        >
            {toasts.map((item) => (
                <div
                    key={item.id}
                    role="alert"
                    aria-live="polite"
                    className={cn(
                        "pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-2",
                        getToastBorderColor(item.type)
                    )}
                >
                    <div className="mt-0.5">{getToastIcon(item.type)}</div>
                    <p className="flex-1 text-sm text-text font-medium leading-snug break-words">
                        {item.message}
                    </p>
                    <button
                        type="button"
                        onClick={() => removeToast(item.id)}
                        className="text-text-muted hover:text-text p-1 -mr-1 -mt-1 rounded-lg transition-colors cursor-pointer"
                        aria-label="Đóng thông báo"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </aside>
    );
};
