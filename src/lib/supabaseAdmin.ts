import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseAdminConfigured = Boolean(supabaseUrl && supabaseServiceRoleKey);

// Use this client strictly in Server Actions or API Routes!
export const supabaseAdmin: SupabaseClient | null = isSupabaseAdminConfigured
  ? createClient(supabaseUrl!, supabaseServiceRoleKey!, {
      auth: { persistSession: false },
    })
  : null;
