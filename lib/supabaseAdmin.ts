import { createClient } from "@supabase/supabase-js";

// Server-only Supabase instance — uses the secret key and bypasses
// Row Level Security. NEVER import this file into a client component.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { autoRefreshToken: false, persistSession: false },
  }
);

