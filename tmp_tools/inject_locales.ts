import { en } from '../src/shared/locales/en.ts';
import { vi } from '../src/shared/locales/vi.ts';
import * as fs from 'fs';

const extracted = JSON.parse(fs.readFileSync('extracted_isVi.json', 'utf8'));

function setNestedKey(obj: any, keyPath: string, value: string) {
  const parts = keyPath.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]]) {
      current[parts[i]] = {};
    }
    current = current[parts[i]];
  }
  current[parts[parts.length - 1]] = value;
}

for (const entry of extracted) {
  setNestedKey(vi, entry.key, entry.vi);
  setNestedKey(en, entry.key, entry.en);
}

const formatObj = (obj: any) => JSON.stringify(obj, null, 4).replace(/"([^"]+)":/g, '$1:');

fs.writeFileSync('../src/shared/locales/vi.ts', `export const vi = ${formatObj(vi)};\n`);
fs.writeFileSync('../src/shared/locales/en.ts', `export const en = ${formatObj(en)};\n`);

console.log("Injected locales!");
