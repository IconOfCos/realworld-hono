import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		// テスト環境の設定
		globals: true,
		environment: "node",
		env: {
			NODE_ENV: "test",
			// テスト用データベースURL
			DATABASE_URL: "postgresql://postgres-test:postgres-test@postgres-for-test:5432/realworld-test",
			JWT_SECRET: "test_jwt_secret_key_for_testing_only_do_not_use_in_production",
			ALLOWED_ORIGINS: "http://localhost:3000,http://localhost:4200",
			PORT: "3001",
			DB_MAX_CONNECTIONS: "5",
		},
		// テストファイルのパターン
		include: ["src/**/*.test.ts", "src/**/*.integration.test.ts"],
		// テストのタイムアウト設定（統合テストは時間がかかる可能性がある）
		testTimeout: 10000,
		// 統合テストのみ直列実行 (projects使用)
		projects: [
			{
				test: {
					name: "integration",
					include: ["src/**/*.integration.test.ts"],
					pool: "forks",
					poolOptions: {
						forks: {
							singleFork: true,
						},
					},
				},
			},
			{
				test: {
					name: "unit",
					include: ["src/**/*.test.ts"],
					exclude: ["src/**/*.integration.test.ts"],
					pool: "threads",
				},
			},
		],
		// セットアップファイル
		setupFiles: [],
	},
	resolve: {
		alias: {
			"@": "/src",
		},
	},
});
