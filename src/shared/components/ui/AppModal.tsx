import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, type IconDefinition } from "@fortawesome/free-solid-svg-icons";

export type ModalVariant = "default" | "security" | "admin" | "danger";

export interface AppModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string | React.ReactNode;
    icon?: IconDefinition;
    variant?: ModalVariant;
    maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
    children: React.ReactNode;
    footer?: React.ReactNode;
}

const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
};

export const AppModal: React.FC<AppModalProps> = ({
    isOpen,
    onClose,
    title,
    subtitle,
    icon,
    variant = "default",
    maxWidth = "md",
    children,
    footer,
}) => {
    if (!isOpen) return null;

    // Accent styles per variant
    let accentBar: string;
    let iconBg: string;

    switch (variant) {
        case "security":
            accentBar = "bg-gradient-to-r from-[#FFA500] via-[#FFB020] to-[#FFA500]";
            iconBg = "bg-[rgba(255,165,0,0.08)] border border-[rgba(255,165,0,0.35)] text-[#FFB020]";
            break;
        case "admin":
            accentBar = "bg-gradient-to-r from-[#FF2D63] via-[#FF426D] to-[#FF2D63]";
            iconBg = "bg-[rgba(255,45,99,0.08)] border border-[rgba(255,45,99,0.35)] text-[#FF2D63]";
            break;
        case "danger":
            accentBar = "bg-gradient-to-r from-[#EF4444] via-[#F87171] to-[#EF4444]";
            iconBg = "bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.35)] text-[#EF4444]";
            break;
        default:
            accentBar = "bg-primary";
            iconBg = "bg-surface-inner border border-border text-text";
            break;
    }

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in font-sans"
            onClick={onClose}
        >
            <div
                className={`relative w-full ${maxWidthClasses[maxWidth]} bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-text animate-modal`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Accent Line at Top */}
                <div className={`h-[3px] w-full ${accentBar}`} />

                {/* Standardized Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        {icon && (
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg shadow-xs ${iconBg}`}>
                                <FontAwesomeIcon icon={icon} />
                            </div>
                        )}
                        <div className="min-w-0">
                            <h3 className="text-base font-black text-text uppercase tracking-tight truncate leading-tight">
                                {title}
                            </h3>
                            {subtitle && (
                                <p className="text-xs text-text-muted truncate font-medium mt-0.5">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-surface-inner text-text-muted hover:text-text hover:bg-surface-hover flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-3"
                    >
                        <FontAwesomeIcon icon={faXmark} className="text-sm" />
                    </button>
                </div>

                {/* Content Area */}
                <div className="p-6 overflow-y-auto custom-scrollbar space-y-4">
                    {children}
                </div>

                {/* Optional Footer */}
                {footer && (
                    <div className="px-6 py-4 border-t border-border bg-surface-inner shrink-0 flex items-center justify-end gap-3">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};
