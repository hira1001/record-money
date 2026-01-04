import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export function createClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Supabase credentials are required in production");
    }
    // Return a mock client for build time in development
    console.warn("Supabase credentials not configured");
  }
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
