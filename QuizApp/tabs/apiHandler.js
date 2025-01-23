import { useEffect, useState } from 'react';

const fetchTopics = (url) => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getTopics = async () => {
      try {
        const response = await fetch(url);
        const data = await response.json();
        setTopics(data);
        console.log("Fetched Topics:", data);
      } catch (error) {
        console.error("Error fetching topics:", error);
      } finally {
        setLoading(false);
      }
    };

    getTopics();
  }, [url]);

  return { topics, loading };
};

export default fetchTopics;
