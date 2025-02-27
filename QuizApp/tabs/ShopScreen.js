import React, { useState, useEffect } from 'react';
import { Dimensions, FlatList, Image, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView } from 'react-native';
import { SharedElement } from 'react-navigation-shared-element';
import Colors from '../constants/Colors';
import { itemsList } from '../constants/itemlist';
import debounce from 'lodash/debounce';
import Icon from 'react-native-vector-icons/FontAwesome';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../tabs/firebase';
import { doc, getDoc } from 'firebase/firestore';

const { width } = Dimensions.get('window');
const scaleSize = (size) => size * (width / 375); // Base size scaling
const scaleFont = (size) => {
  const baseScale = 375;  // base screen width
  return size * (width / baseScale);
};

const ListItem = ({ item, navigation }) => {
  return (
    <View style={styles.item}>
      <TouchableOpacity
        onPress={() => navigation.navigate('DetailsScreen', { item })}
        style={[styles.imageContainer, { backgroundColor: item.bgColor }]}>
        <SharedElement id={`item.${item.id}.image`}>
          <Image source={item.image} style={styles.image} />
        </SharedElement>
      </TouchableOpacity>
      <View style={styles.textContainer}>
        <Text style={[styles.text, { color: '#FFD700' }]}>{item.title}</Text>
        <Text style={[styles.text, { color: '#FFD700' }]}>{item.price} points</Text>
      </View>
    </View>
  );
};

export default function ProductsList({ navigation, route }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState(itemsList);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [pointsBalance, setPointsBalance] = useState('');
  const categories = ['All', 'Offence', 'Defence', 'Wildcard'];

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

  // useEffect(() => {
  //   const user = FIREBASE_AUTH.currentUser;

  //   if (user) {
  //     const userDocRef = doc(FIRESTORE_DB, 'users', user.uid);

  //     getDoc(userDocRef).then((snapshot) => {
  //       if (snapshot.exists()) {
  //         setPointsBalance(snapshot.data().points);
  //       } else {
  //         console.log('User does not exist');
  //       }
  //     }).catch((error) => {
  //       console.error('Error fetching user data: ', error);
  //     });
  //   }
  // }, []);

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

            <Text style={styles.pointsBalance}>
              {pointsBalance || '0'} points
            </Text>
          </View>

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
        renderItem={({ item }) => <ListItem item={item} navigation={navigation} />}
        
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2F4F6D',
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#2F4F6D',
  },
  searchAndPointsContainer: {
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop:scaleSize(25),
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
    color: '#FFD700',
    marginLeft: 10,
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderWidth: 3, 
    borderColor: Colors.white,
    borderRadius: 12,
    backgroundColor: '#2F4F6D', 
  },
  categoryContainer: {
    flexDirection: 'row',
    paddingVertical: 15,
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#FFD700', // Subtle gold line at the bottom
    paddingBottom: 20, // Add padding to the bottom to avoid blocking text
  },
  
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 20,
    borderRadius: 30,
    backgroundColor: '#1E3A5F', // Dark blue background for unselected
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4, // Shadow for depth
    transition: 'background-color 0.3s ease', // Smooth transition for hover effect
  },
  
  selectedCategoryButton: {
    backgroundColor: '#FFD700', // Gold background for the selected category
    elevation: 6, // More pronounced shadow for selected
  },
  
  categoryText: {
    fontSize: 16,
    color: '#FFFFFF', // White text for unselected categories
    fontWeight: '700',
    textTransform: 'capitalize', // Capitalize the first letter
    letterSpacing: 1, // Adds spacing between letters for better readability
  },
  
  selectedCategoryText: {
    color: '#1E3A5F', // Dark blue text for selected category
    fontWeight: 'bold', // Bolder font for emphasis
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
  },
  image: {
    height: 200,
    width: 200,
    resizeMode: 'contain',
  },
  textContainer: {
    marginVertical: 4,
  },
  text: {
    fontWeight: 'bold',
    fontSize: 18,
  },
});

