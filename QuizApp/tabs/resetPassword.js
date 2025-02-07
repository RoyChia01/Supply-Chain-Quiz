import React, { useState } from 'react';
import { Text, View, Pressable, StyleSheet, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { sendPasswordResetEmail } from 'firebase/auth';
import { FIREBASE_AUTH } from '../tabs/firebase'; // Import Firebase auth instance
import Fonts from '../common/fonts';
import SvgIcon from '../common/SvgIcon';

const ResetPasswordScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');

  const handleResetPassword = () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email.');
      return;
    }

    sendPasswordResetEmail(FIREBASE_AUTH, email)
      .then(() => {
        Alert.alert('Success', 'Password reset email sent!');
        navigation.reset({
          index: 0, // 0 means the first screen in the stack
          routes: [{ name: 'Login' }], // Replace 'Home' with the name of your initial screen
        });
      })
      .catch((error) => {
        Alert.alert('Error', error.message);
      });
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.mainCon}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.mainCon}>
            {/* Back Button */}
            <View style={styles.header}>
              <Pressable onPress={() => navigation.goBack()}>
                <SvgIcon icon="back" width={30} height={30} fill="#FFD700"/>
              </Pressable>
            </View>

            {/* Main Content */}
            <View style={styles.content}>
              {/* Icon */}
              <View style={styles.loginIcon}>
                <SvgIcon icon="reset" width={200} height={200} />
              </View>

              {/* Form Container */}
              <View style={styles.container}>
                <View style={styles.loginLblCon}>
                  <Text style={styles.loginLbl}>Reset Password</Text>
                </View>

                <View style={styles.formCon}>
                  <View style={styles.textBoxCon}>
                    <SvgIcon icon="lock" width={25} height={25} style={styles.icon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Enter Email"
                      placeholderTextColor="#FFD700"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={email}
                      onChangeText={setEmail}
                    />
                  </View>
                </View>

                {/* Submit Button */}
                <View style={styles.loginCon}>
                  <Pressable style={styles.LoginBtn} onPress={handleResetPassword}>
                    <Text style={styles.loginBtnLbl}>Submit</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default ResetPasswordScreen;

const styles = StyleSheet.create({
  mainCon: {
    flex: 1,
    backgroundColor: '#24496b',
    justifyContent: 'flex-start', // Align content to the top
  },
  header: {
    marginTop: 40,
    padding: 20,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
    justifyContent: 'flex-start', // Keep the content aligned to the top
    paddingTop: 40, // Adjust to move content lower
  },
  loginIcon: {},
  container: {
    paddingHorizontal: 20,
    width: '100%',
  },
  loginLblCon: {
    marginBottom: 20,
    alignSelf: 'center',
  },
  loginLbl: {
    color: '#FFD700',
    fontSize: 40,
    fontFamily: Fonts.type.NotoSansExtraBold,
    textAlign: 'center',
  },
  textBoxCon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: '#aaa',
    borderBottomWidth: 1,
    marginVertical: 10,
  },
  textInput: {
    flex: 1,
    color: '#FFD700',
    fontSize: 18,
    fontFamily: Fonts.type.NotoSansMedium,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  loginCon: {
    alignItems: 'center',
    marginTop: 30,
  },
  LoginBtn: {
    backgroundColor: '#FFD700',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 50,
  },
  loginBtnLbl: {
    fontSize: 20,
    fontFamily: Fonts.type.NotoSansBlack,
    color: '#fff',
  },
});

