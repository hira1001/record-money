import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  // During build time, environment variables might not be available
  // The actual runtime will have them from Vercel environment
  if (!supabaseUrl || !supabaseAnonKey) {
    // Only warn during development/build, don't throw
    if (typeof window === 'undefined') {
      // Server-side/build time - return a dummy client
      console.warn("Supabase credentials not configured (build time)");
      return createBrowserClient("https://placeholder.supabase.co", "placeholder-key");
    }
    // Client-side runtime without credentials - this is a real error
    throw new Error("Supabase credentials are required");
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
