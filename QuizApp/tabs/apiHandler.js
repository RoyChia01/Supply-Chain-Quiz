//This file handles all the request to the backend server and returns the response
//The server is hosted on a local machine and the IP address is used to connect to the server
const BASE_URL = `http://192.168.50.26:8080`; // Replace with your server IP address
// Fetch all the topics from the backend
export const fetchTopics = async () => {
  try {
    const response = await fetch(`${BASE_URL}/quiz/topic`);
    const data = await response.json();

    console.log(data);
    return data;
  } catch (error) {
    //console.error('Error fetching topics:', error);
  }
};

// Fetch the questions for the selected topic
export const fetchQuestions = async (topicUID) => {
  try {
    const response = await fetch(`${BASE_URL}/quiz/${topicUID}/qna`);
    const data = await response.json();

    // Map the response data to match the required structure
    const questionsData = data.qnaList.map(({ question, optionList, answer }) => {
      // Create a new options array that includes the answer if it's not already in the list
      const options = optionList.includes(answer) 
        ? optionList 
        : [...optionList, answer];
        
      return {
        question,
        options,
        answer,
      };
    });

    return { questionsData, loading: false };
  } catch (error) {
    //console.error("Error fetching questions:", error);
    return { questionsData: [], loading: false };
  }
};

// Get the user info from the backend
export const getUserInfo = async (userEmail) => {
  console.log("📢 Fetching User Info for:", userEmail);

  if (!userEmail) {
    //console.error("❌ Email is required");
    return null;
  }

  try {
    const response = await fetch(`${BASE_URL}/user?email=${userEmail}`);

    if (!response.ok) {
      const errorMessage = await response.text();
      //console.error("❌ Error:", errorMessage);
      throw new Error(errorMessage || "Failed to fetch user info");
    }

    const data = await response.json(); // Parse response as JSON

    if (!data) {
      //console.error("❌ Empty response received.");
      return null;
    }

    // Restructuring response to match the desired format
    return {
      id: data.id,
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
      },
      canBeTargeted: data.canBeTargeted,
      scoreMultiplier: data.scoreMultiplier,
    };

  } catch (error) {
    //console.error("❌ Error fetching user info:", error);
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
    //console.error('Error posting user:', error);
  }
};

// Post the quiz results to the backend
export const postQuizResults = async (UserdocumentID, quizID, result,gameScore) => {
  console.log("UserdocumentID:", UserdocumentID, "TopicID:", quizID, "Result:", result);
  try {
    const response = await fetch(`${BASE_URL}/user/${UserdocumentID}/quiz-result`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        score: result.toString(),
        quizId: quizID.toString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log('Quiz result posted successfully:', data);
    return { success: true, data };

  } catch (error) {
    //onsole.error('Error posting quiz results:', error.message);
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
    //console.error('Error fetching leaderboard:', error);
    return null;
  }
};

// Update selected title for the user
export const updateSelectedTitle = async (UserdocumentID, title) => {
  console.log("UserdocumentID:", UserdocumentID, "Title:", title);

  try {
    const response = await fetch(`${BASE_URL}/user/${UserdocumentID}/title?selectedTitle=${title}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log('Title updated successfully:', data);
    return { success: true, data };

  } catch (error) {
    //console.error('Error updating title:', error.message);
    //Alert.alert('Error', 'Failed to update title: ' + error.message);
    return { success: false, error: error.message };
  }
};

export const getUserTitle = async (userEmail) => {
  console.log("📢 Fetching User Info for:", userEmail);

  if (!userEmail) {
    return null;
  }

  try {
    const response = await fetch(`${BASE_URL}/user?email=${userEmail}`);

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(errorMessage || "Failed to fetch user info");
    }

    const data = await response.json();

    if (!data) {
      return null;
    }

    // Return only the selectedTitle
    return data.rank?.selectedTitle || null;
  } catch (error) {
    return null;
  }
};

export const getUserPowerups = async (userDocumentID) => {
  console.log("Fetching Power-Ups for User:", userDocumentID);

  try {
    const response = await fetch(`${BASE_URL}/user${userDocumentID}/powerUp`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log('User Power-Ups Retrieved:', data);
    return { success: true, data };

  } catch (error) {
    console.error('Error fetching power-ups:', error.message);
    return { success: false, error: error.message };
  }
};

export const purchasePowerup = async (PurchasedUserInfo,targetUserId, powerUp,pointBalance) => {
  console.log("Purchasing Power-Up:", powerUp, "For User:", targetUserId);
  try {
    const response = await fetch(`${BASE_URL}/user/${PurchasedUserInfo}/powerUp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        powerUp: powerUp, // "Shield", "Sabotage", or "Multiplier"
        targetUserId: targetUserId, // Only required for Sabotage, otherwise null
        pointBalance: pointBalance,

      }),
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log('Power-Up Purchased Successfully:', data);
    return { success: true, data };

  } catch (error) {
    console.error('Error purchasing power-up:', error.message);
    return { success: false, error: error.message };
  }
};

export const resetScoreMultiplier = async (userDocumentID) => {
  console.log("Resetting scoreMultiplier for User:", userDocumentID);

  try {
    const response = await fetch(`${BASE_URL}/user/${userDocumentID}/score-multiplier/reset`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };

  } catch (error) {
    console.error('Error resetting:', error.message);
    return { success: false, error: error.message };
  }
};