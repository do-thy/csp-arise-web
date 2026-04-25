// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC7H-v7VGz3mlwCncK5Drl3Rf-LMY3VpPo",
  authDomain: "arisefirebaseauth.firebaseapp.com",
  projectId: "arisefirebaseauth",
  storageBucket: "arisefirebaseauth.firebasestorage.app",
  messagingSenderId: "197891244328",
  appId: "1:197891244328:web:e64cbecaec79af256cd01d",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);