import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../tabs/firebase';
import { postUser } from './apiHandler';

const SignUpScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigation = useNavigation();

  const validateInputs = () => {
    if (!username.trim()) return 'Please enter a valid name.';
    if (!email.includes('@')) return 'Please enter a valid email address.';
    if (password.length < 6) return 'Password must be at least 6 characters long.';
    return null;
  };

  const signUp = async () => {
    setError('');
    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(FIREBASE_AUTH, email, password);
      const user = userCredential.user;

      await sendEmailVerification(user);
      Alert.alert('Verification Email Sent', 'Please check your inbox to verify your email.');

      await setDoc(doc(FIRESTORE_DB, 'users', user.uid), { username, email, points: 0 });
      postUser(username, email); // Post the user data to the backend
      navigation.goBack();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior='padding'>
      <Image source={require('../images/AFTC.png')} style={styles.logo} />
      <Text style={styles.title}>Register</Text>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      
      <View style={styles.inputContainer}>
        <View style={styles.inputField}>
          <MaterialIcons name='account-circle' size={25} color='#666' />
          <TextInput placeholder='Full Name' value={username} onChangeText={setUsername} style={styles.input} />
        </View>
        <View style={styles.inputField}>
          <MaterialIcons name='mail' size={25} color='#666' />
          <TextInput placeholder='Email' value={email} onChangeText={(text) => setEmail(text.toLowerCase())} style={styles.input} keyboardType='email-address' />
        </View>
        <View style={styles.inputField}>
          <MaterialIcons name='lock' size={25} color='#666' />
          <TextInput placeholder='Password' value={password} onChangeText={setPassword} style={styles.input} secureTextEntry />
        </View>
      </View>
      
      <TouchableOpacity onPress={signUp} style={[styles.button, loading && styles.disabledButton]} disabled={loading}>
        {loading ? <ActivityIndicator color='#000' /> : <Text style={styles.buttonText}>Register</Text>}
      </TouchableOpacity>
      
      <View style={styles.loginRedirect}>
        <Text style={styles.loginText}>Already registered?</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.loginLink}> Login</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2F4F6D',
    paddingHorizontal: 20,
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  inputContainer: {
    width: '100%',
  },
  inputField: {
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    marginLeft: 10,
    height: 40,
  },
  button: {
    backgroundColor: '#FFD700',
    width: '100%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 20,
  },
  loginRedirect: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'center',
  },
  loginText: {
    fontSize: 20,
    color: '#000',
  },
  loginLink: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
  },
});

export default SignUpScreen;
