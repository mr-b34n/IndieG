import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '@/shared/hooks/useTheme';
import { CommentSection, getCurrentAuthor, Post, usePostsStore } from '@/features/post';

export const Route = createFileRoute('/_layout/post/$postId')({
    component: PostDetail,
})

function PostDetail() {
    useTheme("Home");

    const { postId } = Route.useParams();
    const navigate = useNavigate();

    const post = usePostsStore((state) => state.getPostById(postId));
    const updatePost = usePostsStore((state) => state.updatePost);
    const deletePost = usePostsStore((state) => state.deletePost);
    const currentAuthor = getCurrentAuthor();

    const handleEditPost = (id: string | number, data: { title: string; content: string }) => {
        updatePost(id, {
            title: data.title || data.content.slice(0, 80) + (data.content.length > 80 ? "..." : ""),
            content: data.content,
        });
    };

    const handleDeletePost = (id: string | number) => {
        deletePost(id);
        navigate({ to: '/' });
    };

    if (!post) {
        return (
            <div className="flex flex-col items-center justify-center w-full h-screen bg-bg text-text">
                <p>Post not found</p>
                <button onClick={() => navigate({ to: '/' })} className="mt-4 text-primary underline">Go back</button>
            </div>
        );
    }

    return (
        <main className="flex-1 min-w-0">
            <div className="w-full max-w-2xl mx-auto flex flex-col gap-4 pb-12 animate-fade-in">

                <div className="w-full flex flex-row items-center gap-3 mb-2 px-1">
                    <button
                        onClick={() => navigate({ to: '/' })}
                        className="
                                    w-10 h-10 flex items-center justify-center rounded-full
                                    bg-surface/50 backdrop-blur-sm border border-border/50
                                    text-text-muted hover:bg-surface hover:text-text hover:border-border
                                    shadow-sm
                                    transition-all duration-200
                                ">
                        <FontAwesomeIcon icon={faArrowLeft} />
                    </button>
                    <span className="text-sm font-bold text-text-muted tracking-wide uppercase">Post</span>
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
