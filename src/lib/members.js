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
