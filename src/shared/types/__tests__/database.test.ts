import { describe, expect, it } from "vitest";
import { isValidEmail, isValidSlug, isValidUserId } from "../../../infrastructure/db/types.js";

describe("データベース型ガード", () => {
	describe("isValidUserId", () => {
		it("正の数値の場合はtrueを返す", () => {
			expect(isValidUserId(1)).toBe(true);
			expect(isValidUserId(123)).toBe(true);
			expect(isValidUserId(999999)).toBe(true);
		});

		it("ゼロまたは負の数値の場合はfalseを返す", () => {
			expect(isValidUserId(0)).toBe(false);
			expect(isValidUserId(-1)).toBe(false);
			expect(isValidUserId(-123)).toBe(false);
		});

		it("数値以外の場合はfalseを返す", () => {
			expect(isValidUserId("1")).toBe(false);
			expect(isValidUserId(null)).toBe(false);
			expect(isValidUserId(undefined)).toBe(false);
			expect(isValidUserId({})).toBe(false);
			expect(isValidUserId([])).toBe(false);
		});

		it("NaNやInfinityの場合はfalseを返す", () => {
			expect(isValidUserId(Number.NaN)).toBe(false);
			expect(isValidUserId(Number.POSITIVE_INFINITY)).toBe(false);
			expect(isValidUserId(Number.NEGATIVE_INFINITY)).toBe(false);
		});
	});

	describe("isValidEmail", () => {
		it("有効なメールアドレスの場合はtrueを返す", () => {
			expect(isValidEmail("user@example.com")).toBe(true);
			expect(isValidEmail("test.email@domain.co.uk")).toBe(true);
			expect(isValidEmail("user123+tag@example.org")).toBe(true);
		});

		it("無効なメールアドレスの場合はfalseを返す", () => {
			expect(isValidEmail("invalid")).toBe(false);
			expect(isValidEmail("@example.com")).toBe(false);
			expect(isValidEmail("user@")).toBe(false);
			expect(isValidEmail("user@.com")).toBe(false);
			expect(isValidEmail("user name@example.com")).toBe(false);
		});

		it("文字列以外の場合はfalseを返す", () => {
			expect(isValidEmail(123)).toBe(false);
			expect(isValidEmail(null)).toBe(false);
			expect(isValidEmail(undefined)).toBe(false);
			expect(isValidEmail({})).toBe(false);
		});
	});

	describe("isValidSlug", () => {
		it("有効なスラッグの場合はtrueを返す", () => {
			expect(isValidSlug("hello-world")).toBe(true);
			expect(isValidSlug("test-123")).toBe(true);
			expect(isValidSlug("simple")).toBe(true);
			expect(isValidSlug("multiple-words-here")).toBe(true);
		});

		it("無効なスラッグの場合はfalseを返す", () => {
			expect(isValidSlug("Hello World")).toBe(false);
			expect(isValidSlug("test_underscore")).toBe(false);
			expect(isValidSlug("test@email")).toBe(false);
			expect(isValidSlug("test.dot")).toBe(false);
			expect(isValidSlug("")).toBe(false);
		});

		it("文字列以外の場合はfalseを返す", () => {
			expect(isValidSlug(123)).toBe(false);
			expect(isValidSlug(null)).toBe(false);
			expect(isValidSlug(undefined)).toBe(false);
			expect(isValidSlug({})).toBe(false);
		});
	});
});
