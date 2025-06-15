import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { requireAuth } from "../../shared/middleware/auth.js";
import type { AuthVariables } from "../../shared/middleware/auth.js";
import { generateJWT, parseUserIdFromJWT } from "../../shared/utils/jwt.js";
import { loginUser } from "./commands/login-user.js";
import { registerUser } from "./commands/register-user.js";
import { getCurrentUser } from "./queries/get-current-user.js";
import { loginUserSchema, registerUserSchema } from "./schemas.js";

export const authRoutes = new Hono<{ Variables: AuthVariables }>();

// ユーザー登録
authRoutes.post("/users", zValidator("json", registerUserSchema), async (c) => {
	const { user } = c.req.valid("json");

	const result = await registerUser(user);

	if (!result.success) {
		return c.json({ errors: { body: [result.error] } }, 422);
	}

	return c.json({ user: result.user }, 201);
});

// ログイン
authRoutes.post("/users/login", zValidator("json", loginUserSchema), async (c) => {
	const { user } = c.req.valid("json");

	const result = await loginUser(user);

	if (!result.success) {
		return c.json({ errors: { body: [result.error] } }, 422);
	}

	return c.json({ user: result.user }, 200);
});

// 現在のユーザー取得
authRoutes.get("/user", requireAuth(), async (c) => {
	const payload = c.get("jwtPayload");

	if (!payload?.sub) {
		return c.json({ errors: { body: ["認証が必要です"] } }, 401);
	}

	// 型安全なID変換（JWT subはstring、DBはnumber）
	const userId = parseUserIdFromJWT(payload.sub);
	if (userId === null) {
		return c.json({ errors: { body: ["不正なユーザーIDです"] } }, 400);
	}

	const result = await getCurrentUser({ userId });

	if (!result.success) {
		return c.json({ errors: { body: [result.error] } }, 404);
	}

	// 既存JWTから新しいトークンを生成（RealWorld仕様：常にtokenを含む）
	const newToken = await generateJWT({
		sub: payload.sub,
		username: result.user?.username,
		email: result.user?.email,
	});

	return c.json(
		{
			user: {
				...result.user,
				token: newToken,
			},
		},
		200
	);
});
