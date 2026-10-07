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

// We need to rewrite the Tab buttons block.
// Currently it's around line 351: <div className="flex items-center gap-1.5 p-1 bg-surface-inner/60 border border-divider-primary/40 rounded-[6px] overflow-x-auto scrollbar-none select-none">
const tabStart = code.indexOf('<div className="flex items-center gap-1.5 p-1 bg-surface-inner/60 border border-divider-primary/40 rounded-[6px] overflow-x-auto scrollbar-none select-none">');
const tabEnd = code.indexOf('            {/* TAB CONTENT 1: JOIN REQUESTS */}');
if (tabStart === -1 || tabEnd === -1) {
    console.log("Could not find tab block");
    process.exit(1);
}

const newTabs = `<div className="flex items-center gap-1.5 p-1 bg-surface-inner/60 border border-divider-primary/40 rounded-[6px] overflow-x-auto scrollbar-none select-none">
                <button
                    type="button"
                    onClick={() => setSubTabOverride("queue")}
                    className={\`px-3 py-1.5 rounded-[4px] text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors \${
                        subTab === "queue"
                            ? "bg-surface text-text font-bold"
                            : "text-text-muted hover:text-text hover:bg-surface-hover/50"
                    }\`}
                >
                    <FontAwesomeIcon icon={faGavel} className={\`text-xs \${subTab === "queue" ? "text-primary" : ""}\`} />
                    <span>Queue</span>
                    {(pendingCount > 0 || (reports && reports.filter(r => r.status === 'pending').length > 0)) && (
                        <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-mono">
                            {pendingCount + (reports ? reports.filter(r => r.status === 'pending').length : 0)}
                        </span>
                    )}
                </button>

                <button
                    type="button"
                    onClick={() => setSubTabOverride("requests")}
                    className={\`px-3 py-1.5 rounded-[4px] text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors \${
                        subTab === "requests"
                            ? "bg-surface text-text font-bold"
                            : "text-text-muted hover:text-text hover:bg-surface-hover/50"
                    }\`}
                >
                    <FontAwesomeIcon icon={faUsers} className={\`text-xs \${subTab === "requests" ? "text-primary" : ""}\`} />
                    <span>Join Requests</span>
                    {pendingCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-surface-inner text-text-faint text-[10px] font-mono">
                            {pendingCount}
                        </span>
                    )}
                </button>

                <button
                    type="button"
                    onClick={() => setSubTabOverride("moderators")}
                    className={\`px-3 py-1.5 rounded-[4px] text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors \${
                        subTab === "moderators"
                            ? "bg-surface text-text font-bold"
                            : "text-text-muted hover:text-text hover:bg-surface-hover/50"
                    }\`}
                >
                    <FontAwesomeIcon icon={faShieldHalved} className={\`text-xs \${subTab === "moderators" ? "text-primary" : ""}\`} />
                    <span>Moderator Team</span>
                </button>

                <button
                    type="button"
                    onClick={() => setSubTabOverride("history")}
                    className={\`px-3 py-1.5 rounded-[4px] text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors \${
                        subTab === "history"
                            ? "bg-surface text-text font-bold"
                            : "text-text-muted hover:text-text hover:bg-surface-hover/50"
                    }\`}
                >
                    <FontAwesomeIcon icon={faClockRotateLeft} className={\`text-xs \${subTab === "history" ? "text-primary" : ""}\`} />
                    <span>Audit Log</span>
                </button>
            </div>

`;

code = code.substring(0, tabStart) + newTabs + code.substring(tabEnd);

fs.writeFileSync('src/features/community/components/hub/CommunityManageModeration.tsx', code, 'utf8');
