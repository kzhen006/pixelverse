// app/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBCq3vRCrfGtUWr5i1MUK1XsiTO0ZR8cxw",
    authDomain: "pixelverse-b07cb.firebaseapp.com",
    projectId: "pixelverse-b07cb",
    storageBucket: "pixelverse-b07cb.firebasestorage.app",
    messagingSenderId: "88867189684",
    appId: "1:88867189684:web:b17fdf5647274c2f47b8e1",
    measurementId: "G-FT5QCG3ZEK"
  };

// Initialize Firebase only once
let app;
let auth;

try {
  // Check if Firebase app is already initialized
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  console.log("Firebase initialized successfully");
} catch (error) {
  // If Firebase is already initialized, use the existing instance
  console.log("Firebase initialization error:", error.message);
  if (error.code === 'auth/already-initialized') {
    app = initializeApp(firebaseConfig, "secondary");
    auth = getAuth(app);
  } else {
    throw error;
  }
}

export { auth, app };

// Add a default export for Expo Router
export default function FirebaseConfig() {
  return null;
}

