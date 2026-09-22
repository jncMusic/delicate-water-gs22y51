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
 */

// 임원 명단은 executives.officers 에 있다. officers 라는 이름으로 내보내지
// 않으므로 여기서 꺼내 쓴다.
const 대표 = (executives.officers || []).find((item) => item.role === "이사장") || {};

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
          width: "32mm",
          padding: "3.5mm 4mm",
          border: "0.3mm solid #333",
          background: "#f4f4f4",
          fontWeight: 600,
          textAlign: "center",
        }}
      >
        {label}
      </th>
      <td style={{ padding: "3.5mm 4mm", border: "0.3mm solid #333" }}>{children}</td>
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
  const teaching = request.type === "지도자 확인서";
  const branchCert = request.type === "지회·지부장 확인서";
  const officerCert = request.type === "이사 경력증명서";

  return (
    <div
      className="cert-sheet"
      style={{
        width: "210mm",
        minHeight: "297mm",
        padding: "25mm 20mm",
        background: "#fff",
        color: "#111",
        boxSizing: "border-box",
        fontSize: "3.6mm",
        lineHeight: 1.7,
      }}
    >
      <p style={{ fontSize: "3.2mm", color: "#555" }}>제 {docNo} 호</p>

      <h1
        style={{
          margin: "14mm 0 12mm",
          textAlign: "center",
          fontSize: "9mm",
          fontWeight: 700,
          letterSpacing: "4mm",
          textIndent: "4mm",
        }}
      >
        {request.type}
      </h1>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
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

      <p style={{ margin: "14mm 0", textAlign: "center", lineHeight: 2 }}>
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
        <p style={{ fontSize: "3.1mm", color: "#666", textAlign: "center" }}>
          ※ 지도 활동에 관한 사항은 신청인이 제출한 내용을 확인한 것입니다.
        </p>
      ) : null}

      <p style={{ margin: "16mm 0 10mm", textAlign: "center", fontSize: "4mm" }}>
        {korean(issuedAt)}
      </p>

      {/* 직인은 대표 이름 위에 겹쳐 찍는다. 종이 공문서가 그렇게 찍는다. */}
      <div style={{ position: "relative", textAlign: "center" }}>
        <p style={{ fontSize: "5.5mm", fontWeight: 700, letterSpacing: "1mm" }}>
          {org.name} 이사장&nbsp;&nbsp;{대표.name || ""}
        </p>
        {seal ? (
          <img
            src={seal}
            alt=""
            style={{
              position: "absolute",
              right: "18mm",
              top: "-6mm",
              width: "22mm",
              height: "22mm",
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

      <p style={{ marginTop: "20mm", textAlign: "center", fontSize: "3mm", color: "#666" }}>
        {org.address} · {org.phone}
      </p>
    </div>
  );
}
