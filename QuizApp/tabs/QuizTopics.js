import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import apiHandler from './apiHandler'; // Import useNavigation

// Local image import
const placeholderImage = require('../images/soldier.png'); // Adjust the path as needed

const QuizTopics = () => {
  
  const navigation = useNavigation(); // Access navigation with useNavigation hook
  const { topics, loading } = apiHandler("http://192.168.50.161:5500/QuizApp/testing/data.json");

  return (
    <View style={styles.container}>
      {/* Image placeholder at the top (fixed) */}
      <View style={styles.imageContainer}>
        <Image
          source={placeholderImage} // Using local image
          style={styles.image}
        />
      </View>

      <Text style={styles.title}>Select a Topic</Text>

      {/* ScrollView for selecting topics */}
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.windowRow}>
          {topics.map((topic) => (
            <TouchableOpacity
              key={topic.documentId}
              style={styles.windowButton}
              onPress={() => navigation.navigate('QuizQuestions', { documentId : documentId})} // Use navigation from hook
            >
              <Text style={styles.windowNumber}>{topic.topicId}</Text>
              <Text style={styles.windowText}>{topic.topic}</Text>
            </TouchableOpacity>
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
    fontFamily: 'Arial', // Military-style font
  },
  contentContainer: {
    alignItems: 'center',
    paddingBottom: 20, // Space for scrolling
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
    shadowColor: '#000', // Adding shadow for depth
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  windowNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFD700', // Gold color
  },
  windowText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginTop: 10,
    fontFamily: 'Arial',
  },
});

export default QuizTopics;
