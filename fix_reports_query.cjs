const fs = require('fs');
let code = fs.readFileSync('src/features/community/components/hub/CommunityManageReports.tsx', 'utf8');

code = code.replace(
    /useReportsQuery\(\s*communityId \|\| "",\s*\{\s*enabled: !!communityId && \(userRole === "owner" \|\| userRole === "admin" \|\| userRole === "moderator"\)\s*\}\s*\)/g,
    'useReportsQuery()'
);
code = code.replace(/useReportsQuery\(\);\/\//g, 'useReportsQuery'); // fix previous sed if applied
fs.writeFileSync('src/features/community/components/hub/CommunityManageReports.tsx', code, 'utf8');
