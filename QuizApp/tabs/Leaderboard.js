import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, FlatList, ActivityIndicator } from 'react-native';
import { fetchLeaderboard } from './apiHandler';

const InitialiseLeaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Function to fetch leaderboard data
  const getLeaderboardData = async () => {
    try {
      const { itemList } = await fetchLeaderboard();
      if (!itemList || !Array.isArray(itemList)) throw new Error('Invalid data format');

      const sortedData = itemList
        .map(({ name, rank, totalScore }) => ({
          id: name, // Using name as ID (assuming unique)
          name,
          rank,
          score: parseInt(totalScore, 10), // Ensure score is a number
        }))
        .sort((a, b) => b.score - a.score); // Sort by score in descending order

      setLeaderboardData(sortedData);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch leaderboard data on mount
    getLeaderboardData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await getLeaderboardData(); // Re-fetch the leaderboard data
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

  // Split data for top 3 and remaining leaderboard
  const topThree = leaderboardData.slice(0, 3);
  const remainingLeaderboard = leaderboardData.slice(3);

  return (
    <View style={styles.container}>
      {/* Top 3 Players */}
      <View style={styles.topContainer}>
        {topThree.length === 3 &&
          [topThree[1], topThree[0], topThree[2]].map((player, index) => (
            <View key={player.id} style={[styles.section, index === 1 ? styles.mainSection : styles.sideSection]}>
              <Image source={require('../images/soldier.png')} style={styles.icon} />
              <Text style={[styles.title, { fontSize: getFontSize(player.name) }]}>{player.name}</Text>
              <Text style={styles.subtitle}>{player.rank}</Text>
              <Text style={[styles.text, styles.number]}>
                {index === 0 ? 2 : index === 1 ? 1 : 3}
                <Text style={styles.suffix}>{getRankSuffix(index === 0 ? 2 : index === 1 ? 1 : 3)}</Text>
              </Text>
              <Text style={styles.score}>Score: {player.score}</Text>
            </View>
          ))}
      </View>

      {/* Remaining Leaderboard */}
      <View style={styles.bottomContainer}>
        <FlatList
          data={remainingLeaderboard}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <View style={styles.row}>
              <Text style={styles.rank}>{index + 4}</Text>
              <View style={styles.nameContainer}>
                <Text style={[styles.name, { fontSize: getFontSize(item.name) }]}>{item.name}</Text>
                <Text style={styles.subtitle}>{item.rank}</Text>
              </View>
              <Text style={styles.score}> {item.score}</Text>
            </View>
          )}
          refreshing={refreshing} // Pull-to-refresh indicator
          onRefresh={handleRefresh} // Refresh logic
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
