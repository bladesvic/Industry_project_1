const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { verifyToken, hasRole } = require('../middleware/authMiddleware'); // Updated import

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log(`Login attempt for email: ${email}`); // Debug log
  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.error('User not found for email:', email);
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      console.error('Password mismatch for email:', email);
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment variables');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log('Login successful for email:', email);
    res.json({ token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


// Registration route
router.post('/register', async (req, res) => {
  const { email, password, name, role, teachingAbility } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({
      email,
      passwordHash,
      name,
      role: role || 'user', // Default to 'user' if no role is specified
      teachingAbility: role === 'lecturer' ? teachingAbility || 5 : null,
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({ token, message: 'User registered successfully' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all users (Admin-only route)
router.get('/users', verifyToken, hasRole(['admin']), async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Create a new user (Admin-only route)
router.post('/create', verifyToken, hasRole(['admin']), async (req, res) => {
  const { name, email, password, role, teachingAbility } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      passwordHash,
      role,
      teachingAbility: role === 'lecturer' ? teachingAbility || 5 : null,
    });

    await newUser.save();

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        teachingAbility: newUser.teachingAbility,
      },
    });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update a user's role (Admin-only route)
router.put('/update/:id', verifyToken, hasRole(['admin']), async (req, res) => {
  const { role, teachingAbility } = req.body;

  try {
    const updateData = { role };
    if (role === 'lecturer') {
      updateData.teachingAbility = teachingAbility || 5;
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User updated successfully', user });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete a user (Admin-only route)
router.delete('/delete/:id', verifyToken, hasRole(['admin']), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Fetch all lecturers
router.get('/lecturers', verifyToken, async (req, res) => {
  try {
    const lecturers = await User.find({ role: 'lecturer' }).select('name email teachingAbility');
    res.json(lecturers);
  } catch (err) {
    console.error('Error fetching lecturers:', err);
    res.status(500).json({ error: 'Failed to fetch lecturers' });
  }
});

// Get current user details
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('email name role');
    if (!user) {
      console.error('User not found');
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user); // Respond with the user's details
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
});



module.exports = router;
