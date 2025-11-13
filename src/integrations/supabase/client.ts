import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

console.log("🔍 SUPABASE_URL:", SUPABASE_URL);
console.log("🔍 SUPABASE_KEY:", SUPABASE_KEY ? "✅ carregada" : "❌ não carregada");

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error("❌ Variáveis de ambiente do Supabase não foram carregadas!");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
