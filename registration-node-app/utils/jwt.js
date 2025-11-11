import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET;

export function authenticateJWT(req, res, next) {
  console.log("authenticateJWT triggered");
  const authHeader = req.headers.authorization;
  console.log("authHeader: ", authHeader);
  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, JWT_SECRET, (err, user) => {
      console.log("Decoded user:", user);
      if (err) {
        return res.status(403).json({ success: false, message: "Invalid token" });
      }
      req.user = user; //token payload
      next();
    });
  } else {
    res.sendStatus(401); //no token
  }
}