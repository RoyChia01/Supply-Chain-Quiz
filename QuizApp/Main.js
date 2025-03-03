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
import NetInfo from '@react-native-community/netinfo';

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
  const [ipAddressLoaded, setIpAddressLoaded] = useState(false);

  const clearAsyncStorage = async () => {
    try {
      await AsyncStorage.clear();
      console.log('AsyncStorage has been cleared.');
    } catch (error) {
      console.error('Error clearing AsyncStorage:', error);
    }
  };
   // Function to get device IP address
   const getDeviceIPv4Address = async () => {
    try {
      const networkState = await NetInfo.fetch();
      
      if (networkState.isConnected) {
        // For WiFi connections - extract IPv4 specifically
        if (networkState.type === 'wifi' && networkState.details && networkState.details.ipAddress) {
          // The ipAddress property typically returns IPv4 address
          global.deviceIPAddress = networkState.details.ipAddress;
          console.log('Device IPv4 Address (WiFi):', networkState.details.ipAddress);
        } else {
          // Fallback to API method for other connection types
          fetchIPv4FromAPI();
        }
      } else {
        console.log('Device is offline');
        global.deviceIPAddress = 'offline';
      }
      
      setIpAddressLoaded(true);
    } catch (error) {
      console.error('Error getting IP address:', error);
      fetchIPv4FromAPI();
    }
  };
  
  // Fallback method using external API to get IP
  const fetchIPv4FromAPI = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      global.deviceIPAddress = data.ip;
      console.log('IP Address from API:', data.ip);
      setIpAddressLoaded(true);
    } catch (error) {
      console.error('Error fetching IP from API:', error);
      global.deviceIPAddress = 'unknown';
      setIpAddressLoaded(true);
    }
  };
  
  useEffect(() => {
    // Ensure AsyncStorage is cleared at the start
    clearAsyncStorage();
    
    // Get device IP address
    getDeviceIPv4Address();
  
    // Handle auth state changes
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, setUser);
    return unsubscribe;
  }, []);

  // Wait until IP address is loaded before rendering the app
  if (!ipAddressLoaded) {
    // You could return a loading screen here if needed
    return null;
  }
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
