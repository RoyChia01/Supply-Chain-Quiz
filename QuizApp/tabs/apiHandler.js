const BASE_URL = 'http://10.132.0.47:8080/quiz'

export const fetchTopics = async () => {
  try {
    const response = await fetch(`${BASE_URL}/topic`);
    const data = await response.json();
    console.log("Fetched Topics:", data);
    return { topics: data, loading: false };
  } catch (error) {
    console.error("Error fetching topics:", error);
    return { topics: [], loading: false };
  }
};

export const fetchQuestions = async (topicUID) => {
  try {
    const response = await fetch(`${BASE_URL}/topic/${topicUID}/qna`);
    const data = await response.json();
    //console.log("Fetched Questions:", data);
    return { questions: data, loading: false };
  } catch (error) {
    console.error("Error fetching Questions:", error);
    return { questions: [], loading: false };
  }
};

export const getUserInfo = async (username) => {
  try {
    //const response = await fetch(`${BASE_URL}/${username}`);
    const response = await fetch(`http://10.132.0.74:5500/QuizApp/testing/data.json`);
    const data = await response.json();
    console.log("Fetched User Info:", data);

    if (response.ok) {
      return data;
    } else {
      throw new Error(data.message || 'Failed to fetch user info');
    }
  } catch (error) {
    console.error('Error fetching user info:', error);
    return null;
  }
};
export const postQuizResults = async (user, result) => {
  try {
    const response = await fetch(`${BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user, result }),
    });

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error posting quiz results:', error);
    return { success: false, error };
  }
};
