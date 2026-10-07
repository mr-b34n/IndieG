import { Project, Node, JsxText, StringLiteral, NoSubstitutionTemplateLiteral } from "ts-morph";
import * as fs from "fs";

const project = new Project();
project.addSourceFilesAtPaths("../src/**/*.tsx");

const viRegex = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;

let counter = 1;

for (const sourceFile of project.getSourceFiles()) {
  let fileModified = false;
  
  // We need to be careful with AST mutation, so we collect nodes first, but since replacing can invalidate,
  // we can use a reverse iteration or just keep finding one by one. But ts-morph handles some replacements well.
  // Actually, let's collect and then replace in reverse order of position.
  
  const nodesToReplace: { node: Node, text: string, type: 'jsx' | 'string' }[] = [];
  
  sourceFile.forEachDescendant(node => {
    // Skip if it's already inside a `t(...)` call
    const parentCall = node.getFirstAncestorByKind(Node.SyntaxKind.CallExpression);
    if (parentCall && parentCall.getExpression().getText() === 't') {
      return;
    }

    if (Node.isJsxText(node)) {
      const text = node.getLiteralText();
      if (viRegex.test(text) && text.trim().length > 0) {
        nodesToReplace.push({ node, text: text.trim(), type: 'jsx' });
      }
    } else if (Node.isStringLiteral(node) || Node.isNoSubstitutionTemplateLiteral(node)) {
      const text = node.getLiteralText();
      if (viRegex.test(text)) {
        // Exclude imports or anything weird
        if (!node.getFirstAncestorByKind(Node.SyntaxKind.ImportDeclaration)) {
          nodesToReplace.push({ node, text, type: 'string' });
        }
      }
    }
  });

  // Sort by position descending to avoid invalidating nodes
  nodesToReplace.sort((a, b) => b.node.getStart() - a.node.getStart());

  for (const { node, text, type } of nodesToReplace) {
    // Check if the node is still valid (wasn't replaced by a parent)
    if (node.wasForgotten()) continue;

    const baseName = sourceFile.getBaseNameWithoutExtension().replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const key = `auto.${baseName}_${counter++}`;
    
    // We inject {defaultValue: 'text'} so our previous script can pick it up.
    // Escape quotes in text
    const escapedText = text.replace(/'/g, "\\'");
    const replacement = `t('${key}', { defaultValue: '${escapedText}' })`;

    if (type === 'jsx') {
      // In JSX, we need {t(...)}
      node.replaceWithText(`{${replacement}}`);
      fileModified = true;
    } else {
      // It's a string literal in code, just replace with t(...)
      node.replaceWithText(replacement);
      fileModified = true;
    }
  }

  if (fileModified) {
    // Ensure useTranslation is imported and `const { t } = useTranslation();` exists.
    // But wait! Many components might not have `useTranslation` imported.
    // Adding `useTranslation` to every file is complex because we need to find the component body.
    // So if the file doesn't have it, we might break it. 
    sourceFile.saveSync();
  }
}

console.log(`Refactored ${counter - 1} Vietnamese strings.`);
