import React, { useState, useEffect, useRef, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBold,
    faItalic,
    faStrikethrough,
    faPlus,
    faTrashCan,
    faChevronDown,
    faWandMagicSparkles,
    faDesktop,
    faPenToSquare,
    faEye,
    faRotateLeft,
} from "@fortawesome/free-solid-svg-icons";
import type { BioDocument, BioBlock, BioFont, BioColor, BioAlign, BioPreset } from "./types";
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
    getBioFontClass,
    getBioColorClass,
} from "./utils";
import { BioRenderer } from "./BioRenderer";

interface BioEditorProps {
    value?: string;
    onChange: (serialized: string) => void;
    onSave?: () => void;
    onCancel?: () => void;
}

export const BioEditor: React.FC<BioEditorProps> = ({
    value,
    onChange,
}) => {
    // Current parsed bio document
    const [doc, setDoc] = useState<BioDocument>(() => parseBio(value));
    const [activeLineIndex, setActiveLineIndex] = useState<number>(0);
    const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");
    const [isFontDropdownOpen, setIsFontDropdownOpen] = useState(false);
    const [isPresetDropdownOpen, setIsPresetDropdownOpen] = useState(false);
    const fontDropdownRef = useRef<HTMLDivElement>(null);
    const presetDropdownRef = useRef<HTMLDivElement>(null);
    const lineInputsRef = useRef<(HTMLInputElement | null)[]>([]);

    // Sync from external value if prop changes significantly
    const [prevValue, setPrevValue] = useState(value);
    if (value !== prevValue) {
        setPrevValue(value);
        const next = parseBio(value);
        if (serializeBio(doc) !== serializeBio(next)) {
            setDoc(next);
        }
    }

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (fontDropdownRef.current && !fontDropdownRef.current.contains(e.target as Node)) {
                setIsFontDropdownOpen(false);
            }
            if (presetDropdownRef.current && !presetDropdownRef.current.contains(e.target as Node)) {
                setIsPresetDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const charCount = useMemo(() => getBioCharacterCount(doc), [doc]);
    const isOverLimit = charCount > MAX_BIO_CHAR_LIMIT;

    // Helper to update doc and propagate to parent
    const updateDoc = (newDoc: BioDocument) => {
        setDoc(newDoc);
        onChange(serializeBio(newDoc));
    };

    // Safely get active block
    const safeActiveIndex = Math.min(Math.max(0, activeLineIndex), Math.max(0, doc.blocks.length - 1));
    const activeBlock: BioBlock = doc.blocks[safeActiveIndex] || {
        type: "paragraph",
        align: "left",
        spans: [{ text: "", font: "inter", color: "default" }],
    };

    // Primary span of active block
    const activePrimarySpan = activeBlock.spans[0] || {
        text: "",
        font: "inter" as BioFont,
        color: "default" as BioColor,
    };

    // Handlers for active line formatting
    const handleSetFont = (font: BioFont) => {
        const updatedBlocks = [...doc.blocks];
        const block = { ...updatedBlocks[safeActiveIndex] };
        block.spans = block.spans.map((span) => ({ ...span, font }));
        updatedBlocks[safeActiveIndex] = block;
        updateDoc({ ...doc, blocks: updatedBlocks });
        setIsFontDropdownOpen(false);
    };

    const handleSetColor = (color: BioColor) => {
        const updatedBlocks = [...doc.blocks];
        const block = { ...updatedBlocks[safeActiveIndex] };
        block.spans = block.spans.map((span) => ({ ...span, color }));
        updatedBlocks[safeActiveIndex] = block;
        updateDoc({ ...doc, blocks: updatedBlocks });
    };

    const handleSetAlign = (align: BioAlign) => {
        const updatedBlocks = [...doc.blocks];
        updatedBlocks[safeActiveIndex] = {
            ...updatedBlocks[safeActiveIndex],
            align,
        };
        updateDoc({ ...doc, blocks: updatedBlocks });
    };

    const handleToggleBold = () => {
        const updatedBlocks = [...doc.blocks];
        const block = { ...updatedBlocks[safeActiveIndex] };
        const nextBold = !block.spans[0]?.bold;
        block.spans = block.spans.map((span) => ({ ...span, bold: nextBold }));
        updatedBlocks[safeActiveIndex] = block;
        updateDoc({ ...doc, blocks: updatedBlocks });
    };

    const handleToggleItalic = () => {
        const updatedBlocks = [...doc.blocks];
        const block = { ...updatedBlocks[safeActiveIndex] };
        const nextItalic = !block.spans[0]?.italic;
        block.spans = block.spans.map((span) => ({ ...span, italic: nextItalic }));
        updatedBlocks[safeActiveIndex] = block;
        updateDoc({ ...doc, blocks: updatedBlocks });
    };

    const handleToggleStrike = () => {
        const updatedBlocks = [...doc.blocks];
        const block = { ...updatedBlocks[safeActiveIndex] };
        const nextStrike = !block.spans[0]?.strikethrough;
        block.spans = block.spans.map((span) => ({ ...span, strikethrough: nextStrike }));
        updatedBlocks[safeActiveIndex] = block;
        updateDoc({ ...doc, blocks: updatedBlocks });
    };

    // Text editing on a line
    const handleLineTextChange = (lineIndex: number, text: string) => {
        const updatedBlocks = [...doc.blocks];
        const block = { ...updatedBlocks[lineIndex] };
        if (block.spans.length === 0) {
            block.spans = [{ text, font: "inter", color: "default" }];
        } else {
            // Keep first span styling or update single span text
            block.spans = [{ ...block.spans[0], text }];
        }
        updatedBlocks[lineIndex] = block;
        updateDoc({ ...doc, blocks: updatedBlocks });
    };

    const handleAddLine = (afterIndex?: number) => {
        const insertAt = afterIndex !== undefined ? afterIndex + 1 : doc.blocks.length;
        const previousBlock = doc.blocks[safeActiveIndex];
        const newBlock: BioBlock = {
            type: "paragraph",
            align: previousBlock ? previousBlock.align : "left",
            spans: [
                {
                    text: "",
                    font: previousBlock?.spans[0]?.font || "inter",
                    color: previousBlock?.spans[0]?.color || "default",
                    bold: false,
                    italic: false,
                    strikethrough: false,
                },
            ],
        };
        const updatedBlocks = [...doc.blocks];
        updatedBlocks.splice(insertAt, 0, newBlock);
        updateDoc({ ...doc, blocks: updatedBlocks });
        setActiveLineIndex(insertAt);
        setTimeout(() => {
            lineInputsRef.current[insertAt]?.focus();
        }, 30);
    };

    const handleDeleteLine = (lineIndex: number) => {
        if (doc.blocks.length <= 1) {
            // Clear the single line rather than deleting it
            handleLineTextChange(0, "");
            return;
        }
        const updatedBlocks = doc.blocks.filter((_, idx) => idx !== lineIndex);
        updateDoc({ ...doc, blocks: updatedBlocks });
        const nextActive = Math.max(0, lineIndex - 1);
        setActiveLineIndex(nextActive);
        setTimeout(() => {
            lineInputsRef.current[nextActive]?.focus();
        }, 30);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, lineIndex: number) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAddLine(lineIndex);
        } else if (e.key === "Backspace" && (e.target as HTMLInputElement).value === "" && doc.blocks.length > 1) {
            e.preventDefault();
            handleDeleteLine(lineIndex);
        } else if (e.key === "ArrowUp" && lineIndex > 0) {
            e.preventDefault();
            setActiveLineIndex(lineIndex - 1);
            lineInputsRef.current[lineIndex - 1]?.focus();
        } else if (e.key === "ArrowDown" && lineIndex < doc.blocks.length - 1) {
            e.preventDefault();
            setActiveLineIndex(lineIndex + 1);
            lineInputsRef.current[lineIndex + 1]?.focus();
        }
    };

    const handleApplyPreset = (preset: BioPreset) => {
        updateDoc(preset.document);
        setActiveLineIndex(0);
        setIsPresetDropdownOpen(false);
    };

    const handleResetToClean = () => {
        updateDoc({
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
        });
        setActiveLineIndex(0);
    };

    const activeFontConfig = BIO_FONTS.find((f) => f.value === activePrimarySpan.font) || BIO_FONTS[0];

    return (
        <div className="flex flex-col gap-3.5 w-full bg-[#0D0F14] border border-[#1F2430] rounded-[12px] p-3.5 sm:p-4 shadow-lg text-[#F0F1F2]">
            {/* ── HEADER: PROFILE FORGE BRANDING & PRESETS ──────── */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#1A1F2A]">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-[7px] bg-[#1688E8]/15 border border-[#1688E8]/30 flex items-center justify-center text-[#1688E8]">
                        <FontAwesomeIcon icon={faWandMagicSparkles} className="text-xs" />
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-black uppercase tracking-wider text-[#F0F1F2]">
                                Profile Forge
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-[#1688E8]/20 text-[#1688E8]">
                                Bio Rich Text
                            </span>
                        </div>
                        <span className="text-[11px] text-[#8A8F98]">
                            Tùy biến tiểu sử cá nhân với font chữ & phong cách game thủ
                        </span>
                    </div>
                </div>

                {/* Presets Button & Character Counter */}
                <div className="flex items-center gap-2">
                    {/* Presets dropdown */}
                    <div className="relative" ref={presetDropdownRef}>
                        <button
                            type="button"
                            onClick={() => setIsPresetDropdownOpen(!isPresetDropdownOpen)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] bg-[#171B24] hover:bg-[#202532] border border-[#262C3A] text-xs font-semibold text-[#D4D7DE] transition-all cursor-pointer"
                        >
                            <span className="text-xs">⚡</span>
                            <span>Mẫu Preset</span>
                            <FontAwesomeIcon icon={faChevronDown} className="text-[10px] opacity-70" />
                        </button>

                        {isPresetDropdownOpen && (
                            <div className="absolute right-0 top-full mt-1.5 w-56 bg-[#13161D] border border-[#252B3A] rounded-[10px] shadow-2xl p-1.5 z-40 animate-fade-in flex flex-col gap-1">
                                <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#666B75]">
                                    Chọn phong cách mẫu
                                </span>
                                {BIO_PRESETS.map((preset) => (
                                    <button
                                        key={preset.id}
                                        type="button"
                                        onClick={() => handleApplyPreset(preset)}
                                        className="flex items-center justify-between px-2.5 py-2 rounded-[6px] hover:bg-[#1C212D] text-left transition-colors cursor-pointer group"
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-[#F0F1F2] group-hover:text-[#1688E8] transition-colors">
                                                {preset.name}
                                            </span>
                                            <span className="text-[10px] text-[#8A8F98] line-clamp-1">
                                                {preset.description}
                                            </span>
                                        </div>
                                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#1C212D] text-[#8A8F98] group-hover:text-white">
                                            {preset.badge}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Reset Button */}
                    <button
                        type="button"
                        onClick={handleResetToClean}
                        title="Xóa trắng / Làm mới"
                        className="w-8 h-8 rounded-[6px] bg-[#171B24] hover:bg-[#202532] border border-[#262C3A] text-[#8A8F98] hover:text-[#F0F1F2] flex items-center justify-center transition-all cursor-pointer"
                    >
                        <FontAwesomeIcon icon={faRotateLeft} className="text-xs" />
                    </button>

                    {/* Character counter */}
                    <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-[6px] bg-[#13161D] border border-[#1F2430]">
                        <span className={`text-[11px] font-mono font-bold ${isOverLimit ? "text-rose-500" : charCount >= MAX_BIO_CHAR_LIMIT * 0.85 ? "text-amber-400" : "text-[#8A8F98]"}`}>
                            {charCount}
                        </span>
                        <span className="text-[10px] text-[#666B75] font-mono">/ {MAX_BIO_CHAR_LIMIT}</span>
                    </div>
                </div>
            </div>

            {/* ── MOBILE TABS SWITCHER (Edit vs Preview) ────────── */}
            <div className="flex md:hidden items-center p-1 bg-[#13161D] rounded-[8px] border border-[#1F2430]">
                <button
                    type="button"
                    onClick={() => setMobileTab("edit")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-[6px] transition-all cursor-pointer ${
                        mobileTab === "edit"
                            ? "bg-[#1688E8] text-white shadow-sm"
                            : "text-[#8A8F98] hover:text-[#F0F1F2]"
                    }`}
                >
                    <FontAwesomeIcon icon={faPenToSquare} className="text-xs" />
                    <span>Soạn thảo</span>
                </button>
                <button
                    type="button"
                    onClick={() => setMobileTab("preview")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-[6px] transition-all cursor-pointer ${
                        mobileTab === "preview"
                            ? "bg-[#1688E8] text-white shadow-sm"
                            : "text-[#8A8F98] hover:text-[#F0F1F2]"
                    }`}
                >
                    <FontAwesomeIcon icon={faEye} className="text-xs" />
                    <span>Xem trước (Preview)</span>
                </button>
            </div>

            {/* ── MAIN WORKSPACE: DESKTOP SIDE-BY-SIDE ──────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* ── LEFT: EDITOR COLUMN ──────────────────────── */}
                <div className={`flex flex-col gap-3 ${mobileTab === "preview" ? "hidden md:flex" : "flex"}`}>
                    {/* FORMATTING TOOLBAR */}
                    <div className="flex flex-wrap items-center gap-1.5 p-2 bg-[#13161D] border border-[#1F2430] rounded-[8px]">
                        {/* 1. Font Selector Dropdown */}
                        <div className="relative" ref={fontDropdownRef}>
                            <button
                                type="button"
                                onClick={() => setIsFontDropdownOpen(!isFontDropdownOpen)}
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-[#1A1F2B] hover:bg-[#232938] border border-[#2A3142] text-xs font-semibold text-[#F0F1F2] transition-colors cursor-pointer"
                                title="Chọn kiểu font"
                            >
                                <span className={`text-xs ${activeFontConfig.className}`}>
                                    {activeFontConfig.label}
                                </span>
                                <FontAwesomeIcon icon={faChevronDown} className="text-[9px] opacity-70" />
                            </button>

                            {isFontDropdownOpen && (
                                <div className="absolute left-0 top-full mt-1 w-44 bg-[#151922] border border-[#282F40] rounded-[8px] shadow-xl p-1 z-50 animate-fade-in flex flex-col gap-0.5">
                                    {BIO_FONTS.map((font) => (
                                        <button
                                            key={font.value}
                                            type="button"
                                            onClick={() => handleSetFont(font.value)}
                                            className={`flex items-center justify-between px-2.5 py-1.5 rounded-[5px] text-xs transition-colors cursor-pointer ${
                                                activePrimarySpan.font === font.value
                                                    ? "bg-[#1688E8]/20 text-[#1688E8] font-bold"
                                                    : "text-[#D4D7DE] hover:bg-[#1E2432]"
                                            }`}
                                        >
                                            <span className={font.className}>{font.label}</span>
                                            <span className="text-[10px] text-[#666B75]">{font.preview}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Divider */}
                        <div className="w-[1px] h-5 bg-[#252B3A] mx-0.5" />

                        {/* 2. Text Styles (Bold, Italic, Strikethrough) */}
                        <button
                            type="button"
                            onClick={handleToggleBold}
                            className={`w-7 h-7 rounded-[5px] flex items-center justify-center text-xs transition-all cursor-pointer ${
                                activePrimarySpan.bold
                                    ? "bg-[#1688E8] text-white shadow-xs"
                                    : "bg-[#1A1F2B] hover:bg-[#232938] text-[#9A9DA3] hover:text-[#F0F1F2]"
                            }`}
                            title="In đậm (Bold)"
                        >
                            <FontAwesomeIcon icon={faBold} />
                        </button>
                        <button
                            type="button"
                            onClick={handleToggleItalic}
                            className={`w-7 h-7 rounded-[5px] flex items-center justify-center text-xs transition-all cursor-pointer ${
                                activePrimarySpan.italic
                                    ? "bg-[#1688E8] text-white shadow-xs"
                                    : "bg-[#1A1F2B] hover:bg-[#232938] text-[#9A9DA3] hover:text-[#F0F1F2]"
                            }`}
                            title="In nghiêng (Italic)"
                        >
                            <FontAwesomeIcon icon={faItalic} />
                        </button>
                        <button
                            type="button"
                            onClick={handleToggleStrike}
                            className={`w-7 h-7 rounded-[5px] flex items-center justify-center text-xs transition-all cursor-pointer ${
                                activePrimarySpan.strikethrough
                                    ? "bg-[#1688E8] text-white shadow-xs"
                                    : "bg-[#1A1F2B] hover:bg-[#232938] text-[#9A9DA3] hover:text-[#F0F1F2]"
                            }`}
                            title="Gạch ngang (Strikethrough)"
                        >
                            <FontAwesomeIcon icon={faStrikethrough} />
                        </button>

                        {/* Divider */}
                        <div className="w-[1px] h-5 bg-[#252B3A] mx-0.5" />

                        {/* 3. Alignments (Left, Center, Right) */}
                        {BIO_ALIGNMENTS.map((align) => (
                            <button
                                key={align.value}
                                type="button"
                                onClick={() => handleSetAlign(align.value)}
                                className={`w-7 h-7 rounded-[5px] flex items-center justify-center text-xs transition-all cursor-pointer ${
                                    activeBlock.align === align.value
                                        ? "bg-[#1688E8] text-white shadow-xs"
                                        : "bg-[#1A1F2B] hover:bg-[#232938] text-[#9A9DA3] hover:text-[#F0F1F2]"
                                }`}
                                title={`Căn ${align.label}`}
                            >
                                <FontAwesomeIcon icon={align.icon} />
                            </button>
                        ))}

                        {/* Divider */}
                        <div className="w-[1px] h-5 bg-[#252B3A] mx-0.5" />

                        {/* 4. Semantic Color Chips */}
                        <div className="flex items-center gap-1 pl-0.5">
                            {BIO_COLORS.map((color) => {
                                const isSelected = (activePrimarySpan.color || "default") === color.value;
                                return (
                                    <button
                                        key={color.value}
                                        type="button"
                                        onClick={() => handleSetColor(color.value)}
                                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                                            isSelected ? "ring-2 ring-[#1688E8] ring-offset-1 ring-offset-[#13161D] scale-110" : "opacity-75 hover:opacity-100 hover:scale-105"
                                        }`}
                                        title={`Màu ${color.label}`}
                                    >
                                        <span className={`w-3.5 h-3.5 rounded-full ${color.bgClass} shadow-xs`} />
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* INTERACTIVE LINES EDITOR */}
                    <div className="flex flex-col gap-2 min-h-[160px] max-h-[300px] overflow-y-auto p-2 bg-[#0A0C10] border border-[#1A1F2A] rounded-[8px]">
                        {doc.blocks.map((block, lineIdx) => {
                            const isFocused = lineIdx === safeActiveIndex;
                            const currentSpan = block.spans[0] || { text: "", font: "inter", color: "default" };
                            const fontCls = getBioFontClass(currentSpan.font);
                            const colorCls = getBioColorClass(currentSpan.color);
                            const alignCls =
                                block.align === "center"
                                    ? "text-center"
                                    : block.align === "right"
                                    ? "text-right"
                                    : "text-left";

                            return (
                                <div
                                    key={lineIdx}
                                    onClick={() => setActiveLineIndex(lineIdx)}
                                    className={`flex items-center gap-2 p-1.5 rounded-[6px] border transition-all ${
                                        isFocused
                                            ? "bg-[#141822] border-[#1688E8]/50 shadow-xs"
                                            : "bg-[#0F1218] border-transparent hover:border-[#1E2432]"
                                    }`}
                                >
                                    {/* Line Number indicator */}
                                    <span className="w-5 text-[10px] font-mono text-[#555B66] text-right shrink-0 select-none">
                                        {lineIdx + 1}
                                    </span>

                                    {/* Line Input */}
                                    <input
                                        ref={(el) => (lineInputsRef.current[lineIdx] = el)}
                                        type="text"
                                        value={currentSpan.text}
                                        onFocus={() => setActiveLineIndex(lineIdx)}
                                        onChange={(e) => handleLineTextChange(lineIdx, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(e, lineIdx)}
                                        placeholder={lineIdx === 0 ? "Nhập dòng đầu tiên của Bio..." : "Dòng tiếp theo..."}
                                        className={`flex-1 bg-transparent border-none outline-none text-xs leading-relaxed ${alignCls} ${fontCls} ${colorCls} ${
                                            currentSpan.bold ? "font-bold" : ""
                                        } ${currentSpan.italic ? "italic" : ""} ${
                                            currentSpan.strikethrough ? "line-through" : ""
                                        }`}
                                    />

                                    {/* Quick Line Delete */}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteLine(lineIdx);
                                        }}
                                        className="w-5 h-5 rounded flex items-center justify-center text-[#555B66] hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0"
                                        title="Xóa dòng"
                                    >
                                        <FontAwesomeIcon icon={faTrashCan} className="text-[10px]" />
                                    </button>
                                </div>
                            );
                        })}

                        {/* + Add Line Button */}
                        <button
                            type="button"
                            onClick={() => handleAddLine()}
                            className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-[6px] border border-dashed border-[#242A38] hover:border-[#1688E8]/50 bg-transparent hover:bg-[#141822] text-xs font-semibold text-[#8A8F98] hover:text-[#1688E8] transition-all cursor-pointer mt-1"
                        >
                            <FontAwesomeIcon icon={faPlus} className="text-[10px]" />
                            <span>Thêm dòng mới (Enter)</span>
                        </button>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-[#666B75] px-1">
                        <span>Nhấn <b>Enter</b> để xuống dòng mới • <b>Backspace</b> để xóa dòng trống</span>
                        <span>Đã lưu tự động</span>
                    </div>
                </div>

                {/* ── RIGHT: LIVE PREVIEW COLUMN ───────────────── */}
                <div className={`flex flex-col gap-2 ${mobileTab === "edit" ? "hidden md:flex" : "flex"}`}>
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-1.5">
                            <FontAwesomeIcon icon={faDesktop} className="text-xs text-[#1688E8]" />
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#A0A5AF]">
                                Xem trước trực tiếp (Live Preview)
                            </span>
                        </div>
                        <span className="text-[10px] font-medium text-[#666B75]">
                            Cách hiển thị trên hồ sơ
                        </span>
                    </div>

                    {/* Replica of Profile Identity Bio Container */}
                    <div className="flex flex-col justify-center min-h-[190px] bg-[#0A0C0E] border border-[#181C24] rounded-[10px] p-4 relative overflow-hidden shadow-inner">
                        {/* Ambient subtle glow */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#1688E8]/5 rounded-full blur-2xl pointer-events-none" />

                        <div className="bg-[#13161C] p-3.5 rounded-[8px] border border-[#1A1F2A] relative z-10">
                            <BioRenderer bio={doc} emptyPlaceholder="Tiểu sử hiển thị tại đây khi bạn nhập nội dung..." />
                        </div>
                    </div>

                    <p className="text-[10px] text-[#666B75] italic px-1 text-center">
                        Màu sắc và font chữ sẽ hiển thị chuẩn xác theo preset bạn chọn trên mọi thiết bị.
                    </p>
                </div>
            </div>
        </div>
    );
};
