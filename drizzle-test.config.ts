import type { Config } from "drizzle-kit";

export default {
	schema: "./src/infrastructure/db/schema.ts",
	out: "./src/infrastructure/db/migrations",
	dialect: "postgresql",
	dbCredentials: {
		url: "postgresql://postgres-test:postgres-test@postgres-for-test:5432/realworld-test",
	},
	verbose: true,
	strict: true,
} satisfies Config;
