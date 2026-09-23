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
  // 읽기·삭제가 막혔을 때 기본값은 2분이다. 그동안 화면은 「올리는 중」 인
  // 채로 멈춰 있어 사무국은 고장인지 기다리는 중인지 알 수 없다. 짧게 줄여
  // 빨리 실패를 알린다. 올리기는 파일이 커도 끝까지 가야 하므로 건드리지 않는다.
  storage.maxOperationRetryTime = 15000;
  auth = getAuth(app);
}

export { db, storage, auth };
