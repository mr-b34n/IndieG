import { apiRequest } from "@/shared/api/client";
import type { 
  PostDto, 
  CreatePostDto, 
  UpdatePostDto,
  CommentEntity,
  ReplyCommentsResponse,
  CreateCommentDto,
  VoteDto
} from "@/shared/api/types";

export const postsApi = {
  getAll: (params?: { authorId?: string; communityId?: string; title?: string; content?: string; tags?: string; page?: number; limit?: number; view?: string }) => 
    apiRequest<{data: PostDto[], total: number}>("/posts", { method: "GET", params }),
  create: (data: CreatePostDto) => apiRequest<PostDto>("/posts", { method: "POST", body: data }),
  getById: (id: string) => apiRequest<PostDto>(`/posts/${id}`, { method: "GET" }),
  update: (id: string, data: UpdatePostDto) => apiRequest<PostDto>(`/posts/${id}`, { method: "PATCH", body: data }),
  delete: (id: string) => apiRequest<{message?: string}>(`/posts/${id}`, { method: "DELETE" }),
};

export const commentsApi = {
  getReplies: (params: { parentId: string; cursor?: string; limit?: number }) => 
    apiRequest<ReplyCommentsResponse>("/comments/replies", { method: "GET", params }),
  getRootByPostId: (postId: string, params?: { page?: number; limit?: number; view?: string }) => 
    apiRequest<{data: CommentEntity[], total: number}>(`/comments/post/${postId}/root`, { method: "GET", params }),
  getById: (id: string) => apiRequest<CommentEntity>(`/comments/${id}`, { method: "GET" }),
  update: (id: string, params: { content: string }) => apiRequest<CommentEntity>(`/comments/${id}`, { method: "PATCH", params }),
  delete: (id: string) => apiRequest<{message?: string}>(`/comments/${id}`, { method: "DELETE" }),
  create: (data: CreateCommentDto) => apiRequest<CommentEntity>("/comments", { method: "POST", body: data }),
};

export const votesApi = {
  getAll: () => apiRequest<VoteDto[]>("/votes", { method: "GET" }),
  getPostVotes: (postId: string) => apiRequest<{upvotes: number, downvotes: number}>(`/votes/post/${postId}`, { method: "GET" }),
  votePost: (postId: string) => apiRequest<{message?: string}>(`/votes/post/${postId}`, { method: "POST" }),
  getCommentVotes: (commentId: string) => apiRequest<{upvotes: number, downvotes: number}>(`/votes/comment/${commentId}`, { method: "GET" }),
  voteComment: (commentId: string) => apiRequest<{message?: string}>(`/votes/comment/${commentId}`, { method: "POST" }),
  removeCommentVote: (commentId: string) => apiRequest<{message?: string}>(`/votes/${commentId}/comment`, { method: "DELETE" }),
  removePostVote: (postId: string) => apiRequest<{message?: string}>(`/votes/${postId}/post`, { method: "DELETE" }),
};
