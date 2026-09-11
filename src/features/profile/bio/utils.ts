import type { BioDocument, BioBlock, BioSpan, BioFont, BioColor, BioAlign } from "./types";
import { BIO_FONTS, BIO_COLORS } from "./constants";

const VALID_FONTS: Set<BioFont> = new Set(["inter", "serif", "mono", "pixel", "gothic", "fantasy"]);
const VALID_COLORS: Set<BioColor> = new Set(["default", "muted", "accent", "highlight"]);
const VALID_ALIGNS: Set<BioAlign> = new Set(["left", "center", "right"]);

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
