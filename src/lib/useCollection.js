import { useEffect, useState } from "react";
import { subscribe } from "./store";

/** 컬렉션을 실시간으로 읽어오는 훅. */
export function useCollection(name) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
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
