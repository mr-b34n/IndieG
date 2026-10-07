const fs = require('fs');
let code = fs.readFileSync('src/features/community/components/hub/CommunityHubRightRail.tsx', 'utf8');

code = code.replace(
    /isVi: boolean;/,
    'isVi: boolean;\n    isManageView?: boolean;'
);

code = code.replace(
    /    isVi,/,
    '    isVi,\n    isManageView,'
);

code = code.replace(
    /}: CommunityHubRightRailProps\) => \{/,
    '    userRole,\n    pendingCount,\n    reportsCount,\n    modsCount\n}: CommunityHubRightRailProps) => {'
);

const renderLogic = `
    const isAdminOrMod = userRole === "owner" || userRole === "admin" || userRole === "moderator";

    if (isManageView && isAdminOrMod) {
        return (
            <div className="flex flex-col gap-5 text-text animate-fade-in font-sans">
                {/* 1. COMMUNITY STATUS */}
                <div className="flex flex-col gap-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-text">
                        {isVi ? "Trạng thái cộng đồng" : "Community Status"}
                    </h3>
                    <div className="bg-surface-inner/40 rounded-[6px] border border-divider-primary/40 p-3 flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-text-muted">{isVi ? "Thành viên" : "Members"}</span>
                            <span className="text-sm font-bold text-text">{formatCompactNumber(membersCount)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-text-muted">{isVi ? "Đang online" : "Online now"}</span>
                            <span className="text-sm font-bold text-green-500">{formatCompactNumber(onlineCount)}</span>
                        </div>
                    </div>
                </div>

                {/* 2. MODERATION SUMMARY */}
                <div className="flex flex-col gap-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-text">
                        {isVi ? "Tình trạng kiểm duyệt" : "Moderation"}
                    </h3>
                    <div className="bg-surface-inner/40 rounded-[6px] border border-divider-primary/40 p-3 flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-text-muted">{isVi ? "Báo cáo chờ" : "Pending reports"}</span>
                            <span className={\`text-sm font-bold \${(reportsCount || 0) > 0 ? "text-rose-500" : "text-text"}\`}>{reportsCount || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-text-muted">{isVi ? "Yêu cầu tham gia" : "Pending requests"}</span>
                            <span className={\`text-sm font-bold \${(pendingCount || 0) > 0 ? "text-amber-500" : "text-text"}\`}>{pendingCount || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-text-muted">{isVi ? "Điều hành viên" : "Moderators"}</span>
                            <span className="text-sm font-bold text-text">{modsCount || 0}</span>
                        </div>
                    </div>
                </div>

                {/* 3. QUICK LINKS */}
                <div className="flex flex-col gap-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-text">
                        {isVi ? "Liên kết nhanh" : "Quick Links"}
                    </h3>
                    <div className="flex flex-col gap-1">
                        <button
                            type="button"
                            onClick={() => onNavigateNav("manage-rules")}
                            className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-text-muted hover:text-text hover:bg-surface-hover/60 rounded-[4px] transition-colors cursor-pointer"
                        >
                            <span>{isVi ? "Quy tắc cộng đồng" : "Community Rules"}</span>
                            <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
                        </button>
                        {(userRole === "owner" || userRole === "admin") && (
                            <button
                                type="button"
                                onClick={() => onNavigateNav("manage-settings")}
                                className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-text-muted hover:text-text hover:bg-surface-hover/60 rounded-[4px] transition-colors cursor-pointer"
                            >
                                <span>{isVi ? "Cài đặt cộng đồng" : "Community Settings"}</span>
                                <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => onNavigateNav("manage-moderation")}
                            className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-text-muted hover:text-text hover:bg-surface-hover/60 rounded-[4px] transition-colors cursor-pointer"
                        >
                            <span>{isVi ? "Lịch sử kiểm duyệt" : "Audit Log"}</span>
                            <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }
`;

code = code.replace(
    /    const \{ t \} = useTranslation\(\);/,
    '    const { t } = useTranslation();\n' + renderLogic
);
fs.writeFileSync('src/features/community/components/hub/CommunityHubRightRail.tsx', code, 'utf8');
