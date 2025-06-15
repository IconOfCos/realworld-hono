import { sign, verify } from "hono/jwt";
import { config } from "../config/env.js";
import type { JwtPayload } from "../middleware/auth.js";

export async function generateJWT(payload: Omit<JwtPayload, "iat" | "exp">): Promise<string> {
	const now = Math.floor(Date.now() / 1000);
	const fullPayload = {
		...payload,
		iat: now,
		exp: now + 7 * 24 * 60 * 60, // 7日間有効
	};

	// Honoの公式仕様に従いアルゴリズムを明示的に指定
	return sign(fullPayload, config.jwt.secret, "HS256");
}

export async function verifyJWT(token: string): Promise<JwtPayload> {
	// 型安全性のためより厳密な型キャスト
	const verified = await verify(token, config.jwt.secret, "HS256");
	return verified as JwtPayload;
}

/**
 * JWT payloadのsubフィールド（string）をユーザーID（number）に安全に変換
 * @param sub JWT payload の sub フィールド
 * @returns 変換されたユーザーID、または null（変換失敗時）
 */
export function parseUserIdFromJWT(sub: string): number | null {
	const userId = Number.parseInt(sub, 10);
	if (Number.isNaN(userId) || userId <= 0) {
		return null;
	}
	return userId;
}
