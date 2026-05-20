// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAOz9hSWkA4v6nvcH5nXYTM9XheAyvm09s",
  authDomain: "final-practical-b6c06.firebaseapp.com",
  projectId: "final-practical-b6c06",
  storageBucket: "final-practical-b6c06.firebasestorage.app",
  messagingSenderId: "331974507788",
  appId: "1:331974507788:web:c39e22c8e597e32708dd29"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Firebase Firestore
export const database = getFirestore(app);

// Initialize Firebase Storage
export const storage = getStorage(app);

export default app;
