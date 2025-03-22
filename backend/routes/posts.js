// FILE: backend/routes/posts.js
const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const User = require('../models/user');
const auth = require('../middleware/auth');
const multer = require('multer');
const uploadToS3 = require('../utils/s3upload');
const { cacheUserTimeline, getCachedTimeline } = require('../services/cache');

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Create a post
router.post('/', auth, upload.array('media', 4), async (req, res) => {
  try {
    const { content, hashtags, projectLink, isProjectShowcase, collaboratorsNeeded, skillsNeeded } = req.body;
    
    let mediaUrls = [];
    if (req.files && req.files.length > 0) {
      // Upload each file to S3 and get URLs
      mediaUrls = await Promise.all(req.files.map(file => uploadToS3(file)));
    }
    
    const newPost = new Post({
      user: req.user.id,
      content,
      media: mediaUrls,
      hashtags: hashtags ? JSON.parse(hashtags) : [],
      projectLink,
      isProjectShowcase: isProjectShowcase === 'true',
      collaboratorsNeeded: collaboratorsNeeded === 'true',
      skillsNeeded: skillsNeeded ? JSON.parse(skillsNeeded) : []
    });
    
    const post = await newPost.save();
    
    // Populate user details for the response
    const populatedPost = await Post.findById(post._id).populate('user', 'username displayName profilePicture');
    
    // Emit socket event for new post (this should be handled by the socket service)
    req.app.get('io').to(`user_${req.user.id}_followers`).emit('newPost', populatedPost);
    
    res.json(populatedPost);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get timeline posts
router.get('/timeline', auth, async (req, res) => {
  try {
    // Check cache first
    const cachedTimeline = await getCachedTimeline(req.user.id);
    if (cachedTimeline) {
      return res.json(cachedTimeline);
    }
    
    // Get user's following list
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Get posts from users they follow and their own posts
    const timelinePosts = await Post.find({
      $or: [
        { user: { $in: user.following } },
        { user: req.user.id }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('user', 'username displayName profilePicture')
      .populate({
        path: 'comments',
        options: { limit: 2, sort: { createdAt: -1 } },
        populate: {
          path: 'user',
          select: 'username displayName profilePicture'
        }
      });
    
    // Cache the timeline
    await cacheUserTimeline(req.user.id, timelinePosts);
    
    res.json(timelinePosts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Additional routes...
// Like a post
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    
    // Check if already liked
    if (post.likes.includes(req.user.id)) {
      return res.status(400).json({ msg: 'Post already liked' });
    }
    
    post.likes.push(req.user.id);
    await post.save();
    
    // Notify post owner
    if (post.user.toString() !== req.user.id) {
      req.app.get('io').to(`user_${post.user}`).emit('notification', {
        type: 'like',
        postId: post._id,
        user: req.user.id
      });
    }
    
    res.json({ likes: post.likes });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;