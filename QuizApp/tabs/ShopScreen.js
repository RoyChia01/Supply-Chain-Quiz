import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Dimensions, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView,Platform, RefreshControl, Alert } from 'react-native';
import { SharedElement } from 'react-navigation-shared-element';
import { useFocusEffect } from '@react-navigation/native';
import Colors from '../constants/Colors';
import { itemsList } from '../constants/itemlist';
import debounce from 'lodash/debounce';
import Icon from 'react-native-vector-icons/FontAwesome';
import { LogBox } from 'react-native';
import { getUserInfo } from './apiHandler';
import { useUser } from './userInfo';


LogBox.ignoreAllLogs(); // Ignore all log notifications

const { width } = Dimensions.get('window');
const scaleSize = (size) => size * (width / 375); // Base size scaling
const scaleFont = (size) => {
  const baseScale = 375;  // base screen width
  return size * (width / baseScale);
};

export default function ProductsList({ navigation, route }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState(itemsList);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [pointsBalance, setPointsBalance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const categories = ['All', 'Offence', 'Defence', 'Wildcard'];
  const { userEmail } = useUser(); // Get user email from context

  // Calculate the cheapest item price
  const cheapestItemPrice = useMemo(() => {
    return Math.min(...itemsList.map(item => parseInt(item.price)));
  }, []);

  // Check if user can afford any items
  const canBuyItems = useMemo(() => {
    return pointsBalance >= cheapestItemPrice;
  }, [pointsBalance, cheapestItemPrice]);

  // ListItem component with affordability check
  const ListItem = useCallback(({ item }) => {
    const handleItemPress = () => {
      if (!canBuyItems) {
        Alert.alert(
          "Insufficient Tokens",
          `You need at least ${cheapestItemPrice} Tokens to purchase items. Your current balance is ${pointsBalance} Tokens.`,
          [{ text: "OK", style: "default" }]
        );
        return;
      }
      
      navigation.navigate('DetailsScreen', { item });
    };

    return (
      <View style={styles.item}>
        <TouchableOpacity
          onPress={handleItemPress}
          style={[
            styles.imageContainer, 
            { backgroundColor: item.bgColor },
            !canBuyItems && styles.disabledItem
          ]}
        >
          <SharedElement id={`item.${item.id}.image`}>
            <Image 
              source={item.image} 
              style={[
                styles.image,
                !canBuyItems && styles.disabledImage
              ]} 
            />
          </SharedElement>
          {!canBuyItems && (
            <View style={styles.lockOverlay}>
              <Icon name="lock" size={24} color="#FFD700" />
            </View>
          )}
        </TouchableOpacity>
        <View style={styles.textContainer}>
          <Text style={[styles.text, { color: '#FFD700' }]}>{item.title}</Text>
          <Text 
            style={[
              styles.text, 
              { color: '#FFD700' },
              !canBuyItems && pointsBalance < item.price && styles.unaffordablePrice
            ]}
          >
            {item.price} Tokens
          </Text>
        </View>
      </View>
    );
  }, [canBuyItems, pointsBalance, cheapestItemPrice, navigation]);

  const fetchUserData = useCallback(async () => {
    setRefreshing(true);
    try {
      const userInfo = await getUserInfo(userEmail);
      console.log("Fetched user info:", userInfo);
      setPointsBalance(userInfo.pointBalance ? parseInt(userInfo.pointBalance) : 0);
      
      // Refresh the items list
      const filtered = itemsList.filter(item =>
        (selectedCategory === 'All' || item.subtitle === selectedCategory) &&
        (searchQuery === '' || item.title.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredItems(filtered);
    } catch (error) {
      console.error("Error fetching user info:", error);
    } finally {
      setRefreshing(false);
    }
  }, [userEmail, selectedCategory, searchQuery]);

  // Initial data load on component mount
  useEffect(() => {
    fetchUserData();
  }, []);

  // Refresh data when the screen comes into focus (including after goBack)
  useFocusEffect(
    useCallback(() => {
      console.log("Screen focused - refreshing data");
      fetchUserData();
      
      // Optional: Return a cleanup function
      return () => {
        console.log("Screen blurred");
      };
    }, [fetchUserData])
  );

  // Handle pull-to-refresh
  const onRefresh = useCallback(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleSearch = debounce((query) => {
    const filtered = itemsList.filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase()) &&
      (selectedCategory === 'All' || item.subtitle === selectedCategory)
    );
    setFilteredItems(filtered);
  }, 500);

  useEffect(() => {
    handleSearch(searchQuery);
  }, [searchQuery, selectedCategory]);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSearchQuery('');
  };

  return (
    <View style={styles.container}>
        <View style={styles.headerContainer}>
          <View style={styles.searchAndPointsContainer}>
            <View style={styles.searchBox}>
              <Icon name="search" size={20} color="#888" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search for products"
                value={searchQuery}
                onChangeText={(text) => setSearchQuery(text)}
              />
            </View>

            <Text style={[
              styles.pointsBalance,
              !canBuyItems && styles.insufficientBalance
            ]}>
              {pointsBalance || '0'} Tokens
            </Text>
          </View>

          {!canBuyItems && (
            <View style={styles.warningBanner}>
              <Icon name="exclamation-triangle" size={16} color="#FFD700" />
              <Text style={styles.warningText}>
                You need at least {cheapestItemPrice} Tokens to purchase items
              </Text>
            </View>
          )}

          <ScrollView
            horizontal
            contentContainerStyle={styles.categoryContainer}
            showsHorizontalScrollIndicator={false}
          >
            {categories.map(category => (
              <TouchableOpacity
                key={category}
                onPress={() => handleCategorySelect(category)}
                style={[
                  styles.categoryButton,
                  selectedCategory === category && styles.selectedCategoryButton
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category && styles.selectedCategoryText
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

      <FlatList
        data={filteredItems}
        numColumns={2}
        keyExtractor={(item, index) => item.id + index.toString()}
        renderItem={({ item }) => <ListItem item={item} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.gold]}
            tintColor={Colors.gold}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.mainBackgroundColor,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.mainBackgroundColor,
  },
  searchAndPointsContainer: {
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? scaleSize(-10) : scaleSize(40), // Slightly taller on Android
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
    backgroundColor: Colors.white,
    flex: 1,
  },
  searchIcon: {
    marginRight: 5,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  pointsBalance: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.gold,
    marginLeft: 10,
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderWidth: 3, 
    borderColor: Colors.white,
    borderRadius: 12,
    backgroundColor: Colors.mainBackgroundColor, 
  },
  insufficientBalance: {
    borderColor: '#FF6B6B',
    color: '#FF6B6B',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: 8,
    marginTop: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  warningText: {
    color: '#FFD700',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  categoryContainer: {
    flexDirection: 'row',
    paddingVertical: 15,
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: Colors.gold,
    paddingBottom: 20,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 20,
    borderRadius: 30,
    backgroundColor: '#1E3A5F',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    transition: 'background-color 0.3s ease',
  },
  selectedCategoryButton: {
    backgroundColor: Colors.gold,
    elevation: 6,
  },
  categoryText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
    textTransform: 'capitalize',
    letterSpacing: 1,
  },
  selectedCategoryText: {
    color: '#1E3A5F',
    fontWeight: 'bold',
  },
  item: {
    width: width / 2 - 24,
    marginLeft: 16,
    marginBottom: 20,
  },
  imageContainer: {
    alignItems: 'center',
    backgroundColor: Colors.gray,
    borderRadius: 14,
    position: 'relative',
  },
  disabledItem: {
    opacity: 0.7,
  },
  image: {
    height: 200,
    width: 200,
    resizeMode: 'contain',
  },
  disabledImage: {
    opacity: 0.6,
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 14,
  },
  textContainer: {
    marginVertical: 4,
  },
  text: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  unaffordablePrice: {
    color: '#FF6B6B',
    textDecorationLine: 'line-through',
  },
});