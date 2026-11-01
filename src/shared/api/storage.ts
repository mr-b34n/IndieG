import { apiRequest } from "@/shared/api/client";

export const storageApi = {
  getAvatarPresignedUrl: () => apiRequest("/storage/presigned-url/avatar", { method: "POST" }),
  getCoverPresignedUrl: () => apiRequest("/storage/presigned-url/cover", { method: "POST" }),
  getPostPresignedUrl: () => apiRequest("/storage/presigned-url/post", { method: "POST" }),
};
