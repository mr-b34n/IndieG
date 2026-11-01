import React, { useEffect } from "react";
import { X } from "lucide-react";
import { useThemeStore } from "@/shared/store/useThemeStore";
import { LEGAL_DOCS, type LegalDocType } from "@/shared/constants/legal";

export interface LegalModalProps {
    isOpen: boolean;
    onClose: () => void;
    docType?: LegalDocType;
}

export const LegalModal: React.FC<LegalModalProps> = ({
    isOpen,
    onClose,
    docType = "terms",
}) => {
    const language = useThemeStore((state) => state.language);
    const isVi = language === "vi";

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const docs = LEGAL_DOCS[isVi ? "vi" : "en"];
    const doc = docs[docType];

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-fade-in font-sans"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div
                className="relative w-full max-w-2xl bg-surface border border-border/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-text"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header: Title only and single 'X' button */}
                <div className="px-5 py-3.5 border-b border-border/60 flex items-center justify-between shrink-0 bg-surface-inner/50">
                    <h2 className="text-base font-bold text-text">
                        {doc.title}
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label={isVi ? "Đóng" : "Close"}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-hover transition-colors cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Content: Sections directly without intro */}
                <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs text-text-muted leading-relaxed">
                    {doc.sections.map((section) => (
                        <div key={section.id} className="space-y-1.5">
                            <h3 className="font-bold text-text text-sm flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                <span>{section.title}</span>
                            </h3>
                            <div className="space-y-1.5 pl-3.5 border-l-2 border-border/60">
                                {section.content.map((paragraph, index) => (
                                    <p key={index} className="text-text-muted">
                                        {paragraph}
                                    </p>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
