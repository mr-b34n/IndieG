export type BioFont = "inter" | "serif" | "mono" | "pixel" | "gothic" | "fantasy";
export type BioAlign = "left" | "center" | "right";
export type BioColor = "default" | "muted" | "accent" | "highlight";

export interface BioSpan {
    text: string;
    font?: BioFont;
    bold?: boolean;
    italic?: boolean;
    strikethrough?: boolean;
    color?: BioColor;
}

export interface BioBlock {
    type: "paragraph";
    align?: BioAlign;
    spans: BioSpan[];
}

export interface BioDocument {
    version: 1;
    blocks: BioBlock[];
}

export type BioPresetName = "Clean" | "Minimal" | "RPG" | "Terminal" | "Cyber" | "Gothic";

export interface BioPreset {
    id: string;
    name: BioPresetName;
    description: string;
    badge: string;
    document: BioDocument;
}
