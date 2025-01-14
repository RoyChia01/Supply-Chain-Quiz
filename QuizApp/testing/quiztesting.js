import React, { Component } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

class Quiz extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentQuestion: 0,
      score: 0,
      showScore: false,
      selectedAnswer: null,
      answerLocked: false,
    };
  }

  quizData = [
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

  handleAnswer = (selectedAnswer) => {
    const correctAnswer = this.quizData[this.state.currentQuestion]?.answer;
    this.setState({ selectedAnswer });
    if (correctAnswer === selectedAnswer) {
      this.setState((prevState) => ({
        score: prevState.score + 1,
      }));
    }
    this.setState({ answerLocked: true });
  };

  handleRestart = () => {
    this.setState({
      currentQuestion: 0,
      score: 0,
      showScore: false,
      answerLocked: false,
      selectedAnswer: null,
    });
    if (this.props.onRestart) {
      this.props.onRestart();
    }
  };

  movNextQuestion = () => {
    const nextQuestion = this.state.currentQuestion + 1;
    if (nextQuestion < this.quizData.length) {
      this.setState({
        currentQuestion: nextQuestion,
        selectedAnswer: null,
        answerLocked: false,
      });
    } else {
      this.setState({ showScore: true });
    }
  };

  calculateFontSize = (text) => {
    const maxLength = 40;
    return text.length > maxLength ? 24 : 48;
  };

  getOptionStyle = (option, selectedAnswer, correctAnswer) => {
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

  renderAnswerIcon = (option, selectedAnswer, correctAnswer) => {
    if (selectedAnswer === option) {
      return option === correctAnswer ? (
        <Icon name="check-circle" size={30} color="#90EE90" style={styles.icon} />
      ) : (
        <Icon name="times-circle" size={30} color="#FF6F6F" style={styles.icon} />
      );
    }
    return null;
  };

  render() {
    const { currentQuestion, score, showScore, selectedAnswer } = this.state;
    const correctAnswer = this.quizData[currentQuestion]?.answer;

    return (
      <View style={styles.container}>
        <ProgressBar
          currentQuestion={currentQuestion}
          totalQuestions={this.quizData.length}
          showScore={showScore}
        />
        {showScore ? (
          <View style={styles.questionContainer}>
            <Text style={styles.optionsStyle}>Your Score: {score}</Text>
            <TouchableOpacity style={styles.resetButton} onPress={this.handleRestart}>
              <Text style={styles.resetButtonText}>Home</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text
            style={[styles.questionText, { fontSize: this.calculateFontSize(this.quizData[currentQuestion]?.question) }]}
          >
            {this.quizData[currentQuestion]?.question}
          </Text>
        )}

        {!showScore && (
          <View style={styles.optionsContainer}>
            {this.quizData[currentQuestion]?.options.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => this.handleAnswer(item)}
                style={this.getOptionStyle(item, selectedAnswer, correctAnswer)}
                disabled={this.state.answerLocked}
              >
                <View style={styles.optionContent}>
                  <Text style={[styles.optionsBox, selectedAnswer === item && { marginRight: 35 }]}>
                    {item}
                  </Text>
                  {this.renderAnswerIcon(item, selectedAnswer, correctAnswer)}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {!showScore && (
          <TouchableOpacity style={styles.nextButton} onPress={this.movNextQuestion}>
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }
}

const ProgressBar = ({ currentQuestion, totalQuestions, showScore }) => {
  const progress = showScore ? 100 : (currentQuestion / totalQuestions) * 100;
  return (
    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBar, { width: `${progress}%` }]} />
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
    marginTop: 20,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#a0d9ef',
    borderRadius: 10,
  },
  icon: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: [{ translateY: -15 }],
  },
});

export default Quiz;
