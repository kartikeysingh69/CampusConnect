// middleware/auth.js — JWT Token Verification
// Yeh check karta hai ki request karne wala logged in hai ya nahi

const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  // Request header me 'Authorization: Bearer <token>' format expected
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN" se TOKEN nikalo

  if (!token) {
    return res.status(401).json({ message: '❌ Access Denied: No token provided' });
  }

  try {
    // Token verify karo (JWT_SECRET se)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // User info next route me available ho jati hai
    next(); // Aage badho (actual route handler ko call karo)
  } catch (err) {
    return res.status(403).json({ message: '❌ Invalid or expired token. Please login again.' });
  }
};

module.exports = verifyToken;
