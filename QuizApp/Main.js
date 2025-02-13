import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView, StyleSheet, TouchableOpacity } from 'react-native';
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
    component: HomeStack, // Use the stack navigator here
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
      0: { scale: focused ? 0.5 : 1.5, rotate: '0deg' },
      1: { scale: focused ? 1.5 : 1, rotate: '360deg' },
    });
  }, [focused]);

  const iconName = focused ? item.activeIcon : item.inActiveIcon;
  console.log(`Icon name: ${iconName}`);  // Debugging line to check which icon is being used

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={1} style={[styles.container, { top: 20 }]}>
      <Animatable.View ref={viewRef} duration={1000}>
        <Icon 
          type={item.type} 
          name={iconName} 
          color={focused ? Colors.primary : Colors.primaryLite} 
        />
      </Animatable.View>
    </TouchableOpacity>
  );
};

const AnimTab = () => (
  <SafeAreaView style={{ flex: 1 ,backgroundColor: "#2F4F6D"}}>
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
        <StatusBar style="auto" />
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
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 60,
    top:20,
  },
  tabBar: {
    height: 60,
    position: 'absolute',
    margin: 16,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
