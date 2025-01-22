export const fetchQuizQuestions = async (topicId) => {
    try {
      const response = await fetch("http://10.132.0.61:5500/QuizApp/testing/data.json");
      const data = await response.json();
  
      if (data.quizData) {
        // Filter the questions based on the topicId
        const filteredQuestions = data.quizData
          .filter((item) => item.topicId === topicId) // Filter by topicId
          .map(({ question, options, answer }) => ({
            question,
            options,
            answer,
          }));
  
        // Return the filtered questions
        return filteredQuestions;
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      throw new Error("Failed to fetch quiz questions");
    }
  };
  