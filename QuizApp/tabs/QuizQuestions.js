import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image, Alert, Dimensions, ScrollView, Modal, SafeAreaView, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useFocusEffect } from '@react-navigation/native';
import { fetchQuestions, getUserInfo, postQuizResults, resetScoreMultiplier } from './apiHandler';
import { useUser } from './userInfo';
import { LogBox } from 'react-native';
import Colors from '../constants/Colors';

LogBox.ignoreAllLogs(); // Ignore all log notifications

// Get the device screen width and height
const { width, height } = Dimensions.get('window');

// Responsive scaling helpers
const getFontSize = (size) => size * (width / 375);
const getScaleSize = (size) => size * (width / 375);
const isSmallDevice = width < 375;
const isLargeDevice = width >= 768;

const images = {
  SCEngineer: require('../images/AvatarProgression/Engineer.jpg'),
  TeamIC: require('../images/AvatarProgression/TeamIC.jpg'),
  FlightLead: require('../images/AvatarProgression/FlightLead.jpg'),
  OC: require('../images/AvatarProgression/OC.jpg'),
  CO: require('../images/AvatarProgression/CO.jpg'),
  Commander: require('../images/AvatarProgression/Commander.jpg'),
  Trainee: require('../images/AvatarProgression/Trainee.jpg'), // Added fallback image
};

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
        setQuestions(response.questionsData);
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
      return;
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
            size={getFontSize(50)} 
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
const QuizQuestions = ({ navigation, route }) => {
  const { id } = route.params;
  console.log("Received ID:", id);
  const { questions, loading, error } = useQuizQuestions(id);
  const { userEmail } = useUser();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answerLocked, setAnswerLocked] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(null);
  
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
      if (navigation.getParent()) {
        navigation.getParent().setOptions({ tabBarVisible: false });
      }
      return () => {
        if (navigation.getParent()) {
          navigation.getParent().setOptions({ tabBarVisible: true });
        }
      };
    }, [navigation])
  );

  // Handle Answer Selection with multiplier
  const handleAnswer = (answer) => {
    const isCorrect = answer === questions[currentQuestion]?.answer;
    
    if (isCorrect) {
      // Apply score multiplier to correct answers
      setScore(prev => prev + 1 * scoreMultiplier);
      setIsAnswerCorrect(true);
    } else {
      setIsAnswerCorrect(false);
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
      setIsAnswerCorrect(null);
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
    setIsAnswerCorrect(null);
    navigation.goBack();
  };

  // Auto-advance after Answer Selection
  useEffect(() => {
    if (answerLocked) {
      const timeout = setTimeout(moveNextQuestion, 2500);
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
  if (loading) return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.loadingText}>Loading...</Text>
    </SafeAreaView>
  );
  
  if (error) return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.errorText}>Error: {error}</Text>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.container}>
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
              isAnswerCorrect={isAnswerCorrect}
            />
          )}
        </>
      )}
      
      {/* Show a waiting message when popup is visible and quiz hasn't started */}
      {!showQuizContent && showMultiplierPopup && (
        <Text style={styles.waitingText}>Get ready for the quiz!</Text>
      )}
    </SafeAreaView>
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
        <Icon name="plane" size={getFontSize(50)} style={[styles.planeIcon, { left: `${progress}%` }]} />
      </View>
    </View>
  );
};

// Display Question Card with Options
const QuestionCard = ({ question, selectedAnswer, answerLocked, onAnswer, isAnswerCorrect }) => {
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
      <Text style={styles.questionText}>{question?.question || 'Loading question...'}</Text>
      
      {shuffledOptions.length > 4 && (
        <Text style={styles.scrollHint}>Scroll to see more options ↓</Text>
      )}
      
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.optionsContainer}
        showsVerticalScrollIndicator={true}
      >
        {shuffledOptions.length > 0 ? (
          shuffledOptions.map((option, index) => (
            <OptionButton
              key={index}
              option={option}
              selectedAnswer={selectedAnswer}
              isCorrect={option === question.answer}
              onAnswer={onAnswer}
              answerLocked={answerLocked}
              highlightCorrect={!isAnswerCorrect && answerLocked}
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
const OptionButton = ({ option, selectedAnswer, isCorrect, onAnswer, answerLocked, highlightCorrect }) => {
  // Determine button style based on selection and correctness
  const getButtonStyle = () => {
    // If this is the selected answer
    if (selectedAnswer === option) {
      return isCorrect ? styles.correctOption : styles.incorrectOption;
    }
    // If we should highlight the correct answer when user got it wrong
    else if (highlightCorrect && isCorrect) {
      return styles.correctAnswerHighlight;
    }
    return {};
  };

  return (
    <TouchableOpacity
      onPress={() => onAnswer(option)}
      style={[
        styles.optionButton,
        getButtonStyle()
      ]}
      disabled={answerLocked}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.optionsBox,
          selectedAnswer === option && { marginRight: 35 }
        ]}
        numberOfLines={3}
        ellipsizeMode="tail"
      >
        {option}
      </Text>
      
      {/* Show feedback icon for selected answer */}
      {selectedAnswer === option && (
        <Icon
          name={isCorrect ? 'check-circle' : 'times-circle'}
          size={getFontSize(20)}
          color={isCorrect ? '#90EE90' : '#FF6F6F'}
          style={styles.icon}
        />
      )}
      
      {/* Show correct answer icon when user selected wrong answer */}
      {highlightCorrect && isCorrect && (
        <Icon
          name="check-circle"
          size={getFontSize(20)}
          color="#90EE90"
          style={styles.icon}
        />
      )}
    </TouchableOpacity>
  );
};

// Score Component with Ranking and Restart Option
const Score = ({ score, totalQuestions, onRestart, topicId, userDocumentID, scoreMultiplier }) => {
  const { userEmail } = useUser();
  const [imageSource, setImageSource] = useState(require('../images/AvatarProgression/Trainee.jpg')); // Default image
  const finalScore = Math.round(score); // Ensure score is rounded to nearest integer
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    const submitResults = async () => {
      if (userDocumentID && topicId !== undefined && finalScore !== undefined && !isSubmitting) {
        setIsSubmitting(true);
        try {
          console.log('Submitting quiz results...', userDocumentID, topicId, finalScore);
          await postQuizResults(userDocumentID, topicId, finalScore);
          await resetScoreMultiplier(userDocumentID);
        } catch (error) {
          Alert.alert('Error', 'Unable to submit your results. Please try again later.');
        } finally {
          setIsSubmitting(false);
        }
      }
    };

    submitResults();
  }, [userDocumentID, topicId, finalScore]);

  if (!userDocumentID) return <Text style={styles.loadingText}>Loading user info...</Text>;

  const scorePercentage = (finalScore / totalQuestions) * 100;
  const scoreColor = 
    scorePercentage >= 80 ? '#4CAF50' : 
    scorePercentage >= 60 ? '#FFC107' : 
    '#FF5252';

  return (
    <View style={styles.scoreContainer}>
      <Image source={imageSource} style={styles.avatar} />
      
      <Text style={[styles.scoreText, { color: scoreColor }]}>
        Score: {finalScore} / {totalQuestions}
      </Text>
      
      {scoreMultiplier !== 1 && (
        <View style={styles.multiplierInfo}>
          <Icon 
            name={scoreMultiplier > 1 ? "rocket" : "arrow-down"} 
            size={getFontSize(20)} 
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
        disabled={isSubmitting}
      >
        <Text style={styles.resetButtonText}>
          {isSubmitting ? 'Submitting...' : 'Home'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// Enhanced styles for better responsiveness
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.mainBackgroundColor, 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingTop: Platform.OS === 'ios' ? getScaleSize(20) : getScaleSize(40), 
    paddingHorizontal: getScaleSize(10),
    width: '100%' 
  },
  questionText: { 
    fontSize: isSmallDevice ? getFontSize(20) : isLargeDevice ? getFontSize(32) : getFontSize(24),
    textAlign: 'center', 
    color: 'white', 
    fontWeight: 'bold', 
    fontFamily: 'Roboto', 
    marginBottom: getScaleSize(20),
    marginTop: getScaleSize(75),
    paddingHorizontal: getScaleSize(15),
  },
  optionsContainer: { 
    marginVertical: getScaleSize(15), 
    width: '100%', 
    alignItems: 'center',
    paddingHorizontal: getScaleSize(10),
  },
  optionButton: { 
    backgroundColor: '#5b7c99', 
    borderRadius: getScaleSize(20), 
    padding: getScaleSize(10), 
    marginVertical: getScaleSize(8), 
    width: isLargeDevice ? '70%' : '90%',
    maxWidth: 400, 
    alignItems: 'center', 
    position: 'relative',
    minHeight: getScaleSize(60),
    justifyContent: 'center',
  },
  optionsBox: { 
    color: 'white', 
    padding: getScaleSize(5), 
    textAlign: 'center', 
    fontSize: isSmallDevice ? getFontSize(14) : getFontSize(16),
    width: '100%' 
  },
  correctOption: { 
    borderWidth: 3, 
    borderColor: '#90EE90', 
    backgroundColor: 'rgba(144, 238, 144, 0.2)',
  },
  incorrectOption: { 
    borderWidth: 3, 
    borderColor: '#FF6F6F', 
    backgroundColor: 'rgba(255, 111, 111, 0.2)',
  },
  // New style for highlighting the correct answer when user got it wrong
  correctAnswerHighlight: {
    borderWidth: 3,
    borderColor: '#90EE90',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(144, 238, 144, 0.1)',
  },
  icon: { 
    position: 'absolute', 
    right: getScaleSize(10),
  },
  loadingText: { 
    color: 'white', 
    fontSize: getFontSize(20),
    fontWeight: 'bold',
    textAlign: 'center', 
  },
  waitingText: {
    color: 'white',
    fontSize: getFontSize(20),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorText: { 
    color: 'red', 
    fontSize: getFontSize(20), 
    fontWeight: 'bold',
    textAlign: 'center',
    padding: getScaleSize(20),
  },
  resetButton: { 
    backgroundColor: '#e0a100', 
    padding: getScaleSize(15), 
    borderRadius: getScaleSize(10), 
    width: isLargeDevice ? '60%' : '90%',
    maxWidth: 300,
    alignItems: 'center', 
    marginVertical: getScaleSize(20),
  },
  resetButtonText: { 
    color: '#fff', 
    fontSize: getFontSize(20),
    fontWeight: 'bold' 
  },
  scoreContainer: { 
    backgroundColor: Colors.mainBackgroundColor, 
    padding: getScaleSize(20), 
    borderRadius: getScaleSize(20), 
    alignItems: 'center', 
    width: '100%',
    maxWidth: 500,
  },
  rankText: { 
    color: '#FFD700', 
    fontSize: getFontSize(24),
    fontWeight: 'bold', 
    marginBottom: getScaleSize(10),
  },
  avatar: { 
    width: isSmallDevice ? getFontSize(120) : getFontSize(150), 
    height: isSmallDevice ? getFontSize(120) : getFontSize(150), 
    borderRadius: getFontSize(75), 
    backgroundColor: '#ccc', 
    marginBottom: getScaleSize(20),
  },
  scoreText: { 
    fontSize: getFontSize(28), 
    fontWeight: 'bold', 
    marginBottom: getScaleSize(20),
  },
  progressBarContainer: { 
    position: 'absolute', 
    top: Platform.OS === 'ios' ? getScaleSize(50) : getScaleSize(30),
    width: '90%', 
    height: getFontSize(60), 
    backgroundColor: '#071f35', 
    borderRadius: getScaleSize(10), 
    overflow: 'hidden',
    maxWidth: 500,
  },
  progressBar: { 
    position: 'relative', 
    width: '100%', 
    height: '100%',
  },
  dash: { 
    position: 'absolute', 
    top: getFontSize(28), 
    width: getScaleSize(10), 
    height: getScaleSize(2), 
    backgroundColor: '#ffffff' 
  },
  planeIcon: { 
    position: 'absolute', 
    top: getScaleSize(5),
    zIndex: 1, 
    color: Colors.gold 
  },
  scrollView: {
    width: '100%',
    maxHeight: isLargeDevice ? '65%' : '60%',
  },
  scrollHint: {
    fontSize: isSmallDevice ? getFontSize(12) : getFontSize(14),
    color: '#aaa',
    textAlign: 'center',
    marginBottom: getScaleSize(5),
  },
  // Styles for multiplier popup
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: isLargeDevice ? '60%' : '80%',
    maxWidth: 400,
    borderRadius: getScaleSize(20),
    padding: getScaleSize(20),
    alignItems: 'center',
    elevation: 5,
  },
  modalIcon: {
    marginBottom: getScaleSize(15),
  },
  modalTitle: {
    fontSize: getFontSize(24),
    fontWeight: 'bold',
    color: 'white',
    marginBottom: getScaleSize(10),
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: getFontSize(18),
    color: 'white',
    textAlign: 'center',
    marginBottom: getScaleSize(20),
  },
  modalButton: {
    backgroundColor: 'white',
    paddingVertical: getScaleSize(10),
    paddingHorizontal: getScaleSize(20),
    borderRadius: getScaleSize(10),
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
    padding: getScaleSize(10),
    borderRadius: getScaleSize(10),
    marginBottom: getScaleSize(15),
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  multiplierText: {
    color: 'white',
    fontSize: getFontSize(16),
    textAlign: 'center',
  },
});

export default QuizQuestions;