import { describe, expect, it } from "vitest";
import {
  mapBackendNotificationToItem,
  type BackendNotificationDto,
} from "./notificationMapper";

describe("notificationMapper", () => {
  it("maps POST_COMMENT notification correctly", () => {
    const dto: BackendNotificationDto = {
      id: "notif-comment-1",
      type: "POST_COMMENT",
      entityType: "post",
      entityId: "post-123",
      isRead: false,
      createdAt: "2026-11-07T12:00:00Z",
      actor: {
        id: "actor-1",
        username: "pixelmaster",
        name: "Pixel Master",
        avatarUrl: "https://example.com/avatar.png",
      },
      data: {
        postId: "post-123",
        snippet: "Great game design!",
      },
    };

    const item = mapBackendNotificationToItem(dto, "user-current");

    expect(item.id).toBe("notif-comment-1");
    expect(item.userId).toBe("user-current");
    expect(item.type).toBe("comment");
    expect(item.title).toBe("Bình luận mới");
    expect(item.message).toBe('Pixel Master đã bình luận bài viết của bạn: "Great game design!"');
    expect(item.link).toBe("/post/post-123");
    expect(item.avatarUrl).toBe("https://example.com/avatar.png");
    expect(item.isRead).toBe(false);
  });

  it("maps COMMENT_REPLY notification correctly", () => {
    const dto: BackendNotificationDto = {
      id: "notif-reply-1",
      type: "COMMENT_REPLY",
      entityType: "comment",
      entityId: "comment-456",
      isRead: true,
      createdAt: "2026-11-07T12:00:00Z",
      actor: {
        id: "actor-2",
        username: "gamer99",
        name: "Gamer Ninety Nine",
      },
      data: {
        postId: "post-999",
        snippet: "I agree with you",
      },
    };

    const item = mapBackendNotificationToItem(dto, "user-42");

    expect(item.id).toBe("notif-reply-1");
    expect(item.type).toBe("reply");
    expect(item.title).toBe("Phản hồi mới");
    expect(item.message).toBe('Gamer Ninety Nine đã trả lời bình luận của bạn: "I agree with you"');
    expect(item.link).toBe("/post/post-999");
    expect(item.isRead).toBe(true);
  });

  it("maps USER_MENTION notification correctly", () => {
    const dto: BackendNotificationDto = {
      id: "notif-mention-1",
      type: "USER_MENTION",
      entityType: "post",
      entityId: "post-555",
      isRead: false,
      createdAt: "2026-11-07T12:00:00Z",
      actor: {
        id: "actor-3",
        username: "reviewer_pro",
        name: "Reviewer Pro",
      },
      data: {
        postId: "post-555",
      },
    };

    const item = mapBackendNotificationToItem(dto);

    expect(item.type).toBe("mention");
    expect(item.title).toBe("Nhắc đến bạn");
    expect(item.message).toBe("Reviewer Pro đã nhắc đến bạn trong một bình luận");
    expect(item.link).toBe("/post/post-555");
  });

  it("maps FRIEND_REQUEST and FRIEND_ACCEPT notifications correctly", () => {
    const dtoReq: BackendNotificationDto = {
      id: "notif-friend-req",
      type: "FRIEND_REQUEST",
      entityType: "user",
      entityId: "user-friend",
      isRead: false,
      createdAt: "2026-11-07T12:00:00Z",
      actor: {
        id: "user-friend",
        username: "chummer",
        name: "Good Chum",
      },
    };

    const itemReq = mapBackendNotificationToItem(dtoReq);
    expect(itemReq.type).toBe("community");
    expect(itemReq.title).toBe("Lời mời kết bạn");
    expect(itemReq.message).toBe("Good Chum đã gửi lời mời kết bạn");
    expect(itemReq.link).toBe("/profile/chummer");

    const dtoAccept: BackendNotificationDto = {
      id: "notif-friend-accept",
      type: "FRIEND_ACCEPT",
      entityType: "user",
      isRead: true,
      createdAt: "2026-11-07T12:00:00Z",
      actor: {
        id: "user-friend",
        username: "chummer",
        name: "Good Chum",
      },
    };

    const itemAccept = mapBackendNotificationToItem(dtoAccept);
    expect(itemAccept.title).toBe("Chấp nhận kết bạn");
    expect(itemAccept.message).toBe("Good Chum đã đồng ý lời mời kết bạn");
  });

  it("maps COMMUNITY_JOIN_REQUEST and COMMUNITY_ROLE_CHANGED correctly", () => {
    const dtoJoin: BackendNotificationDto = {
      id: "notif-comm-join",
      type: "COMMUNITY_JOIN_REQUEST",
      entityType: "community",
      isRead: false,
      createdAt: "2026-11-07T12:00:00Z",
      actor: { id: "a1", username: "newbie", name: "Newbie" },
      data: { communityId: "comm-1", communityName: "Indie Devs" },
    };

    const itemJoin = mapBackendNotificationToItem(dtoJoin);
    expect(itemJoin.title).toBe("Yêu cầu tham gia cộng đồng");
    expect(itemJoin.message).toBe("Newbie muốn tham gia Indie Devs");
    expect(itemJoin.link).toBe("/community/comm-1/manage");

    const dtoRole: BackendNotificationDto = {
      id: "notif-comm-role",
      type: "COMMUNITY_ROLE_CHANGED",
      entityType: "community",
      isRead: false,
      createdAt: "2026-11-07T12:00:00Z",
      data: { communityId: "comm-1", communityName: "Indie Devs", newRole: "Moderator" },
    };

    const itemRole = mapBackendNotificationToItem(dtoRole);
    expect(itemRole.title).toBe("Cập nhật vai trò");
    expect(itemRole.message).toBe("Vai trò trong Indie Devs đổi thành Moderator");
    expect(itemRole.link).toBe("/community/comm-1");
  });

  it("maps POST_LIKE and POST_VOTE_MILESTONE notifications correctly", () => {
    const dtoLike: BackendNotificationDto = {
      id: "notif-like-1",
      type: "POST_LIKE",
      entityType: "POST",
      entityId: "post-789",
      isRead: false,
      createdAt: "2026-11-07T12:00:00Z",
      actor: {
        id: "actor-like",
        username: "liker_fan",
        name: "Liker Fan",
      },
      data: {
        postId: "post-789",
      },
    };

    const itemLike = mapBackendNotificationToItem(dtoLike, "user-author");
    expect(itemLike.id).toBe("notif-like-1");
    expect(itemLike.userId).toBe("user-author");
    expect(itemLike.type).toBe("like");
    expect(itemLike.title).toBe("Lượt thích mới");
    expect(itemLike.message).toBe("Liker Fan đã thích bài viết của bạn");
    expect(itemLike.link).toBe("/post/post-789");
    expect(itemLike.referenceId).toBe("post-789");
    expect(itemLike.isRead).toBe(false);

    const dtoMilestone: BackendNotificationDto = {
      id: "notif-milestone-1",
      type: "POST_VOTE_MILESTONE",
      entityType: "POST",
      entityId: "post-456",
      isRead: true,
      createdAt: "2026-11-07T12:00:00Z",
      data: {
        postId: "post-456",
      },
    };

    const itemMilestone = mapBackendNotificationToItem(dtoMilestone);
    expect(itemMilestone.type).toBe("like");
    expect(itemMilestone.title).toBe("Lượt thích mới");
    expect(itemMilestone.link).toBe("/post/post-456");
  });

  it("maps SYSTEM_ANNOUNCEMENT and fallback types correctly", () => {
    const dtoSys: BackendNotificationDto = {
      id: "notif-sys",
      type: "SYSTEM_ANNOUNCEMENT",
      entityType: "system",
      content: "Maintenance scheduled at midnight",
      isRead: false,
      createdAt: "2026-11-07T12:00:00Z",
      data: { link: "/status" },
    };

    const itemSys = mapBackendNotificationToItem(dtoSys);
    expect(itemSys.type).toBe("system");
    expect(itemSys.title).toBe("Thông báo hệ thống");
    expect(itemSys.message).toBe("Maintenance scheduled at midnight");
    expect(itemSys.link).toBe("/status");

    // Fallback when actor and content are missing
    const dtoUnknown: BackendNotificationDto = {
      id: "notif-unk",
      type: "UNKNOWN_FUTURE_TYPE",
      entityType: "unknown",
      isRead: false,
      createdAt: "2026-11-07T12:00:00Z",
    };

    const itemUnknown = mapBackendNotificationToItem(dtoUnknown);
    expect(itemUnknown.type).toBe("system");
    expect(itemUnknown.message).toBe("Bạn có thông báo mới từ hệ thống Ludon");
    expect(itemUnknown.link).toBe("/");
  });
});
