import type { BioDocument, BioBlock, BioSpan, BioFont, BioColor, BioAlign } from "./types";
import { BIO_FONTS, BIO_COLORS } from "./constants";

export const VALID_FONTS: Set<BioFont> = new Set(["inter", "serif", "mono", "pixel", "gothic", "fantasy"]);
export const VALID_COLORS: Set<BioColor> = new Set(["default", "muted", "accent", "highlight"]);
export const VALID_ALIGNS: Set<BioAlign> = new Set(["left", "center", "right"]);

/**
 * Creates an empty default BioDocument
 */
export function createDefaultBioDocument(): BioDocument {
    return {
        version: 1,
        blocks: [
            {
                type: "paragraph",
                align: "left",
                spans: [
                    {
                        text: "",
                        font: "inter",
                        bold: false,
                        italic: false,
                        strikethrough: false,
                        color: "default",
                    },
                ],
            },
        ],
    };
}

/**
 * Parses any incoming bio string (structured JSONB string or legacy plain text)
 * into a strictly validated BioDocument.
 */
export function parseBio(rawBio?: string | null): BioDocument {
    if (!rawBio || typeof rawBio !== "string" || !rawBio.trim()) {
        return createDefaultBioDocument();
    }

    const trimmed = rawBio.trim();

    // Check if it might be JSON
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
        try {
            const parsed = JSON.parse(trimmed) as unknown;
            if (
                parsed &&
                typeof parsed === "object" &&
                "version" in parsed &&
                (parsed as { version: number }).version === 1 &&
                "blocks" in parsed &&
                Array.isArray((parsed as { blocks: unknown[] }).blocks)
            ) {
                const validatedBlocks: BioBlock[] = [];
                for (const rawBlock of (parsed as { blocks: unknown[] }).blocks) {
                    if (!rawBlock || typeof rawBlock !== "object") continue;
                    const b = rawBlock as Record<string, unknown>;
                    if (b.type !== "paragraph") continue;

                    const align: BioAlign = VALID_ALIGNS.has(b.align as BioAlign)
                        ? (b.align as BioAlign)
                        : "left";

                    const spans: BioSpan[] = [];
                    if (Array.isArray(b.spans)) {
                        for (const rawSpan of b.spans) {
                            if (!rawSpan || typeof rawSpan !== "object") continue;
                            const s = rawSpan as Record<string, unknown>;
                            if (typeof s.text !== "string") continue;

                            const font: BioFont = VALID_FONTS.has(s.font as BioFont)
                                ? (s.font as BioFont)
                                : "inter";
                            const color: BioColor = VALID_COLORS.has(s.color as BioColor)
                                ? (s.color as BioColor)
                                : "default";

                            spans.push({
                                text: String(s.text),
                                font,
                                color,
                                bold: Boolean(s.bold),
                                italic: Boolean(s.italic),
                                strikethrough: Boolean(s.strikethrough),
                            });
                        }
                    }

                    if (spans.length === 0) {
                        spans.push({
                            text: "",
                            font: "inter",
                            color: "default",
                        });
                    }

                    validatedBlocks.push({
                        type: "paragraph",
                        align,
                        spans,
                    });
                }

                if (validatedBlocks.length > 0) {
                    return {
                        version: 1,
                        blocks: validatedBlocks,
                    };
                }
            }
        } catch {
            // Fall through to plain text parsing
        }
    }

    // Legacy plain text handling: split by newline into paragraphs
    const lines = rawBio.split("\n");
    const blocks: BioBlock[] = lines.map((line) => ({
        type: "paragraph",
        align: "left",
        spans: [
            {
                text: line,
                font: "inter",
                bold: false,
                italic: false,
                strikethrough: false,
                color: "default",
            },
        ],
    }));

    return {
        version: 1,
        blocks: blocks.length > 0 ? blocks : createDefaultBioDocument().blocks,
    };
}

/**
 * Serializes BioDocument to clean JSON string
 */
export function serializeBio(doc: BioDocument): string {
    return JSON.stringify(doc);
}

/**
 * Calculates total character count across all spans in the document
 */
export function getBioCharacterCount(doc: BioDocument): number {
    let count = 0;
    for (const block of doc.blocks) {
        for (const span of block.spans) {
            count += span.text.length;
        }
    }
    return count;
}

/**
 * Checks if a BioDocument is considered visually empty
 */
export function isBioEmpty(doc: BioDocument): boolean {
    return doc.blocks.every((b) => b.spans.every((s) => !s.text.trim()));
}

/**
 * Resolves font class for BioSpan
 */
export function getBioFontClass(font?: BioFont): string {
    const found = BIO_FONTS.find((f) => f.value === font);
    return found ? found.className : "font-bio-inter";
}

/**
 * Resolves color class for BioSpan
 */
export function getBioColorClass(color?: BioColor): string {
    const found = BIO_COLORS.find((c) => c.value === color);
    return found ? found.textClass : "text-[#F0F1F2]";
}

/**
 * Escapes HTML characters for safe innerHTML generation
 */
export function escapeHtml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * Converts a validated BioDocument into an editable HTML structure
 * that exactly mimics the rendered profile and supports contentEditable.
 */
export function bioDocumentToHtml(doc: BioDocument): string {
    if (!doc.blocks || doc.blocks.length === 0) {
        return `<div data-block="true" data-block-idx="0" data-align="left" class="min-h-[1.35rem] leading-relaxed break-words text-left"><span data-font="inter" data-color="default" data-bold="false" data-italic="false" data-strike="false" class="font-bio-inter text-bio-default font-normal"><br></span></div>`;
    }

    return doc.blocks
        .map((block, bIdx) => {
            const align = VALID_ALIGNS.has(block.align as BioAlign) ? (block.align as BioAlign) : "left";
            const alignCls =
                align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";

            const spans = block.spans && block.spans.length > 0
                ? block.spans
                : [{ text: "", font: "inter" as BioFont, color: "default" as BioColor }];

            const spansHtml = spans
                .map((span) => {
                    const font = VALID_FONTS.has(span.font as BioFont) ? (span.font as BioFont) : "inter";
                    const color = VALID_COLORS.has(span.color as BioColor) ? (span.color as BioColor) : "default";
                    const fontCls = getBioFontClass(font);
                    const colorCls = getBioColorClass(color);
                    const boldCls = span.bold ? "font-bold" : "font-normal";
                    const italicCls = span.italic ? "italic" : "";
                    const strikeCls = span.strikethrough ? "line-through" : "";

                    const escaped = escapeHtml(span.text);
                    const inner = escaped || (spans.length === 1 ? "<br>" : "");

                    return `<span data-font="${font}" data-color="${color}" data-bold="${Boolean(span.bold)}" data-italic="${Boolean(span.italic)}" data-strike="${Boolean(span.strikethrough)}" class="${fontCls} ${colorCls} ${boldCls} ${italicCls} ${strikeCls} transition-colors">${inner}</span>`;
                })
                .join("");

            return `<div data-block="true" data-block-idx="${bIdx}" data-align="${align}" class="min-h-[1.35rem] leading-relaxed break-words ${alignCls}">${spansHtml || "<br>"}</div>`;
        })
        .join("");
}

/**
 * Parses the contentEditable DOM structure back into a validated BioDocument
 */
export function domToBioDocument(container: HTMLElement): BioDocument {
    const blocks: BioBlock[] = [];
    const childNodes = Array.from(container.childNodes);
    const blockElements: HTMLElement[] = [];

    for (const node of childNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) {
            blockElements.push(node as HTMLElement);
        } else if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
            const div = document.createElement("div");
            div.textContent = node.textContent;
            blockElements.push(div);
        }
    }

    if (blockElements.length === 0) {
        return createDefaultBioDocument();
    }

    for (const el of blockElements) {
        let align: BioAlign = "left";
        const dataAlign = el.getAttribute("data-align");
        if (dataAlign && VALID_ALIGNS.has(dataAlign as BioAlign)) {
            align = dataAlign as BioAlign;
        } else if (el.classList.contains("text-center") || el.style.textAlign === "center") {
            align = "center";
        } else if (el.classList.contains("text-right") || el.style.textAlign === "right") {
            align = "right";
        }

        const spans: BioSpan[] = [];
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        let currentTextNode: Node | null = walker.nextNode();

        while (currentTextNode) {
            const rawText = currentTextNode.textContent || "";
            if (rawText) {
                let font: BioFont = "inter";
                let color: BioColor = "default";
                let bold = false;
                let italic = false;
                let strikethrough = false;

                let curr: HTMLElement | null = currentTextNode.parentElement;
                while (curr && curr !== el && el.contains(curr)) {
                    const dFont = curr.getAttribute("data-font");
                    if (dFont && VALID_FONTS.has(dFont as BioFont)) {
                        font = dFont as BioFont;
                    } else {
                        for (const f of VALID_FONTS) {
                            if (curr.classList.contains(`font-bio-${f}`)) font = f;
                        }
                    }

                    const dColor = curr.getAttribute("data-color");
                    if (dColor && VALID_COLORS.has(dColor as BioColor)) {
                        color = dColor as BioColor;
                    } else {
                        for (const c of VALID_COLORS) {
                            if (curr.classList.contains(`text-bio-${c}`)) color = c;
                        }
                    }

                    if (
                        curr.getAttribute("data-bold") === "true" ||
                        curr.classList.contains("font-bold") ||
                        curr.tagName === "B" ||
                        curr.tagName === "STRONG"
                    ) {
                        bold = true;
                    }

                    if (
                        curr.getAttribute("data-italic") === "true" ||
                        curr.classList.contains("italic") ||
                        curr.tagName === "I" ||
                        curr.tagName === "EM"
                    ) {
                        italic = true;
                    }

                    if (
                        curr.getAttribute("data-strike") === "true" ||
                        curr.classList.contains("line-through") ||
                        curr.tagName === "S" ||
                        curr.tagName === "STRIKE" ||
                        curr.tagName === "DEL"
                    ) {
                        strikethrough = true;
                    }

                    curr = curr.parentElement;
                }

                spans.push({
                    text: rawText.replace(/\u00a0/g, " "),
                    font,
                    color,
                    bold,
                    italic,
                    strikethrough,
                });
            }
            currentTextNode = walker.nextNode();
        }

        // Merge adjacent spans with identical formatting
        const mergedSpans: BioSpan[] = [];
        for (const span of spans) {
            const prev = mergedSpans[mergedSpans.length - 1];
            if (
                prev &&
                prev.font === span.font &&
                prev.color === span.color &&
                Boolean(prev.bold) === Boolean(span.bold) &&
                Boolean(prev.italic) === Boolean(span.italic) &&
                Boolean(prev.strikethrough) === Boolean(span.strikethrough)
            ) {
                prev.text += span.text;
            } else {
                mergedSpans.push({ ...span });
            }
        }

        if (mergedSpans.length === 0) {
            mergedSpans.push({
                text: "",
                font: "inter",
                color: "default",
            });
        }

        blocks.push({
            type: "paragraph",
            align,
            spans: mergedSpans,
        });
    }

    return {
        version: 1,
        blocks: blocks.length > 0 ? blocks : createDefaultBioDocument().blocks,
    };
}

export interface SelectionOffsets {
    startBlockIdx: number;
    startOffset: number;
    endBlockIdx: number;
    endOffset: number;
}

/**
 * Calculates block indices and character offsets from current window.getSelection()
 */
export function getSelectionOffsets(container: HTMLElement): SelectionOffsets | null {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    const range = sel.getRangeAt(0);

    if (!container.contains(range.startContainer) || !container.contains(range.endContainer)) {
        return null;
    }

    const blocks = Array.from(container.querySelectorAll<HTMLElement>("[data-block='true']"));
    if (blocks.length === 0) return null;

    const findBlockAndOffset = (node: Node, offset: number) => {
        let blockEl: HTMLElement | null = null;
        let curr: Node | null = node;
        while (curr && curr !== container) {
            if (curr.nodeType === Node.ELEMENT_NODE && (curr as HTMLElement).getAttribute("data-block") === "true") {
                blockEl = curr as HTMLElement;
                break;
            }
            curr = curr.parentNode;
        }

        if (!blockEl) {
            blockEl = blocks[0];
        }

        const blockIdx = Math.max(0, blocks.indexOf(blockEl));

        // Compute char offset within this block element
        let charOffset = 0;
        const walker = document.createTreeWalker(blockEl, NodeFilter.SHOW_TEXT);
        let textNode: Node | null = walker.nextNode();
        while (textNode) {
            if (textNode === node) {
                return { blockIdx, charOffset: charOffset + offset };
            }
            charOffset += textNode.textContent?.length || 0;
            textNode = walker.nextNode();
        }

        return { blockIdx, charOffset };
    };

    const start = findBlockAndOffset(range.startContainer, range.startOffset);
    const end = findBlockAndOffset(range.endContainer, range.endOffset);

    // Normalize so start <= end
    if (start.blockIdx > end.blockIdx || (start.blockIdx === end.blockIdx && start.charOffset > end.charOffset)) {
        return {
            startBlockIdx: end.blockIdx,
            startOffset: end.charOffset,
            endBlockIdx: start.blockIdx,
            endOffset: start.charOffset,
        };
    }

    return {
        startBlockIdx: start.blockIdx,
        startOffset: start.charOffset,
        endBlockIdx: end.blockIdx,
        endOffset: end.charOffset,
    };
}

/**
 * Restores selection in container based on block index and character offset
 */
export function restoreSelectionInContainer(container: HTMLElement, offsets: SelectionOffsets) {
    const blocks = Array.from(container.querySelectorAll<HTMLElement>("[data-block='true']"));
    const startBlock = blocks[offsets.startBlockIdx];
    const endBlock = blocks[offsets.endBlockIdx];
    if (!startBlock || !endBlock) return;

    const findTextNodeAtOffset = (blockEl: HTMLElement, targetOffset: number) => {
        let current = 0;
        const walker = document.createTreeWalker(blockEl, NodeFilter.SHOW_TEXT);
        let textNode: Node | null = walker.nextNode();
        let lastNode: Node | null = null;
        while (textNode) {
            lastNode = textNode;
            const len = textNode.textContent?.length || 0;
            if (current + len >= targetOffset) {
                return { node: textNode, offset: Math.max(0, targetOffset - current) };
            }
            current += len;
            textNode = walker.nextNode();
        }
        if (lastNode) {
            return { node: lastNode, offset: lastNode.textContent?.length || 0 };
        }
        const spanOrBr = blockEl.querySelector("span") || blockEl;
        return { node: spanOrBr, offset: 0 };
    };

    const startPos = findTextNodeAtOffset(startBlock, offsets.startOffset);
    const endPos = findTextNodeAtOffset(endBlock, offsets.endOffset);

    const sel = window.getSelection();
    if (sel && startPos && endPos) {
        sel.removeAllRanges();
        const newRange = document.createRange();
        try {
            newRange.setStart(startPos.node, startPos.offset);
            newRange.setEnd(endPos.node, endPos.offset);
            sel.addRange(newRange);
        } catch {
            // Fallback safety
        }
    }
}

/**
 * Deletes text in selected range from BioDocument
 */
export function deleteSelectionFromDocument(
    doc: BioDocument,
    offsets: SelectionOffsets
): { newDoc: BioDocument; collapsedOffsets: SelectionOffsets } {
    if (
        offsets.startBlockIdx === offsets.endBlockIdx &&
        offsets.startOffset === offsets.endOffset
    ) {
        return { newDoc: doc, collapsedOffsets: offsets };
    }

    const { startBlockIdx, startOffset, endBlockIdx, endOffset } = offsets;
    const startBlock = doc.blocks[startBlockIdx];
    const endBlock = doc.blocks[endBlockIdx];

    if (!startBlock || !endBlock) {
        return { newDoc: doc, collapsedOffsets: offsets };
    }

    if (startBlockIdx === endBlockIdx) {
        // Range inside a single block
        const newSpans: BioSpan[] = [];
        let curr = 0;
        for (const span of startBlock.spans) {
            const len = span.text.length;
            const spanStart = curr;
            const spanEnd = curr + len;

            if (spanEnd <= startOffset || spanStart >= endOffset) {
                newSpans.push({ ...span });
            } else if (spanStart >= startOffset && spanEnd <= endOffset) {
                // Omit
            } else {
                let keepText = "";
                if (spanStart < startOffset) {
                    keepText += span.text.slice(0, startOffset - spanStart);
                }
                if (spanEnd > endOffset) {
                    keepText += span.text.slice(endOffset - spanStart);
                }
                if (keepText) {
                    newSpans.push({ ...span, text: keepText });
                }
            }
            curr += len;
        }

        if (newSpans.length === 0) {
            newSpans.push({
                text: "",
                font: startBlock.spans[0]?.font || "inter",
                color: startBlock.spans[0]?.color || "default",
            });
        }

        const newBlocks = [
            ...doc.blocks.slice(0, startBlockIdx),
            { ...startBlock, spans: newSpans },
            ...doc.blocks.slice(startBlockIdx + 1),
        ];

        const collapsedOffsets: SelectionOffsets = {
            startBlockIdx,
            startOffset,
            endBlockIdx: startBlockIdx,
            endOffset: startOffset,
        };

        return { newDoc: { version: 1, blocks: newBlocks }, collapsedOffsets };
    }

    // Spans multiple blocks
    const startSpans: BioSpan[] = [];
    let currStart = 0;
    for (const span of startBlock.spans) {
        const len = span.text.length;
        if (currStart + len <= startOffset) {
            startSpans.push({ ...span });
        } else if (currStart < startOffset) {
            startSpans.push({ ...span, text: span.text.slice(0, startOffset - currStart) });
        }
        currStart += len;
    }

    const endSpans: BioSpan[] = [];
    let currEnd = 0;
    for (const span of endBlock.spans) {
        const len = span.text.length;
        if (currEnd >= endOffset) {
            endSpans.push({ ...span });
        } else if (currEnd + len > endOffset) {
            endSpans.push({ ...span, text: span.text.slice(endOffset - currEnd) });
        }
        currEnd += len;
    }

    const mergedSpans = [...startSpans, ...endSpans];
    if (mergedSpans.length === 0) {
        mergedSpans.push({
            text: "",
            font: startBlock.spans[0]?.font || "inter",
            color: startBlock.spans[0]?.color || "default",
        });
    }

    const newBlocks = [
        ...doc.blocks.slice(0, startBlockIdx),
        { ...startBlock, spans: mergedSpans },
        ...doc.blocks.slice(endBlockIdx + 1),
    ];

    const collapsedOffsets: SelectionOffsets = {
        startBlockIdx,
        startOffset,
        endBlockIdx: startBlockIdx,
        endOffset: startOffset,
    };

    return { newDoc: { version: 1, blocks: newBlocks }, collapsedOffsets };
}

/**
 * Splits a block at selection offsets into two paragraphs.
 */
export function splitBlockAtSelection(
    doc: BioDocument,
    offsets: SelectionOffsets
): { newDoc: BioDocument; newSelection: SelectionOffsets } {
    const { newDoc: collapsedDoc, collapsedOffsets } = deleteSelectionFromDocument(doc, offsets);

    const bIdx = Math.min(Math.max(0, collapsedOffsets.startBlockIdx), collapsedDoc.blocks.length - 1);
    const targetBlock = collapsedDoc.blocks[bIdx] || { type: "paragraph", align: "left", spans: [] };
    const charOffset = collapsedOffsets.startOffset;

    const leftSpans: BioSpan[] = [];
    const rightSpans: BioSpan[] = [];

    let currentOffset = 0;
    let splitFont: BioFont = "inter";
    let splitColor: BioColor = "default";
    let splitBold = false;
    let splitItalic = false;
    let splitStrike = false;

    for (const span of targetBlock.spans) {
        const len = span.text.length;
        splitFont = span.font || "inter";
        splitColor = span.color || "default";
        splitBold = Boolean(span.bold);
        splitItalic = Boolean(span.italic);
        splitStrike = Boolean(span.strikethrough);

        if (currentOffset + len <= charOffset) {
            leftSpans.push({ ...span });
        } else if (currentOffset >= charOffset) {
            rightSpans.push({ ...span });
        } else {
            const splitPoint = charOffset - currentOffset;
            const leftText = span.text.slice(0, splitPoint);
            const rightText = span.text.slice(splitPoint);

            if (leftText) {
                leftSpans.push({ ...span, text: leftText });
            }
            if (rightText) {
                rightSpans.push({ ...span, text: rightText });
            }
        }
        currentOffset += len;
    }

    if (leftSpans.length === 0) {
        leftSpans.push({
            text: "",
            font: splitFont,
            color: splitColor,
            bold: splitBold,
            italic: splitItalic,
            strikethrough: splitStrike,
        });
    }

    if (rightSpans.length === 0) {
        rightSpans.push({
            text: "",
            font: splitFont,
            color: splitColor,
            bold: splitBold,
            italic: splitItalic,
            strikethrough: splitStrike,
        });
    }

    const newBlocks: BioBlock[] = [
        ...collapsedDoc.blocks.slice(0, bIdx),
        { type: "paragraph", align: targetBlock.align || "left", spans: leftSpans },
        { type: "paragraph", align: targetBlock.align || "left", spans: rightSpans },
        ...collapsedDoc.blocks.slice(bIdx + 1),
    ];

    const newDoc: BioDocument = {
        version: 1,
        blocks: newBlocks,
    };

    const newSelection: SelectionOffsets = {
        startBlockIdx: bIdx + 1,
        startOffset: 0,
        endBlockIdx: bIdx + 1,
        endOffset: 0,
    };

    return { newDoc, newSelection };
}

/**
 * Merges current block with previous block on Backspace at start of line
 */
export function mergeBlockWithPrevious(
    doc: BioDocument,
    offsets: SelectionOffsets
): { newDoc: BioDocument; newSelection: SelectionOffsets } | null {
    if (offsets.startBlockIdx <= 0 || offsets.startOffset > 0) return null;

    const bIdx = offsets.startBlockIdx;
    const prevBlockIdx = bIdx - 1;
    const prevBlock = doc.blocks[prevBlockIdx];
    const currBlock = doc.blocks[bIdx];

    if (!prevBlock || !currBlock) return null;

    let targetOffset = 0;
    for (const span of prevBlock.spans) {
        targetOffset += span.text.length;
    }

    const mergedSpans = [...prevBlock.spans, ...currBlock.spans];
    const nonEmpties = mergedSpans.filter((s) => s.text.length > 0);
    const finalSpans = nonEmpties.length > 0 ? nonEmpties : [mergedSpans[0] || { text: "", font: "inter", color: "default" }];

    const newBlocks: BioBlock[] = [
        ...doc.blocks.slice(0, prevBlockIdx),
        { type: "paragraph", align: prevBlock.align || "left", spans: finalSpans },
        ...doc.blocks.slice(bIdx + 1),
    ];

    const newDoc: BioDocument = {
        version: 1,
        blocks: newBlocks,
    };

    const newSelection: SelectionOffsets = {
        startBlockIdx: prevBlockIdx,
        startOffset: targetOffset,
        endBlockIdx: prevBlockIdx,
        endOffset: targetOffset,
    };

    return { newDoc, newSelection };
}

export type BioFormatPatch = {
    bold?: boolean;
    italic?: boolean;
    strikethrough?: boolean;
    font?: BioFont;
    color?: BioColor;
    align?: BioAlign;
};

/**
 * Applies a format patch to a BioDocument within selection offsets, splitting spans cleanly
 */
export function applyFormattingToDocument(
    doc: BioDocument,
    offsets: SelectionOffsets,
    patch: BioFormatPatch
): BioDocument {
    const newBlocks: BioBlock[] = doc.blocks.map((block, bIdx) => {
        // Alignment is block-level
        const align =
            patch.align && bIdx >= offsets.startBlockIdx && bIdx <= offsets.endBlockIdx
                ? patch.align
                : block.align || "left";

        // If outside block range, return block with possibly updated align
        if (bIdx < offsets.startBlockIdx || bIdx > offsets.endBlockIdx) {
            return { ...block, align };
        }

        // If only align was requested, no span splitting needed
        const hasSpanPatch =
            patch.bold !== undefined ||
            patch.italic !== undefined ||
            patch.strikethrough !== undefined ||
            patch.font !== undefined ||
            patch.color !== undefined;

        if (!hasSpanPatch) {
            return { ...block, align };
        }

        // Calculate text boundary for this block
        const blockTextLength = block.spans.reduce((acc, s) => acc + s.text.length, 0);
        const bStart = bIdx === offsets.startBlockIdx ? offsets.startOffset : 0;
        const bEnd = bIdx === offsets.endBlockIdx ? offsets.endOffset : blockTextLength;

        if (bStart >= bEnd) {
            return { ...block, align };
        }

        // Split and patch spans
        const newSpans: BioSpan[] = [];
        let currentPos = 0;

        for (const span of block.spans) {
            const spanLen = span.text.length;
            const spanStart = currentPos;
            const spanEnd = currentPos + spanLen;
            currentPos += spanLen;

            // Outside selection
            if (spanEnd <= bStart || spanStart >= bEnd) {
                newSpans.push({ ...span });
                continue;
            }

            // Slice before selection
            if (spanStart < bStart) {
                newSpans.push({
                    ...span,
                    text: span.text.slice(0, bStart - spanStart),
                });
            }

            // Slice inside selection (receives patch)
            const selSliceStart = Math.max(0, bStart - spanStart);
            const selSliceEnd = Math.min(spanLen, bEnd - spanStart);
            const selectedText = span.text.slice(selSliceStart, selSliceEnd);

            if (selectedText) {
                newSpans.push({
                    text: selectedText,
                    font: patch.font !== undefined ? patch.font : span.font,
                    color: patch.color !== undefined ? patch.color : span.color,
                    bold: patch.bold !== undefined ? patch.bold : span.bold,
                    italic: patch.italic !== undefined ? patch.italic : span.italic,
                    strikethrough:
                        patch.strikethrough !== undefined ? patch.strikethrough : span.strikethrough,
                });
            }

            // Slice after selection
            if (spanEnd > bEnd) {
                newSpans.push({
                    ...span,
                    text: span.text.slice(bEnd - spanStart),
                });
            }
        }

        // Merge consecutive spans with identical formatting
        const mergedSpans: BioSpan[] = [];
        for (const span of newSpans) {
            const prev = mergedSpans[mergedSpans.length - 1];
            if (
                prev &&
                prev.font === span.font &&
                prev.color === span.color &&
                Boolean(prev.bold) === Boolean(span.bold) &&
                Boolean(prev.italic) === Boolean(span.italic) &&
                Boolean(prev.strikethrough) === Boolean(span.strikethrough)
            ) {
                prev.text += span.text;
            } else {
                mergedSpans.push({ ...span });
            }
        }

        return {
            type: "paragraph",
            align,
            spans: mergedSpans.length > 0 ? mergedSpans : [{ text: "", font: "inter", color: "default" }],
        };
    });

    return {
        version: 1,
        blocks: newBlocks,
    };
}
