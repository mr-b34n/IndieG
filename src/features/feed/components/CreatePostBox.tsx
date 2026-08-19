import { useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { 
    faGear, 
    faThumbtack, 
    faComment, 
    faImage,
    faChevronDown,
    faCheck,
    faUsers,
    faEyeSlash,
    faPaperclip,
    faXmark
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useTranslation } from "@/shared/hooks/useTranslate";

import { createAttachmentFromFile, revokeAttachmentUrls, type EditableAttachment } from "@/features/post/helpers/postAttachments";
import { useAuthStore } from "@/features/auth";
import { useCommunitiesStore, type CommunityData } from "@/features/community";
import { AttachmentPicker, useDraftsStore } from "@/features/post";
import { type CreatePostPayload } from "../types";
import { HASHTAG_REGEX, MAX_TEXTAREA_HEIGHT } from "../constants";

const extractHashtags = (text: string): string[] => {
    const matches = text.match(HASHTAG_REGEX) ?? [];
    const seen = new Set<string>();
    matches.forEach((m) => seen.add(m.slice(1)));
    return Array.from(seen);
};

const renderHighlightedContent = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(#[^\s#]+)/g);
    return parts.map((part, i) =>
        /^#[^\s#]+$/.test(part) ? (
            <span key={i} className="text-primary font-semibold">
                {part}
            </span>
        ) : (
            <span key={i}>{part}</span>
        )
    );
};

const ToggleSwitch = ({
    checked,
    onChange,
    label,
    icon,
}: {
    checked: boolean;
    onChange: (v: boolean) => void;
    label: string;
    icon: typeof faComment;
}) => (
    <div className="flex items-center justify-between gap-3 px-3 py-2">
        <div className="flex items-center gap-2 text-xs text-text">
            <FontAwesomeIcon icon={icon} className="w-3 text-text-faint" />
            {label}
        </div>
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
                checked ? "bg-primary" : "bg-surface-hover"
            }`}
        >
            <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                    checked ? "translate-x-4" : "translate-x-1"
                }`}
            />
        </button>
    </div>
);

const PostSettingsMenu = ({
    allowComments,
    onAllowCommentsChange,
    pinned,
    onPinnedChange,
    isSpoiler,
    onSpoilerChange,
}: {
    allowComments: boolean;
    onAllowCommentsChange: (v: boolean) => void;
    pinned: boolean;
    onPinnedChange: (v: boolean) => void;
    isSpoiler: boolean;
    onSpoilerChange: (v: boolean) => void;
}) => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const updatePosition = () => {
        if (!buttonRef.current) return;
        const rect = buttonRef.current.getBoundingClientRect();
        setCoords({
            top: rect.bottom + 6,
            left: Math.max(12, rect.right - 220),
        });
    };

    useEffect(() => {
        if (!open) return;
        updatePosition();
        const handleScrollOrResize = () => updatePosition();
        window.addEventListener("scroll", handleScrollOrResize, true);
        window.addEventListener("resize", handleScrollOrResize);
        return () => {
            window.removeEventListener("scroll", handleScrollOrResize, true);
            window.removeEventListener("resize", handleScrollOrResize);
        };
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;
            if (
                buttonRef.current &&
                !buttonRef.current.contains(target) &&
                menuRef.current &&
                !menuRef.current.contains(target)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    return (
        <div className="relative shrink-0">
            <button
                ref={buttonRef}
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className={`p-1.5 rounded-[6px] text-xs font-semibold hover:bg-surface-hover text-text-muted hover:text-text transition-colors cursor-pointer ${
                    open ? "bg-surface-hover text-text" : ""
                }`}
                title={t('feed.settings') || "Post Settings"}
            >
                <FontAwesomeIcon icon={faGear} className="w-3.5 h-3.5" />
            </button>

            {open &&
                coords &&
                createPortal(
                    <div
                        ref={menuRef}
                        style={{ top: coords.top, left: coords.left }}
                        className="fixed z-[9999] w-56 rounded-[6px] bg-surface border border-divider-primary shadow-xl p-1.5 flex flex-col gap-1 text-xs animate-scale-up"
                    >
                        <ToggleSwitch
                            checked={allowComments}
                            onChange={onAllowCommentsChange}
                            label={t('feed.allowComments') || "Allow comments"}
                            icon={faComment}
                        />
                        <ToggleSwitch
                            checked={pinned}
                            onChange={onPinnedChange}
                            label={t('feed.pinPost') || "Pin post"}
                            icon={faThumbtack}
                        />
                        <ToggleSwitch
                            checked={isSpoiler}
                            onChange={onSpoilerChange}
                            label={t('feed.spoiler') || "Spoiler warning"}
                            icon={faEyeSlash}
                        />
                    </div>,
                    document.body
                )}
        </div>
    );
};

const CommunitySelector = ({
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
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedCommunity = useMemo(
        () => communities.find((c) => String(c.id) === String(value)) || null,
        [communities, value]
    );

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
        <div className="flex flex-col gap-1 w-full relative" ref={dropdownRef}>
            {/* Dropdown Button Trigger */}
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className={`w-full h-8 flex items-center justify-between gap-2 px-2.5 rounded-[6px] border text-xs font-semibold transition-all cursor-pointer whitespace-nowrap overflow-hidden ${
                    isOpen
                        ? "border-primary ring-1 ring-primary/30 bg-surface-hover/70"
                        : hasError && !selectedCommunity
                        ? "border-rose-500 bg-rose-500/10 text-rose-400"
                        : selectedCommunity
                        ? "border-divider-primary bg-surface-hover/50 hover:bg-surface-hover text-text"
                        : "border-divider-primary bg-surface-hover/30 hover:bg-surface-hover/60 text-text-muted"
                }`}
            >
                {selectedCommunity ? (
                    <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
                        <img
                            src={selectedCommunity.logo}
                            alt={selectedCommunity.name}
                            className="w-4 h-4 rounded-full object-cover shrink-0"
                        />
                        <span className="truncate font-bold text-text text-xs">{selectedCommunity.name}</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-1.5 min-w-0 flex-1 truncate text-text-muted">
                        <FontAwesomeIcon icon={faUsers} className="text-text-faint text-[11px] shrink-0" />
                        <span className="truncate text-xs">{t('feed.selectCommunityPlaceholder') || "Choose community"}</span>
                    </div>
                )}
                <FontAwesomeIcon
                    icon={faChevronDown}
                    className={`text-[9px] text-text-faint transition-transform duration-200 shrink-0 ml-1 ${
                        isOpen ? "rotate-180 text-primary" : ""
                    }`}
                />
            </button>

            {/* Error Message if user clicked Post without selecting */}
            {hasError && !selectedCommunity && (
                <span className="text-[11px] text-rose-500 font-semibold flex items-center gap-1 pt-0.5 animate-fade-in whitespace-nowrap">
                    <span>⚠</span>
                    <span>{t('feed.selectCommunityRequired') || "Please select a community"}</span>
                </span>
            )}

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-1 min-w-[200px] w-full bg-surface border border-divider-primary rounded-[6px] shadow-xl z-50 overflow-hidden max-h-56 overflow-y-auto animate-fade-in p-1 flex flex-col gap-0.5">
                    {communities.length === 0 ? (
                        <div className="px-3 py-2 text-xs text-text-faint text-center whitespace-nowrap">
                            {t('feed.noCommunitiesJoined') || "No communities joined"}
                        </div>
                    ) : (
                        communities.map((c) => {
                            const isSelected = String(c.id) === String(value);
                            return (
                                <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => {
                                        onChange(c.id);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-[4px] text-left text-xs transition-colors cursor-pointer whitespace-nowrap ${
                                        isSelected
                                            ? "bg-primary/10 text-primary font-bold"
                                            : "hover:bg-surface-hover text-text"
                                    }`}
                                >
                                    <div className="flex items-center gap-2 min-w-0 truncate">
                                        <img
                                            src={c.logo}
                                            alt={c.name}
                                            className="w-4 h-4 rounded-full object-cover shrink-0"
                                        />
                                        <span className="truncate font-semibold text-xs">{c.name}</span>
                                    </div>
                                    {isSelected && (
                                        <FontAwesomeIcon icon={faCheck} className="text-primary text-xs shrink-0 ml-1.5" />
                                    )}
                                </button>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
};

interface CreatePostBoxProps {
    onPostCreated?: (payload: CreatePostPayload) => void;
    defaultCommunityId?: number | string | null;
    hideCommunitySelector?: boolean;
    initialTitle?: string;
    initialContent?: string;
}

export const CreatePostBox = ({
    onPostCreated,
    defaultCommunityId = null,
    hideCommunitySelector = false,
    initialTitle = "",
    initialContent = "",
}: CreatePostBoxProps) => {
    const { t } = useTranslation();
    const user = useAuthStore((s) => s.user);
    const avatarUrl = user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80";

    const { communities } = useCommunitiesStore();
    const joinedCommunities = useMemo(() => {
        const joined = communities.filter((c) => c.joined || (c as CommunityData & { isJoined?: boolean }).isJoined);
        return joined.length > 0 ? joined : communities;
    }, [communities]);

    const activeFilteredCommunity = useMemo(() => {
        if (!defaultCommunityId) return null;
        return joinedCommunities.find((c) => String(c.id) === String(defaultCommunityId)) || null;
    }, [joinedCommunities, defaultCommunityId]);

    const saveDraft = useDraftsStore((s) => s.saveDraft);
    const drafts = useDraftsStore((s) => s.drafts);

    const [isExpanded, setExpanded] = useState(false);
    const [title, setTitle] = useState(initialTitle);
    const [content, setContent] = useState(initialContent);
    const [manualTags, setManualTags] = useState("");
    const [communityId, setCommunityId] = useState<number | string | null>(defaultCommunityId);
    const [allowComments, setAllowComments] = useState(true);
    const [pinned, setPinned] = useState(false);
    const [isSpoiler, setIsSpoiler] = useState(false);
    const [attachments, setAttachments] = useState<EditableAttachment[]>([]);
    const [isPosting, setIsPosting] = useState(false);
    const [submitAttempted, setSubmitAttempted] = useState(false);

    // Update communityId if defaultCommunityId changes
    useEffect(() => {
        if (defaultCommunityId !== null && defaultCommunityId !== undefined) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setCommunityId(defaultCommunityId);
        }
    }, [defaultCommunityId]);

    // Load draft if available and no initial data provided (once on mount)
    const hasLoadedDraft = useRef(false);
    useEffect(() => {
        if (!hasLoadedDraft.current && !initialTitle && !initialContent && drafts.length > 0) {
            const draft = drafts[0];
            // eslint-disable-next-line react-hooks/set-state-in-effect
            if (draft.title) setTitle(draft.title);
            if (draft.content) setContent(draft.content);
            if (draft.communityId && !defaultCommunityId) setCommunityId(draft.communityId);
            if (draft.isSpoiler !== undefined) setIsSpoiler(draft.isSpoiler);
            hasLoadedDraft.current = true;
        }
    }, [drafts, initialTitle, initialContent, defaultCommunityId]);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const highlightRef = useRef<HTMLDivElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Auto-save draft silently when user closes/collapses or when component unmounts with non-empty content
    useEffect(() => {
        return () => {
            if (content.trim() || title.trim()) {
                saveDraft({
                    title,
                    content,
                    communityId,
                    attachments,
                    privacy: "public",
                    allowComments,
                    pinned,
                });
            }
        };
    }, [content, title, communityId, attachments, allowComments, pinned, saveDraft]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (initialTitle) setTitle(initialTitle);
        if (initialContent) setContent(initialContent);
    }, [initialTitle, initialContent]);

    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = "auto";
        const nextHeight = Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT);
        el.style.height = `${nextHeight}px`;
    }, [content, isExpanded]);

    const handleTextareaScroll = () => {
        if (textareaRef.current && highlightRef.current) {
            highlightRef.current.scrollTop = textareaRef.current.scrollTop;
        }
    };

    const handleQuickImageClick = () => {
        setExpanded(true);
        setTimeout(() => {
            imageInputRef.current?.click();
        }, 50);
    };

    const handleQuickFileClick = () => {
        setExpanded(true);
        setTimeout(() => {
            fileInputRef.current?.click();
        }, 50);
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

    const handleQuickFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        const newAttachments: EditableAttachment[] = [];
        Array.from(files).forEach((file) => {
            newAttachments.push(createAttachmentFromFile(file, "file"));
        });
        setAttachments((prev) => [...prev, ...newAttachments]);
        e.target.value = "";
    };

    const hasValidContent = content.trim().length > 0 || title.trim().length > 0 || attachments.length > 0;
    const canPost = communityId !== null && communityId !== undefined && hasValidContent && !isPosting;

    const handlePost = async () => {
        setSubmitAttempted(true);

        if (!communityId) {
            return;
        }

        if (!hasValidContent) {
            return;
        }

        setIsPosting(true);

        const contentHashtags = extractHashtags(content);
        const splitManualTags = manualTags
            .split(/[, ]+/)
            .filter(t => t.trim().length > 0)
            .map(t => t.startsWith('#') ? t.slice(1) : t);
        
        const combinedTags = Array.from(new Set([...contentHashtags, ...splitManualTags]));

        const payload: CreatePostPayload = {
            title: title.trim() || undefined,
            content: content.trim(),
            communityId: communityId ?? undefined,
            privacy: "public",
            allowComments,
            pinned,
            isSpoiler,
            tags: combinedTags,
            attachments,
        };

        try {
            onPostCreated?.(payload);
            setTitle("");
            setContent("");
            setManualTags("");
            setAttachments([]);
            setSubmitAttempted(false);
            setExpanded(false);
        } finally {
            setIsPosting(false);
        }
    };

    const handleCancel = () => {
        if (content.trim() || title.trim()) {
            saveDraft({
                title,
                content,
                communityId,
                attachments,
                privacy: "public",
                allowComments,
                pinned,
            });
        }
        setTitle("");
        setContent("");
        revokeAttachmentUrls(attachments);
        setAttachments([]);
        setSubmitAttempted(false);
        setExpanded(false);
    };

    return (
        <div
            id="create-post"
            className="w-full pb-2 flex flex-col gap-3"
        >
            {/* Hidden File Inputs */}
            <input
                ref={imageInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleQuickImageChange}
                className="hidden"
            />
            <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleQuickFileChange}
                className="hidden"
            />

            {!isExpanded ? (
                /* ================= COLLAPSED CLOSED STATE ================= */
                <div
                    onClick={() => setExpanded(true)}
                    className="w-full flex items-center justify-between gap-3 px-3.5 py-3 rounded-[6px] bg-surface-hover/30 hover:bg-surface-hover/60 border border-transparent hover:border-divider-primary transition-all cursor-pointer group"
                >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="relative shrink-0">
                            <img
                                src={avatarUrl}
                                alt="User"
                                className="w-8 h-8 rounded-full object-cover ring-1 ring-border/80"
                            />
                            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-bg" />
                        </div>

                        <div className="flex flex-col justify-center min-w-0 flex-1">
                            <span className="text-xs sm:text-sm text-text-muted group-hover:text-text transition-colors">
                                {t('feed.whatOnMind') || "What's on your mind?"}
                            </span>
                            {activeFilteredCommunity && (
                                <span className="text-[11px] text-primary font-bold truncate mt-0.5 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                    <span>{activeFilteredCommunity.name}</span>
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleQuickImageClick();
                            }}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] hover:bg-surface-hover text-xs font-semibold text-text-muted hover:text-text transition-colors cursor-pointer"
                        >
                            <FontAwesomeIcon icon={faImage} className="text-emerald-500 text-xs" />
                            <span className="hidden sm:inline">{t('feed.mediaButton') || "Media"}</span>
                        </button>
                    </div>
                </div>
            ) : (
                /* ================= OPEN EXPANDED EDITOR STATE ================= */
                <div className="w-full flex flex-col gap-3 animate-fade-in">
                    {/* Header: CREATE POST */}
                    <div className="flex items-center justify-between pb-2 border-b border-divider-primary">
                        <span className="text-xs font-black uppercase tracking-wider text-text">
                            {t('feed.createPost') || "CREATE POST"}
                        </span>
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="text-text-faint hover:text-text text-xs p-1 cursor-pointer transition-colors"
                            title={t('common.cancel') || "Cancel"}
                        >
                            <FontAwesomeIcon icon={faXmark} />
                        </button>
                    </div>

                    {/* Metadata: User & Community Selector */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <img
                                src={avatarUrl}
                                alt="User"
                                className="w-8 h-8 rounded-full object-cover ring-1 ring-border/80 shrink-0"
                            />

                            {!hideCommunitySelector && (
                                <div className="flex items-center gap-2 min-w-0 w-full sm:w-80">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-text-faint shrink-0">
                                        {t('feed.selectCommunity') || "Communities"}
                                    </span>
                                    <div className="flex-1 min-w-0">
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
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Editor Fields */}
                    <div className="flex flex-col gap-2 pt-1">
                        {/* Title Field */}
                        <div className="w-full border-b border-divider-secondary pb-1">
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder={t('feed.postTitlePlaceholder') || "Give your post a title..."}
                                className="w-full bg-transparent border-none outline-none text-sm font-bold text-text placeholder:text-text-faint py-1.5 px-0.5"
                            />
                        </div>

                        {/* Tags Field */}
                        <div className="w-full border-b border-divider-secondary pb-1">
                            <input
                                type="text"
                                value={manualTags}
                                onChange={(e) => setManualTags(e.target.value)}
                                placeholder={t('feed.tagsPlaceholder') || "Add tags (e.g. #CS2 #Tips)..."}
                                className="w-full bg-transparent border-none outline-none text-xs font-semibold text-primary placeholder:text-text-faint py-1 px-0.5"
                            />
                        </div>

                        {/* Body Editor Area */}
                        <div className="relative w-full pt-1">
                            <textarea
                                ref={textareaRef}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                onScroll={handleTextareaScroll}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handlePost();
                                }}
                                placeholder={t('feed.writeSomething') || "What's on your mind? Write something..."}
                                rows={6}
                                className="block w-full min-h-[160px] sm:min-h-[200px] p-2 bg-transparent border-none outline-none text-xs sm:text-sm font-normal text-transparent caret-text placeholder:text-text-faint resize-none leading-relaxed"
                            />
                            <div
                                ref={highlightRef}
                                aria-hidden
                                className="absolute inset-0 pt-3 p-2 text-xs sm:text-sm font-normal leading-relaxed whitespace-pre-wrap break-words overflow-hidden pointer-events-none text-text"
                            >
                                {renderHighlightedContent(content)}
                                {content.endsWith("\n") ? "\u200b" : null}
                            </div>
                        </div>

                        {/* Attachments preview */}
                        {attachments.length > 0 && (
                            <div className="pt-2">
                                <AttachmentPicker
                                    attachments={attachments}
                                    onChange={setAttachments}
                                    showToolbar={false}
                                    compactToolbar
                                />
                            </div>
                        )}
                    </div>

                    {/* Bottom Toolbar */}
                    <div className="flex items-center justify-between pt-3 border-t border-divider-primary mt-1">
                        {/* Media and Attachment Buttons */}
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleQuickImageClick}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] hover:bg-surface-hover/70 text-xs font-semibold text-text-muted hover:text-text transition-colors cursor-pointer"
                            >
                                <FontAwesomeIcon icon={faImage} className="text-emerald-500 text-xs" />
                                <span>Media</span>
                            </button>
                            <button
                                type="button"
                                onClick={handleQuickFileClick}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] hover:bg-surface-hover/70 text-xs font-semibold text-text-muted hover:text-text transition-colors cursor-pointer"
                            >
                                <FontAwesomeIcon icon={faPaperclip} className="text-primary text-xs" />
                                <span>Attachment</span>
                            </button>
                        </div>

                        {/* Settings & Post Action */}
                        <div className="flex items-center gap-3">
                            <PostSettingsMenu
                                allowComments={allowComments}
                                onAllowCommentsChange={setAllowComments}
                                pinned={pinned}
                                onPinnedChange={setPinned}
                                isSpoiler={isSpoiler}
                                onSpoilerChange={setIsSpoiler}
                            />

                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-3 py-1.5 rounded-[6px] text-xs font-semibold text-text-muted hover:text-text hover:bg-surface-hover/60 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handlePost}
                                disabled={isPosting}
                                className={`px-5 py-1.5 rounded-[6px] text-xs font-bold transition-all cursor-pointer ${
                                    canPost
                                        ? "bg-primary hover:bg-primary-hover text-white shadow-xs"
                                        : "bg-primary text-white opacity-40 cursor-not-allowed"
                                }`}
                            >
                                <span>{isPosting ? t('common.loading') : "Post"}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
