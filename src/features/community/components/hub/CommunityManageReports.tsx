import { CommunityManageModeration } from "./CommunityManageModeration";

interface CommunityManageReportsProps {
    communityName: string;
    isVi: boolean;
    onNavigateRules: () => void;
}

export const CommunityManageReports = ({
    communityName,
    isVi,
    onNavigateRules,
}: CommunityManageReportsProps) => {
    return (
        <CommunityManageModeration
            communityName={communityName}
            initialTab="reports"
            isVi={isVi}
            onNavigateRules={onNavigateRules}
        />
    );
};
