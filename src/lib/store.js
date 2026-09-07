import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage, firebaseEnabled } from "./firebase";
import { seedData } from "./seed";

/**
 * 화면과 저장소 사이의 얇은 데이터 계층.
 *
 * .env 에 Firebase 설정이 있으면 Firestore/Storage 를 쓰고,
 * 없으면 브라우저 localStorage 를 쓰는 데모 모드로 동작한다.
 * 두 모드의 함수 시그니처가 같아서 화면 코드는 어느 쪽인지 몰라도 된다.
 */

export const DEMO_MODE = !firebaseEnabled;

/** 데모 모드에서 localStorage 에 담아둘 수 있는 첨부파일 최대 크기. */
export const DEMO_FILE_LIMIT = 400 * 1024;

const storageKey = (name) => `kwa:${name}`;
const listeners = new Map(); // 컬렉션명 -> Set<callback>

const newId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

/** 최신 글이 위로 오도록 정렬. */
const byNewest = (rows) =>
  [...rows].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));

function readLocal(name) {
  try {
    const raw = window.localStorage.getItem(storageKey(name));
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn(`[store] ${name} 불러오기 실패`, err);
  }
  const seeded = seedData[name] || [];
  writeLocal(name, seeded, { silent: true });
  return seeded;
}

function writeLocal(name, rows, { silent = false } = {}) {
  try {
    window.localStorage.setItem(storageKey(name), JSON.stringify(rows));
  } catch (err) {
    // 용량 초과 등 — 화면은 계속 동작해야 하므로 경고만 남긴다.
    console.warn(`[store] ${name} 저장 실패`, err);
  }
  if (!silent) emit(name);
}

function emit(name) {
  const subs = listeners.get(name);
  if (!subs) return;
  const rows = byNewest(readLocal(name));
  subs.forEach((cb) => cb(rows));
}

/**
 * 컬렉션의 변화를 구독한다.
 * @returns {() => void} 구독 해제 함수
 */
export function subscribe(name, callback) {
  if (DEMO_MODE) {
    if (!listeners.has(name)) listeners.set(name, new Set());
    listeners.get(name).add(callback);
    callback(byNewest(readLocal(name)));
    return () => listeners.get(name)?.delete(callback);
  }

  const q = query(collection(db, name), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    (err) => {
      console.error(`[store] ${name} 구독 오류`, err);
      callback([]);
    }
  );
}

export async function createDoc(name, data) {
  const row = { ...data, createdAt: new Date().toISOString() };

  if (DEMO_MODE) {
    const id = newId();
    writeLocal(name, [{ id, ...row }, ...readLocal(name)]);
    return id;
  }

  const res = await addDoc(collection(db, name), row);
  return res.id;
}

export async function saveDoc(name, id, patch) {
  if (DEMO_MODE) {
    const rows = readLocal(name).map((r) => (r.id === id ? { ...r, ...patch } : r));
    writeLocal(name, rows);
    return;
  }
  await updateDoc(doc(db, name, id), patch);
}

export async function removeDoc(name, id) {
  if (DEMO_MODE) {
    writeLocal(name, readLocal(name).filter((r) => r.id !== id));
    return;
  }
  await deleteDoc(doc(db, name, id));
}

/** 여러 건의 같은 필드를 한 번에 바꾼다(회원 일괄 승인 등). */
export async function saveMany(name, ids, patch) {
  if (DEMO_MODE) {
    const set = new Set(ids);
    writeLocal(name, readLocal(name).map((r) => (set.has(r.id) ? { ...r, ...patch } : r)));
    return;
  }
  await Promise.all(ids.map((id) => updateDoc(doc(db, name, id), patch)));
}

/** 조회수·다운로드수처럼 화면에서 세는 값. 실패해도 사용자 흐름을 막지 않는다. */
export async function bumpCounter(name, id, field, current = 0) {
  try {
    await saveDoc(name, id, { [field]: (current || 0) + 1 });
  } catch (err) {
    console.warn(`[store] ${field} 증가 실패`, err);
  }
}

const readAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

/**
 * 첨부파일 업로드.
 * @returns {{name, size, type, url, path}} url 이 null 이면 내려받을 수 없는 상태(데모 모드의 대용량 파일).
 */
export async function uploadFile(file, folder = "resources") {
  if (DEMO_MODE) {
    const tooBig = file.size > DEMO_FILE_LIMIT;
    return {
      name: file.name,
      size: file.size,
      type: file.type,
      url: tooBig ? null : await readAsDataUrl(file),
      path: null,
    };
  }

  const path = `${folder}/${newId()}-${file.name}`;
  const target = storageRef(storage, path);
  await uploadBytes(target, file);
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    url: await getDownloadURL(target),
    path,
  };
}

export async function deleteFile(path) {
  if (DEMO_MODE || !path) return;
  try {
    await deleteObject(storageRef(storage, path));
  } catch (err) {
    // 이미 지워진 파일이면 문서 삭제까지 막을 이유는 없다.
    console.warn("[store] 파일 삭제 실패", err);
  }
}

/** 관리자가 만든 첫 문서를 기다리지 않고 setDoc 으로 고정 ID 를 쓰고 싶을 때. */
export async function putDoc(name, id, data) {
  if (DEMO_MODE) {
    const rows = readLocal(name);
    const exists = rows.some((r) => r.id === id);
    writeLocal(
      name,
      exists ? rows.map((r) => (r.id === id ? { ...r, ...data } : r)) : [{ id, ...data }, ...rows]
    );
    return;
  }
  await setDoc(doc(db, name, id), data, { merge: true });
}
