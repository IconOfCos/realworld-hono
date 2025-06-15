import { describe, expect, it } from "vitest";
import { generateJWT, parseUserIdFromJWT, verifyJWT } from "../jwt.js";

describe("JWT Utils", () => {
	it("JWTが生成されること", async () => {
		const payload = {
			sub: "1",
			username: "testuser",
			email: "test@example.com",
		};

		const token = await generateJWT(payload);
		expect(token).toBeDefined();
		expect(typeof token).toBe("string");
	});

	it("JWTが検証されること", async () => {
		const payload = {
			sub: "1",
			username: "testuser",
			email: "test@example.com",
		};

		const token = await generateJWT(payload);
		const verified = await verifyJWT(token);

		expect(verified.sub).toBe("1");
		expect(verified.username).toBe("testuser");
		expect(verified.email).toBe("test@example.com");
	});

	it("有効なsubをユーザーIDに変換できること", () => {
		expect(parseUserIdFromJWT("1")).toBe(1);
		expect(parseUserIdFromJWT("123")).toBe(123);
	});

	it("無効なsubはnullを返すこと", () => {
		expect(parseUserIdFromJWT("invalid")).toBeNull();
		expect(parseUserIdFromJWT("0")).toBeNull();
		expect(parseUserIdFromJWT("-1")).toBeNull();
		expect(parseUserIdFromJWT("")).toBeNull();
	});
});
