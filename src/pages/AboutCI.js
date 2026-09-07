import { Download } from "lucide-react";
import { triggerDownload } from "../lib/download";
import { org } from "../data/site";
import { Card, Container, PageHeader, SectionTitle } from "../components/ui";

const COLORS = [
  { name: "차콜 잉크", hex: "#2B303A", usage: "심볼과 제호에 쓰는 기본 색" },
  { name: "코퍼", hex: "#C2703D", usage: "심볼의 음표와 강조 요소" },
  { name: "딥 잉크", hex: "#1A1D24", usage: "어두운 배경과 푸터" },
];

const RULES = [
  "심볼과 제호의 비율·간격을 임의로 바꾸지 않습니다.",
  "지정된 색 외의 색으로 바꾸어 사용하지 않습니다.",
  "심볼을 회전하거나 기울여 사용하지 않습니다.",
  "배경이 복잡한 이미지 위에는 흰색 여백을 두고 배치합니다.",
  "상업적 이용은 사무국의 사전 승인을 받아야 합니다.",
];

export default function AboutCI() {
  const download = (path, filename) =>
    triggerDownload(`${process.env.PUBLIC_URL || ""}${path}`, filename);

  return (
    <>
      <PageHeader subtitle="협회 상징(CI)의 사용 규정과 원본 파일입니다." />
      <Container className="pt-10">
        <div className="flex flex-col items-center gap-6 rounded-2xl border border-slate-200 bg-slate-50 px-6 py-14">
          <img
            src={`${process.env.PUBLIC_URL || ""}/ci-logo.svg`}
            alt={`${org.fullName} 심볼과 제호`}
            className="w-full max-w-md"
          />
          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => download("/ci-logo.svg", "한국관악협회_CI.svg")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-800"
            >
              <Download size={15} />
              가로형 CI (SVG)
            </button>
            <button
              type="button"
              onClick={() => download("/favicon.svg", "한국관악협회_심볼.svg")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-brand-800 hover:bg-slate-50"
            >
              <Download size={15} />
              심볼 단독 (SVG)
            </button>
          </div>
          <p className="text-xs text-slate-500">
            SVG 는 크기를 키워도 흐려지지 않아 인쇄물과 화면 모두에 쓸 수 있습니다.
          </p>
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-2">
          <div>
            <SectionTitle>지정 색상</SectionTitle>
            <ul className="space-y-3">
              {COLORS.map((color) => (
                <li key={color.hex} className="flex items-center gap-4">
                  <span
                    aria-hidden="true"
                    className="h-12 w-12 shrink-0 rounded-lg border border-slate-200"
                    style={{ backgroundColor: color.hex }}
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-brand-900">
                      {color.name} <span className="font-mono text-xs text-slate-500">{color.hex}</span>
                    </span>
                    <span className="block text-xs text-slate-500">{color.usage}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <SectionTitle>사용 규정</SectionTitle>
            <Card>
              <ol className="space-y-3">
                {RULES.map((rule, index) => (
                  <li key={rule} className="flex gap-3 text-sm text-slate-700">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[11px] font-bold text-brand-700">
                      {index + 1}
                    </span>
                    {rule}
                  </li>
                ))}
              </ol>
            </Card>
          </div>
        </div>
      </Container>
    </>
  );
}
