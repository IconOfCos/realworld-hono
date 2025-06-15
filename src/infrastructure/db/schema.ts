import { relations } from "drizzle-orm";
import { integer, pgTable, primaryKey, serial, text, timestamp, unique, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
	id: serial("id").primaryKey(),
	username: varchar("username", { length: 255 }).notNull().unique(),
	email: varchar("email", { length: 255 }).notNull().unique(),
	passwordHash: varchar("password_hash", { length: 255 }).notNull(),
	bio: text("bio"),
	image: varchar("image", { length: 500 }),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const articles = pgTable("articles", {
	id: serial("id").primaryKey(),
	slug: varchar("slug", { length: 255 }).notNull().unique(),
	title: varchar("title", { length: 255 }).notNull(),
	description: text("description").notNull(),
	body: text("body").notNull(),
	authorId: integer("author_id")
		.references(() => users.id)
		.notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const comments = pgTable("comments", {
	id: serial("id").primaryKey(),
	body: text("body").notNull(),
	authorId: integer("author_id")
		.references(() => users.id)
		.notNull(),
	articleId: integer("article_id")
		.references(() => articles.id)
		.notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tags = pgTable("tags", {
	id: serial("id").primaryKey(),
	name: varchar("name", { length: 100 }).notNull().unique(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const articleTags = pgTable(
	"article_tags",
	{
		articleId: integer("article_id")
			.references(() => articles.id)
			.notNull(),
		tagId: integer("tag_id")
			.references(() => tags.id)
			.notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => ({
		pk: primaryKey({ columns: [table.articleId, table.tagId] }),
	})
);

export const follows = pgTable(
	"follows",
	{
		followerId: integer("follower_id")
			.references(() => users.id)
			.notNull(),
		followingId: integer("following_id")
			.references(() => users.id)
			.notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => ({
		pk: primaryKey({ columns: [table.followerId, table.followingId] }),
		uniqueFollow: unique().on(table.followerId, table.followingId),
	})
);

export const favorites = pgTable(
	"favorites",
	{
		userId: integer("user_id")
			.references(() => users.id)
			.notNull(),
		articleId: integer("article_id")
			.references(() => articles.id)
			.notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => ({
		pk: primaryKey({ columns: [table.userId, table.articleId] }),
	})
);

export const usersRelations = relations(users, ({ many }) => ({
	articles: many(articles),
	comments: many(comments),
	followers: many(follows, { relationName: "followers" }),
	following: many(follows, { relationName: "following" }),
	favorites: many(favorites),
}));

export const articlesRelations = relations(articles, ({ one, many }) => ({
	author: one(users, {
		fields: [articles.authorId],
		references: [users.id],
	}),
	comments: many(comments),
	articleTags: many(articleTags),
	favorites: many(favorites),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
	author: one(users, {
		fields: [comments.authorId],
		references: [users.id],
	}),
	article: one(articles, {
		fields: [comments.articleId],
		references: [articles.id],
	}),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
	articleTags: many(articleTags),
}));

export const articleTagsRelations = relations(articleTags, ({ one }) => ({
	article: one(articles, {
		fields: [articleTags.articleId],
		references: [articles.id],
	}),
	tag: one(tags, {
		fields: [articleTags.tagId],
		references: [tags.id],
	}),
}));

export const followsRelations = relations(follows, ({ one }) => ({
	follower: one(users, {
		fields: [follows.followerId],
		references: [users.id],
		relationName: "followers",
	}),
	following: one(users, {
		fields: [follows.followingId],
		references: [users.id],
		relationName: "following",
	}),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
	user: one(users, {
		fields: [favorites.userId],
		references: [users.id],
	}),
	article: one(articles, {
		fields: [favorites.articleId],
		references: [articles.id],
	}),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;
export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
