import { pool } from '../db.js';

export async function handleLogout(req, res) {
    const token = req.headers.authorization.split(' ')[1];
    //Save the token in blacklist (in the database)
    await pool.execute('INSERT INTO revoked_tokens (token) VALUES (?)', [token]);
    res.json({ success: true, message: 'Logged out successfully!' });
}