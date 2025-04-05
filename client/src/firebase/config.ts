// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC6bE2ZXA1RaXduIu3URPXlbf979Mt30lA",
  authDomain: "hectoclash-d5029.firebaseapp.com",
  projectId: "hectoclash-d5029",
  storageBucket: "hectoclash-d5029.firebasestorage.app",
  messagingSenderId: "808454928724",
  appId: "1:808454928724:web:0941da17bc19c017c830c1",
  measurementId: "G-1H15NQLQXF"
};
// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);