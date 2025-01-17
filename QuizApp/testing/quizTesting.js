import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const Quiz = ({ onRestart }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answerLocked, setAnswerLocked] = useState(false);

  const { width, height } = Dimensions.get('window');

  const quizData = [
    {
      question: 'This is just a test question',
      options: ['option 1', 'option 2', 'option 3', 'option 4'],
      answer: 'option 2',
    },
    {
      question: 'Question 2',
      options: ['option 1', 'option 2', 'option 3', 'option 4'],
      answer: 'option 1',
    },
  ];

  const handleAnswer = (selectedAnswer) => {
    const correctAnswer = quizData[currentQuestion]?.answer;
    setSelectedAnswer(selectedAnswer);
    if (correctAnswer === selectedAnswer) {
      setScore((prevScore) => prevScore + 1);
    }
    setAnswerLocked(true);
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowScore(false);
    setAnswerLocked(false);
    setSelectedAnswer(null);
    onRestart && onRestart();
  };

  const movNextQuestion = () => {
    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < quizData.length) {
      setCurrentQuestion(nextQuestion);
      setSelectedAnswer(null);
      setAnswerLocked(false);
    } else {
      setShowScore(true);
    }
  };

  const ProgressBar = ({ currentQuestion, totalQuestions, showScore }) => {
    const progress = showScore ? 100 : (currentQuestion / totalQuestions) * 100;
    const numOfDashes = 15;
    const dashes = Array.from({ length: numOfDashes }, (_, i) => {
      const opacity = i / numOfDashes <= progress / 100 ? 1 : 0.3;
      return <View key={i} style={[styles.dash, { left: `${(i / numOfDashes) * 100}%`, opacity }]} />;
    });

    return (
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBar}>
          {dashes}
          <Icon
            name="plane"
            size={30}
            style={[styles.planeIcon, { left: `${progress}%` }]}
          />
        </View>
      </View>
    );
  };

  const calculateFontSize = (text) => {
    const maxLength = 40;
    return text.length > maxLength ? 24 : 48;
  };

  const getOptionStyle = (option, selectedAnswer, correctAnswer) => {
    if (selectedAnswer === option) {
      return option === correctAnswer
        ? styles.correctOption
        : styles.incorrectOption;
    }
    if (option === correctAnswer && selectedAnswer !== null) {
      return styles.correctOption;
    }
    return styles.optionButton;
  };

  const renderAnswerIcon = (option, selectedAnswer, correctAnswer) => {
    if (selectedAnswer === option) {
      return option === correctAnswer ? (
        <Icon name="check-circle" size={30} color="#90EE90" style={[styles.icon, { right: 30 }]} />
      ) : (
        <Icon name="times-circle" size={30} color="#FF6F6F" style={[styles.icon,{ right: 30 }]} />
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <ProgressBar currentQuestion={currentQuestion} totalQuestions={quizData.length} showScore={showScore} />

      {showScore ? (
        <View style={styles.questionContainer}>
          <Text style={styles.optionsStyle}>Your Score: {score}</Text>
          <TouchableOpacity style={styles.resetButton} onPress={handleRestart}>
            <Text style={styles.resetButtonText}>Home</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={[styles.questionText, { fontSize: calculateFontSize(quizData[currentQuestion]?.question) }]}>
          {quizData[currentQuestion]?.question}
        </Text>
      )}

      {!showScore && (
        <View style={styles.optionsContainer}>
          {quizData[currentQuestion]?.options.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleAnswer(item)}
              style={getOptionStyle(item, selectedAnswer, quizData[currentQuestion]?.answer)}
              disabled={answerLocked}
            >
              <View style={styles.optionContent}>
                <Text style={[styles.optionsBox, selectedAnswer === item && { marginRight: 35 }]}>
                  {item}
                </Text>
                {renderAnswerIcon(item, selectedAnswer, quizData[currentQuestion]?.answer)}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {!showScore && (
        <TouchableOpacity style={styles.nextButton} onPress={movNextQuestion}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#24496b',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: '10%',
    height: '100%',
    width: '100%',
  },
  questionContainer: {
    backgroundColor: '#24496b',
    padding: '5%',
    marginVertical: '5%',
    borderRadius: 20,
    width: '90%',
    minHeight: '20%',
  },
  optionsStyle: {
    color: 'white',
    textAlign: 'center',
    fontSize: 24,
  },
  optionsContainer: {
    marginVertical: '5%',
    width: '90%',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
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
    backgroundColor: '#446d92',
    borderRadius: 20,
    padding: 5,
    marginVertical: 10,
    width: '100%',
  },
  incorrectOption: {
    borderWidth: 3,
    borderColor: '#FF6F6F',
    backgroundColor: '#446d92',
    borderRadius: 20,
    padding: 5,
    marginVertical: 10,
    width: '100%',
  },
  optionButton: {
    backgroundColor: '#446d92',
    borderRadius: 20,
    padding: 5,
    marginVertical: 10,
    textAlign: 'center',
  },
  questionText: {
    fontSize: 36,
    textAlign: 'center',
    color: 'white',
  },
  nextButton: {
    backgroundColor: '#98b1c8',
    padding: 15,
    borderRadius: 10,
    width: '90%',
    alignItems: 'center',
    marginVertical: '5%',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 20,
  },
  resetButton: {
    backgroundColor: '#98b1c8',
    padding: 15,
    borderRadius: 10,
    width: '90%',
    alignItems: 'center',
    marginVertical: '5%',
    alignSelf: 'center',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 20,
  },
  progressBarContainer: {
    position: 'absolute',
    top: 100,
    width: '90%',
    height: 30,
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
    height: 5,
    backgroundColor: 'white',
    borderRadius: 2,
    transform: [{ translateY: -2 }],
  },
  planeIcon: {
    position: 'absolute',
    color: "#FFD700",
    top: 0,
  },
});

export default Quiz;
