import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
	flattenZodError,
	formatZodError,
	isParseError,
	isParseSuccess,
	parseWithSchema,
	unwrapParseResult,
	unwrapParseResultOr,
} from "../parse.js";

const testSchema = z.object({
	name: z.string().min(1, "名前は必須です"),
	age: z.number().positive("年齢は正の整数である必要があります"),
	email: z.string().email("有効なメールアドレスを入力してください"),
});

describe("parseWithSchema", () => {
	it("有効なデータをパースできること", () => {
		const validData = {
			name: "太郎",
			age: 25,
			email: "taro@example.com",
		};

		const result = parseWithSchema(testSchema, validData);

		expect(isParseSuccess(result)).toBe(true);
		if (isParseSuccess(result)) {
			expect(result.data).toEqual(validData);
		}
	});

	it("無効なデータでエラーを返すこと", () => {
		const invalidData = {
			name: "",
			age: -1,
			email: "invalid-email",
		};

		const result = parseWithSchema(testSchema, invalidData);

		expect(isParseError(result)).toBe(true);
		if (isParseError(result)) {
			expect(result.error).toBeDefined();
			expect(result.error.issues).toHaveLength(3);
		}
	});
});

describe("isParseSuccess", () => {
	it("成功結果を正しく判定すること", () => {
		const validData = {
			name: "太郎",
			age: 25,
			email: "taro@example.com",
		};

		const result = parseWithSchema(testSchema, validData);
		expect(isParseSuccess(result)).toBe(true);
	});
});

describe("isParseError", () => {
	it("エラー結果を正しく判定すること", () => {
		const invalidData = {
			name: "",
			age: -1,
			email: "invalid-email",
		};

		const result = parseWithSchema(testSchema, invalidData);
		expect(isParseError(result)).toBe(true);
	});
});

describe("flattenZodError", () => {
	it("ZodErrorをフラットなエラーメッセージに変換すること", () => {
		const invalidData = {
			name: "",
			age: -1,
			email: "invalid-email",
		};

		const result = parseWithSchema(testSchema, invalidData);

		if (isParseError(result)) {
			const flattened = flattenZodError(result.error);

			expect(flattened).toHaveProperty("name");
			expect(flattened).toHaveProperty("age");
			expect(flattened).toHaveProperty("email");
			expect(flattened.name).toContain("名前は必須です");
			expect(flattened.age).toContain("年齢は正の整数である必要があります");
			expect(flattened.email).toContain("有効なメールアドレスを入力してください");
		}
	});
});

describe("formatZodError", () => {
	it("ZodErrorを単一のエラーメッセージに変換すること", () => {
		const invalidData = {
			name: "",
			age: -1,
			email: "invalid-email",
		};

		const result = parseWithSchema(testSchema, invalidData);

		if (isParseError(result)) {
			const formatted = formatZodError(result.error);

			expect(formatted).toContain("name: 名前は必須です");
			expect(formatted).toContain("age: 年齢は正の整数である必要があります");
			expect(formatted).toContain("email: 有効なメールアドレスを入力してください");
		}
	});
});

describe("unwrapParseResult", () => {
	it("成功結果から値を取得すること", () => {
		const validData = {
			name: "太郎",
			age: 25,
			email: "taro@example.com",
		};

		const result = parseWithSchema(testSchema, validData);
		const unwrapped = unwrapParseResult(result);

		expect(unwrapped).toEqual(validData);
	});

	it("エラー結果でExceptionをスローすること", () => {
		const invalidData = {
			name: "",
			age: -1,
			email: "invalid-email",
		};

		const result = parseWithSchema(testSchema, invalidData);

		expect(() => unwrapParseResult(result)).toThrow();
	});
});

describe("unwrapParseResultOr", () => {
	it("成功結果から値を取得すること", () => {
		const validData = {
			name: "太郎",
			age: 25,
			email: "taro@example.com",
		};

		const result = parseWithSchema(testSchema, validData);
		const defaultValue = { name: "default", age: 0, email: "default@example.com" };
		const unwrapped = unwrapParseResultOr(result, defaultValue);

		expect(unwrapped).toEqual(validData);
	});

	it("エラー結果でデフォルト値を返すこと", () => {
		const invalidData = {
			name: "",
			age: -1,
			email: "invalid-email",
		};

		const result = parseWithSchema(testSchema, invalidData);
		const defaultValue = { name: "default", age: 0, email: "default@example.com" };
		const unwrapped = unwrapParseResultOr(result, defaultValue);

		expect(unwrapped).toEqual(defaultValue);
	});
});
