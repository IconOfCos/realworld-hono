export interface Pagination {
	limit: number;
	offset: number;
	total?: number;
}

export interface ApiResponse<T> {
	data: T;
	pagination?: Pagination;
}

export interface ApiError {
	message: string;
	code?: string;
	details?: unknown;
}
