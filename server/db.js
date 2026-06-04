import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Missing required environment variables: SUPABASE_URL and/or SUPABASE_SERVICE_KEY. Got: " +
    `SUPABASE_URL=${supabaseUrl}, SUPABASE_SERVICE_KEY=${supabaseKey ? "set" : "missing"}`
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);