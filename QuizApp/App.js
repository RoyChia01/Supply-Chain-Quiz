import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';  // Import NavigationContainer
import BottomTabNavigator from './Main';  // Ensure Main is the correct path

const App = () => {
  const [showQuiz, setShowQuiz] = useState(false);

  const startQuiz = () => {
    setShowQuiz(true);  // Set quiz to be visible
  };

  const showHomeScreen = () => {
    setShowQuiz(false);  // Hide quiz and show home screen again
  };

  return (
    <NavigationContainer>
      <BottomTabNavigator
        showQuiz={showQuiz}
        startQuiz={startQuiz}
        showHomeScreen={showHomeScreen}
      />
    </NavigationContainer>
  );
};

export default App;
