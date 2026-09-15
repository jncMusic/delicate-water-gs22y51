import { useEffect, useState, useCallback } from "react";
import {
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, firebaseEnabled } from "./firebase";

/**
 * 관리자 로그인.
 *
 * Firebase 가 연결되어 있으면 Firebase Authentication(이메일/비밀번호)을 쓴다.
 * 연결 전 데모 모드에서는 화면을 둘러볼 수 있도록 로컬 통과 코드만 확인한다.
 * 데모 모드의 통과 코드는 브라우저 안에서만 검사하므로 실제 보안 수단이 아니다.
 */

const DEMO_PASSCODE = process.env.REACT_APP_DEMO_ADMIN_CODE || "admin";
const SESSION_KEY = "kwa:admin";

export const AUTH_MODE = firebaseEnabled ? "firebase" : "demo";

/**
 * 로그인 실패를 사무국이 읽고 조치할 수 있는 문구로 바꾼다.
 *
 * 전부 "로그인에 실패했습니다" 로 뭉뚱그리면 비밀번호 문제인지 설정 문제인지
 * 가릴 수 없다. 짚어 줄 수 있는 것은 짚어 주고, 나머지는 원래 코드를 덧붙여
 * 콘솔을 열지 않고도 물어볼 수 있게 한다.
 */
function signInMessage(err) {
  switch (err.code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
    case "auth/invalid-email":
      return "이메일 또는 비밀번호가 올바르지 않습니다.";
    case "auth/user-disabled":
      return "사용 중지된 계정입니다. 콘솔에서 다시 사용 설정해 주세요.";
    case "auth/too-many-requests":
      return "로그인 시도가 많아 잠시 막혔습니다. 몇 분 뒤 다시 시도해 주세요.";
    case "auth/operation-not-allowed":
      return "이메일/비밀번호 로그인이 꺼져 있습니다. Firebase 콘솔에서 사용 설정해 주세요.";
    case "auth/unauthorized-domain":
      return "이 주소가 Firebase 승인된 도메인에 없습니다. 콘솔에 현재 주소를 추가해 주세요.";
    case "auth/network-request-failed":
      return "네트워크에 연결하지 못했습니다. 인터넷 상태를 확인해 주세요.";
    default:
      return `로그인에 실패했습니다. (${err.code || "원인 불명"})`;
  }
}

export function useAdmin() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(!firebaseEnabled);

  useEffect(() => {
    if (!firebaseEnabled) {
      setUser(window.sessionStorage.getItem(SESSION_KEY) ? { email: "데모 관리자" } : null);
      return undefined;
    }
    return onAuthStateChanged(auth, (next) => {
      setUser(next ? { email: next.email, uid: next.uid } : null);
      setReady(true);
    });
  }, []);

  const signIn = useCallback(async (email, password) => {
    if (!firebaseEnabled) {
      if (password !== DEMO_PASSCODE) {
        throw new Error("통과 코드가 올바르지 않습니다.");
      }
      window.sessionStorage.setItem(SESSION_KEY, "1");
      setUser({ email: "데모 관리자" });
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      throw new Error(signInMessage(err));
    }
  }, []);

  const signOut = useCallback(async () => {
    if (!firebaseEnabled) {
      window.sessionStorage.removeItem(SESSION_KEY);
      setUser(null);
      return;
    }
    await fbSignOut(auth);
  }, []);

  return { user, isAdmin: Boolean(user), ready, signIn, signOut, mode: AUTH_MODE };
}
