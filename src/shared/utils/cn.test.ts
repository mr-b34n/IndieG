import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn utility", () => {
	describe("basic classes", () => {
		it("returns a single class name as-is", () => {
			expect(cn("px-4")).toBe("px-4");
		});

		it("combines multiple class strings with a space", () => {
			expect(cn("px-4", "py-2", "text-center")).toBe("px-4 py-2 text-center");
		});

		it("ignores empty strings and whitespace-only strings", () => {
			expect(cn("px-4", "", "   ", "py-2")).toBe("px-4 py-2");
		});
	});

	describe("conditional classes", () => {
		it("handles object syntax with boolean flags", () => {
			expect(
				cn({
					"bg-red-500": true,
					"bg-blue-500": false,
					"text-white": true,
				})
			).toBe("bg-red-500 text-white");
		});

		it("handles inline boolean conditions and ignores falsy values", () => {
			const isVisible = false;
			const isPrimary = true;
			expect(
				cn(
					"base-class",
					isVisible && "visible",
					isPrimary && "primary",
					null,
					undefined,
					false
				)
			).toBe("base-class primary");
		});
	});

	describe("array classes", () => {
		it("flattens single-level arrays of classes", () => {
			expect(cn(["px-4", "py-2"])).toBe("px-4 py-2");
		});

		it("flattens deeply nested arrays of classes", () => {
			expect(cn(["px-4", ["py-2", ["text-sm", ["font-bold"]]]])).toBe(
				"px-4 py-2 text-sm font-bold"
			);
		});

		it("handles arrays with mixed types including objects and conditionals", () => {
			expect(
				cn(
					["base", { active: true, disabled: false }],
					["extra", [null, false, "nested"]]
				)
			).toBe("base active extra nested");
		});
	});

	describe("Tailwind merge conflicts", () => {
		it("resolves basic property conflicts in favor of the later class", () => {
			expect(cn("p-2", "p-4")).toBe("p-4");
			expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
			expect(cn("bg-surface", "bg-primary")).toBe("bg-primary");
		});

		it("overrides directional padding when shorthand padding comes later", () => {
			expect(cn("px-4 py-2", "p-8")).toBe("p-8");
		});

		it("overrides shorthand padding when directional padding comes later", () => {
			expect(cn("p-8", "px-4")).toBe("p-8 px-4");
		});

		it("handles conflicts across mixed arguments and conditionals", () => {
			const isLarge = true;
			expect(
				cn("text-sm font-normal text-text-muted", [
					isLarge && "text-lg font-bold",
					"text-text",
				])
			).toBe("text-lg font-bold text-text");
		});
	});

	describe("edge cases", () => {
		it("returns an empty string when called with no arguments", () => {
			expect(cn()).toBe("");
		});

		it("returns an empty string when all arguments are falsy", () => {
			expect(cn(null, undefined, false)).toBe("");
		});
	});
});
