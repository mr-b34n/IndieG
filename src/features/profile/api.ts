import { profilesApi as sharedProfilesApi, extractUserProfile, extractProfileList } from "@/shared/api";
import { apiRequest } from "@/shared/api/client";
import type { UserProfileDto, UpdateProfileDto } from "@/shared/api/types";

export const profilesApi = {
  ...sharedProfilesApi,
  updateArchived: () => apiRequest<{ message?: string }>("/profiles/archived", { method: "PATCH" }),
  deleteProfile: (id: string) => apiRequest<{ message?: string }>(`/profiles/${encodeURIComponent(id)}`, { method: "DELETE" }),
};

export { extractUserProfile, extractProfileList };
export type { UserProfileDto, UpdateProfileDto };
