import { Project, SyntaxKind, ConditionalExpression, Node, StringLiteral, NoSubstitutionTemplateLiteral } from "ts-morph";
import * as fs from "fs";

const project = new Project();
project.addSourceFilesAtPaths("src/**/*.tsx");

interface TranslationEntry {
  file: string;
  key: string;
  vi: string;
  en: string;
  start: number;
  end: number;
  replacement: string;
}

const entries: TranslationEntry[] = [];
let counter = 1;

for (const sourceFile of project.getSourceFiles()) {
  const filePath = sourceFile.getFilePath();
  
  sourceFile.forEachDescendant(node => {
    if (Node.isConditionalExpression(node)) {
      const condition = node.getCondition();
      if (condition.getText() === "isVi" || condition.getText() === "lang === 'vi'") {
        const whenTrue = node.getWhenTrue();
        const whenFalse = node.getWhenFalse();
        
        let viText = "";
        let enText = "";
        
        if (Node.isStringLiteral(whenTrue) || Node.isNoSubstitutionTemplateLiteral(whenTrue)) {
          viText = whenTrue.getLiteralText();
        }
        if (Node.isStringLiteral(whenFalse) || Node.isNoSubstitutionTemplateLiteral(whenFalse)) {
          enText = whenFalse.getLiteralText();
        }
        
        if (viText && enText) {
          const baseName = sourceFile.getBaseNameWithoutExtension().replace(/[^a-zA-Z0-9]/g, '');
          const key = `hub.${baseName.toLowerCase()}_${counter++}`;
          
          entries.push({
            file: filePath,
            key: key,
            vi: viText,
            en: enText,
            start: node.getStart(),
            end: node.getEnd(),
            replacement: `t('${key}')`
          });
        }
      }
    }
  });
}

fs.writeFileSync("extracted_translations.json", JSON.stringify(entries, null, 2));
console.log(`Extracted ${entries.length} translations`);
