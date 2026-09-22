/**
 * 회원 명단을 사무국이 쓰는 갈래로 나눈다.
 *
 * 관리자 화면 두 곳(회원 관리·문자 문구)이 같은 규칙을 봐야 해서 여기에 모은다.
 * 한쪽에서만 고치면 "미입금 3명" 이라고 띄워 놓고 문자 명단에는 5명이 잡히는
 * 일이 생긴다.
 */

/** 숫자만 남긴다. 010-1234-5678 과 01012345678 을 같은 번호로 보기 위한 것. */
export function digits(value) {
  return String(value || "").replace(/\D/g, "");
}

/**
 * 문자 한 통의 바이트 수.
 *
 * 국내 문자는 EUC-KR 기준으로 센다. 한글·한자는 2바이트, 영문/숫자/기호는
 * 1바이트다. 90바이트까지가 단문(SMS)이고 넘으면 장문(LMS)이 된다.
 * 줄바꿈도 한 글자로 센다.
 */
export function smsBytes(text) {
  let total = 0;
  for (const ch of String(text || "")) {
    total += ch.charCodeAt(0) > 0x7f ? 2 : 1;
  }
  return total;
}

export const SMS_LIMIT = 90;

/** 입금이 확인된 사람인가. 확인일을 적어 두는 것으로 판단한다. */
export function isPaid(row) {
  return Boolean(row && row.paidAt);
}

/**
 * 중복으로 의심되는 줄의 id.
 *
 * 같은 연락처를 쓰거나, 이름과 생년월일이 모두 같으면 한 사람으로 본다.
 * 오프라인으로 이미 가입한 분이 홈페이지에서 다시 신청한 경우를 잡기 위한
 * 것이다. 다만 그 명단이 이 저장소에 들어와 있어야 잡힌다.
 *
 * 탈퇴한 줄은 세지 않는다. 탈퇴 후 다시 가입하는 것은 중복이 아니다.
 */
export function duplicateIds(rows) {
  const buckets = new Map();
  const put = (key, id) => {
    if (!key) return;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(id);
  };

  for (const row of rows) {
    if (row.status === "탈퇴") continue;
    const phone = digits(row.phone);
    // 번호가 너무 짧으면 잘못 적힌 것으로 보고 묶지 않는다.
    if (phone.length >= 9) put(`phone:${phone}`, row.id);
    const name = String(row.name || "").trim();
    if (name && row.birthDate) put(`name:${name}|${row.birthDate}`, row.id);
  }

  const found = new Set();
  for (const ids of buckets.values()) {
    if (ids.length > 1) ids.forEach((id) => found.add(id));
  }
  return found;
}

/**
 * 문자를 보낼 갈래별 명단.
 *
 * - unpaid   신청했지만 입금 확인이 안 된 분. 승인·탈퇴한 분은 뺀다.
 * - done     입금 확인과 승인이 모두 끝난 분.
 * - duplicate 이미 회원인데 다시 신청한 것으로 보이는 분.
 */
export function smsGroups(rows) {
  const dupes = duplicateIds(rows);
  return {
    unpaid: rows.filter(
      (row) => !isPaid(row) && row.status !== "승인" && row.status !== "탈퇴"
    ),
    done: rows.filter((row) => row.status === "승인" && isPaid(row)),
    duplicate: rows.filter((row) => dupes.has(row.id) && row.status !== "탈퇴"),
  };
}

/**
 * 증명서 신청자가 회원 명부에 있는지 본다.
 *
 * 연락처를 열쇠로 삼는다. 이름은 동명이인이 있어 혼자서는 못 믿는다.
 * 번호가 맞으면 이름까지 같은지 함께 본다.
 *
 * 돌려주는 값
 *   found  명부에 있고 승인된 회원 — 발급해도 되는 분
 *   name   번호는 맞는데 이름이 다름 — 사람이 봐야 하는 경우
 *   none   명부에 없음
 */
export function matchMember(request, members) {
  const phone = digits(request && request.phone);
  if (phone.length < 9) return { state: "none", member: null };

  const hit = members.find(
    (row) => digits(row.phone) === phone && row.status !== "탈퇴"
  );
  if (!hit) return { state: "none", member: null };

  const same = String(hit.name || "").trim() === String(request.name || "").trim();
  if (!same) return { state: "name", member: hit };

  // 승인 전이면 아직 회원이 아니다. 발급 대상이 아니라고 알려야 한다.
  return { state: hit.status === "승인" ? "found" : "name", member: hit };
}

/**
 * 이 증명서를 내줘도 되는 분인가.
 *
 * 회원임을 확인하는 것(matchMember)과 발급 자격은 다른 물음이다. 명부에
 * 있어도 회비를 내지 않았으면 지도자 확인서는 나가면 안 된다.
 *
 * 지도자 확인서 — 연회비를 낸 정회원만. 협회가 학교에 내주는 문서라
 * 자격이 흐릿한 채로 나가면 협회가 책임을 진다.
 * 회원증 — 승인된 회원이면 된다. 회원이라는 사실만 적는 문서다.
 */
export function issueCheck(request, member, roles = { branch: null, officer: null }) {
  if (!member || member.status !== "승인") {
    return { ok: false, reason: "승인된 회원이 아닙니다" };
  }

  const type = request && request.type;

  if (type === "지도자 확인서") {
    if (member.memberType !== "정회원") {
      return {
        ok: false,
        reason: `정회원만 받을 수 있습니다 (지금 ${member.memberType || "구분 없음"})`,
      };
    }
    if (!isPaid(member)) return { ok: false, reason: "연회비 납부가 확인되지 않았습니다" };
    return { ok: true, reason: "" };
  }

  if (type === "지회·지부장 확인서") {
    if (!roles.branch) return { ok: false, reason: "지회장·지부장 명단에 없습니다" };
    return { ok: true, reason: "" };
  }

  if (type === "이사 경력증명서") {
    if (!roles.officer) return { ok: false, reason: "임원 명단에 없습니다" };
    return { ok: true, reason: "" };
  }

  // 회원증은 회원이라는 사실만 적는 문서다. 회비도 직위도 보지 않는다.
  return { ok: true, reason: "" };
}

/**
 * 협회 명단에서 이 사람이 맡은 자리를 찾는다.
 *
 * 이름으로 찾는다. 동명이인이 통과할 수 있다는 한계가 있지만, 여기까지 오려면
 * 연락처로 회원 명부에서 본인이 먼저 확인된 상태다. 그 이름과 번호가 함께
 * 맞은 사람만 이 검사를 받으므로 위험이 많이 줄어든다.
 *
 * 그래도 완전하지는 않다. 회원 명부에 직위 칸이 생기면 이름 대신 그것을
 * 보도록 바꾸는 편이 낫다.
 */
export function rolesOf(name, { branches = [], chapters = [], executives = {} } = {}) {
  const who = String(name || "").trim();
  if (!who) return { branch: null, officer: null };

  const branch = branches.find((row) => String(row.head || "").trim() === who);
  const chapter = chapters.find((row) => String(row.head || "").trim() === who);

  // 임원은 세 군데에 나뉘어 있다. 대표·감사 같은 officers, 그리고 이사·전문이사
  // 묶음. 고문·자문위원은 '이사 경력' 이 아니므로 넣지 않는다.
  const titles = [];
  for (const row of executives.officers || []) {
    // "이창남 · 홍정호" 처럼 한 칸에 여럿이 적힌 자리가 있다.
    const names = String(row.name || "")
      .split(/[·,]/)
      .map((n) => n.trim());
    if (names.includes(who)) titles.push(row.role);
  }
  for (const group of executives.groups || []) {
    if (!["이사", "전문이사"].includes(group.name)) continue;
    if ((group.names || []).map((n) => String(n).trim()).includes(who)) titles.push(group.name);
  }

  return {
    branch: branch
      ? { where: branch.region, role: "지회장" }
      : chapter
        ? { where: chapter.region, role: "지부장" }
        : null,
    officer: titles.length ? titles.join(" · ") : null,
  };
}
