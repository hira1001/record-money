import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Create Supabase client with service role
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

// Create Google AI client
function getGoogleClient() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing Google AI API key");
  }
  return createGoogleGenerativeAI({ apiKey });
}

const transactionSchema = z.object({
  amount: z.number().describe("Transaction amount in JPY"),
  type: z.enum(["income", "expense"]).describe("Transaction type"),
  description: z.string().describe("Merchant or transaction description"),
  date: z.string().describe("Transaction date in ISO format"),
  suggested_category: z
    .string()
    .nullable()
    .describe(
      "Suggested category: 食費, 交通費, 日用品, 娯楽, 医療, 住居, 給与, その他"
    ),
  confidence: z.number().min(0).max(1).describe("Confidence score (0-1)"),
});

// Verify webhook secret
function verifyWebhookSecret(request: NextRequest): boolean {
  const secret = request.headers.get("x-webhook-secret");
  return secret === process.env.WEBHOOK_SECRET;
}

export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret
    if (!verifyWebhookSecret(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { user_email, email_body, email_subject, source } = body;

    if (!user_email || !email_body) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get clients
    const supabase = getSupabaseClient();
    const google = getGoogleClient();

    // Find user by email using admin API
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();

    if (userError) {
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }

    const user = users.find((u) => u.email === user_email);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Parse email with AI
    const { object } = await generateObject({
      model: google("gemini-1.5-flash"),
      schema: transactionSchema,
      messages: [
        {
          role: "user",
          content: `以下のメール通知から取引情報を抽出してください。
これは銀行、クレジットカード、または決済サービス（PayPayなど）からの通知メールです。

件名: ${email_subject || "なし"}

本文:
${email_body}

金額、取引種別（収入/支出）、店名または取引内容、日付を抽出してください。
金額は日本円（JPY）で、数値のみ抽出してください。`,
        },
      ],
    });

    // Get category ID
    const { data: categoryData } = await supabase
      .from("categories")
      .select("id")
      .eq("name", object.suggested_category)
      .eq("is_default", true)
      .single();

    // Insert transaction with review_needed status
    const { data: transaction, error: insertError } = await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        amount: object.amount,
        type: object.type,
        category_id: categoryData?.id || null,
        description: object.description,
        date: object.date || new Date().toISOString(),
        status: object.confidence > 0.8 ? "confirmed" : "review_needed",
        source: source || "gmail_auto",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to create transaction" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      transaction,
      confidence: object.confidence,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
