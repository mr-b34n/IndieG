import { type Report, type AdminUser } from "../types";

export interface CreateReportPayload {
    reporterId?: string;
    targetType: "post" | "comment" | "user";
    targetId: string;
    reason: string;
    description?: string;
    targetTitle?: string;
    targetAuthor?: string;
}

export const adminApi = {
    // 1. Reports Management
    async createReport(payload: CreateReportPayload): Promise<{ success: boolean; data?: Report; error?: string }> {
        try {
            const res = await fetch("/api/reports", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            return await res.json();
        } catch {
            return { success: false, error: "Network error creating report" };
        }
    },

    async listReports(adminRole: string = "admin"): Promise<{ success: boolean; data?: Report[]; error?: string }> {
        try {
            const res = await fetch("/api/admin/reports", {
                headers: {
                    "Content-Type": "application/json",
                    "x-user-role": adminRole,
                },
            });
            return await res.json();
        } catch {
            return { success: false, error: "Network error listing reports" };
        }
    },

    async resolveReport(reportId: string, resolvedBy: string = "admin-1", adminRole: string = "admin"): Promise<{ success: boolean; data?: Report; error?: string }> {
        try {
            const res = await fetch(`/api/admin/reports/${encodeURIComponent(reportId)}/resolve`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "x-user-role": adminRole,
                },
                body: JSON.stringify({ resolvedBy }),
            });
            return await res.json();
        } catch {
            return { success: false, error: "Network error resolving report" };
        }
    },

    async rejectReport(reportId: string, resolvedBy: string = "admin-1", adminRole: string = "admin"): Promise<{ success: boolean; data?: Report; error?: string }> {
        try {
            const res = await fetch(`/api/admin/reports/${encodeURIComponent(reportId)}/reject`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "x-user-role": adminRole,
                },
                body: JSON.stringify({ resolvedBy }),
            });
            return await res.json();
        } catch {
            return { success: false, error: "Network error rejecting report" };
        }
    },

    async deletePost(postId: string, adminRole: string = "admin"): Promise<{ success: boolean; message?: string; error?: string }> {
        try {
            const res = await fetch(`/api/admin/posts/${encodeURIComponent(postId)}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "x-user-role": adminRole,
                },
            });
            return await res.json();
        } catch {
            return { success: false, error: "Network error deleting post" };
        }
    },

    async deleteComment(commentId: string, adminRole: string = "admin"): Promise<{ success: boolean; message?: string; error?: string }> {
        try {
            const res = await fetch(`/api/admin/comments/${encodeURIComponent(commentId)}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "x-user-role": adminRole,
                },
            });
            return await res.json();
        } catch {
            return { success: false, error: "Network error deleting comment" };
        }
    },

    // 2. User Management
    async listUsers(query: string = "", adminRole: string = "admin"): Promise<{ success: boolean; data?: AdminUser[]; error?: string }> {
        try {
            const res = await fetch(`/api/admin/users?q=${encodeURIComponent(query)}`, {
                headers: {
                    "Content-Type": "application/json",
                    "x-user-role": adminRole,
                },
            });
            return await res.json();
        } catch {
            return { success: false, error: "Network error listing users" };
        }
    },

    async banUser(userId: string, adminRole: string = "admin"): Promise<{ success: boolean; data?: AdminUser; error?: string }> {
        try {
            const res = await fetch(`/api/admin/users/${encodeURIComponent(userId)}/ban`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "x-user-role": adminRole,
                },
            });
            return await res.json();
        } catch {
            return { success: false, error: "Network error banning user" };
        }
    },

    async unbanUser(userId: string, adminRole: string = "admin"): Promise<{ success: boolean; data?: AdminUser; error?: string }> {
        try {
            const res = await fetch(`/api/admin/users/${encodeURIComponent(userId)}/unban`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "x-user-role": adminRole,
                },
            });
            return await res.json();
        } catch {
            return { success: false, error: "Network error unbanning user" };
        }
    },
};
