import { useEffect, useRef } from "react";
import { useShortcutsStore } from "../store/useShortcutsStore";

export type KeyCombo = string[];

export interface HotkeyOptions {
    preventDefault?: boolean;
    stopPropagation?: boolean;
    ignoreInput?: boolean;
    enabled?: boolean;
}

export const isMacSystem = (): boolean => {
    if (typeof window === "undefined") return false;
    const nav = window.navigator as { userAgentData?: { platform?: string }; platform?: string; userAgent: string };
    const platform = nav.userAgentData?.platform || nav.platform || nav.userAgent || "";
    return /mac|iphone|ipad|ipod/i.test(platform);
};

export const isInputElement = (target: EventTarget | null): boolean => {
    if (!target || !(target instanceof HTMLElement)) return false;
    if (target instanceof HTMLInputElement) {
        // Range and checkbox/radio might not strictly be typing inputs, but standard is to ignore
        return true;
    }
    if (target instanceof HTMLTextAreaElement) return true;
    if (target.isContentEditable) return true;
    if (target.closest("[contenteditable='true']")) return true;
    return false;
};

export const formatKeyCap = (key: string, isMac = isMacSystem()): string => {
    switch (key.toLowerCase()) {
        case "mod":
            return isMac ? "⌘" : "Ctrl";
        case "ctrl":
        case "control":
            return isMac ? "⌃" : "Ctrl";
        case "meta":
        case "cmd":
            return isMac ? "⌘" : "Win";
        case "shift":
            return isMac ? "⇧" : "Shift";
        case "alt":
            return isMac ? "⌥" : "Alt";
        case "enter":
            return "↵ Enter";
        case "escape":
        case "esc":
            return "Esc";
        case "arrowup":
        case "up":
            return "↑";
        case "arrowdown":
        case "down":
            return "↓";
        case "arrowleft":
        case "left":
            return "←";
        case "arrowright":
        case "right":
            return "→";
        case "\\":
        case "backslash":
            return "\\";
        default:
            return key.toUpperCase();
    }
};

/**
 * Checks whether an incoming KeyboardEvent matches the specified key combo
 */
export function matchesKeyCombo(event: KeyboardEvent, keys: KeyCombo, isMac: boolean): boolean {
    const hasMod = keys.some((k) => k.toLowerCase() === "mod");
    const hasShift = keys.some((k) => k.toLowerCase() === "shift");
    const hasCtrl = keys.some((k) => ["ctrl", "control"].includes(k.toLowerCase())) || (!isMac && hasMod);
    const hasMeta = keys.some((k) => ["meta", "cmd"].includes(k.toLowerCase())) || (isMac && hasMod);
    const hasAlt = keys.some((k) => k.toLowerCase() === "alt");

    const nonModifierKeys = keys.filter(
        (k) => !["shift", "control", "ctrl", "alt", "meta", "cmd", "mod"].includes(k.toLowerCase())
    );

    // Modifier match
    if (event.ctrlKey !== hasCtrl) return false;
    if (event.metaKey !== hasMeta) return false;
    if (event.altKey !== hasAlt) return false;

    // Special case for '?' which requires shift on standard layouts, or is typed directly
    const targetKey = nonModifierKeys[0];
    if (targetKey === "?" || (hasShift && targetKey === "/")) {
        return event.key === "?" || (event.shiftKey && (event.key === "/" || event.key === "?"));
    }

    if (event.shiftKey !== hasShift) return false;

    if (!targetKey) {
        return true;
    }

    const eventKeyLower = event.key.toLowerCase();
    const targetKeyLower = targetKey.toLowerCase();

    if (targetKeyLower === "esc" || targetKeyLower === "escape") {
        return eventKeyLower === "escape" || eventKeyLower === "esc";
    }

    if (targetKeyLower === "\\" || targetKeyLower === "backslash") {
        return event.key === "\\" || event.code === "Backslash";
    }

    return eventKeyLower === targetKeyLower;
}

/**
 * Hook for registering a single or composite keyboard shortcut
 */
export function useHotkeys(
    keys: KeyCombo,
    callback: (event: KeyboardEvent) => void,
    options: HotkeyOptions = {}
) {
    const {
        preventDefault = true,
        stopPropagation = true,
        ignoreInput = true,
        enabled = true,
    } = options;

    const callbackRef = useRef(callback);
    useEffect(() => {
        callbackRef.current = callback;
    });

    const keysRef = useRef(keys);
    useEffect(() => {
        keysRef.current = keys;
    });

    const comboKey = keys.join("+");

    useEffect(() => {
        if (!enabled) return;

        const isMac = isMacSystem();

        const handleKeyDown = (event: KeyboardEvent) => {
            // Guard against Vietnamese IME and other IME compositions
            if (event.isComposing || event.keyCode === 229) {
                return;
            }

            // Check if cursor is in an input / textarea / contenteditable
            if (ignoreInput && isInputElement(event.target)) {
                return;
            }

            if (matchesKeyCombo(event, keysRef.current, isMac)) {
                if (preventDefault) event.preventDefault();
                if (stopPropagation) event.stopPropagation();
                callbackRef.current(event);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [comboKey, preventDefault, stopPropagation, ignoreInput, enabled]);
}

/**
 * Hook for two-step sequence shortcuts like "G then F" (Go-To pattern)
 */
export function useSequenceHotkeys(
    firstKey: string,
    keyMap: Record<string, (event: KeyboardEvent) => void>,
    timeoutMs = 600
) {
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const keyMapRef = useRef(keyMap);
    useEffect(() => {
        keyMapRef.current = keyMap;
    });

    useEffect(() => {
        const setActiveSequence = useShortcutsStore.getState().setActiveSequence;

        const resetBuffer = () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
            setActiveSequence(null);
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            // IME Guard
            if (event.isComposing || event.keyCode === 229) {
                resetBuffer();
                return;
            }

            // Input Guard
            if (isInputElement(event.target)) {
                resetBuffer();
                return;
            }

            // Modifiers like Ctrl/Cmd should break sequence
            if (event.ctrlKey || event.metaKey || event.altKey) {
                resetBuffer();
                return;
            }

            const currentActiveSeq = useShortcutsStore.getState().activeSequence;

            // Step 1: First key pressed
            if (!currentActiveSeq) {
                if (event.key.toLowerCase() === firstKey.toLowerCase()) {
                    event.preventDefault();
                    setActiveSequence(firstKey.toUpperCase());
                    timerRef.current = setTimeout(() => {
                        resetBuffer();
                    }, timeoutMs);
                }
                return;
            }

            // Step 2: Buffer is active, handle second key
            if (currentActiveSeq === firstKey.toUpperCase()) {
                const pressedKey = event.key.toLowerCase();
                const matchedAction = keyMapRef.current[pressedKey];

                if (matchedAction) {
                    event.preventDefault();
                    event.stopPropagation();
                    resetBuffer();
                    matchedAction(event);
                } else {
                    resetBuffer();
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            resetBuffer();
        };
    }, [firstKey, timeoutMs]);
}
