import { useMutation, useQueryClient } from '@tanstack/react-query';
import { votesApi } from '@/shared/api';

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
      // Mock API call
      console.log(`Post ${postId} bookmarked: ${bookmarked}`);
      return bookmarked;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });
};
