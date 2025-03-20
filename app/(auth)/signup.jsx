// FILE: app/(auth)/signup.jsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { router, Link } from 'expo-router';
import { registerWithEmail, checkUsernameAvailability } from '../services/authService';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [usernameChecking, setUsernameChecking] = useState(false);

  // Check username availability with debounce
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (username && username.length >= 3) {
        setUsernameChecking(true);
        try {
          const available = await checkUsernameAvailability(username);
          setUsernameAvailable(available);
        } catch (error) {
          console.error('Error checking username:', error);
        } finally {
          setUsernameChecking(false);
        }
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [username]);

  const validateForm = () => {
    let formErrors = {};
    let isValid = true;

    // Email validation
    if (!email) {
      formErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      formErrors.email = 'Email is invalid';
      isValid = false;
    }

    // Username validation
    if (!username) {
      formErrors.username = 'Username is required';
      isValid = false;
    } else if (username.length < 3) {
      formErrors.username = 'Username must be at least 3 characters';
      isValid = false;
    } else if (!usernameAvailable) {
      formErrors.username = 'Username is already taken';
      isValid = false;
    }

    // Password validation
    if (!password) {
      formErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      formErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    // Confirm password
    if (password !== confirmPassword) {
      formErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(formErrors);
    return isValid;
  };

  const handleSignup = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await registerWithEmail(email, password, username, displayName);
      router.replace('/(tabs)');
    } catch (error) {
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email is already in use. Try logging in instead.';
      }
      
      Alert.alert('Signup Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>Create Account</ThemedText>
        <ThemedText style={styles.subtitle}>Join the tech community</ThemedText>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Email</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="your-email@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#999"
            />
            {errors.email && <ThemedText style={styles.errorText}>{errors.email}</ThemedText>}
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Username</ThemedText>
            <View style={styles.usernameContainer}>
              <TextInput
                style={[styles.input, styles.usernameInput]}
                placeholder="Choose a unique username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                placeholderTextColor="#999"
              />
              {usernameChecking ? (
                <ActivityIndicator size="small" color="#0000ff" />
              ) : (
                username.length >= 3 && (
                  usernameAvailable === true ? (
                    <ThemedText style={styles.availableText}>✓</ThemedText>
                  ) : (
                    usernameAvailable === false && (
                      <ThemedText style={styles.takenText}>✗</ThemedText>
                    )
                  )
                )
              )}
            </View>
            {errors.username && <ThemedText style={styles.errorText}>{errors.username}</ThemedText>}
          </View>

          {/* <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Display Name</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Your name to display"
              value={displayName}
              onChangeText={setDisplayName}
              placeholderTextColor="#999"
            />
          </View> */}

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Password</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Password (6+ characters)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor="#999"
            />
            {errors.password && <ThemedText style={styles.errorText}>{errors.password}</ThemedText>}
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Confirm Password</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              placeholderTextColor="#999"
            />
            {errors.confirmPassword && <ThemedText style={styles.errorText}>{errors.confirmPassword}</ThemedText>}
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <ThemedText style={styles.buttonText}>Sign Up</ThemedText>
            )}
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <ThemedText>Already have an account?</ThemedText>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <ThemedText style={styles.loginLink}>Log In</ThemedText>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  usernameInput: {
    flex: 1,
  },
  availableText: {
    color: 'green',
    marginLeft: 10,
    fontSize: 18,
  },
  takenText: {
    color: 'red',
    marginLeft: 10,
    fontSize: 18,
  },
  button: {
    backgroundColor: '#4e8df5',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: 5,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    gap: 5,
  },
  loginLink: {
    color: '#4e8df5',
    fontWeight: 'bold',
  },
});