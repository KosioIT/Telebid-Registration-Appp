import jwt from 'jsonwebtoken';
import { JWT_SECRET } from "../config.js";

export function authenticateJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(" ")[1];
        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({ success: false, message: "Invalid token" });
            }
            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
}
