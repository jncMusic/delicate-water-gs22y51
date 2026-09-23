import { executives, org } from "../../data/site";

/**
 * 증명서 서식.
 *
 * 화면에서 보고 그대로 인쇄한다. PDF 라이브러리를 넣지 않는 이유가 있다.
 * 그런 라이브러리로 한글을 찍으려면 글꼴 파일을 통째로 담아야 해서 홈페이지가
 * 수 MB 무거워진다. 브라우저는 그 글꼴을 이미 갖고 있고, 인쇄에서 「PDF 로
 * 저장」을 고르면 같은 결과가 나온다.
 *
 * 크기는 mm 로 잡는다. 화면 픽셀로 잡으면 인쇄했을 때 종이에 안 맞는다.
 *
 * 종이 한 장을 끝까지 쓴다. 가운데 칸을 늘려 붙여, 적을 것이 적은 증명서도
 * 아래가 휑하지 않게 한다.
 */

// 임원 명단은 executives.officers 에 있다. officers 라는 이름으로 내보내지
// 않으므로 여기서 꺼내 쓴다.
const 대표 = (executives.officers || []).find((item) => item.role === "이사장") || {};

const INK = "#1a1d24";
const LINE = "#2b303a";
const 명조 = '"Nanum Myeongjo", "Pretendard Variable", Pretendard, serif';

/**
 * 2026-09-21 → 2026년 9월 21일
 *
 * 글자로 적힌 날짜는 Date 를 거치지 않고 앞 열 자리를 그대로 읽는다.
 * "2014-01-01T00:00:00+09:00" 을 new Date 로 바꾸면 보는 사람의 시간대로
 * 옮겨져, 한국 바깥에서는 2013년 12월 31일로 하루 밀린다. 증명서에 찍히는
 * 가입일이 하루 어긋나면 안 된다.
 */
function korean(value) {
  // new Date(null) 은 1970년 1월 1일이 된다. 비어 있으면 비어 있다고 해야 한다.
  if (!value) return "";

  if (typeof value === "string") {
    const m = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return `${Number(m[1])}년 ${Number(m[2])}월 ${Number(m[3])}일`;
  }
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

function Row({ label, children }) {
  return (
    <tr>
      <th
        scope="row"
        style={{
          width: "36mm",
          padding: "4mm 5mm",
          borderBottom: `0.2mm solid #c9ced6`,
          color: LINE,
          fontWeight: 600,
          letterSpacing: "1.5mm",
          textIndent: "1.5mm",
          textAlign: "center",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </th>
      <td
        style={{
          padding: "4mm 6mm",
          borderBottom: `0.2mm solid #c9ced6`,
          borderLeft: `0.2mm solid #c9ced6`,
          textAlign: "center",
        }}
      >
        {children}
      </td>
    </tr>
  );
}

export default function CertificateSheet({
  request,
  member,
  roles = { branch: null, officer: null },
  docNo,
  issuedAt,
  seal,
}) {
  /*
   * 제목은 글자 수에 따라 크기를 줄인다.
   *
   * 「회원증」 은 세 글자지만 「지회·지부장 확인서」 는 열 글자다. 같은 크기로
   * 찍으면 긴 쪽이 두 줄로 넘치고, 그만큼 아래가 밀려 맨 끝 주소가 테두리
   * 밖으로 잘린다. 한 줄에 들어가는 크기로 맞춘다.
   */
  const 글자수 = request.type.replace(/\s/g, "").length;
  const 제목크기 = 글자수 > 7 ? "8mm" : 글자수 > 5 ? "9.5mm" : "11mm";
  const 제목자간 = 글자수 > 7 ? "3mm" : 글자수 > 5 ? "4mm" : "5mm";

  const teaching = request.type === "지도자 확인서";
  const branchCert = request.type === "지회·지부장 확인서";
  const officerCert = request.type === "이사 경력증명서";

  return (
    <div
      className="cert-sheet"
      style={{
        width: "210mm",
        minHeight: "297mm",
        padding: "14mm",
        background: "#fff",
        color: INK,
        boxSizing: "border-box",
        fontSize: "3.8mm",
        lineHeight: 1.7,
      }}
    >
      {/* 바깥 테두리. 안쪽에 가는 선을 하나 더 둘러 공문서의 격을 만든다. */}
      <div
        style={{
          minHeight: "269mm",
          border: `0.9mm solid ${LINE}`,
          padding: "1.6mm",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            minHeight: "265.8mm",
            border: `0.2mm solid ${LINE}`,
            padding: "12mm 16mm 10mm",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <p style={{ fontSize: "3.2mm", color: "#5e6a7a", letterSpacing: "0.3mm" }}>
            제 {docNo} 호
          </p>

          <div style={{ textAlign: "center", marginTop: "6mm" }}>
            <img
              src={`${process.env.PUBLIC_URL || ""}/logo-kba.svg`}
              alt=""
              /* Tailwind 가 img 를 블록으로 만들어 두어, 부모의 가운데 정렬이
                 듣지 않는다. 여기서 도로 인라인으로 돌린다. */
              style={{
                display: "inline-block",
                width: "26mm",
                height: "16mm",
                objectFit: "contain",
              }}
            />
            <h1
              style={{
                margin: "8mm 0 0",
                fontFamily: 명조,
                fontSize: 제목크기,
                fontWeight: 700,
                letterSpacing: 제목자간,
                textIndent: 제목자간,
                lineHeight: 1.2,
              }}
            >
              {request.type}
            </h1>
            <div
              style={{
                width: "26mm",
                height: "0.6mm",
                margin: "10mm auto 0",
                background: LINE,
              }}
            />
          </div>

          <table
            style={{
              width: "122mm",
              margin: "12mm auto 0",
              borderCollapse: "collapse",
              borderTop: `0.5mm solid ${LINE}`,
              borderBottom: `0.5mm solid ${LINE}`,
            }}
          >
            <tbody>
              <Row label="성 명">{request.name}</Row>
              <Row label="회원 구분">{member.memberType || "-"}</Row>
              <Row label="가 입 일">{korean(member.createdAt) || "-"}</Row>

              {teaching ? (
                <>
                  <Row label="지도 단체">{request.teachingPlace || "-"}</Row>
                  <Row label="지도 기간">{request.teachingPeriod || "-"}</Row>
                  <Row label="직 위">{request.teachingRole || "-"}</Row>
                </>
              ) : null}

              {/* 지회·직위는 신청인이 적은 것이 아니라 협회 명단에서 온 값이다. */}
              {branchCert && roles.branch ? (
                <>
                  <Row label="지회 / 지부">{roles.branch.where}</Row>
                  <Row label="직 위">{roles.branch.role}</Row>
                  <Row label="재임 기간">{request.termPeriod || "-"}</Row>
                </>
              ) : null}

              {officerCert && roles.officer ? (
                <>
                  <Row label="직 위">{roles.officer}</Row>
                  <Row label="재임 기간">{request.termPeriod || "-"}</Row>
                </>
              ) : null}
            </tbody>
          </table>

          {/*
           * 가운데를 늘려 아래 서명 자리를 종이 밑으로 밀어 준다. 줄 수가
           * 적은 회원증도, 줄이 많은 지도자 확인서도 같은 자리에 도장이 찍힌다.
           */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "10mm 0",
            }}
          >
            <p
              style={{
                textAlign: "center",
                fontFamily: 명조,
                fontSize: "4.6mm",
                lineHeight: 2.1,
              }}
            >
              {teaching ? (
                <>
                  위 사람은 본 협회의 회원으로서, 위에 적은 바와 같이
                  <br />
                  관악 지도 활동을 하고 있음을 확인합니다.
                </>
              ) : branchCert ? (
                <>
                  위 사람은 본 협회의 {roles.branch ? roles.branch.where : ""}{" "}
                  {roles.branch ? roles.branch.role : "지회장"}으로
                  <br />
                  재임하고 있음을 확인합니다.
                </>
              ) : officerCert ? (
                <>
                  위 사람은 본 협회의 임원으로 재임하였음을
                  <br />
                  증명합니다.
                </>
              ) : (
                <>위 사람은 본 협회의 회원임을 증명합니다.</>
              )}
            </p>

            {teaching ? (
              <p
                style={{
                  marginTop: "7mm",
                  fontSize: "3.1mm",
                  color: "#5e6a7a",
                  textAlign: "center",
                }}
              >
                ※ 지도 활동에 관한 사항은 신청인이 제출한 내용을 확인한 것입니다.
              </p>
            ) : null}
          </div>

          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "4.2mm", letterSpacing: "0.5mm" }}>{korean(issuedAt)}</p>

            {/* 직인은 대표 이름 위에 겹쳐 찍는다. 종이 공문서가 그렇게 찍는다. */}
            <div
              style={{
                position: "relative",
                display: "inline-block",
                marginTop: "9mm",
              }}
            >
              <p
                style={{
                  fontFamily: 명조,
                  fontSize: "6.5mm",
                  fontWeight: 700,
                  letterSpacing: "1.2mm",
                  whiteSpace: "nowrap",
                }}
              >
                {org.name} 이사장&nbsp;&nbsp;{대표.name || ""}
              </p>
              {seal ? (
                <img
                  src={seal}
                  alt=""
                  style={{
                    position: "absolute",
                    right: "-17mm",
                    top: "-4mm",
                    width: "24mm",
                    height: "24mm",
                    objectFit: "contain",
                    mixBlendMode: "multiply",
                  }}
                />
              ) : (
                <p style={{ marginTop: "3mm", fontSize: "3mm", color: "#b00" }}>
                  (직인이 올라와 있지 않습니다)
                </p>
              )}
            </div>

            <p style={{ marginTop: "11mm", fontSize: "3mm", color: "#5e6a7a" }}>
              {org.address} · {org.phone}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
