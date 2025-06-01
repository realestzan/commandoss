import { getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyBxhliwj0MbzsjFiSO9QzPO_j65Kfq0Trc",
    authDomain: "realest-commandoss.firebaseapp.com",
    projectId: "realest-commandoss",
    storageBucket: "realest-commandoss.firebasestorage.app",
    messagingSenderId: "722797197292",
    appId: "1:722797197292:web:001518a6944be73a1372c9"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

export default app 