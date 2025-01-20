import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Dimensions, Image } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const Quiz = ({ onRestart }) => {
  // State hooks for tracking current question, score, and other quiz states
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answerLocked, setAnswerLocked] = useState(false);
  const { width, height } = Dimensions.get('window');

  // Quiz data containing questions, options, and correct answers
  const quizData = [
    {
      question: 'What is the first action to take in case of a live-fire accident?',
      options: ['Secure your weapon', 'Check for casualties and call for help', 'Continue firing', 'Ignore the incident'],
      answer: 'Check for casualties and call for help',
    },
    {
      question: 'How should you handle a misfire during a live-fire exercise?',
      options: ['Immediately inspect the barrel', 'Keep the weapon pointed downrange and wait before clearing', 'Look inside the barrel to check', 'Ignore it and keep firing'],
      answer: 'Keep the weapon pointed downrange and wait before clearing',
    },
    {
      question: 'What is the correct response if you see someone collapse due to heat exhaustion?',
      options: ['Pour cold water on them immediately', 'Move them to shade, provide water, and call for medical help', 'Ignore and continue the activity', 'Force them to continue training'],
      answer: 'Move them to shade, provide water, and call for medical help',
    },
    {
      question: 'What safety gear is essential when handling explosives?',
      options: ['Ear protection and gloves', 'Helmet and body armor', 'All of the above', 'No safety gear needed'],
      answer: 'All of the above',
    },
    {
      question: 'During a night patrol, how should you use a flashlight to maintain stealth?',
      options: ['Shine it directly ahead at full brightness', 'Use a red filter and keep it low', 'Flash it frequently to scare enemies', 'Never use it under any circumstances'],
      answer: 'Use a red filter and keep it low',
    },
  ];

  // Function to determine the rank based on score
  const getRank = (score) => (score === quizData.length ? 'Elite Pilot' : score >= quizData.length - 2 ? 'Veteran Pilot' : score >= quizData.length - 4 ? 'Cadet' : 'Recruit');

  // Function to handle answer selection and scoring
  const handleAnswer = (answer) => {
    if (answer === quizData[currentQuestion]?.answer) setScore((prev) => prev + 1);
    setSelectedAnswer(answer);
    setAnswerLocked(true);
  };

  // Function to reset the quiz and start over
  const handleRestart = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowScore(false);
    setAnswerLocked(false);
    setSelectedAnswer(null);
    onRestart?.();
  };

  // Function to move to the next question or show score
  const moveNextQuestion = () => {
    if (currentQuestion + 1 < quizData.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setAnswerLocked(false);
    } else setShowScore(true);
  };

  // Auto-move to the next question after 2 seconds when an answer is selected
  useEffect(() => {
    if (answerLocked) {
      const timeout = setTimeout(() => {
        moveNextQuestion();
      }, 1000); // 1 seconds delay before moving to the next question
      return () => clearTimeout(timeout); // Clean up the timeout on unmount or change
    }
  }, [answerLocked, currentQuestion]);

  // Function to decide whether to show the progress bar
  const shouldShowProgressBar = () => {
    return !showScore; // Only show progress bar if the score screen is not displayed
  };

  return (
    <View style={styles.container}>
      {shouldShowProgressBar() && (
        <ProgressBar currentQuestion={currentQuestion} totalQuestions={quizData.length} />
      )}

      {showScore ? (
        <View style={styles.scoreContainer}>
          <Text style={styles.rankText}>Rank: {getRank(score)}</Text>
          {/* Update avatar path here */}
          <Image source={require('../images/soldier.png')} style={styles.avatar} />
          <Text style={styles.scoreText}>Score: {score} / {quizData.length}</Text>
          <TouchableOpacity style={styles.resetButton} onPress={handleRestart}>
            <Text style={styles.resetButtonText}>Home</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text style={[styles.questionText, { fontSize: 40 }]}>{quizData[currentQuestion]?.question}</Text>
          <View style={styles.optionsContainer}>
            {quizData[currentQuestion]?.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleAnswer(option)}
                style={[styles.optionButton, selectedAnswer === option ? (option === quizData[currentQuestion]?.answer ? styles.correctOption : styles.incorrectOption) : null]}
                disabled={answerLocked}
              >
                <Text style={[styles.optionsBox, selectedAnswer === option && { marginRight: 35 }]}>{option}</Text>
                {selectedAnswer === option && (
                  <Icon name={option === quizData[currentQuestion]?.answer ? 'check-circle' : 'times-circle'} size={30} color={option === quizData[currentQuestion]?.answer ? '#90EE90' : '#FF6F6F'} style={styles.icon} />
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1e3c62', alignItems: 'center', justifyContent: 'center', paddingTop: '10%', width: '100%' },
  questionText: { fontSize: 36, textAlign: 'center', color: 'white', fontWeight: 'bold', fontFamily: 'Roboto' },
  optionButton: { backgroundColor: '#5b7c99', borderRadius: 20, padding: 5, marginVertical: 10, width: '100%' },
  optionsContainer: { marginVertical: '5%', width: '90%' },
  optionsBox: { color: 'white', padding: 5, marginVertical: 10, textAlign: 'center', fontSize: 18, borderRadius: 20, width: '90%' },
  correctOption: { borderWidth: 3, borderColor: '#90EE90', backgroundColor: '#5b7c99', borderRadius: 20, padding: 5 },
  incorrectOption: { borderWidth: 3, borderColor: '#FF6F6F', backgroundColor: '#5b7c99', borderRadius: 20, padding: 5 },
  resetButton: { backgroundColor: '#e0a100', padding: 15, borderRadius: 10, width: '90%', alignItems: 'center', marginVertical: '5%' },
  resetButtonText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  scoreContainer: { backgroundColor: '#3a506b', padding: 40, borderRadius: 20, alignItems: 'center', width: '90%' },
  rankText: { color: '#FFD700', fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  avatar: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#ccc', marginBottom: 20 },
  scoreText: { fontSize: 28, color: 'white', fontWeight: 'bold', marginBottom: 20 },
  icon: { right: 0 },
  progressBarContainer: { position: 'absolute', top: 110, width: '90%', height: 60, backgroundColor: '#071f35', borderRadius: 10, overflow: 'hidden' },
  progressBar: { position: 'relative', width: '100%', height: '100%', flexDirection: 'row', alignItems: 'center' },
  dash: { position: 'absolute', top: '50%', width: 10, height: 6, backgroundColor: 'white', borderRadius: 2, transform: [{ translateY: -2}, { translateX: 7 }] },
  planeIcon: { position: 'absolute', color: "#FFD700", top: 0 },
});

export default Quiz;
