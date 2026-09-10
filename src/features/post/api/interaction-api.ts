import { useMutation, useQueryClient } from '@tanstack/react-query';
import { votesApi, bookmarksApi } from '@/shared/api';

export const useLikeInteraction = (postId: string | number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (liked: boolean) => {
      try {
        if (liked) {
          await votesApi.upVotePost(postId);
        } else {
          await votesApi.deleteVotePost(postId);
        }
      } catch (err) {
        // Log error while maintaining graceful local state responsiveness
        console.warn(`Vote API call failed for post ${postId}`, err);
      }
      return liked;
    },
    onMutate: async (liked) => {
      return { liked };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['votes', 'post', String(postId)] });
    },
  });
};

export const useBookmarkInteraction = (postId: string | number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bookmarked: boolean) => {
      const targetId = String(postId);
      try {
        if (bookmarked) {
          await bookmarksApi.create({ targetType: 'post', targetId });
        } else {
          await bookmarksApi.delete('post', targetId);
        }
      } catch (err) {
        console.warn(`Bookmark API call failed for post ${postId}`, err);
        throw err;
      }
      return bookmarked;
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      void queryClient.invalidateQueries({ queryKey: ['bookmarks', 'check', 'post', String(postId)] });
    },
  });
};
