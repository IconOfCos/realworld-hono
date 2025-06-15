import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";
import { articleTags, articles, comments, favorites, follows, tags, users } from "./schema.js";

// ユーザー関連のスキーマ
export const insertUserSchema = createInsertSchema(users, {
	email: (schema) => schema.email("有効なメールアドレスを入力してください"),
	username: (schema) =>
		schema
			.min(3, "ユーザー名は3文字以上で入力してください")
			.max(20, "ユーザー名は20文字以下で入力してください")
			.regex(/^[\w\-]+$/, "ユーザー名は英数字、アンダースコア、ハイフンのみ使用可能です"),
	passwordHash: (schema) => schema.min(1, "パスワードハッシュは必須です"),
	bio: (schema) => schema.max(500, "自己紹介は500文字以下で入力してください").optional(),
	image: (schema) => schema.url("有効なURLを入力してください").optional(),
});

export const selectUserSchema = createSelectSchema(users);
export const updateUserSchema = createUpdateSchema(users, {
	email: (schema) => schema.email("有効なメールアドレスを入力してください").optional(),
	username: (schema) =>
		schema
			.min(3, "ユーザー名は3文字以上で入力してください")
			.max(20, "ユーザー名は20文字以下で入力してください")
			.regex(/^[\w\-]+$/, "ユーザー名は英数字、アンダースコア、ハイフンのみ使用可能です")
			.optional(),
	bio: (schema) => schema.max(500, "自己紹介は500文字以下で入力してください").optional(),
	image: (schema) => schema.url("有効なURLを入力してください").optional(),
});

// 記事関連のスキーマ
export const insertArticleSchema = createInsertSchema(articles, {
	slug: (schema) =>
		schema.min(1, "スラッグは必須です").regex(/^[a-z0-9-]+$/, "スラッグは小文字英数字とハイフンのみ使用可能です"),
	title: (schema) => schema.min(1, "タイトルは必須です").max(255, "タイトルは255文字以下で入力してください"),
	description: (schema) => schema.min(1, "説明は必須です").max(500, "説明は500文字以下で入力してください"),
	body: (schema) => schema.min(1, "本文は必須です"),
	authorId: (schema) => schema.positive("著者IDは正の整数である必要があります"),
});

export const selectArticleSchema = createSelectSchema(articles);
export const updateArticleSchema = createUpdateSchema(articles, {
	slug: (schema) =>
		schema
			.min(1, "スラッグは必須です")
			.regex(/^[a-z0-9-]+$/, "スラッグは小文字英数字とハイフンのみ使用可能です")
			.optional(),
	title: (schema) => schema.min(1, "タイトルは必須です").max(255, "タイトルは255文字以下で入力してください").optional(),
	description: (schema) => schema.min(1, "説明は必須です").max(500, "説明は500文字以下で入力してください").optional(),
	body: (schema) => schema.min(1, "本文は必須です").optional(),
});

// コメント関連のスキーマ
export const insertCommentSchema = createInsertSchema(comments, {
	body: (schema) => schema.min(1, "コメント本文は必須です").max(5000, "コメントは5000文字以下で入力してください"),
	authorId: (schema) => schema.positive("著者IDは正の整数である必要があります"),
	articleId: (schema) => schema.positive("記事IDは正の整数である必要があります"),
});

export const selectCommentSchema = createSelectSchema(comments);

// タグ関連のスキーマ
export const insertTagSchema = createInsertSchema(tags, {
	name: (schema) =>
		schema
			.min(1, "タグ名は必須です")
			.max(100, "タグ名は100文字以下で入力してください")
			.regex(/^[\w\-]+$/, "タグ名は英数字、アンダースコア、ハイフンのみ使用可能です"),
});

export const selectTagSchema = createSelectSchema(tags);

// リレーションテーブルのスキーマ
export const insertArticleTagSchema = createInsertSchema(articleTags, {
	articleId: (schema) => schema.positive("記事IDは正の整数である必要があります"),
	tagId: (schema) => schema.positive("タグIDは正の整数である必要があります"),
});

export const insertFollowSchema = createInsertSchema(follows, {
	followerId: (schema) => schema.positive("フォロワーIDは正の整数である必要があります"),
	followingId: (schema) => schema.positive("フォロー対象IDは正の整数である必要があります"),
});

export const insertFavoriteSchema = createInsertSchema(favorites, {
	userId: (schema) => schema.positive("ユーザーIDは正の整数である必要があります"),
	articleId: (schema) => schema.positive("記事IDは正の整数である必要があります"),
});

// カスタムバリデーションスキーマ
export const userIdSchema = z
	.number()
	.positive("ユーザーIDは正の整数である必要があります")
	.finite("ユーザーIDは有限の数値である必要があります");
export const articleIdSchema = z
	.number()
	.positive("記事IDは正の整数である必要があります")
	.finite("記事IDは有限の数値である必要があります");
export const emailSchema = z.string().email("有効なメールアドレスを入力してください");
export const slugSchema = z
	.string()
	.min(1, "スラッグは必須です")
	.regex(/^[a-z0-9-]+$/, "スラッグは小文字英数字とハイフンのみ使用可能です");
export const usernameSchema = z
	.string()
	.min(3, "ユーザー名は3文字以上で入力してください")
	.max(20, "ユーザー名は20文字以下で入力してください")
	.regex(/^[\w\-]+$/, "ユーザー名は英数字、アンダースコア、ハイフンのみ使用可能です");

// ページネーション関連のスキーマ
export const paginationSchema = z.object({
	limit: z.coerce
		.number()
		.positive("リミットは正の整数である必要があります")
		.max(100, "リミットは100以下である必要があります")
		.default(20),
	offset: z.coerce.number().nonnegative("オフセットは0以上である必要があります").default(0),
});

// 型エクスポート - 直接Drizzle ORMの型を使用
export type InsertUser = InferInsertModel<typeof users>;
export type SelectUser = InferSelectModel<typeof users>;
export type UpdateUser = Partial<Omit<InsertUser, "id" | "createdAt" | "updatedAt">>;
export type InsertArticle = InferInsertModel<typeof articles>;
export type SelectArticle = InferSelectModel<typeof articles>;
export type UpdateArticle = Partial<Omit<InsertArticle, "id" | "createdAt" | "updatedAt">>;
export type InsertComment = InferInsertModel<typeof comments>;
export type SelectComment = InferSelectModel<typeof comments>;
export type InsertTag = InferInsertModel<typeof tags>;
export type SelectTag = InferSelectModel<typeof tags>;
export type Pagination = z.infer<typeof paginationSchema>;
