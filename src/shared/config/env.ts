export const config = {
	DATABASE_URL:
		process.env.DATABASE_URL ||
		(() => {
			throw new Error("DATABASE_URL is required");
		})(),
	DB_MAX_CONNECTIONS: process.env.DB_MAX_CONNECTIONS || "20",
	jwt: {
		secret:
			process.env.JWT_SECRET ||
			(() => {
				throw new Error("JWT_SECRET is required");
			})(),
	},
	cors: {
		allowedOrigins:
			process.env.ALLOWED_ORIGINS?.split(",").map((origin) => origin.trim()) ||
			(process.env.NODE_ENV === "development"
				? ["http://localhost:3000", "http://localhost:4200"]
				: ["https://production-domain.com"]),
	},
	app: {
		port: Number(process.env.PORT) || 3000,
		nodeEnv: process.env.NODE_ENV || "development",
	},
} as const;
