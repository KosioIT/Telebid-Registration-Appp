import { pool } from '../db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../utils/jwt.js';

export async function handleRegister(req, res) {
  const { fname, name, email, password, captcha } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Name, email and password are required!"
    });
  }

  const finalName = (fname || name)?.trim();

  if (process.env.NODE_ENV !== 'test') {
    if (!captcha || !req.session?.captcha) {
      return res.status(400).json({ success: false, message: 'CAPTCHA missing!' });
    }
    if (captcha.toUpperCase().trim() !== req.session.captcha.toUpperCase().trim()) {
      return res.status(400).json({ success: false, message: 'Invalid CAPTCHA!' });
    }
  }

  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.execute("SELECT id FROM users WHERE email = ?", [email]);
    if (rows.length > 0) {
      return res.status(400).json({ success: false, message: "Email already registered!" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await conn.execute(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [finalName, email, passwordHash]
    );
    conn.release();

    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "1h" });

    return res.status(200).json({
      success: true,
      message: 'Registration successful!',
      redirectUrl: '/profile.html',
      token
    });

  } catch (err) {
    console.log('Registration error:', err);
    return res.status(500).json({
      success: false,
      message: 'Error registering: ' + err.message,
      redirectUrl: '/register.html'
    });
  }
}
