// app/services/authService.js
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signOut,
    updateProfile
  } from 'firebase/auth';
  import { auth } from '../config/firebase';
  import AsyncStorage from '@react-native-async-storage/async-storage';
  
  // Register with email/password - simplified version
  const registerWithEmail = async (email, password, username, displayName) => {
    try {
      console.log("Starting registration process");
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { user } = userCredential;
      
      console.log("User created in Firebase");
      
      // Update profile
      await updateProfile(user, {
        // displayName: displayName || username
        displayName: username || displayName // ****
      });
      
      console.log("Profile updated");
      
      // Get token
      const token = await user.getIdToken();
      await AsyncStorage.setItem('authToken', token);
      
      console.log("Token saved to AsyncStorage");
      
      return { user, token };
    } catch (error) {
      console.error('Registration error:', error.code, error.message);
      throw error;
    }
  };
  
  // Login with email/password
  const loginWithEmail = async (email, password) => {
    try {
      console.log("Attempting login with:", email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const { user } = userCredential;
      
      console.log("Login successful");
      
      const token = await user.getIdToken();
      await AsyncStorage.setItem('authToken', token);
      
      return { user, token };
    } catch (error) {
      console.error('Login error:', error.code, error.message);
      throw error;
    }
  };
  
  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      await AsyncStorage.removeItem('authToken');
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };
  
  // Mock function for username check
  const checkUsernameAvailability = async (username) => {
    // Mock implementation that always returns true for now
    return Promise.resolve(true);
  };
  
  // Group exports together in one place
  export { registerWithEmail, loginWithEmail, logout, checkUsernameAvailability };
  
  // Add default export for Expo Router
  export default function AuthService() {
    return null;
  }