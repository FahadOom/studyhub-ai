import { createClient } from "@supabase/supabase-js";

// Client-side Supabase instance — safe to use in browser components.
// Uses the public anon key, which respects Row Level Security.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

