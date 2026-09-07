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
      throw new Error(
        err.code === "auth/invalid-credential" || err.code === "auth/wrong-password"
          ? "이메일 또는 비밀번호가 올바르지 않습니다."
          : "로그인에 실패했습니다. 잠시 후 다시 시도해 주세요."
      );
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
