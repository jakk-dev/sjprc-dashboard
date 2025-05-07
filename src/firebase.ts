// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
      apiKey: "AIzaSyCV3aFzG7d-3kzZ1_eJontXHCD7Y7Zwy9Q",
  authDomain: "sjprc-dev-45eca.firebaseapp.com",
  projectId: "sjprc-dev-45eca",
  storageBucket: "sjprc-dev-45eca.firebasestorage.app",
  messagingSenderId: "815814045752",
  appId: "1:815814045752:web:7de6083e381f094b3db6cd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const db = getFirestore(app);
export const auth = getAuth(app);

// prod
//   apiKey: "AIzaSyBqup-Xa530VPHOwMXaBvijTZUfmlM8970",
//   authDomain: "sjprc-portal.firebaseapp.com",
//   projectId: "sjprc-portal",
//   storageBucket: "sjprc-portal.firebasestorage.app",
//   messagingSenderId: "595863862927",
//   appId: "1:595863862927:web:a218cc5c7fe719b3f17afa"