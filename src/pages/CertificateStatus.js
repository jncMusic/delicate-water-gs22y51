import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Clock, Download } from "lucide-react";
import { Link } from "../lib/router";
import { readDoc } from "../lib/store";
import { downloadFromUrl } from "../lib/download";
import { memberSideMenu, org } from "../data/site";
import { Loading, SidebarPage } from "../components/ui";

/**
 * 신청한 분이 자기 증명서를 확인하고 내려받는 화면.
 *
 * 로그인이 없다. 접수할 때 받은 주소(문서 id 가 들어 있다)를 아는 사람만
 * 열 수 있다. 보안 규칙도 이 한 건을 읽는 것만 열어 두었고, 목록은 막혀 있어
 * 남의 신청서를 훑을 수 없다.
 */
export default function CertificateStatus({ id }) {
  const [state, setState] = useState({ loading: true, row: null });
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const row = await readDoc("certificateRequests", id);
        if (alive) setState({ loading: false, row });
      } catch (err) {
        console.error(err);
        if (alive) setState({ loading: false, row: null });
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  if (state.loading) {
    return (
      <SidebarPage menu={memberSideMenu} title="증명서 발급" subtitle="신청하신 내용을 확인합니다.">
        <Loading label="신청 내용을 불러오는 중입니다..." />
      </SidebarPage>
    );
  }

  const row = state.row;

  return (
    <SidebarPage menu={memberSideMenu} title="증명서 발급" subtitle="신청하신 내용을 확인합니다.">
      <div className="mx-auto max-w-xl">
        {!row ? (
          <div className="text-center">
            <AlertCircle size={48} className="mx-auto text-slate-300" />
            <h2 className="mt-5 font-serif text-xl font-bold text-brand-900">
              신청 내용을 찾을 수 없습니다
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              주소가 잘못되었거나 신청이 취소되었을 수 있습니다. 사무국으로 문의해 주세요.
            </p>
          </div>
        ) : (
          <>
            <div className="text-center">
              {row.fileUrl ? (
                <CheckCircle2 size={48} className="mx-auto text-emerald-500" />
              ) : row.status === "반려" ? (
                <AlertCircle size={48} className="mx-auto text-rose-400" />
              ) : (
                <Clock size={48} className="mx-auto text-amber-400" />
              )}
              <h2 className="mt-5 font-serif text-xl font-bold text-brand-900">
                {row.fileUrl
                  ? "증명서가 발급되었습니다"
                  : row.status === "반려"
                    ? "발급이 어렵습니다"
                    : "확인하고 있습니다"}
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                {row.fileUrl
                  ? "아래에서 내려받으실 수 있습니다. 이 주소는 나중에 다시 여셔도 됩니다."
                  : row.status === "반려"
                    ? "발급 조건에 맞지 않아 처리하지 못했습니다. 자세한 사항은 사무국으로 문의해 주세요."
                    : "사무국이 회원 명부와 대조하고 있습니다. 확인이 끝나면 이 화면에서 내려받으실 수 있습니다."}
              </p>
            </div>

            <dl className="mt-7 divide-y divide-slate-100 border-y border-slate-100 text-sm">
              <div className="flex gap-4 py-3">
                <dt className="w-24 shrink-0 text-slate-500">증명서</dt>
                <dd className="font-medium text-brand-900">{row.type}</dd>
              </div>
              <div className="flex gap-4 py-3">
                <dt className="w-24 shrink-0 text-slate-500">신청인</dt>
                <dd className="text-slate-700">{row.name}</dd>
              </div>
              {row.docNo ? (
                <div className="flex gap-4 py-3">
                  <dt className="w-24 shrink-0 text-slate-500">문서번호</dt>
                  <dd className="text-slate-700">제 {row.docNo} 호</dd>
                </div>
              ) : null}
            </dl>

            {row.fileUrl ? (
              <>
                <button
                  type="button"
                  onClick={async () => {
                    const saved = await downloadFromUrl(
                      row.fileUrl,
                      `${org.name}_${row.type}_${row.name}.png`
                    );
                    setOpened(!saved);
                  }}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-brand-700 py-3.5 text-sm font-medium text-white hover:bg-brand-800"
                >
                  <Download size={17} />
                  증명서 내려받기
                </button>
                {opened ? (
                  <p className="mt-3 text-center text-xs leading-relaxed text-slate-500">
                    새 창에 증명서를 열었습니다. 그림을 길게 누르거나 오른쪽 단추를 눌러 저장해
                    주세요.
                  </p>
                ) : null}
              </>
            ) : null}

            <p className="mt-6 text-center text-sm text-slate-500">
              문의 {org.phone}
              {org.email ? ` · ${org.email}` : ""}
            </p>
          </>
        )}

        <div className="mt-8 flex justify-center gap-2">
          <Link
            to="/"
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-brand-800 hover:bg-slate-50"
          >
            홈으로
          </Link>
          <Link
            to="/members/certificate"
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-brand-800 hover:bg-slate-50"
          >
            새로 신청하기
          </Link>
        </div>
      </div>
    </SidebarPage>
  );
}
