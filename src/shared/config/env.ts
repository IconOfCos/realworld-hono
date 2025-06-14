export const config = {
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
