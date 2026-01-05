# RecordMoney 開発ナレッジベース

このドキュメントは、RecordMoneyプロジェクトで得た知見を将来の開発に活かすためにまとめたものです。

---

## 目次

1. [技術スタック選定](#1-技術スタック選定)
2. [アーキテクチャパターン](#2-アーキテクチャパターン)
3. [認証・セキュリティ](#3-認証セキュリティ)
4. [API設計](#4-api設計)
5. [AI/ML統合](#5-aiml統合)
6. [UI/UXパターン](#6-uiuxパターン)
7. [トラブルシューティング](#7-トラブルシューティング)
8. [ベストプラクティス](#8-ベストプラクティス)
9. [今後の改善点](#9-今後の改善点)

---

## 1. 技術スタック選定

### 採用した技術と選定理由

| 技術 | バージョン | 選定理由 |
|------|-----------|---------|
| Next.js | 16.x | App Router、Server Components、API Routes統合 |
| React | 19.x | 最新のConcurrent Features、Server Components対応 |
| TypeScript | 5.x | 型安全性、開発効率向上 |
| Tailwind CSS | 4.x | ユーティリティファースト、高速なスタイリング |
| Supabase | - | PostgreSQL + 認証 + RLS を一括管理 |
| Framer Motion | 12.x | 宣言的アニメーション、パフォーマンス |

### 技術選定のポイント

```
選定基準:
1. 開発速度 - スタートアップ向けに素早くMVPを作れるか
2. スケーラビリティ - 将来の拡張に耐えられるか
3. コスト - 無料枠があるか、運用コストは妥当か
4. ドキュメント - 情報が豊富か、コミュニティが活発か
```

---

## 2. アーキテクチャパターン

### ディレクトリ構成（推奨）

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes（バックエンド）
│   ├── (auth)/            # 認証関連ページグループ
│   └── (main)/            # メインアプリページグループ
├── components/
│   ├── ui/                # 再利用可能なUIコンポーネント
│   ├── [feature]/         # 機能別コンポーネント
│   └── layout/            # レイアウトコンポーネント
├── lib/
│   ├── hooks/             # カスタムフック
│   ├── utils/             # ユーティリティ関数
│   └── [service]/         # 外部サービス連携
└── types/                 # TypeScript型定義
```

### コンポーネント設計パターン

```typescript
// 1. Container/Presentationalパターン
// Container: データ取得・状態管理
// Presentational: 表示のみ

// 2. Compound Componentsパターン
<Card>
  <Card.Header>タイトル</Card.Header>
  <Card.Body>内容</Card.Body>
</Card>

// 3. カスタムフックによるロジック分離
const { data, isLoading, error } = useTransactions();
```

---

## 3. 認証・セキュリティ

### Supabase Auth + Google OAuth

```typescript
// クライアント側
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// サーバー側
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(cookiesToSet) { /* ... */ }
    }
  });
}
```

### Row Level Security (RLS) パターン

```sql
-- ユーザー本人のデータのみアクセス可能
CREATE POLICY "Users can view own data"
ON transactions FOR SELECT
USING (auth.uid() = user_id);

-- デフォルトデータは全員閲覧可能
CREATE POLICY "Everyone can view defaults"
ON categories FOR SELECT
USING (is_default = true OR auth.uid() = user_id);
```

### セキュリティヘッダー（next.config.ts）

```typescript
async headers() {
  return [{
    source: "/:path*",
    headers: [
      { key: "X-DNS-Prefetch-Control", value: "on" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" }
    ]
  }];
}
```

---

## 4. API設計

### Next.js API Routes パターン

```typescript
// src/app/api/[resource]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// バリデーションスキーマ
const createSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(["income", "expense"]),
  description: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    // 1. 認証チェック
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. バリデーション
    const body = await request.json();
    const validated = createSchema.parse(body);

    // 3. データ操作
    const { data, error } = await supabase
      .from("transactions")
      .insert({ ...validated, user_id: user.id })
      .select()
      .single();

    if (error) throw error;

    // 4. レスポンス
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
```

### エラーハンドリングパターン

```typescript
// 統一されたエラーレスポンス形式
interface ApiError {
  error: string;
  code?: string;
  details?: unknown;
}

// HTTPステータスコードの使い分け
// 200: 成功
// 201: 作成成功
// 400: バリデーションエラー
// 401: 認証エラー
// 403: 権限エラー
// 404: リソース未発見
// 500: サーバーエラー
```

---

## 5. AI/ML統合

### Google Gemini API（OCR）

```typescript
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

// 構造化データ抽出
const { object } = await generateObject({
  model: google("gemini-1.5-flash"),
  schema: z.object({
    amount: z.number(),
    description: z.string(),
    date: z.string(),
    confidence: z.number().min(0).max(1),
  }),
  messages: [
    {
      role: "user",
      content: [
        { type: "image", image: base64Image },
        { type: "text", text: "このレシートから情報を抽出してください" },
      ],
    },
  ],
});
```

### Web Speech API（音声認識）

```typescript
// ブラウザ内蔵の音声認識
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.lang = "ja-JP";
recognition.continuous = false;
recognition.interimResults = false;

recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript;
  // 「1000円の食費」→ { amount: 1000, category: "食費" }
  parseVoiceInput(transcript);
};
```

---

## 6. UI/UXパターン

### Bentoグリッドレイアウト

```tsx
<div className="grid grid-cols-2 gap-3">
  {/* 大きいカード: 2列分 */}
  <div className="col-span-2">
    <BalanceCard />
  </div>

  {/* 小さいカード: 1列ずつ */}
  <div><IncomeCard /></div>
  <div><ExpenseCard /></div>

  {/* 中サイズ: 2列分 */}
  <div className="col-span-2">
    <TransactionList />
  </div>
</div>
```

### アニメーションパターン（Framer Motion）

```tsx
// スタッガードアニメーション
{items.map((item, index) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
  >
    {item.content}
  </motion.div>
))}

// ページ遷移アニメーション
<motion.main
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
>
```

### 日本円フォーマット

```typescript
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    minimumFractionDigits: 0,
  }).format(amount);
};
// 結果: ¥1,200
```

### ハプティックフィードバック

```typescript
// 操作確認時のバイブレーション
if (navigator.vibrate) {
  navigator.vibrate([10, 30, 10]); // 短-長-短パターン
}
```

---

## 7. トラブルシューティング

### 問題1: ビルド時の環境変数エラー

**症状:**
```
Error: supabaseKey is required.
```

**原因:** グローバルスコープでSupabaseクライアントを初期化

**解決策:** 遅延初期化に変更
```typescript
// NG: グローバルで初期化
const supabase = createClient(url, key);

// OK: 関数内で初期化
function getSupabase() {
  if (!url || !key) throw new Error("Missing env vars");
  return createClient(url, key);
}
```

### 問題2: Supabase Admin API の型エラー

**症状:**
```
Property 'getUserByEmail' does not exist on type 'GoTrueAdminApi'
```

**原因:** Supabase v2では`getUserByEmail`が削除された

**解決策:**
```typescript
// NG
const { data } = await supabase.auth.admin.getUserByEmail(email);

// OK
const { data: { users } } = await supabase.auth.admin.listUsers();
const user = users?.find(u => u.email === email);
```

### 問題3: Next.js Middleware非推奨警告

**症状:**
```
The "middleware" file convention is deprecated
```

**対応:** Next.js 16以降は`proxy`に移行が必要（現時点では警告のみ）

---

## 8. ベストプラクティス

### コード品質

```typescript
// 1. 型を明示的に定義
interface Transaction {
  id: string;
  amount: number;
  type: "income" | "expense";
  // ...
}

// 2. Zodでランタイムバリデーション
const schema = z.object({
  amount: z.number().positive(),
});

// 3. エラーハンドリングを忘れない
try {
  const result = await riskyOperation();
} catch (error) {
  console.error("Operation failed:", error);
  // ユーザーにフィードバック
}
```

### パフォーマンス

```typescript
// 1. 画像最適化
import Image from "next/image";
<Image src="/logo.png" width={100} height={100} alt="Logo" />

// 2. 動的インポート
const HeavyComponent = dynamic(() => import("./HeavyComponent"), {
  loading: () => <Skeleton />,
});

// 3. useMemoで再計算を防ぐ
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);
```

### セキュリティ

```typescript
// 1. 環境変数は必ずサーバー側で使用
// NEXT_PUBLIC_* 以外はクライアントに露出しない

// 2. ユーザー入力は必ずバリデーション
const validated = schema.safeParse(userInput);
if (!validated.success) {
  throw new Error("Invalid input");
}

// 3. SQLインジェクション対策（Supabaseは自動的に対策済み）
// ただしraw SQLを使う場合は注意
```

---

## 9. 今後の改善点

### 技術的負債

| 項目 | 現状 | 改善案 |
|------|------|--------|
| モックデータ | ハードコード | Supabaseから取得 |
| エラーハンドリング | 基本的 | エラーバウンダリ導入 |
| テスト | なし | Jest + React Testing Library |
| CI/CD | なし | GitHub Actions |

### 機能追加候補

1. **プッシュ通知** - 予算超過アラート
2. **データエクスポート** - CSV/PDF出力
3. **複数通貨対応** - 為替レート連携
4. **家族共有** - 複数ユーザー管理
5. **定期取引** - 家賃などの自動登録

### アーキテクチャ改善

```
現在: モノリシック（Next.js内に全て）
     ↓
将来: マイクロサービス化（必要に応じて）
     - 認証サービス
     - 取引サービス
     - 分析サービス
     - 通知サービス
```

---

## 参考リンク

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [shadcn/ui](https://ui.shadcn.com/)

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2025-01-05 | 初版作成 |
| 2025-01-05 | トラブルシューティング追加（Supabase Admin API） |
