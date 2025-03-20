// // FILE: app/context/AuthContext.jsx
// import React, { createContext, useState, useEffect, useContext } from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { onAuthStateChanged } from 'firebase/auth';
// import { auth } from '../config/firebase';
// import { api } from '../services/api';
// import { router } from 'expo-router';

// const AuthContext = createContext(null);

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
//       if (firebaseUser) {
//         try {
//           // Get token and store it
//           const token = await firebaseUser.getIdToken();
//           await AsyncStorage.setItem('authToken', token);

//           // Try to get user profile from backend
//           try {
//             const response = await api.get('/auth/me', {
//               headers: { 'x-auth-token': token }
//             });
            
//             setUser({
//               ...firebaseUser,
//               profile: response.data
//             });
//           } catch (error) {
//             // If backend call fails, use firebase user
//             console.log('Error getting profile, using Firebase user info');
//             setUser(firebaseUser);
//           }
//         } catch (error) {
//           console.error('Error in auth state change:', error);
//         }
//       } else {
//         setUser(null);
//         await AsyncStorage.removeItem('authToken');
//       }
//       setLoading(false);
//     });

//     return unsubscribe;
//   }, []);

//   const value = {
//     user,
//     loading,
//     isAuthenticated: !!user,
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// }

// export { useAuth, AuthProvider };

// export default AuthProvider;

// app/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, app } from '../config/firebase';
import { api } from '../services/api';
import { router } from 'expo-router';

const AuthContext = createContext(null);

// Define the hook but DON'T export it here
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// AuthProvider component
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get token and store it
          const token = await firebaseUser.getIdToken();
          await AsyncStorage.setItem('authToken', token);

          // Try to get user profile from backend
          try {
            const response = await api.get('/auth/me', {
              headers: { 'x-auth-token': token }
            });
            
            setUser({
              ...firebaseUser,
              profile: response.data
            // username: username || firebaseUser.email.split('@')[0]
//             username: username || firebaseUser.email.split('@')[0], // Fallback to email prefix ***
//   profile: { username: username }
            });
          } catch (error) {
            // If backend call fails, use firebase user
            console.log('Error getting profile, using Firebase user info');
            setUser(firebaseUser);
          }
        } catch (error) {
          console.error('Error in auth state change:', error);
        }
      } else {
        setUser(null);
        await AsyncStorage.removeItem('authToken');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Export both as named exports here (only once)
export { useAuth, AuthProvider };

// Export AuthProvider as default export
export default AuthProvider;