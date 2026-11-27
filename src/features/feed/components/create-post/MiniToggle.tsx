import React from "react";

export interface MiniToggleProps {
    checked: boolean;
    onChange: (v: boolean) => void;
    ariaLabel?: string;
}

export const MiniToggle: React.FC<MiniToggleProps> = ({
    checked,
    onChange,
    ariaLabel,
}) => (
    <button
        type="button"
        role="switch"
        aria-label={ariaLabel}
        aria-checked={checked}
        onClick={(e) => {
            e.stopPropagation();
            onChange(!checked);
        }}
        className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full transition-colors duration-150 ease-in-out focus:outline-none focus:ring-1 focus:ring-primary/40 ${
            checked ? "bg-primary" : "bg-white/10 hover:bg-white/15"
        }`}
    >
        <span
            className={`pointer-events-none absolute top-0.5 left-0.5 h-3 w-3 rounded-full bg-white shadow-xs transition-transform duration-150 ease-in-out ${
                checked ? "translate-x-3" : "translate-x-0"
            }`}
        />
    </button>
);
