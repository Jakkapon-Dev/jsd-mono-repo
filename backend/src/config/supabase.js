import pg from "pg";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const connectionString = process.env.DATABASE_URL;

export const pool = new pg.Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

const supabaseUrl =
  process.env.SUPABASE_URL || "https://ktbuzmqsnpvowdgmtpca.supabase.co";
const supabaseKey =
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_ANON_KEY || "";

export const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export async function connectSupabase() {
  try {
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
    console.log("Supabase is Connected ✅");
  } catch (error) {
    console.error("Supabase Connection Error ❌", error.message);
    throw error;
  }
}
