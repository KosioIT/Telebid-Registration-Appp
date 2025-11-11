import express from 'express';
import session from 'express-session';
import path from 'path';
import dotenv from 'dotenv';

import {handleRegister} from './routes/register.js';
import {handleLogin} from './routes/login.js';
import {handleProfile, handleProfileUpdate} from './routes/profile.js';
import {handleCaptcha} from './routes/captcha.js';
import { authenticateJWT } from './utils/jwt.js';
import { handleLogout } from './routes/logout.js';

dotenv.config();

const app = express();
app.use(express.urlencoded({ extended: true })); // for parsing form data
app.use(express.json()); // for JSON body

app.set('trust proxy', 1);

app.use(session({
  name: 'sid',               // cookie name
  secret: 'replace-this-with-a-strong-secret',
  resave: false,
  saveUninitialized: true,   // create a session even before login
  cookie: {
    secure: false,           // HTTPS only if true; keep false in local dev
    httpOnly: true,
    sameSite: 'lax',         // good default; change to 'none' for cross-site + HTTPS
    maxAge: 1000 * 60 * 15   // 15 minutes
  }
}));

app.use(express.static(path.join(process.cwd(), 'public')));

app.post('/register', handleRegister);
app.post('/login', handleLogin);
app.get('/profile', authenticateJWT, handleProfile);
app.patch('/profile', authenticateJWT, handleProfileUpdate);
app.post('/logout', authenticateJWT, handleLogout);
app.get('/captcha', handleCaptcha);

if (process.env.NODE_ENV !== 'test') {
  app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
  });
}

export default app;