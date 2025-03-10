import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, 
  Dimensions, RefreshControl, useWindowDimensions, Platform 
} from 'react-native';
import { useNavigation,useFocusEffect } from '@react-navigation/native';
import { fetchTopics, getUserTitle, getQuizStatus, getUserInfo } from './apiHandler';
import PropTypes from 'prop-types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';
import { useUser } from './userInfo';
import { LogBox } from 'react-native';
import Colors from '../constants/Colors';
import Icon from 'react-native-vector-icons/FontAwesome';


LogBox.ignoreAllLogs();

const { width } = Dimensions.get('window');
const scaleSize = (size) => size * (width / 375);

// Local image import
const images = {
  SCEngineer1: require('../images/AvatarProgression/SCEngineer1.jpg'),
  SCEngineer2: require('../images/AvatarProgression/SCEngineer2.jpg'),
  TeamIC1: require('../images/AvatarProgression/TeamIC1.jpg'),
  TeamIC2: require('../images/AvatarProgression/TeamIC2.jpg'),
  FlightLead1: require('../images/AvatarProgression/FlightLead1.jpg'),
  FlightLead2: require('../images/AvatarProgression/FlightLead2.jpg'),
  OC1: require('../images/AvatarProgression/OC1.jpg'),
  OC2: require('../images/AvatarProgression/OC2.jpg'),
  CO1: require('../images/AvatarProgression/CO1.jpg'),
  CO2: require('../images/AvatarProgression/CO2.jpg'),
  Commander1: require('../images/AvatarProgression/Commander1.jpg'),
  Commander2: require('../images/AvatarProgression/Commander2.jpg'),
  Trainee1: require('../images/AvatarProgression/Trainee1.jpg'),
  Trainee2: require('../images/AvatarProgression/Trainee2.jpg'), 
};

// TopicButton with interior completion badge
const TopicButton = ({ topic, onPress, completed = false }) => (
  <TouchableOpacity style={styles.windowButton} onPress={onPress}>
    <Text style={styles.windowNumber}>{topic.index}</Text>
    <Text style={styles.windowText}>{topic.name}</Text>
    
    {/* Interior completion badge - shown when completed is true */}
    {completed && (
      <View style={styles.completionBadgeContainer}>
        <View style={styles.completionBadge}>
          <Icon name="star" size={25} color="gold" />
        </View>
        <Text style={styles.completionText}>Completed</Text>
      </View>
    )}
  </TouchableOpacity>
);

TopicButton.propTypes = {
  topic: PropTypes.shape({
    id: PropTypes.string.isRequired,    
    name: PropTypes.string.isRequired,  
    index: PropTypes.number.isRequired, 
  }).isRequired,
  onPress: PropTypes.func.isRequired,
  completed: PropTypes.bool,
};

const QuizTopics = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [imageSource, setImageSource] = useState(null);
  const [userRank, setUserRank] = useState('Trainee');
  const [completedQuizzes, setCompletedQuizzes] = useState([]);
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const { userEmail } = useUser();
  const [userName, setUserName] = useState('');

  // Load topics function - optimized to use Promise.all for parallel requests
  const loadTopics = useCallback(async () => {
    if (refreshing) return; // Prevent multiple simultaneous refreshes
    
    setLoading(true);
    try {
      // Check if we have a user email
      if (!userEmail) {
        throw new Error('User email is missing. Please log in again.');
      }

      // Get user info first
      const userData = await getUserInfo(userEmail);
      // In the loadTopics function, after getting userData, add:
      if (userData && userData.name) {
        setUserName(userData.name);
      }
      else if (!userData || !userData.id) {
        throw new Error('Failed to retrieve user information.');
      }

      // Make parallel API calls for better performance
      const [userRankData, quizStatusData, topicsData] = await Promise.all([
        getUserTitle(userEmail),
        getQuizStatus(userData.id),
        fetchTopics()
      ]);

      // Process user rank and set avatar image
      if (userRankData) {
        setUserRank(userRankData);
        const validRanks = ['Commander', 'Trainee', 'OC', 'CO', 'FlightLead', 'TeamIC', 'SCEngineer'];
        const imageKey = validRanks.includes(userRankData) ? `${userRankData}1` : 'Trainee1';
        setImageSource(images[imageKey] || images.Trainee1);
      } else {
        setUserRank('Trainee');
        setImageSource(images.Trainee1);
      }

      // Process completed quizzes
      const validQuizStatus = Array.isArray(quizStatusData) ? quizStatusData : [];
      setCompletedQuizzes(validQuizStatus);

      // Process topics and mark completed ones
      if (Array.isArray(topicsData)) {
        const completedQuizIds = validQuizStatus.map(quiz => quiz.id);
        
        const processedTopics = topicsData.map(item => ({
          id: item.id,
          topicList: item.topicList,
          quizStatus: completedQuizIds.includes(item.id)
        }));

        setTopics(processedTopics);
      } else {
        throw new Error('Invalid topics data received.');
      }

      setError(null);
    } catch (err) {
      console.error("Error in loadTopics:", err);
      setError(err.message || 'Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [userEmail, refreshing]);

 // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadTopics();
      return () => {}; // cleanup function
    }, [])
  );

  useEffect(() => {
    loadTopics();
  }, [loadTopics]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTopics();
    setRefreshing(false);
  };

  // Render a placeholder while loading
  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.gold} />
          <Text style={styles.loadingText}>Loading your quiz topics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render error state
  if (error && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="exclamation-triangle" size={50} color={Colors.gold} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadTopics}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.imageContainer}>
          {imageSource && <Image source={imageSource} style={styles.image} />}
        </View>
        <View style={styles.headerTextContainer}>
        <Text style={styles.nameText}>{userName}</Text>
        <Text style={styles.rankText}>{userRank.replace(/[0-9]+$/, '') || 'Trainee'}</Text>
        <Text style={styles.title}>Select a Topic</Text>
      </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={[Colors.gold]} 
          />
        }
      >
        <View style={[styles.windowRow, { width: width * 0.9 }]}>
          {topics.map((topic) => (
            topic.topicList.map((item) => (
              <TopicButton
                key={`${topic.id}-${item.id}`}
                topic={{
                  id: item.id, 
                  name: item.name,
                  index: item.index + 1,
                }}
                onPress={() => navigation.navigate('QuizQuestions', { id: topic.id })}
                completed={topic.quizStatus}
              />
            ))
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Updated Styles with interior completion badge
const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.mainBackgroundColor,
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? scaleSize(-40) : scaleSize(20),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    marginVertical: '15@ms',
  },
  imageContainer: {
    width: '80@ms',
    height: '80@ms',
    borderRadius: '40@ms',
    overflow: 'hidden',
    borderWidth: '3@ms',
    borderColor: Colors.gold,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  headerTextContainer: {
    marginLeft: '15@ms',
    flex: 1,
  },
  rankText: {
    fontSize: '18@ms',
    color: Colors.gold,
    fontWeight: '600',
  },
  title: {
    fontSize: '24@ms',
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'Arial',
  },
  contentContainer: {
    alignItems: 'center',
    paddingBottom: '50@ms',
  },
  windowRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
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
    position: 'relative',
  },
  windowNumber: {
    fontSize: '28@ms',
    fontWeight: 'bold',
    color: Colors.gold,
    marginBottom: '5@ms',
  },
  windowText: {
    fontSize: '14@ms',
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    paddingHorizontal: '5@ms',
    fontFamily: 'Arial',
  },
  // New styles for interior completion badge
  completionBadgeContainer: {
    position: 'absolute',
    bottom: '15@ms',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  completionBadge: {
    width: '22@ms',
    height: '22@ms',
    borderRadius: '11@ms',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: '5@ms',
  },
  completionText: {
    fontSize: '16@ms',
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: '15@ms',
    fontSize: '16@ms',
    color: Colors.gold,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20@ms',
  },
  errorText: {
    fontSize: '16@ms',
    color: '#FF6B6B',
    textAlign: 'center',
    marginTop: '15@ms',
    marginBottom: '20@ms',
  },
  retryButton: {
    marginTop: '20@ms',
    backgroundColor: Colors.gold,
    paddingVertical: '10@ms',
    paddingHorizontal: '20@ms',
    borderRadius: '25@ms',
  },
  retryText: {
    fontSize: '16@ms',
    fontWeight: 'bold',
    color: '#000',
  },
  nameText: {
    fontSize: '24@ms',
    color: 'white',
    fontWeight: '500',
  },
});

export default QuizTopics;