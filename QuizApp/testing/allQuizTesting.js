import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';

// Local image import
const placeholderImage = require('../images/soldier.png'); // Adjust the path as needed

const topics = [
  { id: 1, name: 'General Knowledge' },
  { id: 2, name: 'Science' },
  { id: 3, name: 'Safety' },
  { id: 4, name: 'Aircraft' },
];

const StartQuiz = ({ navigation }) => {
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
              key={topic.id}
              style={styles.windowButton}
              onPress={() => navigation.navigate('Quiz', { topicId: topic.id })}
            >
              <Text style={styles.windowNumber}>{topic.id}</Text>
              <Text style={styles.windowText}>{topic.name}</Text>
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
    backgroundColor: '#24496b',
    alignItems: 'center',
  },
  imageContainer: {
    width: '30%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20, // Add some space above the image
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
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
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    width: 120,
    height: 160,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
    borderWidth: 2,
    borderColor: 'white',
  },
  windowNumber: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
  },
  windowText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default StartQuiz;
