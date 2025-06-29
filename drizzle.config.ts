import type { Config } from "drizzle-kit";

export default {
	schema: "./src/infrastructure/db/schema.ts",
	out: "./src/infrastructure/db/migrations",
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.DATABASE_URL || "postgresql://postgres:postgres@postgres:5432/realworld",
	},
	verbose: true,
	strict: true,
} satisfies Config;
