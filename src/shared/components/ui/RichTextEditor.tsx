import React, { useEffect, useRef, useState, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBold,
    faItalic,
    faStrikethrough,
    faListUl,
    faListOl,
    faQuoteLeft,
    faLink,
    faImage,
    faCode,
    faRotateLeft,
    faRotateRight,
    faEraser,
    faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "@/shared/hooks/useTranslate";

/**
 * Converts HTML from contentEditable into clean Markdown for storage & display.
 */
export function htmlToMarkdown(html: string): string {
    if (!html || !html.trim()) return "";

    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${html}</div>`, "text/html");
    const root = doc.body.firstElementChild || doc.body;

    function processNode(node: Node): string {
        if (node.nodeType === Node.TEXT_NODE) {
            return node.textContent || "";
        }

        if (node.nodeType !== Node.ELEMENT_NODE) {
            return "";
        }

        const el = node as HTMLElement;
        const tag = el.tagName.toLowerCase();
        const children = Array.from(el.childNodes).map(processNode).join("");

        switch (tag) {
            case "b":
            case "strong":
                return children.trim() ? `**${children}**` : "";
            case "i":
            case "em":
                return children.trim() ? `*${children}*` : "";
            case "s":
            case "strike":
            case "del":
                return children.trim() ? `~~${children}~~` : "";
            case "code":
                return children.trim() ? `\`${children}\`` : "";
            case "h1":
                return `\n\n# ${children.trim()}\n\n`;
            case "h2":
                return `\n\n## ${children.trim()}\n\n`;
            case "h3":
                return `\n\n### ${children.trim()}\n\n`;
            case "blockquote":
                return `\n\n> ${children.trim()}\n\n`;
            case "ul": {
                const items: string[] = [];
                el.childNodes.forEach((child) => {
                    if (child.nodeName.toLowerCase() === "li") {
                        const itemContent = processNode(child).trim();
                        if (itemContent) items.push(`- ${itemContent}`);
                    }
                });
                return `\n\n${items.join("\n")}\n\n`;
            }
            case "ol": {
                const items: string[] = [];
                let idx = 1;
                el.childNodes.forEach((child) => {
                    if (child.nodeName.toLowerCase() === "li") {
                        const itemContent = processNode(child).trim();
                        if (itemContent) items.push(`${idx++}. ${itemContent}`);
                    }
                });
                return `\n\n${items.join("\n")}\n\n`;
            }
            case "li":
                return children;
            case "a": {
                const href = el.getAttribute("href") || "#";
                return `[${children.trim() || href}](${href})`;
            }
            case "p":
            case "div":
                return `\n\n${children.trim()}\n\n`;
            case "br":
                return "\n";
            default:
                return children;
        }
    }

    let md = processNode(root);
    md = md.replace(/\n{3,}/g, "\n\n").trim();
    return md;
}

/**
 * Converts Markdown into HTML to hydrate the WYSIWYG contentEditable editor.
 */
export function markdownToHtml(md: string): string {
    if (!md || !md.trim()) return "";

    const lines = md.split("\n");
    const htmlLines: string[] = [];
    let inUl = false;
    let inOl = false;
    let inBlockquote = false;

    const closeContainers = () => {
        if (inUl) {
            htmlLines.push("</ul>");
            inUl = false;
        }
        if (inOl) {
            htmlLines.push("</ol>");
            inOl = false;
        }
        if (inBlockquote) {
            htmlLines.push("</blockquote>");
            inBlockquote = false;
        }
    };

    const formatInline = (text: string) => {
        return text
            .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
            .replace(/__(.+?)__/g, "<strong>$1</strong>")
            .replace(/\*(.+?)\*/g, "<em>$1</em>")
            .replace(/_(.+?)_/g, "<em>$1</em>")
            .replace(/~~(.+?)~~/g, "<del>$1</del>")
            .replace(/`([^`]+)`/g, "<code>$1</code>")
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        if (!trimmed) {
            closeContainers();
            continue;
        }

        if (trimmed.startsWith("# ")) {
            closeContainers();
            htmlLines.push(`<h1>${formatInline(trimmed.slice(2))}</h1>`);
        } else if (trimmed.startsWith("## ")) {
            closeContainers();
            htmlLines.push(`<h2>${formatInline(trimmed.slice(3))}</h2>`);
        } else if (trimmed.startsWith("### ")) {
            closeContainers();
            htmlLines.push(`<h3>${formatInline(trimmed.slice(4))}</h3>`);
        } else if (trimmed.startsWith("> ")) {
            if (!inBlockquote) {
                closeContainers();
                htmlLines.push("<blockquote>");
                inBlockquote = true;
            }
            htmlLines.push(`<p>${formatInline(trimmed.slice(2))}</p>`);
        } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
            if (inOl) {
                htmlLines.push("</ol>");
                inOl = false;
            }
            if (inBlockquote) {
                htmlLines.push("</blockquote>");
                inBlockquote = false;
            }
            if (!inUl) {
                htmlLines.push("<ul>");
                inUl = true;
            }
            htmlLines.push(`<li>${formatInline(trimmed.slice(2))}</li>`);
        } else if (/^\d+\.\s/.test(trimmed)) {
            if (inUl) {
                htmlLines.push("</ul>");
                inUl = false;
            }
            if (inBlockquote) {
                htmlLines.push("</blockquote>");
                inBlockquote = false;
            }
            if (!inOl) {
                htmlLines.push("<ol>");
                inOl = true;
            }
            const match = trimmed.match(/^\d+\.\s(.*)$/);
            htmlLines.push(`<li>${formatInline(match ? match[1] : trimmed)}</li>`);
        } else {
            closeContainers();
            htmlLines.push(`<p>${formatInline(trimmed)}</p>`);
        }
    }

    closeContainers();
    return htmlLines.join("");
}

export interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    onAddImage?: () => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
    minHeight?: string;
    className?: string;
    variant?: "default" | "seamless";
}

export const RichTextEditor = ({
    value,
    onChange,
    placeholder = "Nhập nội dung...",
    onAddImage,
    onKeyDown,
    minHeight = "200px",
    className = "",
    variant = "default",
}: RichTextEditorProps) => {
    const { language } = useTranslation();
    const isVi = language === "vi";

    const editorRef = useRef<HTMLDivElement>(null);
    const lastValueRef = useRef(value);

    // Active format states for Word-style toolbar buttons
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isStrike, setIsStrike] = useState(false);
    const [isUl, setIsUl] = useState(false);
    const [isOl, setIsOl] = useState(false);
    const [currentBlock, setCurrentBlock] = useState<string>("p");
    const [showHeadingMenu, setShowHeadingMenu] = useState(false);

    // Initialize & sync HTML content from Markdown value
    useEffect(() => {
        if (!editorRef.current) return;
        // Only update DOM if outside change occurred (not typing from self)
        if (value !== lastValueRef.current) {
            lastValueRef.current = value;
            const newHtml = markdownToHtml(value);
            if (editorRef.current.innerHTML !== newHtml) {
                editorRef.current.innerHTML = newHtml;
            }
        }
    }, [value]);

    // Initial mount sync
    useEffect(() => {
        if (editorRef.current && value && !editorRef.current.innerHTML) {
            editorRef.current.innerHTML = markdownToHtml(value);
        }
    }, []);

    // Check format states on cursor / selection change
    const updateActiveFormats = useCallback(() => {
        if (typeof document === "undefined") return;
        try {
            setIsBold(document.queryCommandState("bold"));
            setIsItalic(document.queryCommandState("italic"));
            setIsStrike(document.queryCommandState("strikeThrough"));
            setIsUl(document.queryCommandState("insertUnorderedList"));
            setIsOl(document.queryCommandState("insertOrderedList"));

            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0 && editorRef.current) {
                let node: Node | null = selection.anchorNode;
                let foundBlock = "p";
                while (node && node !== editorRef.current) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const tag = (node as HTMLElement).tagName.toLowerCase();
                        if (["h1", "h2", "h3", "blockquote"].includes(tag)) {
                            foundBlock = tag;
                            break;
                        }
                    }
                    node = node.parentNode;
                }
                setCurrentBlock(foundBlock);
            }
        } catch {
            // Ignore document state query errors
        }
    }, []);

    useEffect(() => {
        const handleSelectionChange = () => {
            updateActiveFormats();
        };
        document.addEventListener("selectionchange", handleSelectionChange);
        return () => {
            document.removeEventListener("selectionchange", handleSelectionChange);
        };
    }, [updateActiveFormats]);

    const handleInput = () => {
        if (!editorRef.current) return;
        const html = editorRef.current.innerHTML;
        const md = htmlToMarkdown(html);
        lastValueRef.current = md;
        onChange(md);
        updateActiveFormats();
    };

    const execCommand = (cmd: string, val: string | undefined = undefined) => {
        if (!editorRef.current) return;
        editorRef.current.focus();
        document.execCommand(cmd, false, val);
        handleInput();
    };

    const formatBlock = (tag: "p" | "h1" | "h2" | "h3" | "blockquote") => {
        if (!editorRef.current) return;
        editorRef.current.focus();
        document.execCommand("formatBlock", false, `<${tag}>`);
        setCurrentBlock(tag);
        setShowHeadingMenu(false);
        handleInput();
    };

    const handleInsertLink = () => {
        const url = window.prompt(isVi ? "Nhập đường dẫn liên kết (URL):" : "Enter URL:", "https://");
        if (!url || !url.trim()) return;
        execCommand("createLink", url.trim());
    };

    const handleInsertCode = () => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;
        const selectedText = selection.toString();
        if (selectedText) {
            document.execCommand("insertHTML", false, `<code>${selectedText}</code>`);
            handleInput();
        } else {
            document.execCommand("insertHTML", false, `<code>code</code>`);
            handleInput();
        }
    };

    const getBlockLabel = (block: string) => {
        switch (block) {
            case "h1":
                return isVi ? "Tiêu đề 1" : "Heading 1";
            case "h2":
                return isVi ? "Tiêu đề 2" : "Heading 2";
            case "h3":
                return isVi ? "Tiêu đề 3" : "Heading 3";
            case "blockquote":
                return isVi ? "Trích dẫn" : "Quote";
            default:
                return isVi ? "Văn bản thường" : "Normal text";
        }
    };

    const isSeamless = variant === "seamless";

    return (
        <div
            className={`rich-text-editor-container flex flex-col w-full ${
                isSeamless
                    ? "bg-transparent"
                    : "rounded-xl border border-border/70 bg-[#121622]/40 focus-within:border-primary/50 overflow-hidden"
            } transition-colors ${className}`}
        >
            {/* ================= 1. REFINED FORMATTING TOOLBAR ================= */}
            <div
                className={`flex items-center justify-between gap-1.5 py-1.5 ${
                    isSeamless ? "px-0 bg-transparent border-b border-white/[0.08]" : "px-2.5 bg-[#141824]/90 border-b border-border/60"
                } text-text-muted select-none`}
            >
                <div className="flex items-center gap-1 flex-wrap">
                    {/* Paragraph / Heading Dropdown Selector */}
                    <div className="relative">
                        <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => setShowHeadingMenu((prev) => !prev)}
                            className="h-7 px-2.5 rounded-md flex items-center gap-1.5 hover:bg-surface-hover/80 hover:text-text text-xs font-semibold border border-transparent hover:border-border/40 transition-colors cursor-pointer"
                            title={isVi ? "Kiểu văn bản" : "Text style"}
                        >
                            <span>{getBlockLabel(currentBlock)}</span>
                            <FontAwesomeIcon icon={faChevronDown} className="text-[10px] text-text-faint" />
                        </button>

                        {showHeadingMenu && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowHeadingMenu(false)} />
                                <div className="absolute left-0 top-full mt-1 z-50 min-w-[150px] bg-surface border border-border rounded-lg shadow-xl py-1 animate-fade-in flex flex-col text-xs font-medium">
                                    <button
                                        type="button"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => formatBlock("p")}
                                        className={`px-3 py-1.5 text-left hover:bg-surface-hover transition-colors ${currentBlock === "p" ? "text-primary font-bold bg-primary/10" : "text-text"}`}
                                    >
                                        {isVi ? "Văn bản thường" : "Normal text"}
                                    </button>
                                    <button
                                        type="button"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => formatBlock("h1")}
                                        className={`px-3 py-1.5 text-left hover:bg-surface-hover font-black text-sm transition-colors ${currentBlock === "h1" ? "text-primary font-bold bg-primary/10" : "text-text"}`}
                                    >
                                        {isVi ? "Tiêu đề 1 (H1)" : "Heading 1"}
                                    </button>
                                    <button
                                        type="button"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => formatBlock("h2")}
                                        className={`px-3 py-1.5 text-left hover:bg-surface-hover font-bold transition-colors ${currentBlock === "h2" ? "text-primary font-bold bg-primary/10" : "text-text"}`}
                                    >
                                        {isVi ? "Tiêu đề 2 (H2)" : "Heading 2"}
                                    </button>
                                    <button
                                        type="button"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => formatBlock("h3")}
                                        className={`px-3 py-1.5 text-left hover:bg-surface-hover font-semibold transition-colors ${currentBlock === "h3" ? "text-primary font-bold bg-primary/10" : "text-text"}`}
                                    >
                                        {isVi ? "Tiêu đề 3 (H3)" : "Heading 3"}
                                    </button>
                                    <button
                                        type="button"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => formatBlock("blockquote")}
                                        className={`px-3 py-1.5 text-left hover:bg-surface-hover italic transition-colors ${currentBlock === "blockquote" ? "text-primary font-bold bg-primary/10" : "text-text"}`}
                                    >
                                        {isVi ? "Trích dẫn (Quote)" : "Quote"}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    <span className="w-[1px] h-3.5 bg-border/50 mx-0.5" />

                    {/* Inline Formats: Bold, Italic, Strikethrough, Code */}
                    <div className="flex items-center gap-0.5">
                        <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => execCommand("bold")}
                            title={isVi ? "In đậm (Ctrl+B)" : "Bold (Ctrl+B)"}
                            className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors text-xs font-bold cursor-pointer ${
                                isBold
                                    ? "bg-primary/20 text-primary border border-primary/30"
                                    : "text-text-muted hover:bg-surface-hover hover:text-text border border-transparent"
                            }`}
                        >
                            <FontAwesomeIcon icon={faBold} />
                        </button>

                        <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => execCommand("italic")}
                            title={isVi ? "In nghiêng (Ctrl+I)" : "Italic (Ctrl+I)"}
                            className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors text-xs italic cursor-pointer ${
                                isItalic
                                    ? "bg-primary/20 text-primary border border-primary/30"
                                    : "text-text-muted hover:bg-surface-hover hover:text-text border border-transparent"
                            }`}
                        >
                            <FontAwesomeIcon icon={faItalic} />
                        </button>

                        <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => execCommand("strikeThrough")}
                            title={isVi ? "Gạch ngang" : "Strikethrough"}
                            className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors text-xs cursor-pointer ${
                                isStrike
                                    ? "bg-primary/20 text-primary border border-primary/30"
                                    : "text-text-muted hover:bg-surface-hover hover:text-text border border-transparent"
                            }`}
                        >
                            <FontAwesomeIcon icon={faStrikethrough} />
                        </button>

                        <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={handleInsertCode}
                            title={isVi ? "Mã (Code)" : "Code"}
                            className="w-7 h-7 rounded-md flex items-center justify-center text-text-muted hover:bg-surface-hover hover:text-text transition-colors text-xs cursor-pointer border border-transparent"
                        >
                            <FontAwesomeIcon icon={faCode} />
                        </button>
                    </div>

                    <span className="w-[1px] h-3.5 bg-border/50 mx-0.5" />

                    {/* Structure Formats: Bullet List, Numbered List, Quote, Link, Image */}
                    <div className="flex items-center gap-0.5">
                        <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => execCommand("insertUnorderedList")}
                            title={isVi ? "Danh sách dấu chấm" : "Bullet list"}
                            className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors text-xs cursor-pointer ${
                                isUl
                                    ? "bg-primary/20 text-primary border border-primary/30"
                                    : "text-text-muted hover:bg-surface-hover hover:text-text border border-transparent"
                            }`}
                        >
                            <FontAwesomeIcon icon={faListUl} />
                        </button>

                        <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => execCommand("insertOrderedList")}
                            title={isVi ? "Danh sách số thứ tự" : "Numbered list"}
                            className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors text-xs cursor-pointer ${
                                isOl
                                    ? "bg-primary/20 text-primary border border-primary/30"
                                    : "text-text-muted hover:bg-surface-hover hover:text-text border border-transparent"
                            }`}
                        >
                            <FontAwesomeIcon icon={faListOl} />
                        </button>

                        <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => formatBlock(currentBlock === "blockquote" ? "p" : "blockquote")}
                            title={isVi ? "Trích dẫn (Quote)" : "Quote"}
                            className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors text-xs cursor-pointer ${
                                currentBlock === "blockquote"
                                    ? "bg-primary/20 text-primary border border-primary/30"
                                    : "text-text-muted hover:bg-surface-hover hover:text-text border border-transparent"
                            }`}
                        >
                            <FontAwesomeIcon icon={faQuoteLeft} />
                        </button>

                        <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={handleInsertLink}
                            title={isVi ? "Chèn liên kết" : "Insert link"}
                            className="w-7 h-7 rounded-md flex items-center justify-center text-text-muted hover:bg-surface-hover hover:text-text transition-colors text-xs cursor-pointer border border-transparent"
                        >
                            <FontAwesomeIcon icon={faLink} />
                        </button>

                        {onAddImage && (
                            <button
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={onAddImage}
                                title={isVi ? "Đính kèm hình ảnh" : "Add image"}
                                className="w-7 h-7 rounded-md flex items-center justify-center text-primary/80 hover:text-primary hover:bg-primary/10 transition-colors text-xs cursor-pointer border border-transparent"
                            >
                                <FontAwesomeIcon icon={faImage} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Right utility buttons: Clear formatting */}
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                            execCommand("removeFormat");
                            formatBlock("p");
                        }}
                        title={isVi ? "Xóa định dạng" : "Clear formatting"}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-text-faint hover:text-amber-400 hover:bg-surface-hover transition-colors text-xs cursor-pointer border border-transparent"
                    >
                        <FontAwesomeIcon icon={faEraser} />
                    </button>
                </div>
            </div>

            {/* ================= 2. DIRECT IN-PLACE WYSIWYG CANVAS ================= */}
            <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                spellCheck={false}
                autoCorrect="off"
                autoCapitalize="off"
                onInput={handleInput}
                onKeyUp={updateActiveFormats}
                onMouseUp={updateActiveFormats}
                onKeyDown={onKeyDown}
                data-placeholder={placeholder}
                style={{ minHeight }}
                className={`
                    rich-text-editor-canvas
                    w-full flex-1 max-h-[420px] overflow-y-auto
                    ${isSeamless ? "p-0 pt-3 pb-3 text-[15px] sm:text-base" : "p-3.5 text-sm"}
                    bg-transparent
                    focus:outline-none
                    text-text leading-relaxed select-text
                    empty:before:content-[attr(data-placeholder)] empty:before:text-text-faint/40 empty:before:pointer-events-none empty:before:italic
                    [&_h1]:text-2xl [&_h1]:font-black [&_h1]:text-text [&_h1]:my-2
                    [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-text [&_h2]:my-1.5
                    [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-text [&_h3]:my-1
                    [&_blockquote]:border-l-2 [&_blockquote]:border-primary [&_blockquote]:pl-3.5 [&_blockquote]:my-2.5 [&_blockquote]:italic [&_blockquote]:text-text-muted
                    [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2 [&_ul]:space-y-1
                    [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2 [&_ol]:space-y-1
                    [&_li]:pl-1
                    [&_code]:font-mono [&_code]:bg-white/[0.06] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-primary [&_code]:text-xs
                    [&_a]:text-primary [&_a]:underline [&_a]:hover:text-primary-hover
                    [&_p]:my-1.5
                `}
            />
        </div>
    );
};
