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
      const topicsData = await fetchTopics(); 
      const extractedTopics = topicsData.map(item => ({
        id: item.id,
        topicList: item.topicList,
      }));

      setTopics(extractedTopics);  
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to load topics. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch user data and rank
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userEmail) return;

      try {
        const rank = await getUserTitle(userEmail); // Get user rank from API
        console.log("User Rank:", rank);
        if (rank) {
          setUserRank(rank);
          // Dynamically set the image based on rank
          setImageSource(images[rank] || images.Trainee); 
        }
      } catch (err) {
        console.error("Error fetching user rank:", err);
      }
    };

    fetchUserData();
  }, [userEmail]);

  // Fetch topics data once the user rank is set
  useEffect(() => {
    if (userRank) {
      loadTopics();
    }
  }, [userRank, loadTopics]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTopics();
    setRefreshing(false);
  };

  // If loading data, show a loading spinner
  if (loading) {
    return (
      <View style={styles.container}>
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
    backgroundColor: '#2F4F6D',
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
    borderColor: '#FFD700',
  },
  title: {
    fontSize: '24@ms',
    fontWeight: 'bold',
    color: '#FFD700',
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
    borderColor: '#FFD700',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: '6@ms',
  },
  windowNumber: {
    fontSize: '28@ms',
    fontWeight: 'bold',
    color: '#FFD700',
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
    backgroundColor: '#FFD700',
    padding: '10@ms',
    borderRadius: '5@ms',
  },
  retryText: {
    fontSize: '16@ms',
    fontWeight: 'bold',
    color: '#000',
  },
});

export default QuizTopics;
