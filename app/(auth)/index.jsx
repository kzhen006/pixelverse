

// app/(auth)/index.jsx
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';

export default function AuthIndex() {
  // Using Redirect is more reliable than useEffect + router.replace
  return <Redirect href="/(auth)/login" />;
}