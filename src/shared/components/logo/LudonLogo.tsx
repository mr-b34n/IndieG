import React from "react";
import { cn } from "@/shared/utils/cn";

export interface LudonLogoProps {
    variant?: "mark" | "full";
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
    showText?: boolean;
    textClassName?: string;
    iconClassName?: string;
}

const sizeConfig = {
    sm: { icon: "w-5 h-5", text: "text-lg", gap: "gap-2" },
    md: { icon: "w-7 h-7", text: "text-xl", gap: "gap-2.5" },
    lg: { icon: "w-9 h-9", text: "text-2xl", gap: "gap-3" },
    xl: { icon: "w-12 h-12", text: "text-3xl", gap: "gap-3.5" },
};

/**
 * Geometric "L" brand icon component based on official vector logo.
 */
export const LudonLogoIcon: React.FC<{ className?: string }> = ({ className }) => {
    return (
        <svg
            viewBox="0 0 1000 1000"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            className={cn("w-full h-full shrink-0 select-none", className)}
            aria-hidden="true"
        >
            <polygon points="180.0,790.0 290.0,790.0 560.5,210.0 450.5,210.0" />
            <polygon points="332.0,790.0 757.0,790.0 799.9,698.0 374.9,698.0" />
        </svg>
    );
};

/**
 * Official Ludon Brand Logo component.
 * Can be used as mark only or full (icon + text).
 */
export const LudonLogo: React.FC<LudonLogoProps> = ({
    variant = "full",
    size = "md",
    className,
    showText,
    textClassName,
    iconClassName,
}) => {
    const isFull = showText !== undefined ? showText : variant === "full";
    const cfg = sizeConfig[size] || sizeConfig.md;

    return (
        <div className={cn("inline-flex items-center select-none", cfg.gap, className)}>
            <div className={cn(cfg.icon, "text-primary shrink-0 flex items-center justify-center", iconClassName)}>
                <LudonLogoIcon />
            </div>

            {isFull && (
                <span
                    className={cn(
                        cfg.text,
                        "font-black tracking-tight text-primary leading-none font-sans",
                        textClassName
                    )}
                >
                    Ludon
                </span>
            )}
        </div>
    );
};

export default LudonLogo;
