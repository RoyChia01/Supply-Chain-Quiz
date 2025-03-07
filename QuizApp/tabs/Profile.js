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
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  Modal, 
  FlatList, 
  Dimensions,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Platform,
} from 'react-native';
import { getUserInfo, updateSelectedTitle } from './apiHandler';
import { useUser } from './userInfo';
import { signOut } from 'firebase/auth';
import { FIREBASE_AUTH } from './firebase';
import Icon from 'react-native-vector-icons/FontAwesome';
import Colors from '../constants/Colors';
import { LogBox } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient'; // Assuming expo is available

LogBox.ignoreAllLogs();

// Get device dimensions
const { width, height } = Dimensions.get('window');
const getScaleSize = (size) => size * (width / 375);
const isIOS = Platform.OS === 'ios';

// Rank images
const images = {
  SCEngineer: require('../images/AvatarProgression/Engineer.jpg'),
  TeamIC: require('../images/AvatarProgression/TeamIC.jpg'),
  FlightLead: require('../images/AvatarProgression/FlightLead.jpg'),
  OC: require('../images/AvatarProgression/OC.jpg'),
  CO: require('../images/AvatarProgression/CO.jpg'),
  Commander: require('../images/AvatarProgression/Commander.jpg'),
  Trainee: require('../images/AvatarProgression/Trainee.jpg'),
};

// Function to get formatted date
const getCurrentDate = () => {
  const today = new Date();
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return today.toLocaleDateString('en-GB', options);
};

const BoardingPass = ({ navigation }) => {
  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const { userEmail } = useUser();
  const [userInfo, setUserInfo] = useState(null);
  const [passengerName, setPassengerName] = useState('');
  const [email, setEmail] = useState('');
  const [pointsBalance, setPointsBalance] = useState(0);
  const [rowData, setRowData] = useState([]);
  const [topRowData, setTopRowData] = useState([]);
  const [imageUrl, setImageUrl] = useState();
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState('');
  const [error, setError] = useState(null);

  // Responsive font sizing
  const fontSizeFactor = width / 375;

  // Refresh when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log("Screen focused - refreshing data");
      setRefresh(prev => !prev);
      return () => {};
    }, [])
  );

  // Function to fetch user data
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("Fetching user data for profile:", userEmail);
      const data = await getUserInfo(userEmail);

      if (!data) {
        setError("Could not retrieve user data. Please try again later.");
        return;
      }

      setUserInfo(data);
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
      setImageUrl(images[data.rank.selectedTitle] || images.Trainee);
    } catch (error) {
      console.error("❌ Error loading user data:", error);
      setError("Failed to load profile data. Please check your connection.");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Pull-to-refresh handler
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setRefresh(prev => !prev);
  }, []);

  useEffect(() => {
    fetchData();
  }, [refresh, userEmail]);

  // Handle Sign Out
  const handleSignOut = async () => {
    try {
      await signOut(FIREBASE_AUTH);
      navigation.replace('Login');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  // Handle title selection
  const handleSelectTitle = async (title) => {
    console.log('Selected title:', title);
    setSelectedTitle(title);
    handleRefresh();
    setModalVisible(false);
  };

  const handleRefresh = () => {
    setRefresh(!refresh);
  };

  // Update user title
  async function updateTitle(userDocumentID, title) {
    try {
      setIsLoading(true);
      const result = await updateSelectedTitle(userDocumentID, title);

      if (result.success) {
        console.log('Title updated successfully!');
        setRefresh(prev => !prev);
      } else {
        console.error('Failed to update title:', result.error);
        setError(`Failed to update title: ${result.error}`);
      }
    } catch (error) {
      console.error('Error updating title:', error);
      setError(`An unexpected error occurred: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading && !userInfo) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.backgroundColor} />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </SafeAreaView>
    );
  }

  if (error && !userInfo) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Icon name="exclamation-circle" size={50} color="#FF6B6B" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={handleRefresh}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.mainBackgroundColor} />
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.backgroundColor]} />
        }
      >
        <View style={styles.container}>
          <LinearGradient
            colors={[Colors.backgroundColor, Colors.mainBackgroundColor]}
            style={styles.boardingPassContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Header with logo and signout */}
            <View style={styles.header}>
              <Image
                source={require('../images/IconSC.png')}
                style={styles.logoImage}
                resizeMode="cover"
              />
              <TouchableOpacity onPress={handleSignOut} style={styles.exitIconContainer}>
                <Icon name="sign-out" color="#FFD700" size={24 * fontSizeFactor} />
                <Text style={styles.signOutText}>Sign Out</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.userBoardingPass}>
              {/* Card Header */}
              <View style={styles.cardHeader}>
                <Text style={styles.cardHeaderTitle}>BOARDING PASS</Text>
                <View style={styles.cardHeaderLine} />
              </View>

              {/* First Row */}
              <FirstRow 
                topRowData={topRowData} 
                setModalVisible={setModalVisible} 
                fontSizeFactor={fontSizeFactor} 
              />
              
              {/* Second Row */}
              <SecondRow 
                rowData={rowData} 
                fontSizeFactor={fontSizeFactor} 
              />

              {/* Third Row */}
              <ThirdRow 
                passengerName={passengerName} 
                imageUrl={imageUrl} 
                fontSizeFactor={fontSizeFactor} 
              />

              {/* Fourth Row */}
              <FourthRow 
                email={email} 
                pointsBalance={pointsBalance} 
                navigation={navigation} 
                fontSizeFactor={fontSizeFactor} 
              />

              {/* Fifth Row */}
              <View style={styles.fifthRow}>
                <Image
                  source={require('../images/barcode.png')}
                  style={styles.barcodeImage}
                />
              </View>
            </View>
          </LinearGradient>
        </View>
      </ScrollView>

      {/* Modal for Title Selection */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Your Title</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="times" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalDivider} />

            {isLoading ? (
              <ActivityIndicator size="small" color={Colors.backgroundColor} style={styles.modalLoading} />
            ) : userInfo && userInfo.rank ? (
            <FlatList
              data={[...new Set([userInfo.rank.title, ...userInfo.rank.specialTitle])]} // Removes duplicates
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[
                    styles.modalOption,
                    item === topRowData[1]?.subText && styles.modalOptionSelected
                  ]}
                  onPress={() => {
                    handleSelectTitle(item);
                    updateTitle(userInfo.id, item);
                  }}
                >
                  <Text style={[
                    styles.modalOptionText,
                    item === topRowData[1]?.subText && styles.modalOptionTextSelected
                  ]}>
                    {item}
                  </Text>
                  {item === topRowData[1]?.subText && (
                    <Icon name="check" size={16} color="#fff" />
                  )}
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.modalList}
            />

            ) : (
              <Text style={styles.modalLoadingText}>Loading available titles...</Text>
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
    </SafeAreaView>
  );
};

// Subcomponents

const FirstRow = ({ topRowData, setModalVisible, fontSizeFactor }) => (
  <View style={styles.shortRow}>
    <View style={styles.horizontalRow}>
      {topRowData.map((item, index) => (
        <View
          style={[styles.rowItem, index === 1 && styles.rankCenter]}
          key={index}
        >
          {item.title && (
            <Text style={[styles.boldTextSmall, { fontSize: 14 * fontSizeFactor }]}>
              {item.title}
            </Text>
          )}
          {item.subText && (
            <TouchableOpacity 
              style={index === 1 ? styles.rankButton : null}
              onPress={() => {
                if (item.title === 'Rank') {
                  setModalVisible(true);
                }
              }}
            >
              <Text style={[
                styles.subText, 
                { fontSize: 12 * fontSizeFactor }, // Apply fontSizeFactor
                index === 1 && styles.rankText
              ]}>
                {item.subText}
              </Text>
              {index === 1 && (
                <Icon name="chevron-down" size={12 * fontSizeFactor} color={Colors.backgroundColor} style={styles.rankIcon} />
              )}
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
          <View key={index} style={styles.topicContainer}>
            <Text style={styles.topicIndexText}>{data.index}</Text>
            <Text style={styles.topicLabel}>Current Topic</Text>
            <Text style={[styles.topicNameText, { fontSize: 12 * fontSizeFactor }]} numberOfLines={2}>{data.name}</Text>
          </View>
        ))}
      </View>
      <View style={styles.planeLogoSection}>
        <View style={styles.planeCircle}>
          <Text style={styles.planeLogo}>✈️</Text>
        </View>
        <View style={styles.planeLine} />
      </View>
      <View style={styles.dataSection}>
        {rowData.slice(1, 2).map((data, index) => (
          <View key={index} style={styles.topicContainer}>
            <Text style={styles.topicIndexText}>{data.index}</Text>
            <Text style={styles.topicLabel}>Latest Topic</Text>
            <Text style={[styles.topicNameText, { fontSize: 12 * fontSizeFactor }]} numberOfLines={2}>{data.name}</Text>
          </View>
        ))}
      </View>
    </View>
  </View>
);

const ThirdRow = ({ passengerName, imageUrl, fontSizeFactor }) => (
  <View style={styles.equalRow}>
    <View style={styles.splitRow}>
      <View style={styles.leftSection}>
        <Text style={styles.boldTextLabel}>Trainee Name</Text>
        <Text style={styles.boldNameText}>{passengerName}</Text>
      </View>
      <View style={styles.rightSection}>
        {imageUrl ? (
          <Image
            source={imageUrl}
            style={styles.profileImage}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <ActivityIndicator size="small" color={Colors.backgroundColor} />
          </View>
        )}
      </View>
    </View>
  </View>
);

const FourthRow = ({ email, pointsBalance, navigation, fontSizeFactor }) => (
  <View style={styles.equalRow}>
    <View style={styles.horizontalRow}>
      <View style={styles.leftSide}>
        <Text style={styles.boldTextLabel}>Email</Text>
        <Text style={styles.emailText} numberOfLines={1}>{email}</Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('resetPassword')} 
          style={styles.resetPasswordButton}
        >
          <Icon name="lock" size={14} color="#FFD700" style={styles.resetIcon} />
          <Text style={styles.resetPasswordText}>Reset Password</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.rightSide}>
        <Text style={styles.boldTextLabel}>Points Balance</Text>
        <View style={styles.pointsContainer}>
          <Icon name="star" size={18} color="#FFD700" style={styles.pointsIcon} />
          <Text style={styles.pointsText}>{pointsBalance}</Text>
        </View>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.mainBackgroundColor,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.mainBackgroundColor,
    minHeight: height - (isIOS ? 120 : 80),
    top: isIOS ? 0 : 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.mainBackgroundColor,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.mainBackgroundColor,
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: Colors.backgroundColor,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  boardingPassContainer: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    paddingTop: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  logoImage: {
    height: getScaleSize(50),
    width: getScaleSize(100),
  },
  exitIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.15)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 30,
  },
  signOutText: {
    color: '#FFD700',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 14,
  },
  userBoardingPass: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 80,
  },
  cardHeader: {
    padding: 16,
    alignItems: 'center',
  },
  cardHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.backgroundColor,
    letterSpacing: 2,
  },
  cardHeaderLine: {
    height: 3,
    width: 80,
    backgroundColor: Colors.backgroundColor,
    marginTop: 8,
    borderRadius: 1.5,
  },

  // Row styles
  shortRow: {
    paddingVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  equalRow: {
    paddingVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#e0e0e0',
  },
  fifthRow: {
    width: '100%', 
    height: getScaleSize(80), // Adjust as needed
    justifyContent: 'center', 
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#e0e0e0'
  },
  horizontalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
  },
  splitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
  },

  // Column and section styles
  dataSection: {
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
  leftSection: {
    flex: 1,
    paddingRight: 15,
  },
  rightSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftSide: {
    flex: 0.6,
  },
  rightSide: {
    flex: 0.4,
    alignItems: 'center',
  },

  // Text styles
  boldTextSmall: {
    fontWeight: 'bold',
    fontSize: getScaleSize(14),
    color: '#666',
    marginBottom: 4,
  },
  boldTextLabel: {
    fontWeight: 'bold',
    fontSize: getScaleSize(16),
    color: '#555',
    marginBottom: 6,
  },
  subText: {
    color: '#666',
    fontSize: getScaleSize(14),
  },
  boldNameText: {
    fontWeight: 'bold',
    fontSize: getScaleSize(24),
    color: '#333',
  },
  emailText: {
    fontSize: getScaleSize(14),
    color: '#666',
    marginBottom: 10,
  },

  // Topic container styles
  topicContainer: {
    alignItems: 'center',
  },
  topicIndexText: {
    fontWeight: 'bold',
    fontSize: getScaleSize(40),
    color: Colors.backgroundColor,
  },
  topicLabel: {
    fontSize: getScaleSize(12),
    color: '#888',
    marginBottom: 4,
  },
  topicNameText: {
    fontSize: getScaleSize(14),
    color: '#333',
    textAlign: 'center',
    maxWidth: '90%',
  },

  // Plane path visualization
  planeLogoSection: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0.8,
  },
  planeCircle: {
    width: getScaleSize(50),
    height: getScaleSize(50),
    borderRadius: getScaleSize(25),
    backgroundColor: 'rgba(135, 206, 250, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  planeLogo: {
    fontSize: getScaleSize(24),
  },
  planeLine: {
    position: 'absolute',
    top: '50%',
    width: '100%',
    height: 2,
    backgroundColor: 'rgba(135, 206, 250, 0.3)',
    zIndex: -1,
  },

  // Rank button
  rankButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  rankText: {
    color: Colors.backgroundColor,
    fontWeight: '600',
    fontSize: getScaleSize(14),
  },
  rankIcon: {
    marginLeft: 4,
  },

  // Profile image
  profileImage: {
    width: getScaleSize(80),
    height: getScaleSize(80),
    borderRadius: getScaleSize(40),
    borderWidth: 3,
    borderColor: Colors.backgroundColor,
  },
  imagePlaceholder: {
    width: getScaleSize(80),
    height: getScaleSize(80),
    borderRadius: getScaleSize(40),
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Points display
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  pointsText: {
    fontSize: getScaleSize(18),
    fontWeight: 'bold',
    color: '#333',
  },
  pointsIcon: {
    marginRight: 8,
  },

  // Reset password button
  resetPasswordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 20,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  resetPasswordText: {
    fontSize: getScaleSize(14),
    fontWeight: '600',
    color: Colors.backgroundColor,
  },
  resetIcon: {
    marginRight: 8,
  },

  // Barcode
  barcodeImage: {
    width: width * 0.9, // 90% of screen width for consistent scaling
    height: Platform.OS === 'ios' ? getScaleSize(220) : getScaleSize(240), // Slightly taller on Android
    resizeMode: 'contain',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: isIOS ? 34 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#333',
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    width: '100%',
    marginBottom: 8,
  },
  modalList: {
    paddingHorizontal: 16,
    maxHeight: height * 0.5,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginVertical: 4,
    borderRadius: 12,
  },
  modalOptionSelected: {
    backgroundColor: Colors.backgroundColor,
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
  },
  modalOptionTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalLoading: {
    padding: 30,
  },
  modalLoadingText: {
    textAlign: 'center',
    padding: 30,
    color: '#666',
  },
  modalCloseButton: {
    backgroundColor: '#f1f1f1',
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontWeight: 'bold',
    color: '#333',
    fontSize: 16,
  },
});

export default BoardingPass;