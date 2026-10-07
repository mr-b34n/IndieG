import { en } from './src/shared/locales/en.ts';
import { vi } from './src/shared/locales/vi.ts';
import * as fs from 'fs';

function hasKey(obj: any, keyPath: string): boolean {
  const parts = keyPath.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === undefined || current === null || typeof current !== 'object') {
      return false;
    }
    if (!(part in current)) {
      return false;
    }
    current = current[part];
  }
  return true;
}

const usedKeys = fs.readFileSync('used_keys.txt', 'utf8').split('\n').filter(Boolean);

const missingEn: string[] = [];
const missingVi: string[] = [];

for (const key of usedKeys) {
  if (!hasKey(en, key)) {
    missingEn.push(key);
  }
  if (!hasKey(vi, key)) {
    missingVi.push(key);
  }
}

console.log('Missing in en:');
missingEn.forEach(k => console.log(k));

console.log('\nMissing in vi:');
missingVi.forEach(k => console.log(k));
