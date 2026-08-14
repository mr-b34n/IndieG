export type ReportTargetType = "post" | "comment" | "user";
export type ReportStatus = "pending" | "resolved" | "rejected";

export interface Report {
    id: string;
    reporterId: string;
    targetType: ReportTargetType;
    targetId: string;
    reason: string;
    description?: string;
    status: ReportStatus;
    resolvedBy?: string;
    createdAt: string;
    resolvedAt?: string;
    targetTitle?: string;
    targetAuthor?: string;
}

export interface AdminUser {
    id: string;
    name: string;
    username: string;
    email: string;
    avatar: string;
    isBanned: boolean;
    role: "admin" | "moderator" | "user";
    createdAt?: string;
}

export interface ReportModalProps {
    postId: string | number;
    author: string;
    onClose: () => void;
}

