import { z } from "zod";
import { paginationSchema } from "../../infrastructure/db/validation.js";

// 記事作成スキーマ
export const createArticleSchema = z.object({
	article: z.object({
		title: z.string().min(1, "タイトルは必須です").max(255, "タイトルは255文字以下で入力してください"),
		description: z.string().min(1, "説明は必須です").max(500, "説明は500文字以下で入力してください"),
		body: z.string().min(1, "本文は必須です"),
		tagList: z
			.array(
				z
					.string()
					.min(1, "タグ名は必須です")
					.max(100, "タグ名は100文字以下で入力してください")
					.regex(/^[\w\-]+$/, "タグ名は英数字、アンダースコア、ハイフンのみ使用可能です")
			)
			.optional()
			.default([]),
	}),
});

// 記事更新スキーマ
export const updateArticleSchema = z.object({
	article: z.object({
		title: z.string().min(1, "タイトルは必須です").max(255, "タイトルは255文字以下で入力してください").optional(),
		description: z.string().min(1, "説明は必須です").max(500, "説明は500文字以下で入力してください").optional(),
		body: z.string().min(1, "本文は必須です").optional(),
		tagList: z
			.array(
				z
					.string()
					.min(1, "タグ名は必須です")
					.max(100, "タグ名は100文字以下で入力してください")
					.regex(/^[\w\-]+$/, "タグ名は英数字、アンダースコア、ハイフンのみ使用可能です")
			)
			.optional(),
	}),
});

// 記事スラッグパラメータスキーマ
export const articleSlugParamSchema = z.object({
	slug: z
		.string()
		.min(1, "スラッグは必須です")
		.regex(/^[a-z0-9-]+$/, "スラッグは小文字英数字とハイフンのみ使用可能です"),
});

// 記事一覧クエリスキーマ
export const listArticlesQuerySchema = paginationSchema.extend({
	tag: z.string().optional(),
	author: z.string().optional(),
	favorited: z.string().optional(),
});

// フィード記事クエリスキーマ
export const feedArticlesQuerySchema = paginationSchema;

// 型エクスポート
export type CreateArticleInput = z.infer<typeof createArticleSchema>;
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>;
export type ArticleSlugParam = z.infer<typeof articleSlugParamSchema>;
export type ListArticlesQuery = z.infer<typeof listArticlesQuerySchema>;
export type FeedArticlesQuery = z.infer<typeof feedArticlesQuerySchema>;
