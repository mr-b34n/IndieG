import { createLazyFileRoute, useNavigate, useRouter, Link } from '@tanstack/react-router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { useKeyboardShortcut } from '@/shared/hooks/useKeyboardShortcut.ts';
import { CommentSection, getCurrentAuthor, Post, usePostsStore, useFeedNavigationStore, type PostData } from '@/features/post';
import { usePostDetailQuery, useUpdatePostMutation, useDeletePostMutation } from '@/shared/api/useQueries';
import { mapPostDtoToPostData } from '@/shared/api';
import { useEffect, useMemo } from 'react';
import { useRegisterOverlay } from '@/shared/utils/overlayManager';
import { useTranslation } from '@/shared/hooks/useTranslate';


export const Route = createLazyFileRoute('/_layout/post/$postId')({
    component: PostDetail,
});

function PostDetail() {
    const { t } = useTranslation();

    const { postId } = Route.useParams();
    const navigate = useNavigate();
    const router = useRouter();

    // TanStack Query for Post Detail
    const { data: postDto, isLoading: isQueryLoading } = usePostDetailQuery(postId);
    const updatePostMutation = useUpdatePostMutation();
    const deletePostMutation = useDeletePostMutation();

    const localPost = usePostsStore((state) => state.getPostById(postId));
    const updatePost = usePostsStore((state) => state.updatePost);
    const deletePost = usePostsStore((state) => state.deletePost);
    const addPost = usePostsStore((state) => state.addPost);
    const currentAuthor = getCurrentAuthor();

    useEffect(() => {
        if (postDto && !localPost) {
            const mapped = mapPostDtoToPostData(postDto);
            addPost(mapped);
        } else if (postDto && localPost && localPost.currentUserVoteType === undefined && typeof postDto.currentUserVoteType === "number") {
            updatePost(postId, {
                currentUserVoteType: postDto.currentUserVoteType,
                upvotes: postDto.upvotes ?? postDto.likes,
                downvotes: postDto.downvotes,
                likes: postDto.upvotes ?? postDto.likes,
            });
        }
    }, [postDto, localPost, addPost, updatePost, postId]);

    const post = useMemo(() => {
        if (localPost) return localPost;
        if (postDto) return mapPostDtoToPostData(postDto);
        return null;
    }, [localPost, postDto]);

    const postPageTitle = useMemo(() => {
        if (!post) return null;
        if (post.title && post.title.trim()) return post.title.trim();
        if (post.content && post.content.trim()) {
            const clean = post.content.trim().replace(/\s+/g, ' ');
            return clean.length > 50 ? `${clean.slice(0, 50)}...` : clean;
        }
        if (post.author) return `${t('post.postBy', { defaultValue: 'Bài viết của' })} ${post.author}`;
        return t('post.post', { defaultValue: 'Bài viết' });
    }, [post, t]);

    useDocumentTitle(postPageTitle);

    const handleGoBack = () => {
        if (postId) {
            sessionStorage.setItem('returning_from_post_id', String(postId));
        }
        if (window.history.length > 1) {
            router.history.back();
        } else {
            navigate({ to: '/' });
        }
    };

    useEffect(() => {
        useFeedNavigationStore.getState().setFocusedPostId(postId);
        return () => {
            const current = useFeedNavigationStore.getState().focusedPostId;
            if (String(current) === String(postId)) {
                useFeedNavigationStore.getState().setFocusedPostId(null);
            }
        };
    }, [postId]);

    useRegisterOverlay({
        id: `post-detail-${postId}`,
        isOpen: true,
        onClose: handleGoBack,
        priority: 5,
    });

    const handleEditPost = async (id: string | number, data: Partial<PostData>) => {
        updatePost(id, {
            ...data,
            ...(data.title !== undefined
                ? { title: data.title || (data.content ? data.content.slice(0, 80) + (data.content.length > 80 ? "..." : "") : "") }
                : {}),
        });

        // Trigger mutation if string ID
        if (typeof id === "string") {
            try {
                await updatePostMutation.mutateAsync({
                    id,
                    data: {
                        title: data.title,
                        content: data.content,
                        images: data.images,
                        tags: data.tags,
                        gameTag: data.gameTag,
                        pinned: data.pinned,
                        allowComments: data.allowComments,
                        locked: data.allowComments === false,
                    },
                });
            } catch {
                // Local state is already updated
            }
        }
    };

    const handleDeletePost = async (id: string | number) => {
        deletePost(id);
        if (typeof id === "string") {
            try {
                await deletePostMutation.mutateAsync(id);
            } catch {
                // Local deletion completed
            }
        }
        navigate({ to: '/' });
    };

    if (isQueryLoading && !post) {
        return (
            <div className="flex flex-col items-center justify-center w-full min-h-[60vh] text-text">
                <FontAwesomeIcon icon={faSpinner} spin className="text-3xl text-primary mb-3" />
                <p className="text-text-muted text-sm">{t('post.loading', { defaultValue: 'Đang tải bài viết...' })}</p>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="flex flex-col items-center justify-center w-full min-h-[60vh] bg-bg text-text">
                <p className="text-lg font-semibold mb-2">{t('post.notFound', { defaultValue: 'Không tìm thấy bài viết' })}</p>
                <Link to="/" className="text-primary hover:underline text-sm font-medium">
                    {t('common.home', { defaultValue: 'Trang chủ' })}
                </Link>
            </div>
        );
    }

    return (
        <main className="flex-1 min-w-0">
            <div className="w-full max-w-4xl mx-auto flex flex-col gap-4 pb-12 animate-fade-in">

                <div className="w-full flex items-center gap-3 mb-1 px-1">
                    <button
                        type="button"
                        onClick={handleGoBack}
                        className="
                            w-9 h-9 flex items-center justify-center rounded-lg
                            bg-surface hover:bg-surface-hover text-text-muted hover:text-text
                            border border-border/60 transition-colors cursor-pointer shadow-xs
                        "
                        title={t('common.back', { defaultValue: 'Quay lại' })}
                        aria-label={t('common.back', { defaultValue: 'Quay lại' })}
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="text-sm" />
                    </button>
                    <span className="text-sm font-bold text-text-muted tracking-wide uppercase">
                        {t('post.post', { defaultValue: 'Bài viết' })}
                    </span>
                </div>

                <div className="w-full">
                    <Post
                        post={post}
                        isOwner={post.author === currentAuthor}
                        isDetailView
                        onEdit={handleEditPost}
                        onDelete={handleDeletePost}
                    />
                </div>

                <CommentSection postId={postId} />
            </div>
        </main>
    )
}

