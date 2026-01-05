# Git設定ガイド

## エラー修正手順

### 問題
- ブランチ名が`master`になっている
- リモートリポジトリ（origin）が設定されていない

### 解決方法

#### 方法1: GitHubリポジトリを作成してからプッシュ

```bash
# 1. ブランチ名をmainに変更
git branch -M main

# 2. GitHubでリポジトリを作成（ブラウザで）
# https://github.com/new にアクセス
# リポジトリ名: record-money
# Public/Privateを選択
# 「Create repository」をクリック

# 3. リモートリポジトリを追加（your-usernameを実際のユーザー名に置き換え）
git remote add origin https://github.com/your-username/record-money.git

# 4. プッシュ
git push -u origin main
```

#### 方法2: 既存のリポジトリがある場合

```bash
# 1. ブランチ名をmainに変更
git branch -M main

# 2. 既存のリモートリポジトリを設定
git remote add origin https://github.com/your-username/your-repo-name.git

# 3. プッシュ
git push -u origin main
```

#### 方法3: masterブランチのままプッシュする場合

```bash
# 1. リモートリポジトリを追加
git remote add origin https://github.com/your-username/record-money.git

# 2. masterブランチをプッシュ
git push -u origin master
```

## トラブルシューティング

### リモートリポジトリが既に存在する場合

```bash
# 既存のリモートを確認
git remote -v

# 既存のリモートを削除
git remote remove origin

# 新しいリモートを追加
git remote add origin https://github.com/your-username/record-money.git
```

### 認証エラーが発生する場合

```bash
# HTTPSの場合、認証情報を入力
# または、Personal Access Tokenを使用

# SSHを使用する場合
git remote set-url origin git@github.com:your-username/record-money.git
```


