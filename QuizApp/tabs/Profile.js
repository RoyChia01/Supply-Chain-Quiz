import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Modal, FlatList } from 'react-native';
import { getUserInfo,updateSelectedTitle } from './apiHandler';
import { useUser } from './userInfo';  // Import the hook
import { signOut } from 'firebase/auth';
import { FIREBASE_AUTH } from './firebase';  // Assuming you have the firebase configuration
import Icon from 'react-native-vector-icons/FontAwesome';

// Function to get the current date in the format (e.g., "16 Jan 2025")
const getCurrentDate = () => {
  const today = new Date();
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return today.toLocaleDateString('en-GB', options); // Format the date as "16 Jan 2025"
};

const BoardingPass = ({ navigation }) => {
  const [refresh, setRefresh] = useState(false);
  //const { userEmail } = "john.doe@example.com"; // Get user email from context
  const { userEmail } = useUser(); // Get user email from context
  const [passengerName, setPassengerName] = useState('');
  const [email, setEmail] = useState('');
  const [pointsBalance, setPointsBalance] = useState(0);
  const [rowData, setRowData] = useState([]);
  const [topRowData, setTopRowData] = useState([]);
  const [imageUrl, setImageUrl] = useState('');

  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState('');  // Store selected title

  const hardcodedData = { 
    name: "John Doe", 
    email: "john.doe@example.com", 
    pointBalance: 1250, 
    avatarBlob: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAoAAAAGQCAYAAADhFprXAAAAOXRFWHRTb2Z0d2FyZQBNYXRwbG90bGliIHZlcnNpb24zLjEuMiBodHRwOi8vbWF0cGxvdGxpYi5vcmcvbWF0cGxvdGxpYgA3J2ZB88wAAAACXBIWXMAAB7CAAAewgFu0HU+AAEAAElEQVR4nOzdd5gU5d7G8e+6Y0L1o9p1F3X6uVtv1LqSffJ6EpLRH8zLZX9wn2fUhhchhW4oaK7fqH1WWF0XUWXm1VflZbbXZ7uHp4HgX7SrxqQGyUdr5zwsG7O3Hi1YXwpXc9W1VXJwH+8fKXs2JQj8sOKa7hzU76pI/ppU1Yri0h9TK3wK8VjsCrDnxSje01bCBp5iQOZs7UO8kzKfh9vhn4FnPUJ3tM1dtpl0z9PysP7dqhb+/9fLP5sAl7abzwEs2D8nTHcsdRrFOfo+kVXjZ8g58H6R8g9mZYfp1/PoEGknwGKLrcKl1Xt5N7MIZa9gwe2lfVg4Xhn20bQw2yAEBKHrJdxmFeMgTt0ijF0aupy+vb5mm6cyzy93d+OV8iv+m9kvEkPj3j5TzM8McvSoqaJQe4N2fez3Ilz8h4pqTh0q3Q7ybJzMskRgMBhbJlvQ9EOrddLXYi9mjD5+UOpo9Ybqf3Pa2v8EgcWZ6ovh8DptTh0R2E5ldsj0B5mvfHEaWxxAmT8Jg9YoZzVmRSsTw8u95k71vMHK1s9XbjoK2y+9sB/7v1e39bA93MyCmImErpyI0pk5WG9yO3d6Tc4We5L+FfB/sWRm+/7Gi9hHXTlh1POndA3T1yTZrBpHg6oGx77f53zXmd8ir8FgVzUb7T4ST8BBgl2ZoNUoOb0i0pXKpMNcBAgImlTuAV5iVlwfg6qTITz9Y5ZGMPz5tPvD7sBNXN5u1wWoiRwlT2gdQY3kFm62Fb4PnUyFwlRMyO+O9YOjzDfhdbZ9MS2I+v7Zz6skwQg5ckw5ITqIiFX7DPB2hNTFfP75XbY/42jGhfyaVtKe45Ipr1Vg4gYBh1cXX4IFg3zTvlGHJpjlHpF48whQe3HnynvPiHjWgu4P5xEbnFQzbgJzX9mRAonq4kDewNwdfjZ4zXkPzj0l5Q==", 
    school: "Supply Chain", 
    rank: { 
      title: "Captain", 
      specialTitle: ["MVP", "Fastest"],
      selectedTitle: "SelectedCaptain",
    },
    topicMap: { 
        currentTopic: { 
            documentId: "OOVpC3kYERp3mJeS3tAO", 
            topicId: 1, 
            topic: "Live-Fire Safety" 
        }, 
        lastTopic: { 
            documentId: "tZplYuU8HxuCPVrG3uax", 
            topicId: 2, 
            topic: "Weapon Malfunction" 
        } 
    } 
};

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
    // Update the local state with the selected title
    setSelectedTitle(title);
  
    // Call the API to update the title on the server
    const result = await updateSelectedTitle(userDocumentID, title);
  
    // Check the result of the API call
    if (result.success) {
      // Successfully updated the title on the server
      console.log('Title updated successfully!');
    } else {
      // Handle error if title update fails
      console.error('Failed to update title:', result.error);
      Alert.alert('Error', 'Failed to update title: ' + result.error);
    }
  
    // Close the modal after selection
    handleRefresh();
    setModalVisible(false);
    
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        //const userInfo = await getUserInfo(userEmail);
        const userInfo = hardcodedData;
        setPassengerName(userInfo.name);
        setEmail(userInfo.email);
        setPointsBalance(userInfo.pointBalance);
        setRowData([
          userInfo.topicMap.currentTopic,
          userInfo.topicMap.lastTopic
        ]);
        setTopRowData([
          { title: 'School', subText: userInfo.school },
          { title: 'Rank', subText: userInfo.rank.selectedTitle }, 
          { title: '', subText: getCurrentDate() },
        ]);
        setImageUrl({ uri: userInfo.avatarBlob });
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    fetchData();
  }, [refresh, userEmail]);
  
  const handleRefresh = () => {
    setRefresh(!refresh);  // Toggle the refresh state
  };

  return (
    <View style={styles.container}>
      <View style={styles.backbBoardingPassContainer}>
        
        {/* Exit Icon Button */}
        <TouchableOpacity onPress={handleSignOut} style={styles.exitIconContainer}>
          <Icon type="FontAwesome" name="sign-out" color="#FFD700" size={40} />
        </TouchableOpacity>

        <Image
          source={require('../images/rsaf.png')}
          style={styles.logoImage}
        />
        
        <View style={styles.userBoardingPass}>
          {/* First Row */}
          <View style={styles.shortRow}>
            <View style={styles.horizontalRow}>
              {topRowData.map((item, index) => (
                <View
                  style={[styles.rowItem, index === 1 && styles.rankCenter]}
                  key={index}
                >
                  {item.title && (
                    <Text style={styles.boldTextSmall}>{item.title}</Text>
                  )}
                  {item.subText && (
                    <TouchableOpacity 
                      onPress={() => {
                        if (item.title === 'Rank') {
                          setModalVisible(true); // Open modal on rank tap
                        }
                      }}
                    >
                      <Text style={styles.subText}>{item.subText}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          </View>

          {/* Modal for Title Selection */}
          <Modal
            visible={isModalVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select a Title</Text>
                
                <FlatList
                  data={[hardcodedData.rank.title, ...hardcodedData.rank.specialTitle]}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => handleSelectTitle(item)}>
                      <Text style={styles.modalOption}>{item}</Text>
                    </TouchableOpacity>
                  )}
                />

                {/* If the title is successfully updated, show a confirmation message */}
                {selectedTitle && (
                  <View style={styles.confirmationMessageContainer}>
                    <Text style={styles.confirmationMessage}>Title changed to: {selectedTitle}</Text>
                  </View>
                )}

                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={styles.modalCloseButton}
                >
                  <Text style={styles.modalCloseButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Second Row */}
          <View style={styles.equalRow}>
            <View style={styles.splitRow}>
              {/* Left Section */}
              <View style={styles.dataSection}>
                {rowData.slice(0, 1).map((data, index) => (
                  <View key={index}>
                    <Text style={styles.boldText}>{data.topicId}</Text>
                    <Text style={styles.topicNameText}>{data.topic}</Text>
                  </View>
                ))}
              </View>

              {/* Center Section */}
              <View style={styles.planeLogoSection}>
                <Text style={styles.planeLogo}>✈️</Text>
              </View>

              {/* Right Section */}
              <View style={styles.dataSection}>
                {rowData.slice(1, 2).map((data, index) => (
                  <View key={index}>
                    <Text style={styles.boldText}>{data.topicId}</Text>
                    <Text style={styles.topicNameText}>{data.topic}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Third Row */}
          <View style={styles.equalRow}>
            <View style={styles.splitRow}>
              {/* Left Section */}
              <View style={[styles.dataSection, styles.leftSection]}>
                {rowData.slice(0, 1).map((data, index) => (
                  <View key={index}>
                    <Text style={styles.boldTextLabel}>Trainee Name</Text>
                    <Text style={styles.boldText}>{passengerName}</Text>
                  </View>
                ))}
              </View>

              {/* Image Placeholder Section */}
              <View style={[styles.dataSection, styles.imagePlaceholder]}>
                {imageUrl ? (
                  <Image
                    source={imageUrl} // Use the local image URL
                    style={styles.placeholderImage}
                  />
                ) : (
                  <Text>Loading image...</Text>  // Show loading text if the image is not yet available
                )}
              </View>
            </View>
          </View>

          {/* Fourth Row */}
          <View style={styles.equalRow}>
            <View style={styles.horizontalRow}>
              {/* Left Side (Email, Password, and Reset Icon) */}
              <View style={styles.leftSide}>
                <Text style={styles.boldTextLabel}>Email</Text>
                <Text style={[styles.subText, styles.emailValue]}>{email}</Text>

                <TouchableOpacity 
                  onPress={() => navigation.navigate('resetPassword')} 
                  style={styles.iconButton}>
                  <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#FFD700' }}>
                    Reset Password Here
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Right Side (Points Balance) */}
              <View style={styles.rightSide}>
                <Text style={styles.boldTextLabel}>Points Balance</Text>
                <Text style={styles.subText}>{pointsBalance}</Text>
              </View>
            </View>
          </View>

          {/* Fifth Row */}
          <View style={styles.fifthRow}>
            <Image
              source={require('../images/barcode.png')}
              style={styles.barcodeImage}
            />
            <View style={styles.semiCircleLeft}></View>
            <View style={styles.semiCircleRight}></View>
          </View>
        </View>
      </View>
    </View>
  );
};

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
    zIndex: 1,  // Ensures it's on top of other elements
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
    flex: 1,
  },
  rankCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  boldText: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  boldTextSmall: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  topicNameText: {
    fontSize: 20,
    color: '#666',
  },
  planeLogo: {
    fontSize: 60,
  },
  boldTextDisplayContainer: {
    width: '90%',
    padding: 5,
    alignItems: 'flex-start',
  },
  boldTextLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#A1A2A4',
  },
  subText: {
    fontSize: 18,
    color: '#444',
  },
  fifthRow: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 2,
    borderColor: '#ccc',
    marginTop: 20,
    position: 'relative',
  },
  semiCircleLeft: {
    position: 'absolute',
    top: -30,
    left: -35,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2F4F6D',
  },
  semiCircleRight: {
    position: 'absolute',
    top: -30,
    right: -35,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2F4F6D',
  },
  barcodeImage: {
    width: 300,
    height: 200,
  },
  logoImage: {
    width: 120,
    height: 100,
  },
  emailValue: {
    marginBottom: 15,
  },
  leftSection: {
    flex: 0.55, // 55% width for the left section
  },
  imagePlaceholder: {
    flex: 0.45, // 45% width for the image placeholder
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderImage: {
    width: 100, // Adjust width of the placeholder image
    height: 100, // Adjust height of the placeholder image
    resizeMode: 'contain',
    borderRadius: 10, // Optional: Add rounded corners to the placeholder image
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start', // Ensure text and icon are in a row
    gap: 10, // Add space between text and icon
  },
  iconButton: {
    paddingLeft: 10, // Small spacing for better alignment
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalOption: {
    fontSize: 16,
    marginVertical: 5,
    color: '#007bff',
  },
  modalCloseButton: {
    marginTop: 15,
    backgroundColor: '#FFD700',
    padding: 10,
    alignItems: 'center',
    borderRadius: 5,
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  confirmationMessageContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#4CAF50',  // Green background for success
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center',
  },
  confirmationMessage: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BoardingPass;

