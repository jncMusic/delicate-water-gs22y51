/**
 * 데모(로컬) 모드에서 화면을 채우기 위한 예시 데이터.
 * Firebase 를 연결하면 이 데이터는 사용되지 않는다.
 */

const iso = (daysAgo) =>
  new Date(Date.now() - daysAgo * 86400000).toISOString();

/** 예시 일정이 항상 '다가오는 행사'로 보이도록 오늘 기준으로 계산한다. */
const dayFromNow = (days) =>
  new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);

export const seedData = {
  notices: [
    {
      id: "seed-n1",
      title: "2026년도 정기총회 개최 안내",
      category: "공지",
      author: "사무국",
      pinned: true,
      views: 412,
      body:
        "한국관악협회 2026년도 정기총회를 아래와 같이 개최합니다.\n\n" +
        "· 일시: 2026년 3월 14일(토) 오후 2시\n" +
        "· 장소: 협회 대강당\n" +
        "· 안건: 2025년도 사업 및 결산 보고, 2026년도 사업계획 및 예산 승인, 임원 개선\n\n" +
        "정회원께서는 참석 여부를 3월 7일까지 사무국으로 회신하여 주시기 바랍니다.",
      createdAt: iso(3),
    },
    {
      id: "seed-n2",
      title: "제18회 전국관악경연대회 참가 접수",
      category: "행사",
      author: "사업부",
      pinned: true,
      views: 1284,
      body:
        "제18회 전국관악경연대회 참가 신청을 받습니다.\n\n" +
        "· 접수기간: 4월 1일 ~ 4월 30일\n" +
        "· 부문: 관악합주, 목관중주, 금관중주, 독주(초·중·고·일반)\n" +
        "· 대회일정: 6월 20일 ~ 6월 22일\n\n" +
        "참가신청서 및 요강은 자료실에서 내려받으실 수 있습니다.",
      createdAt: iso(9),
    },
    {
      id: "seed-n3",
      title: "관악 지도자 연수 프로그램 수강생 모집",
      category: "교육",
      author: "교육부",
      pinned: false,
      views: 336,
      body:
        "현직 지도교사와 지휘자를 대상으로 하는 관악 지도자 연수 프로그램을 운영합니다.\n\n" +
        "· 과정: 합주 지도법, 관악 편곡 실습, 악기별 주법 클리닉\n" +
        "· 기간: 7월 셋째 주 (4일 과정)\n" +
        "· 정원: 40명 (선착순)\n\n" +
        "수료자에게는 협회장 명의의 수료증이 발급됩니다.",
      createdAt: iso(21),
    },
    {
      id: "seed-n4",
      title: "협회 사무국 이전 안내",
      category: "공지",
      author: "사무국",
      pinned: false,
      views: 198,
      body:
        "협회 사무국이 아래 주소로 이전하였음을 알려드립니다. 전화번호와 팩스번호는 변경되지 않습니다.\n\n" +
        "방문 전 사무국으로 미리 연락 주시면 감사하겠습니다.",
      createdAt: iso(45),
    },
  ],

  events: [
    {
      id: "seed-e1",
      title: "2026 정기총회",
      startDate: dayFromNow(21),
      location: "협회 대강당",
      category: "총회",
      createdAt: iso(30),
    },
    {
      id: "seed-e2",
      title: "제18회 전국관악경연대회",
      startDate: dayFromNow(75),
      location: "시립문화예술회관",
      category: "대회",
      createdAt: iso(30),
    },
    {
      id: "seed-e3",
      title: "관악 지도자 연수",
      startDate: dayFromNow(130),
      location: "협회 교육관",
      category: "교육",
      createdAt: iso(30),
    },
    {
      id: "seed-e4",
      title: "제42회 정기연주회",
      startDate: dayFromNow(210),
      location: "예술의전당 콘서트홀",
      category: "연주회",
      createdAt: iso(30),
    },
    {
      id: "seed-e5",
      title: "청소년 관악 캠프 (동계)",
      startDate: dayFromNow(-45),
      location: "협회 교육관",
      category: "교육",
      createdAt: iso(90),
    },
  ],

  resources: [
    {
      id: "seed-r1",
      title: "제18회 전국관악경연대회 요강 및 참가신청서",
      category: "대회요강",
      description: "참가 부문, 지정곡, 심사 기준과 신청 서식이 포함되어 있습니다.",
      uploader: "사업부",
      downloads: 872,
      file: { name: "제18회_전국관악경연대회_요강.pdf", size: 1843200, type: "application/pdf", url: null },
      createdAt: iso(9),
    },
    {
      id: "seed-r2",
      title: "협회 정관 (2025년 개정)",
      category: "협회서식",
      description: "2025년 정기총회에서 의결된 개정 정관 전문입니다.",
      uploader: "사무국",
      downloads: 245,
      file: { name: "한국관악협회_정관_2025개정.pdf", size: 512000, type: "application/pdf", url: null },
      createdAt: iso(120),
    },
    {
      id: "seed-r3",
      title: "회원 가입신청서 서식",
      category: "협회서식",
      description: "정회원·준회원·단체회원 가입신청서 통합 서식입니다.",
      uploader: "사무국",
      downloads: 531,
      file: { name: "회원가입신청서.hwp", size: 87040, type: "application/x-hwp", url: null },
      createdAt: iso(200),
    },
    {
      id: "seed-r4",
      title: "관악합주 기초 지도 자료집",
      category: "교육자료",
      description: "초·중등 관악부 지도교사를 위한 합주 기초 지도안입니다.",
      uploader: "교육부",
      downloads: 1408,
      file: { name: "관악합주_기초지도_자료집.pdf", size: 6291456, type: "application/pdf", url: null },
      createdAt: iso(60),
    },
  ],

  banners: [
    {
      id: "seed-b1",
      title: "2026 제18회 전국관악경연대회",
      subtitle: "접수 4월 1일(수) ~ 4월 30일(목) 16:00",
      caption: "주최 한국관악협회 · 전국관악경연대회 조직위원회",
      linkPath: "/community/notice",
      tone: "duo",
      image: null,
      order: 1,
      createdAt: iso(10),
    },
    {
      id: "seed-b2",
      title: "제42회 정기연주회",
      subtitle: "2026년 11월 7일(토) 오후 7시 · 예술의전당 콘서트홀",
      caption: "위촉 창작 관악곡 초연 무대",
      linkPath: "/events/schedule",
      tone: "gold",
      image: null,
      order: 2,
      createdAt: iso(12),
    },
    {
      id: "seed-b3",
      title: "관악 지도자 연수 수강생 모집",
      subtitle: "7월 셋째 주 4일 과정 · 정원 40명 선착순",
      caption: "수료자에게 협회장 명의 수료증 발급",
      linkPath: "/events/programs",
      tone: "deep",
      image: null,
      order: 3,
      createdAt: iso(14),
    },
  ],

  press: [
    {
      id: "seed-p1",
      title: "한국관악협회, 제18회 전국관악경연대회 개최",
      category: "보도자료",
      author: "홍보부",
      pinned: false,
      views: 92,
      body:
        "한국관악협회는 오는 6월 제18회 전국관악경연대회를 개최한다고 밝혔다.\n\n" +
        "올해 대회는 관악합주, 목관중주, 금관중주, 독주 네 개 부문으로 나뉘어 진행되며 " +
        "초등부부터 일반부까지 참가할 수 있다.",
      createdAt: iso(9),
    },
    {
      id: "seed-p2",
      title: "관악 지도자 연수, 올해로 10년째",
      category: "언론보도",
      author: "홍보부",
      pinned: false,
      views: 61,
      body:
        "협회가 운영하는 관악 지도자 연수가 올해로 10년째를 맞았다.\n\n" +
        "그동안 400여 명의 지도교사와 지휘자가 과정을 수료했다.",
      createdAt: iso(40),
    },
  ],

  disclosure: [
    {
      id: "seed-d1",
      title: "2026년도 사업계획서",
      category: "사업계획",
      author: "사무국",
      pinned: true,
      views: 145,
      body: "2026년도 사업계획 요약입니다. 전문은 자료실에서 내려받으실 수 있습니다.",
      createdAt: iso(20),
    },
    {
      id: "seed-d2",
      title: "2025년도 결산 보고",
      category: "결산",
      author: "사무국",
      pinned: false,
      views: 88,
      body: "2025년도 수입·지출 결산 내역입니다. 정기총회에서 승인되었습니다.",
      createdAt: iso(160),
    },
  ],

  sceneNews: [
    {
      id: "seed-s1",
      title: "전국 학교 관악부 실태 조사 결과 발표",
      category: "국내",
      author: "학술부",
      pinned: false,
      views: 210,
      body: "전국 초·중·고 관악부를 대상으로 진행한 실태 조사 결과를 공유합니다.",
      createdAt: iso(15),
    },
    {
      id: "seed-s2",
      title: "아시아 관악 페스티벌 참가단 모집",
      category: "해외",
      author: "사업부",
      pinned: false,
      views: 174,
      body: "올해 아시아 관악 페스티벌에 파견할 참가단을 모집합니다.",
      createdAt: iso(33),
    },
  ],

  concertNews: [
    {
      id: "seed-c1",
      title: "○○윈드오케스트라 정기연주회",
      category: "정기연주회",
      author: "홍보부",
      pinned: false,
      views: 133,
      body: "일시 · 장소 · 프로그램은 본문에서 확인하실 수 있습니다.",
      createdAt: iso(6),
    },
    {
      id: "seed-c2",
      title: "○○중학교 관악부 정기연주회",
      category: "학교연주회",
      author: "홍보부",
      pinned: false,
      views: 77,
      body: "학교 관악부의 한 해 성과를 선보이는 무대입니다.",
      createdAt: iso(25),
    },
  ],

  jobs: [
    {
      id: "seed-j1",
      title: "○○시립교향악단 트럼펫 단원 모집",
      category: "연주단체",
      author: "사무국",
      pinned: false,
      views: 402,
      body: "모집 인원, 응시 자격, 지정곡은 본문을 확인해 주세요.",
      createdAt: iso(5),
    },
    {
      id: "seed-j2",
      title: "○○예술고등학교 관악 강사 채용",
      category: "학교",
      author: "사무국",
      pinned: false,
      views: 288,
      body: "주 2회 출강 기준이며 자세한 조건은 본문에 있습니다.",
      createdAt: iso(18),
    },
  ],

  members: [
    {
      id: "seed-m1",
      name: "김관악",
      memberType: "정회원",
      instrument: "트럼펫",
      affiliation: "○○예술고등학교",
      position: "지도교사",
      email: "example1@example.com",
      phone: "010-0000-0001",
      region: "서울",
      status: "승인",
      note: "",
      createdAt: iso(300),
    },
    {
      id: "seed-m2",
      name: "이플루트",
      memberType: "정회원",
      instrument: "플루트",
      affiliation: "○○시립교향악단",
      position: "단원",
      email: "example2@example.com",
      phone: "010-0000-0002",
      region: "경기",
      status: "승인",
      note: "",
      createdAt: iso(180),
    },
    {
      id: "seed-m3",
      name: "박클라",
      memberType: "준회원",
      instrument: "클라리넷",
      affiliation: "○○대학교 음악학과",
      position: "재학생",
      email: "example3@example.com",
      phone: "010-0000-0003",
      region: "부산",
      status: "대기",
      note: "",
      createdAt: iso(4),
    },
    {
      id: "seed-m4",
      name: "○○중학교 관악부",
      memberType: "단체회원",
      instrument: "관악합주",
      affiliation: "○○중학교",
      position: "단체",
      email: "example4@example.com",
      phone: "02-000-0004",
      region: "인천",
      status: "대기",
      note: "단원 48명",
      createdAt: iso(1),
    },
  ],
};
