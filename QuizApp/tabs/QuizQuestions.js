/**
 * QuizQuestions.js
 * 
 * This React Native component handles the quiz functionality, including:
 * - Fetching quiz questions from an API.
 * - Displaying questions and answer options.
 * - Managing user responses and tracking score.
 * - Showing a progress bar with a plane animation.
 * - Displaying the final score with a user rank image.
 * - Submitting quiz results to a backend.
 * - Showing score multiplier popup at quiz start.
 * 
 * Key Functionalities:
 * - useQuizQuestions (Custom Hook): Fetches and manages quiz questions.
 * - QuizQuestions (Main Component): Controls the quiz flow and UI.
 * - ProgressBar: Displays quiz progress with animated plane.
 * - QuestionCard: Shows the current question and answer options.
 * - OptionButton: Handles user answer selection and feedback.
 * - Score: Displays user rank image, score, and submits results.
 * - MultiplierPopup: Displays score multiplier information at quiz start.
 * 
 * Dependencies:
 * - React & React Native for UI and state management.
 * - react-native-vector-icons for icons.
 * - react-navigation for screen navigation.
 * - External API calls for fetching questions & posting results.
 * 
 * Usage:
 * This component is used in a navigation stack. It receives a `topicId`
 * via `route.params` to fetch relevant quiz questions.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image, Alert, Dimensions, ScrollView, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useFocusEffect } from '@react-navigation/native';
import { fetchQuestions, getUserInfo, postQuizResults,resetScoreMultiplier } from './apiHandler';
import { useUser } from './userInfo';  // Import the hook
import { LogBox } from 'react-native';
import Colors from '../constants/Colors';

LogBox.ignoreAllLogs(); // Ignore all log notifications

// Get the device screen width and height
const { width, height } = Dimensions.get('window');
const getFontSize = (size) => {
  const baseScale = 375;  // base screen width
  return size * (width / baseScale);
};
const getscaleSize = (size) => size * (width / 375); // Base size scaling

const images = {
  SCEngineer: require('../images/AvatarProgression/Engineer.jpg'),
  TeamIC: require('../images/AvatarProgression/TeamIC.jpg'),
  FlightLead: require('../images/AvatarProgression/FlightLead.jpg'),
  OC: require('../images/AvatarProgression/OC.jpg'),
  CO: require('../images/AvatarProgression/CO.jpg'),
  Commander: require('../images/AvatarProgression/Commander.jpg'),
  Trainee: require('../images/AvatarProgression/Trainee.jpg'), // Added fallback image
};

// Adjust font sizes and layout based on screen size
const scale = width / 375; // 375 is the base width for standard screen size (like iPhone 6)
// Custom Hook for Fetching Quiz Questions with Error Handling
const useQuizQuestions = (topicId) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true);
      try {
        const response = await fetchQuestions(topicId);
        console.log("Fetched Questions:", response);
        if (!response || !response.questionsData || response.questionsData.length === 0) {
          throw new Error('No questions found.');
        }
        setQuestions(response.questionsData);  // Set the correct questionsData
      } catch (err) {
        setError(err.message || 'An error occurred while fetching questions.');
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [topicId]);

  return { questions, loading, error };
};

// Score Multiplier Popup Component
const MultiplierPopup = ({ visible, onClose, scoreMultiplier }) => {
  // Determine message based on multiplier value
  const getMessage = () => {
    if (scoreMultiplier === 1) {
      return "Your score will be calculated normally.";
    } else if (scoreMultiplier > 1) {
      return `Power up active! Your score will be multiplied by ${scoreMultiplier}x`;
    } else {
      return `Power down active! Your score will be reduced to ${scoreMultiplier * 100}% of normal.`;
    }
  };

  // Determine background color based on multiplier
  const getBackgroundColor = () => {
    if (scoreMultiplier === 1) return '#4682B4'; // Normal - blue
    if (scoreMultiplier > 1) return '#4CAF50';   // Boost - green
    return '#FF6347';                           // Reduction - red
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: getBackgroundColor() }]}>
          <Icon 
            name={scoreMultiplier >= 1 ? "rocket" : "arrow-down"} 
            size={50} 
            color="white" 
            style={styles.modalIcon} 
          />
          
          <Text style={styles.modalTitle}>
            {scoreMultiplier === 1 ? "Ready for Takeoff" : 
             scoreMultiplier > 1 ? "Score Boost Active!" : 
             "Score Reduction Active!"}
          </Text>
          
          <Text style={styles.modalMessage}>{getMessage()}</Text>
          
          <TouchableOpacity style={styles.modalButton} onPress={onClose}>
            <Text style={styles.modalButtonText}>Let's Go!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// Main Component for Quiz Questions
// Main Component for Quiz Questions
const QuizQuestions = ({ navigation, route }) => {
  const { id } = route.params; // Destructure 'id' from route.params
  console.log("Received ID:", id); // Log to check if it comes through correctly
  const { questions, loading, error } = useQuizQuestions(id);
  const { userEmail } = useUser();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answerLocked, setAnswerLocked] = useState(false);
  
  // New state for score multiplier and popup
  const [scoreMultiplier, setScoreMultiplier] = useState(1);
  const [showMultiplierPopup, setShowMultiplierPopup] = useState(false);
  const [userDocumentID, setUserDocumentID] = useState(null);
  // New state to track if the quiz content should be shown
  const [showQuizContent, setShowQuizContent] = useState(false);

  // Fetch user info and score multiplier
  useEffect(() => {
    const fetchUserMultiplier = async () => {
      try {
        const userInfo = await getUserInfo(userEmail);
        if (userInfo) {
          setUserDocumentID(userInfo.id);
          const multiplier = userInfo.scoreMultiplier || 1; // Default to 1 if not present
          setScoreMultiplier(multiplier);
          setShowMultiplierPopup(true); // Show popup after getting multiplier
        }
      } catch (error) {
        console.error("Error fetching user multiplier:", error);
        Alert.alert('Error', 'Unable to fetch your power-up status. Playing with standard scoring.');
        // If there's an error, allow quiz to start anyway
        setShowQuizContent(true);
      }
    };

    fetchUserMultiplier();
  }, [userEmail]);

  // Handle TabBar Visibility
  useFocusEffect(
    useCallback(() => {
      navigation.getParent()?.setOptions({ tabBarStyle: { display: 'none' } });
      return () => navigation.getParent()?.setOptions({ tabBarStyle: { display: 'flex' } });
    }, [navigation])
  );

  // Handle Answer Selection with multiplier
  const handleAnswer = (answer) => {
    if (answer === questions[currentQuestion]?.answer) {
      // Apply score multiplier to correct answers
      setScore(prev => prev + 1 * scoreMultiplier);
    }
    setSelectedAnswer(answer);
    setAnswerLocked(true);
  };

  // Move to the Next Question
  const moveNextQuestion = () => {
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setAnswerLocked(false);
    } else {
      setShowScore(true);
    }
  };

  // Restart Quiz and Go Back
  const handleRestart = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowScore(false);
    setAnswerLocked(false);
    setSelectedAnswer(null);
    navigation.goBack();
  };

  // Auto-advance after Answer Selection
  useEffect(() => {
    if (answerLocked) {
      const timeout = setTimeout(moveNextQuestion, 1000);
      return () => clearTimeout(timeout);
    }
  }, [answerLocked, currentQuestion]);

  // Handler for closing the multiplier popup
  const handleCloseMultiplierPopup = () => {
    setShowMultiplierPopup(false);
    // Only show quiz content after popup is closed
    setShowQuizContent(true);
  };

  // Loading, Error Handling, and displaying messages
  if (loading) return <Text style={styles.loadingText}>Loading...</Text>;
  if (error) return <Text style={styles.errorText}>Error: {error}</Text>;

  return (
    <View style={styles.container}>
      {/* Score Multiplier Popup */}
      <MultiplierPopup 
        visible={showMultiplierPopup} 
        onClose={handleCloseMultiplierPopup} 
        scoreMultiplier={scoreMultiplier} 
      />

      {/* Only show quiz content when showQuizContent is true */}
      {showQuizContent && (
        <>
          {!showScore && <ProgressBar currentQuestion={currentQuestion} totalQuestions={questions.length} />}

          {showScore ? (
            <Score 
              score={score} 
              totalQuestions={questions.length} 
              onRestart={handleRestart} 
              topicId={id}
              userDocumentID={userDocumentID} 
              scoreMultiplier={scoreMultiplier}
            />
          ) : (
            <QuestionCard
              question={questions[currentQuestion]}
              selectedAnswer={selectedAnswer}
              answerLocked={answerLocked}
              onAnswer={handleAnswer}
            />
          )}
        </>
      )}
      
      {/* Show a waiting message when popup is visible and quiz hasn't started */}
      {!showQuizContent && showMultiplierPopup && (
        <Text style={styles.waitingText}>Get ready for the quiz!</Text>
      )}
    </View>
  );
};

// Progress Bar for Tracking Quiz Progress
const ProgressBar = ({ currentQuestion, totalQuestions }) => {
  const progress = (currentQuestion / totalQuestions) * 100;
  const numOfDashes = 15;
  const dashes = Array.from({ length: numOfDashes }, (_, i) => {
    const opacity = i / numOfDashes <= progress / 100 ? 1 : 0.3;
    return <View key={i} style={[styles.dash, { left: `${(i / numOfDashes) * 100}%`, opacity }]} />;
  });

  return (
    <View style={styles.progressBarContainer}>
      <View style={styles.progressBar}>
        {dashes}
        <Icon name="plane" size={60} style={[styles.planeIcon, { left: `${progress}%` }]} />
      </View>
    </View>
  );
};

// Display Question Card with Options
const QuestionCard = ({ question, selectedAnswer, answerLocked, onAnswer }) => {
  const [shuffledOptions, setShuffledOptions] = useState([]);

  const shuffleArray = (array) => {
    let shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  useEffect(() => {
    if (question?.options) {
      setShuffledOptions(shuffleArray(question.options));
    }
  }, [question]);

  if (!question) return <Text style={styles.loadingText}>Loading question...</Text>;

  return (
    <>
      <Text style={[styles.questionText, { fontSize: 24 }]}>{question?.question || 'Loading question...'}</Text>
      
      <Text style={styles.scrollHint}>Scroll to see more options ↓</Text>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.optionsContainer}>
        {shuffledOptions.length > 0 ? (
          shuffledOptions.map((option, index) => (
            <OptionButton
              key={index}
              option={option}
              selectedAnswer={selectedAnswer}
              isCorrect={option === question.answer}
              onAnswer={onAnswer}
              answerLocked={answerLocked}
            />
          ))
        ) : (
          <Text style={styles.loadingText}>No options available</Text>
        )}
      </ScrollView>
    </>
  );
};

// Option Button Component with Answer Feedback
const OptionButton = ({ option, selectedAnswer, isCorrect, onAnswer, answerLocked }) => (
  <TouchableOpacity
    onPress={() => onAnswer(option)}
    style={[
      styles.optionButton,
      selectedAnswer === option && (isCorrect ? styles.correctOption : styles.incorrectOption)
    ]}
    disabled={answerLocked}
  >
    <Text
      style={[
        styles.optionsBox,
        selectedAnswer === option && { marginRight: 35, fontSize: 14 }
      ]}
    >
      {option}
    </Text>
    {selectedAnswer === option && (
      <Icon
        name={isCorrect ? 'check-circle' : 'times-circle'}
        size={30}
        color={isCorrect ? '#90EE90' : '#FF6F6F'}
        style={styles.icon}
      />
    )}
  </TouchableOpacity>
);

// Score Component with Ranking and Restart Option
const Score = ({ score, totalQuestions, onRestart, topicId, userDocumentID, scoreMultiplier }) => {
  const { userEmail } = useUser();
  const [imageSource, setImageSource] = useState(require('../images/AvatarProgression/Trainee.jpg')); // Default image
  const finalScore = Math.round(score); // Ensure score is rounded to nearest integer

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        if (!userDocumentID) {
          const userInfo = await getUserInfo(userEmail);
          if (userInfo) {
            userDocumentID(userInfo.id);
            setImageSource(images[userInfo.rank.selectedTitle] || images.Trainee);
          }
        } else {
          const userInfo = await getUserInfo(userEmail);
          setImageSource(images[userInfo.rank.selectedTitle] || images.Trainee);
        }
      } catch (error) {
        Alert.alert('Error', 'Unable to fetch user info. Please try again later.');
      }
    };

    fetchUserInfo();
  }, [userEmail, userDocumentID]);

  useEffect(() => {
    if (userDocumentID && topicId !== undefined && finalScore !== undefined) {
      try {
        console.log('Submitting quiz results...', userDocumentID, topicId, finalScore);
        postQuizResults(userDocumentID, topicId, finalScore);
        resetScoreMultiplier(userDocumentID);
      } catch (error) {
        Alert.alert('Error', 'Unable to submit your results. Please try again later.');
      }
    }
  }, [userDocumentID, topicId, finalScore]); // Dependency array ensures postQuizResults is called only when userDocumentID is set

  if (!userDocumentID) return <Text style={styles.loadingText}>Loading user info...</Text>;

  return (
    <View style={styles.scoreContainer}>
      <Image source={imageSource} style={styles.avatar} />
      <Text style={styles.scoreText}>Score: {finalScore} / {totalQuestions}</Text>
      
      {scoreMultiplier !== 1 && (
        <View style={styles.multiplierInfo}>
          <Icon 
            name={scoreMultiplier > 1 ? "rocket" : "arrow-down"} 
            size={20} 
            color={scoreMultiplier > 1 ? "#4CAF50" : "#FF6347"} 
            style={{marginRight: 10}} 
          />
          <Text style={styles.multiplierText}>
            {scoreMultiplier > 1 
              ? `Score boosted by ${scoreMultiplier}x!` 
              : `Score reduced to ${scoreMultiplier * 100}%`}
          </Text>
        </View>
      )}
      
      <TouchableOpacity
        style={styles.resetButton}
        onPress={() => {
          try {
            onRestart(finalScore);
          } catch (error) {
            Alert.alert('Error', 'Unable to restart. Please try again later.');
          }
        }}
      >
        <Text style={styles.resetButtonText}>Home</Text>
      </TouchableOpacity>
    </View>
  );
};

// Styles for the Components
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.mainBackgroundColor, 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingTop: height * 0.1, // 10% of screen height
    width: '100%' 
  },
  questionText: { 
    fontSize: getFontSize(36), // Scale font size dynamically
    textAlign: 'center', 
    color: 'white', 
    fontWeight: 'bold', 
    fontFamily: 'Roboto', 
    marginBottom: getscaleSize(20),
    marginTop: getscaleSize(40),
  },
  optionsContainer: { 
    marginVertical: 20, 
    width: '100%', 
    alignItems: 'center' 
  },
  optionButton: { 
    backgroundColor: '#5b7c99', 
    borderRadius: 20, 
    padding: 10, 
    marginVertical: 10, 
    width: '80%',  // Adjust width relative to screen size
    maxWidth: 300, 
    alignItems: 'center', 
    position: 'relative' 
  },
  optionsBox: { 
    color: 'white', 
    padding: 5, 
    marginVertical: 10, 
    textAlign: 'center', 
    fontSize: getFontSize(18),  // Scale the font size dynamically
    borderRadius: 20, 
    width: '100%' 
  },
  correctOption: { 
    borderWidth: 3, 
    borderColor: '#90EE90', 
    backgroundColor: '#5b7c99', 
    borderRadius: 20, 
    padding: 5 
  },
  incorrectOption: { 
    borderWidth: 3, 
    borderColor: '#FF6F6F', 
    backgroundColor: '#5b7c99', 
    borderRadius: 20, 
    padding: 5 
  },
  icon: { 
    position: 'absolute', 
    bottom: 10, 
    right: 10 
  },
  loadingText: { 
    color: 'white', 
    fontSize: getFontSize(20), // Scale font size dynamically
    fontWeight: 'bold' 
  },
  errorText: { 
    color: 'red', 
    fontSize: getFontSize(20), 
    fontWeight: 'bold' 
  },
  resetButton: { 
    backgroundColor: '#e0a100', 
    padding: 15, 
    borderRadius: 10, 
    width: '90%',  // Make button width relative
    alignItems: 'center', 
    marginVertical: '5%' 
  },
  resetButtonText: { 
    color: '#fff', 
    fontSize: getFontSize(20),  // Scale button text dynamically
    fontWeight: 'bold' 
  },
  scoreContainer: { 
    backgroundColor: Colors.mainBackgroundColor, 
    padding: 30, 
    borderRadius: 20, 
    alignItems: 'center', 
    width: '90%' 
  },
  rankText: { 
    color: '#FFD700', 
    fontSize: getFontSize(24),  // Scale rank text dynamically
    fontWeight: 'bold', 
    marginBottom: 10 
  },
  avatar: { 
    width: getFontSize(150), 
    height: getFontSize(150), 
    borderRadius: getFontSize(60), 
    backgroundColor: '#ccc', 
    marginBottom: 20 
  },
  scoreText: { 
    fontSize: getFontSize(28), 
    color: 'white', 
    fontWeight: 'bold', 
    marginBottom: 20 
  },
  progressBarContainer: { 
    position: 'absolute', 
    top: getscaleSize(50),
    width: '90%', 
    height: getFontSize(60), 
    backgroundColor: '#071f35', 
    borderRadius: 10, 
    overflow: 'hidden', 
  },
  progressBar: { 
    position: 'relative', 
    width: '100%', 
    height: '100%' 
  },
  dash: { 
    position: 'absolute', 
    top: getFontSize(28), 
    width: 10, 
    height: 2, 
    backgroundColor: '#ffffff' 
  },
  planeIcon: { 
    position: 'absolute', 
    zIndex: 1 , 
    color: Colors.gold 
  },
  scrollView: {
    width: '100%',
    maxHeight: '70%', // Adjust max height to fit screen
  },
  optionsContainer: {
    alignItems: 'center',
    paddingBottom: 20, // Ensure some space at bottom for scrolling
  },
  scrollHint: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 5,
  },
  // New styles for multiplier popup
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
  },
  modalIcon: {
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: getFontSize(24),
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: getFontSize(18),
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  modalButtonText: {
    fontSize: getFontSize(18),
    fontWeight: 'bold',
    color: '#333',
  },
  multiplierInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
  },
  multiplierText: {
    color: 'white',
    fontSize: getFontSize(16),
  },
});

export default QuizQuestions;