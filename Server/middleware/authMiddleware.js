const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId); // Ensure you're using `userId` here
    if (user && user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ error: 'Access denied' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { verifyToken, isAdmin };
