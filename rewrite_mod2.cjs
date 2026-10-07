const fs = require('fs');

let code = fs.readFileSync('src/features/community/components/hub/CommunityManageModeration.tsx', 'utf8');

// Replace "requests" | "reports" | "moderators" | "history" in props/state
code = code.replace(
    /initialTab\?: "requests" \| "reports" \| "moderators" \| "history";/,
    'initialTab?: "queue" | "requests" | "moderators" | "history";'
);
code = code.replace(
    /useState<"requests" \| "reports" \| "moderators" \| "history" \| null>/,
    'useState<"queue" | "requests" | "moderators" | "history" | null>'
);
code = code.replace(/setSubTab\(/g, 'setSubTabOverride(');

const tabStart = code.indexOf('<div className="flex items-center gap-1 border-b border-divider-primary/40 pb-2 overflow-x-auto">');
const tabEnd = code.indexOf('            {/* TAB CONTENT 1: JOIN REQUESTS */}');

const newTabs = `<div className="flex items-center gap-4 text-xs font-bold border-b border-divider-primary/40 pb-2">
                <button
                    type="button"
                    onClick={() => setSubTabOverride("queue")}
                    className={\`flex items-center gap-2 pb-2 -mb-2 border-b-2 transition-colors cursor-pointer \${
                        subTab === "queue"
                            ? "border-primary text-text"
                            : "border-transparent text-text-muted hover:text-text"
                    }\`}
                >
                    <span className="uppercase tracking-wider">Queue</span>
                    {(pendingCount > 0 || (reports && reports.filter(r => r.status === 'pending').length > 0)) && (
                        <span className={\`px-1.5 py-0.5 rounded text-[10px] \${subTab === "queue" ? "bg-primary/20 text-primary" : "bg-rose-500/10 text-rose-500"}\`}>
                            {pendingCount + (reports ? reports.filter(r => r.status === 'pending').length : 0)}
                        </span>
                    )}
                </button>

                <button
                    type="button"
                    onClick={() => setSubTabOverride("requests")}
                    className={\`flex items-center gap-2 pb-2 -mb-2 border-b-2 transition-colors cursor-pointer \${
                        subTab === "requests"
                            ? "border-primary text-text"
                            : "border-transparent text-text-muted hover:text-text"
                    }\`}
                >
                    <span className="uppercase tracking-wider">Join Requests</span>
                    {pendingCount > 0 && (
                        <span className={\`px-1.5 py-0.5 rounded text-[10px] \${subTab === "requests" ? "bg-primary/20 text-primary" : "bg-surface-inner text-text-faint"}\`}>
                            {pendingCount}
                        </span>
                    )}
                </button>

                <button
                    type="button"
                    onClick={() => setSubTabOverride("moderators")}
                    className={\`flex items-center gap-2 pb-2 -mb-2 border-b-2 transition-colors cursor-pointer \${
                        subTab === "moderators"
                            ? "border-primary text-text"
                            : "border-transparent text-text-muted hover:text-text"
                    }\`}
                >
                    <span className="uppercase tracking-wider">Moderator Team</span>
                </button>

                <button
                    type="button"
                    onClick={() => setSubTabOverride("history")}
                    className={\`flex items-center gap-2 pb-2 -mb-2 border-b-2 transition-colors cursor-pointer \${
                        subTab === "history"
                            ? "border-primary text-text"
                            : "border-transparent text-text-muted hover:text-text"
                    }\`}
                >
                    <span className="uppercase tracking-wider">Audit Log</span>
                </button>
            </div>

            {/* TAB CONTENT 0: QUEUE */}
            {subTab === "queue" && (
                <div className="flex flex-col gap-6 animate-fade-in">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-sm font-bold text-text uppercase tracking-wider">Moderation Queue</h2>
                        <p className="text-xs text-text-muted">
                            {pendingCount + (reports ? reports.filter(r => r.status === 'pending').length : 0)} items need attention
                        </p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <h3 className="text-xs font-bold text-text-faint uppercase tracking-wider mb-1">Pending Reports</h3>
                        {reports && reports.filter(r => r.status === 'pending').length > 0 ? (
                            reports.filter(r => r.status === 'pending').slice(0, 3).map((report) => (
                                <div key={report.id} className="p-3 bg-surface border border-divider-primary/30 rounded-lg flex flex-col gap-2">
                                    <div className="flex justify-between items-center text-[10px] font-mono text-text-faint">
                                        <span className="uppercase text-amber-500 font-bold">{report.targetType} reported</span>
                                        <span>{report.createdAt}</span>
                                    </div>
                                    <p className="text-xs text-text line-clamp-2">"{report.targetExcerpt}"</p>
                                    <button onClick={() => setSubTabOverride("reports")} className="text-xs font-bold text-primary self-start hover:underline mt-1">Review Report →</button>
                                </div>
                            ))
                        ) : (
                            <p className="text-xs text-text-muted">No pending reports.</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-3 mt-2">
                        <h3 className="text-xs font-bold text-text-faint uppercase tracking-wider mb-1">Join Requests</h3>
                        {pendingCount > 0 ? (
                            <p className="text-xs text-text-muted">
                                There are {pendingCount} users waiting to join. <button onClick={() => setSubTabOverride("requests")} className="text-primary font-bold hover:underline">Review Requests →</button>
                            </p>
                        ) : (
                            <p className="text-xs text-text-muted">No pending join requests.</p>
                        )}
                    </div>
                </div>
            )}

`;

code = code.substring(0, tabStart) + newTabs + code.substring(tabEnd);

const repStart = code.indexOf('            {/* TAB CONTENT 2: COMMUNITY REPORTS */}');
const repEnd = code.indexOf('            {/* TAB CONTENT 3: MODERATORS TEAM */}');

if (repStart !== -1 && repEnd !== -1) {
    code = code.substring(0, repStart) + code.substring(repEnd);
}

// Also remove fake 0 actions metric from moderators list
code = code.replace(/· \${mod\.actionsCount} (hành động|actions)/g, '');
code = code.replace(/· \${mod\.actionsCount}/g, '');

fs.writeFileSync('src/features/community/components/hub/CommunityManageModeration.tsx', code, 'utf8');
