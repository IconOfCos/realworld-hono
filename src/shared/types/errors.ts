export interface ValidationErrorResponse {
	errors: Record<string, string[]>;
}

// 401認証エラーは空オブジェクトを返す
export type AuthErrorResponse = Record<string, never>;

export interface InternalErrorResponse {
	error: {
		message: string;
		code?: string;
	};
}

export type ErrorResponse = ValidationErrorResponse | AuthErrorResponse | InternalErrorResponse;
