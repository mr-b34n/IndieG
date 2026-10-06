import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { 
    faGear, 
    faThumbtack, 
    faComment, 
    faImage, 
    faChevronDown, 
    faCheck, 
    faUsers, 
    faEyeSlash, 
    faXmark, 
    faTriangleExclamation,
    faBold,
    faItalic,
    faStrikethrough,
    faListUl,
    faLink,
    faQuoteLeft,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "@/shared/hooks/useTranslate";

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
            <span>{label}</span>
        </div>
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-1 focus:ring-primary/50 disabled:opacity-40 ${
                checked ? "bg-primary" : "bg-[#252930]"
            }`}
        >
            <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    checked ? "translate-x-4" : "translate-x-0"
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
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const updatePosition = () => {
        if (!buttonRef.current) return;
        const rect = buttonRef.current.getBoundingClientRect();
        setCoords({
            top: rect.top - 180,
            left: Math.max(12, rect.right - 230),
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
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] text-xs font-semibold hover:bg-surface-hover text-text-muted hover:text-text transition-colors cursor-pointer border border-border/50 ${
                    open || isSpoiler || isNsfw || pinned ? "bg-surface-hover text-primary border-primary/40" : ""
                }`}
                title={t('feed.settings', { defaultValue: 'Cài đặt bài viết' })}
            >
                <FontAwesomeIcon icon={faGear} className="w-3 h-3" />
                <span className="text-[11px] hidden sm:inline">{t('feed.settings', { defaultValue: 'Cài đặt' })}</span>
                {(isSpoiler || isNsfw) && (
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                )}
            </button>

            {open &&
                coords &&
                createPortal(
                    <div
                        ref={menuRef}
                        style={{ top: coords.top, left: coords.left }}
                        className="fixed z-[9999] w-60 rounded-lg bg-surface border border-border shadow-2xl p-1.5 flex flex-col gap-1 text-xs animate-fade-in"
                    >
                        <ToggleSwitch
                            checked={allowComments}
                            onChange={onAllowCommentsChange}
                            label={t('feed.allowComments', { defaultValue: 'Bật bình luận' })}
                            icon={faComment}
                        />
                        <ToggleSwitch
                            checked={pinned}
                            onChange={onPinnedChange}
                            label={t('feed.pinPost', { defaultValue: 'Ghim bài viết' })}
                            icon={faThumbtack}
                        />
                        <div className="my-1 border-t border-border/40" />
                        <ToggleSwitch
                            checked={isSpoiler}
                            onChange={onSpoilerChange}
                            label={t('feed.warningSpoiler', { defaultValue: 'Cảnh báo Spoiler' })}
                            icon={faEyeSlash}
                        />
                        <ToggleSwitch
                            checked={isNsfw}
                            onChange={onNsfwChange}
                            label={t('feed.warningNsfw', { defaultValue: 'Cảnh báo 18+ (NSFW)' })}
                            icon={faTriangleExclamation}
                        />
                    </div>,
                    document.body
                )}
        </div>
    );
};

/* =========================================================================
   5. Community Context & Identity Selector
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
                className={`w-full h-9 flex items-center justify-between gap-2.5 px-3 rounded-lg border text-xs font-medium transition-all cursor-pointer whitespace-nowrap overflow-hidden ${
                    isOpen
                        ? "border-primary ring-1 ring-primary/30 bg-surface-hover/70"
                        : hasError && !selectedCommunity
                        ? "border-rose-500 bg-rose-500/10 text-rose-400"
                        : selectedCommunity
                        ? "border-border/70 bg-surface-hover/50 hover:bg-surface-hover text-text"
                        : "border-border/50 bg-surface-hover/30 hover:bg-surface-hover/60 text-text-muted"
                }`}
            >
                {selectedCommunity ? (
                    <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
                        {/* Game / Community Logo */}
                        {selectedCommunity.logo ? (
                            <img
                                src={selectedCommunity.logo}
                                alt={selectedCommunity.name}
                                className="w-5 h-5 rounded-[4px] object-cover shrink-0 border border-border/40"
                            />
                        ) : (
                            <span className="w-5 h-5 rounded-[4px] bg-primary/20 text-primary flex items-center justify-center font-bold text-[10px] shrink-0">
                                {selectedCommunity.name.charAt(0)}
                            </span>
                        )}

                        {/* Short Game Tag badge */}
                        {selectedCommunity.tag && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold uppercase bg-primary/15 text-primary border border-primary/25 shrink-0 select-none">
                                {selectedCommunity.tag}
                            </span>
                        )}

                        <span className="truncate font-bold text-text text-xs sm:text-[13px]">
                            {selectedCommunity.name}
                        </span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 min-w-0 flex-1 truncate text-text-muted">
                        <FontAwesomeIcon icon={faUsers} className="text-text-faint text-xs shrink-0" />
                        <span className="truncate text-xs font-medium">{t('feed.selectCommunityPlaceholder', { defaultValue: 'Chọn cộng đồng đăng bài...' })}</span>
                    </div>
                )}
                <FontAwesomeIcon
                    icon={faChevronDown}
                    className={`text-[9px] text-text-faint transition-transform duration-200 shrink-0 ml-1.5 ${
                        isOpen ? "rotate-180 text-primary" : ""
                    }`}
                />
            </button>

            {/* Error Message if user clicked Post without selecting */}
            {hasError && !selectedCommunity && (
                <span className="text-[11px] text-rose-500 font-semibold flex items-center gap-1 pt-0.5 animate-fade-in whitespace-nowrap">
                    <span>⚠</span>
                    <span>{t('feed.selectCommunityRequired', { defaultValue: 'Vui lòng chọn một cộng đồng' })}</span>
                </span>
            )}

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-1 min-w-[240px] w-full bg-surface border border-border rounded-lg shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto animate-fade-in p-1 flex flex-col gap-0.5">
                    {communities.length === 0 ? (
                        <div className="px-3 py-2 text-xs text-text-faint text-center whitespace-nowrap">
                            {t('feed.noCommunitiesJoined', { defaultValue: 'Chưa tham gia cộng đồng nào' })}
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
                                    className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-md text-left text-xs transition-colors cursor-pointer whitespace-nowrap ${
                                        isSelected
                                            ? "bg-primary/10 text-primary font-bold"
                                            : "hover:bg-surface-hover text-text"
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5 min-w-0 truncate">
                                        {c.logo ? (
                                            <img
                                                src={c.logo}
                                                alt={c.name}
                                                className="w-5 h-5 rounded-[4px] object-cover shrink-0 border border-border/40"
                                            />
                                        ) : (
                                            <span className="w-5 h-5 rounded-[4px] bg-primary/15 text-primary flex items-center justify-center font-bold text-[10px] shrink-0">
                                                {c.name.charAt(0)}
                                            </span>
                                        )}

                                        {c.tag && (
                                            <span className="px-1 py-0.2 rounded text-[9px] font-extrabold uppercase bg-primary/10 text-primary shrink-0">
                                                {c.tag}
                                            </span>
                                        )}

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

/* =========================================================================
   6. Content Editor Formatting Toolbar
   ========================================================================= */
const FormattingToolbar = ({
    onFormat,
    onAddImage,
}: {
    onFormat: (prefix: string, suffix?: string, placeholder?: string) => void;
    onAddImage: () => void;
}) => {
    return (
        <div className="flex items-center justify-between gap-1 py-1 px-1.5 bg-surface-hover/40 border border-border/40 rounded-lg text-text-muted flex-wrap">
            <div className="flex items-center gap-1 flex-wrap">
                <button
                    type="button"
                    onClick={() => onFormat("**", "**", "in đậm")}
                    title="In đậm (Bold)"
                    className="w-7 h-7 rounded flex items-center justify-center hover:bg-surface-hover hover:text-text transition-colors text-xs font-bold cursor-pointer"
                >
                    <FontAwesomeIcon icon={faBold} />
                </button>
                <button
                    type="button"
                    onClick={() => onFormat("*", "*", "nghiêng")}
                    title="In nghiêng (Italic)"
                    className="w-7 h-7 rounded flex items-center justify-center hover:bg-surface-hover hover:text-text transition-colors text-xs italic cursor-pointer"
                >
                    <FontAwesomeIcon icon={faItalic} />
                </button>
                <button
                    type="button"
                    onClick={() => onFormat("~~", "~~", "gạch ngang")}
                    title="Gạch ngang (Strikethrough)"
                    className="w-7 h-7 rounded flex items-center justify-center hover:bg-surface-hover hover:text-text transition-colors text-xs cursor-pointer"
                >
                    <FontAwesomeIcon icon={faStrikethrough} />
                </button>
                <span className="w-[1px] h-3.5 bg-border/60 mx-0.5" />
                <button
                    type="button"
                    onClick={() => onFormat("\n- ", "", "mục danh sách")}
                    title="Danh sách (List)"
                    className="w-7 h-7 rounded flex items-center justify-center hover:bg-surface-hover hover:text-text transition-colors text-xs cursor-pointer"
                >
                    <FontAwesomeIcon icon={faListUl} />
                </button>
                <button
                    type="button"
                    onClick={() => onFormat("[", "](https://)", "tiêu đề liên kết")}
                    title="Gắn liên kết (Link)"
                    className="w-7 h-7 rounded flex items-center justify-center hover:bg-surface-hover hover:text-text transition-colors text-xs cursor-pointer"
                >
                    <FontAwesomeIcon icon={faLink} />
                </button>
                <button
                    type="button"
                    onClick={() => onFormat("\n> ", "", "trích dẫn")}
                    title="Trích dẫn (Quote)"
                    className="w-7 h-7 rounded flex items-center justify-center hover:bg-surface-hover hover:text-text transition-colors text-xs cursor-pointer"
                >
                    <FontAwesomeIcon icon={faQuoteLeft} />
                </button>
            </div>

            {/* Top Media Upload Trigger */}
            <button
                type="button"
                onClick={onAddImage}
                title="Tải lên hình ảnh hoặc video"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-surface hover:bg-surface-hover border border-border text-xs font-semibold text-text hover:text-primary transition-colors cursor-pointer"
            >
                <FontAwesomeIcon icon={faImage} className="text-emerald-400 text-xs" />
                <span className="text-[11px]">Ảnh / Video</span>
            </button>
        </div>
    );
};

/* =========================================================================
   CREATE POST MODAL (FULL EXPERIENCE)
   - Sticky Header: CREATE POST ... ×
   - Scrollable Body (Independently scrollable with large content)
   - Sticky Footer: Media / Video, Add attachments ... Cancel, Post
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
    const addPost = usePostsStore((s) => s.addPost);
    const createPostMutation = useCreatePostMutation();

    const [title, setTitle] = useState(initialTitle);
    const [content, setContent] = useState(initialContent);
    const [manualTags, setManualTags] = useState("");
    const [communityId, setCommunityId] = useState<number | string | null>(effectiveDefaultCommunityId || null);
    const [allowComments, setAllowComments] = useState(true);
    const [pinned, setPinned] = useState(false);
    const [isSpoiler, setIsSpoiler] = useState(false);
    const [isNsfw, setIsNsfw] = useState(false);
    const [attachments, setAttachments] = useState<EditableAttachment[]>([]);
    const [isPosting, setIsPosting] = useState(false);
    const [submitAttempted, setSubmitAttempted] = useState(false);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
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
            if (draft.attachments && draft.attachments.length > 0) setAttachments(draft.attachments);
            if (draft.communityId && !effectiveDefaultCommunityId) setCommunityId(draft.communityId);
            if (draft.isSpoiler !== undefined) setIsSpoiler(draft.isSpoiler);
            if (draft.isNsfw !== undefined) setIsNsfw(draft.isNsfw);
            /* eslint-enable react-hooks/set-state-in-effect */
        }
    }, [drafts, initialTitle, initialContent, effectiveDefaultCommunityId]);

    // Auto-save draft on change/unmount
    useEffect(() => {
        if (content.trim() || title.trim()) {
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
            });
        }
    }, [content, title, communityId, attachments, allowComments, pinned, isSpoiler, isNsfw, saveDraft]);

    // Keyboard support: Escape to cancel
    useEffect(() => {
        if (!isVisible) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                handleClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isVisible, handleClose]);

    const targetCommunity = useMemo(() => {
        const targetId = communityId || effectiveDefaultCommunityId;
        if (!targetId) return null;
        return communities.find((c) => String(c.id) === String(targetId)) || null;
    }, [communities, communityId, effectiveDefaultCommunityId]);

    const dynamicPlaceholder = useMemo(() => {
        if (targetCommunity) {
            return language === "vi"
                ? `Chia sẻ với ${targetCommunity.name}...`
                : `Share with ${targetCommunity.name}...`;
        }
        return language === "vi"
            ? "Chia sẻ khoảnh khắc, góc nhìn hoặc khám phá mới..."
            : "Share a moment, thought, or discovery...";
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

    const handleFormat = (prefix: string, suffix: string = prefix, placeholder: string = "") => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const current = content;
        const selected = current.substring(start, end);
        const replacement = selected ? `${prefix}${selected}${suffix}` : `${prefix}${placeholder}${suffix}`;
        const nextContent = current.substring(0, start) + replacement + current.substring(end);
        setContent(nextContent);
        setTimeout(() => {
            textarea.focus();
            const nextPos = selected ? start + replacement.length : start + prefix.length;
            textarea.setSelectionRange(nextPos, nextPos + (selected ? 0 : placeholder.length));
        }, 10);
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
        const splitManualTags = manualTags
            .split(/[, ]+/)
            .filter((t) => t.trim().length > 0)
            .map((t) => (t.startsWith("#") ? t.slice(1) : t));
        const combinedTags = Array.from(new Set([...contentHashtags, ...splitManualTags]));

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
                    communityId,
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
            setManualTags("");
            setAttachments([]);
            setSubmitAttempted(false);
            handleClose();
        } finally {
            setIsPosting(false);
        }
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[120] bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-hidden animate-fade-in select-none">
            {/* Hidden File Inputs */}
            <input
                ref={imageInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleQuickImageChange}
                className="hidden"
            />

            {/* Backdrop click to cancel */}
            <div className="absolute inset-0" onClick={handleClose} />

            {/* Modal Dialog Card */}
            <div
                className="relative w-full max-w-[660px] h-[88vh] max-h-[760px] bg-surface border border-border/80 rounded-xl shadow-2xl flex flex-col overflow-hidden z-10 select-text"
                onClick={(e) => e.stopPropagation()}
            >
                {/* ================= 3. STICKY TOP HEADER ================= */}
                <div className="sticky top-0 z-30 shrink-0 flex items-center justify-between px-4 sm:px-6 py-3.5 bg-surface border-b border-border/60">
                    <span className="text-xs sm:text-[13px] font-black uppercase tracking-wider text-text flex items-center gap-2">
                        {t('feed.createPost', { defaultValue: 'CREATE POST' })}
                    </span>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-hover transition-colors cursor-pointer"
                        title={t('common.cancel', { defaultValue: 'Đóng' })}
                    >
                        <FontAwesomeIcon icon={faXmark} className="text-sm" />
                    </button>
                </div>

                {/* ================= SCROLLABLE EDITOR BODY ================= */}
                <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 flex flex-col gap-4 overscroll-contain">
                    {/* 5. Community Context & Selector */}
                    <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-text-faint">
                            {t('feed.selectCommunity', { defaultValue: 'Cộng đồng mục tiêu' })}
                        </span>
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

                    {/* Post Title Field (Prominent Typography) */}
                    <div className="flex flex-col gap-1 border-b border-border/40 pb-2">
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={t('feed.postTitlePlaceholder', { defaultValue: 'Đặt tiêu đề ấn tượng cho bài viết...' })}
                            className="w-full bg-transparent border-none outline-none text-base sm:text-[17px] font-bold text-text placeholder:text-text-faint py-1.5 px-0"
                        />
                        {title.trim().length > 0 && title.trim().length < 6 && (
                            <p className="text-xs text-amber-500 font-medium flex items-center gap-1.5">
                                <FontAwesomeIcon icon={faTriangleExclamation} />
                                <span>{t('feed.titleMinLenError', { min: 6, current: title.trim().length, defaultValue: `Tiêu đề cần tối thiểu 6 ký tự (hiện tại: ${title.trim().length})` })}</span>
                            </p>
                        )}
                    </div>

                    {/* Tags Input Field */}
                    <div className="border-b border-border/40 pb-2">
                        <input
                            type="text"
                            value={manualTags}
                            onChange={(e) => setManualTags(e.target.value)}
                            placeholder={t('feed.tagsPlaceholder', { defaultValue: 'Thêm thẻ hashtag (ví dụ: #CS2 #Clutch #Premier)...' })}
                            className="w-full bg-transparent border-none outline-none text-xs font-semibold text-primary placeholder:text-text-faint py-1 px-0"
                        />
                    </div>

                    {/* 6. Formatting Toolbar */}
                    <FormattingToolbar
                        onFormat={handleFormat}
                        onAddImage={handleQuickImageClick}
                    />

                    {/* Main Content Textarea */}
                    <div className="relative w-full flex-1 min-h-[160px] flex flex-col">
                        <textarea
                            ref={textareaRef}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            onFocus={() => setIsEditorFocused(true)}
                            onBlur={() => setIsEditorFocused(false)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                                    handlePost();
                                }
                            }}
                            placeholder={dynamicPlaceholder}
                            rows={8}
                            className="w-full flex-1 min-h-[160px] p-2 bg-transparent border-none outline-none text-sm font-normal text-text placeholder:text-text-faint resize-none leading-relaxed"
                        />
                        {content.trim().length > 0 && content.trim().length < 6 && attachments.length === 0 && (
                            <p className="text-xs text-amber-500 font-medium flex items-center gap-1.5 mt-1">
                                <FontAwesomeIcon icon={faTriangleExclamation} />
                                <span>{t('feed.contentMinLenError', { min: 6, current: content.trim().length, defaultValue: `Nội dung cần tối thiểu 6 ký tự (hiện tại: ${content.trim().length})` })}</span>
                            </p>
                        )}
                    </div>

                    {/* Attachments Preview */}
                    {attachments.length > 0 && (
                        <div className="pt-2 border-t border-border/40">
                            <span className="text-[11px] font-bold text-text-muted mb-2 block">
                                {t('feed.attachmentsLabel', { defaultValue: `Đính kèm (${attachments.length})` })}
                            </span>
                            <AttachmentPicker
                                attachments={attachments}
                                onChange={setAttachments}
                                showToolbar={false}
                                compactToolbar
                            />
                        </div>
                    )}
                </div>

                {/* ================= 4. STICKY BOTTOM FOOTER ================= */}
                <div className="sticky bottom-0 z-30 shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 bg-surface border-t border-border/60">
                    {/* Left: Settings Menu (Spoiler / NSFW / Comments / Pin) */}
                    <div>
                        <PostSettingsMenu
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

                    {/* Right Actions: Cancel, Post */}
                    <div className="flex items-center gap-2.5">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-text-muted hover:text-text hover:bg-surface-hover/70 transition-colors cursor-pointer"
                        >
                            {t('common.cancel', { defaultValue: 'Hủy' })}
                        </button>

                        <button
                            type="button"
                            onClick={handlePost}
                            disabled={!canPost}
                            className={`px-5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                canPost
                                    ? "bg-primary hover:bg-primary-hover text-white shadow-xs"
                                    : "bg-primary text-white opacity-40 cursor-not-allowed"
                            }`}
                        >
                            {isPosting ? t('common.loading', { defaultValue: 'Đang đăng...' }) : (t('feed.postButton', { defaultValue: 'Đăng' }))}
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
    initialTitle?: string;
    initialContent?: string;
}

export const CreatePostBox = ({
    onPostCreated,
    defaultCommunityId = null,
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

    const activeFilteredCommunity = useMemo(() => {
        if (!defaultCommunityId) return null;
        return communities.find((c) => String(c.id) === String(defaultCommunityId)) || null;
    }, [communities, defaultCommunityId]);

    const dynamicPlaceholder = useMemo(() => {
        if (activeFilteredCommunity) {
            return language === "vi"
                ? `Chia sẻ với ${activeFilteredCommunity.name}...`
                : `Share with ${activeFilteredCommunity.name}...`;
        }
        return language === "vi"
            ? "Chia sẻ khoảnh khắc, góc nhìn hoặc khám phá mới..."
            : "Share a moment, thought, or discovery...";
    }, [activeFilteredCommunity, language]);

    return (
        <div id="create-post" className="w-full pb-2">
            {/* Feed Quick Trigger Bar */}
            <div
                onClick={() => openCreatePost(defaultCommunityId)}
                className="w-full flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl bg-surface/70 hover:bg-surface-hover/80 border border-border/40 hover:border-border/80 transition-all cursor-pointer group shadow-xs"
            >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="relative shrink-0">
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt="User"
                                className="w-8 h-8 rounded-full object-cover ring-1 ring-border/80"
                                onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).style.display = "none";
                                }}
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-[#181F2C] ring-1 ring-border/80 flex items-center justify-center text-xs font-bold text-[#1688E8] uppercase select-none">
                                {(displayName || "G").replace(/^@/, "").charAt(0) || "G"}
                            </div>
                        )}
                        <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-bg" />
                    </div>

                    <div className="flex flex-col justify-center min-w-0 flex-1">
                        <span className="text-xs sm:text-sm text-text-muted group-hover:text-text transition-colors">
                            {dynamicPlaceholder}
                        </span>
                        {activeFilteredCommunity && (
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

                <div className="flex items-center gap-2 shrink-0">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            openCreatePost(defaultCommunityId);
                        }}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-surface-hover text-xs font-semibold text-text-muted hover:text-text transition-colors cursor-pointer"
                    >
                        <FontAwesomeIcon icon={faImage} className="text-emerald-500 text-xs" />
                        <span className="hidden sm:inline">Media</span>
                    </button>
                </div>
            </div>

            {/* The Modal Component */}
            <CreatePostModal
                defaultCommunityId={defaultCommunityId}
                onPostCreated={onPostCreated}
                initialTitle={initialTitle}
                initialContent={initialContent}
            />
        </div>
    );
};
