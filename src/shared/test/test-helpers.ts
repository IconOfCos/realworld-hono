import { sql } from "drizzle-orm";
import { db } from "../../infrastructure/db/client.js";
import { users } from "../../infrastructure/db/schema.js";

/**
 * テスト環境の安全性チェック
 * NODE_ENV=test でのみ実行可能にし、本番データベースの誤削除を防ぐ
 */
export function ensureTestEnvironment(): void {
	if (process.env.NODE_ENV !== "test") {
		throw new Error("統合テストはNODE_ENV=testでのみ実行可能");
	}

	const databaseUrl = process.env.DATABASE_URL || process.env.TEST_DATABASE_URL;
	if (!databaseUrl) {
		throw new Error("TEST_DATABASE_URL またはDATABASE_URLが設定されていません");
	}

	// 本番データベースURLの場合はエラー
	if (databaseUrl.includes("production") || databaseUrl.includes("prod")) {
		throw new Error("本番データベースでのテスト実行は禁止されています");
	}
}

/**
 * データベース接続チェック
 * 接続できない場合はfalseを返す
 */
export async function isDatabaseAvailable(): Promise<boolean> {
	try {
		await db.execute(sql`SELECT 1`);
		return true;
	} catch (error) {
		console.warn("データベースが利用できません:", error instanceof Error ? error.message : "Unknown error");
		return false;
	}
}

/**
 * テストデータベースのクリーンアップ
 * テスト専用データベースなので全データを削除
 */
export async function cleanupTestData(): Promise<void> {
	ensureTestEnvironment();

	try {
		// テスト専用DBなので全データを削除
		await db.delete(users);

		console.log("テストデータのクリーンアップが完了しました");
	} catch (error) {
		console.error("テストデータのクリーンアップに失敗しました:", error);
		throw error;
	}
}

/**
 * テスト用ユーザーデータの生成
 */
export function createTestUserData(suffix = "") {
	const timestamp = Date.now();
	// 短いサフィックスを使用してユーザー名の長さを制限
	const shortSuffix = suffix ? suffix.substring(0, 8) : timestamp.toString().slice(-6);

	return {
		username: `test_${shortSuffix}`,
		email: `test_${shortSuffix}@test.example.com`,
		password: "test_password_123",
	};
}

/**
 * テスト実行前のセットアップ
 */
export async function setupTest(): Promise<void> {
	ensureTestEnvironment();
	await cleanupTestData();
}

/**
 * テスト実行後のクリーンアップ
 */
export async function teardownTest(): Promise<void> {
	ensureTestEnvironment();
	await cleanupTestData();
}
