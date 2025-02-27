/**
 * ResetPasswordScreen Component
 * -----------------------------
 * This screen allows users to reset their password by entering their email.
 * A password reset email is sent via Firebase Authentication.
 * 
 * Features:
 * - Validates email input before submission.
 * - Sends a password reset email using Firebase Auth.
 * - Displays success and error messages based on Firebase response.
 * - Uses React Native UI components for a smooth user experience.
 * - Handles keyboard behavior for better accessibility.
 * 
 * Dependencies:
 * - `firebase/auth` for authentication handling.
 * - `react-navigation` for navigation.
 * - `react-native` components for UI and interaction.
 * - `SvgIcon` for vector icons.
 * - `Fonts` for consistent typography.
 * 
 * UI Components:
 * - `TextInput`: User inputs email for password reset.
 * - `Pressable`: Button for submitting the request.
 * - `SvgIcon`: Displays icons for visual cues.
 * - `KeyboardAvoidingView`: Adjusts UI for keyboard interactions.
 * 
 * Behavior:
 * - If the email is invalid or empty, an alert prompts the user.
 * - If the email exists, Firebase sends a reset link.
 * - Error messages handle cases like invalid emails, user not found, or network failures.
 * - On success, navigates back to the login screen.
 */
import React, { useState } from 'react';
import { 
  Text, View, Pressable, StyleSheet, TextInput, Alert, 
  KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, SafeAreaView 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { sendPasswordResetEmail } from 'firebase/auth';
import { FIREBASE_AUTH } from '../tabs/firebase';
import Fonts from '../common/fonts';
import SvgIcon from '../common/SvgIcon';
import { LogBox } from 'react-native';

LogBox.ignoreAllLogs(); // Ignore all log notifications

const ResetPasswordScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email.');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }

    try {
      await sendPasswordResetEmail(FIREBASE_AUTH, email);
      Alert.alert('Success', 'Password reset email sent!');
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } catch (error) {
      let errorMessage = 'Something went wrong. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No user found with this email.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection.';
      }

      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.container}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.innerContainer}>
            <View style={styles.header}>
              <Pressable onPress={() => navigation.goBack()}>
                <SvgIcon icon="back" width={30} height={30} fill="#FFD700" />
              </Pressable>
            </View>

            <View style={styles.content}>
              <SvgIcon icon="reset" width={200} height={200} />

              <Text style={styles.title}>Reset Password</Text>

              <View style={styles.inputContainer}>
                <SvgIcon icon="lock" width={25} height={25} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter Email"
                  placeholderTextColor="#FFD700"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <Pressable style={styles.button} onPress={handleResetPassword}>
                <Text style={styles.buttonText}>Submit</Text>
              </Pressable>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ResetPasswordScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#2F4F6D', // Ensure consistent background
  },
  container: {
    flex: 1,
    backgroundColor: '#2F4F6D',
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    position: 'absolute',
    top: 20,
    left: 20,
  },
  content: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  title: {
    color: '#FFD700',
    fontSize: 40,
    fontFamily: Fonts.type.NotoSansExtraBold,
    textAlign: 'center',
    marginVertical: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: '#aaa',
    borderBottomWidth: 1,
    width: '100%',
    paddingVertical: 8,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    color: '#FFD700',
    fontSize: 18,
    fontFamily: Fonts.type.NotoSansMedium,
    paddingLeft: 10,
  },
  button: {
    backgroundColor: '#FFD700',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 50,
    marginTop: 30,
  },
  buttonText: {
    fontSize: 20,
    fontFamily: Fonts.type.NotoSansBlack,
    color: '#fff',
  },
});
