
import { useState } from "react"
import { faInbox } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

import avatarGame from "../../../assets/logos/raft-logo.png";
import { prepareAttachmentsForSave, revokeAttachmentUrls, type EditableAttachment } from "@/features/post/helpers/postAttachments";
import { useAuthStore } from "@/features/auth";
import { AttachmentPicker } from "@/features/post/components/AttachmentPicker";
import { getCurrentAuthor, Post, usePostsStore } from "@/features/post";
import type { PostData } from "@/features/post/components/Post";

interface CreatePostPayload {
    title: string;
    content: string;
    attachments: EditableAttachment[];
}

const CreatePostBox = ({ onPost }: { onPost: (data: CreatePostPayload) => Promise<void> }) => {
    const user = useAuthStore((state) => state.user);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [attachments, setAttachments] = useState<EditableAttachment[]>([]);
    const [expanded, setExpanded] = useState(false);
    const [isPosting, setIsPosting] = useState(false);

    const isActive = expanded || content.trim().length > 0 || attachments.length > 0 || title.trim().length > 0;
    const canPost = content.trim().length > 0 && !isPosting;
    const avatarUrl =
        user?.user_metadata?.avatar_url ??
        "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix";

    const handlePost = async () => {
        if (!canPost) return;

        setIsPosting(true);
        try {
            await onPost({ title: title.trim(), content: content.trim(), attachments });
            revokeAttachmentUrls(attachments);
            setTitle("");
            setContent("");
            setAttachments([]);
            setExpanded(false);
        } finally {
            setIsPosting(false);
        }
    };

    return (
        <div
            id="create-post"
            className="
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
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onFocus={() => setExpanded(true)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handlePost();
                        }}
                        placeholder="What's on your mind?"
                        rows={1}
                        className={`w-full px-3 py-2 bg-surface-hover border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-[min-height,border-color,box-shadow] duration-200 ease-out text-text placeholder:text-text-faint resize-none leading-snug ${
                            isActive ? "min-h-[4.75rem]" : "min-h-[2.25rem]"
                        }`}
                    />

                    <AttachmentPicker
                        attachments={attachments}
                        onChange={setAttachments}
                        showToolbar={isActive}
                        compactToolbar
                        className="gap-1.5"
                        toolbarTrailing={
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

    const handleCreatePost = async ({ title, content, attachments }: CreatePostPayload) => {
        const { images, files } = await prepareAttachmentsForSave(attachments);

        const newPost: PostData = {
            id: Date.now(),
            author: currentAuthor,
            authorAvatar: avatarGame,
            gameTag: "General",
            timeAgo: "Vừa xong",
            title: title || content.slice(0, 80) + (content.length > 80 ? "..." : ""),
            content,
            images: images.length > 0 ? images : undefined,
            files: files.length > 0 ? files : undefined,
            tags: [],
            likes: 0,
            comments: 0,
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

    const filteredPosts = posts.filter((p) => !hiddenAuthors.includes(p.author));

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
