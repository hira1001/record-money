import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export function createClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a mock client for build time
    console.warn("Supabase credentials not configured");
  }
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
