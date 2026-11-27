import React from "react";
import { AppIcon as FontAwesomeIcon } from "@/shared/components/ui/Icon";
import { TextB as faBold, TextItalic as faItalic, TextStrikethrough as faStrikethrough, ListBullets as faListUl, Link as faLink, Quotes as faQuoteLeft, Image as faImage, Eye as faEye, EyeSlash as faEyeSlash } from "@phosphor-icons/react";
import { useTranslation } from "@/shared/hooks/useTranslate";

export interface FormattingToolbarProps {
    onFormat: (prefix: string, suffix?: string, placeholder?: string) => void;
    onAddImage?: () => void;
    showPreview?: boolean;
    onTogglePreview?: (show: boolean) => void;
}

export const FormattingToolbar: React.FC<FormattingToolbarProps> = ({
    onFormat,
    onAddImage,
    showPreview = true,
    onTogglePreview,
}) => {
    const { language } = useTranslation();
    const isVi = language === "vi";
    return (
        <div className="flex items-center justify-between gap-2 py-1 px-1.5 bg-surface-hover/40 border border-border/40 rounded-lg text-text-muted overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-1 shrink-0">
                <button
                    type="button"
                    onClick={() => onFormat("**", "**", isVi ? "in đậm" : "bold")}
                    title={isVi ? "In đậm (Bold)" : "Bold"}
                    className="w-7 h-7 rounded flex items-center justify-center hover:bg-surface-hover hover:text-text transition-colors text-xs font-bold cursor-pointer"
                >
                    <FontAwesomeIcon icon={faBold} />
                </button>
                <button
                    type="button"
                    onClick={() => onFormat("*", "*", isVi ? "nghiêng" : "italic")}
                    title={isVi ? "In nghiêng (Italic)" : "Italic"}
                    className="w-7 h-7 rounded flex items-center justify-center hover:bg-surface-hover hover:text-text transition-colors text-xs italic cursor-pointer"
                >
                    <FontAwesomeIcon icon={faItalic} />
                </button>
                <button
                    type="button"
                    onClick={() => onFormat("~~", "~~", isVi ? "gạch ngang" : "strikethrough")}
                    title={isVi ? "Gạch ngang (Strikethrough)" : "Strikethrough"}
                    className="w-7 h-7 rounded flex items-center justify-center hover:bg-surface-hover hover:text-text transition-colors text-xs cursor-pointer"
                >
                    <FontAwesomeIcon icon={faStrikethrough} />
                </button>
                <span className="w-[1px] h-3.5 bg-border/60 mx-0.5" />
                <button
                    type="button"
                    onClick={() => onFormat("\n- ", "", isVi ? "mục danh sách" : "list item")}
                    title={isVi ? "Danh sách (List)" : "List"}
                    className="w-7 h-7 rounded flex items-center justify-center hover:bg-surface-hover hover:text-text transition-colors text-xs cursor-pointer"
                >
                    <FontAwesomeIcon icon={faListUl} />
                </button>
                <button
                    type="button"
                    onClick={() => onFormat("[", "](https://)", isVi ? "tiêu đề liên kết" : "link title")}
                    title={isVi ? "Gắn liên kết (Link)" : "Link"}
                    className="w-7 h-7 rounded flex items-center justify-center hover:bg-surface-hover hover:text-text transition-colors text-xs cursor-pointer"
                >
                    <FontAwesomeIcon icon={faLink} />
                </button>
                <button
                    type="button"
                    onClick={() => onFormat("\n> ", "", isVi ? "trích dẫn" : "quote")}
                    title={isVi ? "Trích dẫn (Quote)" : "Quote"}
                    className="w-7 h-7 rounded flex items-center justify-center hover:bg-surface-hover hover:text-text transition-colors text-xs cursor-pointer"
                >
                    <FontAwesomeIcon icon={faQuoteLeft} />
                </button>
                {onAddImage && (
                    <>
                        <span className="w-[1px] h-3.5 bg-border/60 mx-0.5" />
                        <button
                            type="button"
                            onClick={onAddImage}
                            title={isVi ? "Tải lên hình ảnh" : "Upload image"}
                            className="w-7 h-7 rounded flex items-center justify-center hover:bg-surface-hover hover:text-text transition-colors text-xs cursor-pointer"
                        >
                            <FontAwesomeIcon icon={faImage} />
                        </button>
                    </>
                )}
            </div>

            {onTogglePreview && (
                <button
                    type="button"
                    onClick={() => onTogglePreview(!showPreview)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer border ml-auto ${
                        showPreview
                            ? "bg-primary/10 border-primary/30 text-primary"
                            : "bg-surface-hover/60 border-border/40 text-text-muted hover:text-text"
                    }`}
                >
                    <FontAwesomeIcon icon={showPreview ? faEye : faEyeSlash} className="text-[10px]" />
                    <span>{showPreview ? (isVi ? "Xem trước: Bật" : "Preview: On") : (isVi ? "Xem trước: Tắt" : "Preview: Off")}</span>
                </button>
            )}
        </div>
    );
};
