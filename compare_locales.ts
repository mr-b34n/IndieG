import { en } from './src/shared/locales/en.ts';
import { vi } from './src/shared/locales/vi.ts';

function getKeys(obj: any, prefix: string = ''): string[] {
  let keys: string[] = [];
  for (const k in obj) {
    const newPrefix = prefix ? prefix + '.' + k : k;
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
      keys = keys.concat(getKeys(obj[k], newPrefix));
    } else {
      keys.push(newPrefix);
    }
  }
  return keys;
}

const enKeys = getKeys(en);
const viKeys = getKeys(vi);

const missingInVi = enKeys.filter(k => !viKeys.includes(k));
const missingInEn = viKeys.filter(k => !enKeys.includes(k));

console.log("=== Missing in vi.ts ===");
missingInVi.forEach(k => console.log(k));

console.log("\n=== Missing in en.ts ===");
missingInEn.forEach(k => console.log(k));
