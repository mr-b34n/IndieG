import { apiRequest } from "@/shared/api/client";
import type { BookmarkDto, CreateBookmarkDto } from "@/shared/api/types";

export const bookmarksApi = {
  create: (data: CreateBookmarkDto) => apiRequest<BookmarkDto>("/bookmarks", { method: "POST", body: data }),
  getAll: (params?: { targetType?: string; page?: number; limit?: number }) => 
    apiRequest<{data: BookmarkDto[], total: number}>("/bookmarks", { method: "GET", params }),
  check: (params: { targetType: string; targetId: string }) => 
    apiRequest<{isBookmarked: boolean}>("/bookmarks/check", { method: "GET", params }),
  toggle: () => apiRequest<{message?: string}>("/bookmarks/toggle", { method: "POST" }),
  delete: (targetType: string, targetId: string) => 
    apiRequest<{message?: string}>(`/bookmarks/${targetType}/${targetId}`, { method: "DELETE" }),
};
