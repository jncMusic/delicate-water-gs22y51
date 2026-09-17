import { contestHistory, contestSummary } from "../data/site";
import { Container, PageHeader, SectionTitle } from "../components/ui";

/**
 * 대한민국 관악경연대회 연혁.
 *
 * 50회분이라 넓은 화면에서는 표로, 좁은 화면에서는 칸 하나씩 쌓아 보여 준다.
 * 표를 그대로 좁히면 장소 이름이 한 글자씩 끊겨 읽기 어렵다.
 */

function Stat({ label, value, unit, note }) {
  return (
    <div className="px-5 py-4">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 font-serif text-2xl font-bold text-brand-900">
        <span className="tabular-nums">{value}</span>
        {unit && <span className="ml-0.5 text-base font-medium text-slate-500">{unit}</span>}
      </p>
      {note && <p className="mt-0.5 text-xs text-slate-500">{note}</p>}
    </div>
  );
}

export default function ContestHistory() {
  const { total, firstYear, latestYear, biggest } = contestSummary;

  return (
    <>
      <PageHeader subtitle="협회가 주최해 온 대한민국 관악경연대회의 개최 기록입니다." />
      <Container>
        <div className="mb-10 grid gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 sm:grid-cols-3">
          <div className="bg-white">
            <Stat label="개최 횟수" value={total} unit="회" note={`${firstYear}년 ~ ${latestYear}년`} />
          </div>
          <div className="bg-white">
            <Stat
              label="가장 많이 참가한 대회"
              value={parseInt(biggest.entries, 10)}
              unit="개교"
              note={`제${biggest.round}회 (${biggest.date.slice(0, 4)}년)`}
            />
          </div>
          <div className="bg-white">
            <Stat label="첫 대회 참가" value={parseInt(contestHistory[0].entries, 10)} unit="개교" note={`${firstYear}년 서울`} />
          </div>
        </div>

        <SectionTitle>개최 기록</SectionTitle>

        {/* 넓은 화면: 표 */}
        <table className="hidden w-full border-t-2 border-brand-800 text-sm sm:table">
          <caption className="sr-only">대한민국 관악경연대회 제1회부터의 개최 기록</caption>
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th scope="col" className="w-24 py-3 font-medium">회차</th>
              <th scope="col" className="w-44 py-3 font-medium">일시</th>
              <th scope="col" className="py-3 text-left font-medium">장소</th>
              <th scope="col" className="w-28 py-3 font-medium">참가</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {contestHistory.map((row) => (
              <tr key={row.round} className="hover:bg-slate-50">
                <td className="py-3 text-center font-medium text-brand-800">제{row.round}회</td>
                <td className="py-3 text-center tabular-nums text-slate-500">{row.date}</td>
                <td className="py-3 text-slate-700">{row.venue}</td>
                <td className="py-3 text-center tabular-nums text-slate-600">{row.entries}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 좁은 화면: 칸으로 쌓기 */}
        <ul className="divide-y divide-slate-100 border-t-2 border-brand-800 sm:hidden">
          {contestHistory.map((row) => (
            <li key={row.round} className="py-3.5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-medium text-brand-800">제{row.round}회</span>
                <span className="tabular-nums text-xs text-slate-500">{row.date}</span>
              </div>
              <p className="mt-1 text-sm text-slate-700">{row.venue}</p>
              <p className="mt-0.5 text-xs text-slate-500">참가 {row.entries}</p>
            </li>
          ))}
        </ul>

        <p className="mt-6 text-sm leading-relaxed text-slate-500">
          제49회는 참가 단위가 학교가 아닌 팀으로 집계되어 그대로 적었습니다. 제44회(2019년)
          다음 대회는 제45회(2021년)로, 2020년 개최 기록은 협회 자료에 없습니다.
        </p>
      </Container>
    </>
  );
}
