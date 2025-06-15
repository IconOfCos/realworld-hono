import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true,
		environment: "node",
		env: {
			DATABASE_URL: "postgresql://test:test@localhost:5432/test",
			JWT_SECRET: "test-secret-key",
			NODE_ENV: "test",
		},
	},
	resolve: {
		alias: {
			"@": "/src",
		},
	},
});