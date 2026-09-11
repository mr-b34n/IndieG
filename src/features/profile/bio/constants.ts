import type { BioFont, BioColor, BioAlign, BioPreset } from "./types";
import {
    faAlignLeft,
    faAlignCenter,
    faAlignRight,
} from "@fortawesome/free-solid-svg-icons";

export const MAX_BIO_CHAR_LIMIT = 300;

export const BIO_FONTS: { value: BioFont; label: string; preview: string; className: string }[] = [
    { value: "inter", label: "Inter", preview: "Aa Clean", className: "font-bio-inter" },
    { value: "serif", label: "Serif", preview: "Aa Story", className: "font-bio-serif" },
    { value: "mono", label: "Mono", preview: "Aa Terminal", className: "font-bio-mono" },
    { value: "pixel", label: "Pixel", preview: "Aa Retro", className: "font-bio-pixel" },
    { value: "gothic", label: "Gothic", preview: "Aa Souls", className: "font-bio-gothic" },
    { value: "fantasy", label: "Fantasy", preview: "Aa RPG", className: "font-bio-fantasy" },
];

export const BIO_COLORS: { value: BioColor; label: string; textClass: string; bgClass: string; borderClass: string }[] = [
    { value: "default", label: "Default", textClass: "text-[#F0F1F2]", bgClass: "bg-[#F0F1F2]", borderClass: "border-[#F0F1F2]" },
    { value: "muted", label: "Muted", textClass: "text-[#8A8F98]", bgClass: "bg-[#8A8F98]", borderClass: "border-[#8A8F98]" },
    { value: "accent", label: "Accent", textClass: "text-[#1688E8]", bgClass: "bg-[#1688E8]", borderClass: "border-[#1688E8]" },
    { value: "highlight", label: "Highlight", textClass: "text-[#E5A93D]", bgClass: "bg-[#E5A93D]", borderClass: "border-[#E5A93D]" },
];

export const BIO_ALIGNMENTS: { value: BioAlign; label: string; icon: typeof faAlignLeft; alignClass: string }[] = [
    { value: "left", label: "Trái", icon: faAlignLeft, alignClass: "text-left" },
    { value: "center", label: "Giữa", icon: faAlignCenter, alignClass: "text-center" },
    { value: "right", label: "Phải", icon: faAlignRight, alignClass: "text-right" },
];

export const BIO_PRESETS: BioPreset[] = [
    {
        id: "clean",
        name: "Clean",
        description: "Phong cách chuẩn mực, hiện đại và tinh tế",
        badge: "Clean",
        document: {
            version: 1,
            blocks: [
                {
                    type: "paragraph",
                    align: "left",
                    spans: [
                        {
                            text: "Passionate gamer & indie games explorer.",
                            font: "inter",
                            bold: true,
                            italic: false,
                            strikethrough: false,
                            color: "default",
                        },
                    ],
                },
                {
                    type: "paragraph",
                    align: "left",
                    spans: [
                        {
                            text: "Building interactive worlds & exploring virtual realms.",
                            font: "inter",
                            bold: false,
                            italic: false,
                            strikethrough: false,
                            color: "muted",
                        },
                    ],
                },
                {
                    type: "paragraph",
                    align: "left",
                    spans: [
                        {
                            text: "Always up for good co-op squads!",
                            font: "inter",
                            bold: false,
                            italic: false,
                            strikethrough: false,
                            color: "accent",
                        },
                    ],
                },
            ],
        },
    },
    {
        id: "minimal",
        name: "Minimal",
        description: "Tối giản, nhẹ nhàng và ngắn gọn",
        badge: "Minimal",
        document: {
            version: 1,
            blocks: [
                {
                    type: "paragraph",
                    align: "center",
                    spans: [
                        {
                            text: "playing games & writing code.",
                            font: "inter",
                            bold: false,
                            italic: true,
                            strikethrough: false,
                            color: "muted",
                        },
                    ],
                },
                {
                    type: "paragraph",
                    align: "center",
                    spans: [
                        {
                            text: "coffee, chill vibes & roguelikes.",
                            font: "inter",
                            bold: false,
                            italic: false,
                            strikethrough: false,
                            color: "default",
                        },
                    ],
                },
            ],
        },
    },
    {
        id: "rpg",
        name: "RPG",
        description: "Hồ sơ nhân vật phiêu lưu giả tưởng",
        badge: "RPG",
        document: {
            version: 1,
            blocks: [
                {
                    type: "paragraph",
                    align: "left",
                    spans: [
                        { text: "> Class: ", font: "fantasy", bold: true, color: "accent" },
                        { text: "Nightfall Hunter", font: "fantasy", bold: true, color: "default" },
                    ],
                },
                {
                    type: "paragraph",
                    align: "left",
                    spans: [
                        { text: "> Guild: ", font: "fantasy", bold: true, color: "accent" },
                        { text: "Order of the Silver Moon", font: "fantasy", color: "default" },
                    ],
                },
                {
                    type: "paragraph",
                    align: "left",
                    spans: [
                        { text: "> Realm: ", font: "fantasy", bold: true, color: "highlight" },
                        { text: "Elden Ring & Dark Souls", font: "fantasy", color: "default" },
                    ],
                },
                {
                    type: "paragraph",
                    align: "left",
                    spans: [
                        { text: "> Status: ", font: "fantasy", bold: true, color: "muted" },
                        { text: "Wandering the Lands Between", font: "fantasy", italic: true, color: "muted" },
                    ],
                },
            ],
        },
    },
    {
        id: "terminal",
        name: "Terminal",
        description: "Giao diện dòng lệnh hacker chuyên nghiệp",
        badge: "CLI",
        document: {
            version: 1,
            blocks: [
                {
                    type: "paragraph",
                    align: "left",
                    spans: [
                        { text: "$ whoami", font: "mono", bold: true, color: "accent" },
                    ],
                },
                {
                    type: "paragraph",
                    align: "left",
                    spans: [
                        { text: "user: ", font: "mono", color: "muted" },
                        { text: "root@indieg-core", font: "mono", bold: true, color: "highlight" },
                    ],
                },
                {
                    type: "paragraph",
                    align: "left",
                    spans: [
                        { text: "status: ", font: "mono", color: "muted" },
                        { text: "compiling kernel & grinding ranks", font: "mono", color: "default" },
                    ],
                },
                {
                    type: "paragraph",
                    align: "left",
                    spans: [
                        { text: "uptime: ", font: "mono", color: "muted" },
                        { text: "9999h online", font: "mono", color: "accent" },
                    ],
                },
            ],
        },
    },
    {
        id: "cyber",
        name: "Cyber",
        description: "Phong cách Cyberpunk neon tương lai",
        badge: "2077",
        document: {
            version: 1,
            blocks: [
                {
                    type: "paragraph",
                    align: "center",
                    spans: [
                        { text: "[NET_RUNNER // LVL 99]", font: "pixel", bold: true, color: "highlight" },
                    ],
                },
                {
                    type: "paragraph",
                    align: "center",
                    spans: [
                        { text: "⚡ Neural Link: ", font: "mono", bold: true, color: "accent" },
                        { text: "Connected", font: "mono", bold: true, color: "default" },
                    ],
                },
                {
                    type: "paragraph",
                    align: "center",
                    spans: [
                        { text: "🎮 Mainframe: ", font: "mono", color: "muted" },
                        { text: "Night City District", font: "mono", color: "default" },
                    ],
                },
                {
                    type: "paragraph",
                    align: "center",
                    spans: [
                        { text: "\"Wake up, samurai. We have games to play.\"", font: "mono", italic: true, color: "accent" },
                    ],
                },
            ],
        },
    },
    {
        id: "gothic",
        name: "Gothic",
        description: "Không khí u tối, bi tráng của Dark Fantasy",
        badge: "Souls",
        document: {
            version: 1,
            blocks: [
                {
                    type: "paragraph",
                    align: "center",
                    spans: [
                        { text: "† Beneath the Ash †", font: "gothic", bold: true, color: "highlight" },
                    ],
                },
                {
                    type: "paragraph",
                    align: "center",
                    spans: [
                        { text: "Soul Level: 125 | Hunter of the Dream", font: "serif", italic: true, color: "muted" },
                    ],
                },
                {
                    type: "paragraph",
                    align: "center",
                    spans: [
                        { text: "Seeking the paleblood sky...", font: "serif", color: "default" },
                    ],
                },
                {
                    type: "paragraph",
                    align: "center",
                    spans: [
                        { text: "Even in a nightmare, never surrender.", font: "serif", italic: true, color: "accent" },
                    ],
                },
            ],
        },
    },
];
