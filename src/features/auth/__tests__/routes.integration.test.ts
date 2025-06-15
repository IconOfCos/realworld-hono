import { Hono } from "hono";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createTestUserData, ensureTestEnvironment, setupTest } from "../../../shared/test/test-helpers.js";
import { authRoutes } from "../routes.js";

const app = new Hono();
app.route("/api", authRoutes);

describe("Auth Routes Integration Tests", () => {
	beforeAll(async () => {
		// テスト環境の安全性チェック
		ensureTestEnvironment();
	});

	beforeEach(async () => {
		await setupTest();
	});

	describe("POST /api/users", () => {
		it("ユーザー登録が成功すること", async () => {
			// Arrange
			const testUserData = createTestUserData("register");
			const requestBody = {
				user: testUserData,
			};

			// Act
			const response = await app.request("/api/users", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(requestBody),
			});

			// Assert
			if (response.status !== 201) {
				const errorBody = await response.text();
				console.error(`Response status: ${response.status}`);
				console.error(`Response body: ${errorBody}`);
			}
			expect(response.status).toBe(201);
			const body = await response.json();
			expect(body.user).toBeDefined();
			expect(body.user.username).toBe(testUserData.username);
			expect(body.user.email).toBe(testUserData.email);
			expect(body.user.bio).toBe(""); // デフォルト値
			expect(body.user.image).toBe(""); // デフォルト値
			expect(body.user.token).toBeDefined();
			expect(typeof body.user.token).toBe("string");

			// パスワードが返されていないことを確認（セキュリティ）
			expect(body.user).not.toHaveProperty("password");
			expect(body.user).not.toHaveProperty("passwordHash");
		});

		it("バリデーションエラーが正しく返されること", async () => {
			// Arrange
			const requestBody = {
				user: {
					username: "ab", // 短すぎる（3文字未満）
					email: "invalid-email", // 無効なメール形式
					password: "short", // 短すぎる（8文字未満）
				},
			};

			// Act
			const response = await app.request("/api/users", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(requestBody),
			});

			// Assert
			expect(response.status).toBe(400); // zodバリデーションエラー
			const body = await response.json();
			expect(body.success).toBe(false);
			expect(body.error).toBeDefined();
		});

		it("重複ユーザー名で422エラーが返されること", async () => {
			// Arrange - 既存ユーザー作成
			const existingUserData = createTestUserData("dup_test");
			const existingUserBody = { user: existingUserData };

			await app.request("/api/users", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(existingUserBody),
			});

			// 重複するユーザー名で新規登録試行
			const duplicateUserData = {
				username: existingUserData.username, // 重複
				email: "different_test@test.example.com",
				password: "different_password_123",
			};
			const requestBody = { user: duplicateUserData };

			// Act
			const response = await app.request("/api/users", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(requestBody),
			});

			// Assert
			expect(response.status).toBe(422);
			const body = await response.json();
			expect(body.errors).toBeDefined();
			expect(body.errors.body).toContain("ユーザー名は既に使用されています");
		});

		it("不正なJSONで400エラーが返されること", async () => {
			// Act
			const response = await app.request("/api/users", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: "{ invalid json }",
			});

			// Assert
			expect(response.status).toBe(400);
		});
	});

	describe("POST /api/users/login", () => {
		it("ログインが成功すること", async () => {
			// Arrange - 事前にユーザーを作成
			const testUserData = createTestUserData("login_ok");
			const registerBody = { user: testUserData };

			const registerResponse = await app.request("/api/users", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(registerBody),
			});
			expect(registerResponse.status).toBe(201);

			const loginBody = {
				user: {
					email: testUserData.email,
					password: testUserData.password,
				},
			};

			// Act
			const response = await app.request("/api/users/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(loginBody),
			});

			// Assert
			expect(response.status).toBe(200);
			const body = await response.json();
			expect(body.user).toBeDefined();
			expect(body.user.username).toBe(testUserData.username);
			expect(body.user.email).toBe(testUserData.email);
			expect(body.user.bio).toBe(""); // デフォルト値
			expect(body.user.image).toBe(""); // デフォルト値
			expect(body.user.token).toBeDefined();
			expect(typeof body.user.token).toBe("string");
		});

		it("間違った認証情報で422エラーが返されること", async () => {
			// Arrange
			const loginBody = {
				user: {
					email: "nonexistent_test@test.example.com",
					password: "wrong_password_123",
				},
			};

			// Act
			const response = await app.request("/api/users/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(loginBody),
			});

			// Assert
			expect(response.status).toBe(422);
			const body = await response.json();
			expect(body.errors).toBeDefined();
			expect(body.errors.body).toContain("メールアドレスまたはパスワードが間違っています");
		});

		it("バリデーションエラーが正しく返されること", async () => {
			// Arrange
			const loginBody = {
				user: {
					email: "invalid-email", // 無効なメール形式
					password: "", // 空のパスワード
				},
			};

			// Act
			const response = await app.request("/api/users/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(loginBody),
			});

			// Assert
			expect(response.status).toBe(400); // zodバリデーションエラー
			const body = await response.json();
			expect(body.success).toBe(false);
			expect(body.error).toBeDefined();
		});
	});

	describe("GET /api/user", () => {
		it("認証済みユーザーの情報を取得できること", async () => {
			// Arrange - ユーザー作成とトークン取得
			const testUserData = createTestUserData("auth_ok");
			const registerBody = { user: testUserData };

			const registerResponse = await app.request("/api/users", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(registerBody),
			});
			expect(registerResponse.status).toBe(201);

			const { user } = await registerResponse.json();
			const token = user.token;

			// Act
			const response = await app.request("/api/user", {
				method: "GET",
				headers: {
					Authorization: `Token ${token}`,
					"Content-Type": "application/json",
				},
			});

			// Assert
			expect(response.status).toBe(200);
			const body = await response.json();
			expect(body.user).toBeDefined();
			expect(body.user.username).toBe(testUserData.username);
			expect(body.user.email).toBe(testUserData.email);
			expect(body.user.bio).toBe(""); // デフォルト値
			expect(body.user.image).toBe(""); // デフォルト値
			expect(body.user.token).toBeDefined(); // 新しいトークンが生成される
			expect(typeof body.user.token).toBe("string");
		});

		it("認証なしでアクセスすると401エラーが返されること", async () => {
			// Act
			const response = await app.request("/api/user", {
				method: "GET",
				headers: { "Content-Type": "application/json" },
			});

			// Assert
			expect(response.status).toBe(401);
			const body = await response.json();
			expect(body.errors).toBeDefined();
			expect(body.errors.body).toContain("Invalid token format");
		});

		it("無効なトークンでアクセスすると401エラーが返されること", async () => {
			// Act
			const response = await app.request("/api/user", {
				method: "GET",
				headers: {
					Authorization: "Token invalid_token_here",
					"Content-Type": "application/json",
				},
			});

			// Assert
			expect(response.status).toBe(401);
			const body = await response.json();
			expect(body.errors).toBeDefined();
			expect(body.errors.body).toContain("Invalid token");
		});

		it("Bearer形式のトークンでアクセスすると401エラーが返されること", async () => {
			// Arrange - 正しいトークンを取得
			const testUserData = createTestUserData("bearer");
			const registerBody = { user: testUserData };

			const registerResponse = await app.request("/api/users", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(registerBody),
			});
			const { user } = await registerResponse.json();
			const token = user.token;

			// Act - Bearer形式で送信（RealWorldはToken形式必須）
			const response = await app.request("/api/user", {
				method: "GET",
				headers: {
					Authorization: `Bearer ${token}`, // 間違った形式
					"Content-Type": "application/json",
				},
			});

			// Assert
			expect(response.status).toBe(401);
			const body = await response.json();
			expect(body.errors).toBeDefined();
			expect(body.errors.body).toContain("Invalid token format");
		});
	});

	describe("E2E認証フロー", () => {
		it("登録→ログイン→ユーザー情報取得の完全なフローが動作すること", async () => {
			// Step 1: ユーザー登録
			const testUserData = createTestUserData("e2e");
			const registerBody = { user: testUserData };

			const registerResponse = await app.request("/api/users", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(registerBody),
			});
			expect(registerResponse.status).toBe(201);
			const registerData = await registerResponse.json();

			// Step 2: ログイン
			const loginBody = {
				user: {
					email: testUserData.email,
					password: testUserData.password,
				},
			};

			const loginResponse = await app.request("/api/users/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(loginBody),
			});
			expect(loginResponse.status).toBe(200);
			const loginData = await loginResponse.json();

			// Step 3: 現在のユーザー情報取得
			const currentUserResponse = await app.request("/api/user", {
				method: "GET",
				headers: {
					Authorization: `Token ${loginData.user.token}`,
					"Content-Type": "application/json",
				},
			});
			expect(currentUserResponse.status).toBe(200);
			const currentUserData = await currentUserResponse.json();

			// Assert - 全ステップで一貫したユーザー情報
			expect(registerData.user.username).toBe(testUserData.username);
			expect(loginData.user.username).toBe(testUserData.username);
			expect(currentUserData.user.username).toBe(testUserData.username);

			expect(registerData.user.email).toBe(testUserData.email);
			expect(loginData.user.email).toBe(testUserData.email);
			expect(currentUserData.user.email).toBe(testUserData.email);

			// トークンは各ステップで生成される（セキュリティ）
			expect(registerData.user.token).toBeDefined();
			expect(loginData.user.token).toBeDefined();
			expect(currentUserData.user.token).toBeDefined();
		});
	});
});
