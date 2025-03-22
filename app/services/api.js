// FILE: app/services/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL - Change to your backend URL
const API_URL = 'http://192.168.0.23:5001/api'; // Use the same port as your backend

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use(
    async (config) => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          config.headers['x-auth-token'] = token;
        }
      } catch (error) {
        console.log('Error getting token from AsyncStorage:', error);
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

// Handle token expiration
// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     // If 401 Unauthorized, token might be expired
//     if (error.response && error.response.status === 401) {
//       await AsyncStorage.removeItem('authToken');
//       // You could implement auto-refresh token here
//     }
//     return Promise.reject(error);
//   }
// );

// export { api };
// export { api };
// export default function ApiService() {
//   // This is a dummy component for Expo Router
//   return null;
// }

export { api };
export default api; // Export the API object as default

