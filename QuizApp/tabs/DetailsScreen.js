import React, { useEffect, useState } from 'react'
import { Dimensions, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SharedElement } from 'react-navigation-shared-element'
import Icon, { Icons } from '../components/Icons'
import Colors from '../constants/Colors'
import { LogBox } from 'react-native';

LogBox.ignoreAllLogs(); // Ignore all log notifications
const { width, height } = Dimensions.get('window');

const Quantity = () => {
  const [quantity, setQuantity] = useState(0);

  const handleDecrease = () => {
    if (quantity > 0) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleIncrease = () => {
    if (quantity < 1) {
      setQuantity(prev => prev + 1);
    }
  };

  return (
    <View style={styles.quantity}>
      <TouchableOpacity style={[styles.qtBtn, { opacity: quantity === 0 ? 0.5 : 1 }]} 
      onPress={handleDecrease}
        disabled={quantity === 0}>
        <Icon type={Icons.Entypo} name="minus" />
      </TouchableOpacity>
      <Text style={styles.quantityText}>{quantity}</Text>
      <TouchableOpacity 
        style={[styles.qtBtn, { opacity: quantity === 1 ? 0.5 : 1 }]} 
        onPress={handleIncrease} 
        disabled={quantity === 1}>
        <Icon type={Icons.Entypo} name="plus" />
      </TouchableOpacity>
    </View>
  )
}

export default function DetailsScreen({ navigation, route }) {
  const { item } = route.params;

  return (
    <>
      <SafeAreaView style={[styles.container, { backgroundColor: item.bgColor }]} >
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
            <Image source={item.image} style={styles.image} resizeMode='center' />
          </SharedElement>
          <View style={styles.bottomContainer}>
            <View style={styles.descriptionContainer}>
              <Text style={{ fontWeight: 'bold', marginBottom: 10,fontSize:32,color:Colors.gold }}>Description</Text>
              <Text style={{fontWeight: 'bold',fontSize:20 }}>{item.description}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Quantity />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <TouchableOpacity style={[styles.btn, { backgroundColor: item.bgColor }]}>
                <Text style={styles.btnText}>Buy Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
      <SafeAreaView style={{ backgroundColor: Colors.white }} />
    </>
  )
}

DetailsScreen.sharedElements = (route) => {
  const { item } = route.params;
  return [
    {
      id: `item.${item.id}.image`,
      animation: 'move',
      resize: 'clip',
    }
  ]
}

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
  quantity: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  qtBtn: {
    borderWidth: 1,
    borderColor: Colors.darkGray,
    borderRadius: 8,
    width: 34,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 10,
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
});
