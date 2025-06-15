import { describe, expect, it } from "vitest";
import { loginUserSchema, registerUserSchema, updateUserSchema } from "../schemas.js";

describe("registerUserSchema", () => {
	it("有効な登録データを受け入れること", () => {
		const validData = {
			user: {
				username: "testuser",
				email: "test@example.com",
				password: "password123",
			},
		};

		expect(() => registerUserSchema.parse(validData)).not.toThrow();
	});

	it("ユーザー名が短すぎる場合を拒否すること", () => {
		const invalidData = {
			user: {
				username: "ab",
				email: "test@example.com",
				password: "password123",
			},
		};

		expect(() => registerUserSchema.parse(invalidData)).toThrow();
	});

	it("パスワードが短すぎる場合を拒否すること", () => {
		const invalidData = {
			user: {
				username: "testuser",
				email: "test@example.com",
				password: "short",
			},
		};

		expect(() => registerUserSchema.parse(invalidData)).toThrow();
	});

	it("無効なメールアドレスを拒否すること", () => {
		const invalidData = {
			user: {
				username: "testuser",
				email: "invalid-email",
				password: "password123",
			},
		};

		expect(() => registerUserSchema.parse(invalidData)).toThrow();
	});
});

describe("loginUserSchema", () => {
	it("有効なログインデータを受け入れること", () => {
		const validData = {
			user: {
				email: "test@example.com",
				password: "password123",
			},
		};

		expect(() => loginUserSchema.parse(validData)).not.toThrow();
	});

	it("パスワードが空の場合を拒否すること", () => {
		const invalidData = {
			user: {
				email: "test@example.com",
				password: "",
			},
		};

		expect(() => loginUserSchema.parse(invalidData)).toThrow();
	});

	it("無効なメールアドレスを拒否すること", () => {
		const invalidData = {
			user: {
				email: "invalid-email",
				password: "password123",
			},
		};

		expect(() => loginUserSchema.parse(invalidData)).toThrow();
	});
});

describe("updateUserSchema", () => {
	it("有効な更新データを受け入れること", () => {
		const validData = {
			user: {
				username: "newusername",
				email: "newemail@example.com",
				password: "newpassword123",
				bio: "新しい自己紹介",
				image: "https://example.com/new-avatar.jpg",
			},
		};

		expect(() => updateUserSchema.parse(validData)).not.toThrow();
	});

	it("部分的な更新データを受け入れること", () => {
		const validData = {
			user: {
				bio: "自己紹介のみ更新",
			},
		};

		expect(() => updateUserSchema.parse(validData)).not.toThrow();
	});

	it("空のimageフィールドを受け入れること", () => {
		const validData = {
			user: {
				image: "",
			},
		};

		expect(() => updateUserSchema.parse(validData)).not.toThrow();
	});

	it("無効なURLのimageフィールドを拒否すること", () => {
		const invalidData = {
			user: {
				image: "not-a-url",
			},
		};

		expect(() => updateUserSchema.parse(invalidData)).toThrow();
	});

	it("bioが500文字を超える場合を拒否すること", () => {
		const invalidData = {
			user: {
				bio: "a".repeat(501),
			},
		};

		expect(() => updateUserSchema.parse(invalidData)).toThrow();
	});
});
