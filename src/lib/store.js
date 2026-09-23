import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  onSnapshot,
  query,
  orderBy,
  writeBatch,
} from "firebase/firestore";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage, firebaseEnabled } from "./firebase";
import { shrinkImage } from "./image";
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

/** 파일이나 blob 을 화면에서 바로 쓸 수 있는 data 주소로 바꾼다. */
function toDataUrl(blob) {
  return new Promise((done, fail) => {
    const reader = new FileReader();
    reader.onload = () => done(reader.result);
    reader.onerror = fail;
    reader.readAsDataURL(blob);
  });
}

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

/**
 * 문서 한 건만 읽는다.
 *
 * 목록을 훑지 않고 id 를 아는 한 건만 가져온다. 증명서를 신청한 분이 접수할
 * 때 받은 주소로 자기 것을 확인하는 데 쓴다. 보안 규칙도 get 만 열어 두었다.
 *
 * 없으면 null. 없는 것은 오류가 아니다.
 */
export async function readDoc(name, id) {
  if (DEMO_MODE) {
    return readLocal(name).find((row) => row.id === id) || null;
  }
  const snap = await getDoc(doc(db, name, id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
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

/**
 * 여러 건을 한 번에 새로 담는다(회원 명부 올리기).
 *
 * 한 건씩 createDoc 을 부르면 수백 번 왕복한다. Firestore 는 한 묶음에
 * 500건까지 담을 수 있어 그 단위로 끊어 보낸다.
 *
 * 묶음 중간에 실패하면 앞 묶음은 이미 들어가 있다. 되돌리지 않고 몇 건까지
 * 들어갔는지 알려 준다. 반쯤 들어간 것을 지우려다 멀쩡한 것까지 지우는 편이
 * 더 위험하다. 같은 파일을 다시 올리면 이미 있는 사람은 걸러진다.
 */
export async function createMany(name, list) {
  // 명부처럼 실제 가입일을 아는 경우가 있다. 적혀 있으면 그것을 살린다.
  const now = new Date().toISOString();
  const stamped = list.map((data) => ({ createdAt: now, ...data }));

  if (DEMO_MODE) {
    const rows = stamped.map((row) => ({ id: newId(), ...row }));
    writeLocal(name, [...rows, ...readLocal(name)]);
    return rows.length;
  }

  const LIMIT = 500;
  let saved = 0;
  for (let at = 0; at < stamped.length; at += LIMIT) {
    const batch = writeBatch(db);
    for (const row of stamped.slice(at, at + LIMIT)) {
      batch.set(doc(collection(db, name)), row);
    }
    await batch.commit();
    saved += Math.min(LIMIT, stamped.length - at);
  }
  return saved;
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
/**
 * 완성된 증명서를 올린다.
 *
 * 직인이 찍힌 그림 한 장이다. 파일 이름을 신청서의 문서 id 로 삼아, 주소를
 * 받은 본인만 찾아갈 수 있게 한다. 다시 발급하면 같은 자리에 덮어쓴다.
 *
 * 여기서는 getDownloadURL 을 쓴다. 직인과 달리 이 파일은 신청한 분이 받아야
 * 하고 그분은 로그인하지 않기 때문이다. 나가는 것은 완성된 문서 한 장이고,
 * 직인 그림 자체는 여전히 사무국 밖으로 나가지 않는다.
 */
export async function uploadCertificate(id, blob) {
  if (DEMO_MODE) {
    const asText = await toDataUrl(blob);
    window.localStorage.setItem(`kwa:cert:${id}`, asText);
    return asText;
  }

  const target = storageRef(storage, `certificates/${id}.png`);
  await uploadBytes(target, blob, { contentType: "image/png" });
  return getDownloadURL(target);
}

/* ─────────────────────────── 협회 직인 ─────────────────────────── */

/**
 * 협회 직인.
 *
 * 문서 한 칸에 그림을 통째로 담는다. 파일 저장소가 아니다.
 *
 * 처음에는 저장소에 두고 쓸 때마다 받아 왔는데, 받아 오는 쪽이 실제 도메인
 * 에서 막혔다. 올리기는 되는데 읽기가 안 되니 사무국은 발급할 때마다 직인을
 * 다시 올려야 했다. 저장소에서 브라우저로 내용을 직접 받으려면 버킷에 따로
 * 설정이 필요한데, 그림 한 장 때문에 사무국이 명령줄 도구를 잡을 일은 아니다.
 *
 * 데이터베이스는 이미 이 홈페이지가 온종일 쓰고 있는 길이라 확실하다. 규칙도
 * 더 좁다 — 저장소 쪽은 '로그인한 계정' 이면 됐지만 이쪽은 관리자만 열린다.
 *
 * 그림은 담기 전에 줄인다. 문서 한 칸은 1MB 를 넘길 수 없다.
 */
const SEAL = { name: "settings", id: "seal" };

/** 직인을 담는다. 늘 같은 자리에 덮어써서 여러 장이 남지 않게 한다. */
export async function uploadSeal(file) {
  const image = await shrinkImage(file);

  if (DEMO_MODE) {
    window.localStorage.setItem("kwa:seal", image);
    return image;
  }

  await setDoc(doc(db, SEAL.name, SEAL.id), {
    image,
    updatedAt: new Date().toISOString(),
  });
  return image;
}

/**
 * 직인을 가져온다. 담은 적이 없으면 null 을 준다. 없다고 해서 오류는 아니다.
 *
 * 읽지 못한 것은 삼키지 않는다. 삼키면 담아 둔 직인이 없는 것처럼 보여
 * 사무국이 같은 파일을 몇 번이고 다시 올리게 된다.
 */
export async function loadSeal() {
  if (DEMO_MODE) return window.localStorage.getItem("kwa:seal");

  const snap = await getDoc(doc(db, SEAL.name, SEAL.id));
  return snap.exists() ? snap.data().image || null : null;
}

/** 직인을 지운다. */
export async function removeSeal() {
  if (DEMO_MODE) {
    window.localStorage.removeItem("kwa:seal");
    return;
  }
  await deleteDoc(doc(db, SEAL.name, SEAL.id));
}

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
