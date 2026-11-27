import React, { useState, useRef } from "react";
import { AppIcon as FontAwesomeIcon } from "@/shared/components/ui/Icon";
import { X as faXmark } from "@phosphor-icons/react";
import { useTranslation } from "@/shared/hooks/useTranslate";

export interface TagsInputProps {
    tags: string[];
    onChange: (tags: string[]) => void;
}

export const TagsInput: React.FC<TagsInputProps> = ({
    tags,
    onChange,
}) => {
    const { t } = useTranslation();
    const [inputValue, setInputValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const addTag = (raw: string) => {
        const cleaned = raw
            .trim()
            .replace(/^#+/, "")
            .replace(/[, ]+/g, "")
            .toLowerCase();
        if (!cleaned) return;
        if (!tags.includes(cleaned) && tags.length < 10) {
            onChange([...tags, cleaned]);
        }
        setInputValue("");
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === "," || e.key === " ") {
            e.preventDefault();
            addTag(inputValue);
        } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
            e.preventDefault();
            onChange(tags.slice(0, -1));
        }
    };

    const handleBlur = () => {
        if (inputValue.trim()) {
            addTag(inputValue);
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        const text = e.clipboardData.getData("text");
        if (text && (text.includes(",") || text.includes(" ") || text.includes("#"))) {
            e.preventDefault();
            const items = text
                .split(/[, \s]+/)
                .map((s) => s.trim().replace(/^#+/, "").toLowerCase())
                .filter(Boolean);
            const merged = Array.from(new Set([...tags, ...items])).slice(0, 10);
            onChange(merged);
            setInputValue("");
        }
    };

    const removeTag = (tagToRemove: string) => {
        onChange(tags.filter((t) => t !== tagToRemove));
    };

    return (
        <div
            onClick={() => inputRef.current?.focus()}
            className="flex flex-wrap items-center gap-1.5 py-0.5 cursor-text"
        >
            {tags.map((tag) => (
                <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium text-text-muted hover:text-text bg-white/[0.04] hover:bg-white/[0.08] transition-colors group select-none animate-fade-in"
                >
                    <span className="text-primary/70 font-semibold">#</span>
                    <span>{tag}</span>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            removeTag(tag);
                        }}
                        className="text-text-faint group-hover:text-text-muted hover:text-rose-400 p-0.5 rounded cursor-pointer transition-colors"
                        title="Remove tag"
                    >
                        <FontAwesomeIcon icon={faXmark} className="text-[9px]" />
                    </button>
                </span>
            ))}
            <input
                ref={inputRef}
                type="text"
                value={inputValue}
                spellCheck={false}
                autoCorrect="off"
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                onPaste={handlePaste}
                placeholder={
                    tags.length === 0
                        ? t('feed.tagsPlaceholder', { defaultValue: 'Thêm thẻ...' })
                        : t('feed.addMoreTags', { defaultValue: '+ thẻ' })
                }
                className="bg-transparent border-none outline-none text-xs text-text placeholder:text-text-faint/35 min-w-[90px] flex-1 py-0.5 focus:ring-0"
            />
        </div>
    );
};
