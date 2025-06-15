import { describe, expect, it } from "vitest";
import {
	articleIdSchema,
	emailSchema,
	insertArticleSchema,
	insertCommentSchema,
	insertUserSchema,
	paginationSchema,
	slugSchema,
	updateUserSchema,
	userIdSchema,
	usernameSchema,
} from "../validation.js";

describe("userIdSchema", () => {
	it("正の整数を受け入れること", () => {
		expect(userIdSchema.parse(1)).toBe(1);
		expect(userIdSchema.parse(100)).toBe(100);
	});

	it("ゼロや負の値を拒否すること", () => {
		expect(() => userIdSchema.parse(0)).toThrow();
		expect(() => userIdSchema.parse(-1)).toThrow();
	});

	it("非数値を拒否すること", () => {
		expect(() => userIdSchema.parse("1")).toThrow();
		expect(() => userIdSchema.parse(null)).toThrow();
	});
});

describe("emailSchema", () => {
	it("有効なメールアドレスを受け入れること", () => {
		expect(emailSchema.parse("test@example.com")).toBe("test@example.com");
		expect(emailSchema.parse("user.name+tag@domain.co.jp")).toBe("user.name+tag@domain.co.jp");
	});

	it("無効なメールアドレスを拒否すること", () => {
		expect(() => emailSchema.parse("invalid-email")).toThrow();
		expect(() => emailSchema.parse("@example.com")).toThrow();
		expect(() => emailSchema.parse("test@")).toThrow();
	});
});

describe("slugSchema", () => {
	it("有効なスラッグを受け入れること", () => {
		expect(slugSchema.parse("hello-world")).toBe("hello-world");
		expect(slugSchema.parse("test123")).toBe("test123");
		expect(slugSchema.parse("a-b-c-123")).toBe("a-b-c-123");
	});

	it("無効なスラッグを拒否すること", () => {
		expect(() => slugSchema.parse("Hello-World")).toThrow(); // 大文字
		expect(() => slugSchema.parse("hello_world")).toThrow(); // アンダースコア
		expect(() => slugSchema.parse("hello world")).toThrow(); // スペース
		expect(() => slugSchema.parse("")).toThrow(); // 空文字
	});
});

describe("usernameSchema", () => {
	it("有効なユーザー名を受け入れること", () => {
		expect(usernameSchema.parse("user123")).toBe("user123");
		expect(usernameSchema.parse("test-user")).toBe("test-user");
		expect(usernameSchema.parse("user_name")).toBe("user_name");
	});

	it("無効なユーザー名を拒否すること", () => {
		expect(() => usernameSchema.parse("ab")).toThrow(); // 3文字未満
		expect(() => usernameSchema.parse("a".repeat(21))).toThrow(); // 20文字超過
		expect(() => usernameSchema.parse("user@name")).toThrow(); // 不正文字
		expect(() => usernameSchema.parse("user name")).toThrow(); // スペース
	});
});

describe("insertUserSchema", () => {
	it("有効なユーザーデータを受け入れること", () => {
		const validUser = {
			username: "testuser",
			email: "test@example.com",
			passwordHash: "hashedpassword123",
			bio: "テストユーザーです",
			image: "https://example.com/avatar.jpg",
		};

		expect(() => insertUserSchema.parse(validUser)).not.toThrow();
	});

	it("必須フィールドがない場合を拒否すること", () => {
		const invalidUser = {
			username: "testuser",
			// email missing
			passwordHash: "hashedpassword123",
		};

		expect(() => insertUserSchema.parse(invalidUser)).toThrow();
	});

	it("bioが500文字を超える場合を拒否すること", () => {
		const invalidUser = {
			username: "testuser",
			email: "test@example.com",
			passwordHash: "hashedpassword123",
			bio: "a".repeat(501),
		};

		expect(() => insertUserSchema.parse(invalidUser)).toThrow();
	});
});

describe("updateUserSchema", () => {
	it("部分的な更新データを受け入れること", () => {
		const partialUpdate = {
			bio: "更新された自己紹介",
		};

		expect(() => updateUserSchema.parse(partialUpdate)).not.toThrow();
	});

	it("空のオブジェクトを受け入れること", () => {
		expect(() => updateUserSchema.parse({})).not.toThrow();
	});
});

describe("insertArticleSchema", () => {
	it("有効な記事データを受け入れること", () => {
		const validArticle = {
			slug: "test-article",
			title: "テスト記事",
			description: "これはテスト記事です",
			body: "記事の本文です",
			authorId: 1,
		};

		expect(() => insertArticleSchema.parse(validArticle)).not.toThrow();
	});

	it("必須フィールドがない場合を拒否すること", () => {
		const invalidArticle = {
			slug: "test-article",
			title: "テスト記事",
			// description missing
			body: "記事の本文です",
			authorId: 1,
		};

		expect(() => insertArticleSchema.parse(invalidArticle)).toThrow();
	});
});

describe("insertCommentSchema", () => {
	it("有効なコメントデータを受け入れること", () => {
		const validComment = {
			body: "これはテストコメントです",
			authorId: 1,
			articleId: 1,
		};

		expect(() => insertCommentSchema.parse(validComment)).not.toThrow();
	});

	it("bodyが5000文字を超える場合を拒否すること", () => {
		const invalidComment = {
			body: "a".repeat(5001),
			authorId: 1,
			articleId: 1,
		};

		expect(() => insertCommentSchema.parse(invalidComment)).toThrow();
	});
});

describe("paginationSchema", () => {
	it("有効なページネーションパラメータを受け入れること", () => {
		const result = paginationSchema.parse({ limit: 10, offset: 20 });
		expect(result).toEqual({ limit: 10, offset: 20 });
	});

	it("デフォルト値を適用すること", () => {
		const result = paginationSchema.parse({});
		expect(result).toEqual({ limit: 20, offset: 0 });
	});

	it("文字列を数値に変換すること", () => {
		const result = paginationSchema.parse({ limit: "15", offset: "5" });
		expect(result).toEqual({ limit: 15, offset: 5 });
	});

	it("limitが100を超える場合を拒否すること", () => {
		expect(() => paginationSchema.parse({ limit: 101 })).toThrow();
	});

	it("負のoffsetを拒否すること", () => {
		expect(() => paginationSchema.parse({ offset: -1 })).toThrow();
	});
});
