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

const ListItem = ({ item, navigation }) => {
  return (
    <View style={styles.item}>
      <TouchableOpacity
        onPress={() => navigation.navigate('Details', { item })}
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

  useEffect(() => {
    const user = FIREBASE_AUTH.currentUser;

    if (user) {
      const userDocRef = doc(FIRESTORE_DB, 'users', user.uid);

      getDoc(userDocRef).then((snapshot) => {
        if (snapshot.exists()) {
          setPointsBalance(snapshot.data().points);
        } else {
          console.log('User does not exist');
        }
      }).catch((error) => {
        console.error('Error fetching user data: ', error);
      });
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredItems}
        numColumns={2}
        style={{ paddingVertical: 5, marginTop: 40 }}
        keyExtractor={(item, index) => item.id + index.toString()}
        renderItem={({ item }) => <ListItem item={item} navigation={navigation} />}
        ListHeaderComponent={
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
        }
      />
    </SafeAreaView>
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
    paddingVertical: 5,
    marginTop: 5,
  },
  categoryButton: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginRight: 10,
    borderRadius: 8,
    backgroundColor: Colors.white,
  },
  selectedCategoryButton: {
    backgroundColor: Colors.primary,
  },
  categoryText: {
    fontSize: 16,
    color: Colors.darkGray,
  },
  selectedCategoryText: {
    color: Colors.white,
  },
  item: {
    width: width / 2 - 24,
    marginLeft: 16,
    marginBottom: 16,
  },
  imageContainer: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.gray,
    borderRadius: 14,
  },
  image: {
    height: 140,
    width: 140,
    resizeMode: 'center',
  },
  textContainer: {
    marginVertical: 4,
  },
  text: {
    fontWeight: 'bold',
    fontSize: 15,
  },
});
