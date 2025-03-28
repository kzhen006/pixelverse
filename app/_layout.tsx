// app/_layout.tsx
import { View, Text } from 'react-native'
import React from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { AuthProvider } from './context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Tabs } from 'expo-router'
import TabBar from '../components/TabBar'

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const _layout = () => {
  return (
    <Tabs
        tabBar={props=> <TabBar {...props} />}
    >
        <Tabs.Screen
            name="index"
            options={{
                title: "Home"
            }}
        />
        <Tabs.Screen
            name="explore"
            options={{
                title: "Explore"
            }}
        />
        <Tabs.Screen
            name="create"
            options={{
                title: "Create"
            }}
        />
        <Tabs.Screen
            name="profile"
            options={{
                title: "Profile"
            }}
        />
    </Tabs>
  )
}

export default _layout