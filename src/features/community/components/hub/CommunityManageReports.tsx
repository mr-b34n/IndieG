import { CommunityManageModeration } from "./CommunityManageModeration";

interface CommunityManageReportsProps {
    communityId?: string;
    communityName: string;
    isVi: boolean;
    onNavigateRules: () => void;
    userRole?: "owner" | "admin" | "moderator" | "member";
}

export const CommunityManageReports = ({
    communityId,
    communityName,
    isVi,
    onNavigateRules,
    userRole = "owner",
}: CommunityManageReportsProps) => {
    return (
        <CommunityManageModeration
            communityId={communityId}
            communityName={communityName}
            initialTab="reports"
            isVi={isVi}
            onNavigateRules={onNavigateRules}
            userRole={userRole}
        />
    );
};
