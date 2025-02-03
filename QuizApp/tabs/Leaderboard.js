import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, FlatList } from 'react-native';

const initialLeaderboardData = [
  { id: '1', name: 'John Doe', title: 'Captain', score: 95 },
  { id: '2', name: 'Jane Smith', title: 'Lieutenant', score: 100 },
  { id: '3', name: 'Michael Brown', title: 'Sergeant', score: 90 },
  { id: '4', name: 'Emily White', title: 'Corporal', score: 85 },
  { id: '5', name: 'Chris Green', title: 'Private', score: 80 },
  { id: '6', name: 'Chris Yellow', title: 'Private', score: 83 },
  
];

const getRankSuffix = (rank) => {
  if (rank === 1) return 'st';
  if (rank === 2) return 'nd';
  if (rank === 3) return 'rd';
  return 'th';
};

const InitialiseLeaderboard = () => {
  const [topThree, setTopThree] = useState([]);
  const [remainingLeaderboard, setRemainingLeaderboard] = useState([]);

  useEffect(() => {
    const sortedData = [...initialLeaderboardData].sort((a, b) => b.score - a.score);
    setTopThree(sortedData.slice(0, 3));
    setRemainingLeaderboard(sortedData.slice(3));
  }, []);

  const getFontSize = (name) => (name.length > 10 ? 18 : 25);

  return (
    <View style={styles.container}>
      <View style={styles.topContainer}>
        {topThree.length === 3 && [topThree[1], topThree[0], topThree[2]].map((player, index) => (
          <View key={player.id} style={[styles.section, index === 1 ? styles.mainSection : styles.sideSection]}>
            <Image source={require('../images/soldier.png')} style={styles.icon} />
            <Text style={[styles.title, { fontSize: getFontSize(player.name) }]}>{player.name}</Text>
            <Text style={styles.subtitle}>{player.title}</Text>
            <Text style={[styles.text, styles.number]}>
              {index === 0 ? 2 : index === 1 ? 1 : 3}
              <Text style={styles.suffix}>{getRankSuffix(index === 0 ? 2 : index === 1 ? 1 : 3)}</Text>
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.bottomContainer}>
        <FlatList
          data={remainingLeaderboard}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <View style={styles.row}>
              <Text style={styles.rank}>{index + 4}</Text>
              <View style={styles.nameContainer}>
                <Text style={[styles.name, { fontSize: getFontSize(item.name) }]}>{item.name}</Text>
                <Text style={styles.subtitle}>{item.title}</Text>
              </View>
              <Text style={styles.score}>{item.score}</Text>
            </View>
          )}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
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
