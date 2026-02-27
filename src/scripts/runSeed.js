// src/scripts/runSeed.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { seedPatients } from './seedPatients.js';

// Your Firebase config (same as in firebase.js)
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCrLOHagtzcyYldc5_acb1jMQ5V9QDI7M4",
  authDomain: "neurosure-auth.firebaseapp.com",
  projectId: "neurosure-auth",
  storageBucket: "neurosure-auth.firebasestorage.app",
  messagingSenderId: "429943292168",
  appId: "1:429943292168:web:7c42882254b34e2959acbd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Run seeding
seedPatients();