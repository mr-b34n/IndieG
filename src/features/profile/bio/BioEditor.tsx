import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBold,
    faItalic,
    faStrikethrough,
    faAlignLeft,
    faAlignCenter,
    faAlignRight,
    faFont,
    faChevronDown,
    faWandMagicSparkles,
} from "@fortawesome/free-solid-svg-icons";
import type { BioDocument, BioFont, BioColor, BioAlign, BioPreset } from "./types";
import {
    BIO_FONTS,
    BIO_COLORS,
    BIO_ALIGNMENTS,
    BIO_PRESETS,
    MAX_BIO_CHAR_LIMIT,
} from "./constants";
import {
    parseBio,
    serializeBio,
    getBioCharacterCount,
    bioDocumentToHtml,
    domToBioDocument,
    getSelectionOffsets,
    restoreSelectionInContainer,
    applyFormattingToDocument,
    splitBlockAtSelection,
    mergeBlockWithPrevious,
    type SelectionOffsets,
    type BioFormatPatch,
} from "./utils";

interface BioEditorProps {
    value?: string;
    onChange: (serialized: string) => void;
    placeholder?: string;
}

export const BioEditor: React.FC<BioEditorProps> = ({
    value,
    onChange,
    placeholder = "Viết tiểu sử gaming của bạn (chọn văn bản để định dạng)...",
}) => {
    // Current parsed document
    const [doc, setDoc] = useState<BioDocument>(() => parseBio(value));
    const [charCount, setCharCount] = useState<number>(() => getBioCharacterCount(parseBio(value)));

    // Ref to prevent self-triggered prop updates from resetting DOM innerHTML
    const isSelfUpdatingRef = useRef(false);

    // Track external value changes during render
    const [prevValue, setPrevValue] = useState(value);
    if (value !== prevValue) {
        setPrevValue(value);
        if (isSelfUpdatingRef.current) {
            isSelfUpdatingRef.current = false;
        } else {
            const next = parseBio(value);
            setDoc(next);
            setCharCount(getBioCharacterCount(next));
            if (editorRef.current) {
                editorRef.current.innerHTML = bioDocumentToHtml(next);
            }
        }
    }

    // Refs
    const containerRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<HTMLDivElement>(null);
    const toolbarRef = useRef<HTMLDivElement>(null);
    const presetContainerRef = useRef<HTMLDivElement>(null);

    // Floating contextual toolbar state
    const [isToolbarOpen, setIsToolbarOpen] = useState(false);
    const [toolbarPos, setToolbarPos] = useState({ top: 0, left: 0 });
    const [activeOffsets, setActiveOffsets] = useState<SelectionOffsets | null>(null);

    // Active formatting states on current selection
    const [isBoldActive, setIsBoldActive] = useState(false);
    const [isItalicActive, setIsItalicActive] = useState(false);
    const [isStrikeActive, setIsStrikeActive] = useState(false);
    const [activeFont, setActiveFont] = useState<BioFont>("inter");
    const [activeColor, setActiveColor] = useState<BioColor>("default");
    const [activeAlign, setActiveAlign] = useState<BioAlign>("left");

    // Submenu popovers in toolbar
    const [fontMenuOpen, setFontMenuOpen] = useState(false);
    const [colorMenuOpen, setColorMenuOpen] = useState(false);
    const [alignMenuOpen, setAlignMenuOpen] = useState(false);
    const [presetMenuOpen, setPresetMenuOpen] = useState(false);

    const isOverLimit = charCount > MAX_BIO_CHAR_LIMIT;

    // Synchronize DOM with doc on initial mount
    const isFirstMount = useRef(true);
    useEffect(() => {
        if (editorRef.current && isFirstMount.current) {
            editorRef.current.innerHTML = bioDocumentToHtml(doc);
            isFirstMount.current = false;
        }
    }, [doc]);

    // Update active toolbar formatting from selection
    const updateActiveFormatStates = useCallback((currentDoc: BioDocument, offsets: SelectionOffsets) => {
        let allBold = true;
        let allItalic = true;
        let allStrike = true;
        let primaryFont: BioFont = "inter";
        let primaryColor: BioColor = "default";
        let primaryAlign: BioAlign = "left";
        let foundSpan = false;

        const startBlock = currentDoc.blocks[offsets.startBlockIdx];
        if (startBlock?.align) {
            primaryAlign = startBlock.align;
        }

        for (let bIdx = offsets.startBlockIdx; bIdx <= offsets.endBlockIdx; bIdx++) {
            const block = currentDoc.blocks[bIdx];
            if (!block) continue;

            const blockTextLen = block.spans.reduce((acc, s) => acc + s.text.length, 0);
            const bStart = bIdx === offsets.startBlockIdx ? offsets.startOffset : 0;
            const bEnd = bIdx === offsets.endBlockIdx ? offsets.endOffset : blockTextLen;

            let currentPos = 0;
            for (const span of block.spans) {
                const sLen = span.text.length;
                const sStart = currentPos;
                const sEnd = currentPos + sLen;
                currentPos += sLen;

                if (sEnd <= bStart || sStart >= bEnd) continue;

                if (!foundSpan) {
                    primaryFont = span.font || "inter";
                    primaryColor = span.color || "default";
                    foundSpan = true;
                }

                if (!span.bold) allBold = false;
                if (!span.italic) allItalic = false;
                if (!span.strikethrough) allStrike = false;
            }
        }

        setIsBoldActive(foundSpan && allBold);
        setIsItalicActive(foundSpan && allItalic);
        setIsStrikeActive(foundSpan && allStrike);
        setActiveFont(primaryFont);
        setActiveColor(primaryColor);
        setActiveAlign(primaryAlign);
    }, []);

    // Update floating toolbar position and visibility based on window selection
    const updateSelectionToolbar = useCallback(() => {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
            setIsToolbarOpen(false);
            setFontMenuOpen(false);
            setColorMenuOpen(false);
            setAlignMenuOpen(false);
            return;
        }

        const range = sel.getRangeAt(0);
        const text = range.toString();
        if (!text || !text.trim()) {
            setIsToolbarOpen(false);
            return;
        }

        const editorEl = editorRef.current;
        const containerEl = containerRef.current;
        if (!editorEl || !containerEl || !editorEl.contains(range.commonAncestorContainer)) {
            setIsToolbarOpen(false);
            return;
        }

        const offsets = getSelectionOffsets(editorEl);
        if (!offsets) {
            setIsToolbarOpen(false);
            return;
        }

        setActiveOffsets(offsets);

        // Update active states
        if (editorRef.current) {
            const currentDoc = domToBioDocument(editorRef.current);
            updateActiveFormatStates(currentDoc, offsets);
        }

        // Calculate fixed viewport position for createPortal
        const rangeRect = range.getBoundingClientRect();
        const toolbarEstimatedWidth = 280;
        const toolbarEstimatedHeight = 42;

        // Position directly above the selected text in viewport coordinates
        let top = rangeRect.top - toolbarEstimatedHeight - 10;
        let left = rangeRect.left + rangeRect.width / 2 - toolbarEstimatedWidth / 2;

        // Flip below if too close to viewport top (< 60px)
        if (top < 60) {
            top = rangeRect.bottom + 10;
        }

        // Clamp horizontally within viewport
        const maxLeft = Math.max(10, window.innerWidth - toolbarEstimatedWidth - 12);
        left = Math.max(12, Math.min(maxLeft, left));

        setToolbarPos({ top, left });
        setIsToolbarOpen(true);
    }, [updateActiveFormatStates]);

    // Listen to selectionchange, scroll, and resize
    useEffect(() => {
        const handleSelection = () => {
            updateSelectionToolbar();
        };

        const handleScrollOrResize = () => {
            const sel = window.getSelection();
            if (sel && !sel.isCollapsed && sel.rangeCount > 0) {
                updateSelectionToolbar();
            }
        };

        document.addEventListener("selectionchange", handleSelection);
        window.addEventListener("scroll", handleScrollOrResize, true);
        window.addEventListener("resize", handleScrollOrResize);

        return () => {
            document.removeEventListener("selectionchange", handleSelection);
            window.removeEventListener("scroll", handleScrollOrResize, true);
            window.removeEventListener("resize", handleScrollOrResize);
        };
    }, [updateSelectionToolbar]);

    // Close menus on outside click
    useEffect(() => {
        const handleMouseDownOutside = (e: MouseEvent) => {
            const target = e.target as Node;
            if (toolbarRef.current && !toolbarRef.current.contains(target)) {
                setFontMenuOpen(false);
                setColorMenuOpen(false);
                setAlignMenuOpen(false);
            }
            if (presetContainerRef.current && !presetContainerRef.current.contains(target)) {
                setPresetMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleMouseDownOutside);
        return () => document.removeEventListener("mousedown", handleMouseDownOutside);
    }, []);

    // Live typing handler: keeps DOM intact, extracts BioDocument, updates charCount, notifies parent
    const handleInput = () => {
        if (!editorRef.current) return;
        const nextDoc = domToBioDocument(editorRef.current);
        const count = getBioCharacterCount(nextDoc);
        setCharCount(count);
        setDoc(nextDoc);
        isSelfUpdatingRef.current = true;
        onChange(serializeBio(nextDoc));
    };

    // Apply formatting patch to the current selection in place
    const applyPatch = (patch: BioFormatPatch) => {
        if (!editorRef.current || !activeOffsets) return;

        // Parse freshest state from DOM
        const currentDoc = domToBioDocument(editorRef.current);
        const newDoc = applyFormattingToDocument(currentDoc, activeOffsets, patch);

        // Update DOM HTML
        editorRef.current.innerHTML = bioDocumentToHtml(newDoc);

        // Restore user selection
        restoreSelectionInContainer(editorRef.current, activeOffsets);

        // Update model and propagate
        setDoc(newDoc);
        const count = getBioCharacterCount(newDoc);
        setCharCount(count);
        isSelfUpdatingRef.current = true;
        onChange(serializeBio(newDoc));

        // Refresh formatting states
        updateActiveFormatStates(newDoc, activeOffsets);
    };

    // Formatting action handlers
    const handleToggleBold = () => {
        applyPatch({ bold: !isBoldActive });
    };

    const handleToggleItalic = () => {
        applyPatch({ italic: !isItalicActive });
    };

    const handleToggleStrike = () => {
        applyPatch({ strikethrough: !isStrikeActive });
    };

    const handleSelectFont = (font: BioFont) => {
        applyPatch({ font });
        setFontMenuOpen(false);
    };

    const handleSelectColor = (color: BioColor) => {
        applyPatch({ color });
        setColorMenuOpen(false);
    };

    const handleSelectAlign = (align: BioAlign) => {
        applyPatch({ align });
        setAlignMenuOpen(false);
    };

    // Keyboard shortcuts & Enter/Backspace block navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!editorRef.current) return;

        if (e.key === "Enter") {
            e.preventDefault();
            const currentDoc = domToBioDocument(editorRef.current);
            const offsets = getSelectionOffsets(editorRef.current) || {
                startBlockIdx: Math.max(0, currentDoc.blocks.length - 1),
                startOffset: 0,
                endBlockIdx: Math.max(0, currentDoc.blocks.length - 1),
                endOffset: 0,
            };

            const { newDoc, newSelection } = splitBlockAtSelection(currentDoc, offsets);

            isSelfUpdatingRef.current = true;
            editorRef.current.innerHTML = bioDocumentToHtml(newDoc);
            restoreSelectionInContainer(editorRef.current, newSelection);

            setDoc(newDoc);
            setCharCount(getBioCharacterCount(newDoc));
            onChange(serializeBio(newDoc));

            setIsToolbarOpen(false);
            return;
        }

        if (e.key === "Backspace") {
            const offsets = getSelectionOffsets(editorRef.current);
            if (
                offsets &&
                offsets.startBlockIdx > 0 &&
                offsets.startOffset === 0 &&
                offsets.startBlockIdx === offsets.endBlockIdx &&
                offsets.startOffset === offsets.endOffset
            ) {
                e.preventDefault();
                const currentDoc = domToBioDocument(editorRef.current);
                const mergeResult = mergeBlockWithPrevious(currentDoc, offsets);
                if (mergeResult) {
                    const { newDoc, newSelection } = mergeResult;

                    isSelfUpdatingRef.current = true;
                    editorRef.current.innerHTML = bioDocumentToHtml(newDoc);
                    restoreSelectionInContainer(editorRef.current, newSelection);

                    setDoc(newDoc);
                    setCharCount(getBioCharacterCount(newDoc));
                    onChange(serializeBio(newDoc));

                    setIsToolbarOpen(false);
                    return;
                }
            }
        }

        if (e.metaKey || e.ctrlKey) {
            const key = e.key.toLowerCase();
            if (key === "b") {
                e.preventDefault();
                handleToggleBold();
            } else if (key === "i") {
                e.preventDefault();
                handleToggleItalic();
            } else if (key === "u") {
                e.preventDefault();
                handleToggleStrike();
            }
        }
    };

    // Apply a style preset directly to the editor
    const handleApplyPreset = (preset: BioPreset) => {
        setDoc(preset.document);
        const count = getBioCharacterCount(preset.document);
        setCharCount(count);
        if (editorRef.current) {
            editorRef.current.innerHTML = bioDocumentToHtml(preset.document);
        }
        isSelfUpdatingRef.current = true;
        onChange(serializeBio(preset.document));
        setPresetMenuOpen(false);
        setIsToolbarOpen(false);
    };

    const activeFontMeta = useMemo(() => {
        return BIO_FONTS.find((f) => f.value === activeFont) || BIO_FONTS[0];
    }, [activeFont]);

    const activeColorMeta = useMemo(() => {
        return BIO_COLORS.find((c) => c.value === activeColor) || BIO_COLORS[0];
    }, [activeColor]);

    const shouldOpenUpwards = toolbarPos.top + 240 > (typeof window !== "undefined" ? window.innerHeight : 800);

    return (
        <div
            ref={containerRef}
            className="relative overflow-visible z-10 w-full bg-[#13161C] p-3.5 rounded-[8px] border border-[#1688E8]/40 shadow-inner group focus-within:border-[#1688E8] focus-within:ring-1 focus-within:ring-[#1688E8]/30 transition-all"
        >
            {/* ── SELECTION-BASED CONTEXTUAL FLOATING TOOLBAR (Rendered into document.body to prevent clipping by any parent div) ── */}
            {isToolbarOpen && typeof document !== "undefined" && createPortal(
                <div
                    ref={toolbarRef}
                    style={{
                        position: "fixed",
                        top: `${toolbarPos.top}px`,
                        left: `${toolbarPos.left}px`,
                        zIndex: 99999,
                    }}
                    className="flex items-center gap-1 px-1.5 py-1 rounded-[8px] bg-[#141822] border border-[#2A3142] shadow-[0_16px_36px_rgba(0,0,0,0.85)] backdrop-blur-md animate-fade-in text-xs font-semibold select-none"
                    onMouseDown={(e) => {
                        // Prevent losing text selection when clicking anywhere inside the toolbar
                        e.preventDefault();
                    }}
                >
                    {/* Bold */}
                    <button
                        type="button"
                        onClick={handleToggleBold}
                        title="Bold (Ctrl+B)"
                        className={`w-7 h-7 rounded-[5px] flex items-center justify-center transition-all cursor-pointer ${
                            isBoldActive
                                ? "bg-[#1688E8] text-white shadow-sm"
                                : "text-[#9A9DA3] hover:text-[#F0F1F2] hover:bg-[#1E2533]"
                        }`}
                    >
                        <FontAwesomeIcon icon={faBold} className="text-xs" />
                    </button>

                    {/* Italic */}
                    <button
                        type="button"
                        onClick={handleToggleItalic}
                        title="Italic (Ctrl+I)"
                        className={`w-7 h-7 rounded-[5px] flex items-center justify-center transition-all cursor-pointer ${
                            isItalicActive
                                ? "bg-[#1688E8] text-white shadow-sm"
                                : "text-[#9A9DA3] hover:text-[#F0F1F2] hover:bg-[#1E2533]"
                        }`}
                    >
                        <FontAwesomeIcon icon={faItalic} className="text-xs" />
                    </button>

                    {/* Strikethrough */}
                    <button
                        type="button"
                        onClick={handleToggleStrike}
                        title="Strikethrough"
                        className={`w-7 h-7 rounded-[5px] flex items-center justify-center transition-all cursor-pointer ${
                            isStrikeActive
                                ? "bg-[#1688E8] text-white shadow-sm"
                                : "text-[#9A9DA3] hover:text-[#F0F1F2] hover:bg-[#1E2533]"
                        }`}
                    >
                        <FontAwesomeIcon icon={faStrikethrough} className="text-xs" />
                    </button>

                    <div className="w-[1px] h-4 bg-[#262C3A] mx-0.5" />

                    {/* Font Dropdown (Aa) */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => {
                                setFontMenuOpen((prev) => !prev);
                                setColorMenuOpen(false);
                                setAlignMenuOpen(false);
                            }}
                            title="Font chữ"
                            className={`h-7 px-2 rounded-[5px] flex items-center gap-1.5 transition-all cursor-pointer ${
                                fontMenuOpen
                                    ? "bg-[#1E2533] text-white"
                                    : "text-[#9A9DA3] hover:text-[#F0F1F2] hover:bg-[#1E2533]"
                            }`}
                        >
                            <FontAwesomeIcon icon={faFont} className="text-[11px]" />
                            <span className="text-[11px] font-bold truncate max-w-[56px]">
                                {activeFontMeta.label}
                            </span>
                            <FontAwesomeIcon icon={faChevronDown} className="text-[8px] opacity-70" />
                        </button>

                        {fontMenuOpen && (
                            <div className={`absolute ${shouldOpenUpwards ? "bottom-full mb-1.5" : "top-full mt-1.5"} left-0 w-36 py-1 rounded-[8px] bg-[#141822] border border-[#2A3142] shadow-2xl z-50 flex flex-col`}>
                                {BIO_FONTS.map((f) => (
                                    <button
                                        key={f.value}
                                        type="button"
                                        onClick={() => handleSelectFont(f.value)}
                                        className={`px-3 py-1.5 text-left text-xs flex items-center justify-between hover:bg-[#1E2533] transition-colors cursor-pointer ${
                                            activeFont === f.value ? "text-[#1688E8] font-bold" : "text-[#E1E4EA]"
                                        }`}
                                    >
                                        <span className={f.className}>{f.label}</span>
                                        {activeFont === f.value && (
                                            <span className="text-[10px]">●</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Color Dropdown */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => {
                                setColorMenuOpen((prev) => !prev);
                                setFontMenuOpen(false);
                                setAlignMenuOpen(false);
                            }}
                            title="Màu sắc phong cách"
                            className={`h-7 px-2 rounded-[5px] flex items-center gap-1.5 transition-all cursor-pointer ${
                                colorMenuOpen
                                    ? "bg-[#1E2533] text-white"
                                    : "text-[#9A9DA3] hover:text-[#F0F1F2] hover:bg-[#1E2533]"
                            }`}
                        >
                            <div
                                className="w-3 h-3 rounded-full border border-white/20 shadow-xs"
                                style={{ backgroundColor: activeColorMeta.badgeBg }}
                            />
                            <FontAwesomeIcon icon={faChevronDown} className="text-[8px] opacity-70" />
                        </button>

                        {colorMenuOpen && (
                            <div className={`absolute ${shouldOpenUpwards ? "bottom-full mb-1.5" : "top-full mt-1.5"} left-0 w-36 p-1.5 rounded-[8px] bg-[#141822] border border-[#2A3142] shadow-2xl z-50 flex flex-col gap-1`}>
                                {BIO_COLORS.map((c) => (
                                    <button
                                        key={c.value}
                                        type="button"
                                        onClick={() => handleSelectColor(c.value)}
                                        className={`px-2.5 py-1.5 rounded-[5px] text-left text-xs flex items-center gap-2 hover:bg-[#1E2533] transition-colors cursor-pointer ${
                                            activeColor === c.value
                                                ? "bg-[#1688E8]/10 text-white font-bold"
                                                : "text-[#E1E4EA]"
                                        }`}
                                    >
                                        <div
                                            className="w-3 h-3 rounded-full shrink-0 border border-white/20"
                                            style={{ backgroundColor: c.badgeBg }}
                                        />
                                        <span className="truncate">{c.label}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="w-[1px] h-4 bg-[#262C3A] mx-0.5" />

                    {/* Align Dropdown */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => {
                                setAlignMenuOpen((prev) => !prev);
                                setFontMenuOpen(false);
                                setColorMenuOpen(false);
                            }}
                            title="Căn chỉnh dòng"
                            className={`w-7 h-7 rounded-[5px] flex items-center justify-center transition-all cursor-pointer ${
                                alignMenuOpen
                                    ? "bg-[#1E2533] text-white"
                                    : "text-[#9A9DA3] hover:text-[#F0F1F2] hover:bg-[#1E2533]"
                            }`}
                        >
                            <FontAwesomeIcon
                                icon={
                                    activeAlign === "center"
                                        ? faAlignCenter
                                        : activeAlign === "right"
                                        ? faAlignRight
                                        : faAlignLeft
                                }
                                className="text-xs"
                            />
                        </button>

                        {alignMenuOpen && (
                            <div className={`absolute ${shouldOpenUpwards ? "bottom-full mb-1.5" : "top-full mt-1.5"} right-0 py-1 px-1 rounded-[8px] bg-[#141822] border border-[#2A3142] shadow-2xl z-50 flex items-center gap-1`}>
                                {BIO_ALIGNMENTS.map((a) => (
                                    <button
                                        key={a.value}
                                        type="button"
                                        onClick={() => handleSelectAlign(a.value)}
                                        title={a.label}
                                        className={`w-7 h-7 rounded-[5px] flex items-center justify-center transition-colors cursor-pointer ${
                                            activeAlign === a.value
                                                ? "bg-[#1688E8] text-white"
                                                : "text-[#9A9DA3] hover:text-white hover:bg-[#1E2533]"
                                        }`}
                                    >
                                        <FontAwesomeIcon
                                            icon={
                                                a.value === "center"
                                                    ? faAlignCenter
                                                    : a.value === "right"
                                                    ? faAlignRight
                                                    : faAlignLeft
                                            }
                                            className="text-xs"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>,
                document.body
            )}

            {/* ── INLINE WYSIWYG CONTENTEDITABLE AREA ── */}
            <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                data-placeholder={placeholder}
                className="outline-none min-h-[4.5rem] w-full flex flex-col gap-1 text-sm select-text cursor-text leading-relaxed text-[#F0F1F2] empty:before:content-[attr(data-placeholder)] empty:before:text-[#555A65] empty:before:pointer-events-none"
            />

            {/* ── SUBTLE BOTTOM META ROW (Presets + Live Character Counter) ── */}
            <div className="mt-3 pt-2.5 border-t border-[#1F2532]/60 flex items-center justify-between text-[11px] text-[#6A707E] select-none">
                {/* Presets dropdown chip */}
                <div className="relative" ref={presetContainerRef}>
                    <button
                        type="button"
                        onClick={() => setPresetMenuOpen((prev) => !prev)}
                        className="flex items-center gap-1.5 px-2 py-0.5 rounded-[5px] bg-[#181D26] hover:bg-[#202735] text-[#9A9FA9] hover:text-[#F0F1F2] border border-[#252C3B]/70 transition-all cursor-pointer text-[10px] font-semibold"
                    >
                        <FontAwesomeIcon icon={faWandMagicSparkles} className="text-[#1688E8] text-[9px]" />
                        <span>Mẫu phong cách</span>
                        <FontAwesomeIcon icon={faChevronDown} className="text-[8px] opacity-70" />
                    </button>

                    {presetMenuOpen && (
                        <div className="absolute bottom-full mb-1.5 left-0 w-44 py-1.5 rounded-[8px] bg-[#141822] border border-[#2A3142] shadow-2xl z-50 flex flex-col">
                            <div className="px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-[#636875] border-b border-[#202533]">
                                Mẫu bio có sẵn
                            </div>
                            {BIO_PRESETS.map((p) => (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => handleApplyPreset(p)}
                                    className="px-2.5 py-1.5 text-left text-xs hover:bg-[#1E2533] transition-colors flex items-center gap-2 cursor-pointer group/btn"
                                >
                                    <span className="text-sm">{p.icon}</span>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-[#E1E4EA] group-hover/btn:text-white font-bold leading-tight truncate">
                                            {p.name}
                                        </span>
                                        <span className="text-[10px] text-[#717684] truncate">
                                            {p.description}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Character Counter */}
                <div className="flex items-center gap-1.5">
                    <span
                        className={`font-mono font-medium transition-colors ${
                            isOverLimit
                                ? "text-rose-500 font-bold"
                                : charCount > 250
                                ? "text-amber-400 font-bold"
                                : "text-[#717684]"
                        }`}
                    >
                        {charCount} / {MAX_BIO_CHAR_LIMIT}
                    </span>
                    {isOverLimit && (
                        <span className="text-rose-500 text-[10px] font-bold">
                            (Vượt quá giới hạn)
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};
