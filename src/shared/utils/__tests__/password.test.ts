import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "../password.js";

describe("Password Utils", () => {
	it("パスワードがハッシュ化されること", async () => {
		const password = "password123";
		const hash = await hashPassword(password);

		expect(hash).not.toBe(password);
		expect(hash).toHaveLength(60); // bcrypt hash length
	});

	it("正しいパスワードで検証が成功すること", async () => {
		const password = "password123";
		const hash = await hashPassword(password);

		const isValid = await verifyPassword(password, hash);
		expect(isValid).toBe(true);
	});

	it("間違ったパスワードで検証が失敗すること", async () => {
		const password = "password123";
		const wrongPassword = "wrongpassword";
		const hash = await hashPassword(password);

		const isValid = await verifyPassword(wrongPassword, hash);
		expect(isValid).toBe(false);
	});
});
