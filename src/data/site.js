/**
 * 홈페이지에 표시되는 고정 문구·조직 정보를 한곳에 모아 둔 파일.
 * 아래 내용은 화면 구성을 보여주기 위한 예시이므로,
 * 협회 실제 정보로 바꿔서 사용하세요.
 */

export const org = {
  name: "한국관악협회",
  fullName: "사단법인 한국관악협회",
  nameEn: "The Wind Music Association of Korea",
  abbr: "KWAK",  // 서브페이지 제목 위에 붙는 영문 약칭

  slogan: "관악으로 이어지는 사람과 무대",
  founded: "1982년",
  description:
    "한국관악협회는 관악 음악의 저변 확대와 연주·교육 수준의 향상을 위해 활동하는 비영리 예술단체입니다.",
  address: "서울특별시 ○○구 ○○로 00, 3층 (우 00000)",
  phone: "02-000-0000",
  fax: "02-000-0001",
  email: "office@example.or.kr",
  hours: "평일 09:00 - 18:00 (점심 12:00 - 13:00 / 주말·공휴일 휴무)",
  bank: "○○은행 000-000000-00-000 (예금주: 한국관악협회)",
  registration: "고유번호 000-00-00000 · 문화체육관광부 소관 사단법인",
};

/* ────────────────────────────── 내비게이션 ────────────────────────────── */

/** 대메뉴 5개 + 각 소메뉴. path 는 해시 라우터 경로. */
export const menus = [
  {
    label: "협회소개",
    children: [
      { label: "사단법인 한국관악협회", path: "/about/overview" },
      { label: "이사장 인사말", path: "/about/intro" },
      { label: "협회 연혁", path: "/about/history" },
      { label: "역대 이사장", path: "/about/chairs" },
      { label: "조직도", path: "/about/organization" },
      { label: "임원 소개", path: "/about/executives" },
      { label: "정관", path: "/about/bylaws" },
      { label: "CI 다운로드", path: "/about/ci" },
      { label: "오시는 길", path: "/about/location" },
    ],
  },
  {
    label: "협회행사",
    children: [
      { label: "주요 사업", path: "/events/programs" },
      { label: "행사일정", path: "/events/schedule" },
    ],
  },
  {
    label: "회원/단체",
    children: [
      { label: "회원 안내", path: "/members/guide" },
      { label: "가입 신청", path: "/members/apply" },
      { label: "지회·지부", path: "/members/branches" },
      { label: "산하단체", path: "/members/affiliates" },
    ],
  },
  {
    label: "관악정보",
    children: [
      { label: "관악계 소식", path: "/info/scene" },
      { label: "연주회 소식", path: "/info/concert" },
      { label: "자료실", path: "/info/resources" },
      { label: "일자리 정보", path: "/info/jobs" },
    ],
  },
  {
    label: "커뮤니티",
    children: [
      { label: "공지사항", path: "/community/notice" },
      { label: "보도자료", path: "/community/press" },
      { label: "정보공개", path: "/community/disclosure" },
    ],
  },
];

/** 좌측 사이드바 레이아웃을 쓰는 '회원정보' 영역(주로 푸터에서 진입). */
export const memberSideMenu = {
  label: "회원정보",
  children: [
    { label: "정/준회원 가입신청", path: "/members/apply" },
    { label: "서비스 이용약관", path: "/policy/terms" },
    { label: "개인정보 처리방침", path: "/policy/privacy" },
    { label: "이메일 무단수집 거부", path: "/policy/email" },
  ],
};

/** 대메뉴의 대표 경로(= 첫 소메뉴). */
export const menuHome = (menu) => menu.children[0].path;

/** 경로가 속한 대메뉴와 소메뉴를 찾는다. 못 찾으면 null. */
export function findMenu(path) {
  for (const group of [...menus, memberSideMenu]) {
    const child = group.children.find(
      (item) => path === item.path || path.startsWith(`${item.path}/`)
    );
    if (child) return { group, child };
  }
  return null;
}

/* ────────────────────────────── 협회 소개 ────────────────────────────── */

export const greeting = {
  signature: "사단법인 한국관악협회 이사장  ○ ○ ○",
  paragraphs: [
    "한국관악협회 홈페이지를 찾아주신 여러분을 진심으로 환영합니다.",
    "우리 협회는 관악 음악을 사랑하는 연주자와 지도자, 그리고 학생들이 함께 성장할 수 있는 터전을 만들기 위해 노력해 왔습니다. 전국 규모의 경연대회와 정기연주회를 통해 무대를 넓히고, 지도자 연수와 학술 활동을 통해 현장의 교육 역량을 다져 왔습니다.",
    "관악은 혼자서 완성되지 않는 음악입니다. 서로 다른 음색이 하나의 호흡으로 모일 때 비로소 소리가 됩니다. 협회 또한 회원 한 분 한 분의 참여로 만들어집니다.",
    "앞으로도 협회는 회원 여러분의 목소리에 귀 기울이며, 관악 음악의 저변을 넓히는 일에 최선을 다하겠습니다. 여러분의 관심과 참여를 부탁드립니다.",
  ],
};

export const overview = {
  purpose:
    "관악 음악의 보급과 발전을 도모하고, 회원 상호 간의 친목과 연구 활동을 통하여 국민 음악 문화 향상에 이바지한다.",
  facts: [
    { label: "법인명", value: "사단법인 한국관악협회" },
    { label: "설립", value: "1982년" },
    { label: "법인 등록", value: "고유번호 000-00-00000" },
    { label: "주무관청", value: "문화체육관광부" },
    { label: "회원 규모", value: "정회원 약 0,000명 · 단체회원 약 000개 단체" },
    { label: "조직", value: "17개 시·도 지회 및 지부, 산하 5개 단체" },
  ],
  activities: [
    "전국 규모 관악 경연대회 주최",
    "협회 정기연주회 및 초청 공연 기획",
    "관악 지도자 연수와 청소년 관악 캠프 운영",
    "관악 교육 자료 발간 및 학술 세미나 개최",
    "국내외 관악 단체와의 교류 협력",
  ],
};

export const missions = [
  { title: "연주 활동", body: "정기연주회와 초청 공연을 통해 관악 합주의 예술적 성취를 무대에서 선보입니다." },
  { title: "경연·시상", body: "전국관악경연대회를 열어 학생과 일반 연주자에게 실력을 겨루고 성장할 기회를 제공합니다." },
  { title: "교육·연수", body: "지도교사와 지휘자를 위한 연수 과정을 운영하여 현장의 지도 역량을 높입니다." },
  { title: "학술·자료", body: "관악 교육 자료와 악보·연구 성과를 정리하여 회원에게 공유합니다." },
];

export const history = [
  {
    period: "2020년대",
    items: [
      { year: "2025", text: "정관 개정 및 회원 관리 체계 정비" },
      { year: "2023", text: "온라인 관악 교육 자료실 개설" },
      { year: "2021", text: "제35회 정기연주회 개최" },
    ],
  },
  {
    period: "2010년대",
    items: [
      { year: "2018", text: "전국관악경연대회 참가 규모 200개 단체 돌파" },
      { year: "2015", text: "관악 지도자 연수 프로그램 정례화" },
      { year: "2012", text: "창립 30주년 기념 연주회 개최" },
    ],
  },
  {
    period: "1980-2000년대",
    items: [
      { year: "2004", text: "청소년 관악 캠프 신설" },
      { year: "1995", text: "제1회 전국관악경연대회 개최" },
      { year: "1982", text: "한국관악협회 창립" },
    ],
  },
];

/** 역대 이사장. 현직은 current: true. */
export const pastChairs = [
  { order: "제10대", name: "○ ○ ○", term: "2024 - 현재", current: true },
  { order: "제9대", name: "○ ○ ○", term: "2021 - 2024" },
  { order: "제8대", name: "○ ○ ○", term: "2018 - 2021" },
  { order: "제7대", name: "○ ○ ○", term: "2015 - 2018" },
  { order: "제6대", name: "○ ○ ○", term: "2012 - 2015" },
  { order: "제5대", name: "○ ○ ○", term: "2009 - 2012" },
  { order: "제4대", name: "○ ○ ○", term: "2006 - 2009" },
  { order: "제3대", name: "○ ○ ○", term: "2000 - 2006" },
  { order: "제2대", name: "○ ○ ○", term: "1992 - 2000" },
  { order: "제1대", name: "○ ○ ○", term: "1982 - 1992" },
];

/** 임원 소개. group 별로 묶어서 보여준다. */
export const executives = [
  {
    group: "이사장",
    people: [{ role: "이사장", name: "○ ○ ○", affiliation: "○○대학교 관악과 교수" }],
  },
  {
    group: "부이사장",
    people: [
      { role: "부이사장", name: "○ ○ ○", affiliation: "○○시립교향악단 지휘자" },
      { role: "부이사장", name: "○ ○ ○", affiliation: "○○예술고등학교 교장" },
    ],
  },
  {
    group: "이사",
    people: [
      { role: "이사", name: "○ ○ ○", affiliation: "○○대학교 교수" },
      { role: "이사", name: "○ ○ ○", affiliation: "○○윈드오케스트라 상임지휘자" },
      { role: "이사", name: "○ ○ ○", affiliation: "○○중학교 관악부 지도교사" },
      { role: "이사", name: "○ ○ ○", affiliation: "○○음악원 원장" },
      { role: "이사", name: "○ ○ ○", affiliation: "프리랜서 연주자" },
      { role: "이사", name: "○ ○ ○", affiliation: "○○시립예술단 단원" },
    ],
  },
  {
    group: "감사",
    people: [
      { role: "감사", name: "○ ○ ○", affiliation: "공인회계사" },
      { role: "감사", name: "○ ○ ○", affiliation: "○○대학교 교수" },
    ],
  },
];

export const organization = {
  top: { role: "이사장", name: "○ ○ ○" },
  second: [
    { role: "부이사장", name: "2인" },
    { role: "이사회", name: "이사 12인" },
    { role: "감사", name: "2인" },
  ],
  office: { role: "사무국장", name: "○ ○ ○" },
  departments: [
    { name: "사무국", duties: ["회원 관리", "총회·이사회 운영", "회계 및 문서 관리"] },
    { name: "사업부", duties: ["전국관악경연대회", "정기연주회", "초청 공연 기획"] },
    { name: "교육부", duties: ["지도자 연수", "청소년 관악 캠프", "악기별 클리닉"] },
    { name: "학술부", duties: ["관악 교육 자료 발간", "세미나 운영", "자료실 관리"] },
    { name: "홍보부", duties: ["홈페이지·소식지 운영", "언론 홍보", "후원 협력"] },
  ],
};

export const bylaws = [
  {
    chapter: "제1장 총칙",
    articles: [
      { no: "제1조 (명칭)", text: "본회는 사단법인 한국관악협회(이하 “본회”라 한다)라 칭한다." },
      {
        no: "제2조 (목적)",
        text: "본회는 관악 음악의 보급과 발전을 도모하고, 회원 상호 간의 친목과 연구 활동을 통하여 국민 음악 문화 향상에 이바지함을 목적으로 한다.",
      },
      { no: "제3조 (사무소)", text: "본회의 사무소는 서울특별시에 두며, 필요에 따라 지회 및 지부를 둘 수 있다." },
    ],
  },
  {
    chapter: "제2장 사업",
    articles: [
      {
        no: "제4조 (사업)",
        text: "본회는 목적을 달성하기 위하여 연주회 개최, 경연대회 운영, 지도자 연수, 학술 연구 및 자료 발간, 그 밖에 목적 달성에 필요한 사업을 수행한다.",
      },
    ],
  },
  {
    chapter: "제3장 회원",
    articles: [
      { no: "제5조 (회원의 구분)", text: "본회의 회원은 정회원, 준회원, 단체회원, 명예회원으로 구분한다." },
      { no: "제6조 (가입)", text: "회원이 되고자 하는 자는 소정의 가입신청서를 제출하고 이사회의 승인을 받아야 한다." },
      {
        no: "제7조 (권리와 의무)",
        text: "정회원은 총회에서 의결권을 가지며, 모든 회원은 회비 납부와 본회 규정 준수의 의무를 진다.",
      },
    ],
  },
  {
    chapter: "제4장 임원",
    articles: [
      { no: "제8조 (임원의 구성)", text: "본회에 이사장 1인, 부이사장 약간 인, 이사 및 감사 2인을 둔다." },
      { no: "제9조 (임기)", text: "임원의 임기는 3년으로 하며 연임할 수 있다." },
    ],
  },
];

export const bylawsNote =
  "위 조문은 홈페이지 구성 예시입니다. 실제 정관 전문은 자료실에서 내려받으실 수 있습니다.";

/* ────────────────────────────── 협회 행사 ────────────────────────────── */

export const programs = [
  {
    name: "전국관악경연대회",
    period: "매년 6월",
    summary: "초·중·고 및 일반부를 대상으로 관악합주, 목관·금관 중주, 독주 부문의 경연을 진행합니다.",
    details: ["참가 접수: 4월 1일 ~ 4월 30일", "부문: 관악합주 / 목관중주 / 금관중주 / 독주", "시상: 대상, 금·은·동상, 지도자상"],
  },
  {
    name: "정기연주회",
    period: "매년 11월",
    summary: "협회 소속 연주자와 초청 지휘자가 함께하는 대표 무대로, 위촉 창작곡을 함께 소개합니다.",
    details: ["연 1회 정기 공연", "위촉 창작 관악곡 초연", "회원 초대석 운영"],
  },
  {
    name: "관악 지도자 연수",
    period: "매년 7월",
    summary: "현직 지도교사와 지휘자를 대상으로 합주 지도법과 악기별 주법을 다루는 집중 연수입니다.",
    details: ["4일 과정 / 정원 40명", "합주 지도법·편곡 실습", "수료증 발급"],
  },
  {
    name: "청소년 관악 캠프",
    period: "매년 1월 · 8월",
    summary: "방학 기간 중 학생 단원을 대상으로 파트별 클리닉과 합주 훈련을 진행합니다.",
    details: ["3박 4일 합숙", "파트별 전문 강사 클리닉", "수료 연주회 진행"],
  },
  {
    name: "학술 세미나 및 자료 발간",
    period: "수시",
    summary: "관악 교육 현장의 사례를 공유하고 지도 자료집과 연구 결과를 정리해 발간합니다.",
    details: ["연 2회 세미나", "지도 자료집 발간", "자료실 상시 공개"],
  },
  {
    name: "정기총회 및 한국관악상",
    period: "매년 3월",
    summary: "한 해 사업을 의결하고, 관악 발전에 기여한 연주자·지도자에게 한국관악상을 시상합니다.",
    details: ["사업·결산 보고 및 승인", "임원 개선", "한국관악상 시상"],
  },
];

/* ────────────────────────────── 회원 / 단체 ────────────────────────────── */

export const memberTypes = [
  {
    type: "정회원",
    target: "관악 전공자, 연주 단체 단원, 지도교사 등 관악 분야 종사자",
    fee: "연회비 60,000원",
    benefits: ["총회 의결권", "협회 주최 행사 우선 참가", "자료실 전체 이용", "연수 수강료 할인"],
  },
  {
    type: "준회원",
    target: "관악을 전공 중인 학생 및 관악 활동에 관심 있는 일반인",
    fee: "연회비 30,000원",
    benefits: ["협회 주최 행사 참가", "자료실 이용", "연수 수강료 할인"],
  },
  {
    type: "단체회원",
    target: "학교 관악부, 아마추어 밴드, 연주 단체",
    fee: "연회비 200,000원",
    benefits: ["단체 명의 대회 참가", "지도자 연수 단체 신청", "협회 소식지 배송"],
  },
];

/** 가입 신청 화면에 표시할 정회원 혜택 요약. */
export const memberBenefits = [
  "각종 증명서 발급 (정회원 확인서, 관악상 후보 추천서, 연주실적확인서)",
  "협회 주관 음악제 참가 신청 자격 부여",
  "협회 주관 연주회 티켓 구매 시 할인",
  "협회 홈페이지에 회원의 연주회 등 소식 게재·홍보",
  "입력하신 개인정보는 「개인정보보호법」에 따라 보호됩니다.",
];

export const joinSteps = [
  { title: "가입 신청", body: "홈페이지의 가입 신청 양식을 작성해 제출합니다." },
  { title: "서류 확인", body: "사무국이 제출 내용을 확인하고 필요한 경우 연락드립니다." },
  { title: "승인", body: "이사회 승인 절차를 거쳐 회원 자격이 부여됩니다." },
  { title: "회비 납부", body: "안내받은 계좌로 연회비를 납부하면 가입이 완료됩니다." },
];

/** 시·도 지회 및 지부. */
export const branches = [
  { name: "서울지회", region: "서울", head: "○ ○ ○", phone: "02-000-0000" },
  { name: "부산지회", region: "부산", head: "○ ○ ○", phone: "051-000-0000" },
  { name: "대구지회", region: "대구", head: "○ ○ ○", phone: "053-000-0000" },
  { name: "인천지회", region: "인천", head: "○ ○ ○", phone: "032-000-0000" },
  { name: "광주지회", region: "광주", head: "○ ○ ○", phone: "062-000-0000" },
  { name: "대전지회", region: "대전", head: "○ ○ ○", phone: "042-000-0000" },
  { name: "울산지회", region: "울산", head: "○ ○ ○", phone: "052-000-0000" },
  { name: "경기지회", region: "경기", head: "○ ○ ○", phone: "031-000-0000" },
  { name: "강원지회", region: "강원", head: "○ ○ ○", phone: "033-000-0000" },
  { name: "충북지회", region: "충북", head: "○ ○ ○", phone: "043-000-0000" },
  { name: "충남지회", region: "충남", head: "○ ○ ○", phone: "041-000-0000" },
  { name: "전북지회", region: "전북", head: "○ ○ ○", phone: "063-000-0000" },
  { name: "전남지회", region: "전남", head: "○ ○ ○", phone: "061-000-0000" },
  { name: "경북지회", region: "경북", head: "○ ○ ○", phone: "054-000-0000" },
  { name: "경남지회", region: "경남", head: "○ ○ ○", phone: "055-000-0000" },
  { name: "제주지회", region: "제주", head: "○ ○ ○", phone: "064-000-0000" },
];

/** 산하단체. */
export const affiliates = [
  {
    name: "한국관악합주단",
    summary: "협회 직속 전문 연주단체로 정기연주회와 초청 공연을 담당합니다.",
    since: "1990년 창단",
  },
  {
    name: "한국청소년관악단",
    summary: "전국 오디션으로 선발한 중·고등학생 단원이 방학 중 합주와 연주회를 진행합니다.",
    since: "2004년 창단",
  },
  {
    name: "한국관악지도자회",
    summary: "관악부 지도교사와 지휘자의 연구 모임으로 연수와 자료 발간을 담당합니다.",
    since: "2015년 결성",
  },
  {
    name: "대한민국관악작곡위원회",
    summary: "창작 관악곡 위촉과 악보 출판을 담당하며 위촉 초연 무대를 기획합니다.",
    since: "2012년 결성",
  },
  {
    name: "한국관악학회",
    summary: "관악 교육과 연주에 관한 학술 연구를 수행하고 세미나를 주관합니다.",
    since: "2018년 창립",
  },
];

/* ────────────────────────────── 선택 항목 ────────────────────────────── */

export const instruments = [
  "플루트", "오보에", "클라리넷", "바순", "색소폰",
  "트럼펫", "호른", "트롬본", "유포니움", "튜바",
  "타악기", "지휘", "관악합주", "기타",
];

export const regions = [
  "서울", "부산", "대구", "인천", "광주", "대전", "울산", "세종",
  "경기", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주", "해외",
];

export const resourceCategories = ["대회요강", "협회서식", "교육자료", "악보", "회의자료", "기타"];
export const memberStatuses = ["대기", "승인", "보류", "탈퇴"];
