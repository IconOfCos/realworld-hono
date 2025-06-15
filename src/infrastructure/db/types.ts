import type { Article, Comment, NewArticle, NewComment, NewTag, NewUser, Tag, User } from "./schema.js";
import { emailSchema, slugSchema, userIdSchema } from "./validation.js";

export type { User, NewUser, Article, NewArticle, Comment, NewComment, Tag, NewTag };

export type UserWithArticles = User & {
	articles: Article[];
};

export type ArticleWithAuthor = Article & {
	author: User;
};

export type CommentWithAuthor = Comment & {
	author: User;
};

export function isValidUserId(id: unknown): id is number {
	return userIdSchema.safeParse(id).success;
}

export function isValidEmail(email: unknown): email is string {
	return emailSchema.safeParse(email).success;
}

export function isValidSlug(slug: unknown): slug is string {
	return slugSchema.safeParse(slug).success;
}
