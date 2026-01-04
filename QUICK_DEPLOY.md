# クイックデプロイガイド

## 🚀 5分でデプロイ

### Step 1: GitHubにプッシュ（2分）

```bash
# Gitリポジトリの初期化
git init
git add .
git commit -m "Initial commit: RecordMoney production ready"

# GitHubでリポジトリを作成後
git remote add origin https://github.com/your-username/record-money.git
git push -u origin main
```

### Step 2: Supabase設定（2分）

1. [Supabase](https://supabase.com)でプロジェクトを作成
2. SQL Editorで `supabase/schema.sql` を実行
3. Authentication > Providers でGoogle OAuthを有効化
4. Settings > API から以下をコピー：
   - Project URL
   - anon/public key

### Step 3: Vercelデプロイ（1分）

1. [Vercel](https://vercel.com)にログイン
2. 「Add New Project」→ GitHubリポジトリを選択
3. 環境変数を設定：
   ```
   NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
   GOOGLE_GENERATIVE_AI_API_KEY=<your-gemini-key>
   ```
4. 「Deploy」をクリック

### ✅ 完了！

デプロイが完了したら、提供されたURLでアクセスできます。

## 📝 詳細な手順

より詳細な手順は [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) を参照してください。

