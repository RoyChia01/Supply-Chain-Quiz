/**
 * LoginScreen Component
 * 
 * This component handles user authentication by allowing users to sign in using their email and password.
 * It integrates Firebase authentication and manages UI elements for user-friendly interaction.
 * 
 * Features:
 * - Email and password input fields with validation and error handling.
 * - Firebase authentication using `signInWithEmailAndPassword`.
 * - Displays appropriate error messages for failed login attempts.
 * - "Forgot Password" option for password recovery.
 * - Navigation to the main application upon successful login.
 * - Navigation to the registration screen for new users.
 * - Styled UI with an Air Force-inspired theme (blue and gold).
 * 
 * Data Flow:
 * - Uses `useState` to manage email, password, and loading state.
 * - Calls `signInWithEmailAndPassword` for authentication.
 * - On successful login, updates the user context (`setUserEmail`) and navigates to `MainTabs`.
 * - Displays errors using `Alert.alert` based on Firebase authentication error codes.
 * 
 * Functions:
 * - `signIn()`: Handles user login, manages authentication, and displays appropriate error messages.
 * 
 * UI Elements:
 * - `TextInput`: For user email and password input.
 * - `TouchableOpacity`: For login button, forgot password navigation, and registration link.
 * - `KeyboardAvoidingView`: Ensures proper layout handling on different devices.
 * - `SafeAreaView`: Provides consistent UI across various screen sizes.
 * - `MaterialIcons`: Enhances input fields with icons.
 * 
 * Styling:
 * - Uses a **blue (#2F4F6D) and gold (#FFD700) Air Force-inspired theme**.
 * - Rounded input fields and buttons for a modern UI experience.
 * - Ensures accessibility with proper text contrast and spacing.
 */

import React, { useState } from 'react';
import { 
  KeyboardAvoidingView, SafeAreaView, StyleSheet, Text, 
  TextInput, TouchableOpacity, View, Image, Platform, Alert 
} from 'react-native';
import { FIREBASE_AUTH } from '../tabs/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useUser } from './userInfo';
import { LogBox } from 'react-native';

LogBox.ignoreAllLogs(); // Ignore all log notifications

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const { setUserEmail } = useUser();

  const signIn = async () => {
    setLoading(true);
    try {
      const response = await signInWithEmailAndPassword(FIREBASE_AUTH, email, password);
      console.log('User logged in:', response);
  
      setUserEmail(email);
      navigation.navigate('MainTabs'); 
    } catch (error) {
      console.error(error);
  
      let errorMessage = 'Sign in failed. Please try again.';
      
      if (error.code === 'auth/invalid-email') {
        errorMessage = 'The email address is not valid.';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'No user found with this email address.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many attempts. Please try again later.';
      }
  
      Alert.alert('Sign in failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Image source={require('../images/IconSC.png')} style={styles.logo} />
        
        <Text style={styles.title}>Login</Text>
        
        <View style={styles.inputContainer}>
          <View style={styles.input}>
            <MaterialIcons name="mail" size={25} color="#666" />
            <TextInput
              placeholder="Email"
              placeholderTextColor="#666"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.textInput}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.input}>
            <MaterialIcons name="lock" size={25} color="#666" />
            <TextInput
              placeholder="Password"
              placeholderTextColor="#666"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.textInput}
            />
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('ForgetPassword')} style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forget Password?</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={signIn} style={styles.button}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>New to the app?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.registerLink}> Register</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#2F4F6D',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#2F4F6D',
  },
  logo: {
    width: 350,
    height: 250,
    resizeMode:'cover',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 10,
  },
  inputContainer: {
    width: '80%',
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
  },
  forgotPassword: {
    marginTop: 10,
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  buttonContainer: {
    width: '70%',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#FFD700',
    paddingVertical: 15,
    borderRadius: 10,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    color: '#000',
  },
  registerContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  registerText: {
    fontSize: 20,
    color: '#000',
  },
  registerLink: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
  },
});

export default LoginScreen;
