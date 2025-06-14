import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { ApiError, ApiResponse, Pagination } from "../types/api.js";
import type { InternalErrorResponse, ValidationErrorResponse } from "../types/errors.js";

export const createSuccessResponse = <T>(data: T, pagination?: Pagination): ApiResponse<T> => {
	const response: ApiResponse<T> = { data };
	if (pagination) {
		response.pagination = pagination;
	}
	return response;
};

export const createErrorResponse = (message: string, code?: string, details?: unknown): ApiError => {
	const response: ApiError = { message };
	if (code) {
		response.code = code;
	}
	if (details) {
		response.details = details;
	}
	return response;
};

export const createValidationErrorResponse = (errors: Record<string, string[]>): ValidationErrorResponse => ({
	errors,
});

export const createInternalErrorResponse = (
	message = "Internal Server Error",
	code?: string
): InternalErrorResponse => {
	const error: { message: string; code?: string } = { message };
	if (code) {
		error.code = code;
	}
	return { error };
};

export const jsonResponse = <T>(c: Context, data: T, status: ContentfulStatusCode = 200, pagination?: Pagination) => {
	const response = createSuccessResponse(data, pagination);
	return c.json(response, status);
};

export const errorResponse = (
	c: Context,
	message: string,
	status: ContentfulStatusCode = 500,
	code?: string,
	details?: unknown
) => {
	const response = createErrorResponse(message, code, details);
	return c.json(response, status);
};

export const validationErrorResponse = (c: Context, errors: Record<string, string[]>) => {
	const response = createValidationErrorResponse(errors);
	return c.json(response, 422);
};

export const authErrorResponse = (c: Context) => {
	return c.json({}, 401);
};

export const internalErrorResponse = (c: Context, message?: string, code?: string) => {
	const response = createInternalErrorResponse(message, code);
	return c.json(response, 500);
};
