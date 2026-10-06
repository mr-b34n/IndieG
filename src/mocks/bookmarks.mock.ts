import type { BookmarkDto } from "@/shared/api/types";
import { MOCK_POST_DTOS } from "./posts.mock";

/**
 * =========================================================================
 * MOCK BOOKMARKS DATA
 * =========================================================================
 * Danh sách dấu trang (Bookmarks) mẫu đã lưu.
 */

export const MOCK_BOOKMARKS: BookmarkDto[] = [
    {
        id: "bm-1",
        userId: "user-me",
        targetType: "post",
        targetId: "post-1",
        target: MOCK_POST_DTOS[0],
        createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    },
    {
        id: "bm-2",
        userId: "user-me",
        targetType: "post",
        targetId: "post-2",
        target: MOCK_POST_DTOS[1],
        createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    },
    {
        id: "bm-3",
        userId: "user-me",
        targetType: "post",
        targetId: "post-6",
        target: MOCK_POST_DTOS[5] || MOCK_POST_DTOS[0],
        createdAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    },
    {
        id: "bm-4",
        userId: "user-me",
        targetType: "post",
        targetId: "post-8",
        target: MOCK_POST_DTOS[7] || MOCK_POST_DTOS[1],
        createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    },
    {
        id: "bm-5",
        userId: "user-me",
        targetType: "post",
        targetId: "post-11",
        target: MOCK_POST_DTOS[10] || MOCK_POST_DTOS[0],
        createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    },
];
