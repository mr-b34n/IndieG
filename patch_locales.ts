import { en } from './src/shared/locales/en.ts';
import { vi } from './src/shared/locales/vi.ts';
import * as fs from 'fs';

const extracted = JSON.parse(fs.readFileSync('extracted_defaults.json', 'utf8'));

function setNestedKey(obj: any, keyPath: string, value: string) {
  const parts = keyPath.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]]) {
      current[parts[i]] = {};
    }
    current = current[parts[i]];
  }
  if (!current[parts[parts.length - 1]]) {
    current[parts[parts.length - 1]] = value;
  }
}

let addedVi = 0;
let addedEn = 0;

for (const [key, val] of Object.entries(extracted)) {
  const strVal = val as string;
  setNestedKey(vi, key, strVal);
  // for EN we might just use the same or a placeholder for now, 
  // but if the dev needs it translated, we will just use the string.
  setNestedKey(en, key, strVal + " (EN)"); 
}

const formatObj = (obj: any) => JSON.stringify(obj, null, 4).replace(/"([^"]+)":/g, '$1:');

fs.writeFileSync('src/shared/locales/vi.ts', `export const vi = ${formatObj(vi)};\n`);
fs.writeFileSync('src/shared/locales/en.ts', `export const en = ${formatObj(en)};\n`);

console.log("Locales patched successfully!");
