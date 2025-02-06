import React from 'react';
import { Text, View, Pressable, StyleSheet, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Fonts from '../common/fonts';
import SvgIcon from '../common/SvgIcon';

const ResetPasswordScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.mainCon}>
      {/* Back Button */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <SvgIcon icon="back" width={30} height={30} fill="#e0a100" />
        </Pressable>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.loginIcon}>
          <SvgIcon icon="reset" width={300} height={300} />
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
                placeholderTextColor="#e0a100"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Submit Button */}
          <View style={styles.loginCon}>
            <Pressable style={styles.LoginBtn}>
              <Text style={styles.loginBtnLbl}>Submit</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ResetPasswordScreen;

const styles = StyleSheet.create({
  mainCon: {
    flex: 1,
    backgroundColor: '#3a506b',
  },
  header: {
    padding: 20,
    marginTop: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    bottom: 30,
  },
  loginIcon: {
    alignSelf: 'center',
  },
  container: {
    paddingHorizontal: 20,
    width: '100%',
  },
  loginLblCon: {
    marginBottom: 20,
    alignSelf: 'center',
  },
  loginLbl: {
    color: '#e0a100',
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
    color: '#000',
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
    backgroundColor: '#e0a100',
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
