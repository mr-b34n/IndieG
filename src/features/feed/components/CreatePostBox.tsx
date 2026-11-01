import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { 
    faChevronDown, 
    faCheck, 
    faXmark, 
    faTriangleExclamation,
    faBold,
    faItalic,
    faStrikethrough,
    faListUl,
    faLink,
    faQuoteLeft,
    faImage,
    faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "@/shared/hooks/useTranslate";
import { useHotkeys } from "@/shared/hooks/useHotkeys";
import { useRegisterOverlay } from "@/shared/utils/overlayManager";
import { RichTextEditor } from "@/shared/components/ui/RichTextEditor";

import { createAttachmentFromFile, type EditableAttachment, prepareAttachmentsForSave } from "@/features/post/helpers/postAttachments";
import { useAuthStore } from "@/features/auth";
import { useCommunitiesStore, type CommunityData } from "@/features/community";
import { AttachmentPicker, useDraftsStore, getCurrentAuthor, usePostsStore } from "@/features/post";
import { type CreatePostPayload, type PostDataWithSettings } from "../types";
import { HASHTAG_REGEX } from "../constants";
import { useCreatePostModalStore } from "../store/useCreatePostModalStore";
import { DEFAULT_AVATAR as avatarGame } from "@/shared/constants/images";
import { useCreatePostMutation } from "@/shared/api/useQueries";

export type { CreatePostPayload };

const extractHashtags = (text: string): string[] => {
    const matches = text.match(HASHTAG_REGEX) ?? [];
    const seen = new Set<string>();
    matches.forEach((m) => seen.add(m.slice(1)));
    return Array.from(seen);
};

/* =========================================================================
   1. Mini Native-Looking Toggle Switch Component
   ========================================================================= */
const MiniToggle = ({
    checked,
    onChange,
    ariaLabel,
}: {
    checked: boolean;
    onChange: (v: boolean) => void;
    ariaLabel?: string;
}) => (
    <button
        type="button"
        role="switch"
        aria-label={ariaLabel}
        aria-checked={checked}
        onClick={(e) => {
            e.stopPropagation();
            onChange(!checked);
        }}
        className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full transition-colors duration-150 ease-in-out focus:outline-none focus:ring-1 focus:ring-primary/40 ${
            checked ? "bg-primary" : "bg-white/10 hover:bg-white/15"
        }`}
    >
        <span
            className={`pointer-events-none absolute top-0.5 left-0.5 h-3 w-3 rounded-full bg-white shadow-xs transition-transform duration-150 ease-in-out ${
                checked ? "translate-x-3" : "translate-x-0"
            }`}
        />
    </button>
);

/* =========================================================================
   2. Post Settings (Lightweight, Horizontal, Order: Allow comments, Spoiler, NSFW, Pin post)
   ========================================================================= */
const PostSettingsSection = ({
    allowComments,
    onAllowCommentsChange,
    pinned,
    onPinnedChange,
    isSpoiler,
    onSpoilerChange,
    isNsfw,
    onNsfwChange,
}: {
    allowComments: boolean;
    onAllowCommentsChange: (v: boolean) => void;
    pinned: boolean;
    onPinnedChange: (v: boolean) => void;
    isSpoiler: boolean;
    onSpoilerChange: (v: boolean) => void;
    isNsfw: boolean;
    onNsfwChange: (v: boolean) => void;
}) => {
    const { t, language } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const hasActiveModifiers = pinned || isSpoiler || isNsfw || !allowComments;

    return (
        <div className="pt-3 border-t border-white/[0.06] shrink-0">
            {/* Single-line lightweight trigger */}
            <div className="flex items-center justify-between">
                <button
                    type="button"
                    onClick={() => setIsOpen((prev) => !prev)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-text transition-colors select-none cursor-pointer py-1"
                >
                    <FontAwesomeIcon
                        icon={faChevronDown}
                        className={`text-[9px] text-text-faint transition-transform duration-150 ${
                            isOpen ? "rotate-180 text-primary" : ""
                        }`}
                    />
                    <span>{t('feed.postSettings', { defaultValue: 'Tùy chọn bài viết' })}</span>

                    {/* Subtle inline summary badges when collapsed */}
                    {hasActiveModifiers && !isOpen && (
                        <span className="flex items-center gap-1.5 ml-2">
                            {!allowComments && (
                                <span className="text-[10px] text-text-faint font-medium bg-white/[0.04] px-1.5 py-0.2 rounded">
                                    {language === "vi" ? "Tắt bình luận" : "Comments off"}
                                </span>
                            )}
                            {isSpoiler && (
                                <span className="text-[10px] text-amber-400 font-medium bg-amber-400/10 px-1.5 py-0.2 rounded">
                                    Spoiler
                                </span>
                            )}
                            {isNsfw && (
                                <span className="text-[10px] text-rose-400 font-medium bg-rose-400/10 px-1.5 py-0.2 rounded">
                                    18+ NSFW
                                </span>
                            )}
                            {pinned && (
                                <span className="text-[10px] text-primary font-medium bg-primary/10 px-1.5 py-0.2 rounded">
                                    {language === "vi" ? "Ghim" : "Pinned"}
                                </span>
                            )}
                        </span>
                    )}
                </button>
            </div>

            {/* Expanded lightweight settings: No card backgrounds, no borders, order: Allow comments, Spoiler, NSFW, Pin post */}
            {isOpen && (
                <div className="flex flex-wrap items-center gap-x-8 gap-y-3 pt-2.5 pb-1 animate-fade-in text-xs">
                    {/* 1. Allow comments */}
                    <div
                        className="flex items-center gap-2.5 cursor-pointer select-none"
                        onClick={() => onAllowCommentsChange(!allowComments)}
                    >
                        <span className="text-xs font-medium text-text-muted hover:text-text transition-colors">
                            {t('feed.allowComments', { defaultValue: 'Cho phép bình luận' })}
                        </span>
                        <MiniToggle
                            checked={allowComments}
                            onChange={onAllowCommentsChange}
                            ariaLabel={t('feed.allowComments', { defaultValue: 'Cho phép bình luận' })}
                        />
                    </div>

                    {/* 2. Spoiler */}
                    <div
                        className="flex items-center gap-2.5 cursor-pointer select-none"
                        onClick={() => onSpoilerChange(!isSpoiler)}
                    >
                        <span className="text-xs font-medium text-text-muted hover:text-text transition-colors">
                            {t('feed.warningSpoiler', { defaultValue: 'Cảnh báo Spoiler' })}
                        </span>
                        <MiniToggle
                            checked={isSpoiler}
                            onChange={onSpoilerChange}
                            ariaLabel={t('feed.warningSpoiler', { defaultValue: 'Cảnh báo Spoiler' })}
                        />
                    </div>

                    {/* 3. NSFW */}
                    <div
                        className="flex items-center gap-2.5 cursor-pointer select-none"
                        onClick={() => onNsfwChange(!isNsfw)}
                    >
                        <span className="text-xs font-medium text-text-muted hover:text-text transition-colors">
                            {t('feed.warningNsfw', { defaultValue: 'Cảnh báo 18+ (NSFW)' })}
                        </span>
                        <MiniToggle
                            checked={isNsfw}
                            onChange={onNsfwChange}
                            ariaLabel={t('feed.warningNsfw', { defaultValue: 'Cảnh báo 18+ (NSFW)' })}
                        />
                    </div>

                    {/* 4. Pin post */}
                    <div
                        className="flex items-center gap-2.5 cursor-pointer select-none"
                        onClick={() => onPinnedChange(!pinned)}
                    >
                        <span className="text-xs font-medium text-text-muted hover:text-text transition-colors">
                            {t('feed.pinPost', { defaultValue: 'Ghim bài viết' })}
                        </span>
                        <MiniToggle
                            checked={pinned}
                            onChange={onPinnedChange}
                            ariaLabel={t('feed.pinPost', { defaultValue: 'Ghim bài viết' })}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

/* =========================================================================
   3. Contextual Community Control (Minimalist Inline Selector)
   ========================================================================= */
export const CommunitySelector = ({
    value,
    onChange,
    communities,
    hasError = false,
}: {
    value: number | string | null;
    onChange: (id: number | string | null) => void;
    communities: CommunityData[];
    hasError?: boolean;
}) => {
    const { t, language } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [filterQuery, setFilterQuery] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedCommunity = useMemo(
        () => communities.find((c) => String(c.id) === String(value)) || null,
        [communities, value]
    );

    const filteredCommunities = useMemo(() => {
        if (!filterQuery.trim()) return communities;
        const q = filterQuery.toLowerCase();
        return communities.filter(
            (c) => c.name.toLowerCase().includes(q) || (c.tag && c.tag.toLowerCase().includes(q))
        );
    }, [communities, filterQuery]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative inline-block" ref={dropdownRef}>
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => {
                        setIsOpen((prev) => !prev);
                        setFilterQuery("");
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text transition-colors select-none group cursor-pointer py-0.5"
                >
                    <span className="text-text-faint font-normal">{language === "vi" ? "Đăng trong" : "Posting in"}</span>
                    {selectedCommunity ? (
                        <span className="inline-flex items-center gap-1.5 font-semibold text-text">
                            {selectedCommunity.logo ? (
                                <img
                                    src={selectedCommunity.logo}
                                    alt=""
                                    className="w-3.5 h-3.5 rounded object-cover ring-1 ring-white/10"
                                />
                            ) : (
                                <span className="w-3.5 h-3.5 rounded bg-primary/20 text-primary flex items-center justify-center font-bold text-[9px]">
                                    {selectedCommunity.name.charAt(0)}
                                </span>
                            )}
                            <span className="underline decoration-white/20 underline-offset-4 group-hover:decoration-primary/60 transition-colors">
                                {selectedCommunity.name}
                            </span>
                        </span>
                    ) : (
                        <span className={`font-medium ${hasError ? "text-rose-400" : "text-text-faint group-hover:text-text-muted"} underline decoration-dotted underline-offset-4`}>
                            {t('feed.selectCommunityPlaceholder', { defaultValue: 'Chọn cộng đồng...' })}
                        </span>
                    )}
                    <FontAwesomeIcon
                        icon={faChevronDown}
                        className={`text-[9px] text-text-faint group-hover:text-text-muted transition-transform ml-0.5 ${
                            isOpen ? "rotate-180 text-primary" : ""
                        }`}
                    />
                </button>

                {hasError && !selectedCommunity && (
                    <span className="text-[11px] text-rose-400 font-medium animate-fade-in">
                        {t('feed.selectCommunityRequired', { defaultValue: 'Vui lòng chọn một cộng đồng' })}
                    </span>
                )}
            </div>

            {/* Dropdown Menu (Clean, border-only elevation) */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 sm:w-72 bg-[#10131a] border border-white/[0.1] rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in p-1.5 flex flex-col gap-1 max-h-72">
                    {communities.length > 5 && (
                        <div className="px-2 py-1 border-b border-white/[0.06]">
                            <input
                                type="text"
                                value={filterQuery}
                                onChange={(e) => setFilterQuery(e.target.value)}
                                placeholder={t('common.search', { defaultValue: 'Tìm cộng đồng...' })}
                                className="w-full bg-transparent border-none outline-none text-xs text-text placeholder:text-text-faint/50 py-0.5"
                                autoFocus
                            />
                        </div>
                    )}

                    <div className="overflow-y-auto max-h-56 flex flex-col gap-0.5">
                        {filteredCommunities.length === 0 ? (
                            <div className="px-3 py-3 text-xs text-text-faint text-center">
                                {communities.length === 0
                                    ? t('feed.noCommunitiesJoined', { defaultValue: 'Chưa tham gia cộng đồng nào' })
                                    : t('search.noResults', { defaultValue: 'Không tìm thấy cộng đồng' })}
                            </div>
                        ) : (
                            filteredCommunities.map((c) => {
                                const isSelected = String(c.id) === String(value);
                                return (
                                    <button
                                        key={c.id}
                                        type="button"
                                        onClick={() => {
                                            onChange(c.id);
                                            setIsOpen(false);
                                        }}
                                        className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                                            isSelected
                                                ? "bg-primary/10 text-primary font-semibold"
                                                : "hover:bg-white/[0.05] text-text-muted hover:text-text"
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 min-w-0 truncate">
                                            {c.logo ? (
                                                <img
                                                    src={c.logo}
                                                    alt={c.name}
                                                    className="w-4 h-4 rounded object-cover"
                                                />
                                            ) : (
                                                <span className="w-4 h-4 rounded bg-primary/20 text-primary flex items-center justify-center font-bold text-[10px] shrink-0">
                                                    {c.name.charAt(0)}
                                                </span>
                                            )}
                                            <span className="truncate">{c.name}</span>
                                            {c.tag && (
                                                <span className="px-1 py-0.2 rounded text-[9px] font-bold uppercase bg-white/[0.06] text-text-faint shrink-0">
                                                    {c.tag}
                                                </span>
                                            )}
                                        </div>
                                        {isSelected && (
                                            <FontAwesomeIcon icon={faCheck} className="text-primary text-xs shrink-0 ml-1.5" />
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

/* =========================================================================
   4. Tags Input with Lightweight Removable Chips
   ========================================================================= */
const TagsInput = ({
    tags,
    onChange,
}: {
    tags: string[];
    onChange: (tags: string[]) => void;
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

/* =========================================================================
   5. Content Editor Formatting Toolbar (Preserved for compatibility)
   ========================================================================= */
export const FormattingToolbar = ({
    onFormat,
    onAddImage,
    showPreview = true,
    onTogglePreview,
}: {
    onFormat: (prefix: string, suffix?: string, placeholder?: string) => void;
    onAddImage?: () => void;
    showPreview?: boolean;
    onTogglePreview?: (show: boolean) => void;
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

/* =========================================================================
   6. CREATE POST MODAL (CONTINUOUS EDITORIAL CANVAS)
   - Centered 760-840px modal on near-black canvas
   - One continuous writing canvas with generous whitespace and clear typography
   - Compact contextual community selector
   - Borderless prominent title
   - Lightweight tags
   - Seamless Rich Text Editor with media button integrated in toolbar
   - Lightweight horizontal Post options panel
   - Minimal footer with quiet Cancel and primary Publish Post button
   ========================================================================= */
export interface CreatePostModalProps {
    isOpen?: boolean;
    onClose?: () => void;
    defaultCommunityId?: string | number | null;
    onPostCreated?: (payload: CreatePostPayload) => void;
    initialTitle?: string;
    initialContent?: string;
}

export const CreatePostModal = ({
    isOpen: propIsOpen,
    onClose: propOnClose,
    defaultCommunityId: propDefaultCommunityId,
    onPostCreated,
    initialTitle = "",
    initialContent = "",
}: CreatePostModalProps) => {
    const { t, language } = useTranslation();
    const user = useAuthStore((s) => s.user);

    const storeIsOpen = useCreatePostModalStore((s) => s.isOpen);
    const storeDefaultCommunityId = useCreatePostModalStore((s) => s.defaultCommunityId);
    const storeClose = useCreatePostModalStore((s) => s.closeCreatePost);

    const isVisible = propIsOpen !== undefined ? propIsOpen : storeIsOpen;
    const handleClose = propOnClose || storeClose;

    const effectiveDefaultCommunityId = propDefaultCommunityId !== undefined ? propDefaultCommunityId : storeDefaultCommunityId;

    const { communities, getCommunityById } = useCommunitiesStore();
    const joinedCommunities = useMemo(() => {
        const joined = communities.filter((c) => c.joined || (c as CommunityData & { isJoined?: boolean }).isJoined);
        return joined.length > 0 ? joined : communities;
    }, [communities]);

    const saveDraft = useDraftsStore((s) => s.saveDraft);
    const drafts = useDraftsStore((s) => s.drafts);
    const clearDrafts = useDraftsStore((s) => s.clearDrafts);
    const addPost = usePostsStore((s) => s.addPost);
    const createPostMutation = useCreatePostMutation();

    const [title, setTitle] = useState(initialTitle);
    const [content, setContent] = useState(initialContent);
    const [tags, setTags] = useState<string[]>([]);
    const [communityId, setCommunityId] = useState<number | string | null>(effectiveDefaultCommunityId || null);
    const [allowComments, setAllowComments] = useState(true);
    const [pinned, setPinned] = useState(false);
    const [isSpoiler, setIsSpoiler] = useState(false);
    const [isNsfw, setIsNsfw] = useState(false);
    const [attachments, setAttachments] = useState<EditableAttachment[]>([]);
    const [isPosting, setIsPosting] = useState(false);
    const [submitAttempted, setSubmitAttempted] = useState(false);

    const imageInputRef = useRef<HTMLInputElement>(null);

    // Sync effective community ID
    useEffect(() => {
        if (effectiveDefaultCommunityId !== null && effectiveDefaultCommunityId !== undefined) {
            /* eslint-disable-next-line react-hooks/set-state-in-effect */
            setCommunityId(effectiveDefaultCommunityId);
        }
    }, [effectiveDefaultCommunityId]);

    // Restore draft if available
    const hasLoadedDraft = useRef(false);
    useEffect(() => {
        if (!hasLoadedDraft.current && !initialTitle && !initialContent && drafts.length > 0) {
            hasLoadedDraft.current = true;
            const draft = drafts[0];
            /* eslint-disable react-hooks/set-state-in-effect */
            if (draft.title) setTitle(draft.title);
            if (draft.content) setContent(draft.content);
            if (draft.tags && Array.isArray(draft.tags)) setTags(draft.tags);
            if (draft.attachments && draft.attachments.length > 0) setAttachments(draft.attachments);
            if (draft.communityId && !effectiveDefaultCommunityId) setCommunityId(draft.communityId);
            if (draft.isSpoiler !== undefined) setIsSpoiler(draft.isSpoiler);
            if (draft.isNsfw !== undefined) setIsNsfw(draft.isNsfw);
            if (draft.allowComments !== undefined) setAllowComments(draft.allowComments);
            if (draft.pinned !== undefined) setPinned(draft.pinned);
            /* eslint-enable react-hooks/set-state-in-effect */
        }
    }, [drafts, initialTitle, initialContent, effectiveDefaultCommunityId]);

    const hasDraftContent = Boolean(title.trim() || content.trim() || tags.length > 0 || attachments.length > 0);

    // Auto-save draft on change/unmount
    useEffect(() => {
        if (!hasLoadedDraft.current && drafts.length > 0) return;

        if (hasDraftContent) {
            saveDraft({
                title,
                content,
                communityId,
                attachments,
                privacy: "public",
                allowComments,
                pinned,
                isSpoiler,
                isNsfw,
                tags,
            });
        } else if (drafts.length > 0) {
            clearDrafts();
        }
    }, [hasDraftContent, content, title, communityId, attachments, allowComments, pinned, isSpoiler, isNsfw, tags, saveDraft, clearDrafts, drafts.length]);

    // Alert user on refresh/close if draft exists in current tab session
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            const hasDraftInStore = drafts.length > 0 && (
                Boolean(drafts[0].title?.trim()) ||
                Boolean(drafts[0].content?.trim()) ||
                Boolean(drafts[0].tags?.length) ||
                Boolean(drafts[0].attachments?.length)
            );
            const hasDraftInState = Boolean(title.trim()) || Boolean(content.trim()) || tags.length > 0 || attachments.length > 0;

            if (hasDraftInStore || hasDraftInState) {
                e.preventDefault();
                e.returnValue = t('feed.draftUnloadWarning', {
                    defaultValue: 'Bạn có bản nháp bài viết chưa đăng. Nếu tải lại trang, bản nháp sẽ bị mất.',
                });
                return e.returnValue;
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [drafts, title, content, tags, attachments, t]);

    const handleDiscardDraft = () => {
        setTitle("");
        setContent("");
        setTags([]);
        setAttachments([]);
        setSubmitAttempted(false);
        clearDrafts();
        hasLoadedDraft.current = true;
    };

    useRegisterOverlay({
        id: "create-post-modal",
        isOpen: isVisible,
        onClose: handleClose,
        priority: 100,
    });

    const targetCommunity = useMemo(() => {
        const targetId = communityId || effectiveDefaultCommunityId;
        if (!targetId) return null;
        return communities.find((c) => String(c.id) === String(targetId)) || null;
    }, [communities, communityId, effectiveDefaultCommunityId]);

    const dynamicPlaceholder = useMemo(() => {
        if (targetCommunity) {
            return language === "vi"
                ? `Chia sẻ với cộng đồng ${targetCommunity.name}...`
                : `Share with ${targetCommunity.name}...`;
        }
        return language === "vi"
            ? "Chia sẻ khoảnh khắc, góc nhìn hoặc khám phá mới..."
            : "Share a thought, guide, or gaming moment...";
    }, [targetCommunity, language]);

    const handleQuickImageClick = () => {
        imageInputRef.current?.click();
    };

    const handleQuickImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        const newAttachments: EditableAttachment[] = [];
        Array.from(files).forEach((file) => {
            const isImage = file.type.startsWith("image/");
            newAttachments.push(createAttachmentFromFile(file, isImage ? "image" : "file"));
        });
        setAttachments((prev) => [...prev, ...newAttachments]);
        e.target.value = "";
    };

    const titleLen = title.trim().length;
    const contentLen = content.trim().length;
    const isTitleValid = titleLen === 0 || (titleLen >= 6 && titleLen <= 200);
    const isContentValid = (contentLen >= 6 || (contentLen === 0 && attachments.length > 0)) && contentLen <= 10000;
    const hasValidContent = isTitleValid && isContentValid && (titleLen > 0 || contentLen > 0 || attachments.length > 0);
    const canPost = communityId !== null && communityId !== undefined && hasValidContent && !isPosting;

    const requireVerifiedEmail = useAuthStore((state) => state.requireVerifiedEmail);

    const handlePost = async () => {
        if (!requireVerifiedEmail("đăng bài viết")) return;

        setSubmitAttempted(true);
        if (!communityId || !hasValidContent) return;

        setIsPosting(true);

        const contentHashtags = extractHashtags(content);
        const combinedTags = Array.from(new Set([...contentHashtags, ...tags]));

        const payload: CreatePostPayload = {
            title: title.trim() || undefined,
            content: content.trim(),
            communityId: communityId ?? undefined,
            privacy: "public",
            allowComments,
            pinned,
            isSpoiler,
            isNsfw,
            tags: combinedTags,
            attachments,
        };

        try {
            if (onPostCreated) {
                await onPostCreated(payload);
            } else {
                // Direct fallback submission
                const { images, files } = await prepareAttachmentsForSave(attachments);
                const comm = getCommunityById(communityId);
                const currentAuthor = getCurrentAuthor();

                const newPost: PostDataWithSettings = {
                    id: Date.now(),
                    author: currentAuthor,
                    authorAvatar: user?.avatarUrl || user?.avatar_url || avatarGame,
                    community: comm ? {
                        id: comm.id,
                        name: comm.name,
                        logo: comm.logo,
                        backdrop: comm.backdrop,
                    } : undefined,
                    communityId,
                    communityName: comm?.name,
                    gameTag: comm?.name ?? "General",
                    gameBadge: comm?.tag ?? undefined,
                    timeAgo: t('feed.justNow', { defaultValue: 'Vừa xong' }),
                    title: title.trim() || content.slice(0, 80) + (content.length > 80 ? "..." : ""),
                    content: content.trim(),
                    images: images.length > 0 ? images : undefined,
                    files: files.length > 0 ? files : undefined,
                    tags: combinedTags,
                    likes: 0,
                    upvotes: 0,
                    downvotes: 0,
                    score: 0,
                    comments: 0,
                    privacy: "public",
                    allowComments,
                    pinned,
                    isSpoiler,
                    isNsfw,
                };

                if (communityId) {
                    try {
                        await createPostMutation.mutateAsync({
                            communityId: String(communityId),
                            title: title.trim() || undefined,
                            content: content.trim(),
                            images: images.length > 0 ? images : undefined,
                            tags: combinedTags,
                            pinned,
                            allowComments,
                        });
                    } catch {
                        // Optimistic fallback
                    }
                }
                addPost(newPost);
            }

            // Reset and close
            setTitle("");
            setContent("");
            setTags([]);
            setAttachments([]);
            setSubmitAttempted(false);
            clearDrafts();
            handleClose();
        } finally {
            setIsPosting(false);
        }
    };

    useHotkeys(
        ["Mod", "Enter"],
        () => {
            if (canPost) {
                handlePost();
            }
        },
        { ignoreInput: false, enabled: Boolean(isVisible) }
    );

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4 overflow-hidden animate-fade-in select-none">
            {/* Hidden File Inputs */}
            <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleQuickImageChange}
                className="hidden"
            />

            {/* Backdrop click to cancel */}
            <div className="absolute inset-0" onClick={handleClose} />

            {/* Modal Dialog Card (Centered 760-840px, near-black canvas, responsive full-screen on mobile) */}
            <div
                className="relative w-full max-w-[800px] h-full sm:h-auto sm:max-h-[88vh] sm:rounded-2xl bg-[#0c0e12] border-0 sm:border sm:border-white/[0.08] shadow-2xl shadow-black/90 flex flex-col overflow-hidden z-10 select-text animate-modal"
                onClick={(e) => e.stopPropagation()}
            >
                {/* ================= MINIMAL TOP HEADER ================= */}
                <div className="sticky top-0 z-20 shrink-0 flex items-center justify-between px-6 py-3.5 bg-[#0c0e12] border-b border-white/[0.06]">
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-text-faint">
                            {t('feed.createPost', { defaultValue: 'CREATE POST' })}
                        </span>
                        {hasDraftContent && (
                            <span className="text-[11px] text-text-faint flex items-center gap-1.5 ml-1 animate-fade-in">
                                <span>•</span>
                                <span>{t('feed.draftSaved', { defaultValue: 'Bản nháp đã lưu' })}</span>
                                <button
                                    type="button"
                                    onClick={handleDiscardDraft}
                                    className="text-text-muted hover:text-rose-400 underline transition-colors cursor-pointer"
                                    title={t('feed.discardDraft', { defaultValue: 'Xóa nháp' })}
                                >
                                    {t('feed.discardDraft', { defaultValue: 'Xóa' })}
                                </button>
                            </span>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="text-text-faint hover:text-text transition-colors p-1 cursor-pointer"
                        title={t('common.cancel', { defaultValue: 'Đóng' })}
                    >
                        <FontAwesomeIcon icon={faXmark} className="text-sm" />
                    </button>
                </div>

                {/* ================= CONTINUOUS WRITING CANVAS BODY ================= */}
                <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-5 flex flex-col gap-3 overscroll-contain">
                    {/* 1. Contextual Community Control */}
                    <div className="shrink-0">
                        <CommunitySelector
                            value={communityId}
                            onChange={(val) => {
                                setCommunityId(val);
                                setSubmitAttempted(false);
                            }}
                            communities={joinedCommunities}
                            hasError={submitAttempted && !communityId}
                        />
                    </div>

                    {/* 2. Prominent Title Input (Continuous editorial typography) */}
                    <div className="w-full pt-1">
                        <input
                            type="text"
                            value={title}
                            spellCheck={false}
                            autoCorrect="off"
                            maxLength={200}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={t('feed.postTitlePlaceholder', { defaultValue: 'Tiêu đề bài viết...' })}
                            className="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-2xl sm:text-3xl font-bold tracking-tight text-text placeholder:text-text-faint/35 p-0 leading-tight"
                        />
                        {title.trim().length > 0 && title.trim().length < 6 && (
                            <p className="text-[11px] text-amber-400 font-medium flex items-center gap-1.5 mt-1 animate-fade-in">
                                <FontAwesomeIcon icon={faTriangleExclamation} className="text-[10px]" />
                                <span>{t('feed.titleMinLenError', { min: 6, current: title.trim().length, defaultValue: `Tiêu đề cần tối thiểu 6 ký tự (hiện tại: ${title.trim().length})` })}</span>
                            </p>
                        )}
                    </div>

                    {/* 3. Lightweight Tags Chips */}
                    <TagsInput tags={tags} onChange={setTags} />

                    {/* 4. Seamless Continuous Writing Canvas */}
                    <div className="w-full flex-1 min-h-[220px] flex flex-col">
                        <RichTextEditor
                            value={content}
                            onChange={setContent}
                            placeholder={dynamicPlaceholder}
                            onAddImage={handleQuickImageClick}
                            variant="seamless"
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                                    handlePost();
                                }
                            }}
                            minHeight="200px"
                        />
                        {content.trim().length > 0 && content.trim().length < 6 && attachments.length === 0 && (
                            <p className="text-[11px] text-amber-400 font-medium flex items-center gap-1.5 mt-1 shrink-0 animate-fade-in">
                                <FontAwesomeIcon icon={faTriangleExclamation} className="text-[10px]" />
                                <span>{t('feed.contentMinLenError', { min: 6, current: content.trim().length, defaultValue: `Nội dung cần tối thiểu 6 ký tự (hiện tại: ${content.trim().length})` })}</span>
                            </p>
                        )}
                        {content.trim().length > 10000 && (
                            <p className="text-[11px] text-amber-400 font-medium flex items-center gap-1.5 mt-1 shrink-0 animate-fade-in">
                                <FontAwesomeIcon icon={faTriangleExclamation} className="text-[10px]" />
                                <span>{t('feed.contentMaxLenError', { max: 10000, defaultValue: 'Nội dung tối đa 10.000 ký tự' })}</span>
                            </p>
                        )}
                    </div>

                    {/* 5. Attachments Preview (If attachments exist) */}
                    {attachments.length > 0 && (
                        <div className="pt-2 border-t border-white/[0.06]">
                            <span className="text-[11px] font-medium text-text-faint mb-2 block">
                                {t('feed.attachmentsLabel', { defaultValue: `Ảnh đính kèm (${attachments.length})` })}
                            </span>
                            <AttachmentPicker
                                attachments={attachments}
                                onChange={setAttachments}
                                showToolbar={false}
                                compactToolbar
                            />
                        </div>
                    )}

                    {/* 6. Post Settings (Compact Horizontal Panel) */}
                    <PostSettingsSection
                        allowComments={allowComments}
                        onAllowCommentsChange={setAllowComments}
                        pinned={pinned}
                        onPinnedChange={setPinned}
                        isSpoiler={isSpoiler}
                        onSpoilerChange={setIsSpoiler}
                        isNsfw={isNsfw}
                        onNsfwChange={setIsNsfw}
                    />
                </div>

                {/* ================= MINIMAL FOOTER ================= */}
                <div className="sticky bottom-0 z-20 shrink-0 px-6 py-3 bg-[#0c0e12] border-t border-white/[0.06] flex items-center justify-between">
                    {/* Left: Quiet shortcut hint */}
                    <div className="flex items-center">
                        <span className="hidden sm:inline text-[11px] text-text-faint/60 select-none">
                            <kbd className="font-mono text-text-faint">⌘</kbd> + <kbd className="font-mono text-text-faint">Enter</kbd> {language === "vi" ? "để đăng bài" : "to publish"}
                        </span>
                    </div>

                    {/* Right: Cancel as quiet text, Publish Post as only prominent button */}
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-3 py-1.5 text-xs font-medium text-text-muted hover:text-text transition-colors cursor-pointer"
                        >
                            {t('common.cancel', { defaultValue: 'Hủy' })}
                        </button>

                        <button
                            type="button"
                            onClick={handlePost}
                            disabled={!canPost}
                            className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                                canPost
                                    ? "bg-primary hover:bg-primary-hover text-white shadow-sm"
                                    : "bg-primary/30 text-white/40 cursor-not-allowed shadow-none"
                            }`}
                        >
                            {isPosting ? (
                                <>
                                    <FontAwesomeIcon icon={faSpinner} className="animate-spin text-xs" />
                                    <span>{t('common.loading', { defaultValue: 'Đang đăng...' })}</span>
                                </>
                            ) : (
                                <span>{t('feed.publishPost', { defaultValue: 'Đăng bài viết' })}</span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* =========================================================================
   CREATE POST BOX (FEED BANNER TRIGGER)
   ========================================================================= */
interface CreatePostBoxProps {
    onPostCreated?: (payload: CreatePostPayload) => void;
    defaultCommunityId?: number | string | null;
    hideCommunitySelector?: boolean;
    hideCommunity?: boolean;
    initialTitle?: string;
    initialContent?: string;
}

export const CreatePostBox = ({
    onPostCreated,
    defaultCommunityId = null,
    hideCommunity = false,
    initialTitle = "",
    initialContent = "",
}: CreatePostBoxProps) => {
    const { language } = useTranslation();
    const user = useAuthStore((s) => s.user);
    const customAvatar = useAuthStore((s) => s.customAvatar);
    const displayName = user?.name || user?.username || getCurrentAuthor();
    const avatarUrl =
        user?.avatarUrl ||
        user?.avatar_url ||
        customAvatar ||
        (user?.user_metadata?.avatar_url as string | undefined) ||
        "";

    const { communities } = useCommunitiesStore();
    const openCreatePost = useCreatePostModalStore((s) => s.openCreatePost);
    const navigate = useNavigate();

    const handleAvatarClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        const profileTarget = user?.username
            ? `@${user.username.replace(/^@+/, "")}`
            : user?.id
            ? user.id
            : "me";
        navigate({ to: "/profile/$userId", params: { userId: profileTarget } });
    };

    const activeFilteredCommunity = useMemo(() => {
        if (!defaultCommunityId) return null;
        return communities.find((c) => String(c.id) === String(defaultCommunityId)) || null;
    }, [communities, defaultCommunityId]);

    const dynamicPlaceholder = useMemo(() => {
        if (activeFilteredCommunity && !hideCommunity) {
            return language === "vi"
                ? `Chia sẻ với ${activeFilteredCommunity.name}...`
                : `Share with ${activeFilteredCommunity.name}...`;
        }
        return language === "vi"
            ? "Chia sẻ khoảnh khắc, góc nhìn hoặc khám phá mới..."
            : "Share a moment, thought, or discovery...";
    }, [activeFilteredCommunity, hideCommunity, language]);

    return (
        <div id="create-post" className="w-full pb-2">
            {/* Feed Quick Trigger Bar */}
            <div className="w-full flex items-center gap-3">
                {/* User Avatar (outside box, navigates to user profile) */}
                <button
                    type="button"
                    onClick={handleAvatarClick}
                    className="relative shrink-0 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/40 transition-transform active:scale-95 cursor-pointer group/avatar"
                    title={displayName}
                    aria-label={displayName}
                >
                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt={displayName}
                            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover ring-1 ring-border/80 group-hover/avatar:ring-primary/60 transition-all"
                            onError={(e) => {
                                (e.currentTarget as HTMLImageElement).style.display = "none";
                            }}
                        />
                    ) : (
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 ring-1 ring-border/80 group-hover/avatar:ring-primary/60 flex items-center justify-center text-xs sm:text-sm font-bold text-primary uppercase select-none transition-all">
                            {(displayName || "G").replace(/^@/, "").charAt(0) || "G"}
                        </div>
                    )}
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-bg" />
                </button>

                {/* Capsule / Pill Box */}
                <div
                    onClick={() => openCreatePost(defaultCommunityId)}
                    className="flex-1 flex items-center gap-3 px-4 py-2 sm:py-2.5 rounded-full bg-surface-hover hover:bg-surface-active transition-all cursor-pointer group shadow-xs min-w-0"
                >
                    <div className="flex flex-col justify-center min-w-0 flex-1 pl-1">
                        <span className="text-xs sm:text-sm text-text-muted group-hover:text-text transition-colors truncate">
                            {dynamicPlaceholder}
                        </span>
                        {activeFilteredCommunity && !hideCommunity && (
                            <span className="text-[11px] text-primary font-bold truncate mt-0.5 flex items-center gap-1.5">
                                {activeFilteredCommunity.logo ? (
                                    <img
                                        src={activeFilteredCommunity.logo}
                                        alt=""
                                        className="w-3.5 h-3.5 rounded object-cover"
                                    />
                                ) : (
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                )}
                                <span>{activeFilteredCommunity.name}</span>
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
