import { Router } from "express";
import { pool } from "../../config/supabase.js";

export const router = Router();
const PG_SELECT = "id, username, email, role, created_at, updated_at";

// 1. Read all users
router.get("/", async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT ${PG_SELECT} FROM users ORDER BY created_at DESC`
    );
    return res.status(200).json(result.rows);
  } catch (err) {
    next(err);
  }
});

// 2. Read user by ID
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT ${PG_SELECT} FROM users WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found!" });
    }

    return res.status(200).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// 3. Create a new user
router.post("/", async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        error: "username, email and password are required!",
      });
    }

    const result = await pool.query(
      `INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING ${PG_SELECT}`,
      [username, email, password]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Email already exists" });
    }
    next(err);
  }
});

// 4. Update user by ID
router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        error: "username, email and password are required!",
      });
    }

    const result = await pool.query(
      `UPDATE users SET username = $1, email = $2, password = $3, updated_at = NOW() WHERE id = $4 RETURNING ${PG_SELECT}`,
      [username, email, password, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found!" });
    }

    return res.status(200).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Email already exists" });
    }
    next(err);
  }
});

// 5. Delete user by ID
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM users WHERE id = $1 RETURNING ${PG_SELECT}`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found!" });
    }

    return res.status(200).json({
      message: "User deleted successfully",
      deletedUser: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
});

export default router;
