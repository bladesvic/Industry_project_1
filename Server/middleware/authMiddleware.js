const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify Token Middleware
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    console.error('No token provided');
    return res.status(401).json({ error: 'Access denied' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    console.log('Verified token for user:', verified);
    next();
  } catch (error) {
    console.error('Invalid or expired token:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Role-Based Access Middleware
const hasRole = (roles) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user.userId);
      console.log('User role:', user.role);

      if (!user) {
        console.error('User not found');
        return res.status(404).json({ error: 'User not found' });
      }

      if (roles.includes(user.role)) {
        console.log('User has required role:', user.role);
        next();
      } else {
        console.error('Access denied for role:', user.role);
        res.status(403).json({ error: 'Access denied' });
      }
    } catch (error) {
      console.error('Authorization error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  };
};

module.exports = { verifyToken, hasRole };

