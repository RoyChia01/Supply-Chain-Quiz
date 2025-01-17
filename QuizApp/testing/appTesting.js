import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import StartQuiz from './allQuizTesting';  // Adjust paths as needed
import Quiz from './quizTesting';  // Adjust paths as needed

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="StartQuiz">
        <Stack.Screen name="StartQuiz" component={StartQuiz} />
        <Stack.Screen name="Quiz" component={Quiz} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
