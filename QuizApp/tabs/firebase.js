// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {getFirestore} from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBcCBiJO8ThI5n2Vefuf5C2fA0iO3x7-AI",
  authDomain: "rsaf-72426.firebaseapp.com",
  projectId: "rsaf-72426",
  storageBucket: "rsaf-72426.firebasestorage.app",
  messagingSenderId: "99224025673",
  appId: "1:99224025673:web:23f2b887c24e91f663dd98"
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const FIRESTORE_DB = getFirestore(FIREBASE_APP)