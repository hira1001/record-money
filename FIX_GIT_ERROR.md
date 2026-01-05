# Gitエラー修正手順

## 現在の状態
✅ ブランチ名: `main`（既に修正済み）
❌ リモートリポジトリ: 未設定

## 修正手順

### Step 1: GitHubリポジトリを作成

1. [GitHub](https://github.com/new)にアクセス
2. リポジトリ名を入力: `record-money`
3. PublicまたはPrivateを選択
4. **「Initialize this repository with a README」のチェックを外す**（重要）
5. 「Create repository」をクリック

### Step 2: リモートリポジトリを追加

GitHubでリポジトリを作成したら、以下のコマンドを実行：

```bash
cd /home/hira1001/Java/cursor/26/RecordMoney

# リモートリポジトリを追加（YOUR-USERNAMEを実際のGitHubユーザー名に置き換え）
git remote add origin https://github.com/YOUR-USERNAME/record-money.git

# リモートが正しく設定されたか確認
git remote -v
```

### Step 3: プッシュ

```bash
# mainブランチをプッシュ
git push -u origin main
```

## 認証について

### Personal Access Tokenを使用する場合

1. GitHub > Settings > Developer settings > Personal access tokens > Tokens (classic)
2. 「Generate new token」をクリック
3. `repo`スコープを選択
4. トークンをコピー
5. プッシュ時にパスワードの代わりにトークンを入力

### SSHを使用する場合

```bash
# SSH URLに変更
git remote set-url origin git@github.com:YOUR-USERNAME/record-money.git

# SSH鍵が設定されていることを確認
ssh -T git@github.com
```

## エラーが発生した場合

### リモートが既に存在する場合

```bash
# 既存のリモートを確認
git remote -v

# 既存のリモートを削除
git remote remove origin

# 新しいリモートを追加
git remote add origin https://github.com/YOUR-USERNAME/record-money.git
```

### 認証エラーの場合

```bash
# GitHub CLIを使用（推奨）
gh auth login

# または、Personal Access Tokenを使用
```

## 完了後の確認

プッシュが成功したら、GitHubのリポジトリページでファイルが表示されることを確認してください。


