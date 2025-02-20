import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, ActivityIndicator, RefreshControl, useWindowDimensions 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { fetchTopics } from './apiHandler';
import PropTypes from 'prop-types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';

// Local image import
const placeholderImage = require('../images/soldier.png');

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

  const navigation = useNavigation();
  const { width, height } = useWindowDimensions(); // Get screen dimensions

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
  
  useEffect(() => {
    loadTopics();
  }, [loadTopics]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTopics();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

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
      <View style={styles.imageContainer}>
        <Image source={placeholderImage} style={styles.image} />
      </View>

      <Text style={styles.title}>Select a Topic</Text>

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
    paddingTop: '40@ms',
  },
  imageContainer: {
    width: '40%',  
    height: '150@ms', 
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '20@ms',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    borderRadius: '10@ms',
    borderWidth: '3@ms',
    borderColor: '#FFD700',
  },
  title: {
    fontSize: '24@ms',
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: '20@ms',
    fontFamily: 'Arial',
  },
  contentContainer: {
    alignItems: 'center',
    paddingBottom: '20@ms',
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
