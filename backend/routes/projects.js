// FILE: backend/routes/projects.js
const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const User = require('../models/user');
const auth = require('../middleware/auth');
const axios = require('axios');

// Get all project showcases
router.get('/', async (req, res) => {
  try {
    const { skills, lookingFor, sort } = req.query;
    
    let query = { isProjectShowcase: true };
    
    if (skills) {
      const skillsArray = skills.split(',');
      query.hashtags = { $in: skillsArray };
    }
    
    if (lookingFor) {
      query.collaboratorsNeeded = true;
      if (lookingFor !== 'any') {
        query.skillsNeeded = { $in: lookingFor.split(',') };
      }
    }
    
    let sortOption = {};
    if (sort === 'latest') {
      sortOption = { createdAt: -1 };
    } else if (sort === 'popular') {
      sortOption = { likes: -1 };
    } else {
      sortOption = { createdAt: -1 }; // Default to latest
    }
    
    const projects = await Post.find(query)
      .sort(sortOption)
      .populate('user', 'username displayName profilePicture skills githubProfile')
      .limit(20);
    
    res.json(projects);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Share GitHub repository as project
router.post('/share/repository', auth, async (req, res) => {
  try {
    const { repoName, description, lookingForCollaborators, skillsNeeded } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user || !user.integrations || !user.integrations.github) {
      return res.status(400).json({ msg: 'GitHub account not connected' });
    }
    
    // Get repository details from GitHub
    try {
      const repoResponse = await axios.get(
        `https://api.github.com/repos/${user.integrations.github.username}/${repoName}`,
        {
          headers: { Authorization: `token ${user.integrations.github.accessToken}` }
        }
      );
      
      const repo = repoResponse.data;
      
      // Create new post with repository details
      const newPost = new Post({
        user: req.user.id,
        content: description || `Check out my GitHub repository: ${repo.name}`,
        projectLink: repo.html_url,
        isProjectShowcase: true,
        collaboratorsNeeded: lookingForCollaborators === true,
        skillsNeeded: skillsNeeded || [],
        hashtags: repo.language ? [repo.language] : []
      });
      
      const post = await newPost.save();
      const populatedPost = await Post.findById(post._id).populate('user', 'username displayName profilePicture');
      
      // Notify followers
      req.app.get('io').to(`user_${req.user.id}_followers`).emit('newPost', populatedPost);
      
      res.json(populatedPost);
    } catch (error) {
      console.error('GitHub API error:', error.response?.data || error.message);
      return res.status(400).json({ msg: 'Error fetching repository details' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;