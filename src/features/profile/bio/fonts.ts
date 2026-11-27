import type { BioDocument, BioFont } from "./types";

const loadedFonts = new Set<string>();

/**
 * Dynamically loads only the latin + vietnamese subsets for a specialty bio font.
 * Prevents loading ~1.1 MB of unused fonts (Cyrillic/Greek/unreferenced families) upfront.
 */
export function loadBioFont(font?: BioFont | string): void {
    if (!font || font === "inter" || loadedFonts.has(font)) return;
    loadedFonts.add(font);

    switch (font) {
        case "fantasy":
            void Promise.all([
                import("@fontsource/cinzel/latin-500.css"),
                import("@fontsource/cinzel/latin-700.css"),
                import("@fontsource/cinzel/latin-900.css"),
            ]);
            break;
        case "mono":
            void Promise.all([
                import("@fontsource/jetbrains-mono/latin-400.css"),
                import("@fontsource/jetbrains-mono/latin-600.css"),
                import("@fontsource/jetbrains-mono/latin-700.css"),
                import("@fontsource/jetbrains-mono/vietnamese-400.css"),
            ]);
            break;
        case "serif":
            void Promise.all([
                import("@fontsource/merriweather/latin-400.css"),
                import("@fontsource/merriweather/latin-700.css"),
                import("@fontsource/merriweather/vietnamese-400.css"),
                import("@fontsource/merriweather/vietnamese-700.css"),
            ]);
            break;
        case "pixel":
            void import("@fontsource/press-start-2p/latin-400.css");
            break;
        case "gothic":
            void import("@fontsource/unifrakturmaguntia/latin-400.css");
            break;
    }
}

export function loadBioFontsForDocument(doc: BioDocument): void {
    for (const block of doc.blocks) {
        for (const span of block.spans) {
            if (span.font && span.font !== "inter") {
                loadBioFont(span.font);
            }
        }
    }
}

export function loadAllBioFonts(): void {
    loadBioFont("fantasy");
    loadBioFont("mono");
    loadBioFont("serif");
    loadBioFont("pixel");
    loadBioFont("gothic");
}
