import React, { useState, useEffect } from 'react';
import { 
  Dimensions, 
  Image, 
  Modal, 
  SafeAreaView, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  FlatList,
  Alert 
} from 'react-native';
import { SharedElement } from 'react-navigation-shared-element';
import Icon, { Icons } from '../components/Icons';
import Colors from '../constants/Colors';
import { LogBox, ActivityIndicator } from 'react-native';
import { fetchLeaderboard, getUserInfo, purchasePowerup } from './apiHandler';
import { useUser } from './userInfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

LogBox.ignoreAllLogs(); // Ignore all log notifications
const { width, height } = Dimensions.get('window');
const scaleSize = (size) => size * (width / 375); // Base size scaling

export default function DetailsScreen({ navigation, route }) {
  const { item } = route.params;
  const [modalVisible, setModalVisible] = useState(false);
  const [sabotageData, setSabotageData] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const { userEmail } = useUser();
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchased, setIsPurchased] = useState(false);
  const [targetedUsers, setTargetedUsers] = useState({});
  const [gambleCount, setGambleCount] = useState(0);
  const MAX_GAMBLE_TRIES = 3;

  // Check if this power-up has been purchased (for self-targeting power-ups)
  useEffect(() => {
    const checkPurchaseStatus = async () => {
      try {
        // For regular power-ups
        if (item.title !== 'Gamble') {
          const purchased = await AsyncStorage.getItem(`purchased_${item.id}`);
          if (purchased === 'true') {
            setIsPurchased(true);
          }
        } 
        // For Gamble, check how many times it has been used
        else {
          const gambleUsed = await AsyncStorage.getItem(`gamble_count_${item.id}`);
          if (gambleUsed) {
            const count = parseInt(gambleUsed, 10);
            setGambleCount(count);
            if (count >= MAX_GAMBLE_TRIES) {
              setIsPurchased(true);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching purchase status:", error);
      }
    };

    checkPurchaseStatus();
  }, [item.id, item.title]);

  // For sabotage power-ups, check which users have already been targeted
  useEffect(() => {
    const fetchTargetedUsers = async () => {
      if (item.title === 'Sabotage') {
        try {
          const targetedUsersJson = await AsyncStorage.getItem(`targeted_users_${item.id}`);
          if (targetedUsersJson) {
            setTargetedUsers(JSON.parse(targetedUsersJson));
          }
        } catch (error) {
          console.error("Error fetching targeted users:", error);
        }
      }
    };

    fetchTargetedUsers();
  }, [item.id, item.title]);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userInfo = await getUserInfo(userEmail);
        if (userInfo && userInfo.id) {
          setUserInfo(userInfo);
        } else {
          Alert.alert('Error', 'User information is unavailable. Please try again later.');
        }
      } catch (error) {
        Alert.alert('Error', 'Unable to fetch user info. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserInfo();
  }, [userEmail]);

  if (isLoading || !userInfo) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD700"/>
      </View>
    );
  }

  const handleBuyPress = async (purchaseType, item, purchasedUserInfo) => {
    console.log("Purchase type:", purchaseType);
    
    if (purchaseType === "View Users") {
      await fetchSabotageData();
    }
    else if (purchaseType === "Self") {
      console.log("Purchase successful!");
      console.log("Item:", item);
      console.log("Selected User:", purchasedUserInfo);
      
      let newPointBalance;
      
      if (item.title === 'Gamble') {
        const possibleOutcomes = [15, 5, 0, -5, -10];
        const randomIndex = Math.floor(Math.random() * possibleOutcomes.length);
        const pointsChange = possibleOutcomes[randomIndex];
        
        // Calculate new balance after deducting price and applying gamble result
        newPointBalance = parseInt(purchasedUserInfo.pointBalance, 10) - parseInt(item.price, 10) + pointsChange;
        
        // Show the gamble result to the user
        let resultMessage = pointsChange > 0 
          ? `You won ${pointsChange} points!` 
          : pointsChange < 0 
            ? `You lost ${Math.abs(pointsChange)} points.` 
            : "No points gained or lost.";
            
        // Update gamble count
        const newGambleCount = gambleCount + 1;
        setGambleCount(newGambleCount);
        
        // Display remaining tries
        const remainingTries = MAX_GAMBLE_TRIES - newGambleCount;
        const triesMessage = remainingTries > 0
          ? `\n\nYou have ${remainingTries} gamble ${remainingTries === 1 ? 'try' : 'tries'} remaining.`
          : "\n\nYou have used all your gamble tries.";
            
        Alert.alert('Gamble Result', 
          `You spent ${item.price} points to gamble.\n${resultMessage}\nNew balance: ${newPointBalance} points${triesMessage}`
        );
        
        // Save gamble count to AsyncStorage
        await AsyncStorage.setItem(`gamble_count_${item.id}`, newGambleCount.toString());
        
        // If reached max tries, set as purchased
        if (newGambleCount >= MAX_GAMBLE_TRIES) {
          setIsPurchased(true);
        }
      } else {
        // For non-gamble items, just deduct the price
        newPointBalance = parseInt(purchasedUserInfo.pointBalance, 10) - parseInt(item.price, 10);
        
        // Store purchase state in AsyncStorage for non-gamble items
        await AsyncStorage.setItem(`purchased_${item.id}`, 'true');
        setIsPurchased(true);
      }
      
      console.log("New Point Balance:", newPointBalance);
      
      try {
        await purchasePowerup(purchasedUserInfo.id, purchasedUserInfo.id, item.title, newPointBalance);
      } catch (error) {
        console.error("Error in purchasePowerup:", error);
        Alert.alert('Error', 'Failed to complete purchase. Please try again.');
        return;
      }
    }
    else if (purchaseType === "Targeted") {
      console.log("Purchase successful!");
      console.log("Item:", item);
      console.log("Target User:", purchasedUserInfo);
      console.log("Purchased User:", userInfo);
      const newPointBalance = parseInt(userInfo.pointBalance, 10) - parseInt(item.price, 10);
      console.log("Point Balance", newPointBalance);
      
      try {
        await purchasePowerup(userInfo.id, purchasedUserInfo.user.id, item.title, newPointBalance);
        
        // Add targeted user to the list of targeted users
        const updatedTargetedUsers = {
          ...targetedUsers,
          [purchasedUserInfo.user.id]: true
        };
        
        // Store targeted users in AsyncStorage
        await AsyncStorage.setItem(
          `targeted_users_${item.id}`, 
          JSON.stringify(updatedTargetedUsers)
        );
        
        setTargetedUsers(updatedTargetedUsers);
        
        Alert.alert('Success', `You have successfully used ${item.title} on ${purchasedUserInfo.user.name}!`);
        setModalVisible(false);
      } catch (error) {
        console.error("Error in purchasePowerup:", error);
        Alert.alert('Error', 'Failed to complete purchase. Please try again.');
      }
    }
  };
  
  const fetchSabotageData = async () => {
    try {
      const responseData = await fetchLeaderboard();
      const sortedData = responseData
        .filter(item => item.user.canBeTargeted === true)
        .sort((a, b) => a.positionIndex - b.positionIndex); 
      setSabotageData(sortedData);
      setModalVisible(true);
    } catch (error) {
      console.error("Error fetching leaderboard data:", error);
      Alert.alert('Error', 'Unable to fetch leaderboard data. Please try again later.');
    }
  };

  // Handle item press
  const handleItemPress = (item) => {
    console.log("Item pressed:", item);
    setSelectedUser(item);
  };
  
  const renderItem = ({ item }) => {
    // Check if this user has already been targeted
    const isTargeted = targetedUsers[item.user.id];
    
    return (
      <TouchableOpacity 
        style={[
          styles.listRow, 
          isTargeted && styles.disabledListRow
        ]} 
        onPress={() => !isTargeted && handleItemPress(item)}
        disabled={isTargeted}
      >
        <View style={styles.leftContainer}>
          <Text style={[styles.listLabel, isTargeted && styles.disabledText]}>
            {item.user.name} {isTargeted ? '(Already targeted)' : ''}
          </Text>
          <Text style={[styles.listSubLabel, isTargeted && styles.disabledText]}>
            {item.user.rank.selectedTitle}
          </Text>
        </View>
        <Text style={[styles.listValue, isTargeted && styles.disabledText]}>
          {item.user.totalScore}
        </Text>
      </TouchableOpacity>
    );
  };

  const doubleCheckTarget = async (purchaseType, item, selectedUser) => {
    // Check if user has already been targeted
    if (targetedUsers[selectedUser.user.id]) {
      Alert.alert('Error', 'You have already targeted this user with this power-up.');
      return;
    }
    
    console.log("selectedUser:", selectedUser);
    const target = await getUserInfo(selectedUser.user.email);
    if (target.canBeTargeted) {
      console.log("Target is available. Proceed with purchase.");
      handleBuyPress(purchaseType, item, selectedUser);
    } else {
      Alert.alert('Error', 'Target is unavailable. Please select another target.');
    }
  };

  // Get button text based on power-up type
  const getButtonText = () => {
    if (item.title === 'Gamble') {
      if (isPurchased) {
        return "No Tries Left";
      } else {
        return `Gamble (${MAX_GAMBLE_TRIES - gambleCount} left)`;
      }
    } else {
      return isPurchased ? "Purchased" : "Buy Now";
    }
  };

  return (
    <>
      <SafeAreaView style={[styles.container, { backgroundColor: item.bgColor }]}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon type={Icons.Ionicons} name="arrow-back" size={32} color={Colors.gold} />
          </TouchableOpacity>
          <View style={styles.topContainer}>
            <View>
              <Text style={styles.smallText}>{item.subtitle}</Text>
              <Text style={styles.bigText}>{item.title}</Text>
            </View>
            <View>
              <Text style={styles.smallText}>Price</Text>
              <Text style={styles.bigText}>{item.price} points</Text>
            </View>
          </View>
          <SharedElement id={`item.${item.id}.image`} style={styles.imageContainer}>
            <Image source={item.image} style={styles.image} resizeMode="center" />
          </SharedElement>
          <View style={styles.bottomContainer}>
            <View style={styles.descriptionContainer}>
              <Text style={{ fontWeight: 'bold', marginBottom: 10, fontSize: 32, color: Colors.gold }}>
                Description
              </Text>
              <Text style={{ fontWeight: 'bold', fontSize: 20, paddingBottom: 20, color: Colors.white}}>
                {item.description}
              </Text>
              
              {/* Display gamble count for Gamble power-up */}
              {item.title === 'Gamble' && (
                <Text style={{ fontSize: 16, color: Colors.gold, marginBottom: 15 }}>
                  You have used {gambleCount} out of {MAX_GAMBLE_TRIES} tries
                </Text>
              )}
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              {item.title === 'Sabotage' ? (
                // Show "View Users" button if item.title is 'Sabotage'
                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: item.bgColor }]}
                  onPress={() => handleBuyPress("View Users", item, userInfo)}
                >
                  <Text style={styles.btnText}>View Users</Text>
                </TouchableOpacity>
              ) : (
                // Show "Buy Now" button for all other items
                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: isPurchased ? 'gray' : item.bgColor }]}
                  onPress={() => handleBuyPress("Self", item, userInfo)}
                  disabled={isPurchased} // Disable button once purchased
                >
                  <Text style={styles.btnText}>{getButtonText()}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </SafeAreaView>

      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.backButtonModal}
              onPress={() => {
                setSelectedUser(null); // Clear the selected user
                setModalVisible(false); // Close the modal
              }}
            >
              <Icon type={Icons.Ionicons} name="arrow-back" size={30} color={Colors.black} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select a Target</Text>
            <FlatList
              data={sabotageData}
              keyExtractor={(item) => item.user.id ? item.user.id.toString() : item.positionIndex.toString()}
              renderItem={renderItem}
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              windowSize={5}
            />

            {selectedUser && (
              <View style={styles.selectedUserContainer}>
                <Text style={styles.selectedUserName}>Selected Target:</Text>
                <Text style={styles.selectedUserName}>{selectedUser.user.name}</Text>
                <Text style={styles.selectedUserPoints}>Points: {selectedUser.user.totalScore}</Text>
                <Text style={styles.selectedUserRank}>Rank: {selectedUser.user.rank.selectedTitle}</Text>
          
                <TouchableOpacity
                  style={[
                    styles.btnTarget, 
                    { backgroundColor: targetedUsers[selectedUser.user.id] ? 'gray' : item.bgColor }
                  ]}
                  onPress={() => doubleCheckTarget("Targeted", item, selectedUser)}
                  disabled={targetedUsers[selectedUser.user.id]}
                >
                  <Text style={styles.btnTextTarget}>
                    {targetedUsers[selectedUser.user.id] ? "Already Targeted" : "Buy Now"}
                  </Text>
                </TouchableOpacity>               
              </View>
            )}

            <TouchableOpacity 
              style={[styles.btn, { backgroundColor: Colors.gold }]} 
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.btnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <SafeAreaView style={{ backgroundColor: Colors.white }} />
    </>
  );
}

DetailsScreen.sharedElements = (route) => {
  const { item } = route.params;
  return [
    {
      id: `item.${item.id}.image`,
      animation: 'move',
      resize: 'clip',
    }
  ];
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: scaleSize(15),
    left: 5,
    zIndex: 10,
    padding: 10,
  },
  topContainer: {
    height: height / 3,
    paddingLeft: 20,
    paddingBottom: 20,
    paddingTop: 60,
    justifyContent: 'space-between',
  },
  bottomContainer: {
    padding: 16,
    flex: 1,
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
    paddingTop: 80,
    backgroundColor: '#2F4F6D',
  },
  bigText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.white,
  },
  smallText: {
    color: Colors.white,
    fontSize: 18,
  },
  image: {
    width: width / 1.5,
    height: width / 1.5,
  },
  imageContainer: {
    position: 'absolute',
    zIndex: 999,
    top: 60,
    alignSelf: 'flex-end',
  },
  descriptionContainer: {
    marginVertical: 5,
  },
  btn: {
    flex: 1,
    height: 45,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    fontWeight: 'bold',
    fontSize: 18,
    color: Colors.white,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: '100%',
    height: '70%',
  },
  modalContent: {
    width: 320,
    padding: 20,
    borderRadius: 10,
    backgroundColor: Colors.white,
    alignItems: 'center',
    maxHeight: 400,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 100,
  },
  listRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  disabledListRow: {
    opacity: 0.5,
    backgroundColor: '#f0f0f0',
  },
  disabledText: {
    color: '#999',
  },
  leftContainer: {
    flex: 1,
  },
  listLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  listSubLabel: {
    fontSize: 14,
    color: '#666',
  },
  listValue: {
    fontSize: 18,
    color: '#666',
    textAlign: 'right',
  },
  selectedUserContainer: {
    marginTop: 20,
    alignItems: 'center',
    paddingBottom: 20,
  },
  selectedUserName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.black,
  },
  selectedUserPoints: {
    fontSize: 18,
    color: Colors.black,
    marginTop: 5,
  },
  selectedUserRank: {
    fontSize: 16,
    color: Colors.black,
    marginTop: 5,
  },
  backButtonModal: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 100,
    padding: 10,
  },
  btnTarget: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 15,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.mainBackgroundColor,
  },
  btnTextTarget: {
    fontWeight: 'bold',
    fontSize: 18,
    color: Colors.gold,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.mainBackgroundColor,
  },
});