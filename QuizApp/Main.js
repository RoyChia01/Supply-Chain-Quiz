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
import ProductsList from './tabs/ShopScreen'; 
import DetailsScreen from './tabs/DetailsScreen';
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
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

const { width, height } = Dimensions.get('window');
const scaleFont = (size) => size * PixelRatio.getFontScale();
// Global variable to store IP address
global.deviceIPAddress = null;


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

const ShopStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, gestureEnabled: false }}>
    <Stack.Screen name="ProductsList" component={ProductsList} />
    <Stack.Screen name="DetailsScreen" component={DetailsScreen} />
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
    route: 'Shop',
    label: 'Shop',
    type: Icons.FontAwesome,
    activeIcon: 'shopping-cart',
    inActiveIcon: 'shopping-cart',
    component: ShopStack,
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
      0: { scale: focused ? 0.5 : 1.5, rotate: '0deg' },
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
          color={focused ? Colors.gold : Colors.gold} 
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

  const clearAsyncStorage = async () => {
    try {
      await AsyncStorage.clear();
      console.log('AsyncStorage has been cleared.');
    } catch (error) {
      console.error('Error clearing AsyncStorage:', error);
    }
  }
  
  useEffect(() => {
    // Ensure AsyncStorage is cleared at the start
    clearAsyncStorage();
  
    // Handle auth state changes
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
    backgroundColor: '#446d92',
    height: 70,
    borderRadius: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    paddingBottom: 10,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
