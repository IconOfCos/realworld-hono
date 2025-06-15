# フェーズ2: Database Design & Implementation 完璧実装計画書

## 📋 概要

本計画書は、RealWorld Hono実装におけるフェーズ2「Database Design」の完璧な実装計画を定義します。VSA（Vertical Slice Architecture）+ 軽量CQRSアーキテクチャに基づき、Drizzle ORMとPostgreSQLを使用した型安全なデータベース層を構築します。

## 🎯 実装目標

### 主要目標
1. **Drizzle ORM完全セットアップ**: 型安全性を最大化したORM環境構築
2. **スキーマ完全定義**: RealWorld仕様に完全準拠したデータベーススキーマ
3. **マイグレーション管理**: バージョン管理された安全なマイグレーションシステム
4. **型安全性保証**: エンドツーエンドの型安全性確保
5. **VSA準拠**: Vertical Slice Architectureに完全準拠した構造

### 成功基準
- [ ] すべてのテーブルスキーマが正常に作成される
- [ ] 型安全性がコンパイル時に完全に保証される
- [ ] マイグレーションが冪等性を保つ
- [ ] 外部キー制約がすべて正しく設定される
- [ ] パフォーマンステストで基準値をクリア

## 🏗️ 現状分析

### ✅ 実装済み要素
- **基盤アーキテクチャ**: Hono + @hono/node-server
- **型システム**: TypeScript strict mode
- **コード品質**: Biome設定（タブ、ダブルクォート、noExplicitAny）
- **ミドルウェア**: CORS、認証、エラーハンドリング
- **設定管理**: 環境変数ベース設定システム

### ❌ 未実装要素
- **データベース接続**: PostgreSQLクライアント未設定
- **ORM**: Drizzle ORM未導入
- **スキーマ**: データベーススキーマ未定義
- **マイグレーション**: マイグレーションシステム未構築

## 📦 依存関係追加計画

### 必須パッケージ
```json
{
  "dependencies": {
    "drizzle-orm": "^0.33.0",
    "postgres": "^3.4.4",
    "@types/postgres": "^3.0.4"
  },
  "devDependencies": {
    "drizzle-kit": "^0.25.0"
  }
}
```

### パッケージ選定理由
- **drizzle-orm**: 最新安定版、型安全性最大化
- **postgres**: 軽量高性能PostgreSQLクライアント
- **drizzle-kit**: マイグレーション & スキーマ管理ツール

## 🏛️ アーキテクチャ設計

### ディレクトリ構造
```
src/
├── infrastructure/
│   └── db/
│       ├── schema.ts              # 全テーブルスキーマ定義
│       ├── client.ts              # データベース接続設定
│       ├── types.ts               # データベース型定義
│       └── migrations/            # マイグレーションファイル
│           ├── 0001_initial.sql
│           └── meta/
├── features/                      # VSA: 機能別スライス
│   ├── users/
│   │   ├── types.ts              # ユーザー機能専用型
│   │   └── queries/              # 将来のクエリ実装用
│   ├── articles/
│   │   ├── types.ts
│   │   └── queries/
│   └── ...
└── shared/
    ├── types/
    │   ├── database.ts           # 共通DB型
    │   └── pagination.ts        # ページネーション型
    └── config/
        └── database.ts           # DB設定
```

### VSA準拠型配置戦略
- **共通型**: `src/shared/types/database.ts`
- **機能別型**: `src/features/[feature]/types.ts`
- **インフラ型**: `src/infrastructure/db/types.ts`

## 📊 データベーススキーマ設計

### テーブル一覧
1. **users** - ユーザー情報
2. **articles** - 記事情報
3. **comments** - コメント情報
4. **tags** - タグマスター
5. **article_tags** - 記事タグ関連
6. **follows** - フォロー関係
7. **favorites** - お気に入り関係

### 詳細スキーマ定義

#### 1. Users テーブル
```typescript
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
```

#### 2. Articles テーブル
```typescript
export const articles = pgTable("articles", {
	id: serial("id").primaryKey(),
	slug: varchar("slug", { length: 255 }).notNull().unique(),
	title: varchar("title", { length: 255 }).notNull(),
	description: text("description").notNull(),
	body: text("body").notNull(),
	authorId: integer("author_id").references(() => users.id).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

#### 3. Comments テーブル
```typescript
export const comments = pgTable("comments", {
	id: serial("id").primaryKey(),
	body: text("body").notNull(),
	authorId: integer("author_id").references(() => users.id).notNull(),
	articleId: integer("article_id").references(() => articles.id).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

#### 4. Tags テーブル
```typescript
export const tags = pgTable("tags", {
	id: serial("id").primaryKey(),
	name: varchar("name", { length: 100 }).notNull().unique(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

#### 5. Article_Tags テーブル（多対多関係）
```typescript
export const articleTags = pgTable("article_tags", {
	articleId: integer("article_id").references(() => articles.id).notNull(),
	tagId: integer("tag_id").references(() => tags.id).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
	pk: primaryKey({ columns: [table.articleId, table.tagId] }),
}));
```

#### 6. Follows テーブル（多対多関係）
```typescript
export const follows = pgTable("follows", {
	followerId: integer("follower_id").references(() => users.id).notNull(),
	followingId: integer("following_id").references(() => users.id).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
	pk: primaryKey({ columns: [table.followerId, table.followingId] }),
	uniqueFollow: unique().on(table.followerId, table.followingId),
}));
```

#### 7. Favorites テーブル（多対多関係）
```typescript
export const favorites = pgTable("favorites", {
	userId: integer("user_id").references(() => users.id).notNull(),
	articleId: integer("article_id").references(() => articles.id).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
	pk: primaryKey({ columns: [table.userId, table.articleId] }),
}));
```

### リレーション定義
```typescript
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
```

## 🔄 マイグレーション戦略

### Drizzle Kit設定
```typescript
// drizzle.config.ts
import type { Config } from "drizzle-kit";

export default {
	schema: "./src/infrastructure/db/schema.ts",
	out: "./src/infrastructure/db/migrations",
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.DATABASE_URL!,
	},
	verbose: true,
	strict: true,
} satisfies Config;
```

### マイグレーション実行順序
1. **初期テーブル作成**: users, articles, comments, tags
2. **関連テーブル作成**: article_tags, follows, favorites
3. **インデックス作成**: パフォーマンス最適化用
4. **制約追加**: 外部キー制約、ユニーク制約

### マイグレーションコマンド
```bash
# スキーマ生成
npx drizzle-kit generate

# マイグレーション実行
npx drizzle-kit push

# スキーマ確認
npx drizzle-kit introspect
```

## 🔒 型安全性保証戦略

### 1. エンドツーエンド型安全性
```typescript
// 型安全なクエリ例
type UserWithArticles = typeof users.$inferSelect & {
	articles: (typeof articles.$inferSelect)[];
};

// 型安全なInsert
type NewUser = typeof users.$inferInsert;
type NewArticle = typeof articles.$inferInsert;
```

### 2. 型ガード実装
```typescript
// src/shared/types/database.ts
export function isValidUserId(id: unknown): id is number {
	return typeof id === "number" && id > 0;
}

export function isValidEmail(email: unknown): email is string {
	return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

### 3. Zod統合（将来実装）
```typescript
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
```

## 🧪 テスト戦略

### 1. ユニットテスト
- **対象**: スキーマ定義、型ガード関数
- **ツール**: Vitest
- **カバレッジ**: 100%目標

### 2. 統合テスト
- **対象**: データベース接続、マイグレーション
- **環境**: テスト専用PostgreSQLコンテナ
- **ツール**: Testcontainers

### 3. パフォーマンステスト
- **対象**: クエリパフォーマンス
- **基準値**: 
  - 単純SELECT: < 10ms
  - JOIN付きSELECT: < 50ms
  - INSERT/UPDATE: < 20ms

## 📈 パフォーマンス最適化

### インデックス戦略
```sql
-- ユーザー検索最適化
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- 記事検索最適化
CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_author_id ON articles(author_id);
CREATE INDEX idx_articles_created_at ON articles(created_at DESC);

-- タグ検索最適化
CREATE INDEX idx_article_tags_article_id ON article_tags(article_id);
CREATE INDEX idx_article_tags_tag_id ON article_tags(tag_id);

-- フォロー・お気に入り最適化
CREATE INDEX idx_follows_follower_id ON follows(follower_id);
CREATE INDEX idx_follows_following_id ON follows(following_id);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_article_id ON favorites(article_id);
```

### コネクションプール設定
```typescript
// src/infrastructure/db/client.ts
import postgres from "postgres";

export const sql = postgres(config.database.url, {
	max: config.database.maxConnections,
	idle_timeout: 20,
	connect_timeout: 10,
	transform: {
		undefined: null,
	},
});
```

## 🛡️ セキュリティ対策

### 1. SQL インジェクション対策
- Drizzle ORMの型安全クエリビルダー使用
- Raw SQLクエリの禁止
- パラメータバインディング必須

### 2. データベース接続セキュリティ
- SSL/TLS接続必須
- 接続文字列の環境変数管理
- 最小権限の原則適用

### 3. データバリデーション
- スキーマレベルでの制約設定
- アプリケーションレベルでの二重チェック
- 型ガードによる実行時検証

## 🔧 実装手順

### Phase 2.1: 環境セットアップ（1日目）
1. **依存関係追加**
   ```bash
   npm install drizzle-orm postgres @types/postgres
   npm install -D drizzle-kit
   ```

2. **設定ファイル作成**
   - `drizzle.config.ts`
   - `src/shared/config/database.ts`

3. **環境変数設定**
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/realworld
   DB_MAX_CONNECTIONS=20
   ```

### Phase 2.2: スキーマ定義（2日目）
1. **基本テーブルスキーマ作成**
   - `src/infrastructure/db/schema.ts`
   - users, articles, comments, tags テーブル

2. **関連テーブルスキーマ作成**
   - article_tags, follows, favorites テーブル
   - リレーション定義

3. **型定義エクスポート**
   - Insert型、Select型の定義
   - 共通型の整理

### Phase 2.3: データベース接続（3日目）
1. **クライアント設定**
   - `src/infrastructure/db/client.ts`
   - コネクションプール設定

2. **接続テスト**
   - ヘルスチェック機能追加
   - エラーハンドリング実装

3. **設定統合**
   - 既存の設定システムとの統合

### Phase 2.4: マイグレーション（4日目）
1. **初期マイグレーション生成**
   ```bash
   npx drizzle-kit generate
   ```

2. **マイグレーション実行**
   ```bash
   npx drizzle-kit push
   ```

3. **マイグレーション検証**
   - スキーマ確認
   - 制約確認

### Phase 2.5: テスト実装（5日目）
1. **ユニットテスト**
   - スキーマ定義テスト
   - 型ガードテスト

2. **統合テスト**
   - データベース接続テスト
   - CRUD操作テスト

3. **パフォーマンステスト**
   - クエリ性能測定
   - 負荷テスト

## 📋 品質保証チェックリスト

### コード品質
- [ ] Biome lintingエラーゼロ
- [ ] TypeScript型エラーゼロ
- [ ] テストカバレッジ100%
- [ ] パフォーマンス基準クリア

### データベース設計
- [ ] 正規化ルール遵守
- [ ] 外部キー制約完全設定
- [ ] インデックス最適配置
- [ ] セキュリティ対策完了

### アーキテクチャ準拠
- [ ] VSA原則遵守
- [ ] CQRS準拠
- [ ] 型安全性保証
- [ ] エラーハンドリング完全実装

## ⚠️ リスク分析と対策

### 技術的リスク
1. **マイグレーション失敗**
   - **対策**: バックアップ・復旧手順の準備
   - **回避策**: ステージング環境での事前検証

2. **パフォーマンス劣化**
   - **対策**: インデックス最適化
   - **監視**: APM導入によるパフォーマンス監視

3. **型安全性の破綻**
   - **対策**: 厳密な型ガード実装
   - **検証**: コンパイル時・実行時双方での検証

### 運用リスク
1. **データ破損**
   - **対策**: 定期バックアップ自動化
   - **復旧**: ポイントインタイム復旧手順

2. **接続障害**
   - **対策**: コネクションプール適切設定
   - **フォールバック**: 接続リトライ機能

## 🎯 成果物一覧

### 実装ファイル
- `src/infrastructure/db/schema.ts` - 完全なスキーマ定義
- `src/infrastructure/db/client.ts` - データベース接続設定
- `src/infrastructure/db/types.ts` - 型定義
- `src/shared/config/database.ts` - データベース設定
- `drizzle.config.ts` - Drizzlekit設定

### マイグレーションファイル
- `src/infrastructure/db/migrations/0001_initial.sql` - 初期スキーマ
- `src/infrastructure/db/migrations/meta/` - メタデータ

### テストファイル
- `src/infrastructure/db/__tests__/` - データベーステスト
- `src/shared/types/__tests__/` - 型テスト

### ドキュメント
- `docs/database-schema.md` - スキーマドキュメント
- `docs/migration-guide.md` - マイグレーションガイド

## 🚀 次フェーズへの準備

### フェーズ3（CRUD Operations）への引き継ぎ事項
1. **完成した型安全データベース層**
2. **実装済みスキーマとマイグレーション**
3. **パフォーマンス最適化済みインデックス**
4. **テスト環境とCI/CD設定**

### 技術的負債ゼロ目標
- 未実装機能なし
- 型安全性の隙間なし
- パフォーマンス問題なし
- セキュリティホールなし

---

**この計画書は、RealWorld Hono実装フェーズ2の完璧な成功を保証するための包括的なガイドラインです。すべての手順を慎重に実行し、品質保証チェックリストを確実にクリアすることで、堅牢で高性能なデータベース層を構築します。**