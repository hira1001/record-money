import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const transactionSchema = z.object({
  amount: z.number().int().positive(),
  type: z.enum(["income", "expense"]),
  category_id: z.string().uuid().nullable().optional(),
  description: z.string().max(500).nullable().optional(),
  date: z.string().datetime().optional(),
  source: z.enum(["manual", "ocr", "gmail_auto"]).optional(),
  status: z.enum(["confirmed", "review_needed"]).optional(),
});

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = parseInt(searchParams.get("offset") || "0");

  const { data, error } = await supabase
    .from("transactions")
    .select(
      `
      *,
      category:categories(*)
    `
    )
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = transactionSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { amount, type, category_id, description, date, source, status } = validationResult.data;

    const { data, error } = await supabase
    .from("transactions")
    .insert({
      user_id: user.id,
      amount,
      type,
      category_id,
      description,
      date: date || new Date().toISOString(),
      source: source || "manual",
      status: status || "confirmed",
    })
    .select(
      `
      *,
      category:categories(*)
    `
    )
    .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
