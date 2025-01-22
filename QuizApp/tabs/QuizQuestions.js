import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Dimensions, Image } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useFocusEffect } from '@react-navigation/native';
import { fetchQuizQuestions } from './apiHandler';  // Import the function

const QuizQuestions = ({ navigation, route }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answerLocked, setAnswerLocked] = useState(false);
  const [questions, setQuestions] = useState([]);  // State for quiz questions
  const [loading, setLoading] = useState(true);  // Loading state

  const { topicId } = route.params;

  // Fetch quiz questions from the API when the component is mounted
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const fetchedQuestions = await fetchQuizQuestions(topicId);
        setQuestions(fetchedQuestions);
      } catch (error) {
        console.error("Error loading quiz questions:", error);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [topicId]);

  // Hide bottom navigation bar when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      navigation.getParent()?.setOptions({ tabBarStyle: { display: 'none' } });

      return () => {
        navigation.getParent()?.setOptions({ tabBarStyle: { display: 'flex' } });
      };
    }, [navigation])
  );

  const getRank = (score) =>
    score === questions.length
      ? 'Elite Pilot'
      : score >= questions.length - 2
      ? 'Veteran Pilot'
      : score >= questions.length - 4
      ? 'Cadet'
      : 'Recruit';

  const handleAnswer = (answer) => {
    if (answer === questions[currentQuestion]?.answer) setScore((prev) => prev + 1);
    setSelectedAnswer(answer);
    setAnswerLocked(true);
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowScore(false);
    setAnswerLocked(false);
    setSelectedAnswer(null);
    navigation.goBack();
  };

  const moveNextQuestion = () => {
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setAnswerLocked(false);
    } else setShowScore(true);
  };

  useEffect(() => {
    if (answerLocked) {
      const timeout = setTimeout(() => {
        moveNextQuestion();
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [answerLocked, currentQuestion]);

  if (loading) {
    return <Text style={styles.loadingText}>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      {!showScore && <ProgressBar currentQuestion={currentQuestion} totalQuestions={questions.length} />}

      {showScore ? (
        <View style={styles.scoreContainer}>
          <Text style={styles.rankText}>Rank: {getRank(score)}</Text>
          <Image source={require('../images/soldier.png')} style={styles.avatar} />
          <Text style={styles.scoreText}>
            Score: {score} / {questions.length}
          </Text>
          <TouchableOpacity style={styles.resetButton} onPress={handleRestart}>
            <Text style={styles.resetButtonText}>Home</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text style={[styles.questionText, { fontSize: 40 }]}>{questions[currentQuestion]?.question}</Text>
          <View style={styles.optionsContainer}>
            {questions[currentQuestion]?.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleAnswer(option)}
                style={[
                  styles.optionButton,
                  selectedAnswer === option
                    ? option === questions[currentQuestion]?.answer
                      ? styles.correctOption
                      : styles.incorrectOption
                    : null,
                ]}
                disabled={answerLocked}
              >
                <Text
                  style={[
                    styles.optionsBox,
                    selectedAnswer === option && { marginRight: 35 },
                  ]}
                >
                  {option}
                </Text>
                {selectedAnswer === option && (
                  <Icon
                    name={
                      option === questions[currentQuestion]?.answer
                        ? 'check-circle'
                        : 'times-circle'
                    }
                    size={30}
                    color={
                      option === questions[currentQuestion]?.answer
                        ? '#90EE90'
                        : '#FF6F6F'
                    }
                    style={styles.icon}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </View>
  );
};

// ProgressBar component to show progress of quiz
const ProgressBar = ({ currentQuestion, totalQuestions }) => {
  const progress = (currentQuestion / totalQuestions) * 100;
  const numOfDashes = 15;
  const dashes = Array.from({ length: numOfDashes }, (_, i) => {
    const opacity = i / numOfDashes <= progress / 100 ? 1 : 0.3;
    return (
      <View
        key={i}
        style={[styles.dash, { left: `${(i / numOfDashes) * 100}%`, opacity }]}
      />
    );
  });

  return (
    <View style={styles.progressBarContainer}>
      <View style={styles.progressBar}>
        {dashes}
        <Icon
          name="plane"
          size={60}
          style={[styles.planeIcon, { left: `${progress}%` }]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e3c62',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: '10%',
    width: '100%',
  },
  questionText: {
    fontSize: 36,
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold',
    fontFamily: 'Roboto',
  },
  optionButton: {
    backgroundColor: '#5b7c99',
    borderRadius: 20,
    padding: 5,
    marginVertical: 10,
    width: '100%',
  },
  optionsContainer: { marginVertical: '5%', width: '90%' },
  optionsBox: {
    color: 'white',
    padding: 5,
    marginVertical: 10,
    textAlign: 'center',
    fontSize: 18,
    borderRadius: 20,
    width: '90%',
  },
  correctOption: {
    borderWidth: 3,
    borderColor: '#90EE90',
    backgroundColor: '#5b7c99',
    borderRadius: 20,
    padding: 5,
  },
  incorrectOption: {
    borderWidth: 3,
    borderColor: '#FF6F6F',
    backgroundColor: '#5b7c99',
    borderRadius: 20,
    padding: 5,
  },
  resetButton: {
    backgroundColor: '#e0a100',
    padding: 15,
    borderRadius: 10,
    width: '90%',
    alignItems: 'center',
    marginVertical: '5%',
  },
  resetButtonText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  scoreContainer: {
    backgroundColor: '#3a506b',
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    width: '90%',
  },
  rankText: { color: '#FFD700', fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  avatar: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#ccc', marginBottom: 20 },
  scoreText: { fontSize: 28, color: 'white', fontWeight: 'bold', marginBottom: 20 },
  progressBarContainer: {
    position: 'absolute',
    top: 110,
    width: '90%',
    height: 60,
    backgroundColor: '#071f35',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressBar: { position: 'relative', width: '100%', height: '100%', flexDirection: 'row', alignItems: 'center' },
  dash: { position: 'absolute', top: '50%', width: 10, height: 6, backgroundColor: 'white', borderRadius: 2, transform: [{ translateY: -2 }, { translateX: 7 }] },
  planeIcon: { position: 'absolute', color: '#FFD700', top: 0 },
  loadingText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
});

export default QuizQuestions;
