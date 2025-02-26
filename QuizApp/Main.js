/**
 * App Navigation and Authentication Management
 * -------------------------------------------
 * This file defines the main structure of the app, handling navigation, authentication state, 
 * and the bottom tab bar with animations.
 * 
 * Features:
 * - Implements a Bottom Tab Navigator with animated icons.
 * - Manages authentication state using Firebase's `onAuthStateChanged`.
 * - Provides a stack navigator for login, sign-up, and password reset screens.
 * - Uses `UserProvider` to manage user-related data globally.
 * - Supports smooth UI interactions with animations from `react-native-animatable`.
 * - Adapts to different screen sizes with responsive design.
 * 
 * Components:
 * - `HomeStack`: Stack navigator for quiz topics and questions.
 * - `ProfileStack`: Stack navigator for profile and password reset.
 * - `TabButton`: Custom animated button for tab navigation.
 * - `AnimTab`: Animated bottom tab navigator.
 * - `App`: Main component handling authentication and navigation.
 * 
 * Usage:
 * - `onAuthStateChanged` listens for user authentication changes.
 * - If a user is logged in, the app navigates to `MainTabs`; otherwise, it defaults to `Login`.
 * - The `AnimTab` handles navigation between Home, Leaderboard, and Account screens.
 */
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView, StyleSheet, TouchableOpacity, Dimensions, PixelRatio } from 'react-native';
import Icon, { Icons } from './components/Icons';
import * as Animatable from 'react-native-animatable';
import Colors from './constants/Colors';
import { createStackNavigator } from '@react-navigation/stack';
import QuizTopics from './tabs/QuizTopics';
import QuizQuestions from './tabs/QuizQuestions'; 
import InitialiseLeaderboard from './tabs/Leaderboard';
import BoardingPass from './tabs/Profile';
import resetPassword from './tabs/resetPassword';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import LoginScreen from './tabs/LoginScreen';
import SignUpScreen from './tabs/SignUpScreen';
import { onAuthStateChanged } from 'firebase/auth';
import { FIREBASE_AUTH } from './tabs/firebase';
import { UserProvider } from './tabs/userInfo';
import { Platform } from 'react-native';

const { width, height } = Dimensions.get('window');
const scaleFont = (size) => size * PixelRatio.getFontScale();

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, gestureEnabled: false }}>
    <Stack.Screen name="QuizTopics" component={QuizTopics} />
    <Stack.Screen name="QuizQuestions" component={QuizQuestions} />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, gestureEnabled: false }}>
    <Stack.Screen name="BoardingPass" component={BoardingPass} />
    <Stack.Screen name="resetPassword" component={resetPassword} />
  </Stack.Navigator>
);

const TabArr = [
  {
    route: 'Home',
    label: 'Home',
    type: Icons.Ionicons,
    activeIcon: 'grid',
    inActiveIcon: 'grid-outline',
    component: HomeStack,
  },
  {
    route: 'LeaderBoard',
    label: 'LeaderBoard',
    type: Icons.FontAwesome,
    activeIcon: 'trophy',
    inActiveIcon: 'trophy',
    component: InitialiseLeaderboard,
  },
  {
    route: 'Account',
    label: 'Account',
    type: Icons.FontAwesome,
    activeIcon: 'user-circle',
    inActiveIcon: 'user-circle-o',
    component: ProfileStack,
  },
];

const TabButton = ({ item, onPress, accessibilityState }) => {
  const focused = accessibilityState.selected;
  const viewRef = useRef(null);

  useEffect(() => {
    viewRef.current?.animate({
      0: { scale: focused ? 0.5 : 1.2, rotate: '0deg' },
      1: { scale: focused ? 1.2 : 1, rotate: '360deg' },
    });
  }, [focused]);

  const iconName = focused ? item.activeIcon : item.inActiveIcon;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.tabButton}>
      <Animatable.View ref={viewRef} duration={800}>
        <Icon 
          type={item.type} 
          name={iconName} 
          color={focused ? Colors.primary : Colors.primaryLite} 
          size={width * 0.07} // Responsive icon size
        />
      </Animatable.View>
    </TouchableOpacity>
  );
};

const AnimTab = () => (
  <SafeAreaView style={styles.safeArea}>
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarStyle: styles.tabBar }}>
      {TabArr.map((item, index) => (
        <Tab.Screen
          key={index}
          name={item.route}
          component={item.component}
          options={{ tabBarShowLabel: false, tabBarButton: (props) => <TabButton {...props} item={item} /> }}
        />
      ))}
    </Tab.Navigator>
  </SafeAreaView>
);

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, setUser);
    return unsubscribe;
  }, []);

  return (
    <UserProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator initialRouteName={user ? 'MainTabs' : 'Login'} screenOptions={{ headerShown: false, gestureEnabled: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="ForgetPassword" component={resetPassword} />
          <Stack.Screen name="MainTabs" component={AnimTab} />
        </Stack.Navigator>
      </NavigationContainer>
    </UserProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#2F4F6D',
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    height: Platform.OS === 'ios' ? height * 0.09 : height * 0.08,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0, // Adjusts for iOS safe area
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
