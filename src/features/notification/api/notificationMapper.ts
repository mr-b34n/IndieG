import { type NotificationItem, type NotificationType } from '../types';

export interface BackendNotificationDto {
  id: string;
  type: string;
  entityType: string;
  entityId?: string | null;
  groupKey?: string | null;
  title?: string | null;
  content?: string | null;
  data?: Record<string, any>;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
  actor?: {
    id: string;
    username: string;
    name: string;
    avatarUrl?: string | null;
  } | null;
}

export function mapBackendNotificationToItem(
  dto: BackendNotificationDto,
  currentUserId?: string,
): NotificationItem {
  const actorName = dto.actor?.name || dto.actor?.username || 'Ai đó';
  const data = dto.data || {};
  let title = dto.title || undefined;
  let message = dto.content || '';
  let link = '/';
  let type: NotificationType = 'system';

  switch (dto.type) {
    case 'POST_COMMENT':
      type = 'comment';
      title = title || 'Bình luận mới';
      message =
        message ||
        `${actorName} đã bình luận bài viết của bạn: "${data.snippet || ''}"`;
      link = data.postId ? `/post/${data.postId}` : '/';
      break;
    case 'COMMENT_REPLY':
      type = 'reply';
      title = title || 'Phản hồi mới';
      message =
        message ||
        `${actorName} đã trả lời bình luận của bạn: "${data.snippet || ''}"`;
      link = data.postId ? `/post/${data.postId}` : '/';
      break;
    case 'USER_MENTION': {
      type = 'mention';
      const isPostMention = dto.entityType === 'POST' || data.source === 'post';
      title = title || 'Nhắc đến bạn';
      const snippetSuffix = data.snippet ? `: "${data.snippet}"` : '';
      message =
        message ||
        (isPostMention
          ? `${actorName} đã nhắc đến bạn trong một bài viết${snippetSuffix}`
          : `${actorName} đã nhắc đến bạn trong một bình luận${snippetSuffix}`);
      link = data.postId ? `/post/${data.postId}` : '/';
      break;
    }
    case 'FRIEND_REQUEST':
      type = 'community';
      title = title || 'Lời mời kết bạn';
      message = message || `${actorName} đã gửi lời mời kết bạn`;
      link = dto.actor?.username ? `/profile/${dto.actor.username}` : '/';
      break;
    case 'FRIEND_ACCEPT':
      type = 'community';
      title = title || 'Chấp nhận kết bạn';
      message = message || `${actorName} đã đồng ý lời mời kết bạn`;
      link = dto.actor?.username ? `/profile/${dto.actor.username}` : '/';
      break;
    case 'GUESTBOOK_NEW':
      type = 'community';
      title = title || 'Lưu bút mới';
      message =
        message || `${actorName} đã ký lưu bút: "${data.snippet || ''}"`;
      link = dto.actor?.username
        ? `/profile/${dto.actor.username}?tab=guestbook`
        : '/';
      break;
    case 'COMMUNITY_JOIN_REQUEST':
      type = 'community';
      title = title || 'Yêu cầu tham gia cộng đồng';
      message =
        message ||
        `${actorName} muốn tham gia ${data.communityName || 'cộng đồng của bạn'}`;
      link = data.communityId
        ? `/community/${data.communityId}/manage`
        : '/community';
      break;
    case 'COMMUNITY_ROLE_CHANGED':
      type = 'community';
      title = title || 'Cập nhật vai trò';
      message =
        message ||
        `Vai trò trong ${data.communityName || 'cộng đồng'} đổi thành ${data.newRole}`;
      link = data.communityId
        ? `/community/${data.communityId}`
        : '/community';
      break;
    case 'POST_LIKE':
    case 'POST_VOTE_MILESTONE':
      type = 'like';
      title = title || 'Lượt thích mới';
      message =
        message || `${actorName} đã thích bài viết của bạn`;
      link = dto.entityId || data.postId
        ? `/post/${dto.entityId || data.postId}`
        : '/';
      break;
    case 'SYSTEM_ANNOUNCEMENT':
    default:
      type = 'system';
      title = title || 'Thông báo hệ thống';
      message =
        message || dto.content || 'Bạn có thông báo mới từ hệ thống Ludon';
      link = data.link || '/';
      break;
  }

  return {
    id: dto.id,
    userId: currentUserId || 'user-current',
    type,
    referenceId: dto.entityId || dto.id,
    title,
    message,
    isRead: dto.isRead,
    createdAt: dto.createdAt,
    avatarUrl: dto.actor?.avatarUrl || undefined,
    link,
  };
}
