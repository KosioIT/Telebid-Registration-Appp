import { Router } from 'express';
import bcrypt from 'bcrypt';
import { pool } from '../db.js';

const router = Router();

export async function handleProfile(req, res) {
  const [rows] = await pool.execute(
    'SELECT name FROM users WHERE id = ?',
    [req.user.userId]
  );
  if (rows.length === 0) {
    return res.status(404).json({ success: false, message: 'User not found!' });
  }
  res.json({ username: rows[0].name });
}

export async function handleProfileUpdate(req, res) {
  const { name, password } = req.body;
  const email = req.user?.email; // Extract email from token

  if (!email) {
    return res.status(400).json({ success: false, message: 'No email provided!' });
  }

  if (!name && !password) {
    return res.status(400).json({ success: false, message: 'No data provided!' });
  }

  const messages = [];

  try {
    if (name) {
      await pool.execute(
        'UPDATE users SET name = ? WHERE email = ?',
        [name, email]
      );
      messages.push('Name updated successfully!');
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.execute(
        'UPDATE users SET password_hash = ? WHERE email = ?',
        [hashedPassword, email]
      );
      messages.push('Password updated successfully!');
    }

    res.json({ success: true, message: messages.join(' ') });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ success: false, message: 'Internal server error!' });
  }

}