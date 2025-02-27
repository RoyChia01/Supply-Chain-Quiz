/**
 * BoardingPass Component also known as profile screen
 *
 * This React Native component serves as a virtual boarding pass for users, displaying key information 
 * such as name, email, rank, progress, and points balance. It also provides interactive features 
 * like updating the user's title, logging out, and navigating to a reset password screen.
 *
 * Features:
 * - Retrieves user data from Firebase and displays it.
 * - Allows users to select and update their rank/title through a modal.
 * - Displays progress information (current and latest topic).
 * - Shows a dynamically loaded image based on the user's rank.
 * - Includes a sign-out button to log out the user.
 * - Provides a reset password navigation option.
 * - Uses responsive font scaling based on device width for UI consistency.
 *
 * Dependencies:
 * - React & React Native components (useState, useEffect, Dimensions, etc.)
 * - Firebase authentication for sign-out functionality.
 * - `useUser` custom hook to fetch user data.
 * - API functions `getUserInfo` and `updateSelectedTitle` for data fetching and updates.
 * - `FontAwesome` icons for UI elements.
 *
 * Structure:
 * - The UI consists of five rows displaying different sets of user-related data.
 * - Uses `useEffect` to fetch user data when the component mounts or refreshes.
 * - Implements a modal for selecting and updating the user's title.
 *
 * Usage:
 * - This component should be used inside a navigation stack to allow redirection after sign-out.
 * - The `navigation` prop enables screen transitions.
 */
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Modal, FlatList, Dimensions } from 'react-native';
import { getUserInfo, updateSelectedTitle } from './apiHandler';
import { useUser } from './userInfo';  // Import the hook
import { signOut } from 'firebase/auth';
import { FIREBASE_AUTH } from './firebase';  // Assuming you have the firebase configuration
import Icon from 'react-native-vector-icons/FontAwesome';
import { LogBox } from 'react-native';

LogBox.ignoreAllLogs(); // Ignore all log notifications

// Get device width and height
const { width, height } = Dimensions.get('window');
const getscaleSize = (size) => size * (width / 375); // Base size scaling

const images = {
  SCEngineer: require('../images/AvatarProgression/Engineer.jpg'),
  TeamIC: require('../images/AvatarProgression/TeamIC.jpg'),
  FlightLead: require('../images/AvatarProgression/FlightLead.jpg'),
  OC: require('../images/AvatarProgression/OC.jpg'),
  CO: require('../images/AvatarProgression/CO.jpg'),
  Commander: require('../images/AvatarProgression/Commander.jpg'),
  Trainee: require('../images/AvatarProgression/Trainee.jpg'), // Added fallback image
};

// Function to get the current date in the format (e.g., "16 Jan 2025")
const getCurrentDate = () => {
  const today = new Date();
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return today.toLocaleDateString('en-GB', options); // Format the date as "16 Jan 2025"
};

const BoardingPass = ({ navigation }) => {
  const [refresh, setRefresh] = useState(false);
  const { userEmail } = useUser(); // Get user email from context
  const [userInfo, setUserInfo] = useState(null);
  const [passengerName, setPassengerName] = useState('');
  const [email, setEmail] = useState('');
  const [pointsBalance, setPointsBalance] = useState(0);
  const [rowData, setRowData] = useState([]);
  const [topRowData, setTopRowData] = useState([]);
  const [imageUrl, setImageUrl] = useState();

  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState('');  // Store selected title

  const fontSizeFactor = width / 375; // Scale factor based on device width

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching user data for profile:", userEmail);
        const data = await getUserInfo(userEmail);

        if (!data) {
          console.error("❌ No user data received.");
          return;
        }

        setUserInfo(data);  // Store user data in state

        setPassengerName(data.name || "Unknown");
        setEmail(data.email || "No email provided");
        setPointsBalance(data.pointBalance ?? 0);
        setRowData([
          data.progress?.currentTopic || { index: 0, name: "Unknown" },
          data.progress?.latestTopic || { index: 0, name: "Unknown" }
        ]);
        setTopRowData([
          { title: "School", subText: data.school || "N/A" },
          { title: "Rank", subText: data.rank?.selectedTitle || "Unranked" },
          { title: "", subText: getCurrentDate() }
        ]);
        setImageUrl(images[data.rank] || images.Trainee);

      } catch (error) {
        console.error("❌ Error loading user data:", error);
      }
    };

    fetchData();
  }, [refresh, userEmail]);

  // Handle Sign Out
  const handleSignOut = async () => {
    try {
      await signOut(FIREBASE_AUTH);  // Sign out from Firebase
      navigation.replace('Login');  // Redirect to Login Screen
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  const handleSelectTitle = async (title) => {
    console.log('Selected title:', title);
    // Update the local state with the selected title
    setSelectedTitle(title);
    // Close the modal after selection
    handleRefresh();
    setModalVisible(false);
  };

  const handleRefresh = () => {
    setRefresh(!refresh);  // Toggle the refresh state
  };

  // Function to update the selected title for the user
  async function updateTitle(userDocumentID, title) {
    try {
      const result = await updateSelectedTitle(userDocumentID, title);
      console.log(userDocumentID, title);

      // Check the result of the API call
      if (result.success) {
        // Successfully updated the title on the server
        console.log('Title updated successfully!');
        // Reset states after successful title update
        setUserInfo(null);  // Clear user info
        setPassengerName('');  // Clear passenger name
        setEmail('');  // Clear email
        setPointsBalance(0);  // Reset points balance
        setRowData([]);  // Clear row data
        setTopRowData([]);  // Clear top row data
        setImageUrl('');  // Clear image URL

        // Toggle the refresh state to trigger useEffect and re-fetch the data
        setRefresh(prev => !prev);  // Toggling refresh triggers useEffect
      } else {
        // Handle error if title update fails
        console.error('Failed to update title:', result.error);
        Alert.alert('Error', 'Failed to update title: ' + result.error);
      }
    } catch (error) {
      // Handle any unexpected errors that may occur during the update process
      console.error('Error updating title:', error);
      Alert.alert('Error', 'An unexpected error occurred: ' + error.message);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.backbBoardingPassContainer}>
        
        {/* Exit Icon Button */}
        <TouchableOpacity onPress={handleSignOut} style={styles.exitIconContainer}>
          <Icon type="FontAwesome" name="sign-out" color="#FFD700" size={40 * fontSizeFactor} />
        </TouchableOpacity>

        <Image
          source={require('../images/IconSC.png')}
          style={styles.logoImage}
        />

        <View style={styles.userBoardingPass}>
          {/* First Row */}
          <FirstRow topRowData={topRowData} setModalVisible={setModalVisible} fontSizeFactor={fontSizeFactor} />
          
          {/* Modal for Title Selection */}
          <Modal
            visible={isModalVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={[styles.modalTitle, { fontSize: 18 * fontSizeFactor }]}>Select a Title</Text>

                {/* Check if userInfo is available before rendering the FlatList */}
                {userInfo && userInfo.rank ? (
                  <FlatList
                    data={[userInfo.rank.title, ...userInfo.rank.specialTitle]}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                      <TouchableOpacity 
                        onPress={() => {
                          handleSelectTitle(item);
                          updateTitle(userInfo.id, item);
                        }}
                      >
                        <Text style={[styles.modalOption, { fontSize: 16 * fontSizeFactor, color: 'blue' }]}>{item}</Text>
                      </TouchableOpacity>
                    )}
                  />
                ) : (
                  <Text>Loading titles...</Text>
                )}

                {/* If the title is successfully updated, show a confirmation message */}
                {selectedTitle && (
                  <View style={styles.confirmationMessageContainer}>
                    <Text style={[styles.confirmationMessage, { fontSize: 14 * fontSizeFactor }]}>Title changed to: {selectedTitle}</Text>
                  </View>
                )}

                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={styles.modalCloseButton}
                >
                  <Text style={[styles.modalCloseButtonText, { fontSize: 16 * fontSizeFactor }]}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Second Row */}
          <SecondRow rowData={rowData} fontSizeFactor={fontSizeFactor} />

          {/* Third Row */}
          <ThirdRow passengerName={passengerName} imageUrl={imageUrl} fontSizeFactor={fontSizeFactor} />

          {/* Fourth Row */}
          <FourthRow email={email} pointsBalance={pointsBalance} navigation={navigation} fontSizeFactor={fontSizeFactor} />

          {/* Fifth Row */}
          <View style={styles.fifthRow}>
            <Image
              source={require('../images/barcode.png')}
              style={styles.barcodeImage}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

// Components for each row

const FirstRow = ({ topRowData, setModalVisible, fontSizeFactor }) => (
  <View style={styles.shortRow}>
    <View style={styles.horizontalRow}>
      {topRowData.map((item, index) => (
        <View
          style={[styles.rowItem, index === 1 && styles.rankCenter]}
          key={index}
        >
          {item.title && (
            <Text style={[styles.boldTextSmall, { fontSize: 14 * fontSizeFactor }]}>{item.title}</Text>
          )}
          {item.subText && (
            <TouchableOpacity 
              onPress={() => {
                if (item.title === 'Rank') {
                  setModalVisible(true); // Open modal on rank tap
                }
              }}
            >
              <Text style={[styles.subText, { fontSize: 14 * fontSizeFactor }]}>{item.subText}</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </View>
  </View>
);

const SecondRow = ({ rowData, fontSizeFactor }) => (
  <View style={styles.equalRow}>
    <View style={styles.splitRow}>
      <View style={styles.dataSection}>
        {rowData.slice(0, 1).map((data, index) => (
          <View key={index}>
            <Text style={[styles.boldText, { fontSize: 48 * fontSizeFactor }]}>{data.index}</Text>
            <Text style={[styles.topicNameText, { fontSize: 12 * fontSizeFactor }]}>{data.name}</Text>
          </View>
        ))}
      </View>
      <View style={styles.planeLogoSection}>
        <Text style={[styles.planeLogo, { fontSize: 48 * fontSizeFactor }]}>✈️</Text>
      </View>
      <View style={styles.dataSection}>
        {rowData.slice(1, 2).map((data, index) => (
          <View key={index}>
            <Text style={[styles.boldText, { fontSize: 48 * fontSizeFactor }]}>{data.index}</Text>
            <Text style={[styles.topicNameText, { fontSize: 12 * fontSizeFactor }]}>{data.name}</Text>
          </View>
        ))}
      </View>
    </View>
  </View>
);

const ThirdRow = ({ passengerName, imageUrl, fontSizeFactor }) => (
  <View style={styles.equalRow}>
    <View style={styles.splitRow}>
      <View style={[styles.dataSection, styles.leftSection]}>
        <Text style={[styles.boldTextLabel, { fontSize: 16 * fontSizeFactor }]}>Trainee Name</Text>
        <Text style={[styles.boldText, { fontSize: 24 * fontSizeFactor }]}>{passengerName}</Text>
      </View>
      <View style={[styles.dataSection, styles.imagePlaceholder]}>
        {imageUrl ? (
          <Image
            source={imageUrl} // Use the local image URL
            style={[styles.placeholderImage, { width: 90 * fontSizeFactor, height: 90 * fontSizeFactor }]}
          />
        ) : (
          <Text>Loading image...</Text>
        )}
      </View>
    </View>
  </View>
);

const FourthRow = ({ email, pointsBalance, navigation, fontSizeFactor }) => (
  <View style={styles.equalRow}>
    <View style={styles.horizontalRow}>
      <View style={styles.leftSide}>
        <Text style={[styles.boldTextLabel, { fontSize: 16 * fontSizeFactor }]}>Email</Text>
        <Text style={[styles.subText, { fontSize: 14 * fontSizeFactor }]}>{email}</Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('resetPassword')} 
          style={styles.iconButton}>
          <Text style={{ fontSize: 20 * fontSizeFactor, fontWeight: 'bold', color: '#FFD700',marginTop: getscaleSize(10) }}>
            Reset Password Here
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.rightSide}>
        <Text style={[styles.boldTextLabel, { fontSize: 16 * fontSizeFactor }]}>Points Balance</Text>
        <Text style={[styles.subText, { fontSize: 14 * fontSizeFactor }]}>{pointsBalance}</Text>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2F4F6D',
  },
  backbBoardingPassContainer: {
    flex: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#446d92',
    width: '90%',
    margin: 95,
    borderRadius: 50,
    marginTop: 20,
  },
  exitIconContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'transparent',
    zIndex: 1,
    padding: 10,
  },
  userBoardingPass: {
    backgroundColor: '#fff',
    width: '100%',
    height: '85%',
    borderRadius: 50,
    top: 10,
  },
  shortRow: {
    flex: 0.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  equalRow: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 2,
    borderColor: '#ccc',
  },
  horizontalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '90%',
  },
  splitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
  },
  dataSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planeLogoSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankCenter: {
    alignItems: 'center',
  },
  boldTextSmall: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  subText: {
    color: 'gray',
  },
  boldText: {
    fontWeight: 'bold',
    alignSelf: 'center',
  },
  topicNameText: {
    color: '#333',
    textAlign: 'center',
  },
  placeholderImage: {
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'gray',
  },
  imagePlaceholder: {
    marginLeft: 10,
  },
  boldTextLabel: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  leftSide: {
    flex: 0.6,
    paddingBottom: getscaleSize(20),
  },
  rightSide: {
    flex: 0.4,
    alignItems: 'center',
    paddingBottom: getscaleSize(60),
  },
  confirmationMessageContainer: {
    marginTop: 10,
  },
  confirmationMessage: {
    color: 'green',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  modalOption: {
    paddingVertical: 10,
  },
  modalCloseButton: {
    marginTop: 20,
    backgroundColor: '#FFD700',
    padding: 10,
    borderRadius: 5,
  },
  modalCloseButtonText: {
    fontWeight: 'bold',
    color: '#fff',
  },
  barcodeImage: {
    width: 300,
    height: 60,
    alignSelf: 'center',
    marginBottom: 10,
  },
  logoImage: {
    height: 100,
    width: 200,
  },
});


export default BoardingPass;