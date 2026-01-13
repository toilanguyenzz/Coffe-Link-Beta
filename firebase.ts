import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAlN3JwqD888u67RhuilOaYjvnveL74kbs",
  authDomain: "coffe-link-511e6.firebaseapp.com",
  projectId: "coffe-link-511e6",
  storageBucket: "coffe-link-511e6.firebasestorage.app",
  messagingSenderId: "66896676932",
  appId: "1:66896676932:web:f0cefe58c1068f9dbd5411",
  measurementId: "G-VQ5HRZSGS0"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();