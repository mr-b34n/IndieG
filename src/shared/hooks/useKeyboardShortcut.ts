import { useHotkeys, type KeyCombo, type HotkeyOptions } from "./useHotkeys";

export type { KeyCombo };
export type ShortcutOptions = HotkeyOptions;

export function useKeyboardShortcut(
    keys: KeyCombo,
    callback: (event: KeyboardEvent) => void,
    options: ShortcutOptions = {}
) {
    return useHotkeys(keys, callback, options);
}
