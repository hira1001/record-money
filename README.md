# RecordMoney

**"Invisible Input, Visible Wealth."** (入力は透明に、資産は鮮明に)

AIを活用した次世代家計簿アプリ。レシートOCR、音声入力、メール自動取り込みで、入力の手間を最小限に抑えます。

## ✨ 主な機能

- 🤖 **AI OCR**: レシートを撮影するだけで自動入力
- 🎤 **音声入力**: 「ランチで800円」と話すだけで記録
- 📧 **メール自動取り込み**: 銀行・カード通知を自動で記録
- 📊 **美しいダッシュボード**: Bento Gridレイアウトで情報を整理
- 📈 **可視化**: 支出ヒートマップ、カテゴリ別分析
- 🔄 **Review Queue**: TinderライクなUIで自動入力データを承認

## 🚀 クイックスタート

### 開発環境のセットアップ

```bash
# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env.local
# .env.localを編集して環境変数を設定

# 開発サーバーの起動
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

### 必要な環境変数

`.env.local`ファイルに以下を設定してください：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
```

## 📦 技術スタック

- **Framework**: Next.js 16.1.1 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn/UI (Radix UI)
- **Animation**: Framer Motion
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini API (gemini-1.5-flash)
- **Icons**: Lucide React
- **Charts**: Recharts

## 🗄️ データベース設定

1. Supabaseダッシュボードにログイン
2. SQL Editorを開く
3. `supabase/schema.sql`の内容を実行
4. Google OAuthプロバイダーを有効化

詳細は `DEPLOYMENT_GUIDE.md` を参照してください。

## 🚀 本番環境へのデプロイ

### Vercelへのデプロイ（推奨）

1. GitHubリポジトリにプッシュ
2. [Vercel](https://vercel.com)でプロジェクトをインポート
3. 環境変数を設定
4. デプロイ実行

詳細な手順は `DEPLOYMENT_GUIDE.md` を参照してください。

## 📋 デプロイ前チェックリスト

- [ ] 環境変数が設定されている
- [ ] データベーススキーマが適用されている
- [ ] Google OAuthプロバイダーが有効化されている
- [ ] PWAアイコンが作成されている（`public/icons/`）
- [ ] ビルドが成功する（`npm run build`）

## 📚 ドキュメント

- [デプロイガイド](./DEPLOYMENT_GUIDE.md) - 本番環境へのデプロイ手順
- [プロダクションチェックリスト](./PRODUCTION_CHECKLIST.md) - デプロイ前の確認事項
- [テストレポート](./TEST_REPORT.md) - テスト結果の詳細
- [仕様書](./design_spec.md) - プロジェクトの設計仕様

## 🛠️ 開発

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 本番サーバー起動
npm start

# リンター実行
npm run lint
```

## 📄 ライセンス

Private

## 🙏 謝辞

このプロジェクトは以下の素晴らしいオープンソースプロジェクトを使用しています：

- [Next.js](https://nextjs.org)
- [Supabase](https://supabase.com)
- [Shadcn/UI](https://ui.shadcn.com)
- [Framer Motion](https://www.framer.com/motion/)

