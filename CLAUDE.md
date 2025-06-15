# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 技術スタック
- **Hono** + @hono/node-server (ポート3000)
- **TypeScript** ESNext/NodeNext、strict mode
- **PostgreSQL** + Drizzle ORM
- **Biome** (タブ、ダブルクォート)
- **VSA** (Vertical Slice Architecture) + 軽量CQRS

## コマンド

### 開発
```bash
# 開発サーバー起動 (npm run dev は使用禁止)
tsx src/index.ts

# ビルド
npm run build

# 本番起動
npm start
```

### テスト
```bash
# 全テスト実行 (テスト用DBの自動セットアップ含む)
npm test

# テスト監視モード
npm run test:watch

# 単体テストのみ (例: JWT utility)
npx vitest src/shared/utils/__tests__/jwt.test.ts

# 統合テストのみ (例: 認証ルート)
npx vitest src/features/auth/__tests__/routes.integration.test.ts
```

### データベース
```bash
# マイグレーション生成
npm run drizzle:generate

# マイグレーション実行
npm run drizzle:migrate

# Drizzle Studio起動
npm run drizzle:studio
```

### コード品質
```bash
# Lint実行
npm run lint

# Lint修正
npm run lint:fix

# フォーマット
npm run format

# 全チェック・修正
npm run check
```

## アーキテクチャ

### VSA (Vertical Slice Architecture) + 軽量CQRS
- **機能ベース分割**: `/src/features/[feature]/` で機能を完全に分離
- **コマンド**: `/src/features/[feature]/commands/` - 書き込み操作・ビジネスロジック
- **クエリ**: `/src/features/[feature]/queries/` - 読み込み操作・データ取得
- **独立性**: 各機能は独立しており、shared層のみに依存

### 認証アーキテクチャ
- **JWT認証**: RealWorld仕様準拠 (`Token xxx` 形式、`Bearer`ではない)
- **ミドルウェア**: `requireAuth()` (必須) / `optionalAuth()` (任意)
- **セキュリティ**: bcrypt (12 salt rounds) + 型安全なJWTペイロード

### データベース設計
- **Drizzle ORM**: 型安全・スキーマファースト
- **トランザクション**: コマンドでの一貫性保証
- **テスト分離**: 専用テストDB (ポート5433) で本番データ保護

### テストアーキテクチャ
- **TDD**: テストファースト開発必須
- **統合テスト**: 実DB使用、完全なE2Eフロー
- **単体テスト**: ユーティリティ・ロジック検証
- **並列実行**: 単体テストは並列、統合テストは直列

## 開発ルール
- **コミット**: Conventional Commits準拠、日本語
- **npm run dev使用禁止**: 直接 `tsx` 使用
- **TDDで実装**: テスト → 実装 → リファクタリング
- **Context7 MCPでライブラリ調査**: 新しいライブラリ導入時
- **テスト名は日本語**: 仕様の明確化
- **Parse, don't validate**: Zod使用の型安全バリデーション

### 型配置ルール（VSA）
- **共通型**: `src/shared/types/` (`Pagination`, `ApiResponse<T>`)
- **機能別型**: `src/features/[feature]/types.ts`
- **機能間依存を最小化**: shared層経由のみ

### 型安全性
- **any型禁止**: unknown、union型、型ガード使用
- **strict mode有効**: 最大限の型チェック
- **Drizzle型推論**: DBスキーマからの自動型生成

### Biome設定
- `noExplicitAny`: error
- `useNodejsImportProtocol`: error (`node:`必須)
- `noNonNullAssertion`: warn