//This files handles all the request to the firebase server and returns the response
//The server is hosted on firebase and the firebase SDK is used to connect to the server
//Mainly used for authentication


// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';
import { LogBox } from 'react-native';

LogBox.ignoreAllLogs(); // Ignore all log notifications

// Your web app's Firebase configuration
const firebaseConfig = {
#
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const FIRESTORE_DB = getFirestore(FIREBASE_APP)
