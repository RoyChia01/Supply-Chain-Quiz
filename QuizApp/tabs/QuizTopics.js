import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, ActivityIndicator, RefreshControl 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { fetchTopics } from './apiHandler';
import PropTypes from 'prop-types';

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
    id: PropTypes.string.isRequired,     // Correct field for topic identifier
    name: PropTypes.string.isRequired,   // Correct field for the name of the topic
    index: PropTypes.number.isRequired,  // Correct field for the index of the topic
  }).isRequired,
  onPress: PropTypes.func.isRequired,
};

const QuizTopics = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const navigation = useNavigation();

  // Load topics function
  const loadTopics = useCallback(async () => {
    setLoading(true);
    try {
      const topicsData = await fetchTopics(); // Fetch topics data
      
      // Extract both id and topicList from each item in the fetched topics data
      const extractedTopics = topicsData.map(item => ({
        id: item.id,
        topicList: item.topicList,
      }));
      
      console.log("Fetched Topics:", extractedTopics);
  
      // Set the topics with their ids and topicList in state
      setTopics(extractedTopics);  
      setError(null); // Clear previous errors on successful fetch
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
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={placeholderImage} style={styles.image} />
      </View>

      <Text style={styles.title}>Select a Topic</Text>

      <ScrollView
        contentContainerStyle={styles.contentContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FFD700']} />}
      >
        <View style={styles.windowRow}>
          {topics.map((topic) => {
            // Now iterating over the topicList to display its name and index
            return topic.topicList.map((item, index) => (
              <TopicButton
                key={item.id} // Assuming each item in topicList has a unique id
                topic={{
                  id: item.id, // Pass the full topic object, including id, name, and index
                  name: item.name,
                  index: item.index, // Assuming index is 1-based
                }}
                onPress={() => navigation.navigate('QuizQuestions', { id: topic.id })} // Use the outer topic's id
              />
            ));
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2F4F6D',
    alignItems: 'center',
    paddingTop: 40,
  },
  imageContainer: {
    width: '40%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    borderRadius: 10,
    borderWidth: 5,
    borderColor: '#FFD700',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 40,
    fontFamily: 'Arial',
  },
  contentContainer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  windowRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  windowButton: {
    backgroundColor: '#3A5F77',
    width: 140,
    height: 180,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 15,
    borderWidth: 2,
    borderColor: '#FFD700',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  windowNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  windowText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginTop: 10,
    fontFamily: 'Arial',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#FFD700',
    padding: 10,
    borderRadius: 5,
  },
  retryText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
});

export default QuizTopics;
