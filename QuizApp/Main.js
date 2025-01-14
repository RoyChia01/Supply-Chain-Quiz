import React, { useState, useEffect, useRef } from 'react';  // Correct import
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon, { Icons } from './components/Icons';
import Colors from './constants/Colors';
import ColorScreen from './screens/ColorScreen';
import * as Animatable from 'react-native-animatable';
import Quiz from './tabs/Quiz';   // Import the function from quiz.js

const TabArr = [
  { route: 'Home', label: 'Home', type: Icons.Ionicons, activeIcon: 'grid', inActiveIcon: 'grid-outline', component: ColorScreen },
  { route: 'LeaderBoard', label: 'LeaderBoard', type: Icons.MaterialIcons, activeIcon: 'leaderboard', inActiveIcon: 'leaderboard', component: ColorScreen },
  { route: 'Shop', label: 'Shop', type: Icons.AntDesign, activeIcon: 'isv', inActiveIcon: 'isv', component: ColorScreen },
  { route: 'Account', label: 'Account', type: Icons.FontAwesome, activeIcon: 'user-circle', inActiveIcon: 'user-circle-o', component: ColorScreen },
];

const Tab = createBottomTabNavigator();

const HomeScreen = ({ showQuiz, startQuiz, showHomeScreen }) => {
  return (
    <View style={styles.container}>
      {showQuiz ? (
        <Quiz onRestart={showHomeScreen} />  // Call showHomeScreen to go back to the home screen when quiz is done
      ) : (
        <View>
          <Text style={styles.welcomeText}>Welcome to the Home Screen!</Text>
          <TouchableOpacity onPress={startQuiz}>
            <Text style={styles.startQuizText}>Start Quiz</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const TabButton = (props) => {
  const { item, onPress, accessibilityState, showHomeScreen } = props;
  const focused = accessibilityState.selected;
  const viewRef = useRef(null);

  useEffect(() => {
    if (focused) {
      viewRef.current.animate({ 0: { scale: .5, rotate: '0deg' }, 1: { scale: 1.5, rotate: '360deg' } });
    } else {
      viewRef.current.animate({ 0: { scale: 1.5, rotate: '360deg' }, 1: { scale: 1, rotate: '0deg' } });
    }
  }, [focused]);

  const handlePress = () => {
    console.log(`Tab "${item.label}" pressed`);
    navBarHandler(item.route);
    onPress();
  };

  const navBarHandler = (route) => {
    if (route === 'Home') {
      showHomeScreen();  // Return to Home Screen when Home tab is pressed
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={1}
      style={[styles.container, { top: 0 }]} >
      <Animatable.View
        ref={viewRef}
        duration={1000}
      >
        <Icon type={item.type}
          name={focused ? item.activeIcon : item.inActiveIcon}
          color={focused ? Colors.primary : Colors.primaryLite} />
      </Animatable.View>
      <Text style={[styles.label, { color: focused ? Colors.primary : Colors.primaryLite }]}>{item.label}</Text>
    </TouchableOpacity>
  );
};

export default function BottomTabNavigator() {
  const [showQuiz, setShowQuiz] = useState(false);

  const startQuiz = () => {
    setShowQuiz(true); // Show the quiz when "Start Quiz" is pressed
  };

  const showHomeScreen = () => {
    setShowQuiz(false); // Return to the home screen when the quiz is finished or restarted
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            height: 60,
            position: 'absolute',
            margin: 16,
            borderRadius: 16,
            justifyContent: 'center',
            alignItems: 'center',
            display: showQuiz ? 'none' : 'flex', // Dynamically hide the tab bar when quiz is active
          },
        }}
      >
        {TabArr.map((item, index) => {
          return (
            <Tab.Screen
              key={index}
              name={item.route}
              component={item.route === 'Home' ? 
                () => <HomeScreen showQuiz={showQuiz} startQuiz={startQuiz} showHomeScreen={showHomeScreen} /> : item.component}
              options={{
                tabBarShowLabel: false,
                tabBarButton: (props) => <TabButton {...props} item={item} showHomeScreen={showHomeScreen} />
              }}
            />
          );
        })}
      </Tab.Navigator>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 60,
  },
  label: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 24,
    marginBottom: 20,
  },
  startQuizText: {
    fontSize: 18,
    color: Colors.primary,
  },
});
