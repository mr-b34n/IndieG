import { useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { faChevronDown, faGear, faThumbtack, faComment, faBookmark, faFileLines, faTrash, faClock, faXmark, faCheck } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useTranslation } from "@/shared/hooks/useTranslate";

import { revokeAttachmentUrls, type EditableAttachment } from "@/features/post/helpers/postAttachments";
import { useAuthStore } from "@/features/auth";
import { useCommunitiesStore, type CommunityData } from "@/features/community";
import { AttachmentPicker, useDraftsStore, type PostDraft } from "@/features/post";
import { type PostPrivacy, type CreatePostPayload } from "../types";
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
            className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                checked ? "bg-primary" : "bg-surface-hover border border-border"
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
}: {
    allowComments: boolean;
    onAllowCommentsChange: (v: boolean) => void;
    pinned: boolean;
    onPinnedChange: (v: boolean) => void;
}) => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
    const btnRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const openMenu = () => {
        const rect = btnRef.current?.getBoundingClientRect();
        if (rect) setCoords({ top: rect.top - 6, left: rect.right });
        setOpen(true);
    };

    useEffect(() => {
        if (!open) return;

        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;
            if (btnRef.current?.contains(target) || menuRef.current?.contains(target)) return;
            setOpen(false);
        };
        const handleReposition = () => setOpen(false);

        document.addEventListener("mousedown", handleClickOutside);
        window.addEventListener("scroll", handleReposition, true);
        window.addEventListener("resize", handleReposition);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("scroll", handleReposition, true);
            window.removeEventListener("resize", handleReposition);
        };
    }, [open]);

    return (
        <div className="relative shrink-0">
            <button
                ref={btnRef}
                type="button"
                onClick={() => (open ? setOpen(false) : openMenu())}
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm transition-colors ${
                    pinned || !allowComments
                        ? "bg-primary/10 text-primary"
                        : "bg-surface-hover border border-border text-text-muted hover:text-text hover:border-primary/40"
                }`}
                title={t('feed.privacy')}
            >
                <FontAwesomeIcon icon={faGear} className="text-[13px]" />
            </button>

            {open &&
                coords &&
                createPortal(
                    <div
                        ref={menuRef}
                        style={{ top: coords.top, left: coords.left, transform: "translate(-100%, -100%)" }}
                        className="fixed w-52 py-1.5 bg-surface border border-border rounded-xl shadow-lg z-[999] overflow-hidden"
                    >
                        <ToggleSwitch
                            checked={allowComments}
                            onChange={onAllowCommentsChange}
                            label={t('feed.allowComments')}
                            icon={faComment}
                        />
                        <ToggleSwitch
                            checked={pinned}
                            onChange={onPinnedChange}
                            label={t('feed.pinned')}
                            icon={faThumbtack}
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
}: {
    value: string | number | null;
    onChange: (id: string | number) => void;
    communities: CommunityData[];
}) => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null);
    const btnRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const current = communities.find((c) => c.id === value) ?? null;
    const hasCommunities = communities.length > 0;

    const openMenu = () => {
        if (!hasCommunities) return;
        const rect = btnRef.current?.getBoundingClientRect();
        if (rect) setCoords({ top: rect.bottom + 6, left: rect.left, width: rect.width });
        setOpen(true);
    };

    useEffect(() => {
        if (!open) return;

        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;
            if (btnRef.current?.contains(target) || menuRef.current?.contains(target)) return;
            setOpen(false);
        };
        const handleReposition = () => setOpen(false);

        document.addEventListener("mousedown", handleClickOutside);
        window.addEventListener("scroll", handleReposition, true);
        window.addEventListener("resize", handleReposition);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("scroll", handleReposition, true);
            window.removeEventListener("resize", handleReposition);
        };
    }, [open]);

    return (
        <div className="relative w-full">
            <button
                ref={btnRef}
                type="button"
                onClick={() => (open ? setOpen(false) : openMenu())}
                disabled={!hasCommunities}
                className={`w-full h-9 flex items-center gap-2 px-3 rounded-xl text-sm border transition-colors ${
                    hasCommunities
                        ? "bg-surface-hover border-border text-text hover:border-primary/40"
                        : "bg-surface-hover border-border text-text-faint cursor-not-allowed"
                }`}
            >
                {current ? (
                    <>
                        <img src={current.logo} alt={current.name} className="w-5 h-5 rounded-full object-cover shrink-0" />
                        <span className="truncate">{current.name}</span>
                    </>
                ) : (
                    <span className="truncate text-text-faint">
                        {hasCommunities ? t('feed.selectCommunityRequired') : t('feed.noCommunitiesJoined')}
                    </span>
                )}
                <FontAwesomeIcon icon={faChevronDown} className="text-[10px] opacity-60 ml-auto shrink-0" />
            </button>

            {open &&
                coords &&
                createPortal(
                    <div
                        ref={menuRef}
                        style={{ top: coords.top, left: coords.left, width: coords.width }}
                        className="fixed py-1 bg-surface border border-border rounded-xl shadow-lg z-[999] overflow-hidden max-h-64 overflow-y-auto"
                    >
                        {communities.map((c) => (
                            <button
                                key={c.id}
                                type="button"
                                onClick={() => {
                                    onChange(c.id);
                                    setOpen(false);
                                }}
                                className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-surface-hover transition-colors ${
                                    c.id === value ? "text-primary font-semibold" : "text-text"
                                }`}
                            >
                                <img src={c.logo} alt={c.name} className="w-5 h-5 rounded-full object-cover shrink-0" />
                                <span className="truncate">{c.name}</span>
                            </button>
                        ))}
                    </div>,
                    document.body
                )}
        </div>
    );
};

const DraftsModal = ({
    isOpen,
    onClose,
    onSelectDraft,
}: {
    isOpen: boolean;
    onClose: () => void;
    onSelectDraft: (draft: PostDraft) => void;
}) => {
    const { t } = useTranslation();
    const drafts = useDraftsStore((state) => state.drafts);
    const deleteDraft = useDraftsStore((state) => state.deleteDraft);
    const getCommunityById = useCommunitiesStore((state) => state.getCommunityById);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-surface-hover/50">
                    <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faBookmark} className="text-primary text-lg" />
                        <h3 className="font-bold text-base text-text">{t('feed.drafts')} ({drafts.length})</h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-hover transition-colors"
                    >
                        <FontAwesomeIcon icon={faXmark} className="text-lg" />
                    </button>
                </div>

                <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-3">
                    {drafts.length === 0 ? (
                        <div className="py-12 text-center text-text-faint text-sm flex flex-col items-center gap-2">
                            <FontAwesomeIcon icon={faFileLines} className="text-3xl text-text-faint/50 mb-1" />
                            <p>{t('feed.noDrafts')}</p>
                            <p className="text-xs">{t('feed.draftsDesc')}</p>
                        </div>
                    ) : (
                        drafts.map((draft) => {
                            const comm = draft.communityId ? getCommunityById(draft.communityId) : null;
                            return (
                                <div
                                    key={draft.id}
                                    className="p-3.5 bg-surface-hover/40 border border-border rounded-xl flex flex-col gap-2 hover:border-primary/40 transition-all group"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex flex-col gap-1 min-w-0 flex-1">
                                            {comm && (
                                                <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full w-fit">
                                                    {comm.name}
                                                </span>
                                            )}
                                            <h4 className="font-semibold text-sm text-text truncate">
                                                {draft.title || (draft.content ? draft.content.slice(0, 50) + "..." : t('feed.noTitle'))}
                                            </h4>
                                            <p className="text-xs text-text-muted line-clamp-2">
                                                {draft.content || t('feed.noContent')}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteDraft(draft.id);
                                            }}
                                            title={t('feed.deleteDraft')}
                                            className="text-text-faint hover:text-error p-1.5 rounded-lg hover:bg-error/10 transition-colors"
                                        >
                                            <FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between pt-2 border-t border-border/50 text-[11px] text-text-faint mt-1">
                                        <span className="flex items-center gap-1">
                                            <FontAwesomeIcon icon={faClock} className="w-3" />
                                            {t('feed.savedAt', { time: draft.updatedAt })}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                onSelectDraft(draft);
                                                onClose();
                                            }}
                                            className="px-3 py-1 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors shadow-sm"
                                        >
                                            {t('feed.continueEdit')}
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export const CreatePostBox = ({ onPost }: { onPost: (data: CreatePostPayload) => Promise<void> }) => {
    const { t } = useTranslation();
    const user = useAuthStore((state) => state.user);
    const communities = useCommunitiesStore((state) => state.communities);
    const joinedCommunities = useMemo(() => communities.filter((c) => c.joined), [communities]);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [attachments, setAttachments] = useState<EditableAttachment[]>([]);
    const [privacy, setPrivacy] = useState<PostPrivacy>("public");
    const [allowComments, setAllowComments] = useState(true);
    const [pinned, setPinned] = useState(false);
    const [communityId, setCommunityId] = useState<string | number | null>(null);
    const [expanded, setExpanded] = useState(false);
    const [isPosting, setIsPosting] = useState(false);
    const [showDraftsModal, setShowDraftsModal] = useState(false);
    const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
    const [isDraftSaved, setIsDraftSaved] = useState(false);
    const drafts = useDraftsStore((state) => state.drafts);
    const saveDraft = useDraftsStore((state) => state.saveDraft);
    const deleteDraft = useDraftsStore((state) => state.deleteDraft);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const highlightRef = useRef<HTMLDivElement>(null);

    const handleTextareaScroll = () => {
        if (highlightRef.current && textareaRef.current) {
            highlightRef.current.scrollTop = textareaRef.current.scrollTop;
            highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
        }
    };

    const isActive = expanded || content.trim().length > 0 || attachments.length > 0 || title.trim().length > 0;

    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = "auto";
        const newHeight = Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT);
        el.style.height = `${newHeight}px`;
        el.style.overflowY = el.scrollHeight > MAX_TEXTAREA_HEIGHT ? "auto" : "hidden";
    }, [content, isActive]);

    const canPost = content.trim().length > 0 && !!communityId && !isPosting;
    const avatarUrl =
        user?.user_metadata?.avatar_url ??
        "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix";

    const handlePost = async () => {
        if (!canPost || !communityId) return;

        setIsPosting(true);
        try {
            await onPost({
                title: title.trim(),
                content: content.trim(),
                attachments,
                privacy,
                tags: extractHashtags(content),
                allowComments,
                pinned,
                communityId,
            });
            if (currentDraftId) {
                deleteDraft(currentDraftId);
                setCurrentDraftId(null);
            }
            revokeAttachmentUrls(attachments);
            setTitle("");
            setContent("");
            setAttachments([]);
            setPrivacy("public");
            setAllowComments(true);
            setPinned(false);
            setCommunityId(null);
            setExpanded(false);
        } finally {
            setIsPosting(false);
        }
    };

    const handleSaveDraft = () => {
        if (!content.trim() && !title.trim()) return;
        const savedId = saveDraft({
            id: currentDraftId || undefined,
            title: title.trim(),
            content: content.trim(),
            privacy,
            allowComments,
            pinned,
            communityId,
        });
        setCurrentDraftId(savedId);
        setIsDraftSaved(true);
        setTimeout(() => setIsDraftSaved(false), 2500);
    };

    const handleSelectDraft = (draft: PostDraft) => {
        setTitle(draft.title);
        setContent(draft.content);
        setPrivacy(draft.privacy);
        setAllowComments(draft.allowComments);
        setPinned(draft.pinned);
        setCommunityId(draft.communityId);
        setCurrentDraftId(draft.id);
        setExpanded(true);
    };

    return (
        <div
            id="create-post"
            className="
                relative z-20
                w-full p-3
                bg-surface/95 backdrop-blur-md
                rounded-xl
                shadow-[0_12px_35px_-5px_rgba(0,0,0,0.14),0_4px_15px_-5px_rgba(0,0,0,0.08)]
                dark:shadow-[0_12px_35px_-5px_rgba(0,0,0,0.45),0_4px_15px_-5px_rgba(0,0,0,0.25)]
                transition-all duration-300 ease-out
            "
        >
            <div className="flex gap-2.5 items-start">
                <img
                    src={avatarUrl}
                    alt="User"
                    className={`w-8 h-8 rounded-full object-cover ring-1 ring-border shrink-0 transition-all duration-200 ease-out ${
                        isActive ? "" : "self-center"
                    }`}
                />
                <div className="flex flex-col gap-1.5 w-full min-w-0">
                    <div
                        className={`grid transition-[grid-template-rows,opacity,margin] duration-200 ease-out ${
                            isActive
                                ? "grid-rows-[1fr] opacity-100"
                                : "grid-rows-[0fr] opacity-0 -mb-1.5 pointer-events-none"
                        }`}
                        aria-hidden={!isActive}
                    >
                        <div className={`min-h-0 flex flex-col gap-1.5 ${isActive ? "overflow-visible" : "overflow-hidden"}`}>
                            <CommunitySelector
                                value={communityId}
                                onChange={setCommunityId}
                                communities={joinedCommunities}
                            />
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder={t('feed.postTitle')}
                                tabIndex={isActive ? 0 : -1}
                                className="w-full h-9 px-3 bg-surface-hover border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-text placeholder:text-text-faint"
                            />
                        </div>
                    </div>
                    <div
                        className={`relative w-full bg-surface-hover border border-border rounded-xl transition-[border-color,box-shadow] duration-200 ease-out focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 ${
                            isActive ? "min-h-19" : "min-h-9"
                        }`}
                    >
                        <textarea
                            ref={textareaRef}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            onScroll={handleTextareaScroll}
                            onFocus={() => setExpanded(true)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handlePost();
                            }}
                            placeholder={t('feed.whatOnMind')}
                            rows={1}
                            className={`block w-full px-3 bg-transparent border-none outline-none text-sm text-transparent caret-text placeholder:text-text-faint resize-none leading-snug transition-[padding] duration-200 ease-out ${
                                isActive ? "min-h-19 py-2" : "min-h-9 py-1.5"
                            }`}
                        />
                        <div
                            ref={highlightRef}
                            aria-hidden
                            className={`absolute inset-0 px-3 text-sm leading-snug whitespace-pre-wrap break-words overflow-hidden pointer-events-none text-text transition-[padding] duration-200 ease-out ${
                                isActive ? "py-2" : "py-1.5"
                            }`}
                        >
                            {renderHighlightedContent(content)}
                            {content.endsWith("\n") ? "\u200b" : null}
                        </div>
                    </div>

                    <AttachmentPicker
                        attachments={attachments}
                        onChange={setAttachments}
                        showToolbar={isActive}
                        compactToolbar
                        className="gap-1.5"
                        toolbarTrailing={
                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setShowDraftsModal(true)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-surface-hover border border-border text-text hover:border-primary/50 transition-all shrink-0"
                                    title={t('feed.drafts')}
                                >
                                    <FontAwesomeIcon icon={faBookmark} className="text-primary w-3.5" />
                                    <span>{t('feed.drafts')}</span>
                                    {drafts.length > 0 && (
                                        <span className="bg-primary text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                                            {drafts.length}
                                        </span>
                                    )}
                                </button>
                                {isActive && (
                                    <button
                                        type="button"
                                        onClick={handleSaveDraft}
                                        disabled={!content.trim() && !title.trim()}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all shrink-0 ${
                                            isDraftSaved
                                                ? "bg-success/15 border-success text-success"
                                                : "bg-surface-hover border-border text-text-muted hover:text-text hover:border-primary/50"
                                        }`}
                                        title={t('feed.saveDraftTooltip')}
                                    >
                                        <FontAwesomeIcon icon={isDraftSaved ? faCheck : faFileLines} className="w-3.5" />
                                        <span>{isDraftSaved ? t('feed.draftSaved') : t('feed.saveDraft')}</span>
                                    </button>
                                )}
                                {isActive && (
                                    <PostSettingsMenu
                                        allowComments={allowComments}
                                        onAllowCommentsChange={setAllowComments}
                                        pinned={pinned}
                                        onPinnedChange={setPinned}
                                    />
                                )}
                                <button
                                    type="button"
                                    onClick={handlePost}
                                    disabled={!canPost}
                                    className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                                        canPost
                                            ? "bg-primary text-white hover:bg-primary-hover shadow-[0_2px_10px_rgba(124,77,255,0.35)]"
                                            : "bg-surface-hover text-text-faint cursor-not-allowed"
                                    }`}
                                >
                                    {isPosting ? t('common.loading') : t('feed.postButton')}
                                </button>
                            </div>
                        }
                    />
                </div>
            </div>
            <DraftsModal
                isOpen={showDraftsModal}
                onClose={() => setShowDraftsModal(false)}
                onSelectDraft={handleSelectDraft}
            />
        </div>
    );
};