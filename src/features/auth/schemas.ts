import { z } from "zod";

// ユーザー登録スキーマ
export const registerUserSchema = z.object({
	user: z.object({
		username: z
			.string()
			.min(3, "ユーザー名は3文字以上で入力してください")
			.max(20, "ユーザー名は20文字以下で入力してください")
			.regex(/^[\w\-]+$/, "ユーザー名は英数字、アンダースコア、ハイフンのみ使用可能です"),
		email: z.string().email("有効なメールアドレスを入力してください"),
		password: z
			.string()
			.min(8, "パスワードは8文字以上で入力してください")
			.max(100, "パスワードは100文字以下で入力してください"),
	}),
});

// ログインスキーマ
export const loginUserSchema = z.object({
	user: z.object({
		email: z.string().email("有効なメールアドレスを入力してください"),
		password: z.string().min(1, "パスワードは必須です"),
	}),
});

// ユーザー更新スキーマ
export const updateUserSchema = z.object({
	user: z.object({
		email: z.string().email("有効なメールアドレスを入力してください").optional(),
		username: z
			.string()
			.min(3, "ユーザー名は3文字以上で入力してください")
			.max(20, "ユーザー名は20文字以下で入力してください")
			.regex(/^[\w\-]+$/, "ユーザー名は英数字、アンダースコア、ハイフンのみ使用可能です")
			.optional(),
		password: z
			.string()
			.min(8, "パスワードは8文字以上で入力してください")
			.max(100, "パスワードは100文字以下で入力してください")
			.optional(),
		bio: z.string().max(500, "自己紹介は500文字以下で入力してください").optional(),
		image: z.string().url("有効なURLを入力してください").optional().or(z.literal("")),
	}),
});

// 型エクスポート
export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type LoginUserInput = z.infer<typeof loginUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
