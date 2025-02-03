import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth"; 


const firebaseConfig = {
  apiKey: "AIzaSyB_dqXAjhvOfVVx_If3fmge2dgIQcyeu7E",
  authDomain: "inkredibles-e1419.firebaseapp.com",
  projectId: "inkredibles-e1419",
  storageBucket: "inkredibles-e1419.firebasestorage.app",
  messagingSenderId: "265145982200",
  appId: "1:265145982200:web:2ed0a5db29828db4d3af0d",
  measurementId: "G-GLSXYKP52M"
};


// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Authentication
const auth = getAuth(app); // Add authentication initialization

// Initialize Analytics only in the browser
let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

// Export the Firestore database, Auth, and Firebase config
export { db, auth, firebaseConfig };
