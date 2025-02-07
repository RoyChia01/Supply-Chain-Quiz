import { KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableOpacity, View, Image } from 'react-native'
import React, { useState } from 'react';
import { FIREBASE_APP, FIREBASE_AUTH, FIRESTORE_DB } from '../tabs/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { getAuth, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const SignUpScreen = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [username, setUsername] = useState('')
    const [loading, setLoading] = useState(false);
    const point = 0;
    const auth = getAuth();
    const navigation = useNavigation();

    const signUp = async (email, password, username, point) => {
        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await sendEmailVerification(user, {
                handleCodeInApp: true,
                url: 'https://rsaf-72426.firebaseapp.com',
            });

            alert('Verification Email Sent');

            await setDoc(doc(FIRESTORE_DB, 'users', user.uid), {
                username,
                point,
                email,
            });

            navigation.goBack();  

        } catch (error) {
            console.log(error);
            alert('Registration failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <KeyboardAvoidingView style={styles.container} behavior='padding'>
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
                      Register
                    </Text>
            <View style={styles.inputContainer}>
                <View style={styles.input}>
                    <MaterialIcons 
                      name='account-circle' 
                      size={20} 
                      color='#666' 
                    />
                    <TextInput
                        placeholder="Full Name"
                        value={username}
                        onChangeText={text => setUsername(text)}
                        width= {250}
                        height= {40}
                    />
                </View>
            </View>
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
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    onPress={() => signUp(email, password, username, point)}
                    style={[styles.button, styles.buttonOutlines]}
                >
                    <Text style={styles.buttonOutlineText}>Register</Text>
                </TouchableOpacity>
                <View style={{flexDirection:'row', marginTop: 5, justifyContent: 'center'}}>
                      <Text style={{fontSize: 16, color: '#000000'}}>Already registered?</Text>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                          <Text style={{fontSize: 16, fontWeight: 'bold', color: '#FFD700'}}> Login</Text>
                        </TouchableOpacity>
                      </View>
            </View>
        </KeyboardAvoidingView>
    )
}

export default SignUpScreen

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
      color: '#666',
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
