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
import { builtinRows, isBuiltinId } from "../data/posts";

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

/**
 * 저장소에서 읽어온 글에 홈페이지가 품고 있는 기본 게시물을 섞는다.
 * 같은 id 가 저장소에도 있으면 저장소 쪽을 남긴다.
 */
function withBuiltin(name, rows) {
  const builtin = builtinRows(name);
  if (builtin.length === 0) return rows;
  const taken = new Set(rows.map((row) => row.id));
  return byNewest([...rows, ...builtin.filter((row) => !taken.has(row.id))]);
}

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
  const rows = withBuiltin(name, byNewest(readLocal(name)));
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
    callback(withBuiltin(name, byNewest(readLocal(name))));
    return () => listeners.get(name)?.delete(callback);
  }

  const q = query(collection(db, name), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) => callback(withBuiltin(name, snap.docs.map((d) => ({ id: d.id, ...d.data() })))),
    (err) => {
      console.error(`[store] ${name} 구독 오류`, err);
      callback(withBuiltin(name, []));
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
  // 기본 게시물은 저장소에 문서가 없으니 셀 것도 없다.
  if (isBuiltinId(id)) return;
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
  // 저장 위치가 홈페이지와 다른 도메인이라 링크에 붙이는 파일명은 무시된다.
  // 올릴 때 "열지 말고 이 이름으로 저장하라"고 파일 자체에 적어 둬야
  // 받는 쪽에서 PDF 가 화면에 열리지 않고 원래 이름으로 저장된다.
  await uploadBytes(target, file, {
    contentType: file.type || "application/octet-stream",
    contentDisposition: `attachment; filename*=UTF-8''${encodeURIComponent(file.name)}`,
  });
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
