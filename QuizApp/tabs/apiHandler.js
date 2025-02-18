import { Alert } from 'react-native';

const BASE_URL = 'http://10.132.0.57:8080';

// Fetch all the topics from the backend
export const fetchTopics = async () => {
  try {
    const response = await fetch(`${BASE_URL}/quiz/topic`);
    const data = await response.json();
    console.log("Fetched Topics:", data);
    return { topics: data, loading: false };
  } catch (error) {
    console.error("Error fetching topics:", error);
    return { topics: [], loading: false };
  }
};

// Fetch the questions for the selected topic
export const fetchQuestions = async (topicUID) => {
  try {
    const response = await fetch(`${BASE_URL}/quiz/topic/${topicUID}/qna`);
    const data = await response.json();
    return { questions: data, loading: false };
  } catch (error) {
    console.error("Error fetching questions:", error);
    return { questions: [], loading: false };
  }
};

// Get the user info from the backend
export const getUserInfo = async (userEmail) => {
  try {
    const response = await fetch(`${BASE_URL}/user?email=${userEmail}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch user info');
    }

    console.log("Fetched User Info:", data);
    return data;
  } catch (error) {
    console.error('Error fetching user info:', error);
    return null;
  }
};

// Post the quiz results to the backend
export const postQuizResults = async (UserdocumentID, topicID, result) => {
  console.log("UserdocumentID:", UserdocumentID, "TopicID:", topicID, "Result:", result);

  try {
    const response = await fetch(`${BASE_URL}/user/quiz-result/${UserdocumentID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        score: result.toString(),
        topicId: topicID.toString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log('Quiz result posted successfully:', data);
    return { success: true, data };

  } catch (error) {
    console.error('Error posting quiz results:', error.message);
    Alert.alert('Error', 'Failed to post quiz results: ' + error.message);
    return { success: false, error: error.message };
  }
};

// Get all the users' title and score from the backend to display in the leaderboard
export const fetchLeaderboard = async () => {
  try {
    const response = await fetch(`${BASE_URL}/leaderboard`);
    const data = await response.json();
    console.log("Fetched Leaderboard:", data);
    return data;
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return { itemList: [] };  // Ensure itemList is always an array
  }
};

// Update selected title for the user
export const updateSelectedTitle = async (UserdocumentID, title) => {
  console.log("UserdocumentID:", UserdocumentID, "Title:", title);

  try {
    const response = await fetch(`${BASE_URL}/user/title/${UserdocumentID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: title.toString() }),
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log('Title updated successfully:', data);
    return { success: true, data };

  } catch (error) {
    console.error('Error updating title:', error.message);
    Alert.alert('Error', 'Failed to update title: ' + error.message);
    return { success: false, error: error.message };
  }
};
