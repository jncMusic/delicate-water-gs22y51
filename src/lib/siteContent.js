import { useEffect, useMemo, useState } from "react";
import { subscribeDoc } from "./store";
import {
  branchList,
  chapterList,
  branchTotals,
  executives,
  officerFees,
} from "../data/site";

/**
 * 사무국이 직접 고치는 협회 명단과 회비.
 *
 * 임원·지회장·지부장·회비는 사람이 바뀔 때마다 고쳐야 하는데, 그동안
 * src/data/site.js 에 코드로 박혀 있어 개발자를 불러야 했다. 이제 사무국이
 * 관리자 화면에서 고치면 Firestore 의 siteContent 에 담기고 홈페이지가 그것을
 * 쓴다.
 *
 * 담긴 것이 없으면 site.js 값을 그대로 쓴다. 그래서
 * - 사무국이 아직 손대지 않아도 홈페이지는 지금과 똑같이 나온다.
 * - 저장소가 잠깐 답하지 않아도 빈 화면이 되지 않는다.
 * - 빌드할 때 미리 그려 두는 HTML(scripts/prerender.js)에도 명단이 들어가,
 *   자바스크립트를 돌리지 않는 검색엔진이 읽을 내용이 생긴다.
 *
 * 다만 사무국이 고친 내용이 미리 그려 둔 HTML 에 들어가려면 홈페이지를 다시
 * 빌드해야 한다. 사람이 보는 화면은 바로 바뀌고, 검색엔진이 읽는 쪽만 다음
 * 배포까지 예전 명단으로 남는다.
 */

export const CONTENT = "siteContent";

/** 문서 id 와, 사무국이 손대지 않았을 때 쓸 기본값. */
export const defaults = {
  executives,
  branches: { list: branchList },
  chapters: { list: chapterList, total: branchTotals.chapters },
  fees: officerFees,
};

/**
 * 담긴 값과 기본값을 겹친다.
 *
 * 한 칸씩 본다. 사무국이 임원만 고쳤다면 지회는 기본값이 그대로 남아야 한다.
 * 빈 배열은 「비웠다」는 뜻이므로 그대로 둔다. 없는 칸(undefined)만 채운다.
 */
function merge(saved, fallback) {
  if (!saved) return fallback;
  const out = { ...fallback };
  for (const [key, value] of Object.entries(saved)) {
    if (key === "id" || key === "updatedAt") continue;
    if (value !== undefined && value !== null) out[key] = value;
  }
  return out;
}

/** 한 덩어리만 지켜본다. */
export function useSiteDoc(id) {
  const [value, setValue] = useState(defaults[id]);

  useEffect(() => {
    setValue(defaults[id]);
    const stop = subscribeDoc(CONTENT, id, (saved) => setValue(merge(saved, defaults[id])));
    return () => {
      if (typeof stop === "function") stop();
    };
  }, [id]);

  return value;
}

export const useExecutives = () => useSiteDoc("executives");
export const useFees = () => useSiteDoc("fees");

/**
 * 지회와 지부를 함께 준다. 화면 대부분이 둘을 같이 쓰고, 합계도 둘에서 나온다.
 */
export function useBranches() {
  const branches = useSiteDoc("branches");
  const chapters = useSiteDoc("chapters");

  // 내용이 그대로면 같은 객체를 내준다. 그릴 때마다 새 객체를 만들면, 이것을
  // 지켜보는 쪽(관리자 화면의 초안)이 매번 「바뀌었다」로 읽는다.
  return useMemo(() => {
    const list = branches.list || [];
    const chapterRows = chapters.list || [];
    return {
      branches: list,
      chapters: chapterRows,
      totals: { branches: list.length, chapters: chapters.total ?? chapterRows.length },
      summary: summarize(list),
    };
  }, [branches, chapters]);
}

/**
 * 지회를 갈래별로 센다.
 *
 * 지회 명단이 바뀌면 이 숫자도 같이 바뀌어야 한다. 손으로 적어 두면 지회를
 * 하나 더한 날 합계만 예전 숫자로 남는다. 이름을 보고 가른다.
 */
export function summarize(list) {
  const counts = { 광역시: 0, 도: 0, 특별자치도: 0, 해외: 0 };
  for (const row of list) {
    const name = String(row.region || "");
    if (name === "해외") counts.해외 += 1;
    else if (/광역시|특별시/.test(name)) counts.광역시 += 1;
    // 제주도와 강원특별자치도는 특별자치도다. 행정 구역 이름이 그렇다.
    else if (/특별자치/.test(name) || name === "제주도") counts.특별자치도 += 1;
    else counts.도 += 1;
  }
  return Object.entries(counts)
    .filter(([, count]) => count > 0)
    .map(([area, count]) => ({ area, count }));
}

/** 일반회원 연회비. 회비표에서 끌어온다. */
export const generalFeeOf = (fees) =>
  (fees.rows || []).find((row) => row.role === "일반회원")?.amount ?? null;
