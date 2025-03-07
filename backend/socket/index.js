// FILE: backend/socket/index.js
const User = require('../models/user');
const Post = require('../models/post');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    // Join user's room for personal notifications
    socket.on('joinUserRoom', (userId) => {
      if (!userId) return;
      socket.join(`user_${userId}`);
      console.log(`User ${userId} joined their room`);
    });
    
    // Join room for followers
    socket.on('joinFollowersRoom', (userId) => {
      if (!userId) return;
      socket.join(`user_${userId}_followers`);
      console.log(`Joined followers room for user ${userId}`);
    });
    
    // Like notification
    socket.on('likePost', async ({ postId, userId, likedByUser }) => {
      try {
        const post = await Post.findById(postId).populate('user', '_id');
        if (post && post.user._id.toString() !== likedByUser) {
          io.to(`user_${post.user._id}`).emit('notification', {
            type: 'like',
            postId,
            user: userId
          });
        }
      } catch (err) {
        console.error('Socket error on likePost:', err);
      }
    });
    
    // Comment notification
    socket.on('commentPost', async ({ postId, userId, commentId }) => {
      try {
        const post = await Post.findById(postId).populate('user', '_id');
        if (post) {
          io.to(`user_${post.user._id}`).emit('notification', {
            type: 'comment',
            postId,
            commentId,
            user: userId
          });
        }
      } catch (err) {
        console.error('Socket error on commentPost:', err);
      }
    });
    
    // Project collaboration request
    socket.on('collaborationRequest', ({ projectId, fromUser, toUser, message }) => {
      if (!toUser) return;
      io.to(`user_${toUser}`).emit('collaborationRequest', {
        projectId,
        fromUser,
        message
      });
    });
    
    // User typing indicator
    socket.on('typing', ({ userId, recipientId }) => {
      if (!recipientId) return;
      socket.to(`user_${recipientId}`).emit('userTyping', { userId });
    });
    
    // User stopped typing
    socket.on('stopTyping', ({ userId, recipientId }) => {
      if (!recipientId) return;
      socket.to(`user_${recipientId}`).emit('userStoppedTyping', { userId });
    });
    
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
};