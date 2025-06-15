import type { Context, MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import type { ZodSchema } from "zod";
import { flattenZodError, isParseError, parseWithSchema } from "../utils/parse.js";

/**
 * リクエストボディをバリデーションするミドルウェア
 */
export function validateBody<T>(schema: ZodSchema<T>): MiddlewareHandler {
	return async (c: Context, next) => {
		const body = await c.req.json().catch(() => null);

		if (body === null) {
			throw new HTTPException(400, {
				message: "Invalid JSON body",
			});
		}

		const result = parseWithSchema(schema, body);

		if (isParseError(result)) {
			throw new HTTPException(422, {
				message: "Validation failed",
				cause: {
					errors: flattenZodError(result.error),
				},
			});
		}

		// パース済みのデータをコンテキストに設定
		c.set("validatedBody", result.data);

		await next();
	};
}

/**
 * クエリパラメータをバリデーションするミドルウェア
 */
export function validateQuery<T>(schema: ZodSchema<T>): MiddlewareHandler {
	return async (c: Context, next) => {
		const query = c.req.query();
		const result = parseWithSchema(schema, query);

		if (isParseError(result)) {
			throw new HTTPException(400, {
				message: "Invalid query parameters",
				cause: {
					errors: flattenZodError(result.error),
				},
			});
		}

		// パース済みのデータをコンテキストに設定
		c.set("validatedQuery", result.data);

		await next();
	};
}

/**
 * パスパラメータをバリデーションするミドルウェア
 */
export function validateParam<T>(schema: ZodSchema<T>): MiddlewareHandler {
	return async (c: Context, next) => {
		const param = c.req.param();
		const result = parseWithSchema(schema, param);

		if (isParseError(result)) {
			throw new HTTPException(404, {
				message: "Resource not found",
				cause: {
					errors: flattenZodError(result.error),
				},
			});
		}

		// パース済みのデータをコンテキストに設定
		c.set("validatedParam", result.data);

		await next();
	};
}

/**
 * バリデーション済みのボディを取得する
 */
export function getValidatedBody<T>(c: Context): T {
	const body = c.get("validatedBody");
	if (!body) {
		throw new Error("No validated body found. Make sure to use validateBody middleware.");
	}
	return body as T;
}

/**
 * バリデーション済みのクエリを取得する
 */
export function getValidatedQuery<T>(c: Context): T {
	const query = c.get("validatedQuery");
	if (!query) {
		throw new Error("No validated query found. Make sure to use validateQuery middleware.");
	}
	return query as T;
}

/**
 * バリデーション済みのパラメータを取得する
 */
export function getValidatedParam<T>(c: Context): T {
	const param = c.get("validatedParam");
	if (!param) {
		throw new Error("No validated param found. Make sure to use validateParam middleware.");
	}
	return param as T;
}
