/**
 * 검색엔진과 공유 카드가 읽는 표식을 갈아 끼운다.
 *
 * 빌드할 때 만들어 두는 정적 HTML(scripts/prerender.js)은 그때 저장소에 있던
 * 글까지만 다룬다. 그 뒤에 사무국이 올린 글은 제 HTML 파일이 없어서, 서버가
 * 홈 화면 HTML 을 대신 내준다. 그러면 자바스크립트를 돌려 보는 검색엔진이
 * 글 주소에서 홈 화면 제목을 읽게 되므로 여기서 다시 써 준다.
 *
 * post 를 꼭 넘겨야 하는 이유.
 *
 * seoFor(path) 를 글 없이 부르면 제목이 게시판 이름으로 떨어진다. 그러면
 * 공지글 수십 개가 전부 「공지사항 | 한국관악협회」라는 같은 제목을 달고,
 * 검색엔진은 같은 쪽이 여럿이라고 보아 하나만 남기고 버린다. 글을 읽어 온
 * 쪽(Board.js)이 글을 손에 쥔 다음 이 함수를 한 번 더 불러야 한다.
 */
import { seoFor } from "../data/seo";
import { org } from "../data/site";

function set(selector, attr, value) {
  const tag = document.head.querySelector(selector);
  if (tag) tag.setAttribute(attr, value);
}

/** 주소 끝의 빗금을 떼어 prerender 와 같은 모양으로 맞춘다. */
export function tidyPath(path) {
  return path.length > 1 ? path.replace(/\/+$/, "") : path;
}

export function applyMeta(path, post) {
  const clean = tidyPath(path);
  const { title, description } = seoFor(clean, post);

  document.title = title;
  set('meta[name="description"]', "content", description);
  set('meta[property="og:title"]', "content", title);
  set('meta[property="og:description"]', "content", description);

  if (org.siteUrl) {
    const url = `${org.siteUrl}${clean === "/" ? "/" : clean}`;
    set('link[rel="canonical"]', "href", url);
    set('meta[property="og:url"]', "content", url);
  }

  /*
   * 공유 카드 그림. 글에 그림이 있으면 그것을 쓰고, 없으면 index.html 에 적어
   * 둔 협회 기본 그림을 그대로 둔다.
   *
   * 치수(og:image:width/height)는 함께 지운다. 기본 그림은 1200×630 인데
   * 글 그림은 포스터처럼 세로로 긴 것이 많아, 치수를 그대로 두면 카카오톡에
   * 거짓말을 하는 셈이 된다. 비워 두면 받는 쪽이 알아서 잰다.
   */
  const image = post && (post.images?.[0]?.url || post.images?.[0]?.thumb);
  if (image) {
    const abs = /^https?:/.test(image) ? image : `${org.siteUrl || ""}${image}`;
    set('meta[property="og:image"]', "content", abs);
    document.head
      .querySelectorAll('meta[property="og:image:width"], meta[property="og:image:height"]')
      .forEach((tag) => tag.remove());
  }
}
