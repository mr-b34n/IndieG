import { faBookmark } from "@fortawesome/free-regular-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

import { getCurrentAuthor, Post, usePostsStore } from "@/features/post";
import type { PostData } from "@/features/post/components/Post";
import { useBookmarksStore } from "../store/useBookmarkStore";

export const BookmarkList = () => {
    const posts = usePostsStore((state) => state.posts);
    const updatePost = usePostsStore((state) => state.updatePost);
    const deletePost = usePostsStore((state) => state.deletePost);

    const bookmarkedIds = useBookmarksStore((state) => state.bookmarkedIds);
    const removeBookmark = useBookmarksStore((state) => state.removeBookmark);
    const currentAuthor = getCurrentAuthor();

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

    const handleUnfollowAuthor = () => {
        // Danh sách bookmark không lọc theo tác giả đang follow, không cần xử lý gì thêm ở đây.
    };

    // Giữ đúng thứ tự bookmark gần nhất trước (theo bookmarkedIds), chỉ lấy các post còn tồn tại.
    const bookmarkedPosts = bookmarkedIds
        .map((id) => posts.find((p) => p.id.toString() === id.toString()))
        .filter((p): p is PostData => Boolean(p));

    return (
        <div className="w-full flex flex-col gap-3">
            {bookmarkedPosts.length > 0 ? (
                bookmarkedPosts.map((post) => (
                    <Post
                        key={post.id}
                        post={post}
                        isOwner={post.author === currentAuthor}
                        onDelete={(id) => {
                            deletePost(id);
                            removeBookmark(id);
                        }}
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
                    <FontAwesomeIcon icon={faBookmark} className="text-2xl text-text-faint mb-1" />
                    <p className="font-semibold text-text">Chưa có bài viết nào được lưu</p>
                    <p className="text-text-faint text-center">Nhấn biểu tượng bookmark trên bài viết để lưu lại xem sau.</p>
                </div>
            )}
        </div>
    );
}