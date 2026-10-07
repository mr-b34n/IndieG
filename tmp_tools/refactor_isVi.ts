import { Project, SyntaxKind, Node, StringLiteral, NoSubstitutionTemplateLiteral, TemplateExpression } from "ts-morph";
import * as fs from "fs";

const project = new Project();
project.addSourceFilesAtPaths("../src/features/**/*.tsx");

interface TranslationEntry {
  key: string;
  vi: string;
  en: string;
}

const entries: TranslationEntry[] = [];
let counter = 1;

for (const sourceFile of project.getSourceFiles()) {
  let fileModified = false;
  
  sourceFile.forEachDescendant(node => {
    if (Node.isConditionalExpression(node)) {
      const condition = node.getCondition();
      if (condition.getText() === "isVi" || condition.getText() === "lang === 'vi'") {
        const whenTrue = node.getWhenTrue();
        const whenFalse = node.getWhenFalse();
        
        let viText = null;
        let enText = null;
        let isSimple = false;
        
        if ((Node.isStringLiteral(whenTrue) || Node.isNoSubstitutionTemplateLiteral(whenTrue)) && 
            (Node.isStringLiteral(whenFalse) || Node.isNoSubstitutionTemplateLiteral(whenFalse))) {
          viText = whenTrue.getLiteralText();
          enText = whenFalse.getLiteralText();
          isSimple = true;
        }

        if (isSimple && viText !== null && enText !== null) {
          const baseName = sourceFile.getBaseNameWithoutExtension().replace(/[^a-zA-Z0-9]/g, '');
          const key = `hub.${baseName.toLowerCase()}_${counter++}`;
          
          entries.push({ key, vi: viText, en: enText });
          
          // Replace with t('key')
          node.replaceWithText(`t('${key}')`);
          fileModified = true;
        }
      }
    }
  });

  if (fileModified) {
    sourceFile.saveSync();
  }
}

fs.writeFileSync("extracted_isVi.json", JSON.stringify(entries, null, 2));
console.log(`Refactored simple strings. Extracted ${entries.length} translations`);
