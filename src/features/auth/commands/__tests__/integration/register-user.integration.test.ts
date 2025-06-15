import { eq } from "drizzle-orm";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { db } from "../../../../../infrastructure/db/client.js";
import { users } from "../../../../../infrastructure/db/schema.js";
import {
	createTestUserData,
	ensureTestEnvironment,
	isDatabaseAvailable,
	setupTest,
} from "../../../../../shared/test/test-helpers.js";
import type { RegisterUserCommand } from "../../../types.js";
import { registerUser } from "../../register-user.js";

describe("registerUser Integration Tests", () => {
	beforeAll(async () => {
		// テスト環境の安全性チェック
		ensureTestEnvironment();
	});

	beforeEach(async () => {
		await setupTest();
	});

	it("実際のデータベースでユーザー登録が成功すること", async () => {
		// Arrange
		const testUserData = createTestUserData("int_ok");
		const command: RegisterUserCommand = testUserData;

		// Act
		const result = await registerUser(command);

		// Assert
		expect(result.success).toBe(true);
		expect(result.user).toBeDefined();
		expect(result.user?.username).toBe(testUserData.username);
		expect(result.user?.email).toBe(testUserData.email);
		expect(result.user?.bio).toBe(""); // デフォルト値
		expect(result.user?.image).toBe(""); // デフォルト値
		expect(result.user?.token).toBeDefined();
		expect(typeof result.user?.token).toBe("string");

		// データベースの確認
		const savedUser = await db.select().from(users).where(eq(users.username, testUserData.username)).limit(1);

		expect(savedUser).toHaveLength(1);
		expect(savedUser[0].email).toBe(testUserData.email);
		expect(savedUser[0].passwordHash).toBeDefined();
		expect(savedUser[0].passwordHash).not.toBe(testUserData.password); // ハッシュ化確認
		expect(savedUser[0].bio).toBe("");
		expect(savedUser[0].image).toBe("");
	});

	it("重複するユーザー名で登録が失敗すること", async () => {
		// Arrange - 既存ユーザー作成
		const existingUserData = createTestUserData("dup_user");
		await registerUser(existingUserData);

		// 同じユーザー名で異なるメールアドレス
		const duplicateCommand: RegisterUserCommand = {
			username: existingUserData.username, // 重複
			email: "different_test@test.example.com",
			password: "different_password_123",
		};

		// Act
		const result = await registerUser(duplicateCommand);

		// Assert
		expect(result.success).toBe(false);
		expect(result.error).toBe("ユーザー名は既に使用されています");
		expect(result.user).toBeUndefined();

		// データベースに新しいユーザーが保存されていないことを確認
		const users_count = await db.select().from(users).where(eq(users.email, "different_test@test.example.com"));
		expect(users_count).toHaveLength(0);
	});

	it("重複するメールアドレスで登録が失敗すること", async () => {
		// Arrange - 既存ユーザー作成
		const existingUserData = createTestUserData("dup_email");
		await registerUser(existingUserData);

		// 同じメールアドレスで異なるユーザー名
		const duplicateCommand: RegisterUserCommand = {
			username: "test_different_user",
			email: existingUserData.email, // 重複
			password: "different_password_123",
		};

		// Act
		const result = await registerUser(duplicateCommand);

		// Assert
		expect(result.success).toBe(false);
		expect(result.error).toBe("メールアドレスは既に使用されています");
		expect(result.user).toBeUndefined();

		// データベースに新しいユーザーが保存されていないことを確認
		const users_count = await db.select().from(users).where(eq(users.username, "test_different_user"));
		expect(users_count).toHaveLength(0);
	});

	it("パスワードが正しくハッシュ化されて保存されること", async () => {
		// Arrange
		const testUserData = createTestUserData("pw_hash");
		const command: RegisterUserCommand = testUserData;

		// Act
		const result = await registerUser(command);

		// Assert
		expect(result.success).toBe(true);

		// データベースからパスワードハッシュを確認
		const savedUser = await db.select().from(users).where(eq(users.username, testUserData.username)).limit(1);

		expect(savedUser).toHaveLength(1);
		expect(savedUser[0].passwordHash).toBeDefined();
		expect(savedUser[0].passwordHash).not.toBe(testUserData.password);
		expect(savedUser[0].passwordHash).toHaveLength(60); // bcryptハッシュ長
		expect(savedUser[0].passwordHash.startsWith("$2b$")).toBe(true); // bcryptフォーマット
	});

	it("トランザクション処理で操作がアトミックであること", async () => {
		// Arrange - 既存ユーザー作成（重複エラーを発生させる）
		const existingUserData = createTestUserData("tx_test");
		await registerUser(existingUserData);

		const duplicateCommand: RegisterUserCommand = {
			username: existingUserData.username, // 重複でエラー発生
			email: "new_test@test.example.com",
			password: "test_password_123",
		};

		// データベースの初期状態を確認
		const initialUserCount = await db.select().from(users);
		const initialCount = initialUserCount.length;

		// Act
		const result = await registerUser(duplicateCommand);

		// Assert
		expect(result.success).toBe(false);

		// トランザクションがロールバックされ、データベースの状態が変わっていないことを確認
		const finalUserCount = await db.select().from(users);
		expect(finalUserCount.length).toBe(initialCount);
	});
});
