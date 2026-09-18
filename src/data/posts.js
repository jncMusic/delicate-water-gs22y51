/**
 * 홈페이지와 함께 배포하는 기본 게시물.
 *
 * 사무국이 관리자 화면에서 올리는 글은 Firestore 에 쌓이고, 여기 있는 글은
 * 저장소에 함께 들어 있다가 목록에 섞여 나온다. 협회가 이미 치른 행사의
 * 포스터처럼 내용이 바뀌지 않고, 홈페이지를 처음 열었을 때부터 보여야 하는
 * 자료를 여기에 둔다. 관리자 화면에서는 '기본 제공' 으로 표시하고 수정·삭제를
 * 막는다. 내용을 바꾸려면 이 파일을 고쳐 다시 배포해야 한다.
 *
 * 포스터 원본은 public/posters/ 에 있다. 파일명 끝이 -thumb 인 쪽이 목록용이다.
 */

const poster = (slug) => ({
  url: `/posters/${slug}.jpg`,
  thumb: `/posters/${slug}-thumb.jpg`,
});

/** 게시판 이름 -> 기본 게시물 목록. */
export const builtinPosts = {
  notices: [
    {
      id: "kba-2026-concours-4",
      builtin: true,
      title: "제4회 한국관악협회 콩쿠르",
      category: "행사",
      author: "사무국",
      pinned: false,
      closed: true,
      createdAt: "2026-06-25T09:00:00+09:00",
      images: [
        {
          ...poster("2026-kba-concours-4"),
          name: "제4회 한국관악협회 콩쿠르 포스터.jpg",
          alt: "제4회 한국관악협회 콩쿠르 포스터",
        },
      ],
      body:
        "제4회 한국관악협회 콩쿠르를 아래와 같이 개최합니다.\n\n" +
        "· 일시: 2026년 9월 6일(일) 오전 9시\n" +
        "· 장소: 코스모스아트홀(서초동)\n" +
        "· 주최: 한국관악협회\n" +
        "· 후원: (주)코스모스악기\n\n" +
        "[참가 부문]\n" +
        "플루트, 오보에, 클라리넷, 바순, 색소폰, 트럼펫, 트롬본, 호른, 유포늄, 튜바, " +
        "마림바, 리코더, 오카리나, 드럼세트, 색소폰 아마추어 전형\n\n" +
        "[참가 대상]\n" +
        "초·중·고·대학·일반부·시니어부(전 연령)\n\n" +
        "[참가비]\n" +
        "15만원(1인 기준)\n" +
        "신한은행 140-014-592880 (예금주: 한국관악협회)\n\n" +
        "[참가 접수]\n" +
        "2026년 6월 25일(목) ~ 8월 30일(일)\n\n" +
        "[시상 내역]\n" +
        "· 전체대상: 뮤즈 윈드 오케스트라 협연\n" +
        "· 각 부문 1~3등: 한국관악협회 상장 수여\n\n" +
        "[신청·문의]\n" +
        "인터넷 접수(blog.naver.com/kbaoffice)\n" +
        "010-4028-9803\n" +
        "KBA 공식 블로그 페이지에서 링크 확인 후 구글 폼으로 접수해 주십시오.",
    },
    {
      id: "kba-2026-busan-winds-festival",
      builtin: true,
      title: "2026 부산 관악 대축제",
      category: "행사",
      author: "사무국",
      pinned: false,
      closed: true,
      createdAt: "2026-07-15T09:00:00+09:00",
      images: [
        {
          ...poster("2026-busan-winds-festival"),
          name: "2026 부산 관악 대축제 포스터.jpg",
          alt: "2026 부산 관악 대축제 포스터",
        },
      ],
      body:
        "2026 부산 관악 대축제(BUSAN WINDS FESTIVAL)를 아래와 같이 개최합니다.\n\n" +
        "· 일시: 2026년 8월 12일(수) ~ 16일(일) (8월 15일 제외)\n" +
        "· 장소: 부산문화회관 챔버홀(8/12), 부산문화회관 중극장(8/13·14), 부산시민회관 대극장(8/16)\n" +
        "· 사회: 김은지\n\n" +
        "[공연 일정]\n" +
        "· 8월 12일(수) 오전 10시 — 개막식, 부산 브라스 퀸텟\n" +
        "· 8월 13일(목) 오전 10시 — 제50회 대한민국 관악경연대회\n" +
        "· 8월 14일(금) 오후 7시 30분 — BIBA윈드오케스트라, 부산 색소폰 오케스트라\n" +
        "· 8월 16일(일) 오후 7시 30분 — 부산 시민 윈드 오케스트라, 코리안 윈드 오케스트라\n\n" +
        "[주최·후원]\n" +
        "· 주최: 한국관악협회\n" +
        "· 후원: 부산광역시, 교육부, 부산광역시교육청\n" +
        "· 협찬: (주)코스모스악기\n\n" +
        "[관람 안내]\n" +
        "입장권은 전석 초대입니다.\n" +
        "문의: 한국관악협회 blog.naver.com/kbaoffice",
    },
  ],
};

/** 자료실의 기본 자료. */
export const builtinResources = [
  {
    id: "kba-2025-busan-winds-festival",
    builtin: true,
    title: "2025 부산 관악 대축제 포스터",
    category: "홍보물",
    uploader: "사무국",
    createdAt: "2025-09-15T09:00:00+09:00",
    thumb: "/posters/2025-busan-winds-festival-thumb.jpg",
    description:
      "2025년 9월 30일(화)~10월 2일(목) 부산 콘서트홀에서 연 2025 부산 관악 대축제 포스터입니다. " +
      "사회는 김은지 님이 맡았고, 부산 BBA 윈드 오케스트라·부산 연합 색소폰 오케스트라·미8군 브라스밴드·" +
      "부산 시민 윈드 오케스트라·부산예문학생윈드 오케스트라·뮤즈 윈드 오케스트라가 무대에 올랐습니다. " +
      "주최 한국관악협회, 후원 부산광역시.",
    file: {
      name: "2025 부산 관악 대축제 포스터.jpg",
      size: 268086,
      type: "image/jpeg",
      url: "/posters/2025-busan-winds-festival.jpg",
      path: null,
    },
  },
];

/**
 * 미리 그리기(scripts/prerender.js)가 저장소에서 읽어 온 글을 여기에 넣는다.
 * 브라우저에서는 늘 비어 있다.
 *
 * 왜 이런 자리가 필요한가. 화면을 미리 그릴 때는 효과(useEffect)가 돌지 않아서
 * useCollection 의 구독이 한 번도 불리지 않는다. 처음 값에 들어 있는 것만
 * 그려진다. 그래서 저장소에서 읽어 온 글도 처음 값에 함께 넣어 준다.
 */
const prerenderRows = {};

/** 미리 그리기에서만 부른다. { 게시판이름: [글] } */
export function seedPrerender(rows) {
  Object.assign(prerenderRows, rows);
}

/** 게시판·자료실 목록에 섞어 넣을 기본 게시물을 꺼낸다. */
export function builtinRows(collection) {
  if (collection === "resources") return builtinResources;

  const mine = builtinPosts[collection] || [];
  const seeded = prerenderRows[collection];
  if (!seeded) return mine;

  // 같은 id 가 저장소에도 있으면 저장소 쪽을 남긴다. store.js 의 withBuiltin 과
  // 같은 규칙이라, 미리 그린 쪽과 사람이 보는 쪽이 어긋나지 않는다.
  const taken = new Set(seeded.map((row) => row.id));
  return [...seeded, ...mine.filter((row) => !taken.has(row.id))];
}

const builtinIds = new Set(
  [...Object.values(builtinPosts).flat(), ...builtinResources].map((row) => row.id)
);

/** 저장소에 없고 홈페이지에 함께 들어 있는 글인지. 조회수 증가 등을 건너뛸 때 쓴다. */
export const isBuiltinId = (id) => builtinIds.has(id);
