// FILE: backend/routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const firebase = require('firebase-admin');

// Register user
router.post('/register', async (req, res) => {
  try {
    const { email, password, username, displayName } = req.body;
    
    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ msg: 'Username already taken' });
    }
    
    // Create user in Firebase
    const userRecord = await firebase.auth().createUser({
      email,
      password,
      displayName: displayName || username
    });
    
    // Create user in MongoDB
    const newUser = new User({
      _id: userRecord.uid, // Use Firebase UID as MongoDB _id
      email,
      username,
      displayName: displayName || username
    });
    
    await newUser.save();
    
    res.status(201).json({ 
      msg: 'User registered successfully',
      user: {
        id: newUser._id,
        username: newUser.username,
        displayName: newUser.displayName,
        email: newUser.email
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Login - handled by Firebase on client side, just for verification
router.post('/login', async (req, res) => {
  res.status(200).json({ msg: 'Authentication should be handled by Firebase client SDK' });
});

// Get current user profile
router.get('/me', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;