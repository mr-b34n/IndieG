import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { faInbox, faGlobeAsia, faUserGroup, faLock, faChevronDown, faGear, faThumbtack, faComment } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

import avatarGame from "../../../assets/logos/raft-logo.png";
import { prepareAttachmentsForSave, revokeAttachmentUrls, type EditableAttachment } from "@/features/post/helpers/postAttachments";
import { useAuthStore } from "@/features/auth";
import { AttachmentPicker } from "@/features/post/components/AttachmentPicker";
import { getCurrentAuthor, Post, usePostsStore } from "@/features/post";
import type { PostData } from "@/features/post/components/Post";

// Mở rộng tạm PostData với 2 field cài đặt mới; nên cập nhật type gốc PostData
// (trong Post.tsx) để thêm chính thức 2 field optional này: pinned?, allowComments?.
type PostDataWithSettings = PostData & { pinned?: boolean; allowComments?: boolean };

export type PostPrivacy = "public" | "friends" | "private";

interface CreatePostPayload {
    title: string;
    content: string;
    attachments: EditableAttachment[];
    privacy: PostPrivacy;
    tags: string[];
    allowComments: boolean;
    pinned: boolean;
}

const PRIVACY_OPTIONS: { value: PostPrivacy; label: string; icon: typeof faGlobeAsia }[] = [
    { value: "public", label: "Công khai", icon: faGlobeAsia },
    { value: "friends", label: "Bạn bè", icon: faUserGroup },
    { value: "private", label: "Riêng tư", icon: faLock },
];

const HASHTAG_REGEX = /#[^\s#]+/g;

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

const PrivacySelector = ({ value, onChange }: { value: PostPrivacy; onChange: (v: PostPrivacy) => void }) => {
    const [open, setOpen] = useState(false);
    const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
    const btnRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const current = PRIVACY_OPTIONS.find((o) => o.value === value) ?? PRIVACY_OPTIONS[0];

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
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium bg-surface-hover border border-border text-text-muted hover:text-text hover:border-primary/40 transition-colors"
            >
                <FontAwesomeIcon icon={current.icon} className="text-[11px]" />
                <span>{current.label}</span>
                <FontAwesomeIcon icon={faChevronDown} className="text-[9px] opacity-60" />
            </button>

            {open &&
                coords &&
                createPortal(
                    <div
                        ref={menuRef}
                        style={{ top: coords.top, left: coords.left, transform: "translate(-100%, -100%)" }}
                        className="fixed w-36 py-1 bg-surface border border-border rounded-xl shadow-lg z-[999] overflow-hidden"
                    >
                        {PRIVACY_OPTIONS.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => {
                                    onChange(opt.value);
                                    setOpen(false);
                                }}
                                className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left hover:bg-surface-hover transition-colors ${
                                    opt.value === value ? "text-primary font-semibold" : "text-text"
                                }`}
                            >
                                <FontAwesomeIcon icon={opt.icon} className="text-[11px] w-3" />
                                {opt.label}
                            </button>
                        ))}
                    </div>,
                    document.body
                )}
        </div>
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
                title="Cài đặt bài viết"
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
                            label="Cho phép bình luận"
                            icon={faComment}
                        />
                        <ToggleSwitch
                            checked={pinned}
                            onChange={onPinnedChange}
                            label="Ghim lên đầu feed"
                            icon={faThumbtack}
                        />
                    </div>,
                    document.body
                )}
        </div>
    );
};

const MAX_TEXTAREA_HEIGHT = 280; // px — chiều cao tối đa trước khi bắt đầu scroll

const CreatePostBox = ({ onPost }: { onPost: (data: CreatePostPayload) => Promise<void> }) => {
    const user = useAuthStore((state) => state.user);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [attachments, setAttachments] = useState<EditableAttachment[]>([]);
    const [privacy, setPrivacy] = useState<PostPrivacy>("public");
    const [allowComments, setAllowComments] = useState(true);
    const [pinned, setPinned] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [isPosting, setIsPosting] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const highlightRef = useRef<HTMLDivElement>(null);

    const handleTextareaScroll = () => {
        if (highlightRef.current && textareaRef.current) {
            highlightRef.current.scrollTop = textareaRef.current.scrollTop;
            highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
        }
    };

    // Tự giãn chiều cao textarea theo nội dung, chỉ scroll khi vượt MAX_TEXTAREA_HEIGHT
    const isActive = expanded || content.trim().length > 0 || attachments.length > 0 || title.trim().length > 0;

    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = "auto";
        const newHeight = Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT);
        el.style.height = `${newHeight}px`;
        el.style.overflowY = el.scrollHeight > MAX_TEXTAREA_HEIGHT ? "auto" : "hidden";
    }, [content, isActive]);

    const canPost = content.trim().length > 0 && !isPosting;
    const avatarUrl =
        user?.user_metadata?.avatar_url ??
        "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix";

    const handlePost = async () => {
        if (!canPost) return;

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
            });
            revokeAttachmentUrls(attachments);
            setTitle("");
            setContent("");
            setAttachments([]);
            setPrivacy("public");
            setAllowComments(true);
            setPinned(false);
            setExpanded(false);
        } finally {
            setIsPosting(false);
        }
    };

    return (
        <div
            id="create-post"
            className="
                relative z-20
                w-full p-3
                bg-surface/90 backdrop-blur-md
                border border-border rounded-2xl
                shadow-[0_2px_12px_rgba(0,0,0,0.06)]
                dark:shadow-[0_2px_16px_rgba(0,0,0,0.30)]
                transition-all duration-200 ease-out
            "
        >
            <div className="flex gap-2.5 items-start">
                <img
                    src={avatarUrl}
                    alt="User"
                    className={`w-9 h-9 rounded-full object-cover ring-1 ring-border shrink-0 transition-all duration-200 ease-out ${
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
                        <div className="overflow-hidden min-h-0">
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Post title (optional)"
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
                            placeholder="What's on your mind?"
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
                            {/* Khoảng trắng cuối để giữ đúng chiều cao khi nội dung kết thúc bằng dòng mới */}
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
                                {isActive && (
                                    <>
                                        <PostSettingsMenu
                                            allowComments={allowComments}
                                            onAllowCommentsChange={setAllowComments}
                                            pinned={pinned}
                                            onPinnedChange={setPinned}
                                        />
                                        <PrivacySelector value={privacy} onChange={setPrivacy} />
                                    </>
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
                                    {isPosting ? "Posting..." : "Post"}
                                </button>
                            </div>
                        }
                    />
                </div>
            </div>
        </div>
    );
};

export const FeedList = () => {
    const user = useAuthStore((state) => state.user);
    const mockLogin = useAuthStore((state) => state.mockLogin);
    const isLoggedIn = !!user || mockLogin;

    const posts = usePostsStore((state) => state.posts);
    const addPost = usePostsStore((state) => state.addPost);
    const updatePost = usePostsStore((state) => state.updatePost);
    const deletePost = usePostsStore((state) => state.deletePost);

    const [hiddenAuthors, setHiddenAuthors] = useState<string[]>([]);
    const currentAuthor = getCurrentAuthor();

    const handleCreatePost = async ({ title, content, attachments, privacy, tags, allowComments, pinned }: CreatePostPayload) => {
        const { images, files } = await prepareAttachmentsForSave(attachments);

        const newPost: PostDataWithSettings = {
            id: Date.now(),
            author: currentAuthor,
            authorAvatar: avatarGame,
            gameTag: "General",
            timeAgo: "Vừa xong",
            title: title || content.slice(0, 80) + (content.length > 80 ? "..." : ""),
            content,
            images: images.length > 0 ? images : undefined,
            files: files.length > 0 ? files : undefined,
            tags,
            likes: 0,
            comments: 0,
            privacy,
            allowComments,
            pinned,
        };
        addPost(newPost);
    };

    const handleEditPost = (
        id: string | number,
        data: { title: string; content: string; images?: string[]; files?: PostData["files"] }
    ) => {
        updatePost(id, {
            title: data.title || data.content.slice(0, 80) + (data.content.length > 80 ? "..." : ""),
            content: data.content,
            images: data.images,
            files: data.files,
        });
    };

    const handleUnfollowAuthor = (author: string) => {
        setHiddenAuthors((prev) => [...prev, author]);
    };

    const filteredPosts = posts
        .filter((p) => !hiddenAuthors.includes(p.author))
        .slice()
        .sort((a, b) => Number(!!(b as PostDataWithSettings).pinned) - Number(!!(a as PostDataWithSettings).pinned));

    return (
        <div className="w-full flex flex-col gap-3">

            {isLoggedIn && <CreatePostBox onPost={handleCreatePost} />}

            {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                    <Post
                        key={post.id}
                        post={post}
                        isOwner={post.author === currentAuthor}
                        onDelete={deletePost}
                        onEdit={handleEditPost}
                        onUnfollowAuthor={handleUnfollowAuthor}
                    />
                ))
            ) : (
                <div className="
                    w-full flex flex-col items-center justify-center gap-2 p-10
                    bg-surface/90 backdrop-blur-md border border-border rounded-2xl
                    text-text-muted text-sm
                ">
                    <FontAwesomeIcon icon={faInbox} className="text-2xl text-text-faint mb-1" />
                    <p className="font-semibold text-text">No posts here yet</p>
                    <p className="text-text-faint text-center">Check back later or create a new post.</p>
                </div>
            )}
        </div>
    );
}