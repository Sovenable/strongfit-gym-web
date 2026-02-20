import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD9rdDWSnKEtvJufVsBXUBAOg5q0StXCuI",
  authDomain: "strongfit-gym.firebaseapp.com",
  projectId: "strongfit-gym",
  storageBucket: "strongfit-gym.firebasestorage.app",
  messagingSenderId: "1079863596158",
  appId: "1:1079863596158:web:1c842d2678e48c22f5f42f"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);