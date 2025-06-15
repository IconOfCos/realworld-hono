import { z } from "zod";

// コメント作成スキーマ
export const createCommentSchema = z.object({
	comment: z.object({
		body: z.string().min(1, "コメント本文は必須です").max(5000, "コメントは5000文字以下で入力してください"),
	}),
});

// コメントIDパラメータスキーマ
export const commentIdParamSchema = z.object({
	id: z.coerce.number().positive("コメントIDは正の整数である必要があります"),
});

// 記事スラッグパラメータスキーマ（コメント用）
export const articleSlugParamSchema = z.object({
	slug: z
		.string()
		.min(1, "スラッグは必須です")
		.regex(/^[a-z0-9-]+$/, "スラッグは小文字英数字とハイフンのみ使用可能です"),
});

// 型エクスポート
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type CommentIdParam = z.infer<typeof commentIdParamSchema>;
export type ArticleSlugParam = z.infer<typeof articleSlugParamSchema>;
