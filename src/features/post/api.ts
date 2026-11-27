import { postsApi, commentsApi, votesApi } from "@/shared/api";

export { postsApi, commentsApi, votesApi };
export type {
  PostDto,
  CreatePostDto,
  UpdatePostDto,
  CommentEntity,
  ReplyCommentsResponse,
  CreateCommentDto,
  VoteDto,
} from "@/shared/api/types";
