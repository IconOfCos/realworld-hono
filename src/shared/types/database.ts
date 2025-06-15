export interface Pagination {
	limit: number;
	offset: number;
	total?: number;
}

export interface PaginationParams {
	limit?: number;
	offset?: number;
}

export interface DatabaseError {
	code: string;
	message: string;
	detail?: string;
}

export type SortOrder = "asc" | "desc";

export interface SortOptions {
	field: string;
	order: SortOrder;
}
