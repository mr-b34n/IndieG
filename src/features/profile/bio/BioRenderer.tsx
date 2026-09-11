import React, { useMemo } from "react";
import type { BioDocument } from "./types";
import { parseBio, isBioEmpty, getBioFontClass, getBioColorClass } from "./utils";

interface BioRendererProps {
    bio?: string | BioDocument | null;
    emptyPlaceholder?: string;
    className?: string;
}

export const BioRenderer: React.FC<BioRendererProps> = ({
    bio,
    emptyPlaceholder = "Chưa có tiểu sử.",
    className = "",
}) => {
    const document: BioDocument = useMemo(() => {
        if (bio && typeof bio === "object" && "version" in bio) {
            return bio;
        }
        return parseBio(typeof bio === "string" ? bio : undefined);
    }, [bio]);

    if (isBioEmpty(document)) {
        return (
            <div className={`py-1 text-center ${className}`}>
                <p className="text-xs text-[#666A71] italic">{emptyPlaceholder}</p>
            </div>
        );
    }

    return (
        <div className={`flex flex-col gap-1.5 py-1 ${className}`}>
            {document.blocks.map((block, blockIndex) => {
                const alignClass =
                    block.align === "center"
                        ? "text-center"
                        : block.align === "right"
                        ? "text-right"
                        : "text-left";

                const isLineEmpty = block.spans.every((s) => !s.text);

                return (
                    <div
                        key={blockIndex}
                        className={`min-h-[1.25rem] leading-relaxed break-words ${alignClass}`}
                    >
                        {isLineEmpty ? (
                            <span className="inline-block">&nbsp;</span>
                        ) : (
                            block.spans.map((span, spanIndex) => {
                                const fontClass = getBioFontClass(span.font);
                                const colorClass = getBioColorClass(span.color);
                                const boldClass = span.bold ? "font-bold" : "font-normal";
                                const italicClass = span.italic ? "italic" : "";
                                const strikeClass = span.strikethrough ? "line-through" : "";

                                return (
                                    <span
                                        key={spanIndex}
                                        className={`transition-colors ${fontClass} ${colorClass} ${boldClass} ${italicClass} ${strikeClass}`}
                                    >
                                        {span.text}
                                    </span>
                                );
                            })
                        )}
                    </div>
                );
            })}
        </div>
    );
};
