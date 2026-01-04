import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

// Single transaction schema (for receipts)
const receiptSchema = z.object({
  amount: z.number().describe("Total amount on the receipt in JPY"),
  description: z
    .string()
    .describe("Store name or merchant name from the receipt"),
  date: z
    .string()
    .optional()
    .describe("Date from receipt in ISO format, or null if not found"),
  suggested_category: z
    .string()
    .nullable()
    .describe(
      "Suggested category based on store name. One of: 食費, 交通費, 日用品, 娯楽, 医療, 住居, その他"
    ),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe("Confidence score of the extraction (0-1)"),
});

// Batch transactions schema (for credit card statements)
const transactionItemSchema = z.object({
  amount: z.number().describe("Transaction amount in JPY"),
  description: z.string().describe("Store/merchant name"),
  date: z.string().describe("Transaction date in ISO format (YYYY-MM-DD)"),
  suggested_category: z
    .string()
    .nullable()
    .describe(
      "Suggested category: 食費, 交通費, 日用品, 娯楽, 医療, 住居, その他"
    ),
});

const batchTransactionsSchema = z.object({
  is_batch: z.boolean().describe("Whether this is a credit card statement with multiple transactions"),
  transactions: z
    .array(transactionItemSchema)
    .describe("Array of transactions from the credit card statement"),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe("Overall confidence score for all extractions"),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const image = formData.get("image") as File;

    if (!image) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    // Convert image to base64
    const bytes = await image.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mimeType = image.type;

    // First, detect if this is a batch transaction (credit card statement)
    const { object: batchResult } = await generateObject({
      model: google("gemini-1.5-flash"),
      schema: batchTransactionsSchema,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `この画像を分析して、以下を判定してください：

1. これがクレジットカード明細（複数の取引が記載された明細書）かどうか
2. 明細の場合、全ての取引を抽出：
   - 日付
   - 店名/支払先
   - 金額
   - カテゴリ（食費、交通費、日用品、娯楽、医療、住居、その他）

明細でない場合（単一のレシート）は、is_batch=false を返し、transactions配列は空にしてください。
金額は日本円（JPY）で抽出してください。`,
            },
            {
              type: "image",
              image: `data:${mimeType};base64,${base64}`,
            },
          ],
        },
      ],
    });

    // If it's a batch statement, return batch results
    if (batchResult.is_batch && batchResult.transactions.length > 0) {
      return NextResponse.json({
        is_batch: true,
        transactions: batchResult.transactions,
        confidence: batchResult.confidence,
      });
    }

    // Otherwise, fallback to single receipt processing
    const { object: singleResult } = await generateObject({
      model: google("gemini-1.5-flash"),
      schema: receiptSchema,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `このレシート画像から以下の情報を抽出してください：
1. 合計金額（税込）
2. 店名または支払先
3. 日付（あれば）
4. 適切なカテゴリの推測（食費、交通費、日用品、娯楽、医療、住居、その他のいずれか）

日本語で書かれたレシートです。金額は日本円（JPY）で抽出してください。`,
            },
            {
              type: "image",
              image: `data:${mimeType};base64,${base64}`,
            },
          ],
        },
      ],
    });

    return NextResponse.json({
      is_batch: false,
      ...singleResult,
    });
  } catch (error) {
    console.error("OCR Error:", error);
    return NextResponse.json(
      { error: "Failed to process receipt" },
      { status: 500 }
    );
  }
}
