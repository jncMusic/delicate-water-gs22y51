import { Link } from "../lib/router";
import { branchList, branchSummary, branchTotals, executives, organization } from "../data/site";
import { Card, Container, PageHeader, SectionTitle } from "../components/ui";

/**
 * 조직도.
 *
 * 줄기(spine)를 세로로 내리고, 감사만 옆으로 뺀 뒤, 맨 아래에서 두 칸으로
 * 갈라진다. 칸에는 직책만 넣는다 — 이름은 「임원 소개」에 있다.
 *
 * 줄은 모두 같은 회색 실선이고, 갈라지는 자리에만 점을 찍어 눈이 따라가기
 * 쉽게 했다.
 */

const LINE = "bg-slate-300";

function Box({ label, tone = "light" }) {
  const styles = {
    dark: "bg-brand-900 text-white border-brand-900",
    mid: "bg-brand-500 text-white border-brand-500",
    light: "bg-white text-brand-900 border-slate-300",
    accent: "bg-accent-500 text-brand-950 border-accent-500",
  }[tone];
  return (
    <div className={`w-full rounded-lg border px-4 py-3 text-center shadow-sm ${styles}`}>
      <span className="text-sm font-bold">{label}</span>
    </div>
  );
}

/** 갈라지는 자리에 찍는 점. */
function Joint() {
  return (
    <span
      aria-hidden="true"
      className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-accent-500 bg-white"
    />
  );
}

/** 줄기를 따라 내려오는 세로줄. joint 를 켜면 가운데에 점이 찍힌다. */
function Stem({ joint = false }) {
  return (
    <div className="relative h-10">
      <span aria-hidden="true" className={`absolute left-1/2 h-full w-0.5 -translate-x-1/2 ${LINE}`} />
      {joint && <Joint />}
    </div>
  );
}

function Chart({ chart }) {
  const { spine, aside, leaves } = chart;

  return (
    /* 좁은 화면에서는 감사 칸이 밖으로 밀린다. 모양을 무너뜨리는 대신
       옆으로 밀어 볼 수 있게 두는 편이 조직도로서 읽기 낫다. */
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 px-5 py-12">
      <div className="mx-auto grid min-w-[30rem] max-w-3xl grid-cols-[1fr_11rem_1fr] justify-items-center gap-y-0">
        {spine.map((role, index) => {
          const branching = aside && aside.after === role;
          return (
            <div key={role} className="col-span-3 grid w-full grid-cols-[1fr_11rem_1fr] justify-items-center">
              {/* 직책 칸 */}
              <span />
              <Box label={role} tone={index === 0 ? "dark" : index === spine.length - 1 ? "mid" : "light"} />
              <span />

              {/* 아래로 내려가는 줄. 마지막 칸 뒤는 갈래 줄이 대신한다. */}
              {index < spine.length - 1 && (
                <>
                  <span />
                  <div className="w-full">
                    <Stem joint={branching} />
                  </div>
                  {branching ? (
                    // 감사는 줄기 옆으로 빠진다. 가로줄이 점에서 칸까지 이어진다.
                    <div className="flex w-full items-center self-center pr-2">
                      <span aria-hidden="true" className={`h-0.5 flex-1 ${LINE}`} />
                      <div className="w-24 shrink-0 sm:w-32">
                        <Box label={aside.label} />
                      </div>
                    </div>
                  ) : (
                    <span />
                  )}
                </>
              )}
            </div>
          );
        })}

        {/* 맨 아래 갈래 */}
        <div className="col-span-3 w-full max-w-md">
          <div className="relative h-12">
            <span aria-hidden="true" className={`absolute left-1/2 top-0 h-1/2 w-0.5 -translate-x-1/2 ${LINE}`} />
            <Joint />
            <span aria-hidden="true" className={`absolute left-1/4 right-1/4 top-1/2 h-0.5 ${LINE}`} />
            <span aria-hidden="true" className={`absolute left-1/4 top-1/2 h-1/2 w-0.5 -translate-x-1/2 ${LINE}`} />
            <span aria-hidden="true" className={`absolute right-1/4 top-1/2 h-1/2 w-0.5 translate-x-1/2 ${LINE}`} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {leaves.map((leaf) => (
              <Box key={leaf} label={leaf} tone="accent" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const specialists =
  executives.groups.find((group) => group.name === "전문이사")?.names || [];

export default function AboutOrganization() {
  return (
    <>
      <PageHeader subtitle="협회의 의사결정 구조와 부서별 담당 업무입니다." />
      <Container>
        <SectionTitle>조직 구성</SectionTitle>

        <Chart chart={organization.chart} />

        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          사무국 구성 — {organization.office}. 임원 명단은{" "}
          <Link to="/about/executives" className="text-brand-700 underline hover:text-brand-800">
            임원 소개
          </Link>
          에서 보실 수 있습니다.
        </p>

        <div className="mt-16">
          <SectionTitle>사업본부</SectionTitle>
          <div className="grid gap-5 sm:grid-cols-2">
            {organization.divisions.map((division) => (
              <Card key={division.name}>
                <h3 className="font-serif text-lg font-bold text-brand-900">{division.name}</h3>
                <ul className="mt-3 space-y-1.5">
                  {division.duties.map((duty) => (
                    <li key={duty} className="flex gap-2 text-sm text-slate-600">
                      <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent-500" />
                      {duty}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>

        <div className="mt-16">
          <SectionTitle description="지회는 시·도 단위로, 지부는 시 단위로 둡니다. 지회·지부는 국내사업본부와 국제사업본부 아래에서 지역 사업을 맡습니다.">
            지회 · 지부
          </SectionTitle>

          <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
            <span className="font-serif text-lg font-bold text-brand-900">
              지회 <span className="tabular-nums text-accent-600">{branchTotals.branches}</span>개
            </span>
            <span aria-hidden="true" className="hidden h-4 w-px bg-slate-300 sm:block" />
            <span className="font-serif text-lg font-bold text-brand-900">
              지부 <span className="tabular-nums text-accent-600">{branchTotals.chapters}</span>개
            </span>
            <span aria-hidden="true" className="hidden h-4 w-px bg-slate-300 sm:block" />
            <span className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
              {branchSummary.map((row) => (
                <span key={row.area}>
                  {row.area} <strong className="text-slate-700">{row.count}</strong>
                </span>
              ))}
            </span>
          </div>

          <ul className="grid gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-3">
            {branchList.map((branch) => (
              <li key={branch.region} className="flex items-baseline gap-3 bg-white px-5 py-3.5">
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-brand-900">
                  {branch.region}
                </span>
                <span className="shrink-0 text-sm text-slate-500">
                  {branch.head || "공석"}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-16">
          <SectionTitle description={`협회는 전문이사 ${specialists.length}인을 두고 있습니다.`}>
            전문이사
          </SectionTitle>
          <ul className="flex flex-wrap gap-2">
            {specialists.map((name) => (
              <li
                key={name}
                className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-700"
              >
                {name}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </>
  );
}
