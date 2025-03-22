// FILE: backend/services/github.js
const axios = require('axios');
const User = require('../models/user');

// Connect GitHub account
const connectGitHub = async (code, userId) => {
  try {
    // Exchange code for access token
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      },
      {
        headers: { Accept: 'application/json' }
      }
    );
    
    const { access_token } = tokenResponse.data;
    if (!access_token) {
      throw new Error('Failed to obtain access token');
    }
    
    // Get user profile from GitHub
    const githubProfile = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `token ${access_token}` }
    });
    
    // Get user's repositories
    const repos = await axios.get('https://api.github.com/user/repos', {
      headers: { Authorization: `token ${access_token}` },
      params: { sort: 'updated', per_page: 5 }
    });
    
    // Update user profile with GitHub info
    await User.findByIdAndUpdate(userId, {
      githubProfile: githubProfile.data.html_url,
      'integrations.github': {
        username: githubProfile.data.login,
        accessToken: access_token,
        avatarUrl: githubProfile.data.avatar_url
      }
    });
    
    return {
      username: githubProfile.data.login,
      avatarUrl: githubProfile.data.avatar_url,
      recentRepos: repos.data.map(repo => ({
        name: repo.name,
        url: repo.html_url,
        description: repo.description,
        stars: repo.stargazers_count,
        language: repo.language
      }))
    };
  } catch (error) {
    console.error('GitHub connection error:', error.response?.data || error.message);
    throw new Error('Failed to connect GitHub account');
  }
};

module.exports = {
  connectGitHub
};