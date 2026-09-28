/**
 * 글 속의 주소를 눌러 갈 수 있게 만든다.
 *
 * 게시글 본문은 글자만 담는다. 사무국이 적어 넣은 주소도, 자동 수집이 남긴
 * 주소도 그대로 두면 누를 수 없는 긴 글자 줄로만 보인다. 그래서 화면에
 * 그릴 때 주소만 골라 링크로 바꾼다.
 *
 * 본문을 HTML 로 다루지는 않는다. 사람이 적은 글에 태그가 섞여 있어도
 * 글자로만 보이게 하려는 것이다. 여기서는 주소 모양만 찾아 나눈다.
 */

/* 주소 뒤에 흔히 따라오는 문장부호는 주소에서 뺀다. 「…했다(https://a.b).」
   처럼 적은 글에서 닫는 괄호나 마침표까지 주소로 먹지 않게 한다. */
const URL_RE = /https?:\/\/[^\s<>"')\]]+[^\s<>"')\].,;:!?]/g;

/**
 * 글을 [{ text } | { url }] 조각으로 나눈다. 화면이 이것을 받아 그린다.
 * 정규식을 함수 안에서 새로 만드는 이유는, /g 가 lastIndex 를 기억해
 * 여러 번 부르면 결과가 어긋나기 때문이다.
 */
export function splitLinks(text) {
  const source = String(text || "");
  const re = new RegExp(URL_RE.source, "g");
  const parts = [];
  let last = 0;

  for (let m = re.exec(source); m; m = re.exec(source)) {
    if (m.index > last) parts.push({ text: source.slice(last, m.index) });
    parts.push({ url: m[0] });
    last = m.index + m[0].length;
  }
  if (last < source.length) parts.push({ text: source.slice(last) });
  return parts;
}

/**
 * 자동 수집이 예전에 본문 끝에 적어 두던 안내를 걷어낸다.
 *
 * 그때는 「원문 보기: 주소」 와 「출처: 언론사」 를 글자로 적었다. 지금은
 * 주소를 따로 담고 화면이 단추로 걸어 주므로, 옛 글에서는 같은 것이 두 번
 * 보이게 된다. 이미 올라가 있는 글을 고치지 않고 화면에서만 지운다.
 */
export function stripSourceFooter(body) {
  // 글 끝에 붙은 것만 걷는다. 사무국이 본문 가운데 적어 둔 「출처:」 까지
  // 지워 버리면 안 된다.
  return String(body || "")
    .replace(/\s*원문 보기:\s*\S+(?:\s*출처:[^\n]*)?\s*$/, "")
    .trim();
}
