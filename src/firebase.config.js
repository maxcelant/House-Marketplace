// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAuYiErHSFc3UaUGNAD0wKs45PQLEoXabo",
  authDomain: "house-marketplace-app-efd8e.firebaseapp.com",
  projectId: "house-marketplace-app-efd8e",
  storageBucket: "house-marketplace-app-efd8e.appspot.com",
  messagingSenderId: "737679711427",
  appId: "1:737679711427:web:e4a071f8079efad72e9676"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore();