import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, FlatList, ActivityIndicator } from 'react-native';
import { fetchLeaderboard } from './apiHandler';

const InitialiseLeaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null); // New state to track error

  // Hardcoded leaderboard data (sample data)
  const hardcodedData = [
    { name: 'Player1', rank: 'Gold', totalScore: 1500, position: 1 },
    { name: 'Player2', rank: 'Silver', totalScore: 1400, position: 2 },
    { name: 'Player3', rank: 'Bronze', totalScore: 1300, position: 3 },
    { name: 'Player4', rank: 'Silver', totalScore: 1200, position: 4 },
    { name: 'Player5', rank: 'Bronze', totalScore: 1100, position: 5 },
    { name: 'Player6', rank: 'Silver', totalScore: 1000, position: 6 },
    { name: 'Player7', rank: 'Gold', totalScore: 1900, position: 7 },
    { name: 'Player8', rank: 'Bronze', totalScore: 800, position: 8 },
    { name: 'Player9', rank: 'Silver', totalScore: 700, position: 9 },
    { name: 'Player10', rank: 'Gold', totalScore: 600, position: 10 },
  ];

  // Fetch leaderboard data
  const getLeaderboardData = async () => {
    try {
      const leaderboard = await fetchLeaderboard(); // Assuming fetchLeaderboard() returns the data
      console.log('Leaderboard Raw Response:', leaderboard);
  
      // Ensure the leaderboard is an array
      if (!Array.isArray(leaderboard)) {
        throw new Error('Invalid data format: leaderboard is not an array');
      }
  
      // Process the leaderboard data
      const sortedData = leaderboard.map(({ user, positionIndex }) => {
        if (!user || !user.name) {
          throw new Error('User information is incomplete');
        }
  
        return {
          id: user.name,  // Assuming the user's name is unique as an ID
          name: user.name,
          rank: user.rank?.selectedTitle || "N/A", // Default to "N/A" if rank is missing
          totalScore: user.pointBalance || 0, // Ensure point balance is present, default to 0
          position: positionIndex, // Assuming positionIndex is available in the response
        };
      });
  
      // Update the state with the processed leaderboard data
      setLeaderboardData(sortedData);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
      setError('Failed to load leaderboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getLeaderboardData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null); // Reset the error before refreshing
    await getLeaderboardData();
    setRefreshing(false);
  };

  const getRankSuffix = (rank) => {
    if (rank === 1) return 'st';
    if (rank === 2) return 'nd';
    if (rank === 3) return 'rd';
    return 'th';
  };

  const getFontSize = (name) => (name.length > 10 ? 18 : 25);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={styles.loadingText}>Loading Leaderboard...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorMessage}>{error}</Text>
      </View>
    );
  }

  // Split data for top 3 and remaining leaderboard
  const topThree = leaderboardData.slice(0, 3);
  const remainingLeaderboard = leaderboardData.slice(3);

  return (
    <View style={styles.container}>
      {/* Top 3 Players */}
      <View style={styles.topContainer}>
        {topThree.length === 3 &&
          [topThree[1], topThree[0], topThree[2]].map((player, index) => (
            <View key={player.position} style={[styles.section, index === 1 ? styles.mainSection : styles.sideSection]}>
              <Image source={require('../images/soldier.png')} style={styles.icon} />
              <Text style={[styles.title, { fontSize: getFontSize(player.name) }]}>{player.name}</Text>
              <Text style={styles.subtitle}>{player.rank}</Text>
              <Text style={[styles.text, styles.number]}>
                {index === 0 ? 2 : index === 1 ? 1 : 3}
                <Text style={styles.suffix}>
                  {index === 0 ? 'nd' : index === 1 ? 'st' : 'rd'}
                </Text>
              </Text>
              <Text style={styles.score}>Score: {player.totalScore}</Text>
            </View>
          ))}
      </View>

      {/* Remaining Leaderboard */}
      <View style={styles.bottomContainer}>
        <FlatList
          data={remainingLeaderboard}
          keyExtractor={(item) => item.position.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.row}>
              <Text style={styles.rank}>{index + 4}</Text>
              <View style={styles.nameContainer}>
                <Text style={[styles.name, { fontSize: getFontSize(item.name) }]}>{item.name}</Text>
                <Text style={styles.subtitle}>{item.rank}</Text>
              </View>
              <Text style={styles.score}>{item.totalScore}</Text>
            </View>
          )}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2F4F6D',
  },
  loadingText: { color: 'white', fontSize: 20, marginTop: 10 },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2F4F6D',
  },
  errorMessage: {
    color: 'white',
    fontSize: 20,
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  topContainer: {
    flex: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  section: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 10,
    height: '100%',
    borderBottomWidth: 4,
    borderColor: '#FFD700',
  },
  mainSection: { backgroundColor: '#5B7F94' },
  sideSection: {
    flex: 0.8,
    paddingTop: 60,
    backgroundColor: '#2F4F6D',
  },
  icon: { width: 120, height: 120 },
  bottomContainer: {
    flex: 6,
    backgroundColor: '#2F4F6D',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  row: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#3A5F77',
    marginBottom: 10,
    borderRadius: 10,
  },
  rank: {
    color: '#FFD700',
    fontSize: 25,
    fontWeight: 'bold',
    width: 40,
    textAlign: 'center',
  },
  nameContainer: { flex: 1, paddingLeft: 10 },
  name: { color: 'white', fontSize: 20, textAlign: 'left' },
  subtitle: { color: '#FFD700', fontSize: 16, textAlign: 'left' },
  score: { color: '#FFD700', fontSize: 25, fontWeight: 'bold', textAlign: 'right' },
  text: { color: 'white', fontSize: 80, fontWeight: 'bold' },
  number: { fontSize: 90, color: '#FFD700' },
  title: { color: 'white', fontWeight: 'normal' },
  suffix: { fontSize: 40, color: '#FFD700' },
});

export default InitialiseLeaderboard;
