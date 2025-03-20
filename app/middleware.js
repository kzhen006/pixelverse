// FILE: app/middleware.js (for Expo Router v3+)
import { useRootNavigationState, useSegments, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from './context/AuthContext';

// Based on Expo Router's recommended auth guard pattern
function useProtectedRoute() {
  const segments = useSegments();
  const router = useRouter();
  const { user, loading } = useAuth();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    // Skip this if the navigation is not ready or still loading
    if (!navigationState?.key || loading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';

    if (!user && !inAuthGroup) {
      // If not logged in and not on an auth page, redirect to login
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      // If logged in and on an auth page, redirect to home
      router.replace('/(tabs)');
    }
  }, [user, loading, segments, navigationState?.key]);
}

// export default useProtectedRoute;

// At the end of your middleware.js file
export { useProtectedRoute };
export default function MiddlewareComponent() {
  // This is a dummy component for Expo Router
  return null;
}