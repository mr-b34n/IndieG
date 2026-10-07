import * as fs from 'fs';
import * as path from 'path';

function getFiles(dir: string): string[] {
  const files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getFiles(fullPath));
    } else if (entry.isFile() && fullPath.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }
  return files;
}

const files = getFiles('src');
const regex = /t\(\s*['"]([^'"]+)['"]\s*,\s*\{\s*defaultValue:\s*['"]([^'"]+)['"]\s*\}\s*\)/g;
const missing: Record<string, string> = {};

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = regex.exec(content)) !== null) {
    missing[match[1]] = match[2];
  }
}

console.log(JSON.stringify(missing, null, 2));
