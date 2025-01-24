import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { fetchTopics } from './apiHandler';
import PropTypes from 'prop-types'; // For prop type checking

// Local image import
const placeholderImage = require('../images/soldier.png');

// Functional Component for each Topic Button
const TopicButton = ({ topic, onPress }) => (
  <TouchableOpacity
    style={styles.windowButton}
    onPress={onPress}
  >
    <Text style={styles.windowNumber}>{topic.topicId}</Text>
    <Text style={styles.windowText}>{topic.topic}</Text>
  </TouchableOpacity>
);

TopicButton.propTypes = {
  topic: PropTypes.shape({
    topicId: PropTypes.string.isRequired,
    topic: PropTypes.string.isRequired,
    documentId: PropTypes.string.isRequired,
  }).isRequired,
  onPress: PropTypes.func.isRequired,
};

const QuizTopics = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  const loadTopics = useCallback(async () => {
    setLoading(true);
    try {
      const { topics } = await fetchTopics();
      setTopics(topics);
    } catch (err) {
      setError('Failed to load topics. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTopics();
  }, [loadTopics]);

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
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={placeholderImage}
          style={styles.image}
        />
      </View>

      <Text style={styles.title}>Select a Topic</Text>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.windowRow}>
          {topics.map((topic) => (
            <TopicButton
            key={topic.documentId}
            topic={{ ...topic, topicId: String(topic.topicId) }} // Ensure topicId is a string
            onPress={() => navigation.navigate('QuizQuestions', { documentId: topic.documentId })}
          />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2F4F6D', // Deep blue to reflect Air Force theme
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
    borderColor: '#FFD700', // Gold border to match Air Force color
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700', // Gold color for emphasis
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
    backgroundColor: '#3A5F77', // Navy blue background
    width: 140,
    height: 180,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 15,
    borderWidth: 2,
    borderColor: '#FFD700', // Gold border to give it a strong, military theme
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
});

export default QuizTopics;
