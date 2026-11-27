export interface ActiveMentionMatch {
    query: string;
    startIndex: number;
    endIndex: number;
}

/**
 * Detects if the caret at `cursorPos` inside `text` is currently typing an `@mention`.
 * Requires `@` to be at the start of text or preceded by whitespace or `(`.
 * Returns null if the query contains whitespace or exceeds 30 characters.
 */
export function getActiveMentionQuery(
    text: string,
    cursorPos: number
): ActiveMentionMatch | null {
    if (!text || cursorPos <= 0) return null;
    const safeCursor = Math.min(cursorPos, text.length);
    const beforeCursor = text.slice(0, safeCursor);

    const match = beforeCursor.match(/(?:^|[\s(])@([a-zA-Z0-9_]{0,30})$/);
    if (!match) return null;

    const query = match[1] ?? "";
    const atIndex = beforeCursor.lastIndexOf("@");
    if (atIndex === -1) return null;

    return {
        query,
        startIndex: atIndex,
        endIndex: safeCursor,
    };
}

/**
 * Replaces the active `@query` slice in `text` with `@username ` and returns the new text & caret offset.
 */
export function insertMentionIntoText(
    text: string,
    startIndex: number,
    endIndex: number,
    username: string
): { nextText: string; nextCursorPos: number } {
    const cleanUsername = username.trim().replace(/^@+/, "");
    const before = text.slice(0, startIndex);
    const after = text.slice(endIndex);
    const trailingSpace = after.startsWith(" ") ? "" : " ";
    const inserted = `@${cleanUsername}${trailingSpace}`;
    const nextText = `${before}${inserted}${after}`;
    return {
        nextText,
        nextCursorPos: before.length + inserted.length,
    };
}
