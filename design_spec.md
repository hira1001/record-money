# Project Design Specification: RecordMoney (Final Architecture)

## 1. Project Identity
* **Project Name**: RecordMoney
* **Root Directory**: `/home/hira1001/Java/cursor/26/RecordMoney`
* **Vision**: "Invisible Input, Visible Wealth." (入力は透明に、資産は鮮明に)
* **Core Philosophy**: **Zero Friction & Zero Cost**.
    * 入力の摩擦係数を極限まで下げる（自動化・AI化）。
    * ランニングコストを無料に抑える（Gemini Flash Free Tier + GAS）。

## 2. Key UX Strategy (The "Hook")
### 2.1 Mobile-First PWA
* **Native Feel**: スマートフォンのホーム画面に追加して使用することを前提とする。
* **Haptics**: ボタン押下や保存完了時に、Web Vibration APIを用いた心地よい物理フィードバックを実装。
* **Optimistic UI**: サーバー応答を待たず、UIを即座に更新して体感ラグをゼロにする。

### 2.2 The "Auto-Ingest" Engine (Automation)
* **Visual Receipt OCR (Gemini Flash)**:
    * カメラで撮影 → `gemini-1.5-flash` が画像を解析 → JSONデータ化。これを数秒で完了させる。
* **Gmail Watcher (Google Apps Script)**:
    * 銀行・カード会社・PayPayの決済通知メールをGASで検知。
    * メール本文をアプリのAPIエンドポイントへPOSTし、AIが自動解析・登録。
* **Smart Categorization**:
    * 店名や文脈からカテゴリを自動推論（例: "セブンイレブン" + "朝" → 食費）。

### 2.3 Visual Motivation
* **Bento Grid Dashboard**: Appleスタイルのグリッドレイアウトで情報を整理。
* **Money Heatmap**: カレンダーの日付セルを支出額に応じて色付け（無駄遣い＝赤、健全＝緑）。
* **Assets Flow**: 収入と支出のバランスを美しいアニメーションで可視化。

## 3. Tech Stack Requirements

### Frontend & UI
* **Framework**: **Next.js 15** (App Router)
* **Language**: **TypeScript** (Strict Mode)
* **Styling**: **Tailwind CSS v4**
* **Components**: **Shadcn/UI** (Radix UI based)
* **Animation**: **Framer Motion** (必須: ページ遷移、数字カウントアップ、グラフアニメーション)
* **Icons**: **Lucide React**
* **Charts**: **Recharts** (Customized for minimal aesthetic)
* **Fonts**: システムフォント (System-UI fallback) - ビルド時の信頼性向上のため

### Backend & Infrastructure
* **BaaS**: **Supabase** (Free Tier)
    * **Database**: PostgreSQL
    * **Auth**: Google OAuth (ワンタップログイン)
    * **Row Level Security (RLS)**: ユーザーごとのデータ分離を徹底
* **AI Provider**: **Google Gemini API** (via Google AI Studio)
    * **SDK**: Vercel AI SDK Core (`@ai-sdk/google`)
    * **Model**: `gemini-1.5-flash` (高速・無料・マルチモーダル)
* **External Automation**: **Google Apps Script (GAS)** - Gmail連携用

## 4. Database Schema (PostgreSQL)

```sql
-- 1. Transactions (Main Ledger)
create table transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  amount integer not null,
  type text check (type in ('income', 'expense')) not null,
  category_id uuid references categories,
  description text, -- Merchant name or memo
  date timestamptz not null default now(),
  status text default 'confirmed', -- 'confirmed' or 'review_needed'
  source text default 'manual', -- 'manual', 'ocr', 'gmail_auto'
  created_at timestamptz default now()
);

-- 2. Categories
create table categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users, -- Allow custom categories
  name text not null,
  color text, -- Hex code for UI
  icon text, -- Lucide icon name
  is_default boolean default false
);

-- 3. Budgets
create table budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  category_id uuid references categories,
  amount_limit integer not null,
  period text default 'monthly'
);
```

## 5. UI Design Specification

### 5.1 Theme: "Cyber-Glass"
* **Base**: #09090b (Zinc-950) - 深い黒。
* **Surface**: bg-zinc-900/50 + backdrop-blur-xl - すりガラス効果。
* **Accent**:
    * **Income**: #10b981 (Emerald-500)
    * **Expense**: #f43f5e (Rose-500)
    * **Action**: #3b82f6 (Blue-500)

### 5.2 Key Screens
* **Dashboard**:
    * 「今月あと使える金額」を画面上部に巨大なタイポグラフィで表示。
    * 直近のトランザクションをカード形式でリスト表示。
    * FAB (Floating Action Button) で入力モーダル起動。
* **Input Modal**:
    * タブ切り替え: [手入力] [カメラスキャン] [音声入力]。
    * AI解析中はスケルトンローダーを表示し、体感速度を向上。
* **Review Queue**:
    * 自動入力（Gmail/OCR）されたデータの確認画面。TinderライクなUIでサクサク承認。

## 6. Implementation Roadmap

### Setup Phase:
* Initialize Next.js 15 + Supabase + Shadcn/UI.
* Configure Tailwind v4 & Theme.

### Core Feature Phase:
* Database Schema migration.
* Authentication (Google Auth).
* Basic CRUD for Transactions.

### AI Integration Phase:
* Install @ai-sdk/google.
* Implement Receipt OCR (Image to JSON).
* Implement Text Parser (Description to Category).

### Automation Phase:
* Create API Route (POST /api/webhooks/ingest).
* Setup Google Apps Script for Gmail fetching (Instruction based).

### Polish Phase:
* Add Framer Motion animations.
* PWA Configuration (manifest.json).

