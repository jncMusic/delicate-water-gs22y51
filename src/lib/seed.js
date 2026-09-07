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
      id: "seed-n5",
      title: "2026년도 회비 납부 안내",
      category: "공지",
      author: "사무국",
      pinned: false,
      views: 267,
      body:
        "2026년도 연회비 납부를 안내드립니다.\n\n" +
        "· 납부 기간: 1월 2일 ~ 3월 31일\n" +
        "· 정회원 60,000원 / 준회원 30,000원 / 단체회원 200,000원\n\n" +
        "입금자명은 회원 성함(단체는 단체명)으로 해 주셔야 확인이 가능합니다. " +
        "성함과 입금자명이 다른 경우 사무국으로 미리 알려 주시기 바랍니다.",
      createdAt: iso(12),
    },
    {
      id: "seed-n6",
      title: "대한민국 관악제 객석 배부 안내",
      category: "행사",
      author: "사업부",
      pinned: false,
      views: 519,
      body:
        "대한민국 관악제 회원 초대석을 배부합니다.\n\n" +
        "· 신청 기간: 공연 3주 전까지\n" +
        "· 회원 1인당 2매까지 신청 가능\n" +
        "· 좌석은 신청 순서에 따라 배정되며, 잔여석은 일반 예매로 전환됩니다.",
      createdAt: iso(16),
    },
    {
      id: "seed-n7",
      title: "관악 교육 자료집 제7집 원고 모집",
      category: "교육",
      author: "학술부",
      pinned: false,
      views: 188,
      body:
        "관악 교육 자료집 제7집에 실을 원고를 모집합니다.\n\n" +
        "· 분야: 합주 지도 사례, 악기별 지도법, 편곡 실무, 관악 교육 연구\n" +
        "· 분량: A4 5~15매\n" +
        "· 마감: 9월 30일\n\n" +
        "채택된 원고에는 소정의 원고료를 지급합니다.",
      createdAt: iso(28),
    },
    {
      id: "seed-n8",
      title: "사무국 하계 휴무 안내",
      category: "공지",
      author: "사무국",
      pinned: false,
      views: 121,
      body: "8월 첫째 주 사무국이 휴무합니다. 급한 용무는 이메일로 남겨 주시면 순차적으로 처리해 드리겠습니다.",
      createdAt: iso(52),
    },
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
      title: "대한민국관악경연대회 참가 접수",
      category: "행사",
      author: "사업부",
      pinned: true,
      views: 1284,
      body:
        "대한민국관악경연대회 참가 신청을 받습니다.\n\n" +
        "· 접수기간: 4월 1일 ~ 4월 30일\n" +
        "· 부문: 관악합주, 목관중주, 금관중주, 독주(초·중·고·일반)\n" +
        "· 대회일정: 6월 20일 ~ 6월 22일\n\n" +
        "참가신청서 및 요강은 자료실에서 내려받으실 수 있습니다.",
      createdAt: iso(9),
    },
    {
      id: "seed-n3",
      title: "윈드앙상블 클리닉 수강생 모집",
      category: "교육",
      author: "교육부",
      pinned: false,
      views: 336,
      body:
        "현직 지도교사와 지휘자를 대상으로 하는 윈드앙상블 클리닉을 운영합니다.\n\n" +
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
      title: "대한민국관악경연대회",
      startDate: dayFromNow(75),
      location: "시립문화예술회관",
      category: "대회",
      createdAt: iso(30),
    },
    {
      id: "seed-e3",
      title: "윈드앙상블 클리닉",
      startDate: dayFromNow(130),
      location: "협회 교육관",
      category: "교육",
      createdAt: iso(30),
    },
    {
      id: "seed-e4",
      title: "대한민국 관악제",
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
      id: "seed-r5",
      title: "대한민국 관악제 프로그램 노트",
      category: "기타",
      description: "연주 곡목 해설과 작곡가 소개가 담긴 프로그램 노트입니다.",
      uploader: "사업부",
      downloads: 318,
      file: { name: "제42회_대한민국 관악제_프로그램노트.pdf", size: 2411724, type: "application/pdf", url: null },
      createdAt: iso(14),
    },
    {
      id: "seed-r6",
      title: "윈드앙상블 클리닉 신청서 및 안내문",
      category: "협회서식",
      description: "연수 과정 안내와 수강 신청 서식입니다.",
      uploader: "교육부",
      downloads: 622,
      file: { name: "윈드앙상블클리닉_신청서.hwp", size: 96256, type: "application/x-hwp", url: null },
      createdAt: iso(26),
    },
    {
      id: "seed-r7",
      title: "위촉 창작곡 악보 — 관악합주를 위한 서곡",
      category: "악보",
      description: "대한민국 관악제에서 초연한 위촉곡의 총보와 파트보입니다.",
      uploader: "학술부",
      downloads: 447,
      file: { name: "관악합주를_위한_서곡_총보.pdf", size: 8912896, type: "application/pdf", url: null },
      createdAt: iso(35),
    },
    {
      id: "seed-r8",
      title: "2026년도 정기총회 자료집",
      category: "회의자료",
      description: "사업 보고, 결산, 안건 자료를 묶은 총회 자료집입니다.",
      uploader: "사무국",
      downloads: 203,
      file: { name: "2026_정기총회_자료집.pdf", size: 4194304, type: "application/pdf", url: null },
      createdAt: iso(30),
    },
    {
      id: "seed-r9",
      title: "증명서 발급 신청서",
      category: "협회서식",
      description: "회원 확인서·연주 실적 확인서 등 증명서 발급 신청 서식입니다.",
      uploader: "사무국",
      downloads: 289,
      file: { name: "증명서_발급신청서.hwp", size: 72704, type: "application/x-hwp", url: null },
      createdAt: iso(110),
    },
    {
      id: "seed-r1",
      title: "대한민국관악경연대회 요강 및 참가신청서",
      category: "대회요강",
      description: "참가 부문, 지정곡, 심사 기준과 신청 서식이 포함되어 있습니다.",
      uploader: "사업부",
      downloads: 872,
      file: { name: "대한민국관악경연대회_요강.pdf", size: 1843200, type: "application/pdf", url: null },
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
      title: "2026 대한민국관악경연대회",
      subtitle: "접수 4월 1일(수) ~ 4월 30일(목) 16:00",
      caption: "주최 한국관악협회 · 대한민국관악경연대회 조직위원회",
      linkPath: "/community/notice",
      tone: "duo",
      image: null,
      order: 1,
      createdAt: iso(10),
    },
    {
      id: "seed-b2",
      title: "대한민국 관악제",
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
      title: "윈드앙상블 클리닉 수강생 모집",
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
      id: "seed-p3",
      title: "대한민국 관악제, 창작 관악곡 3곡 초연",
      category: "보도자료",
      author: "홍보부",
      pinned: false,
      views: 143,
      body:
        "한국관악협회가 대한민국 관악제에서 위촉 창작 관악곡 3곡을 초연했다.\n\n" +
        "협회는 매년 국내 작곡가에게 관악 합주곡을 위촉해 초연 무대를 마련하고 있으며, " +
        "초연된 작품은 악보로 정리해 자료실에 공개한다.",
      createdAt: iso(20),
    },
    {
      id: "seed-p4",
      title: "학교 관악부 실태 조사, 지도교사 부족이 최대 과제",
      category: "보도자료",
      author: "학술부",
      pinned: false,
      views: 205,
      body:
        "협회가 전국 초·중·고 관악부를 대상으로 실시한 실태 조사 결과, " +
        "운영상 가장 큰 어려움으로 '지도교사 확보'가 꼽혔다.\n\n" +
        "협회는 조사 결과를 바탕으로 지도자 연수 정원을 늘리고 " +
        "지역별 순회 클리닉을 확대할 계획이다.",
      createdAt: iso(55),
    },
    {
      id: "seed-p5",
      title: "창립 40주년 기념 사업 추진 계획 발표",
      category: "언론보도",
      author: "홍보부",
      pinned: false,
      views: 176,
      body: "협회는 창립 40주년을 맞아 기념 연주회, 사료집 발간, 청소년 장학 사업을 추진한다고 밝혔다.",
      createdAt: iso(88),
    },
    {
      id: "seed-p1",
      title: "한국관악협회, 대한민국관악경연대회 개최",
      category: "보도자료",
      author: "홍보부",
      pinned: false,
      views: 92,
      body:
        "한국관악협회는 오는 6월 대한민국관악경연대회를 개최한다고 밝혔다.\n\n" +
        "올해 대회는 관악합주, 목관중주, 금관중주, 독주 네 개 부문으로 나뉘어 진행되며 " +
        "초등부부터 일반부까지 참가할 수 있다.",
      createdAt: iso(9),
    },
    {
      id: "seed-p2",
      title: "윈드앙상블 클리닉, 올해로 10년째",
      category: "언론보도",
      author: "홍보부",
      pinned: false,
      views: 61,
      body:
        "협회가 운영하는 윈드앙상블 클리닉가 올해로 10년째를 맞았다.\n\n" +
        "그동안 400여 명의 지도교사와 지휘자가 과정을 수료했다.",
      createdAt: iso(40),
    },
  ],

  disclosure: [
    {
      id: "seed-d3",
      title: "2026년도 예산서",
      category: "사업계획",
      author: "사무국",
      pinned: false,
      views: 97,
      body: "2026년도 세입·세출 예산 내역입니다. 정기총회 의결을 거쳐 확정되었습니다.",
      createdAt: iso(24),
    },
    {
      id: "seed-d4",
      title: "2026년도 정기총회 회의록",
      category: "총회자료",
      author: "사무국",
      pinned: false,
      views: 112,
      body: "2026년도 정기총회 안건별 심의 결과와 의결 사항을 정리한 회의록입니다.",
      createdAt: iso(30),
    },
    {
      id: "seed-d5",
      title: "이사회 운영 규정",
      category: "총회자료",
      author: "사무국",
      pinned: false,
      views: 64,
      body: "이사회의 소집, 의결 정족수, 안건 처리 절차를 정한 내부 규정입니다.",
      createdAt: iso(140),
    },
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
      id: "seed-s3",
      title: "○○시, 관내 학교 관악부 악기 지원 사업 공고",
      category: "국내",
      author: "사무국",
      pinned: false,
      views: 336,
      body: "관내 초·중·고 관악부를 대상으로 악기 구입비를 지원하는 사업이 공고되었습니다. 신청 자격과 기한을 확인해 주세요.",
      createdAt: iso(8),
    },
    {
      id: "seed-s4",
      title: "세계관악협회(WASBE) 총회 참가 보고",
      category: "해외",
      author: "사업부",
      pinned: false,
      views: 152,
      body: "협회 대표단이 참석한 세계관악협회 총회의 주요 논의 내용과 국내 적용 방안을 정리했습니다.",
      createdAt: iso(48),
    },
    {
      id: "seed-s5",
      title: "○○예술고등학교, 전국 대회 3년 연속 대상",
      category: "학교",
      author: "홍보부",
      pinned: false,
      views: 421,
      body: "학교 관악부의 연습 운영 방식과 파트별 지도 사례를 함께 소개합니다.",
      createdAt: iso(70),
    },
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
      id: "seed-c3",
      title: "한국관악합주단 창단 기념 연주회",
      category: "초청공연",
      author: "홍보부",
      pinned: false,
      views: 264,
      body: "협회 산하 한국관악합주단의 기념 연주회입니다. 회원은 초대석을 신청하실 수 있습니다.",
      createdAt: iso(11),
    },
    {
      id: "seed-c4",
      title: "○○시립교향악단 관악 앙상블 대한민국 관악제",
      category: "대한민국 관악제",
      author: "홍보부",
      pinned: false,
      views: 118,
      body: "목관·금관 앙상블 편성으로 진행되는 무대입니다.",
      createdAt: iso(38),
    },
    {
      id: "seed-c5",
      title: "회원 연주회 소식을 알려 주세요",
      category: "기타",
      author: "홍보부",
      pinned: true,
      views: 302,
      body:
        "회원이 참여하는 연주회 소식을 홈페이지에 게재해 드립니다.\n\n" +
        "공연명, 일시, 장소, 프로그램, 문의처를 사무국 이메일로 보내 주시면 " +
        "확인 후 연주회 소식란에 올려 드립니다.",
      createdAt: iso(95),
    },
    {
      id: "seed-c1",
      title: "○○윈드오케스트라 대한민국 관악제",
      category: "대한민국 관악제",
      author: "홍보부",
      pinned: false,
      views: 133,
      body: "일시 · 장소 · 프로그램은 본문에서 확인하실 수 있습니다.",
      createdAt: iso(6),
    },
    {
      id: "seed-c2",
      title: "○○중학교 관악부 대한민국 관악제",
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
      id: "seed-j3",
      title: "○○윈드오케스트라 상임지휘자 초빙",
      category: "연주단체",
      author: "사무국",
      pinned: false,
      views: 356,
      body: "임기, 처우, 제출 서류는 본문을 확인해 주세요.",
      createdAt: iso(10),
    },
    {
      id: "seed-j4",
      title: "○○중학교 관악부 파트 강사 모집 (목관)",
      category: "강사",
      author: "사무국",
      pinned: false,
      views: 244,
      body: "플루트·클라리넷·색소폰 파트 강사를 모집합니다. 주 1회 출강 기준입니다.",
      createdAt: iso(22),
    },
    {
      id: "seed-j5",
      title: "채용 정보 게재 안내",
      category: "기타",
      author: "사무국",
      pinned: true,
      views: 179,
      body:
        "관악 분야 채용·강사 모집 정보를 무료로 게재해 드립니다.\n\n" +
        "모집 기관, 모집 분야, 자격 요건, 접수 기간, 문의처를 사무국으로 보내 주세요. " +
        "확인 후 게재하며, 마감된 공고는 순차적으로 내립니다.",
      createdAt: iso(150),
    },
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
