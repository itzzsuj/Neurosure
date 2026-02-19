// Firebase Configuration EXAMPLE
// Copy this file to firebase.js and add your actual credentials

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Replace these with your actual Firebase config
// Get them from: https://console.firebase.google.com/
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
