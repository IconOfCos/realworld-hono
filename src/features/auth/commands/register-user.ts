import { eq, or } from "drizzle-orm";
import { db } from "../../../infrastructure/db/client.js";
import { users } from "../../../infrastructure/db/schema.js";
import { generateJWT } from "../../../shared/utils/jwt.js";
import { hashPassword } from "../../../shared/utils/password.js";
import type { AuthCommandResult, RegisterUserCommand } from "../types.js";

export async function registerUser(command: RegisterUserCommand): Promise<AuthCommandResult> {
	try {
		// セキュリティログ: 登録試行
		console.info(`ユーザー登録試行: username=${command.username}, email=${command.email}`);

		// トランザクション処理でアトミックな操作を保証
		return await db.transaction(async (tx) => {
			// 重複チェック（トランザクション内で実行）
			const existingUser = await tx
				.select()
				.from(users)
				.where(or(eq(users.username, command.username), eq(users.email, command.email)))
				.limit(1);

			if (existingUser.length > 0) {
				const isDuplicateUsername = existingUser[0].username === command.username;
				const errorMessage = isDuplicateUsername
					? "ユーザー名は既に使用されています"
					: "メールアドレスは既に使用されています";

				// セキュリティログ: 重複エラー
				console.warn(
					`ユーザー登録失敗（重複）: ${errorMessage} - username=${command.username}, email=${command.email}`
				);

				return {
					success: false,
					error: errorMessage,
				};
			}

			// パスワードハッシュ化（平文パスワードをログに出力しない）
			const passwordHash = await hashPassword(command.password);

			// ユーザー作成（トランザクション内で実行）
			const [newUser] = await tx
				.insert(users)
				.values({
					username: command.username,
					email: command.email,
					passwordHash,
					bio: "", // デフォルト値設定
					image: "", // デフォルト値設定
				})
				.returning();

			// JWT生成（失敗した場合はトランザクションがロールバック）
			const token = await generateJWT({
				sub: newUser.id.toString(),
				username: newUser.username,
				email: newUser.email,
			});

			// セキュリティログ: 登録成功
			console.info(`ユーザー登録成功: userId=${newUser.id}, username=${newUser.username}`);

			return {
				success: true,
				user: {
					username: newUser.username,
					email: newUser.email,
					bio: newUser.bio || "", // フォールバック
					image: newUser.image || "", // フォールバック
					token,
				},
			};
		});
	} catch (error) {
		// セキュリティログ: システムエラー（トランザクションはロールバック済み）
		console.error(`ユーザー登録システムエラー: ${error instanceof Error ? error.message : "Unknown error"}`, {
			username: command.username,
			email: command.email,
			// パスワードは絶対にログに出力しない
		});

		return {
			success: false,
			error: "ユーザー登録に失敗しました",
		};
	}
}
