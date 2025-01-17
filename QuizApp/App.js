import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';  // Import NavigationContainer
import BottomTabNavigator from './Main';  // Ensure Main is the correct path

const App = () => {
  const [showQuiz, setShowQuiz] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const startQuiz = () => {
    setShowQuiz(true);  // Set quiz to be visible
  };

  const showHomeScreen = () => {
    setShowQuiz(false);  // Hide quiz and show home screen again
    setShowProfile(false);
  };

  const startProfile = () => {
    setShowProfile(true);  // Set quiz to be visible
  };

  return (
    <NavigationContainer>
      <BottomTabNavigator
        showQuiz={showQuiz}
        startQuiz={startQuiz}
        showProfile={showProfile}
        startProfile={startProfile}
        showHomeScreen={showHomeScreen}
      />
    </NavigationContainer>
  );
};

export default App;
