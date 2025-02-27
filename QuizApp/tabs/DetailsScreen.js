import React, { useState } from 'react';
import { 
  Dimensions, 
  Image, 
  Modal, 
  SafeAreaView, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  FlatList 
} from 'react-native';
import { SharedElement } from 'react-navigation-shared-element';
import Icon, { Icons } from '../components/Icons';
import Colors from '../constants/Colors';
import { LogBox } from 'react-native';
import { fetchLeaderboard } from './apiHandler';

LogBox.ignoreAllLogs(); // Ignore all log notifications
const { width, height } = Dimensions.get('window');
const scaleSize = (size) => size * (width / 375); // Base size scaling

const rowHeight = 50; // Set the row height to a fixed value (adjust based on your needs)

export default function DetailsScreen({ navigation, route }) {
  const { item } = route.params;
  const [modalVisible, setModalVisible] = useState(false);
  const [sabotageData, setSabotageData] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);


  const buyNow = async (item) => {
    console.log(item.title); 
    if (item.title === 'Sabotage') {
      try {
        const responseData = await fetchLeaderboard(); // Ensure fetchLeaderboard is an async function
        setSabotageData(responseData); // Update sabotageData with fetched response
        setModalVisible(true);
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
      }
    } else {
      console.log("Proceeding with purchase...");
    }
  };

  // Handle item press
  const handleItemPress = (item) => {
    console.log("Item pressed:", item);
    setSelectedUser(item);  // Set the selected user
  };
  

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.listRow} onPress={() => handleItemPress(item)}>
      {/* Left Side - Name & Title */}
      <View style={styles.leftContainer}>
        <Text style={styles.listLabel}>{item.user.name}</Text>
        <Text style={styles.listSubLabel}>{item.user.rank.selectedTitle}</Text>
      </View>
      {/* Right Side - Point Balance */}
      <Text style={styles.listValue}>{item.user.pointBalance}</Text>
    </TouchableOpacity>
  );

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
            <Text style={{ fontWeight: 'bold', fontSize: 20, paddingBottom: 20 }}>
              {item.description}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            {item.title === 'Sabotage' ? (
              // Show "View Users" button if item.title is 'Sabotage'
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: item.bgColor }]}
                onPress={() => buyNow(item)}
              >
                <Text style={styles.btnText}>View Users</Text>
              </TouchableOpacity>
            ) : (
              // Show "Buy Now" button for all other items
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: item.bgColor }]}
                onPress={() => buyNow(item)}
              >
                <Text style={styles.btnText}>Buy Now</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>


      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* Back Arrow Button */}
          <TouchableOpacity
            style={styles.backButtonModal}
            onPress={() => {
              setSelectedUser(null); // Clear the selected user
              setModalVisible(false); // Close the modal
            }}
          >
            <Icon type={Icons.Ionicons} name="arrow-back" size={30} color={Colors.black} />
          </TouchableOpacity>

          {/* Modal Title */}
          <Text style={styles.modalTitle}>Select a Target</Text>
          
          {/* Users List */}
          <FlatList
            data={sabotageData} // Use the fetched sabotageData
            keyExtractor={(item) => item.user.id ? item.user.id.toString() : item.positionIndex.toString()}
            renderItem={renderItem}
            initialNumToRender={10} // Renders 10 items initially
            maxToRenderPerBatch={10} // Limit rendering to 10 per batch
            windowSize={5} // Adjust window size to optimize scroll behavior
          />

          {/* Display selected user details if one is selected */}
          {selectedUser && (
            <View style={styles.selectedUserContainer}>
            <Text style={styles.selectedUserName}>Selected Target:</Text>
            <Text style={styles.selectedUserName}>{selectedUser.user.name}</Text> {/* Display name on the next line */}
            <Text style={styles.selectedUserPoints}>Points: {selectedUser.user.pointBalance}</Text>
            <Text style={styles.selectedUserRank}>Rank: {selectedUser.user.rank.selectedTitle}</Text>
        
              <TouchableOpacity 
                style={[styles.btnTarget]} 
                onPress={() => {
                  console.log("Proceeding with purchase...");
                  setModalVisible(false);  // Close modal
                }}
              >
                <Text style={styles.btnTextTarget}>Buy Now</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity style={[styles.btn, { backgroundColor: Colors.gold }]} onPress={() => setModalVisible(false)}>
            <Text style={styles.btnText}>OK</Text>
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
    top: 5,
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
    flex: 1, // Ensures it takes up the full screen
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    width: '100%',
    height: '70%', // Set modal height to 70% of the screen to fit 10 items
  },
  modalContent: {
    width: 320,
    padding: 20,
    borderRadius: 10,
    backgroundColor: Colors.white,
    alignItems: 'center',
    maxHeight: 400, // Limit content height to 10 items
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
    textAlign: 'right', // Align point balance to the right
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
  paddingVertical: 12, // Controls the vertical height of the button
  marginTop: 15, // Adjust padding to center text vertically
  borderRadius: 10,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: Colors.mainBackgroundColor,
},

btnTextTarget: {
  fontWeight: 'bold',
  fontSize: 18,
  color: Colors.white,
},
});

