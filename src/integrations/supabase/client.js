import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://db0kffoalfc6g8.database.nocode.cn";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzQ2OTc5MjAwLCJleHAiOjE5MDQ3NDU2MDB9.uKLitEMtJK8GEU6DvpipEIqMfvw-AuKauMK5ov6CViU";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

