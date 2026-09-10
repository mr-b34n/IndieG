import { useState, useEffect, useMemo } from "react";
import { faBookmark } from "@fortawesome/free-regular-svg-icons";
import { faSpinner, faBookmark as faBookmarkSolid } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "@/shared/hooks/useTranslate";
import { useAuthStore } from "@/features/auth";

import { getCurrentAuthor, Post, usePostsStore, type PostData } from "@/features/post";
import { useBookmarksStore } from "../store/useBookmarkStore";
import { Pagination } from "@/shared/components/ui/Pagination";
import { useBookmarksQuery, useDeleteBookmarkMutation } from "@/shared/api/useQueries";
import { mapPostDtoToPostData, type PostDto } from "@/shared/api";

interface BookmarkListProps {
    showHeader?: boolean;
}

export const BookmarkList = ({ showHeader = false }: BookmarkListProps) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const mockLogin = useAuthStore((state) => state.mockLogin);
    const isLoggedIn = !!user || mockLogin;

    const posts = usePostsStore((state) => state.posts);
    const updatePost = usePostsStore((state) => state.updatePost);
    const deletePost = usePostsStore((state) => state.deletePost);

    const bookmarkedIds = useBookmarksStore((state) => state.bookmarkedIds);
    const removeBookmark = useBookmarksStore((state) => state.removeBookmark);
    const setBookmarkedIds = useBookmarksStore((state) => state.setBookmarkedIds);
    const currentAuthor = getCurrentAuthor();

    // Query bookmarks from backend API
    const { data: bookmarksData, isLoading: isBookmarksLoading } = useBookmarksQuery({ targetType: "post" }, isLoggedIn);
    const deleteBookmarkMutation = useDeleteBookmarkMutation();

    // Sync store with backend bookmarks data
    useEffect(() => {
        if (bookmarksData && Array.isArray(bookmarksData)) {
            const ids = bookmarksData.map((b) => b.targetId);
            setBookmarkedIds(ids);
        }
    }, [bookmarksData, setBookmarkedIds]);

    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 4;

    const handleEditPost = (id: string | number, data: Partial<PostData>) => {
        updatePost(id, {
            ...data,
            title: data.title || (data.content ? data.content.slice(0, 80) + (data.content.length > 80 ? "..." : "") : ""),
        });
    };

    const handleUnfollowAuthor = () => {};

    const handleRemoveBookmark = async (id: string | number) => {
        removeBookmark(id);
        try {
            await deleteBookmarkMutation.mutateAsync({
                targetType: "post",
                targetId: String(id),
            });
        } catch (err) {
            console.warn("Failed to remove bookmark on backend:", err);
        }
    };

    // Combine posts from bookmarksData (if target is populated) and local posts store
    const bookmarkedPosts = useMemo<PostData[]>(() => {
        const postMap = new Map<string, PostData>();

        posts.forEach((p) => {
            postMap.set(String(p.id), p);
        });

        if (bookmarksData && Array.isArray(bookmarksData)) {
            bookmarksData.forEach((b) => {
                if (b.target && typeof b.target === "object" && ("title" in b.target || "content" in b.target)) {
                    const mapped = mapPostDtoToPostData(b.target as PostDto);
                    postMap.set(String(mapped.id), mapped);
                }
            });
        }

        const activeIds = (bookmarksData && Array.isArray(bookmarksData))
            ? bookmarksData.map((b) => String(b.targetId))
            : bookmarkedIds.map((id) => String(id));

        return activeIds
            .map((id) => {
                const found = postMap.get(id);
                if (found) return found;
                return {
                    id,
                    title: "Bài viết đã lưu",
                    content: "Nội dung bài viết đang được đồng bộ...",
                    author: "Người dùng",
                    authorAvatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(id)}`,
                    likes: 0,
                    comments: 0,
                    timeAgo: "Đã lưu",
                    privacy: "public" as const,
                } as PostData;
            })
            .filter(Boolean);
    }, [bookmarksData, bookmarkedIds, posts]);

    const totalPages = Math.ceil(bookmarkedPosts.length / ITEMS_PER_PAGE);
    const paginatedPosts = bookmarkedPosts.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    if (!isLoggedIn) {
        return (
            <div className="w-full flex flex-col items-center justify-center gap-3 p-12 bg-surface/90 border border-border rounded-2xl text-center">
                <FontAwesomeIcon icon={faBookmark} className="text-3xl text-text-faint mb-1" />
                <p className="font-bold text-text text-base">{t("bookmark.emptyTitle")}</p>
                <p className="text-text-muted text-xs max-w-md">
                    Vui lòng đăng nhập để xem danh sách bài viết bạn đã đánh dấu và đồng bộ trên mọi thiết bị.
                </p>
                <button
                    onClick={() => navigate({ to: "/auth" })}
                    className="mt-2 px-5 py-2 rounded-xl bg-[#1688E8] hover:bg-[#1478D0] text-white font-bold text-xs transition-colors cursor-pointer"
                >
                    Đăng nhập ngay
                </button>
            </div>
        );
    }

    if (isBookmarksLoading) {
        return (
            <div className="w-full flex flex-col items-center justify-center gap-3 p-12 bg-surface/90 border border-border rounded-2xl text-center">
                <FontAwesomeIcon icon={faSpinner} className="animate-spin text-2xl text-[#1688E8]" />
                <p className="text-text-muted text-xs">Đang tải danh sách dấu trang...</p>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col gap-3">
            {showHeader && (
                <div className="bg-surface/90 border border-border rounded-2xl p-5 flex items-center justify-between shadow-xs">
                    <div>
                        <h1 className="text-lg font-bold text-text flex items-center gap-2">
                            <FontAwesomeIcon icon={faBookmarkSolid} className="text-[#1688E8]" />
                            {t("bookmark.title")}
                        </h1>
                        <p className="text-xs text-text-muted mt-1">{t("bookmark.subtitle")}</p>
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-surface-raised border border-border text-text-muted">
                        {bookmarkedPosts.length} đã lưu
                    </span>
                </div>
            )}

            {bookmarkedPosts.length > 0 ? (
                <>
                    {paginatedPosts.map((post) => (
                        <Post
                            key={post.id}
                            post={post}
                            isOwner={post.author === currentAuthor}
                            onDelete={(id) => {
                                deletePost(id);
                                handleRemoveBookmark(id);
                            }}
                            onEdit={handleEditPost}
                            onUnfollowAuthor={handleUnfollowAuthor}
                        />
                    ))}

                    {totalPages > 1 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            totalItems={bookmarkedPosts.length}
                            itemsPerPage={ITEMS_PER_PAGE}
                        />
                    )}
                </>
            ) : (
                <div className="
                    w-full flex flex-col items-center justify-center gap-2 p-10
                    bg-surface/90 backdrop-blur-md border border-border rounded-2xl
                    text-text-muted text-sm
                ">
                    <FontAwesomeIcon icon={faBookmark} className="text-2xl text-text-faint mb-1" />
                    <p className="font-semibold text-text">{t("bookmark.emptyTitle")}</p>
                    <p className="text-text-faint text-center">{t("bookmark.emptyDesc")}</p>
                </div>
            )}
        </div>
    );
};