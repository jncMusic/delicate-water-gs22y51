import { branchList, branchSummary, branchTotals, chapterList } from "../data/site";
import { Card, Container, PageHeader, SectionTitle } from "../components/ui";

export default function Branches() {
  return (
    <>
      <PageHeader subtitle="협회는 국내외에 지회와 지부를 두고 있습니다." />
      <Container className="pt-10">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="bg-brand-900 text-white">
            <p className="text-sm text-brand-200">지회</p>
            <p className="mt-1 font-serif text-4xl font-bold">
              {branchTotals.branches}
              <span className="ml-1 text-lg">개</span>
            </p>
            <ul className="mt-5 space-y-2 border-t border-white/15 pt-4 text-sm">
              {branchSummary.map((row) => (
                <li key={row.area} className="flex justify-between">
                  <span className="text-brand-200">{row.area}</span>
                  <span className="font-medium">{row.count}개</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <p className="text-sm text-slate-500">지부</p>
            <p className="mt-1 font-serif text-4xl font-bold text-brand-900">
              {branchTotals.chapters}
              <span className="ml-1 text-lg">개</span>
            </p>
            <p className="mt-5 border-t border-slate-100 pt-4 text-sm leading-relaxed text-slate-600">
              시 단위로 지부를 두고 있습니다. 지회·지부는 국내사업본부와 국제사업본부 아래에서
              지역별 사업을 맡습니다.
            </p>
          </Card>
        </div>

        <div className="mt-14">
          <SectionTitle>지회장</SectionTitle>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] border-t-2 border-brand-800 text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th scope="col" className="py-3 text-left font-medium">지역</th>
                  <th scope="col" className="w-40 py-3 font-medium">지회장</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {branchList.map((branch) => (
                  <tr key={branch.region} className="hover:bg-slate-50">
                    <td className="py-3.5 font-medium text-brand-900">{branch.region}</td>
                    <td className="py-3.5 text-center text-slate-700">
                      {branch.head || <span className="text-slate-400">공석</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            지회 연락처는 협회 사무국으로 문의해 주시기 바랍니다.
          </p>
        </div>

        {chapterList.length > 0 && (
          <div className="mt-14">
            <SectionTitle>지부장</SectionTitle>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] border-t-2 border-brand-800 text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th scope="col" className="py-3 text-left font-medium">지역</th>
                    <th scope="col" className="w-40 py-3 font-medium">지부장</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {chapterList.map((chapter) => (
                    <tr key={chapter.region} className="hover:bg-slate-50">
                      <td className="py-3.5 font-medium text-brand-900">{chapter.region}</td>
                      <td className="py-3.5 text-center text-slate-700">
                        {chapter.head || <span className="text-slate-400">공석</span>}
                        {chapter.note ? (
                          <span className="ml-1.5 text-xs text-slate-500">({chapter.note})</span>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* 협회 집계(7곳)보다 적게 적혀 있으면 그렇다고 알린다. 표만 보고
                지부가 네 곳뿐이라고 읽히지 않게 한다. */}
            {chapterList.length < branchTotals.chapters ? (
              <p className="mt-4 text-xs text-slate-500">
                지부 {branchTotals.chapters}곳 가운데 {chapterList.length}곳을 싣고 있습니다. 나머지는
                확인되는 대로 올리겠습니다.
              </p>
            ) : null}
          </div>
        )}
      </Container>
    </>
  );
}
