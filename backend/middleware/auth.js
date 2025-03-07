// FILE: backend/middleware/auth.js
const firebase = require('firebase-admin');

// Firebase already initialized in server.js or a separate init file

const auth = async (req, res, next) => {
  try {
    const idToken = req.header('x-auth-token');
    if (!idToken) {
      return res.status(401).json({ msg: 'No token, authorization denied' });
    }
    
    const decodedToken = await firebase.auth().verifyIdToken(idToken);
    req.user = { id: decodedToken.uid, email: decodedToken.email };
    next();
  } catch (err) {
    console.error('Token verification failed:', err);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

module.exports = auth;