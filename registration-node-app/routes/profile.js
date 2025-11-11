import bcrypt from "bcrypt";
import { pool } from "../db.js";

// Get the user's profile by email (from the token)
export async function handleProfile(req, res) {
  try {
    const [rows] = await pool.execute(
      "SELECT name, email FROM users WHERE email = ?",
      [req.user.email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found!" });
    }

    const user = rows[0];
    res.status(200).json({
      success: true,
      message: "Profile fetched successfully!",
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    console.error("Profile error:", err);
    res.status(500).json({ success: false, message: "Internal server error!" });
  }
}

export async function handleProfileUpdate(req, res) {
  const { name, password } = req.body;
  const email = req.user?.email; // от токена

  if (!email) {
    return res.status(400).json({ success: false, message: "No email provided!" });
  }

  if (!name && !password) {
    return res.status(400).json({ success: false, message: "No data provided!" });
  }

  const messages = [];

  try {
    if (name) {
      await pool.execute("UPDATE users SET name = ? WHERE email = ?", [name, email]);
      messages.push("Name updated successfully!");
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.execute("UPDATE users SET password_hash = ? WHERE email = ?", [hashedPassword, email]);
      messages.push("Password updated successfully!");
    }

    // Get the updated user from the database
    const [rows] = await pool.execute("SELECT name, email FROM users WHERE email = ?", [email]);
    const updatedUser = rows[0];

    res.status(200).json({
      success: true,
      message: messages.join(" "),
      name: updatedUser.name,
      email: updatedUser.email,
    });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ success: false, message: "Internal server error!" });
  }
}