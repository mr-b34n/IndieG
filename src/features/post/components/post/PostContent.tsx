import React, { useMemo, memo } from "react";
import { useTranslation } from "@/shared/hooks/useTranslate";
import { MarkdownContent, parseInlineMarkdown } from "@/shared/components/ui/MarkdownContent";

export interface PostContentProps {
    content?: string;
    isDetailView?: boolean;
    isExpanded: boolean;
    onExpand: (e: React.MouseEvent) => void;
    onCollapse?: (e: React.MouseEvent) => void;
}

export function getFacebookSnippet(text: string, maxLen = 220): string {
    const cleanLines = text
        .split(/\r?\n/)
        .map((l) => l.replace(/^#{1,6}\s+/, "").replace(/^>\s?/, "").replace(/^```\w*/, "").replace(/^[-*]\s+/, ""))
        .filter((l) => l.trim().length > 0);

    const firstTwo = cleanLines.slice(0, 2).join(" ");
    if (firstTwo.length <= maxLen && cleanLines.length <= 2) {
        return firstTwo;
    }
    const sliced = firstTwo.slice(0, maxLen);
    const lastSpace = sliced.lastIndexOf(" ");
    return (lastSpace > 140 ? sliced.slice(0, lastSpace) : sliced).trim();
}

export const PostContent = memo(({
    content,
    isDetailView = false,
    isExpanded,
    onExpand,
    onCollapse,
}: PostContentProps) => {
    const { t } = useTranslation();
    if (!content) return null;

    const isLong = useMemo(() => {
        const cleanLines = content
            .split(/\r?\n/)
            .filter((l) => l.trim().length > 0);
        return content.length > 220 || cleanLines.length > 2;
    }, [content]);

    const snippet = useMemo(() => {
        if (!isLong) return content;
        return getFacebookSnippet(content, 220);
    }, [content, isLong]);

    return (
        <div className="text-[14px] sm:text-[15px] leading-[1.45] text-text/90 font-normal break-words mb-3">
            {isDetailView || isExpanded ? (
                <div>
                    <MarkdownContent content={content} />
                    {!isDetailView && isLong && onCollapse && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onCollapse(e);
                            }}
                            className="block font-bold text-text-muted hover:text-text hover:underline cursor-pointer mt-2 text-xs sm:text-sm select-none"
                        >
                            {t('common.showLess', { defaultValue: 'Thu gọn' })}
                        </button>
                    )}
                </div>
            ) : (
                <div
                    className={isLong ? "cursor-pointer select-text" : ""}
                    onClick={(e) => {
                        if (isLong) {
                            e.stopPropagation();
                            onExpand(e);
                        }
                    }}
                >
                    <span>{parseInlineMarkdown(snippet)}</span>
                    {isLong && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onExpand(e);
                            }}
                            className="font-bold text-text hover:text-primary hover:underline cursor-pointer ml-1 inline text-[13px] sm:text-[14px] select-none"
                        >
                            ... {t('common.seeMore', { defaultValue: 'Xem thêm' })}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
});
