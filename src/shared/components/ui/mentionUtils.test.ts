import { describe, it, expect } from "vitest";
import { getActiveMentionQuery, insertMentionIntoText } from "./mentionUtils";

describe("mentionUtils", () => {
    it("detects @mention at start of input", () => {
        expect(getActiveMentionQuery("@ali", 4)).toEqual({
            query: "ali",
            startIndex: 0,
            endIndex: 4,
        });
    });

    it("detects empty query right after typing @", () => {
        expect(getActiveMentionQuery("Hello @", 7)).toEqual({
            query: "",
            startIndex: 6,
            endIndex: 7,
        });
    });

    it("ignores email addresses where @ is preceded by word characters", () => {
        expect(getActiveMentionQuery("mail@example", 12)).toBeNull();
    });

    it("stops matching after whitespace", () => {
        expect(getActiveMentionQuery("Hello @alice world", 18)).toBeNull();
    });

    it("inserts selected username with trailing space and computes caret position", () => {
        const res = insertMentionIntoText("Hi @al how are you", 3, 6, "alice_gg");
        expect(res).toEqual({
            nextText: "Hi @alice_gg how are you",
            nextCursorPos: 12,
        });
    });

    it("appends trailing space when inserting at end of text", () => {
        const res = insertMentionIntoText("Hi @al", 3, 6, "@alice_gg");
        expect(res).toEqual({
            nextText: "Hi @alice_gg ",
            nextCursorPos: 13,
        });
    });
});
