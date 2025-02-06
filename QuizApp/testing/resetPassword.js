import React, { Component } from 'react';
import { Text, View, Pressable, StyleSheet, TextInput } from 'react-native';
import Fonts from '../common/fonts';
import SvgIcon from '../common/SvgIcon';

export default class ResetPasswordScreen extends Component {
  render() {
    return (
      <View style={styles.mainCon}>
        <View style={{ padding: 20,marginTop: 40}}>
          <Pressable onPress={() => this.props.navigation.goBack(null)}>
          <SvgIcon icon={'back'} width={30} height={30} fill="#e0a100" />   
          </Pressable>
        </View>
        <View style={{ position: 'relative', bottom: 30 }}>
          <View style={styles.loginIcon}>
            <SvgIcon icon={'reset'} width={300} height={300} />
          </View>
          <View style={styles.container}>
            <View style={styles.loginLblCon}>
              <Text style={styles.loginLbl}>Reset Password</Text>
            </View>
            <View style={styles.formCon}>
              <View style={styles.textBoxCon}>
                <SvgIcon icon={'lock'} width={25} height={25} style={styles.icon} />
                <TextInput
                  style={styles.textInput}
                  placeholder={'Enter Email'}
                  placeholderTextColor={'#e0a100'}
                />
              </View>
            </View>
            <View style={styles.loginCon}>
              <Pressable style={styles.LoginBtn}>
                <Text style={styles.loginBtnLbl}>Submit</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  mainCon: {
    backgroundColor: '#3a506b',
    flex: 1,
  },
  loginIcon: {
    alignSelf: 'center',
  },
  container: {
    paddingHorizontal: 20,
  },
  loginLblCon: {
    position: 'relative',
    bottom: 40,
  },
  loginLbl: {
    color: '#e0a100',
    fontSize: 40,
    fontFamily: Fonts.type.NotoSansExtraBold,
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
    fontSize: 24,
    fontFamily: Fonts.type.NotoSansMedium,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  LoginBtn: {
    backgroundColor: '#e0a100',
    borderRadius: 20,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 30,
  },
  loginBtnLbl: {
    fontSize: 24,
    fontFamily: Fonts.type.NotoSansBlack,
    color: '#fff',
  },
});