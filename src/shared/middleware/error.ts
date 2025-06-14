import type { Context, ErrorHandler, Next } from "hono";
import { HTTPException } from "hono/http-exception";
import { logger } from "../utils/logger.js";
import { authErrorResponse, internalErrorResponse, validationErrorResponse } from "../utils/response.js";

export const errorHandler: ErrorHandler = (error: Error, c: Context) => {
	logger.error("Error:", error);

	// HTTPExceptionの場合
	if (error instanceof HTTPException) {
		const status = error.status;

		switch (status) {
			case 401:
				return authErrorResponse(c);
			case 422: {
				// バリデーションエラーの場合、エラーから詳細を抽出
				const validationErrors = extractValidationErrors(error);
				return validationErrorResponse(c, validationErrors);
			}
			default:
				return internalErrorResponse(c, error.message);
		}
	}

	// その他の予期しないエラー
	return internalErrorResponse(c, "An unexpected error occurred");
};

interface ValidationError {
	field: string;
	message: string;
}

const extractValidationErrors = (error: HTTPException): Record<string, string[]> => {
	// 構造化されたバリデーションエラーを適切に処理
	if (error.cause && typeof error.cause === "object") {
		// バリデーションライブラリからの構造化エラーを処理
		return processStructuredErrors(error.cause);
	}

	// シンプルなメッセージの場合
	try {
		const parsed = JSON.parse(error.message);
		if (Array.isArray(parsed)) {
			return { body: parsed };
		}
		if (typeof parsed === "object" && parsed !== null) {
			return processStructuredErrors(parsed);
		}
	} catch {
		// JSONパースに失敗した場合はメッセージをそのまま使用
	}

	return { body: [error.message] };
};

const processStructuredErrors = (errors: unknown): Record<string, string[]> => {
	const result: Record<string, string[]> = {};

	if (Array.isArray(errors)) {
		// 配列の場合は一般的なエラーとして処理
		result.body = errors.map((err) => (typeof err === "string" ? err : JSON.stringify(err)));
	} else if (typeof errors === "object" && errors !== null) {
		// オブジェクトの場合はフィールド別エラーとして処理
		for (const [field, fieldErrors] of Object.entries(errors)) {
			if (Array.isArray(fieldErrors)) {
				result[field] = fieldErrors.map((err) => (typeof err === "string" ? err : JSON.stringify(err)));
			} else if (typeof fieldErrors === "string") {
				result[field] = [fieldErrors];
			} else {
				result[field] = [JSON.stringify(fieldErrors)];
			}
		}
	} else {
		// その他の場合
		result.body = [String(errors)];
	}

	return result;
};

export const globalErrorHandler = () => {
	return async (c: Context, next: Next) => {
		try {
			await next();
		} catch (error) {
			return errorHandler(error as Error, c);
		}
	};
};
