import { Alert } from 'react-native';

const BASE_URL = 'http://10.132.0.71:8080';

// Fetch all the topics from the backend
export const fetchTopics = async () => {
  try {
    const response = await fetch(`${BASE_URL}/quiz/topic`);
    const data = await response.json();

    console.log(data);
    return data;
  } catch (error) {
    console.error('Error fetching topics:', error);
  }
};


// Fetch the questions for the selected topic
export const fetchQuestions = async (topicUID) => {
  try {
    const response = await fetch(`${BASE_URL}/quiz/${topicUID}/qna`);
    const data = await response.json();

    // Map the response data to match the required structure
    const questionsData = data.qnaList.map(({ question, optionList, answer }) => ({
      question,
      options: optionList,
      answer,
    }));

    return { questionsData, loading: false };
  } catch (error) {
    console.error("Error fetching questions:", error);
    return { questionsData: [], loading: false };
  }
};



// Get the user info from the backend
export const getUserInfo = async (userEmail) => {
  console.log("📢 Fetching User Info for:", userEmail);

  if (!userEmail) {
    console.error("❌ Email is required");
    return null;
  }

  try {
    const response = await fetch(`${BASE_URL}/user?email=${userEmail}`);

    if (!response.ok) {
      const errorMessage = await response.text();
      console.error("❌ Error:", errorMessage);
      throw new Error(errorMessage || "Failed to fetch user info");
    }

    const data = await response.json(); // Parse response as JSON

    if (!data) {
      console.error("❌ Empty response received.");
      return null;
    }

    // Restructuring response to match the desired format
    return {
      name: data.name,
      email: data.email,
      pointBalance: data.pointBalance,
      school: data.school,
      avatarBlob: data.avatarBlob,
      rank: {
        title: data.rank?.title,
        specialTitle: data.rank?.specialTitle || [],
        selectedTitle: data.rank?.selectedTitle
      },
      progress: {
        currentTopic: {
          index: data.progress?.currentTopic?.index || 0,
          name: data.progress?.currentTopic?.name || "Unknown"
        },
        latestTopic: {
          index: data.progress?.latestTopic?.index || 0,
          name: data.progress?.latestTopic?.name || "Unknown"
        }
      }
    };

  } catch (error) {
    console.error("❌ Error fetching user info:", error);
    return null;
  }
};

// Post the user data to the backend
export const postUser = async (username,email) => {
  try {
    const response = await fetch(`${BASE_URL}/user/create`, {
      method: 'POST', // Specify that it's a POST request
      headers: {
        'Content-Type': 'application/json' // Set the content type to JSON
      },
      body: JSON.stringify({
        name: username,  // Replace with your actual data
        email: email
      }) // Include the body data
    });

    const data = await response.json();

    console.log(data);
    return data;
  } catch (error) {
    console.error('Error posting user:', error);
  }
};

// Post the quiz results to the backend
export const postQuizResults = async (UserdocumentID, quizID, result) => {
  console.log("UserdocumentID:", UserdocumentID, "TopicID:", topicID, "Result:", result);
  try {
    const response = await fetch(`${BASE_URL}/user/quiz-result/${UserdocumentID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        score: result.toString(),
        quizID: quizID.toString(),
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
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch leaderboard');
    }

    console.log("Fetched Leaderboard Data:", data);
    return data;
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return null;
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
