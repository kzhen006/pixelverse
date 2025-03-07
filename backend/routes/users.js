// FILE: backend/routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const auth = require('../middleware/auth');
const multer = require('multer');
const uploadToS3 = require('../utils/s3upload');

// Configure multer
const upload = multer({ storage: multer.memoryStorage() });

// Get user profile by username
router.get('/profile/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-password -integrations.github.accessToken')
      .populate('followers', 'username displayName profilePicture')
      .populate('following', 'username displayName profilePicture');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update user profile
router.put('/profile', auth, upload.single('profilePicture'), async (req, res) => {
  try {
    const { displayName, bio, skills, lookingFor, githubProfile, linkedinProfile } = req.body;
    
    // Build profile object
    const profileFields = {};
    if (displayName) profileFields.displayName = displayName;
    if (bio) profileFields.bio = bio;
    if (skills) profileFields.skills = skills.split(',').map(skill => skill.trim());
    if (lookingFor) profileFields.lookingFor = lookingFor.split(',').map(item => item.trim());
    if (githubProfile) profileFields.githubProfile = githubProfile;
    if (linkedinProfile) profileFields.linkedinProfile = linkedinProfile;
    
    // Upload profile picture if provided
    if (req.file) {
      const profilePictureUrl = await uploadToS3(req.file);
      profileFields.profilePicture = profilePictureUrl;
    }
    
    // Update profile
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: profileFields },
      { new: true }
    ).select('-password -integrations.github.accessToken');
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Follow a user
router.post('/:id/follow', auth, async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ msg: 'You cannot follow yourself' });
    }
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Check if already following
    if (user.followers.includes(req.user.id)) {
      return res.status(400).json({ msg: 'Already following this user' });
    }
    
    // Add to following/followers lists
    await User.findByIdAndUpdate(req.params.id, {
      $push: { followers: req.user.id }
    });
    
    await User.findByIdAndUpdate(req.user.id, {
      $push: { following: req.params.id }
    });
    
    // Notify user about new follower
    req.app.get('io').to(`user_${req.params.id}`).emit('notification', {
      type: 'follow',
      user: req.user.id
    });
    
    res.json({ msg: 'User followed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Unfollow a user
router.delete('/:id/unfollow', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Check if not following
    if (!user.followers.includes(req.user.id)) {
      return res.status(400).json({ msg: 'You are not following this user' });
    }
    
    // Remove from following/followers lists
    await User.findByIdAndUpdate(req.params.id, {
      $pull: { followers: req.user.id }
    });
    
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { following: req.params.id }
    });
    
    res.json({ msg: 'User unfollowed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get user's followers
router.get('/:id/followers', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('followers', 'username displayName profilePicture bio');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    res.json(user.followers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get users being followed by user
router.get('/:id/following', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('following', 'username displayName profilePicture bio');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    res.json(user.following);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;