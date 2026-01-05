# AI Agent 引き継ぎルール書

> **重要**: このドキュメントは新しいAgentに引き継ぐ際に必ず最初に読み、作業後に更新してください。

---

## 1. プロジェクト概要

| 項目 | 内容 |
|------|------|
| プロジェクト名 | RecordMoney |
| 説明 | AIを活用した次世代家計簿アプリ |
| リポジトリ | https://github.com/hira1001/record-money.git |
| ローカルパス | `/home/hira1001/Java/cursor/26/RecordMoney` |
| 技術スタック | Next.js 16, React 19, TypeScript 5, Supabase, Tailwind CSS |

---

## 2. 現在の状態

**最終更新**: 2025-01-05

### ビルド状態
- [x] `npm run build` 成功
- [x] TypeScriptエラーなし
- [ ] 本番デプロイ未実施

### 主要ドキュメント
| ファイル | 内容 |
|----------|------|
| `PRODUCTION_TEST.md` | テストチェックリストと結果 |
| `KNOWLEDGE_BASE.md` | 開発ナレッジベース |
| `DEPLOYMENT_GUIDE.md` | デプロイ手順 |
| `AGENT_HANDOFF.md` | このファイル（引き継ぎルール） |

---

## 3. 進行中のタスク

**すべて完了** (2025-01-05)

**実装完了した機能**:
- [x] ユーザーアイコンにログアウト機能を追加（user-menu.tsx）
- [x] 統計サマリーカードのクリック→明細表示機能
- [x] 取引明細の編集機能（edit-modal.tsx）
- [x] 「すべて見る」ボタン実装（/transactions へリンク）
- [x] ダッシュボードpage.tsxの統合完了
- [x] ビルドテスト成功（12ページ生成）

**次のステップ（推奨）**:
1. Supabaseとの実データ連携（現在はモックデータ）
2. 設定ページの作成
3. 本番デプロイ（Vercel）

---

## 4. 完了済みタスク

- [x] プロジェクト構成分析
- [x] ビルドエラー修正（route.ts の Supabase API）
- [x] テストチェックリスト作成（PRODUCTION_TEST.md）
- [x] ナレッジベース作成（KNOWLEDGE_BASE.md）
- [x] UserMenuコンポーネント作成・統合
- [x] EditModalコンポーネント作成・統合
- [x] 取引一覧ページ作成（URLフィルタ対応）
- [x] TransactionListにonEdit機能追加
- [x] 統計ページのサマリーカードにクリック機能追加
- [x] 「すべて見る」→ /transactions へリンク
- [x] 引き継ぎルール書作成（AGENT_HANDOFF.md）
- [x] 最終ビルドテスト成功

---

## 5. 残りのタスク（優先度順）

### 必須（リリース前） - すべて完了
- [x] ダッシュボード統合
- [x] 統計ページ機能追加
- [x] ビルド確認

### 推奨（リリース後でも可）
- [ ] Supabaseとの実データ連携（現在はモックデータ）
- [ ] 設定ページ作成
- [ ] PWA対応強化
- [ ] Google OAuth 設定の確認と本番設定

---

## 6. 重要なファイルの場所

### ページ
```
src/app/page.tsx           # ダッシュボード（メイン）
src/app/login/page.tsx     # ログイン
src/app/stats/page.tsx     # 統計
src/app/transactions/page.tsx # 取引一覧（新規作成）
src/app/review/page.tsx    # レビューキュー
```

### コンポーネント
```
src/components/dashboard/
  ├── user-menu.tsx        # ユーザーメニュー（新規）
  ├── balance-card.tsx
  ├── transaction-list.tsx
  └── fab.tsx

src/components/transaction/
  ├── input-modal.tsx      # 入力モーダル
  └── edit-modal.tsx       # 編集モーダル（新規）
```

### API
```
src/app/api/
  ├── transactions/route.ts
  ├── ai/ocr/route.ts
  └── webhooks/ingest/route.ts  # 修正済み
```

### 設定
```
.env.local                 # 環境変数（必須3つ設定済み）
next.config.ts             # Next.js設定
package.json               # 依存関係
```

---

## 7. 注意事項

### コード修正時の注意
1. **環境変数**: ビルド時にグローバルスコープで環境変数を参照しない（遅延初期化を使用）
2. **Supabase Admin API**: `getUserByEmail` は存在しない、`listUsers` を使用
3. **Next.js 16**: middleware は非推奨（警告が出るが動作する）

### ファイル更新時の必須事項
- [ ] 作業後、このファイル（AGENT_HANDOFF.md）を必ず更新
- [ ] 大きな変更は KNOWLEDGE_BASE.md にも記録
- [ ] テスト結果は PRODUCTION_TEST.md に反映

---

## 8. 引き継ぎ手順

### 新しいAgentが最初にやること
1. このファイル（AGENT_HANDOFF.md）を読む
2. 「3. 進行中のタスク」を確認
3. 「5. 残りのタスク」から作業を継続
4. 不明点があれば関連ファイルを読む

### 作業終了時にやること
1. このファイルの「2. 現在の状態」を更新
2. 「3. 進行中のタスク」を更新
3. 「4. 完了済みタスク」に移動
4. 必要に応じて他のドキュメントも更新

---

## 9. クイックコマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# リント
npm run lint

# Git状態確認
git status

# 最新取得
git pull origin main
```

---

## 更新履歴

| 日付 | Agent | 内容 |
|------|-------|------|
| 2025-01-05 | Claude Opus 4.5 | 初版作成、未実装機能の実装開始 |
