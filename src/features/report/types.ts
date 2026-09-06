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
    assignedTo?: string;
    resolvedBy?: string;
    createdAt: string;
    resolvedAt?: string;
    targetTitle?: string;
    targetAuthor?: string;
}

export interface ReportModalProps {
    postId: string | number;
    author: string;
    onClose: () => void;
}
