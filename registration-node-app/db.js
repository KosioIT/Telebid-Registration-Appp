import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'koki$ql+5473+',
  database: 'registration_app',
});

export default pool;