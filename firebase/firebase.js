// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
require('dotenv').config();


const firebaseConfig = {
  apiKey: "AIzaSyDPoafNsYw1W1t7MwjShyzMkaJ5ZxK0pGU",
  authDomain: "docomo-399203.firebaseapp.com",
  projectId: "docomo-399203",
  storageBucket: "docomo-399203.appspot.com",
  messagingSenderId: "1092379520668",
  appId: "1:1092379520668:web:3263aa2c596072eb398759",
  measurementId: "G-08MF9CM4L9"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
