import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";


const firebaseConfig = {
  apiKey: "AIzaSyCvlAWRcdzAIE96rJYuyW3YE9PRLsLHsL4",
  authDomain: "private-chat-c3f5d.firebaseapp.com",
  projectId: "private-chat-c3f5d",
  storageBucket: "private-chat-c3f5d.firebasestorage.app",
  messagingSenderId: "872887234501",
  appId: "1:872887234501:web:ad30bb4a1d5b196033e5ac",
  measurementId: "G-ZWBMX6YM2K"
};


const app = initializeApp(firebaseConfig);


export const db = getFirestore(app);

export const rtdb = getDatabase(app);