import { pool } from '../db.js';
import bcrypt from 'bcrypt';

export async function handleRegister(req, res) {
  const {fname, email, password, captcha } = req.body || {};
  const name = fname.trim();
  console.log('SID:', req.sessionID, 'session.captcha:', req.session?.captcha);

   if (!captcha || !req.session?.captcha) {
    return res.status(400).json({ success: false, message: 'CAPTCHA missing!' });
  }
  if (captcha.toUpperCase().trim() !== req.session.captcha.toUpperCase().trim()) {
    return res.status(400).json({ success: false, message: 'Invalid CAPTCHA!' });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    console.log("hashed password:", passwordHash);

    const conn = await pool.getConnection();
    await conn.execute(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name, email, passwordHash]
    );
    conn.release();

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'Registration successful!', redirectUrl: '/profile.html' }));
    console.log(`New user registered: ${email}`);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, message: 'Error registering: ' + err.message, redirectUrl: '/register.html' }));
    console.error('Registration error:', err);
  }
}
