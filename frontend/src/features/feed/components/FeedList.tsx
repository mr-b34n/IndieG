import { useState } from "react"
import { faInbox } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

import avatarGame from "../../../assets/logos/raft-logo.png";
import { prepareAttachmentsForSave } from "@/features/post/helpers/postAttachments";
import { useAuthStore } from "@/features/auth";
import { getCurrentAuthor, Post, usePostsStore } from "@/features/post";
import type { PostData } from "@/features/post/components/Post";
import { useCommunitiesStore } from "@/features/community";
import { CreatePostBox, type CreatePostPayload } from "./CreatePostBox";

// Mở rộng tạm PostData với các field cài đặt mới; nên cập nhật type gốc PostData
// (trong Post.tsx) để thêm chính thức các field optional này: pinned?, allowComments?, communityId?.
type PostDataWithSettings = PostData & { pinned?: boolean; allowComments?: boolean; communityId?: string | number };

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
    const getCommunityById = useCommunitiesStore((state) => state.getCommunityById);

    const handleCreatePost = async ({ title, content, attachments, privacy, tags, allowComments, pinned, communityId }: CreatePostPayload) => {
        const { images, files } = await prepareAttachmentsForSave(attachments);
        const community = getCommunityById(communityId);

        const newPost: PostDataWithSettings = {
            id: Date.now(),
            author: currentAuthor,
            authorAvatar: avatarGame,
            gameTag: community?.name ?? "General",
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
            communityId,
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