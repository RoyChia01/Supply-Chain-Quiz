import { Alert } from 'react-native';

const BASE_URL = 'http://10.132.0.75:8080'

//Fetch all the topics from the back end
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

//Fetch the questions for the selected topic
export const fetchQuestions = async (topicUID) => {
  try {
    const response = await fetch(`${BASE_URL}/quiz/topic/${topicUID}/qna`);
    const data = await response.json();
    //console.log("Fetched Questions:", data);
    return { questions: data, loading: false };
  } catch (error) {
    console.error("Error fetching Questions:", error);
    return { questions: [], loading: false };
  }
};

//Get the user info from the back end
export const getUserInfo = async (userEmail) => {
  try {
    const response = await fetch(`${BASE_URL}/user?email=${userEmail}`);
    //const response = await fetch(`http://10.132.0.74:5500/QuizApp/testing/data.json`); //Local Testing
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

//Post the quiz results to the back end
export const postQuizResults = async (UserdocumentID, topicID, result) => {
  console.log("UserdocumentID:", UserdocumentID, "TopicID:", topicID, "Result:", result);

  try {
    const response = await fetch(`${BASE_URL}/user/quiz-result/${UserdocumentID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        score: result.toString(),   // Ensures result is a string
        topicId: topicID.toString(), // Ensures topicID is a string
      }),
    });

    // Check if the response is successful (status code 200-299)
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    // Attempt to parse the response JSON if the response is successful
    const data = await response.json();

    // Optionally, check the structure of the returned data (e.g., if `data.success` exists)
    console.log('Quiz result posted successfully:', data);
    return { success: true, data };
    
  } catch (error) {
    console.error('Error posting quiz results:', error.message);
    Alert.alert('Error', 'Failed to post quiz results: ' + error.message);
    return { success: false, error: error.message }; // Return the error message to provide more context
  }
};


//Get all the users title and score from back end to display in leaderboard
export const fetchLeaderboard = async () => {
  try {
    const response = await fetch(`${BASE_URL}/leaderboard`);
    const data = await response.json();
    console.log("Fetched Topics:", data);
    return { topics: data, loading: false };
  } catch (error) {
    console.error("Error fetching topics:", error);
    return { topics: [], loading: false };
  }
};

// export const VerifyUserInfo = async (userEmail,password) => {
//   try {
//     const response = await fetch(`${BASE_URL}/user/auth${}`);
//     const data = await response.json();
//     console.log("Fetched User Info:", data);

//     if (response.ok) {
//       return data;
//     } else {
//       throw new Error(data.message || 'Failed to fetch user info');
//     }
//   } catch (error) {
//     console.error('Error fetching user info:', error);
//     return null;
//   }
// };