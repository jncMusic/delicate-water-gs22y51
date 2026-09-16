/**
 * 검색엔진과 공유 카드에 쓰는 화면별 제목·설명.
 *
 * 한 곳에 모아 두는 이유는 두 군데에서 같은 값을 써야 하기 때문이다.
 * - 빌드할 때: scripts/prerender.js 가 화면마다 진짜 HTML 파일을 만들며 넣는다.
 * - 볼 때: App.js 가 주소가 바뀔 때마다 <title> 과 설명을 갈아 끼운다.
 *
 * 설명은 화면마다 달라야 한다. 모든 쪽이 같은 설명을 달고 있으면 검색엔진이
 * 같은 내용의 쪽이 여럿이라고 보고 하나만 남긴다.
 */
import { boardByPath } from "./boards";
import { findMenu, org } from "./site";

/** 화면별 설명. 여기에 없는 주소는 협회 기본 설명을 쓴다. */
const DESCRIPTIONS = {
  "/":
    "한국관악협회(KBA) 공식 홈페이지입니다. 1973년 창설 이래 대한민국 관악경연대회와 " +
    "관악콩쿠르를 주최하고 관악 페스티벌을 열며, 전국 14개 지회와 함께 관악 음악의 저변을 넓히고 있습니다.",

  "/about/overview":
    "한국관악협회 소개. 1973년 창설, 명칭·목적·주요 활동과 전국 14개 지회, " +
    "국내사업본부·국제사업본부 구성을 안내합니다.",
  "/about/intro": "한국관악협회 이사장 인사말입니다.",
  "/about/history": "한국관악협회 연혁. 1973년 창설 이후 걸어온 길을 연도별로 정리했습니다.",
  "/about/chairs": "한국관악협회 역대 회장 명단입니다.",
  "/about/organization":
    "한국관악협회 조직도. 이사장·부이사장·감사·사무총장·사무국과 공연사업부, " +
    "국내사업본부·국제사업본부, 지회로 이어지는 구성을 보여 드립니다.",
  "/about/executives":
    "한국관악협회 임원 소개. 이사장·부이사장·감사·법률자문위원과 이사·전문이사·고문·자문위원 명단입니다.",
  "/about/bylaws": "한국관악협회 정관 전문입니다.",
  "/about/ci": "한국관악협회 CI(엠블럼·로고) 내려받기 안내입니다.",
  "/about/location":
    `한국관악협회 사무국 오시는 길. ${org.address}, 대표전화 ${org.phone}.`,

  "/events/programs":
    "한국관악협회 주요 사업. 대한민국 관악제, 관악 페스티벌, 대한민국 관악경연대회, " +
    "대한민국 관악콩쿠르, 학술제와 국제 교류 사업을 안내합니다.",
  "/events/schedule": "한국관악협회가 여는 행사의 일정을 안내합니다.",

  "/members/guide": "한국관악협회 회원 안내. 회원 구분과 권리, 회비와 가입 절차를 안내합니다.",
  "/members/apply": "한국관악협회 정회원·준회원 가입 신청 안내입니다.",
  "/members/branches": "한국관악협회 전국 지회 14곳과 지부 7곳의 현황입니다.",

  "/policy/terms": "한국관악협회 홈페이지 서비스 이용약관입니다.",
  "/policy/privacy": "한국관악협회 개인정보 처리방침입니다.",
  "/policy/email": "한국관악협회 이메일 주소 무단수집을 거부합니다.",
};

/** 주소에 맞는 문서 제목. 브라우저 탭·방문 기록·검색 결과에 쓰인다. */
export function titleFor(path) {
  if (path === "/") return `${org.name} (${org.abbr}) | ${org.nameEn} 공식 홈페이지`;

  const found = findMenu(path);
  if (found) return `${found.child.label} | ${org.name}`;

  const board = boardByPath(path);
  if (board) return `${board.label} | ${org.name}`;

  if (path === "/admin") return `관리자 | ${org.name}`;
  return org.name;
}

/** 주소에 맞는 설명 한 줄. */
export function descriptionFor(path) {
  const fixed = DESCRIPTIONS[path];
  if (fixed) return fixed;

  // 게시판은 정의에 이미 한 줄 설명이 있다. 협회 이름을 앞에 붙여 쪽마다 달라지게 한다.
  const board = boardByPath(path);
  if (board) return `${org.name} ${board.label}. ${board.description}`;

  return org.description;
}

/** 프리렌더와 화면이 함께 쓰는 한 벌. */
export function seoFor(path) {
  return { title: titleFor(path), description: descriptionFor(path) };
}
