import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Image, FlatList, ActivityIndicator, Dimensions, TouchableOpacity, SafeAreaView,Platform } from 'react-native';
import { fetchLeaderboard } from './apiHandler';
import { LogBox } from 'react-native';
import Colors from '../constants/Colors';
import { useFocusEffect } from '@react-navigation/native';

LogBox.ignoreAllLogs(); // Ignore all log notifications

const { width, height } = Dimensions.get('window');
const scaleSize = (size) => size * (width / 375); // Base size scaling
const scaleFont = (size) => {
  const baseScale = 375;  // base screen width
  return size * (width / baseScale);
};

const images = {
  SCEngineer1: require('../images/AvatarProgression/SCEngineer1.jpg'),
  SCEngineer2: require('../images/AvatarProgression/SCEngineer2.jpg'),
  TeamIC1: require('../images/AvatarProgression/TeamIC1.jpg'),
  TeamIC2: require('../images/AvatarProgression/TeamIC2.jpg'),
  FlightLead1: require('../images/AvatarProgression/FlightLead1.jpg'),
  FlightLead2: require('../images/AvatarProgression/FlightLead2.jpg'),
  OC1: require('../images/AvatarProgression/OC1.jpg'),
  OC2: require('../images/AvatarProgression/OC2.jpg'),
  CO1: require('../images/AvatarProgression/CO1.jpg'),
  CO2: require('../images/AvatarProgression/CO2.jpg'),
  Commander1: require('../images/AvatarProgression/Commander1.jpg'),
  Commander2: require('../images/AvatarProgression/Commander2.jpg'),
  Trainee1: require('../images/AvatarProgression/Trainee1.jpg'),
  Trainee2: require('../images/AvatarProgression/Trainee2.jpg'), 
};

// Placeholder component for empty podium positions
const EmptyPodiumPosition = ({ position }) => (
  <View style={[
    styles.section, 
    position === 1 ? styles.mainSection : styles.sideSection,
    styles.emptySection
  ]}>
    <View style={styles.emptyImageContainer}>
      <Text style={styles.emptyImageText}>?</Text>
    </View>
    <Text style={[styles.title, { fontSize: scaleFont(10) }]}>Not Yet Claimed</Text>
    <Text style={styles.emptySubtitle}>Compete to claim this spot!</Text>
    <Text style={[styles.text, styles.number]}>
      {position}<Text style={styles.suffix}>{getRankSuffix(position)}</Text>
    </Text>
  </View>
);

const getRankSuffix = (rank) => {
  if (rank === 1) return 'st';
  if (rank === 2) return 'nd';
  if (rank === 3) return 'rd';
  return 'th';
};

const InitialiseLeaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0); // Track number of retries

  const getLeaderboardData = async () => {
    try {
      setLoading(true);
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
      setRefreshing(false);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    getLeaderboardData();
  }, []);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      getLeaderboardData();
      return () => {}; // cleanup function
    }, [])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);
    await getLeaderboardData();
  };

  if (loading && !refreshing) {
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
        <TouchableOpacity style={styles.retryButton} onPress={getLeaderboardData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Generate top 3 array with real or placeholder podium positions
  const generateTopThree = () => {
    // Create an array with 3 positions
    const topThree = [
      { position: 2, placeholder: true }, // 2nd place (left)
      { position: 1, placeholder: true }, // 1st place (center)
      { position: 3, placeholder: true }  // 3rd place (right)
    ];
    
    // Fill in positions with real data when available
    for (let i = 0; i < Math.min(leaderboardData.length, 3); i++) {
      const realPosition = i + 1;
      const displayIndex = realPosition === 1 ? 1 : realPosition === 2 ? 0 : 2;
      topThree[displayIndex] = { ...leaderboardData[i], position: realPosition, placeholder: false };
    }
    
    return topThree;
  };

  const topThree = generateTopThree();
  const remainingLeaderboard = leaderboardData.length <= 3 ? [] : leaderboardData.slice(3);

  // Render podium position (either real player or placeholder)
  const renderPodiumPosition = (item, index) => {
    if (item.placeholder) {
      return <EmptyPodiumPosition position={item.position} key={`placeholder-${item.position}`} />;
    }
    
    // Get the appropriate image based on rank
    let imageKey = item.rank;
    
    // Default to the "1" suffix version for Commander, Trainee, OC, and CO
    if (['Commander', 'Trainee', 'OC', 'CO','FlightLead','TeamIC','SCEngineer'].includes(item.rank)) {
      imageKey = `${item.rank}1`;
    }
    
    // Remove number suffix for display (e.g., "Commander1" -> "Commander")
    const displayRank = item.rank.replace(/[0-9]+$/, '');
    
    return (
      <View key={item.position} style={[
        styles.section, 
        index === 1 ? styles.mainSection : styles.sideSection
      ]}>
        <Image source={images[imageKey] || images.Trainee1} style={styles.image} />
        <Text style={[styles.title, { fontSize: scaleFont(10) }]}>{item.name}</Text>
        <Text style={styles.subtitle}>{displayRank}</Text>
        <Text style={[styles.text, styles.number]}>
          {item.position}<Text style={styles.suffix}>{getRankSuffix(item.position)}</Text>
        </Text>
        <Text style={styles.score}>Score: {item.totalScore}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topContainer}>
        {topThree.map(renderPodiumPosition)}
      </View>

      <View style={styles.bottomContainer}>
        {remainingLeaderboard.length > 0 ? (
          <FlatList
          data={remainingLeaderboard}
          keyExtractor={(item) => item.position.toString()}
          renderItem={({ item, index }) => {
            // Get the appropriate image based on rank
            let imageKey = item.rank;
            
            // Default to the "1" suffix version for Commander, Trainee, OC, and CO
            if (['Commander', 'Trainee', 'OC', 'CO','FlightLead','TeamIC','SCEngineer'].includes(item.rank)) {
              imageKey = `${item.rank}1`;
            }
            
            // Remove number suffix for display (e.g., "Commander1" -> "Commander")
            const displayRank = item.rank.replace(/[0-9]+$/, '');
            
            return (
              <View style={styles.row}>
                <Text style={styles.rank}>{index + 4}</Text>
                <View style={styles.nameContainer}>
                  <Text style={[styles.name, { fontSize: scaleFont(18) }]}>{item.name}</Text>
                  <Text style={styles.subtitle}>{displayRank}</Text>
                </View>
                <Text style={styles.score}>{item.totalScore}</Text>
              </View>
            );
          }}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          contentContainerStyle={{ paddingBottom: scaleSize(50) }}
          ListEmptyComponent={
            <View style={styles.emptyListContainer}>
              <Text style={styles.emptyText}>No additional competitors yet</Text>
            </View>
          }
        />
        ) : (
          <View style={styles.emptyListContainer}>
            <Text style={styles.emptyText}>
              {leaderboardData.length === 0 
                ? "No competitors yet. Be the first to join!" 
                : "No additional competitors beyond the podium."}
            </Text>
            <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
              <Text style={styles.refreshButtonText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        )}
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
  emptyListContainer: {
    padding: scaleSize(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: 'white',
    fontSize: scaleFont(16),
    textAlign: 'center',
    marginBottom: scaleSize(15),
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
    paddingTop:  Platform.OS === 'ios' ? scaleSize(10) : scaleSize(40), // Slightly taller on Android
    height: '100%',
    borderBottomWidth: scaleSize(4),
    borderColor: Colors.gold,
  },
  mainSection: {backgroundColor: Colors.backgroundColor},
  sideSection: {
    flex: 0.8,
    paddingTop: Platform.OS === 'ios' ? scaleSize(60) : scaleSize(75), // Slightly taller on Android
    backgroundColor: Colors.mainBackgroundColor,
  },
  emptySection: {
    opacity: 0.6,
  },
  emptyImageContainer: {
    width: scaleSize(90),
    height: scaleSize(90),
    borderRadius: scaleSize(50),
    borderWidth: scaleSize(2),
    borderColor: Colors.gold,
    borderStyle: 'dashed',
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: scaleSize(10),
  },
  emptyImageText: {
    fontSize: scaleFont(40),
    color: Colors.gold,
    fontWeight: 'bold',
  },
  emptySubtitle: {
    color: '#AAA',
    fontSize: scaleFont(12),
    textAlign: 'center',
    marginTop: scaleSize(5),
  },
  icon: { width: scaleSize(100), height: scaleSize(100) },
  bottomContainer: {
    flex: 5,
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
    backgroundColor: Colors.mainBackgroundColor,
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
  retryButton: {
    marginTop: scaleSize(15),
    paddingVertical: scaleSize(10),
    paddingHorizontal: scaleSize(20),
    backgroundColor: Colors.gold,
    borderRadius: scaleSize(5),
  },
  retryButtonText: {
    color: Colors.mainBackgroundColor,
    fontSize: scaleFont(16),
    fontWeight: 'bold',
  },
  refreshButton: {
    paddingVertical: scaleSize(8),
    paddingHorizontal: scaleSize(20),
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderWidth: 1,
    borderColor: Colors.gold,
    borderRadius: scaleSize(20),
    marginTop: scaleSize(10),
  },
  refreshButtonText: {
    color: Colors.gold,
    fontSize: scaleFont(14),
  },
});

export default InitialiseLeaderboard;