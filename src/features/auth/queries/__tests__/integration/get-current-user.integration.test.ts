import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
	createTestUserData,
	ensureTestEnvironment,
	isDatabaseAvailable,
	setupTest,
} from "../../../../../shared/test/test-helpers.js";
import { parseUserIdFromJWT, verifyJWT } from "../../../../../shared/utils/jwt.js";
import { registerUser } from "../../../commands/register-user.js";
import type { GetCurrentUserQuery } from "../../../types.js";
import { getCurrentUser } from "../../get-current-user.js";

describe("getCurrentUser Integration Tests", () => {
	beforeAll(async () => {
		// テスト環境の安全性チェック
		ensureTestEnvironment();
	});

	beforeEach(async () => {
		await setupTest();
	});

	it("有効なユーザーIDで現在のユーザー情報を取得できること", async () => {
		// Arrange - 事前にユーザーを登録
		const testUserData = createTestUserData("get_cur");
		const registerResult = await registerUser(testUserData);
		expect(registerResult.success).toBe(true);

		// JWTからユーザーIDを取得
		expect(registerResult.user).toBeDefined();
		const token = registerResult.user?.token;
		expect(token).toBeDefined();

		const payload = await verifyJWT(token as string);
		expect(payload.sub).toBeDefined();

		const userId = parseUserIdFromJWT(payload.sub as string);
		expect(userId).not.toBeNull();

		const query: GetCurrentUserQuery = {
			userId: userId as number,
		};

		// Act
		const result = await getCurrentUser(query);

		// Assert
		expect(result.success).toBe(true);
		expect(result.user).toBeDefined();
		expect(result.user?.username).toBe(testUserData.username);
		expect(result.user?.email).toBe(testUserData.email);
		expect(result.user?.bio).toBe(""); // デフォルト値
		expect(result.user?.image).toBe(""); // デフォルト値
		// 注意: getCurrentUserはtokenを返さない（ルート層で追加される）
		expect(result.user).not.toHaveProperty("token");
	});

	it("存在しないユーザーIDで取得が失敗すること", async () => {
		// Arrange
		const nonExistentUserId = 999999; // 存在しないID
		const query: GetCurrentUserQuery = {
			userId: nonExistentUserId,
		};

		// Act
		const result = await getCurrentUser(query);

		// Assert
		expect(result.success).toBe(false);
		expect(result.error).toBe("ユーザーが見つかりません");
		expect(result.user).toBeUndefined();
	});

	it("無効なユーザーID（0以下）で取得が失敗すること", async () => {
		// Arrange
		const invalidUserId = 0;
		const query: GetCurrentUserQuery = {
			userId: invalidUserId,
		};

		// Act
		const result = await getCurrentUser(query);

		// Assert
		expect(result.success).toBe(false);
		expect(result.error).toBe("ユーザーが見つかりません");
		expect(result.user).toBeUndefined();
	});

	it("負のユーザーIDで取得が失敗すること", async () => {
		// Arrange
		const negativeUserId = -1;
		const query: GetCurrentUserQuery = {
			userId: negativeUserId,
		};

		// Act
		const result = await getCurrentUser(query);

		// Assert
		expect(result.success).toBe(false);
		expect(result.error).toBe("ユーザーが見つかりません");
		expect(result.user).toBeUndefined();
	});

	it("ユーザー情報の完全性が保たれること", async () => {
		// Arrange - カスタムデータでユーザーを登録
		const testUserData = createTestUserData("data_int");
		const registerResult = await registerUser(testUserData);
		expect(registerResult.success).toBe(true);

		// JWTからユーザーIDを取得
		expect(registerResult.user).toBeDefined();
		const token = registerResult.user?.token;
		expect(token).toBeDefined();

		const payload = await verifyJWT(token as string);
		expect(payload.sub).toBeDefined();

		const userId = parseUserIdFromJWT(payload.sub as string);
		expect(userId).not.toBeNull();

		const query: GetCurrentUserQuery = {
			userId: userId as number,
		};

		// Act
		const result = await getCurrentUser(query);

		// Assert - データの完全性確認
		expect(result.success).toBe(true);
		expect(result.user).toBeDefined();

		const user = result.user as NonNullable<typeof result.user>;
		expect(user.username).toBe(testUserData.username);
		expect(user.email).toBe(testUserData.email);
		expect(user.bio).toBe(""); // デフォルト値
		expect(user.image).toBe(""); // デフォルト値

		// 型安全性の確認
		expect(typeof user.username).toBe("string");
		expect(typeof user.email).toBe("string");
		expect(typeof user.bio).toBe("string");
		expect(typeof user.image).toBe("string");

		// 必須フィールドが空でないことを確認
		expect(user.username.length).toBeGreaterThan(0);
		expect(user.email.length).toBeGreaterThan(0);
		expect(user.email).toContain("@"); // 有効なメール形式
	});

	it("複数ユーザーが登録されている場合に正しいユーザーを取得できること", async () => {
		// Arrange - 複数のユーザーを登録
		const user1Data = createTestUserData("user1");
		const user2Data = createTestUserData("user2");

		const register1 = await registerUser(user1Data);
		const register2 = await registerUser(user2Data);

		expect(register1.success).toBe(true);
		expect(register2.success).toBe(true);

		// 各ユーザーのIDを取得
		expect(register1.user).toBeDefined();
		expect(register2.user).toBeDefined();

		const token1 = register1.user?.token;
		const token2 = register2.user?.token;
		expect(token1).toBeDefined();
		expect(token2).toBeDefined();

		const payload1 = await verifyJWT(token1 as string);
		const payload2 = await verifyJWT(token2 as string);
		expect(payload1.sub).toBeDefined();
		expect(payload2.sub).toBeDefined();

		const userId1 = parseUserIdFromJWT(payload1.sub as string);
		const userId2 = parseUserIdFromJWT(payload2.sub as string);
		expect(userId1).not.toBeNull();
		expect(userId2).not.toBeNull();

		// Act - 各ユーザーの情報を取得
		const result1 = await getCurrentUser({ userId: userId1 as number });
		const result2 = await getCurrentUser({ userId: userId2 as number });

		// Assert - 正しいユーザー情報が取得されること
		expect(result1.success).toBe(true);
		expect(result2.success).toBe(true);

		expect(result1.user?.username).toBe(user1Data.username);
		expect(result1.user?.email).toBe(user1Data.email);

		expect(result2.user?.username).toBe(user2Data.username);
		expect(result2.user?.email).toBe(user2Data.email);

		// 異なるユーザーの情報が混在していないことを確認
		expect(result1.user?.username).not.toBe(result2.user?.username);
		expect(result1.user?.email).not.toBe(result2.user?.email);
	});
});
