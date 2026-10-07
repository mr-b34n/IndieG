import { useEffect } from "react";

type KeyCombo = string[];

interface ShortcutOptions {
    preventDefault?: boolean;
    stopPropagation?: boolean;
    ignoreInput?: boolean;
}

export function useKeyboardShortcut(
    keys: KeyCombo,
    callback: (event: KeyboardEvent) => void,
    options: ShortcutOptions = {}
) {
    const {
        preventDefault = true,
        stopPropagation = true,
        ignoreInput = true
    } = options;

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Logic for matching the shortcut
            if (
                ignoreInput &&
                (event.target instanceof HTMLInputElement ||
                event.target instanceof HTMLTextAreaElement ||
                (event.target instanceof HTMLElement && event.target.isContentEditable))
            ) {
                return;
            }

            const isMac = typeof window !== "undefined" && navigator.userAgent.includes("Mac");
            
            const hasMod = keys.includes("Mod");
            const isShift = keys.includes("Shift");
            const isCtrl = keys.includes("Control") || keys.includes("Ctrl") || (!isMac && hasMod);
            const isAlt = keys.includes("Alt");
            const isMeta = keys.includes("Meta") || keys.includes("Cmd") || (isMac && hasMod);

            const key = keys.find(
                (k) => !["Shift", "Control", "Ctrl", "Alt", "Meta", "Cmd", "Mod"].includes(k)
            );

            if (
                event.shiftKey === isShift &&
                event.ctrlKey === isCtrl &&
                event.altKey === isAlt &&
                event.metaKey === isMeta &&
                (key ? event.key.toLowerCase() === key.toLowerCase() : true)
            ) {
                if (preventDefault) event.preventDefault();
                if (stopPropagation) event.stopPropagation();
                callback(event);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [keys.join("+"), callback, preventDefault, stopPropagation, ignoreInput]);
}
