import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBNr1s9TdsXGveh8APx7LEGI6z7nncFzsA",
  authDomain: "chatapp-b4cdd.firebaseapp.com",
  projectId: "chatapp-b4cdd",
  storageBucket: "chatapp-b4cdd.firebasestorage.app",
  messagingSenderId: "833993035668",
  appId: "1:833993035668:web:572bd5fbc7c58846ebc981",
  measurementId: "G-PLXD1DM5DT"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
