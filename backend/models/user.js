// FILE: backend/models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  displayName: { type: String },
  bio: { type: String },
  profilePicture: { type: String },
  skills: [{ type: String }],
  lookingFor: [{ type: String }], // "collaboration", "mentor", "job", etc.
  githubProfile: { type: String },
  linkedinProfile: { type: String },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  integrations: {
    github: {
      username: { type: String },
      accessToken: { type: String },
      avatarUrl: { type: String }
    }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);