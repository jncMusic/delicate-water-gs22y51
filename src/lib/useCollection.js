import { useEffect, useMemo, useState } from "react";
import { subscribe } from "./store";
import { builtinRows } from "../data/posts";

/**
 * 컬렉션을 실시간으로 읽어오는 훅.
 *
 * 처음 값으로 홈페이지가 품고 있는 기본 게시물을 먼저 내준다. 두 가지 이유다.
 * - 저장소에서 답이 오기 전에도 화면에 내용이 보인다.
 * - 빌드할 때 미리 그려 두는 HTML(scripts/prerender.js)에도 그 내용이 들어가,
 *   자바스크립트를 돌리지 않는 검색엔진이 읽을 글이 생긴다.
 * 저장소에서 답이 오면 그 목록으로 갈아 끼운다(기본 게시물은 store 가 다시 섞는다).
 */
export function useCollection(name) {
  const [rows, setRows] = useState(() => builtinRows(name));
  // 보여 줄 것이 이미 있으면 "불러오는 중" 대신 그것을 먼저 보여 준다.
  const [loading, setLoading] = useState(() => builtinRows(name).length === 0);

  useEffect(() => {
    // 게시판이 바뀌면 앞 게시판의 목록이 잠깐 남지 않도록 처음 값으로 되돌린다.
    const builtin = builtinRows(name);
    setRows(builtin);
    setLoading(builtin.length === 0);

    const unsubscribe = subscribe(name, (next) => {
      setRows(next);
      setLoading(false);
    });
    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [name]);

  return { rows, loading };
}

/**
 * 공개 화면에서 쓰는 훅.
 *
 * hidden 이 붙은 글은 빼고 준다. 자동으로 긁어온 예술계 소식이 그렇게 들어오는데,
 * 사무국이 관리자 화면에서 보고 「공개」로 바꾸기 전에는 홈페이지에 나오면 안 된다.
 * 관리자 화면은 이 훅을 쓰지 않는다 — 거기서는 검토 대기 중인 글도 보여야 한다.
 */
export function usePublicCollection(name) {
  const { rows, loading } = useCollection(name);
  const visible = useMemo(() => rows.filter((row) => !row.hidden), [rows]);
  return { rows: visible, loading };
}
