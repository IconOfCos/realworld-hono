import { describe, expect, it } from "vitest";
import type {
	AuthCommandResult,
	GetCurrentUserQuery,
	LoginUserCommand,
	RegisterUserCommand,
	UserAuthResponse,
} from "../types.js";

describe("Auth Types", () => {
	it("RegisterUserCommandの型定義が正しいこと", () => {
		const command: RegisterUserCommand = {
			username: "testuser",
			email: "test@example.com",
			password: "password123",
		};
		expect(command).toBeDefined();
	});

	it("LoginUserCommandの型定義が正しいこと", () => {
		const command: LoginUserCommand = {
			email: "test@example.com",
			password: "password123",
		};
		expect(command).toBeDefined();
	});

	it("AuthCommandResultの型定義が正しいこと", () => {
		const result: AuthCommandResult = {
			success: true,
			user: {
				username: "testuser",
				email: "test@example.com",
				bio: "",
				image: "",
				token: "jwt.token.here",
			},
		};
		expect(result.success).toBe(true);
	});

	it("GetCurrentUserQueryの型定義が正しいこと", () => {
		const query: GetCurrentUserQuery = {
			userId: 1,
		};
		expect(query.userId).toBe(1);
	});

	it("UserAuthResponseの型定義が正しいこと", () => {
		const user: UserAuthResponse = {
			username: "testuser",
			email: "test@example.com",
			bio: "",
			image: "",
			token: "jwt.token.here",
		};
		expect(user.username).toBe("testuser");
		expect(user.bio).toBe("");
		expect(user.image).toBe("");
	});
});
