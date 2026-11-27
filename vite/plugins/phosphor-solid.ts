import type { Plugin } from "vite";

/**
 * Stroke-only UI icons whose Phosphor `fill` variant wraps the glyph in a solid
 * square/circle badge. Using their `bold` variant keeps them crisp and consistent
 * with FontAwesome Solid style (e.g. X, Plus, Check, Spinner, Ellipsis, Formatting).
 */
const BOLD_PREFERRED_ICONS = new Set([
    "At",
    "Check",
    "Checks",
    "CircleNotch",
    "Code",
    "Crop",
    "DotsThree",
    "DotsThreeVertical",
    "Link",
    "List",
    "ListBullets",
    "ListNumbers",
    "Paperclip",
    "Plus",
    "TextAlignCenter",
    "TextAlignLeft",
    "TextAlignRight",
    "TextB",
    "TextItalic",
    "TextStrikethrough",
    "TextT",
    "X",
]);

/**
 * Extracts `[weight, expr]` entries from a Phosphor `dist/defs/<Icon>.es.js` file
 * using bracket-balanced scanning and keeps only the single active weight (`fill`
 * or `bold`), eliminating ~83% of unused SVG path data from the bundle.
 */
function prunePhosphorDefModule(code: string, iconName: string): string | null {
    const mapStart = code.indexOf("new Map([");
    if (mapStart === -1) return null;

    const arrayStart = code.indexOf("[", mapStart);
    if (arrayStart === -1) return null;

    // Locate matching closing `]` of the outer Map entries array
    let depth = 0;
    let inStr: string | null = null;
    let escaped = false;
    let arrayEnd = -1;
    const entries: Array<{ weight: string; valueExpr: string }> = [];

    let entryStart = -1;
    for (let i = arrayStart; i < code.length; i++) {
        const ch = code[i];
        if (inStr) {
            if (escaped) {
                escaped = false;
            } else if (ch === "\\") {
                escaped = true;
            } else if (ch === inStr) {
                inStr = null;
            }
            continue;
        }
        if (ch === '"' || ch === "'" || ch === "`") {
            inStr = ch;
            continue;
        }
        if (ch === "[") {
            depth++;
            if (depth === 2) entryStart = i;
        } else if (ch === "]") {
            if (depth === 2 && entryStart !== -1) {
                const slice = code.slice(entryStart + 1, i).trim();
                const m = slice.match(/^["'](\w+)["']\s*,\s*([\s\S]+)$/);
                if (m) {
                    entries.push({ weight: m[1], valueExpr: m[2].trim() });
                }
                entryStart = -1;
            }
            depth--;
            if (depth === 0) {
                arrayEnd = i;
                break;
            }
        }
    }

    if (arrayEnd === -1 || entries.length === 0) return null;

    const preferredWeight = BOLD_PREFERRED_ICONS.has(iconName) ? "bold" : "fill";
    const chosen =
        entries.find((e) => e.weight === preferredWeight) ??
        entries.find((e) => e.weight === "fill") ??
        entries[0];

    // Map both "fill" and "bold" (or requested preferred) to the same chosen element
    // without duplicating the SVG element expression in the bundle.
    const prefix = code.slice(0, mapStart);
    const suffix = code.slice(arrayEnd + 2); // skip `])`
    return (
        `${prefix}(() => {\n` +
        `  const _el = ${chosen.valueExpr};\n` +
        `  return /* @__PURE__ */ new Map([["fill", _el], ["bold", _el], ["regular", _el]]);\n` +
        `})()${suffix}`
    );
}

/**
 * Vite / Rolldown plugin that strips unused Phosphor icon weights at compile time,
 * reducing `@phosphor-icons/react` bundle size by ~80% while ensuring stroke-only
 * icons render crisply without boxed backgrounds.
 */
export function phosphorSolidPlugin(): Plugin {
    return {
        name: "ludon-phosphor-solid-pruner",
        enforce: "pre",
        transform(code, id) {
            const normalized = id.replace(/\\/g, "/");
            const match = normalized.match(
                /@phosphor-icons\/react\/dist\/defs\/([A-Za-z0-9]+)\.es\.js$/
            );
            if (!match) return null;
            const pruned = prunePhosphorDefModule(code, match[1]);
            if (!pruned) return null;
            return { code: pruned, map: null };
        },
    };
}
