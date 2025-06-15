# CLAUDE.md

## 技術スタック
- **Hono** + @hono/node-server (ポート3000)
- **TypeScript** ESNext/NodeNext、strict mode
- **PostgreSQL** + Drizzle ORM
- **Biome** (タブ、ダブルクォート)
- **VSA** (Vertical Slice Architecture) + 軽量CQRS

## 開発ルール
- コミット: Conventional Commits準拠、日本語
- npm run dev使用禁止
- TDDで実装
- Context7 MCPでライブラリ調査
- テスト名は日本語にする
- Parse, don't validate

### 型配置ルール（VSA）
- **共通型**: `src/shared/types/` (`Pagination`, `ApiResponse<T>`)
- **機能別型**: `src/features/[feature]/types.ts`
- 機能間依存を最小化

### 型安全性
- **any型禁止**: unknown、union型、型ガード使用
- strict mode有効

### Biome設定
- `noExplicitAny`: error
- `useNodejsImportProtocol`: error (`node:`必須)
- `noNonNullAssertion`: warn