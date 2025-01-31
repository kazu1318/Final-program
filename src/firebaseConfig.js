import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDIa_zM0jMbzBTpCyKQ9EIKCJwLXNS5uYk",
    authDomain: "webprogram-2c961.firebaseapp.com",
    projectId: "webprogram-2c961",
    storageBucket: "webprogram-2c961.firebasestorage.app",
    messagingSenderId: "569501017344",
    appId: "1:569501017344:web:f572875fad003997fb7fe5",
    measurementId: "G-8GXE5SG6BN"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };