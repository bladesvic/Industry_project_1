const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Assuming you have a User model
const { verifyToken, isAdmin } = require('../middleware/authMiddleware'); // Authorization middleware

// Promote user to admin (Admin only)
router.put('/promote/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if the user is already an admin
    if (user.role === 'admin') {
      return res.status(400).json({ error: 'User is already an admin' });
    }

    // Promote the user to admin
    user.role = 'admin';
    await user.save();

    res.json({ message: `User ${user.email} has been promoted to admin.` });
  } catch (error) {
    res.status(500).json({ error: 'Server error. Could not promote user to admin.' });
  }
});

module.exports = router;

