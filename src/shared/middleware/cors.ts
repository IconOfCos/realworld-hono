import { cors } from "hono/cors";
import { config } from "../config/env.js";

export const corsMiddleware = () => {
	return cors({
		origin: config.cors.allowedOrigins,
		allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
		exposeHeaders: ["Content-Length", "X-Request-Id"],
		credentials: true,
		maxAge: 86400, // 24 hours
	});
};
