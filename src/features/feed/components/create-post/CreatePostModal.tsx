import React, { useState, useRef, useMemo, useEffect } from "react";
import { AppIcon as FontAwesomeIcon } from "@/shared/components/ui/Icon";
import { X as faXmark, CircleNotch as faSpinner, Warning as faTriangleExclamation } from "@phosphor-icons/react";
import { useTranslation } from "@/shared/hooks/useTranslate";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useCommunitiesStore } from "@/features/community";
import { type CommunityData } from "@/features/community/types";
import { useCreatePostModalStore } from "@/features/feed/store/useCreatePostModalStore";
import { usePostsStore } from "@/features/post/store/usePostsStore";
import { useRegisterOverlay } from "@/shared/utils/overlayManager";
import { useHotkeys } from "@/shared/hooks/useHotkeys";
import { RichTextEditor } from "@/shared/components/ui/RichTextEditor";
import {
    AttachmentPicker,
    type EditableAttachment,
    createAttachmentFromFile,
    prepareAttachmentsForSave,
    revokeAttachmentUrls,
    getCurrentAuthor,
    savePostDraft,
    loadPostDraft,
    clearPostDraft,
    hasPostDraftContent,
} from "@/features/post";
import type { CreatePostPayload, PostDataWithSettings } from "@/features/feed/types";
import { useCreatePostMutation } from "@/shared/api/useQueries";
import { toast } from "@/shared/store/useToastStore";
import { HASHTAG_REGEX } from "@/features/feed/constants";
import { CommunitySelector } from "./CommunitySelector";
import { TagsInput } from "./TagsInput";
import { PostSettingsSection } from "./PostSettingsSection";

export type { CreatePostPayload };

const extractHashtags = (text: string): string[] => {
    const matches = text.match(HASHTAG_REGEX) ?? [];
    const seen = new Set<string>();
    matches.forEach((m) => seen.add(m.slice(1)));
    return Array.from(seen);
};

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

    const communities = useCommunitiesStore((s) => s.communities);
    const getCommunityById = useCommunitiesStore((s) => s.getCommunityById);
    const joinedCommunities = useMemo(() => {
        const joined = communities.filter((c) => c.joined || (c as CommunityData & { isJoined?: boolean }).isJoined);
        return joined.length > 0 ? joined : communities;
    }, [communities]);

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
    const hasRestoredDraftRef = useRef(false);
    const userId = user?.id ? String(user.id) : undefined;

    // Sync effective community ID
    useEffect(() => {
        if (effectiveDefaultCommunityId !== null && effectiveDefaultCommunityId !== undefined) {
            setCommunityId(effectiveDefaultCommunityId);
        }
    }, [effectiveDefaultCommunityId]);

    // Restore user's localStorage post draft when modal opens (if no explicit initial content)
    useEffect(() => {
        if (!isVisible) {
            hasRestoredDraftRef.current = false;
            return;
        }
        if (hasRestoredDraftRef.current) return;
        hasRestoredDraftRef.current = true;

        if (!userId || initialTitle || initialContent) return;

        const saved = loadPostDraft(userId);
        if (saved) {
            setTitle(saved.title);
            setContent(saved.content);
            setTags(saved.tags);
            if (saved.communityId !== null && !effectiveDefaultCommunityId) {
                setCommunityId(saved.communityId);
            }
            setAllowComments(saved.allowComments);
            setPinned(saved.pinned);
            setIsSpoiler(saved.isSpoiler);
            setIsNsfw(saved.isNsfw);
        }
    }, [isVisible, userId, initialTitle, initialContent, effectiveDefaultCommunityId]);

    const hasDraftContent = useMemo(
        () => hasPostDraftContent({ title, content, tags }),
        [title, content, tags]
    );

    // Debounced auto-save of user's post draft to localStorage
    useEffect(() => {
        if (!isVisible || !hasRestoredDraftRef.current || !userId) return;

        const timer = window.setTimeout(() => {
            savePostDraft(userId, {
                title,
                content,
                tags,
                communityId,
                allowComments,
                pinned,
                isSpoiler,
                isNsfw,
            });
        }, 300);

        return () => window.clearTimeout(timer);
    }, [isVisible, userId, title, content, tags, communityId, allowComments, pinned, isSpoiler, isNsfw]);

    const attachmentsRef = useRef<EditableAttachment[]>(attachments);
    attachmentsRef.current = attachments;

    // Revoke any remaining blob: object URLs on unmount to prevent browser RAM leaks
    useEffect(() => {
        return () => {
            if (attachmentsRef.current.length > 0) {
                revokeAttachmentUrls(attachmentsRef.current);
            }
        };
    }, []);

    const resetForm = () => {
        if (attachmentsRef.current.length > 0) {
            revokeAttachmentUrls(attachmentsRef.current);
        }
        setTitle("");
        setContent("");
        setTags([]);
        setAttachments([]);
        setAllowComments(true);
        setPinned(false);
        setIsSpoiler(false);
        setIsNsfw(false);
        setSubmitAttempted(false);
        clearPostDraft(userId);
    };

    const handleCloseWithDraftFlush = () => {
        if (userId && !initialTitle && !initialContent) {
            savePostDraft(userId, {
                title,
                content,
                tags,
                communityId,
                allowComments,
                pinned,
                isSpoiler,
                isNsfw,
            });
        }
        handleClose();
    };

    useRegisterOverlay({
        id: "create-post-modal",
        isOpen: isVisible,
        onClose: handleCloseWithDraftFlush,
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
                    authorAvatar: user?.avatarUrl || user?.avatar_url || "",
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
                        const created = await createPostMutation.mutateAsync({
                            communityId: String(communityId),
                            title: title.trim() || undefined,
                            content: content.trim(),
                            images: images.length > 0 ? images : undefined,
                            tags: combinedTags,
                            allowComments,
                        });
                        if (created) {
                            addPost(created as any);
                        } else {
                            addPost(newPost);
                        }
                    } catch (err) {
                        toast.error(
                            err instanceof Error
                                ? err.message
                                : "Đăng bài thất bại. Vui lòng thử lại!"
                        );
                        return;
                    }
                } else {
                    addPost(newPost);
                }
            }

            // Reset and close
            resetForm();
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
            <div className="absolute inset-0" onClick={handleCloseWithDraftFlush} />

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
                        {userId && hasDraftContent && (
                            <span className="text-[11px] text-text-faint flex items-center gap-1.5 ml-1 animate-fade-in">
                                <span>•</span>
                                <span>{t('feed.draftSaved', { defaultValue: 'Bản nháp đã lưu' })}</span>
                                <button
                                    type="button"
                                    onClick={resetForm}
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
                        onClick={handleCloseWithDraftFlush}
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
