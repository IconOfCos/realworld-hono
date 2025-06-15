import { eq } from "drizzle-orm";
import { db } from "../../../infrastructure/db/client.js";
import { users } from "../../../infrastructure/db/schema.js";
import type { GetCurrentUserQuery, GetCurrentUserResult } from "../types.js";

export async function getCurrentUser(query: GetCurrentUserQuery): Promise<GetCurrentUserResult> {
	try {
		// 型安全なDB操作（parseIntの例外処理不要）
		const [user] = await db.select().from(users).where(eq(users.id, query.userId)).limit(1);

		if (!user) {
			return {
				success: false,
				error: "ユーザーが見つかりません",
			};
		}

		return {
			success: true,
			user: {
				username: user.username,
				email: user.email,
				bio: user.bio || "", // デフォルト値（RealWorld仕様はrequired）
				image: user.image || "", // デフォルト値（RealWorld仕様はrequired）
				// 注意: tokenはルート層で既存JWTを設定
			},
		};
	} catch (error) {
		return {
			success: false,
			error: "ユーザー情報の取得に失敗しました",
		};
	}
}
