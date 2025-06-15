import { config } from "./env.js";

export const databaseConfig = {
	url: config.DATABASE_URL,
	maxConnections: Number.parseInt(config.DB_MAX_CONNECTIONS || "20", 10),
	idleTimeout: 20,
	connectTimeout: 10,
} as const;
