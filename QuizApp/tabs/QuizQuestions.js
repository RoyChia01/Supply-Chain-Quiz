import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useFocusEffect } from '@react-navigation/native';
import { fetchQuestions } from './apiHandler'; // Import useNavigation

// Custom Hook for fetching quiz questions
const useQuizQuestions = (documentId) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true);
      try {
        const response = await fetchQuestions(documentId);
        setQuestions(response.questions);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [documentId]);

  return { questions, loading, error };
};

const QuizQuestions = ({ navigation, route }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answerLocked, setAnswerLocked] = useState(false);
  const { documentId } = route.params;
  const { questions, loading, error } = useQuizQuestions(documentId);

  useFocusEffect(
    useCallback(() => {
      navigation.getParent()?.setOptions({ tabBarStyle: { display: 'none' } });
      return () => {
        navigation.getParent()?.setOptions({ tabBarStyle: { display: 'flex' } });
      };
    }, [navigation])
  );

  const getRank = (score) => {
    if (score === questions.length) return 'Elite Pilot';
    if (score >= questions.length - 2) return 'Veteran Pilot';
    if (score >= questions.length - 4) return 'Cadet';
    return 'Recruit';
  };

  const handleAnswer = (answer) => {
    if (answer === questions[currentQuestion]?.answer) {
      setScore((prev) => prev + 1);
    }
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

  if (loading) return <Text style={styles.loadingText}>Loading...</Text>;
  if (error) return <Text style={styles.loadingText}>Error: {error.message}</Text>;

  return (
    <View style={styles.container}>
      {!showScore && <ProgressBar currentQuestion={currentQuestion} totalQuestions={questions.length} />}

      {showScore ? (
        <Score score={score} totalQuestions={questions.length} getRank={getRank} onRestart={handleRestart} />
      ) : (
        <QuestionCard
          question={questions[currentQuestion]}
          selectedAnswer={selectedAnswer}
          answerLocked={answerLocked}
          onAnswer={handleAnswer}
        />
      )}
    </View>
  );
};

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

const QuestionCard = ({ question, selectedAnswer, answerLocked, onAnswer }) => {
  if (!question) return <Text style={styles.loadingText}>Loading question...</Text>;

  return (
    <>
      <Text style={[styles.questionText, { fontSize: 40 }]}>{question?.question || 'Loading question...'}</Text>

      <View style={styles.optionsContainer}>
        {question.optionList?.length ? (
          question.optionList.map((option, index) => (
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
      </View>
    </>
  );
};

const OptionButton = ({ option, selectedAnswer, isCorrect, onAnswer, answerLocked }) => {
  return (
    <TouchableOpacity
      onPress={() => onAnswer(option)}
      style={[
        styles.optionButton,
        selectedAnswer === option
          ? isCorrect
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
          selectedAnswer === option && { fontSize: 14 }, // Reduce font size when selected
        ]}
      >
        {option}
      </Text>
      {selectedAnswer === option && (
        <Icon
          name={isCorrect ? 'check-circle' : 'times-circle'}
          size={30}
          color={isCorrect ? '#90EE90' : '#FF6F6F'}
          style={[styles.icon, { right: 10, bottom: 10 }]} // Positioning the icon bottom-right
        />
      )}
    </TouchableOpacity>
  );
};
const Score = ({ score, totalQuestions, getRank, onRestart }) => (
  <View style={styles.scoreContainer}>
    <Text style={styles.rankText}>Rank: {getRank(score)}</Text>
    <Image source={require('../images/soldier.png')} style={styles.avatar} />
    <Text style={styles.scoreText}>Score: {score} / {totalQuestions}</Text>
    <TouchableOpacity style={styles.resetButton} onPress={onRestart}>
      <Text style={styles.resetButtonText}>Home</Text>
    </TouchableOpacity>
  </View>
);

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
    marginBottom: 20, // Added margin to space out from options
  },
  optionsContainer: {
    marginVertical: 20,
    width: '100%',
    alignItems: 'center', // Ensures options are centered
  },
  optionButton: {
    backgroundColor: '#5b7c99',
    borderRadius: 20,
    padding: 10,
    marginVertical: 10,
    width: '100%',
    maxWidth: 300, // Ensures buttons don't stretch too wide
    alignItems: 'center',
    position: 'relative', // Ensures that the icon is positioned relative to this container
  },
  
  optionsBox: {
    color: 'white',
    padding: 5,
    marginVertical: 10,
    textAlign: 'center',
    fontSize: 18,
    borderRadius: 20,
    width: '100%',
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
  icon: {
    position: 'absolute', // Positioning absolutely within the optionButton
    bottom: 10,           // Position at the bottom
    right: 10,            // Position at the right
  },
  loadingText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  resetButton: {
    backgroundColor: '#e0a100',
    padding: 15,
    borderRadius: 10,
    width: '90%',
    alignItems: 'center',
    marginVertical: '5%',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  scoreContainer: {
    backgroundColor: '#3a506b',
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    width: '90%',
  },
  rankText: {
    color: '#FFD700',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ccc',
    marginBottom: 20,
  },
  scoreText: {
    fontSize: 28,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  progressBarContainer: {
    position: 'absolute',
    top: 50,
    width: '90%',
    height: 60,
    backgroundColor: '#071f35',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressBar: {
    position: 'relative',
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  dash: {
    position: 'absolute',
    top: '50%',
    width: 10,
    height: 6,
    backgroundColor: 'white',
    borderRadius: 2,
    transform: [{ translateY: -2 }, { translateX: 7 }],
  },
  planeIcon: {
    position: 'absolute',
    color: '#FFD700',
    top: 0,
  },
});

export default QuizQuestions;
