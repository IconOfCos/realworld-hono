import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { authRoutes } from "./features/auth/routes.js";
import { config } from "./shared/config/env.js";
import { type AuthVariables, getCurrentUser, injectUser, optionalAuth, requireAuth } from "./shared/middleware/auth.js";
import { corsMiddleware } from "./shared/middleware/cors.js";
import { errorHandler, globalErrorHandler } from "./shared/middleware/error.js";
import { logger } from "./shared/utils/logger.js";
import { jsonResponse } from "./shared/utils/response.js";

const app = new Hono<{ Variables: AuthVariables }>();

// エラーハンドラーを設定
app.onError(errorHandler);

// グローバルミドルウェアの適用（順序重要）
app.use("*", corsMiddleware());
app.use("*", globalErrorHandler());

// 公開ルート
app.get("/", (c) => {
	return jsonResponse(c, {
		message: "RealWorld API",
		version: "1.0.0",
		timestamp: new Date().toISOString(),
	});
});

// 健康チェックエンドポイント
app.get("/health", (c) => {
	return jsonResponse(c, { status: "ok" });
});

// 認証任意のルート例
app.get("/api/profile", optionalAuth(), injectUser(), (c) => {
	const user = getCurrentUser(c);
	return jsonResponse(c, {
		authenticated: !!user,
		user: user || null,
	});
});

// APIルート用プレフィックス設定
const api = new Hono<{ Variables: AuthVariables }>();

// 認証ルートを追加
api.route("/", authRoutes);

app.route("/api", api);

serve(
	{
		fetch: app.fetch,
		port: config.app.port,
	},
	(info) => {
		logger.info(`🚀 Server is running on http://localhost:${info.port}`);
		logger.info(`📚 API Documentation: http://localhost:${info.port}/api`);
		logger.info(`💚 Health Check: http://localhost:${info.port}/health`);
	}
);
