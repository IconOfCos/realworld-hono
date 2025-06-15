import { describe, expect, it } from "vitest";
import { articleTags, articles, comments, favorites, follows, tags, users } from "../schema.js";

describe("データベーススキーマ", () => {
	describe("Usersテーブル", () => {
		it("必須フィールドが存在する", () => {
			expect(users.id).toBeDefined();
			expect(users.username).toBeDefined();
			expect(users.email).toBeDefined();
			expect(users.passwordHash).toBeDefined();
			expect(users.createdAt).toBeDefined();
			expect(users.updatedAt).toBeDefined();
		});

		it("オプショナルフィールドが存在する", () => {
			expect(users.bio).toBeDefined();
			expect(users.image).toBeDefined();
		});
	});

	describe("Articlesテーブル", () => {
		it("必須フィールドが存在する", () => {
			expect(articles.id).toBeDefined();
			expect(articles.slug).toBeDefined();
			expect(articles.title).toBeDefined();
			expect(articles.description).toBeDefined();
			expect(articles.body).toBeDefined();
			expect(articles.authorId).toBeDefined();
			expect(articles.createdAt).toBeDefined();
			expect(articles.updatedAt).toBeDefined();
		});
	});

	describe("Commentsテーブル", () => {
		it("必須フィールドが存在する", () => {
			expect(comments.id).toBeDefined();
			expect(comments.body).toBeDefined();
			expect(comments.authorId).toBeDefined();
			expect(comments.articleId).toBeDefined();
			expect(comments.createdAt).toBeDefined();
			expect(comments.updatedAt).toBeDefined();
		});
	});

	describe("Tagsテーブル", () => {
		it("必須フィールドが存在する", () => {
			expect(tags.id).toBeDefined();
			expect(tags.name).toBeDefined();
			expect(tags.createdAt).toBeDefined();
		});
	});

	describe("リレーションテーブル", () => {
		it("article_tagsリレーションが定義されている", () => {
			expect(articleTags.articleId).toBeDefined();
			expect(articleTags.tagId).toBeDefined();
			expect(articleTags.createdAt).toBeDefined();
		});

		it("followsリレーションが定義されている", () => {
			expect(follows.followerId).toBeDefined();
			expect(follows.followingId).toBeDefined();
			expect(follows.createdAt).toBeDefined();
		});

		it("favoritesリレーションが定義されている", () => {
			expect(favorites.userId).toBeDefined();
			expect(favorites.articleId).toBeDefined();
			expect(favorites.createdAt).toBeDefined();
		});
	});
});
