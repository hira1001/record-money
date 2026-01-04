# 本番環境デプロイガイド

## 🚀 デプロイ手順

### Step 1: リポジトリの準備

```bash
# Gitリポジトリの初期化（まだの場合）
git init
git add .
git commit -m "Initial commit: RecordMoney production ready"

# GitHubリポジトリを作成し、プッシュ
git remote add origin <your-github-repo-url>
git push -u origin main
```

### Step 2: Supabaseの設定

#### 2.1 データベーススキーマの適用

1. Supabaseダッシュボードにログイン
2. SQL Editorを開く
3. `supabase/schema.sql`の内容をコピー＆ペースト
4. 「Run」をクリックしてスキーマを適用

#### 2.2 Google OAuthプロバイダーの有効化

1. Supabaseダッシュボード > Authentication > Providers
2. Googleプロバイダーを有効化
3. Google Cloud ConsoleでOAuth 2.0クライアントIDを作成
4. Client IDとClient SecretをSupabaseに設定
5. Redirect URLを設定: `https://your-domain.com/auth/callback`

#### 2.3 環境変数の取得

Supabaseダッシュボード > Settings > API から以下を取得：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (Webhook用)

### Step 3: Vercelへのデプロイ

#### 3.1 Vercelプロジェクトの作成

1. [Vercel](https://vercel.com)にログイン
2. 「Add New Project」をクリック
3. GitHubリポジトリを選択
4. プロジェクト設定：
   - Framework Preset: Next.js
   - Root Directory: `./` (デフォルト)
   - Build Command: `npm run build` (自動検出)
   - Output Directory: `.next` (自動検出)

#### 3.2 環境変数の設定

Vercelダッシュボード > Settings > Environment Variables で以下を設定：

**必須環境変数:**
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-api-key
```

**オプション環境変数（Webhook機能用）:**
```
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
WEBHOOK_SECRET=your-webhook-secret
```

**注意**: 
- `NEXT_PUBLIC_`で始まる変数は自動的にクライアント側に公開されます
- 機密情報（Service Role Key等）は`NEXT_PUBLIC_`を付けないでください

#### 3.3 デプロイの実行

1. 「Deploy」をクリック
2. ビルドが完了するまで待機（通常2-5分）
3. デプロイが成功したら、提供されたURLでアクセス

### Step 4: PWAアイコンの追加

#### 4.1 アイコンファイルの作成

以下のサイズのアイコンを作成：
- `public/icons/icon-192.png` (192x192px)
- `public/icons/icon-512.png` (512x512px)

#### 4.2 アイコンの配置

```bash
# アイコンファイルを配置
cp icon-192.png public/icons/
cp icon-512.png public/icons/
```

#### 4.3 再デプロイ

アイコンを追加したら、Gitにコミットしてプッシュ：
```bash
git add public/icons/
git commit -m "Add PWA icons"
git push
```

Vercelが自動的に再デプロイします。

### Step 5: 動作確認

#### 5.1 基本機能の確認

- [ ] ログインページが表示される
- [ ] Google OAuthでログインできる
- [ ] ダッシュボードが表示される
- [ ] 取引の追加ができる
- [ ] OCR機能が動作する
- [ ] 音声入力が動作する（対応ブラウザのみ）

#### 5.2 エラーの確認

- [ ] ブラウザのコンソールにエラーがない
- [ ] ネットワークタブでAPIエラーがない
- [ ] エラーページが正しく表示される

### Step 6: カスタムドメインの設定（オプション）

1. Vercelダッシュボード > Settings > Domains
2. ドメインを追加
3. DNS設定を更新

## 🔧 トラブルシューティング

### ビルドエラー

**問題**: ビルドが失敗する

**解決策**:
1. ローカルで`npm run build`を実行してエラーを確認
2. 環境変数が正しく設定されているか確認
3. TypeScriptエラーがないか確認

### Google Fontsの読み込みエラー

**問題**: ビルド時に「Failed to fetch `Geist` from Google Fonts」エラーが発生

**解決策**:
- システムフォント(system-ui, Roboto等)をフォールバックとして使用
- Google Fontsへの依存を排除してビルドの信頼性を向上
- 現在のバージョンではシステムフォントを使用するため、この問題は解決済み

### Supabase環境変数エラー

**問題**: ビルド時に「Supabase credentials are required in production」エラー

**解決策**:
- ビルド時には環境変数が利用できない場合があります
- クライアント作成をビルド時とランタイムで分離
- `src/lib/supabase/client.ts`でビルド時はプレースホルダークライアントを返すように修正済み

### Supabase Admin APIエラー

**問題**: `getUserByEmail` メソッドが存在しない

**解決策**:
- Supabase JS v2では`getUserByEmail()`が廃止されました
- 代わりに`listUsers()`を使用してメールでフィルタリング
- `src/app/api/webhooks/ingest/route.ts`で修正済み

### 認証エラー

**問題**: Google OAuthでログインできない

**解決策**:
1. SupabaseでGoogleプロバイダーが有効化されているか確認
2. Redirect URLが正しく設定されているか確認
3. Google Cloud Consoleの設定を確認

### データベースエラー

**問題**: データが取得できない

**解決策**:
1. Supabaseでスキーマが正しく適用されているか確認
2. RLSポリシーが正しく設定されているか確認
3. 環境変数が正しく設定されているか確認

### APIエラー

**問題**: OCRやWebhookが動作しない

**解決策**:
1. `GOOGLE_GENERATIVE_AI_API_KEY`が正しく設定されているか確認
2. APIキーの有効期限を確認
3. レート制限に達していないか確認

## 📋 デプロイ後チェックリスト

- [ ] 環境変数が正しく設定されている
- [ ] データベーススキーマが適用されている
- [ ] Google OAuthが動作する
- [ ] 主要機能が動作する
- [ ] PWAアイコンが表示される
- [ ] エラーページが正しく表示される
- [ ] モバイル表示が正しい
- [ ] HTTPSが有効になっている

## 🔐 セキュリティチェック

- [ ] 環境変数が適切に管理されている
- [ ] Service Role Keyが公開されていない
- [ ] RLSポリシーが正しく設定されている
- [ ] セキュリティヘッダーが設定されている

## 📊 監視設定（推奨）

### Vercel Analytics
1. Vercelダッシュボード > Analytics
2. Web Analyticsを有効化

### エラートラッキング（Sentry等）
1. Sentryアカウントを作成
2. プロジェクトを設定
3. 環境変数に`SENTRY_DSN`を追加

## 🎉 デプロイ完了

デプロイが完了したら、以下を確認してください：

1. **動作確認**: すべての主要機能が動作することを確認
2. **パフォーマンス**: ページの読み込み速度を確認
3. **モバイル**: スマートフォンで動作を確認
4. **PWA**: ホーム画面に追加して動作を確認

問題があれば、Vercelのログを確認してトラブルシューティングを行ってください。

