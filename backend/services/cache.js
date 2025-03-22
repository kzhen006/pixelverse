// FILE: backend/services/cache.js
const { getAsync, setAsync } = require('../config/redis');

// Cache user timeline
const cacheUserTimeline = async (userId, posts) => {
  try {
    await setAsync(`timeline:${userId}`, JSON.stringify(posts), 'EX', 3600); // 1-hour expiry
    return true;
  } catch (err) {
    console.error('Error caching timeline:', err);
    return false;
  }
};

// Get cached timeline
const getCachedTimeline = async (userId) => {
  try {
    const cachedTimeline = await getAsync(`timeline:${userId}`);
    return cachedTimeline ? JSON.parse(cachedTimeline) : null;
  } catch (err) {
    console.error('Error getting cached timeline:', err);
    return null;
  }
};

// Cache trending topics
const cacheTrendingTopics = async (topics) => {
  try {
    await setAsync('trending:topics', JSON.stringify(topics), 'EX', 900); // 15-minute expiry
    return true;
  } catch (err) {
    console.error('Error caching trending topics:', err);
    return false;
  }
};

// Get cached trending topics
const getCachedTrendingTopics = async () => {
  try {
    const cachedTopics = await getAsync('trending:topics');
    return cachedTopics ? JSON.parse(cachedTopics) : null;
  } catch (err) {
    console.error('Error getting cached trending topics:', err);
    return null;
  }
};

module.exports = {
  cacheUserTimeline,
  getCachedTimeline,
  cacheTrendingTopics,
  getCachedTrendingTopics
};