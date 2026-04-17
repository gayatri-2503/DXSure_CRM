import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const hasPlaceholderConfig =
  !supabaseUrl ||
  !supabaseAnonKey ||
  supabaseUrl.includes('your-project') ||
  supabaseUrl.includes('your-supabase-url') ||
  supabaseAnonKey.includes('your-anon-key');

if (hasPlaceholderConfig) {
  throw new Error(
    'Supabase credentials are not configured correctly. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env with your Supabase project values.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
