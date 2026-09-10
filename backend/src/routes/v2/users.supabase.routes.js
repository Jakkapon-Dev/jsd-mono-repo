import { Router } from "express";
import { supabase } from "../../config/supabase.js";

const router = Router();
const PG_SELECT = "id, username, email, role, created_at, updated_at";

// Middleware to check if Supabase Client is ready
router.use((req, res, next) => {
  if (!supabase) {
    return res.status(500).json({
      error:
        "Supabase client is not configured. Please set SUPABASE_SECRET_KEY or SUPABASE_ANON_KEY in your .env file.",
    });
  }
  next();
});

// READ all users
router.get("/pg", async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select(PG_SELECT)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// READ user by id
router.get("/pg/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("users")
      .select(PG_SELECT)
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// CREATE user
router.post("/pg", async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        error: "username, email and password are required",
      });
    }

    const { data, error } = await supabase
      .from("users")
      .insert([{ username, email, password }])
      .select(PG_SELECT)
      .single();

    if (error) {
      if (error.code === "23505") {
        return res.status(409).json({ error: "Email already exists" });
      }
      throw error;
    }

    return res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// UPDATE user
router.put("/pg/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "User id is required" });
    }

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        error: "username, email and password are required",
      });
    }

    const { data, error } = await supabase
      .from("users")
      .update({
        username,
        email,
        password,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select(PG_SELECT)
      .maybeSingle();

    if (error) {
      if (error.code === "23505") {
        return res.status(409).json({ error: "Email already exists" });
      }
      throw error;
    }

    if (!data) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// DELETE user
router.delete("/pg/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "User id is required" });
    }

    const { data, error } = await supabase
      .from("users")
      .delete()
      .eq("id", id)
      .select(PG_SELECT)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
