import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, FlatList, ActivityIndicator, Dimensions, PixelRatio, SafeAreaView } from 'react-native';
import { fetchLeaderboard } from './apiHandler';
import { LogBox } from 'react-native';
import Colors from '../constants/Colors';

LogBox.ignoreAllLogs(); // Ignore all log notifications

const { width, height } = Dimensions.get('window');
const scaleSize = (size) => size * (width / 375); // Base size scaling
const scaleFont = (size) => {
  const baseScale = 375;  // base screen width
  return size * (width / baseScale);
};

const images = {
  SCEngineer: require('../images/AvatarProgression/Engineer.jpg'),
  TeamIC: require('../images/AvatarProgression/TeamIC.jpg'),
  FlightLead: require('../images/AvatarProgression/FlightLead.jpg'),
  OC: require('../images/AvatarProgression/OC.jpg'),
  CO: require('../images/AvatarProgression/CO.jpg'),
  Commander: require('../images/AvatarProgression/Commander.jpg'),
  default: require('../images/AvatarProgression/Trainee.jpg'), // Default image in case no rank matches
};

const InitialiseLeaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0); // Track number of retries

  const getLeaderboardData = async () => {
    try {
      const leaderboard = await fetchLeaderboard();
      if (!Array.isArray(leaderboard)) throw new Error('Invalid leaderboard format');

      const sortedData = leaderboard.map(({ user, positionIndex }) => ({
        id: user?.name || positionIndex.toString(),
        name: user?.name || "Unknown",
        rank: user?.rank?.selectedTitle || "N/A",
        totalScore: user?.totalScore || 0,
        position: positionIndex,
      }));

      setLeaderboardData(sortedData);
      setError(null); // Reset error state on successful fetch
      setRetryCount(0); // Reset retry count after success
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
      setError('Failed to load leaderboard data. Retrying...');
      
      // Retry mechanism if loading fails
      if (retryCount < 3) {
        setRetryCount(retryCount + 1);
        setTimeout(() => getLeaderboardData(), 2000); // Retry after 2 seconds
      } else {
        setError('Failed to load leaderboard data after multiple attempts.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getLeaderboardData();
  }, []); // Initial fetch on mount

  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);
    await getLeaderboardData();
    setRefreshing(false);
  };

  const getRankSuffix = (rank) => {
    if (rank === 1) return 'st';
    if (rank === 2) return 'nd';
    if (rank === 3) return 'rd';
    return 'th';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={styles.loadingText}>Loading Leaderboard...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorMessage}>{error}</Text>
      </SafeAreaView>
    );
  }

  const topThree = leaderboardData.slice(0, 3);
  const remainingLeaderboard = leaderboardData.slice(3);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topContainer}>
        {topThree.length === 3 &&
          [topThree[1], topThree[0], topThree[2]].map((player, index) => (
            <View key={player.position} style={[styles.section, index === 1 ? styles.mainSection : styles.sideSection]}>
              <Image source={images[player.rank] || images.default} style={styles.image} />
              <Text style={[styles.title, { fontSize: scaleFont(10) }]}>{player.name}</Text>
              <Text style={styles.subtitle}>{player.rank}</Text>
              <Text style={[styles.text, styles.number]}>
                {index === 0 ? 2 : index === 1 ? 1 : 3}
                <Text style={styles.suffix}>{getRankSuffix(index === 0 ? 2 : index === 1 ? 1 : 3)}</Text>
              </Text>
              <Text style={styles.score}>Score: {player.totalScore}</Text>
            </View>
          ))}
      </View>

      <View style={styles.bottomContainer}>
        <FlatList
          data={remainingLeaderboard}
          keyExtractor={(item) => item.position.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.row}>
              <Text style={styles.rank}>{index + 4}</Text>
              <View style={styles.nameContainer}>
                <Text style={[styles.name, { fontSize: scaleFont(18) }]}>{item.name}</Text>
                <Text style={styles.subtitle}>{item.rank}</Text>
              </View>
              <Text style={styles.score}>{item.totalScore}</Text>
            </View>
          )}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          contentContainerStyle={{ paddingBottom: scaleSize(50) }} // Adds bottom padding
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.mainBackgroundColor,
  },
  loadingText: { color: 'white', fontSize: scaleFont(20), marginTop: 10 },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.mainBackgroundColor,
  },
  errorMessage: {
    color: 'white',
    fontSize: scaleFont(18),
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: scaleSize(20),
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
    paddingTop: scaleSize(10),
    height: '100%',
    borderBottomWidth: scaleSize(4),
    borderColor: Colors.gold,
  },
  mainSection: {backgroundColor:Colors.backgroundColor, },
  sideSection: {
    flex: 0.8,
    paddingTop: scaleSize(60),
    backgroundColor:Colors.mainBackgroundColor,
    marginBottom: scaleSize(20),
  },
  icon: { width: scaleSize(100), height: scaleSize(100) },
  bottomContainer: {
    flex: 6,
    backgroundColor: "#0A1F33",
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: scaleSize(20),
  },
  row: {
    flexDirection: 'row',
    width: '95%',
    marginLeft: '2.5%',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: scaleSize(15),
    backgroundColor:Colors.mainBackgroundColor,
    marginBottom: scaleSize(10),
    borderRadius: scaleSize(10),
  },
  rank: {
    color: Colors.gold,
    fontSize: scaleFont(25),
    fontWeight: 'bold',
    width: scaleSize(40),
    textAlign: 'center',
  },
  image: {
    width: scaleSize(90), 
    height: scaleSize(90), 
    borderRadius: scaleSize(50), 
    marginBottom: scaleSize(10), 
    borderWidth: scaleSize(2), 
    borderColor: Colors.gold, 
    resizeMode: 'cover', 
  },
  nameContainer: { flex: 1, paddingLeft: scaleSize(15) },
  name: { color: 'white', textAlign: 'left' },
  subtitle: { color: Colors.gold, fontSize: scaleFont(16), textAlign: 'left' },
  score: { color: Colors.gold, fontSize: scaleFont(20), fontWeight: 'bold', textAlign: 'right' },
  text: { color: 'white', fontSize: scaleFont(50), fontWeight: 'bold' },
  number: { fontSize: scaleFont(30), color: Colors.gold },
  title: { color: 'white', fontWeight: 'normal' },
  suffix: { fontSize: scaleFont(20), color: Colors.gold },
});

export default InitialiseLeaderboard;
