import { eq } from "drizzle-orm";
import { db } from "../../../infrastructure/db/client.js";
import { users } from "../../../infrastructure/db/schema.js";
import { generateJWT } from "../../../shared/utils/jwt.js";
import { verifyPassword } from "../../../shared/utils/password.js";
import type { AuthCommandResult, LoginUserCommand } from "../types.js";

export async function loginUser(command: LoginUserCommand): Promise<AuthCommandResult> {
	try {
		// セキュリティログ: ログイン試行（emailのみ記録、パスワードは記録しない）
		console.info(`ログイン試行: email=${command.email}`);

		// ユーザー検索
		const [user] = await db.select().from(users).where(eq(users.email, command.email)).limit(1);

		if (!user) {
			// セキュリティログ: 存在しないユーザーでのログイン試行
			console.warn(`ログイン失敗（ユーザー不存在）: email=${command.email}`);

			return {
				success: false,
				error: "メールアドレスまたはパスワードが間違っています",
			};
		}

		// パスワード検証
		const isValidPassword = await verifyPassword(command.password, user.passwordHash);
		if (!isValidPassword) {
			// セキュリティログ: パスワード不一致（ブルートフォース攻撃検知に重要）
			console.warn(`ログイン失敗（パスワード不一致）: userId=${user.id}, email=${command.email}`);

			return {
				success: false,
				error: "メールアドレスまたはパスワードが間違っています",
			};
		}

		// JWT生成
		const token = await generateJWT({
			sub: user.id.toString(),
			username: user.username,
			email: user.email,
		});

		// セキュリティログ: ログイン成功
		console.info(`ログイン成功: userId=${user.id}, username=${user.username}`);

		return {
			success: true,
			user: {
				username: user.username,
				email: user.email,
				bio: user.bio || "", // フォールバック
				image: user.image || "", // フォールバック
				token,
			},
		};
	} catch (error) {
		// セキュリティログ: システムエラー
		console.error(`ログインシステムエラー: ${error instanceof Error ? error.message : "Unknown error"}`, {
			email: command.email,
			// パスワードは絶対にログに出力しない
		});

		return {
			success: false,
			error: "ログインに失敗しました",
		};
	}
}
