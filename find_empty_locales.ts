import { en } from './src/shared/locales/en.ts';
import { vi } from './src/shared/locales/vi.ts';

function findEmpty(obj: any, prefix: string = ''): string[] {
  let empty: string[] = [];
  for (const k in obj) {
    const newPrefix = prefix ? prefix + '.' + k : k;
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
      empty = empty.concat(findEmpty(obj[k], newPrefix));
    } else if (obj[k] === "" || obj[k] === null || obj[k] === undefined) {
      empty.push(newPrefix);
    }
  }
  return empty;
}

const emptyInEn = findEmpty(en);
const emptyInVi = findEmpty(vi);

console.log("=== Empty in en.ts ===");
emptyInEn.forEach(k => console.log(k));

console.log("\n=== Empty in vi.ts ===");
emptyInVi.forEach(k => console.log(k));
