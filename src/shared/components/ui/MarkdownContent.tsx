import React from "react";

interface MarkdownContentProps {
    content: string;
    className?: string;
    isClamped?: boolean;
}

interface InlineMatch {
    type: "bold" | "italic" | "strike" | "code" | "link" | "mention" | "hashtag";
    index: number;
    length: number;
    text: string;
    extra?: string;
}

/**
 * Searches for the earliest inline token in a substring.
 */
function findNextInlineToken(str: string): InlineMatch | null {
    let earliest: InlineMatch | null = null;

    const consider = (match: InlineMatch | null) => {
        if (!match) return;
        if (!earliest || match.index < earliest.index) {
            earliest = match;
        }
    };

    // 1. Inline Code: `code`
    const codeMatch = str.match(/`([^`\n]+)`/);
    if (codeMatch && codeMatch.index !== undefined) {
        consider({
            type: "code",
            index: codeMatch.index,
            length: codeMatch[0].length,
            text: codeMatch[1],
        });
    }

    // 2. Links: [title](url)
    const linkMatch = str.match(/\[([^\]\n]+)\]\(([^)\s\n]+)\)/);
    if (linkMatch && linkMatch.index !== undefined) {
        consider({
            type: "link",
            index: linkMatch.index,
            length: linkMatch[0].length,
            text: linkMatch[1],
            extra: linkMatch[2],
        });
    }

    // 3. Bold: **text** or __text__
    const boldMatch = str.match(/(\*\*|__)([^*\n]+?)\1/);
    if (boldMatch && boldMatch.index !== undefined) {
        consider({
            type: "bold",
            index: boldMatch.index,
            length: boldMatch[0].length,
            text: boldMatch[2],
        });
    }

    // 4. Strikethrough: ~~text~~
    const strikeMatch = str.match(/~~([^~\n]+?)~~/);
    if (strikeMatch && strikeMatch.index !== undefined) {
        consider({
            type: "strike",
            index: strikeMatch.index,
            length: strikeMatch[0].length,
            text: strikeMatch[1],
        });
    }

    // 5. Italic: *text* (not surrounded by *) or _text_ (not surrounded by _)
    const italicMatch = str.match(/(?:^|[^*_])(\*([^*\s\n][^*\n]*?)\*|_([^_\\s\n][^_\n]*?)_)(?:[^*_]|$)/);
    if (italicMatch && italicMatch.index !== undefined) {
        // Offset if leading character was matched
        const full = italicMatch[0];
        const inner = italicMatch[2] || italicMatch[3];
        const leadingCharLength = full.startsWith("*") || full.startsWith("_") ? 0 : 1;
        const actualIndex = italicMatch.index + leadingCharLength;
        const targetLen = (inner?.length ?? 0) + 2;
        consider({
            type: "italic",
            index: actualIndex,
            length: targetLen,
            text: inner,
        });
    }

    // 6. Mention: @username
    const mentionMatch = str.match(/(?:^|[\s(])(@[a-zA-Z0-9_\u00C0-\u024F\u1E00-\u1EFF]+)/);
    if (mentionMatch && mentionMatch.index !== undefined) {
        const full = mentionMatch[0];
        const tag = mentionMatch[1];
        const offset = full.indexOf(tag);
        consider({
            type: "mention",
            index: mentionMatch.index + offset,
            length: tag.length,
            text: tag,
        });
    }

    // 7. Hashtag: #tag
    const hashMatch = str.match(/(?:^|[\s(])(#[a-zA-Z0-9_\u00C0-\u024F\u1E00-\u1EFF]+)/);
    if (hashMatch && hashMatch.index !== undefined) {
        const full = hashMatch[0];
        const tag = hashMatch[1];
        const offset = full.indexOf(tag);
        consider({
            type: "hashtag",
            index: hashMatch.index + offset,
            length: tag.length,
            text: tag,
        });
    }

    return earliest;
}

/**
 * Parses inline formatting tags into safe React elements.
 */
export function parseInlineMarkdown(text: string, keyPrefix = "inline"): React.ReactNode[] {
    if (!text) return [];

    const nodes: React.ReactNode[] = [];
    let remaining = text;
    let nodeIndex = 0;

    while (remaining.length > 0) {
        const match = findNextInlineToken(remaining);
        if (!match) {
            nodes.push(remaining);
            break;
        }

        if (match.index > 0) {
            nodes.push(remaining.slice(0, match.index));
        }

        const key = `${keyPrefix}-${nodeIndex++}`;

        switch (match.type) {
            case "bold":
                nodes.push(
                    <strong key={key} className="font-bold text-text">
                        {parseInlineMarkdown(match.text, `${key}-b`)}
                    </strong>
                );
                break;
            case "italic":
                nodes.push(
                    <em key={key} className="italic text-text/95">
                        {parseInlineMarkdown(match.text, `${key}-i`)}
                    </em>
                );
                break;
            case "strike":
                nodes.push(
                    <del key={key} className="line-through text-text-muted/80">
                        {parseInlineMarkdown(match.text, `${key}-s`)}
                    </del>
                );
                break;
            case "code":
                nodes.push(
                    <code
                        key={key}
                        className="bg-surface-hover/80 px-1.5 py-0.5 rounded text-xs font-mono text-primary border border-border/40"
                    >
                        {match.text}
                    </code>
                );
                break;
            case "link": {
                const url = match.extra || "#";
                nodes.push(
                    <a
                        key={key}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                            if (url === "https://" || url === "#" || url === "http://") {
                                e.preventDefault();
                            }
                            e.stopPropagation();
                        }}
                        className="text-primary hover:underline font-semibold transition-colors break-all"
                    >
                        {parseInlineMarkdown(match.text, `${key}-a`)}
                    </a>
                );
                break;
            }
            case "mention":
                nodes.push(
                    <span
                        key={key}
                        className="text-[#1688E8] font-semibold hover:underline cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {match.text}
                    </span>
                );
                break;
            case "hashtag":
                nodes.push(
                    <span
                        key={key}
                        className="text-primary font-semibold hover:underline cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {match.text}
                    </span>
                );
                break;
        }

        remaining = remaining.slice(match.index + match.length);
    }

    return nodes;
}

type Block =
    | { type: "code"; lang?: string; lines: string[] }
    | { type: "quote"; lines: string[] }
    | { type: "ul"; items: string[] }
    | { type: "ol"; items: string[] }
    | { type: "heading"; level: number; text: string }
    | { type: "hr" }
    | { type: "paragraph"; lines: string[] };

/**
 * Splits lines of text into structured markdown blocks.
 */
function parseBlocks(rawText: string): Block[] {
    const lines = rawText.split(/\r?\n/);
    const blocks: Block[] = [];

    let currentParagraph: string[] = [];
    let currentQuote: string[] = [];
    let currentUl: string[] = [];
    let currentOl: string[] = [];

    const flushParagraph = () => {
        if (currentParagraph.length > 0) {
            blocks.push({ type: "paragraph", lines: [...currentParagraph] });
            currentParagraph = [];
        }
    };

    const flushQuote = () => {
        if (currentQuote.length > 0) {
            blocks.push({ type: "quote", lines: [...currentQuote] });
            currentQuote = [];
        }
    };

    const flushUl = () => {
        if (currentUl.length > 0) {
            blocks.push({ type: "ul", items: [...currentUl] });
            currentUl = [];
        }
    };

    const flushOl = () => {
        if (currentOl.length > 0) {
            blocks.push({ type: "ol", items: [...currentOl] });
            currentOl = [];
        }
    };

    const flushAll = () => {
        flushParagraph();
        flushQuote();
        flushUl();
        flushOl();
    };

    let i = 0;
    while (i < lines.length) {
        const line = lines[i];
        const trimmed = line.trim();

        // 1. Code Block Fence (```)
        if (trimmed.startsWith("```")) {
            flushAll();
            const lang = trimmed.slice(3).trim();
            const codeLines: string[] = [];
            i++;
            while (i < lines.length && !lines[i].trim().startsWith("```")) {
                codeLines.push(lines[i]);
                i++;
            }
            blocks.push({ type: "code", lang, lines: codeLines });
            i++;
            continue;
        }

        // 2. Empty / Blank Line
        if (trimmed.length === 0) {
            flushAll();
            i++;
            continue;
        }

        // 3. Horizontal Rule
        if (/^(---|___|\*\*\*)$/.test(trimmed)) {
            flushAll();
            blocks.push({ type: "hr" });
            i++;
            continue;
        }

        // 4. Headings (# H1, ## H2, etc.)
        const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
        if (headingMatch) {
            flushAll();
            blocks.push({
                type: "heading",
                level: headingMatch[1].length,
                text: headingMatch[2],
            });
            i++;
            continue;
        }

        // 5. Blockquote (> quote)
        if (/^>\s?/.test(line)) {
            flushParagraph();
            flushUl();
            flushOl();
            currentQuote.push(line.replace(/^>\s?/, ""));
            i++;
            continue;
        } else {
            flushQuote();
        }

        // 6. Unordered List (- item or * item)
        // Make sure it is not bold like **text**
        const ulMatch = line.match(/^[-*]\s+(.+)$/);
        if (ulMatch && !line.startsWith("**") && !line.startsWith("--")) {
            flushParagraph();
            flushQuote();
            flushOl();
            currentUl.push(ulMatch[1]);
            i++;
            continue;
        } else {
            flushUl();
        }

        // 7. Ordered List (1. item)
        const olMatch = line.match(/^\d+\.\s+(.+)$/);
        if (olMatch) {
            flushParagraph();
            flushQuote();
            flushUl();
            currentOl.push(olMatch[1]);
            i++;
            continue;
        } else {
            flushOl();
        }

        // 8. Normal text line -> paragraph
        currentParagraph.push(line);
        i++;
    }

    flushAll();
    return blocks;
}

export const MarkdownContent: React.FC<MarkdownContentProps> = ({
    content,
    className = "",
    isClamped = false,
}) => {
    if (!content) return null;

    const blocks = parseBlocks(content);

    return (
        <div className={`markdown-content flex flex-col ${isClamped ? "gap-1" : "gap-2"} ${className}`}>
            {blocks.map((block, index) => {
                const key = `block-${index}`;

                switch (block.type) {
                    case "code":
                        return (
                            <pre
                                key={key}
                                className="bg-[#12161f] border border-border/50 rounded-lg p-3 text-xs font-mono overflow-x-auto text-text leading-normal"
                            >
                                <code>{block.lines.join("\n")}</code>
                            </pre>
                        );

                    case "quote":
                        return (
                            <blockquote
                                key={key}
                                className="border-l-3 border-primary/70 pl-3 py-1 italic text-text-muted bg-surface-hover/20 rounded-r text-sm"
                            >
                                {block.lines.map((line, lIdx) => (
                                    <div key={lIdx}>
                                        {parseInlineMarkdown(line, `${key}-q-${lIdx}`)}
                                    </div>
                                ))}
                            </blockquote>
                        );

                    case "ul":
                        return (
                            <ul key={key} className={`flex flex-col ${isClamped ? "gap-0.5" : "gap-1"} pl-1`}>
                                {block.items.map((item, itemIdx) => (
                                    <li key={itemIdx} className="flex items-start gap-2">
                                        <span className="text-primary font-bold select-none shrink-0 text-sm leading-normal">
                                            •
                                        </span>
                                        <span className="flex-1 min-w-0">
                                            {parseInlineMarkdown(item, `${key}-li-${itemIdx}`)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        );

                    case "ol":
                        return (
                            <ol key={key} className={`flex flex-col ${isClamped ? "gap-0.5" : "gap-1"} pl-1`}>
                                {block.items.map((item, itemIdx) => (
                                    <li key={itemIdx} className="flex items-start gap-2">
                                        <span className="text-primary font-semibold select-none shrink-0 text-xs mt-0.5 min-w-[1.2rem]">
                                            {itemIdx + 1}.
                                        </span>
                                        <span className="flex-1 min-w-0">
                                            {parseInlineMarkdown(item, `${key}-oli-${itemIdx}`)}
                                        </span>
                                    </li>
                                ))}
                            </ol>
                        );

                    case "heading": {
                        const Tag = (
                            block.level === 1
                                ? "h2"
                                : block.level === 2
                                ? "h3"
                                : block.level === 3
                                ? "h4"
                                : "h5"
                        ) as "h2" | "h3" | "h4" | "h5";

                        const headingClasses =
                            block.level === 1
                                ? "text-lg sm:text-xl font-black text-text mt-1"
                                : block.level === 2
                                ? "text-base sm:text-lg font-bold text-text mt-1"
                                : "text-sm sm:text-base font-bold text-text mt-0.5";

                        return (
                            <Tag key={key} className={headingClasses}>
                                {parseInlineMarkdown(block.text, `${key}-h`)}
                            </Tag>
                        );
                    }

                    case "hr":
                        return <hr key={key} className="border-border/60 my-1" />;

                    case "paragraph":
                        return (
                            <p key={key} className="leading-relaxed">
                                {block.lines.map((line, lIdx) => (
                                    <React.Fragment key={lIdx}>
                                        {lIdx > 0 && <br />}
                                        {parseInlineMarkdown(line, `${key}-p-${lIdx}`)}
                                    </React.Fragment>
                                ))}
                            </p>
                        );
                }
            })}
        </div>
    );
};
