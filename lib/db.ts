import { createClient } from "@supabase/supabase-js";

let supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xzkpixozekovhtsokrdu.supabase.co";

// Auto-correct typo jika env di Vercel masih mengandung huruf 'h' di xzkpixozekhovhtsokrdu
if (supabaseUrl.includes("xzkpixozekhovhtsokrdu")) {
  supabaseUrl = supabaseUrl.replace("xzkpixozekhovhtsokrdu", "xzkpixozekovhtsokrdu");
}

const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6a3BpeG96ZWtvdmh0c29rcmR1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDA1MDk1NSwiZXhwIjoyMTA1NjI2OTU1fQ.TXiRYEQcQ6r4PtdJrb7aV4O9pqyqUuICU-xDvg-uOC4";

// Server-side client — pakai service_role key agar bisa bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export default supabase;
