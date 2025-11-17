import express from "express";
import bcrypt from "bcrypt";
import { pool } from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const userId = req.user.userId;
    const conn = await pool.getConnection();
    const [rows] = await conn.execute(
      "SELECT id, name, email FROM users WHERE id = ?",
      [userId]
    );
    conn.release();

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user: rows[0], message: "Profile fetched successfully" });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.patch("/", async (req, res) => {
  const userId = req.user.userId;
  const { name, password } = req.body;

  try {
    const conn = await pool.getConnection();

    const updates = [];
    const values = [];

    if (name) {
      updates.push("name = ?");
      values.push(name.trim());
    }
    
    if (password) {
       const [rows] = await conn.execute(
        "SELECT password_hash FROM users WHERE id = ?",
        [userId]
      );
      if (rows.length === 0) {
        conn.release();
        return res.status(404).json({ success: false, message: "User not found" });
      }

      console.log("found user: ", rows[0]);
      const currentHash = rows[0].password_hash;
      const samePassword = await bcrypt.compare(password, currentHash);
      if (samePassword) {
        conn.release();
        return res.status(400).json({ success: false, message: "New password must be different from the current one" });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      updates.push("password_hash = ?");
      values.push(passwordHash);
    }

    if (updates.length === 0) {
      conn.release();
      return res.status(400).json({ success: false, message: "No fields to update" });
    }

    values.push(userId);
    const sql = `UPDATE users SET ${updates.join(", ")} WHERE id = ?`;
    await conn.execute(sql, values);
    conn.release();

    res.json({ success: true, message: "Profile updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
