/**
 * QuizTopics Component
 * --------------------
 * This component displays a list of quiz topics for users to select.
 * It fetches user rank data and dynamically updates the display image
 * based on the rank. Topics are fetched from an API and displayed
 * as buttons for navigation.
 * 
 * Features:
 * - Fetches and displays quiz topics from an API.
 * - Retrieves the user's rank using their email and displays a corresponding image.
 * - Implements a pull-to-refresh mechanism for reloading topics.
 * - Shows a loading indicator while fetching data.
 * - Handles API errors with a retry button.
 * - Responsive layout that adapts to screen size.
 * 
 * Dependencies:
 * - react-navigation for navigation.
 * - react-native-safe-area-context for safe UI rendering.
 * - react-native-size-matters for responsive styling.
 * - API functions `fetchTopics` and `getUserTitle` for fetching data.
 * - Custom `useUser` hook to retrieve user email.
 * 
 * Components:
 * - `TopicButton`: Renders individual topic selection buttons.
 * - `QuizTopics`: Main component that manages data fetching and UI rendering.
 */


import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator,Dimensions, RefreshControl, useWindowDimensions 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { fetchTopics, getUserTitle } from './apiHandler';
import PropTypes from 'prop-types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';
import { useUser } from './userInfo';  // Import the hook
import { LogBox } from 'react-native';
import Colors from '../constants/Colors';

LogBox.ignoreAllLogs(); // Ignore all log notifications

const { width, height } = Dimensions.get('window');
const scaleSize = (size) => size * (width / 375); // Base size scaling

// Local image import
const images = {
  SCEngineer: require('../images/AvatarProgression/Engineer.jpg'),
  TeamIC: require('../images/AvatarProgression/TeamIC.jpg'),
  FlightLead: require('../images/AvatarProgression/FlightLead.jpg'),
  OC: require('../images/AvatarProgression/OC.jpg'),
  CO: require('../images/AvatarProgression/CO.jpg'),
  Commander: require('../images/AvatarProgression/Commander.jpg'),
  Trainee: require('../images/AvatarProgression/Trainee.jpg'), // Added fallback image
};

// Functional Component for each Topic Button
const TopicButton = ({ topic, onPress }) => (
  <TouchableOpacity style={styles.windowButton} onPress={onPress}>
    <Text style={styles.windowNumber}>{topic.index}</Text>
    <Text style={styles.windowText}>{topic.name}</Text>
  </TouchableOpacity>
);

TopicButton.propTypes = {
  topic: PropTypes.shape({
    id: PropTypes.string.isRequired,    
    name: PropTypes.string.isRequired,  
    index: PropTypes.number.isRequired, 
  }).isRequired,
  onPress: PropTypes.func.isRequired,
};

const QuizTopics = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [imageSource, setImageSource] = useState(require('../images/AvatarProgression/Trainee.jpg')); // Default image
  const [userRank, setUserRank] = useState(null);
  const navigation = useNavigation();
  const { width } = useWindowDimensions(); // Get screen dimensions
  const { userEmail } = useUser(); // Get user email from context

  // Load topics function
const loadTopics = useCallback(async () => {
  setLoading(true);
  try {
    // Step 1: Check if we have a user email
    if (!userEmail) {
      setError('User email is missing. Please log in again.');
      return;
    }

    // Step 2: Get user rank
    let userRankData;
    try {
      userRankData = await getUserTitle(userEmail);
      console.log("User Rank:", userRankData);
      if (userRankData) {
        setUserRank(userRankData);
        // Dynamically set the image based on rank
        setImageSource(images[userRankData] || images.Trainee);
      } else {
        console.warn("No user rank returned");
        // Set default rank if needed
        setUserRank('Trainee');
        setImageSource(images.Trainee);
      }
    } catch (rankError) {
      console.error("Error fetching user rank:", rankError);
      // Continue with default values instead of stopping entirely
      setUserRank('Trainee');
      setImageSource(images.Trainee);
    }

    // Step 3: Get topics data
    try {
      const topicsData = await fetchTopics();
      const extractedTopics = topicsData.map(item => ({
        id: item.id,
        topicList: item.topicList,
      }));

      setTopics(extractedTopics);
    } catch (topicsError) {
      console.error("Error fetching topics:", topicsError);
      setError('Failed to load topics. Please try again later.');
      // We still set the error but don't return early
    }

    // Clear any previous errors if everything succeeded
    setError(null);
  } catch (err) {
    console.error("Unexpected error in loadAllData:", err);
    setError('Something went wrong. Please try again later.');
  } finally {
    setLoading(false);
  }
}, [userEmail, images]); // Only depend on userEmail and images

// Single useEffect to trigger the data loading
useEffect(() => {
  loadTopics();
}, [loadTopics]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTopics();
    setRefreshing(false);
  };

  // If loading data, show a loading spinner
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  // If there's an error, show an error message and retry button
  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadTopics}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Display the rank image */}
      <View style={styles.imageContainer}>
        <Image source={imageSource} style={styles.image} />
      </View>

      <Text style={styles.title}>Welcome, Select a Topic</Text>

      {/* Topic buttons */}
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FFD700']} />}

      >
        <View style={[styles.windowRow, { width: width * 0.9 }]}>
          {topics.map((topic) => (
            topic.topicList.map((item) => (
              <TopicButton
                key={item.id}
                topic={{
                  id: item.id, 
                  name: item.name,
                  index: item.index,
                }}
                onPress={() => navigation.navigate('QuizQuestions', { id: topic.id })}
              />
            ))
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Scaled Styles
const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.mainBackgroundColor,
    alignItems: 'center',
    Top: '-10@ms',
  },
  imageContainer: {
    width: '50%', // Adjusted size to fit better
    aspectRatio: 1, // Maintains square aspect ratio for the image
    alignItems: 'center',
  },
  image: {
    width: '80%',
    height: '80%',
    resizeMode: 'cover', // Makes sure the image fills the space while maintaining its aspect ratio
    borderRadius: '15@ms',
    borderWidth: '4@ms',
    borderColor: Colors.gold,
  },
  title: {
    fontSize: '24@ms',
    fontWeight: 'bold',
    color: Colors.gold,
    fontFamily: 'Arial',
  },
  contentContainer: {
    alignItems: 'center',
    paddingBottom: scaleSize(50),
  },
  windowRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  windowButton: {
    backgroundColor: '#3A5F77',
    width: '140@ms',
    height: '160@ms',
    borderRadius: '15@ms',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '10@ms',
    borderWidth: '2@ms',
    borderColor: Colors.gold,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: '6@ms',
  },
  windowNumber: {
    fontSize: '28@ms',
    fontWeight: 'bold',
    color: Colors.gold,
  },
  windowText: {
    fontSize: '14@ms',
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginTop: '8@ms',
    fontFamily: 'Arial',
  },
  errorText: {
    fontSize: '16@ms',
    color: 'red',
    textAlign: 'center',
    marginTop: '20@ms',
  },
  retryButton: {
    marginTop: '20@ms',
    backgroundColor: Colors.gold,
    padding: '10@ms',
    borderRadius: '5@ms',
  },
  retryText: {
    fontSize: '16@ms',
    fontWeight: 'bold',
    color: '#000',
  },
  loadingContainer: {
      flex: 1,
      justifyContent: 'center',  // Centers vertically
      alignItems: 'center',      // Centers horizontally
      backgroundColor: Colors.mainBackgroundColor,
    },
});

export default QuizTopics;
