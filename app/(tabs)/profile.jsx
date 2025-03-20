// FILE: app/(tabs)/profile.jsx
import React from 'react';
import { StyleSheet, View, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '../context/AuthContext';
import { logout } from '../services/authService';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function ProfileScreen() {
  const { user } = useAuth();
  
  const handleLogout = async () => {
    try {
      await logout();
      // Manually redirect to login page
    router.replace('/(auth)/login');
      // AuthContext will handle redirection
    } catch (error) {
      Alert.alert('Logout Error', 'Failed to log out. Please try again.');
    }
  };
//   console.log("User object:", JSON.stringify(user, null, 2));
  return (
    <ScrollView style={styles.scrollContainer}>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.header}>
          <Image 
            source={{ 
              uri: user?.photoURL || 'https://via.placeholder.com/150'
            }}
            style={styles.profileImage}
          />
          <ThemedText type="title">{user?.displayName || 'User'}</ThemedText>
          {/* <ThemedText>@{user?.profile?.username || 'username'}</ThemedText> */}
          <ThemedText>@{
  // First option: get username from the profile if it exists
  user?.profile?.username ||
  // Second option: use username property if directly available
  user?.username ||
  // Third option: convert the email to a username 
  user?.email?.split('@')[0] ||
  // Fallback option
  'username'
}</ThemedText>
          {/* <ThemedText>@{user?.displayName || 'username'}</ThemedText> */}
          {/* <ThemedText>@{user?.username || user?.email?.split('@')[0] || 'username'}</ThemedText> */}
          
          {user?.profile?.bio && (
            <ThemedText style={styles.bio}>{user.profile.bio}</ThemedText>
          )}
        </ThemedView>
        
        <ThemedView style={styles.statsContainer}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>
              {user?.profile?.following?.length || 0}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Following</ThemedText>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>
              {user?.profile?.followers?.length || 0}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Followers</ThemedText>
          </View>
        </ThemedView>
        
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => router.push('/edit-profile')}
        >
          <ThemedText style={styles.editButtonText}>Edit Profile</ThemedText>
        </TouchableOpacity>
        
        {user?.profile?.skills && user.profile.skills.length > 0 && (
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle">Skills</ThemedText>
            <View style={styles.skillsContainer}>
              {user.profile.skills.map((skill, index) => (
                <View key={index} style={styles.skillBadge}>
                  <ThemedText style={styles.skillText}>{skill}</ThemedText>
                </View>
              ))}
            </View>
          </ThemedView>
        )}
        
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <IconSymbol name="rectangle.portrait.and.arrow.right" color="#ff3b30" size={20} />
          <ThemedText style={styles.logoutText}>Log Out</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  bio: {
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
  },
  statDivider: {
    height: 30,
    width: 1,
    backgroundColor: '#ddd',
  },
  editButton: {
    borderWidth: 1,
    borderColor: '#4e8df5',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignSelf: 'center',
    marginBottom: 30,
  },
  editButtonText: {
    color: '#4e8df5',
  },
  section: {
    marginBottom: 20,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  skillBadge: {
    backgroundColor: '#e9f2ff',
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 12,
    margin: 5,
  },
  skillText: {
    color: '#4e8df5',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginTop: 20,
  },
  logoutText: {
    color: '#ff3b30',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});