import { pool } from '../db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../utils/jwt.js';

export async function handleLogin(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required!' });
  }

  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.execute(
      'SELECT id, password_hash FROM users WHERE email = ?',
      [email]
    );
    conn.release();

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password!' });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid email or password!' });
    }

    const token = jwt.sign(
      { userId: user.id, email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.json({
      success: true,
      message: 'Login successful!',
      redirectUrl: '/profile.html',
      token,
      name: user.name
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error!' });
  }
}

