/**
 * 오프라인 회원 명부를 읽어 회원 명단에 합칠 수 있는 모양으로 바꾼다.
 *
 * 받는 것은 이름·구분·연락처 셋뿐이다. 적게 담을수록 안전해서 그렇게 정했다.
 * 생년월일·주소는 받지 않는다.
 */

import { digits } from "./members";

/**
 * 열 이름은 사무국마다 다르게 적는다. 쓸 만한 이름을 모두 받아 준다.
 * 비교할 때 공백과 슬래시를 지우고 소문자로 맞춘다.
 */
const HEADERS = {
  name: ["이름", "성명", "성명단체명", "성명또는단체명", "단체명", "회원명", "name"],
  memberType: ["구분", "회원구분", "회원종류", "종류", "membertype", "type"],
  phone: ["연락처", "전화", "전화번호", "휴대전화", "휴대폰", "핸드폰", "phone", "tel"],
};

/** 열 이름 비교용. "성명 / 단체명" 과 "성명단체명" 을 같게 본다. */
function normalizeHeader(value) {
  return String(value || "")
    .replace(/[\s/()._-]/g, "")
    .toLowerCase();
}

/** 엑셀 첫 줄(머리글)에서 어느 칸이 무엇인지 찾는다. 못 찾으면 null. */
export function mapColumns(headerRow) {
  const found = {};
  headerRow.forEach((cell, index) => {
    const key = normalizeHeader(cell);
    if (!key) return;
    for (const [field, names] of Object.entries(HEADERS)) {
      if (found[field] === undefined && names.includes(key)) found[field] = index;
    }
  });
  return found;
}

/**
 * 엑셀에서 읽은 줄들을 살펴 네 갈래로 나눈다.
 *
 * - rows    담을 수 있는 줄
 * - skipped 이름이 없어 버리는 줄
 * - exists  이미 회원 명단에 있는 분(연락처가 같다)
 * - warn    담기는 하지만 봐 두셔야 하는 줄
 *
 * exists 를 따로 빼는 이유가 있다. 이미 홈페이지로 신청서를 낸 분이 명부에도
 * 있다면, 그분이 바로 「오프라인 회원인데 홈페이지에서 또 가입한」 경우다.
 * 겹쳐서 넣지 않고 사무국이 그 자리에서 보고 처리하도록 따로 보여 준다.
 */
export function readRoster(table, existing, knownTypes = []) {
  const result = { rows: [], skipped: [], exists: [], warn: [] };
  if (!Array.isArray(table) || table.length === 0) return { ...result, error: "빈 파일입니다." };

  const columns = mapColumns(table[0] || []);
  if (columns.name === undefined) {
    return {
      ...result,
      error:
        "첫 줄에서 이름 칸을 찾지 못했습니다. 머리글을 이름·구분·연락처로 적어 주세요.",
    };
  }

  // 이미 있는 사람의 연락처. 탈퇴한 분은 세지 않는다.
  const taken = new Map();
  for (const row of existing) {
    if (row.status === "탈퇴") continue;
    const phone = digits(row.phone);
    if (phone.length >= 9) taken.set(phone, row);
  }

  // 같은 파일 안에서 두 번 나온 번호도 한 번만 담는다.
  const seen = new Set();

  for (let line = 1; line < table.length; line += 1) {
    const cells = table[line] || [];
    const at = (index) => (index === undefined ? "" : String(cells[index] ?? "").trim());

    const name = at(columns.name);
    const memberType = at(columns.memberType);
    const rawPhone = at(columns.phone);
    const phone = digits(rawPhone);

    // 이름이 없으면 줄이 아니다. 빈 줄도 여기서 걸러진다.
    if (!name) {
      if (memberType || rawPhone) result.skipped.push({ line: line + 1, reason: "이름이 없습니다" });
      continue;
    }

    if (phone.length >= 9) {
      const already = taken.get(phone);
      if (already) {
        result.exists.push({ line: line + 1, name, phone: rawPhone, already });
        continue;
      }
      if (seen.has(phone)) {
        result.skipped.push({ line: line + 1, reason: `${name} — 파일 안에 같은 번호가 또 있습니다` });
        continue;
      }
      seen.add(phone);
    } else if (rawPhone) {
      result.warn.push({ line: line + 1, reason: `${name} — 연락처가 번호 같지 않습니다 (${rawPhone})` });
    } else {
      result.warn.push({ line: line + 1, reason: `${name} — 연락처가 비어 있습니다` });
    }

    if (memberType && knownTypes.length > 0 && !knownTypes.includes(memberType)) {
      result.warn.push({ line: line + 1, reason: `${name} — 모르는 구분입니다 (${memberType})` });
    }

    result.rows.push({
      name,
      memberType,
      // 적힌 그대로 담는다. 하이픈을 지우면 사무국이 보던 모양과 달라진다.
      phone: rawPhone,
      // 명부에 있는 분은 이미 회원이다. 그래서 승인 상태로 담고,
      // 입금 확인일은 비운다(언제 냈는지 모르므로 지어내지 않는다).
      status: "승인",
      source: "명부",
    });
  }

  return result;
}
