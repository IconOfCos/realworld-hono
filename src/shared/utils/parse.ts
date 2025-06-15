import type { ZodError, ZodSchema } from "zod";

export type ParseResult<T> = { success: true; data: T } | { success: false; error: ZodError };

export type ParseSuccess<T> = Extract<ParseResult<T>, { success: true }>;
export type ParseError<T> = Extract<ParseResult<T>, { success: false }>;

/**
 * Zodスキーマを使用して値をパースする汎用関数
 * Parse, don't validateの原則に従い、検証済みの型付き値を返す
 */
export function parseWithSchema<T>(schema: ZodSchema<T>, value: unknown): ParseResult<T> {
	const result = schema.safeParse(value);

	if (result.success) {
		return { success: true, data: result.data };
	}

	return { success: false, error: result.error };
}

/**
 * パース結果が成功かどうかを判定する型ガード
 */
export function isParseSuccess<T>(result: ParseResult<T>): result is ParseSuccess<T> {
	return result.success;
}

/**
 * パース結果が失敗かどうかを判定する型ガード
 */
export function isParseError<T>(result: ParseResult<T>): result is ParseError<T> {
	return !result.success;
}

/**
 * ZodErrorをフラットなエラーメッセージに変換
 */
export function flattenZodError(error: ZodError): Record<string, string[]> {
	const fieldErrors: Record<string, string[]> = {};

	for (const issue of error.issues) {
		const path = issue.path.join(".");
		if (!fieldErrors[path]) {
			fieldErrors[path] = [];
		}
		fieldErrors[path].push(issue.message);
	}

	return fieldErrors;
}

/**
 * ZodErrorを単一のエラーメッセージに変換
 */
export function formatZodError(error: ZodError): string {
	return error.issues
		.map((issue) => {
			const path = issue.path.join(".");
			return path ? `${path}: ${issue.message}` : issue.message;
		})
		.join(", ");
}

/**
 * パース結果から値を取得するか、エラーをスローする
 */
export function unwrapParseResult<T>(result: ParseResult<T>): T {
	if (isParseSuccess(result)) {
		return result.data;
	}

	throw new Error(formatZodError(result.error));
}

/**
 * パース結果から値を取得するか、デフォルト値を返す
 */
export function unwrapParseResultOr<T>(result: ParseResult<T>, defaultValue: T): T {
	if (isParseSuccess(result)) {
		return result.data;
	}

	return defaultValue;
}
