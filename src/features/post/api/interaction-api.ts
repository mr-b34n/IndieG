import { useMutation, useQueryClient } from '@tanstack/react-query';
import { votesApi, bookmarksApi, type VoteType } from '@/shared/api';

export const usePostVoteInteraction = (postId: string | number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (voteType: VoteType | null | boolean) => {
      try {
        if (voteType === 1 || voteType === true) {
          await votesApi.votePost(postId, 1);
        } else if (voteType === -1) {
          await votesApi.votePost(postId, -1);
        } else {
          // voteType === null | false -> delete / unvote
          await votesApi.deleteVotePost(postId);
        }
      } catch (err) {
        // Log error while maintaining graceful local state responsiveness
        console.warn(`Vote API call failed for post ${postId}`, err);
      }
      return voteType;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['votes', 'post', String(postId)] });
    },
  });
};

/** @deprecated Use usePostVoteInteraction for upvote (1), downvote (-1), or unvote (null) */
export const useLikeInteraction = usePostVoteInteraction;

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
