import type { Context, MiddlewareHandler, Next } from "hono";
import { jwt } from "hono/jwt";
import type { JwtVariables } from "hono/jwt";
import { config } from "../config/env.js";

export interface AuthUser {
	id: string;
	email: string;
	username: string;
}

export interface JwtPayload {
	sub?: string;
	email?: string;
	username?: string;
	iat?: number;
	exp?: number;
}

// 認証関連の型定義
export type AuthVariables = JwtVariables<JwtPayload> & {
	user?: AuthUser;
};

// JWT設定（config/env.tsから取得）
const JWT_SECRET = config.jwt.secret;

// 共通のトークン処理関数
const processAuthToken = async (
	c: Context<{ Variables: AuthVariables }>,
	next: Next,
	authHeader: string,
	isRequired: boolean
) => {
	const token = authHeader.substring(6);

	try {
		// より安全なアプローチ: 新しいRequestオブジェクトを作成
		const newHeaders = new Headers(c.req.raw.headers);
		newHeaders.set("Authorization", `Bearer ${token}`);
		const newRequest = new Request(c.req.raw, { headers: newHeaders });

		// 新しいRequestでコンテキストを更新（readonlyプロパティ対応）
		Object.defineProperty(c, "req", {
			value: { ...c.req, raw: newRequest },
			writable: false,
			configurable: true,
		});

		const jwtMiddleware = jwt({ secret: JWT_SECRET });
		await jwtMiddleware(c, next);
	} catch (error) {
		if (isRequired) {
			return c.json({ errors: { body: ["Invalid token"] } }, 401);
		}
		// 任意認証なので開発環境でのみ警告を出力
		if (process.env.NODE_ENV === "development") {
			console.warn("Optional auth failed:", error);
		}
		return next();
	}
};

// JWT必須認証ミドルウェア
export const requireAuth = (): MiddlewareHandler => {
	return async (c: Context<{ Variables: AuthVariables }>, next: Next) => {
		const authHeader = c.req.header("Authorization");

		if (!authHeader || !authHeader.startsWith("Token ")) {
			return c.json({ errors: { body: ["Invalid token format"] } }, 401);
		}

		return processAuthToken(c, next, authHeader, true);
	};
};

// JWT任意認証ミドルウェア
export const optionalAuth = (): MiddlewareHandler => {
	return async (c: Context<{ Variables: AuthVariables }>, next: Next) => {
		const authHeader = c.req.header("Authorization");

		if (!authHeader || !authHeader.startsWith("Token ")) {
			// 認証情報がない場合はそのまま通す
			return next();
		}

		return processAuthToken(c, next, authHeader, false);
	};
};

// ユーザー情報をコンテキストに注入するヘルパー
export const injectUser = () => {
	return async (c: Context<{ Variables: AuthVariables }>, next: Next) => {
		const payload = c.get("jwtPayload");

		if (payload?.sub) {
			// 実際の実装では、データベースからユーザー情報を取得
			// ここではペイロードから基本情報を抽出
			const user: AuthUser = {
				id: payload.sub,
				email: payload.email || "",
				username: payload.username || "",
			};
			c.set("user", user);
		}

		return next();
	};
};

// 現在のユーザーを取得するヘルパー
export const getCurrentUser = (c: Context<{ Variables: AuthVariables }>): AuthUser | undefined => {
	return c.get("user");
};

// ユーザーIDを取得するヘルパー
export const getCurrentUserId = (c: Context<{ Variables: AuthVariables }>): string | undefined => {
	const user = getCurrentUser(c);
	return user?.id;
};
