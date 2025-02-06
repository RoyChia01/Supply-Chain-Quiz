import { KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableOpacity, View, Image } from 'react-native';
import React, { useState } from 'react';
import { FIREBASE_AUTH } from '../tabs/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const signIn = async () => {
    setLoading(true);
    try {
      const response = await signInWithEmailAndPassword(FIREBASE_AUTH, email, password);
      console.log('User logged in:', response);
      navigation.navigate('Home',{ email: email }); 
    } catch (error) {
      console.error(error);
      alert('Sign in failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <Image
        source={require('../images/AFTC.png')}  
        style={{width: 150,   height: 150,  resizeMode: 'contain',}}
      />
      <Text
        style={{
          fontFamily: 'Roboto-medium',
          fontSize: 28,
          fontWeight: '500',
          color: '#000',
          fontWeight: 'bold',
          marginBottom: 10,
          }}>
          Login
        </Text>
      <View style={styles.inputContainer}>
        <View style={styles.input}>
          <MaterialIcons 
          name='mail' 
          size={20} 
          color='#666' 
          />
          <TextInput
            placeholder= "Email"
            value={email}
            onChangeText={(text) => setEmail(text)}
            width= {250}
            height= {40}
          />
        </View>
      </View>
      <View style={styles.inputContainer}>
        <View style={styles.input}>
          <MaterialIcons 
            name='lock' 
            size={20} 
            color='#666' 
          />
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={(text) => setPassword(text)}
            secureTextEntry
            width= {250}
            height= {40}
          />
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('ForgetPassword')} style={{marginTop: 10}}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#FFD700' }}>Forget Password?</Text>
          </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={signIn} style={[styles.button, styles.buttonOutlines]}>
          <Text style={styles.buttonOutlineText}>Login</Text>
        </TouchableOpacity>
      </View>
      <View style={{flexDirection:'row', marginTop: 5}}>
      <Text style={{fontSize: 16, color: '#000000'}}>New to the app?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text style={{fontSize: 16, fontWeight: 'bold', color: '#FFD700'}}> Register</Text>
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
    backgroundColor: '#2F4F6D'
  },
  inputContainer: {
    width: '80%',
  },
  input: {
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginTop: 5,
    flexDirection:'row',
    alignItems: 'center',
  },
  buttonContainer: {
    width: '70%',
    justifyContent: 'center',
    marginTop: 10,
  },
  button: {
    backgroundColor: '#2F4F6D',
    width: '100%',
    padding: 15,
    borderRadius: 10,
  },
  buttonOutlines: {
    backgroundColor: '#FFD700',
    marginTop: 5,
    borderColor: '#000000',
    borderWidth: 2,
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  buttonOutlineText: {
    color: '#000000',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default LoginScreen;
