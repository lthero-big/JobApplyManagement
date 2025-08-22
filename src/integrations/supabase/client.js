import { createClient } from '@supabase/supabase-js';

// Use Vite environment variables so the app can switch between remote and local Supabase easily.
// Set these in a `.env` file at project root (for development) or in your deployment environment:
// VITE_SUPABASE_URL=http://localhost:54321
// VITE_SUPABASE_ANON_KEY=your-anon-key
// When not provided, the code falls back to a sensible localhost URL for `supabase start`.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? 'http://localhost:54321';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

