import { useEffect, useState } from 'react';

const BASE_URL = 'http://10.132.0.47:8080/quiz/topic'

export const fetchTopics = async () => {
  try {
    const response = await fetch(BASE_URL);
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
    const response = await fetch(`${BASE_URL}/${topicUID}/qna`);
    const data = await response.json();
    //console.log("Fetched Questions:", data);
    return { questions: data, loading: false };
  } catch (error) {
    console.error("Error fetching Questions:", error);
    return { questions: [], loading: false };
  }
};

