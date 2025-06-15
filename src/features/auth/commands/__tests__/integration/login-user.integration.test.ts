import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
	createTestUserData,
	ensureTestEnvironment,
	isDatabaseAvailable,
	setupTest,
} from "../../../../../shared/test/test-helpers.js";
import { verifyJWT } from "../../../../../shared/utils/jwt.js";
import type { LoginUserCommand } from "../../../types.js";
import { loginUser } from "../../login-user.js";
import { registerUser } from "../../register-user.js";

describe("loginUser Integration Tests", () => {
	beforeAll(async () => {
		// テスト環境の安全性チェック
		ensureTestEnvironment();
	});

	beforeEach(async () => {
		await setupTest();
	});

	it("正しい認証情報でログインが成功すること", async () => {
		// Arrange - 事前にユーザーを登録
		const testUserData = createTestUserData("login_ok");
		const registerResult = await registerUser(testUserData);
		expect(registerResult.success).toBe(true);

		const loginCommand: LoginUserCommand = {
			email: testUserData.email,
			password: testUserData.password,
		};

		// Act
		const result = await loginUser(loginCommand);

		// Assert
		expect(result.success).toBe(true);
		expect(result.user).toBeDefined();
		expect(result.user?.username).toBe(testUserData.username);
		expect(result.user?.email).toBe(testUserData.email);
		expect(result.user?.bio).toBe(""); // デフォルト値
		expect(result.user?.image).toBe(""); // デフォルト値
		expect(result.user?.token).toBeDefined();
		expect(typeof result.user?.token).toBe("string");

		// JWT トークンの検証
		if (result.user?.token) {
			const payload = await verifyJWT(result.user.token);
			expect(payload.username).toBe(testUserData.username);
			expect(payload.email).toBe(testUserData.email);
			expect(payload.sub).toBeDefined();
		}
	});

	it("存在しないメールアドレスでログインが失敗すること", async () => {
		// Arrange
		const loginCommand: LoginUserCommand = {
			email: "nonexistent_test@test.example.com",
			password: "any_password_123",
		};

		// Act
		const result = await loginUser(loginCommand);

		// Assert
		expect(result.success).toBe(false);
		expect(result.error).toBe("メールアドレスまたはパスワードが間違っています");
		expect(result.user).toBeUndefined();
	});

	it("間違ったパスワードでログインが失敗すること", async () => {
		// Arrange - 事前にユーザーを登録
		const testUserData = createTestUserData("wrong_pw");
		const registerResult = await registerUser(testUserData);
		expect(registerResult.success).toBe(true);

		const loginCommand: LoginUserCommand = {
			email: testUserData.email,
			password: "wrong_pw_123", // 間違ったパスワード
		};

		// Act
		const result = await loginUser(loginCommand);

		// Assert
		expect(result.success).toBe(false);
		expect(result.error).toBe("メールアドレスまたはパスワードが間違っています");
		expect(result.user).toBeUndefined();
	});

	it("空のパスワードでログインが失敗すること", async () => {
		// Arrange - 事前にユーザーを登録
		const testUserData = createTestUserData("empty_pw");
		const registerResult = await registerUser(testUserData);
		expect(registerResult.success).toBe(true);

		const loginCommand: LoginUserCommand = {
			email: testUserData.email,
			password: "", // 空のパスワード
		};

		// Act
		const result = await loginUser(loginCommand);

		// Assert
		expect(result.success).toBe(false);
		expect(result.error).toBe("メールアドレスまたはパスワードが間違っています");
		expect(result.user).toBeUndefined();
	});

	it("大文字小文字を区別してメールアドレスが検証されること", async () => {
		// Arrange - 事前にユーザーを登録（小文字メール）
		const testUserData = createTestUserData("case_sens");
		testUserData.email = testUserData.email.toLowerCase(); // 確実に小文字
		const registerResult = await registerUser(testUserData);
		expect(registerResult.success).toBe(true);

		// 大文字でログイン試行
		const loginCommand: LoginUserCommand = {
			email: testUserData.email.toUpperCase(), // 大文字に変換
			password: testUserData.password,
		};

		// Act
		const result = await loginUser(loginCommand);

		// Assert
		// メールアドレスの大文字小文字が区別される場合は失敗
		// 通常のWebアプリケーションではcase-insensitiveだが、厳密な実装をテスト
		expect(result.success).toBe(false);
		expect(result.error).toBe("メールアドレスまたはパスワードが間違っています");
	});

	it("複数回の連続ログインでそれぞれ異なるJWTが生成されること", async () => {
		// Arrange - 事前にユーザーを登録
		const testUserData = createTestUserData("multi_log");
		const registerResult = await registerUser(testUserData);
		expect(registerResult.success).toBe(true);

		const loginCommand: LoginUserCommand = {
			email: testUserData.email,
			password: testUserData.password,
		};

		// Act - 複数回ログイン
		const result1 = await loginUser(loginCommand);
		await new Promise((resolve) => setTimeout(resolve, 1000)); // 1秒待機
		const result2 = await loginUser(loginCommand);

		// Assert
		expect(result1.success).toBe(true);
		expect(result2.success).toBe(true);
		expect(result1.user?.token).toBeDefined();
		expect(result2.user?.token).toBeDefined();
		expect(result1.user?.token).not.toBe(result2.user?.token); // 異なるトークン

		// 両方のトークンが有効であることを確認
		if (result1.user?.token && result2.user?.token) {
			const payload1 = await verifyJWT(result1.user.token);
			const payload2 = await verifyJWT(result2.user.token);

			expect(payload1.username).toBe(testUserData.username);
			expect(payload2.username).toBe(testUserData.username);
			expect(payload1.iat).not.toBe(payload2.iat); // 異なる発行時刻
		}
	});
});
