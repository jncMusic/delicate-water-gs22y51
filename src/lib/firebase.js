import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const config = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

/** .env 에 Firebase 설정이 채워져 있을 때만 실제 서버에 연결한다. */
export const firebaseEnabled = Boolean(config.apiKey && config.projectId);

let db = null;
let storage = null;
let auth = null;

if (firebaseEnabled) {
  const app = getApps().length ? getApps()[0] : initializeApp(config);
  db = getFirestore(app);
  storage = getStorage(app);
  auth = getAuth(app);
}

export { db, storage, auth };
