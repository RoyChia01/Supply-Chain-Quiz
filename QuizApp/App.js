import React from 'react';
import { NavigationContainer } from '@react-navigation/native';  // Import the Navigation container
import AnimTab1 from './Main';  // Import the AnimTab1 component
import { StatusBar } from 'react-native';  // To set up status bar styling

export default function App() {
  return (
    <NavigationContainer>
      {/* Set the status bar appearance */}
      <StatusBar barStyle="dark-content" />
      
      {/* Use the AnimTab1 as the main navigator for the app */}
      <AnimTab1 />
    </NavigationContainer>
  );
}
