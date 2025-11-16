import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";
import { JWT_SECRET } from "../config.js";

const router = express.Router();

function generateAccessToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });
}

function generateRefreshToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

router.post("/register", async (req, res) => {
  const { name, email, password, captcha } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "Missing required fields!" });
  }

  // CAPTCHA test (disabled in test mode)
  if (process.env.NODE_ENV !== "test") {
    if (!captcha || !req.session?.captcha) {
      return res.status(400).json({ success: false, message: "CAPTCHA missing!" });
    }
    if (captcha.toUpperCase().trim() !== req.session.captcha.toUpperCase().trim()) {
      return res.status(400).json({ success: false, message: "Invalid CAPTCHA!" });
    }
  }

  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.execute("SELECT id FROM users WHERE email = ?", [email]);
    if (rows.length > 0) {
      conn.release();
      return res.status(400).json({ success: false, message: "Email already registered!" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await conn.execute(
      "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
      [name.trim(), email, passwordHash]
    );
    conn.release();

    const payload = { email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const conn2 = await pool.getConnection();
    await conn2.execute(
      "INSERT INTO tokens (user_id, token, type) VALUES ((SELECT id FROM users WHERE email = ?), ?, 'refresh')",
      [email, refreshToken]
    );
    conn2.release();

    res.json({
      success: true,
      message: "Registration successful",
      accessToken,
      refreshToken,
      redirectUrl: "/profile.html",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error registering: " + err.message });
  }
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const conn = await pool.getConnection();
        const [rows] = await conn.execute("SELECT * FROM users WHERE email = ?", [email]);
        conn.release();

        if (rows.length === 0) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        const user = rows[0];
        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
            return res.status(401).json({ success: false, message: "Invalid password" });
        }

        const payload = { userId: user.id, email: user.email };
        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        const conn2 = await pool.getConnection();
        await conn2.execute(
            "INSERT INTO tokens (user_id, token, type) VALUES (?, ?, 'refresh')",
            [user.id, refreshToken]
        );
        conn2.release();

        res.json({
            success: true,
            message: "Login successful",
            accessToken,
            refreshToken,
            name: user.name,
            redirectUrl: "/profile.html",
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post("/refresh", async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(401).json({ success: false, message: "Refresh token required" });
    }

    const conn = await pool.getConnection();
    const [rows] = await conn.execute(
        "SELECT * FROM tokens WHERE token = ? AND type = 'refresh'",
        [refreshToken]
    );
    conn.release();

    if (rows.length === 0) {
        return res.status(403).json({ success: false, message: "Invalid refresh token" });
    }

    jwt.verify(refreshToken, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, message: "Invalid refresh token" });
        }

        const newAccessToken = generateAccessToken({ userId: user.userId, email: user.email });
        res.json({ success: true, accessToken: newAccessToken });
    });
});

router.post("/logout", async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(400).json({ success: false, message: "Refresh token required" });
    }

    const conn = await pool.getConnection();
    await conn.execute("DELETE FROM tokens WHERE token = ? AND type = 'refresh'", [refreshToken]);
    conn.release();

    res.json({ success: true, message: "Logged out" });
});

export default router;
