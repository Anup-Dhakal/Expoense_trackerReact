// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBWs-34AY6zszsaPf6DE_Ibc24IRNsEhis",
  authDomain: "expensetracker-df857.firebaseapp.com",
  projectId: "expensetracker-df857",
  storageBucket: "expensetracker-df857.firebasestorage.app",
  messagingSenderId: "381665143815",
  appId: "1:381665143815:web:37b2b8390d2d637589cea2",
  measurementId: "G-35C9Q0K2W5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);