import type React from 'react';
import type { LucideIcon } from 'lucide-react';

export type SettingsTab =
    | "general"
    | "quickAccess"
    | "account"
    | "privacy"
    | "notifications"
    | "feedback";

export const VALID_SETTINGS_TABS: readonly SettingsTab[] = [
    "general",
    "quickAccess",
    "account",
    "privacy",
    "notifications",
    "feedback",
] as const;

export interface NavTabItem {
    id: SettingsTab;
    label: string;
    icon: LucideIcon | React.ComponentType<{ className?: string }>;
    desc: string;
    badge?: string | number;
    isDanger?: boolean;
}

export interface BlockedUser {
    id: string;
    name: string;
    username: string;
    avatar: string;
    blockedAt: string;
    reason: string;
}

export interface ToggleSwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    ariaLabel?: string;
}

export interface ParsedSessionInfo {
    name: string;
    browser: string;
    os: string;
    device?: string;
    isMobile: boolean;
    deviceType: "desktop" | "mobile" | "tablet" | "browser";
}
