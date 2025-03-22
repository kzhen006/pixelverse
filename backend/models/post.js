// FILE: backend/models/Post.js
const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  media: [{ type: String }], // URLs to S3
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  reposts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  hashtags: [{ type: String }],
  projectLink: { type: String }, // GitHub/project URL if applicable
  isProjectShowcase: { type: Boolean, default: false },
  collaboratorsNeeded: { type: Boolean, default: false },
  skillsNeeded: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', PostSchema);