# CLAUDE.md

HonoとTypeScriptを使用したWebアプリケーションプロジェクト

## コマンド

```bash
npm install     # 依存関係のインストール
npm run dev     # 開発サーバー起動（ホットリロード付き）
npm run build   # 本番ビルド
npm start       # 本番サーバー起動
```

## 構成

- **フレームワーク**: Hono + @hono/node-server
- **エントリポイント**: `src/index.ts` (ポート3000)
- **ビルド出力**: `./dist`
- **コードスタイル**: Biome（タブ、ダブルクォート）
- **TypeScript**: ESNext/NodeNext、strict mode、Hono JSX対応
- **アーキテクチャ**: VSA（Vertical Slice Architecture）
- **データベース**: PostgreSQL + Drizzle ORM
- **設計パターン**: 軽量なCQRSパターン（Command/Queryをディレクトリで分離）
- **ビジネスロジック**: 仕様パターンと戦略パターンを活用

## 開発ルール

- ユーザーから指摘されたことは確認せずにこのファイルのルールに追加する
- コミットメッセージはConventional Commitsに準拠する
- コミットメッセージは日本語で記述する

## 備考

- テストフレームワーク未設定
- RealWorldアプリケーションのスターターテンプレート