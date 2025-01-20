import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import StartQuiz from './allQuizTesting';  // Adjust paths as needed
import Quiz from './quizTesting';  // Adjust paths as needed

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="StartQuiz"
        screenOptions={{
          headerShown: false, // Hide header for all screens in this navigator
        }}
      >
        <Stack.Screen 
          name="StartQuiz" 
          component={StartQuiz} 
        />
        <Stack.Screen 
          name="Quiz" 
          component={Quiz} 
          options={{
            gestureEnabled: false, // Disable the swipe back gesture
            headerShown: false, // Hide header for all screens in this navigator
          }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
