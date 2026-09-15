/**
 * 게시판 정의. 한 벌의 게시판 화면(목록·상세)과 관리 화면이
 * 이 표를 보고 동작한다. 게시판을 늘리려면 여기에 항목만 추가하면 된다.
 */
export const boards = {
  notice: {
    key: "notice",
    collection: "notices",
    label: "공지사항",
    path: "/community/notice",
    description: "협회의 소식과 안내 사항을 전해 드립니다.",
    categories: ["공지", "행사", "교육", "채용", "기타"],
  },
  press: {
    key: "press",
    collection: "press",
    label: "보도자료",
    path: "/community/press",
    description: "언론에 배포한 협회의 보도자료입니다.",
    categories: ["보도자료", "언론보도", "기타"],
  },
  disclosure: {
    key: "disclosure",
    collection: "disclosure",
    label: "정보공개",
    path: "/community/disclosure",
    description: "사업 계획과 결산 등 협회가 공개하는 자료입니다.",
    categories: ["사업계획", "결산", "총회자료", "기타"],
  },
  scene: {
    key: "scene",
    collection: "sceneNews",
    label: "관악계 소식",
    path: "/info/scene",
    description: "국내외 관악계의 소식을 모았습니다.",
    categories: ["국내", "해외", "학교", "기타"],
  },
  concert: {
    key: "concert",
    collection: "concertNews",
    label: "연주회 소식",
    path: "/info/concert",
    description: "회원과 단체의 연주회 소식을 안내합니다.",
    categories: ["정기연주회", "초청공연", "학교연주회", "기타"],
  },
  jobs: {
    key: "jobs",
    collection: "jobs",
    label: "일자리 정보",
    path: "/info/jobs",
    description: "관악 분야의 채용과 강사 모집 정보입니다.",
    categories: ["연주단체", "학교", "강사", "기타"],
  },
};

export const boardList = Object.values(boards);

/** 경로 앞부분으로 게시판을 찾는다. */
export const boardByPath = (path) =>
  boardList.find((board) => path === board.path || path.startsWith(`${board.path}/`));
