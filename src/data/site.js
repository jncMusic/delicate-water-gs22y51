/**
 * 홈페이지에 표시되는 고정 문구·조직 정보를 한곳에 모아 둔 파일.
 * 아래 내용은 화면 구성을 보여주기 위한 예시이므로,
 * 협회 실제 정보로 바꿔서 사용하세요.
 */

export const org = {
  name: "한국관악협회",
  fullName: "한국관악협회",
  nameEn: "Korea Band Association",
  abbr: "KBA",
  slogan: "전문 관악인 양성과 국제 음악문화 교류",
  founded: "1973년",
  description:
    "한국관악협회는 한국음악의 발전을 도모하고, 전문 관악인 양성과 국제적인 음악문화 교류를 통해 관악인의 지위 향상과 권익 신장을 목적으로 하는 단체입니다.",
  // 아래 항목은 아직 받지 못했습니다. 사무국 정보로 채워 주세요.
  address: "서울특별시 ○○구 ○○로 00, 0층 (우 00000)",
  phone: "02-000-0000",
  fax: "02-000-0001",
  email: "office@example.or.kr",
  hours: "평일 09:00 - 18:00 (점심 12:00 - 13:00 / 주말·공휴일 휴무)",
  bank: "○○은행 000-000000-00-000 (예금주: 한국관악협회)",
  registration: "고유번호 000-00-00000",
};
export const menus = [
  {
    label: "협회소개",
    children: [
      { label: "한국관악협회 소개", path: "/about/overview" },
      { label: "이사장 인사말", path: "/about/intro" },
      { label: "협회 연혁", path: "/about/history" },
      { label: "역대 회장", path: "/about/chairs" },
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
      { label: "회원단체", path: "/members/affiliates" },
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
  // 이사장님 인사말 전문을 받으면 이 문단들을 교체해 주세요.
  signature: "한국관악협회 이사장  김 동 수",
  paragraphs: [
    "한국관악협회 홈페이지를 찾아주셔서 감사합니다.",
    "협회는 1973년에 창설되었습니다. 한국음악의 발전을 도모하고, 전문 관악인을 양성하며, 국제적인 음악문화 교류를 통해 관악인의 지위 향상과 권익 신장을 목적으로 활동해 왔습니다.",
    "현재 국내외 17개 지회와 7개 지부를 두고 있으며, 학교단체와 군악단체, 일반단체가 회원단체로 참여하고 있습니다. 국내사업본부와 국제사업본부를 통해 경연대회와 관악제, 클리닉, 시상 사업을 운영합니다.",
    "협회가 하는 일과 참여 방법은 이 홈페이지에서 확인하실 수 있습니다. 문의 사항은 사무국으로 연락해 주시기 바랍니다.",
  ],
};
export const overview = {
  purpose:
    "한국음악의 발전을 도모하고 전문 관악인 양성과 국제적인 음악문화 교류를 통한 관악인의 지위 향상과 권익 신장을 목적으로 한다.",
  facts: [
    { label: "명칭", value: "한국관악협회 (Korea Band Association, KBA)" },
    { label: "창설", value: "1973년" },
    { label: "지회", value: "총 17개 (서울 2 · 광역시 6 · 특별자치시 2 · 도 6 · 해외 1)" },
    { label: "지부", value: "시 단위 7개" },
    { label: "회원단체", value: "학교단체 · 군악단체 · 일반단체" },
    { label: "사업본부", value: "국내사업본부 · 국제사업본부" },
  ],
  activities: [
    "대한민국관악경연대회를 비롯한 전국 규모 경연 주최",
    "대한민국 관악제와 협회 콩쿠르 등 연주 무대 운영",
    "윈드앙상블 클리닉을 통한 지도 역량 강화",
    "대한민국 관악상 시상으로 관악인의 공로 예우",
    "국제적인 음악문화 교류와 관악인의 권익 신장",
  ],
  // 향후 계획
  plan: "향후 48개국 국제사업본부를 신설하여 운영할 계획입니다.",
};
export const missions = [
  { title: "경연대회", body: "대한민국관악경연대회, 관악독주경연대회, 색소폰경연대회, 창작관악콘테스트를 주최합니다." },
  { title: "연주 사업", body: "대한민국 관악제와 한국관악협회 콩쿠르를 운영합니다." },
  { title: "교육", body: "윈드앙상블 클리닉으로 합주 지도와 앙상블 운영을 다룹니다." },
  { title: "시상·교류", body: "대한민국 관악상을 시상하고, 국제 음악문화 교류를 진행합니다." },
];
export const history = [
  {
    period: "2020년대",
    items: [
      { year: "2024", text: "제11대 김동수 회장 취임" },
      { year: "2019", text: "제10대 박병학 회장 취임" },
    ],
  },
  {
    period: "2010년대",
    items: [
      { year: "2014", text: "제9대 배일환 회장 취임" },
    ],
  },
  {
    period: "1970-2000년대",
    items: [
      { year: "1999", text: "제8대 노덕일 회장 취임" },
      { year: "1973", text: "한국관악협회 창설" },
    ],
  },
];
/** 역대 회장(현 대표 직함은 이사장). 재임 기간이 비어 있는 대수는 확인 후 채워 주세요. */
export const pastChairs = [
  { order: "제11대", name: "김동수", term: "2024 - 현재", current: true },
  { order: "제10대", name: "박병학", term: "2019 - 2023" },
  { order: "제9대", name: "배일환", term: "2014 - 2018" },
  { order: "제8대", name: "노덕일", term: "1999 - 2013" },
  { order: "제7대", name: "이은옥", term: "" },
  { order: "제6대", name: "김대식", term: "" },
  { order: "제5대", name: "김완기", term: "" },
  { order: "제4대", name: "박종완", term: "" },
  { order: "제3대", name: "남궁요열", term: "" },
  { order: "제2대", name: "이교숙", term: "" },
  { order: "제1대", name: "이재옥", term: "" },
];
/** 임원 소개. 회장 외의 명단은 받는 대로 채워 주세요. */
export const executives = [
  {
    group: "이사장",
    people: [{ role: "이사장", name: "김동수", affiliation: "제11대 (2024 - 현재)" }],
  },
  {
    group: "부이사장",
    people: [{ role: "부이사장", name: "○ ○ ○", affiliation: "명단 확인 필요" }],
  },
  {
    group: "이사",
    people: [{ role: "이사", name: "○ ○ ○", affiliation: "명단 확인 필요" }],
  },
  {
    group: "감사",
    people: [{ role: "감사", name: "○ ○ ○", affiliation: "명단 확인 필요" }],
  },
];
export const organization = {
  top: { role: "이사장", name: "김동수" },
  second: [
    { role: "부이사장", name: "명단 확인 필요" },
    { role: "이사회", name: "명단 확인 필요" },
    { role: "감사", name: "명단 확인 필요" },
  ],
  office: { role: "사무국", name: "협회 운영 전반" },
  departments: [
    { name: "국내사업본부", duties: ["국내 경연·연주 사업", "지회·지부 지원", "회원단체 관리"] },
    { name: "국제사업본부", duties: ["국제 음악문화 교류", "해외 지회 운영", "48개국 국제사업본부 신설 준비"] },
    { name: "지회 (17개)", duties: ["서울 2 · 광역시 6", "특별자치시 2 · 도 6", "해외 1"] },
    { name: "지부 (7개)", duties: ["시 단위 지부 운영"] },
    { name: "회원단체", duties: ["학교단체", "군악단체", "일반단체"] },
  ],
};
export const bylaws = [
  {
    chapter: "제1장 총칙",
    articles: [
      { no: "제1조 (명칭)", text: "본회는 한국관악협회(이하 “본회”라 한다)라 칭한다." },
      {
        no: "제2조 (목적)",
        text: "본회는 관악 음악의 보급과 발전을 도모하고, 회원 상호 간의 친목과 연구 활동을 통하여 국민 음악 문화 향상에 이바지함을 목적으로 한다.",
      },
      { no: "제3조 (사무소)", text: "본회의 사무소는 서울특별시에 두며, 국내외에 지회 및 지부를 둔다." },
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
      { no: "제8조 (임원의 구성)", text: "본회에 이사장 1인, 부이사장 약간 인, 이사 및 감사를 둔다." },
      { no: "제9조 (임기)", text: "임원의 임기는 3년으로 하며 연임할 수 있다." },
    ],
  },
];

export const bylawsNote =
  "위 조문은 홈페이지 구성 예시입니다. 실제 정관 전문은 자료실에서 내려받으실 수 있습니다.";

/* ────────────────────────────── 협회 행사 ────────────────────────────── */

/**
 * 협회 주요 사업. 사업별 시기·대상·요강은 받는 대로 period 와 details 를 채워 주세요.
 * 비어 있으면 화면에 표시되지 않습니다.
 */
export const programs = [
  { name: "대한민국관악경연대회", period: "", summary: "협회를 대표하는 전국 규모 관악 경연대회입니다.", details: [] },
  { name: "한국관악협회 콩쿠르", period: "", summary: "관악 연주자를 대상으로 하는 협회 주최 콩쿠르입니다.", details: [] },
  { name: "대한민국 관악제", period: "", summary: "관악 음악을 한자리에서 선보이는 협회의 대표 무대입니다.", details: [] },
  { name: "윈드앙상블 클리닉", period: "", summary: "합주 지도와 앙상블 운영을 다루는 현장 중심 클리닉입니다.", details: [] },
  { name: "대한민국 관악상", period: "", summary: "관악 발전에 기여한 연주자와 지도자를 예우하는 시상 사업입니다.", details: [] },
  { name: "대한민국 관악독주경연대회", period: "", summary: "독주 부문을 별도로 겨루는 경연대회입니다.", details: [] },
  { name: "대한민국 색소폰경연대회", period: "", summary: "색소폰 부문 전문 경연대회입니다.", details: [] },
  { name: "대한민국 창작관악콘테스트", period: "", summary: "창작 관악곡을 발굴하고 무대에 올리는 콘테스트입니다.", details: [] },
];
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
/**
 * 지회 구성. 협회는 총 17개 지회와 7개 지부를 두고 있습니다.
 * 지회별 이름·지회장·연락처를 받는 대로 branchList 를 채워 주세요.
 */
export const branchSummary = [
  { area: "서울", count: 2 },
  { area: "광역시", count: 6 },
  { area: "특별자치시", count: 2 },
  { area: "도", count: 6 },
  { area: "해외", count: 1 },
];

export const branchTotals = { branches: 17, chapters: 7 };

/** 지회별 상세. 명단을 받으면 여기에 넣어 주세요. */
export const branchList = [];
/**
 * 회원단체. 협회는 학교·군악·일반 단체를 회원단체로 두고 있습니다.
 * 단체별 명단을 받는 대로 groups 를 채워 주세요.
 */
export const affiliateTypes = [
  {
    name: "학교단체",
    summary: "초·중·고등학교와 대학의 관악부·관악단이 단체 회원으로 참여합니다.",
    groups: [],
  },
  {
    name: "군악단체",
    summary: "각 군의 군악대가 단체 회원으로 참여합니다.",
    groups: [],
  },
  {
    name: "일반단체",
    summary: "시립·직장·동호회 관악단 등 일반 연주 단체가 단체 회원으로 참여합니다.",
    groups: [],
  },
];
export const feeGuide = {
  period: "회비는 매년 1월부터 3월 사이에 납부합니다. 연중 가입하신 경우 가입 승인 후 1개월 이내에 납부해 주세요.",
  notes: [
    "입금자명은 신청하신 성함(단체는 단체명)으로 해 주셔야 확인이 가능합니다.",
    "성함과 입금자명이 다른 경우 사무국으로 미리 알려 주세요.",
    "회비 납부 영수증이 필요하시면 사무국으로 요청하시면 발급해 드립니다.",
    "회비를 2년 이상 납부하지 않으면 정관에 따라 회원 자격이 정지될 수 있습니다.",
  ],
};

/** 회원에게 발급하는 증명서 종류와 절차. */
export const certificates = [
  { name: "회원 확인서", use: "재직·경력 증빙, 각종 지원사업 신청" },
  { name: "연주 실적 확인서", use: "협회 주최 공연·대회 참가 실적 증빙" },
  { name: "연수 수료증", use: "지도자 연수 과정 이수 증빙" },
  { name: "지도자 경력 확인서", use: "학교·단체 지도 경력 증빙" },
];

export const certificateProcess = [
  "사무국으로 전화 또는 이메일로 필요한 증명서와 용도를 알려 주세요.",
  "회원 자격과 회비 납부 여부를 확인합니다.",
  "확인 후 3일(근무일 기준) 이내에 이메일 또는 우편으로 보내 드립니다.",
];

/** 회원 가입·자격에 관해 자주 묻는 내용. */
export const memberFaq = [
  {
    q: "관악을 전공하지 않았는데 가입할 수 있나요?",
    a: "가능합니다. 관악 활동에 관심 있는 일반인은 준회원으로 가입하실 수 있고, 학교나 동호회 관악부에서 활동 중이시라면 단체회원으로 함께 가입하시는 방법도 있습니다.",
  },
  {
    q: "신청하면 바로 회원이 되나요?",
    a: "신청 내용을 사무국이 확인한 뒤 이사회 승인 절차를 거칩니다. 승인 결과는 기재해 주신 연락처로 안내드리며, 이후 회비를 납부하시면 가입이 완료됩니다.",
  },
  {
    q: "학생인데 회비 할인이 있나요?",
    a: "재학 중인 학생은 준회원으로 가입하시면 정회원보다 낮은 연회비가 적용됩니다. 단체로 가입하는 학교 관악부는 단체회원 회비로 단원 전체가 혜택을 받으실 수 있습니다.",
  },
  {
    q: "소속이나 연락처가 바뀌었습니다.",
    a: "사무국으로 알려 주시면 회원 정보를 수정해 드립니다. 연락처가 바뀐 채로 두면 행사 안내와 회비 납부 안내를 받지 못하실 수 있습니다.",
  },
  {
    q: "단체회원으로 가입하면 단원 개인도 회원이 되나요?",
    a: "단체회원은 단체 명의의 자격입니다. 단원 개인이 총회 의결권이나 개인 명의 증명서가 필요하시면 별도로 정회원 또는 준회원 가입을 하셔야 합니다.",
  },
  {
    q: "탈퇴하려면 어떻게 해야 하나요?",
    a: "사무국으로 탈퇴 의사를 알려 주시면 처리해 드립니다. 이미 납부하신 당해 연도 회비는 반환되지 않습니다.",
  },
];

/** 오시는 길 교통 안내. 실제 위치에 맞게 고쳐 주세요. */
export const directions = [
  {
    type: "지하철",
    items: [
      "○○선 ○○역 0번 출구에서 도보 5분",
      "○○선 ○○역 0번 출구에서 도보 10분",
    ],
  },
  {
    type: "버스",
    items: [
      "간선 000, 000 — ○○사거리 정류장 하차",
      "지선 0000 — ○○빌딩 앞 정류장 하차",
    ],
  },
  {
    type: "자가용",
    items: [
      "건물 지하 주차장 이용 (사무국 방문 시 2시간 무료)",
      "주차 공간이 넉넉하지 않으니 대중교통 이용을 권해 드립니다.",
    ],
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
