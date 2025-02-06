import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { useEffect, useRef } from 'react';
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

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator(); // Create a Stack Navigator
const userEmail = "john.doe@example.com"; // Replace with the actual username

// Stack Navigator for Home (QuizTopics -> QuizQuestions)
const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="QuizTopics" component={QuizTopics} />
    <Stack.Screen name="QuizQuestions" component={QuizQuestions} />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
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
    options: { initialParams: { userEmail } },
  },
];

const TabButton = (props) => {
  const { item, onPress, accessibilityState } = props;
  const focused = accessibilityState.selected;
  const viewRef = useRef(null);

  useEffect(() => {
    if (focused) {
      viewRef.current.animate({ 0: { scale: 0.5, rotate: '0deg' }, 1: { scale: 1.5, rotate: '360deg' } });
    } else {
      viewRef.current.animate({ 0: { scale: 1.5, rotate: '360deg' }, 1: { scale: 1, rotate: '0deg' } });
    }
  }, [focused]);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={1} style={[styles.container, { top: 0 }]}>
      <Animatable.View ref={viewRef} duration={1000}>
        <Icon type={item.type} name={focused ? item.activeIcon : item.inActiveIcon} color={focused ? Colors.primary : Colors.primaryLite} />
      </Animatable.View>
    </TouchableOpacity>
  );
};

export default function AnimTab1() {
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
          },
        }}
      >
        {TabArr.map((item, index) => {
          return (
            <Tab.Screen
              key={index}
              name={item.route}
              component={item.component} // Use component from TabArr
              options={{
                tabBarShowLabel: false,
                tabBarButton: (props) => <TabButton {...props} item={item} />,
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
});
